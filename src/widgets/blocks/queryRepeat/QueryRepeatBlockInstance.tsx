import * as React from "react"
import { QueryRepeatBlock } from "./queryRepeat"
import { Row, Expr, IdExpr, PromiseExprEvaluator } from "mwater-expressions"
import { QueryOptions } from "../../../database/Database"
import _ from "lodash"
import { localize } from "../../localization"
import { InstanceCtx, getFilteredContextVarValues } from "../../../contexts"
import { createExprVariables, createExprVariableValues } from "../../blocks"

interface Props {
  block: QueryRepeatBlock
  instanceCtx: InstanceCtx
}

interface State {
  rows?: Row[]
  refreshing: boolean
  error?: Error
}

/** Instance of a query table */
export default class QueryRepeatBlockInstance extends React.Component<Props, State> {
  /** Current query options to determine if refresh needed */
  queryOptions?: QueryOptions

  constructor(props: Props) {
    super(props)

    this.state = { refreshing: false }
  }

  componentDidMount() {
    this.props.instanceCtx.database.addChangeListener(this.handleChange)
    this.performQuery()
  }

  componentDidUpdate(prevProps: Props) {
    // Redo query if changed
    const newQueryOptions = this.createQuery()
    if (
      !_.isEqual(newQueryOptions, this.queryOptions) ||
      !_.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)
    ) {
      this.performQuery()
    }
  }

  componentWillUnmount() {
    this.props.instanceCtx.database.removeChangeListener(this.handleChange)
  }

  /** Change listener to refresh database */
  handleChange = () => {
    this.performQuery()
  }

  createQuery(): QueryOptions {
    const rips = this.props.instanceCtx
    const block = this.props.block

    // Get expressions
    const rowsetCV = rips.contextVars.find((cv) => cv.id === block.blockDef.rowsetContextVarId)!
    const rowExprs = block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx)
    const rowsetCVValue = rips.contextVarValues[rowsetCV.id]

    // Create where
    const where: Expr = {
      type: "op",
      op: "and",
      table: rowsetCV.table!,
      exprs: _.compact([rowsetCVValue].concat(_.map(rips.getFilters(rowsetCV.id), (f) => f.expr)))
    }

    // Add own where
    if (block.blockDef.where) {
      where.exprs.push(block.blockDef.where)
    }

    let queryOptions: QueryOptions = {
      select: {},
      from: rowsetCV.table!,
      where: where.exprs.length > 0 ? where : null,
      orderBy: [],
      limit: block.blockDef.limit
    }

    // Add order by
    if (block.blockDef.orderBy) {
      queryOptions.orderBy = queryOptions.orderBy!.concat(block.blockDef.orderBy)
    }

    // Stabilize sort order
    queryOptions.orderBy!.push({ expr: { type: "id", table: rowsetCV.table! }, dir: "asc" })

    // Add expressions
    queryOptions.select.id = { type: "id", table: rowsetCV.table! }
    rowExprs.forEach((expr, index) => {
      queryOptions.select["e" + index] = expr
    })

    // The context variable that represents the row has a value which changes with each row
    // so replace it with { type: "id" ...} expression so that it evaluates as the row id
    queryOptions = mapObject(queryOptions, (input) => {
      if (input && input.type == "variable" && input.variableId == this.props.block.getRowContextVarId()) {
        return { type: "id", table: queryOptions.from } as IdExpr
      }
      return input
    })

    return queryOptions
  }

  performQuery() {
    const queryOptions = this.createQuery()
    this.queryOptions = queryOptions

    // Mark as refreshing
    this.setState({ refreshing: true })

    this.props.instanceCtx.database
      .query(queryOptions, this.props.instanceCtx.contextVars, getFilteredContextVarValues(this.props.instanceCtx))
      .then((rows) => {
        // Check if still relevant
        if (_.isEqual(queryOptions, this.createQuery())) {
          this.setState({ rows, refreshing: false })
        }
      })
      .catch((error) => {
        this.setState({ error: error })
      })
  }

  createRowInstanceCtx(rowIndex: number): InstanceCtx {
    const rips = this.props.instanceCtx

    // Row context variable
    const rowsetCV = this.props.instanceCtx.contextVars.find(
      (cv) => cv.id === this.props.block.blockDef.rowsetContextVarId
    )!
    const rowcv = this.props.block.createRowContextVar(rowsetCV!)

    // TODO move out of here to be faster
    const rowExprs = this.props.block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx)

    const innerContextVars = rips.contextVars.concat(rowcv)

    // Row context variable value
    const cvvalue = this.props.block.getRowContextVarValue(
      this.state.rows![rowIndex],
      rowExprs,
      this.props.instanceCtx.schema,
      rowsetCV,
      innerContextVars
    )

    const innerContextVarValues = { ...rips.contextVarValues, [rowcv.id]: cvvalue }
    return {
      ...rips,
      contextVars: innerContextVars,
      contextVarValues: innerContextVarValues,
      getContextVarExprValue: (cvid, expr) => {
        // Null expression has null value
        if (!expr) {
          return null
        }

        // If no context variable, evaluate expression
        if (cvid == null) {
          return new PromiseExprEvaluator({
            schema: rips.schema,
            locale: rips.locale,
            variables: createExprVariables(innerContextVars),
            variableValues: createExprVariableValues(innerContextVars, innerContextVarValues)
          }).evaluateSync(expr)
        }

        if (cvid !== rowcv.id) {
          return rips.getContextVarExprValue(cvid, expr)
        }
        // Look up expression
        const exprIndex = rowExprs.findIndex((rowExpr) => _.isEqual(expr, rowExpr))
        return this.state.rows![rowIndex]["e" + exprIndex]
      }
    }
  }

  renderSeparator() {
    switch (this.props.block.blockDef.separator) {
      case "none":
        return null
      case "page_break":
        return <div className="page-break" />
      case "solid_line":
        return <hr />
    }
  }

  renderRow(row: Row, rowIndex: number) {
    const orientation = this.props.block.blockDef.orientation || "vertical"
    const horizontalSpacing =
      this.props.block.blockDef.horizontalSpacing != null ? this.props.block.blockDef.horizontalSpacing : 5

    const rowRIProps = this.createRowInstanceCtx(rowIndex)

    if (orientation == "vertical") {
      return (
        <div key={row.id}>
          {rowIndex > 0 ? this.renderSeparator() : null}
          {rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)}
        </div>
      )
    } else {
      return (
        <div
          key={row.id}
          style={{ display: "inline-block", verticalAlign: "top", marginLeft: rowIndex > 0 ? horizontalSpacing : 0 }}
        >
          {rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)}
        </div>
      )
    }
  }

  renderRows() {
    if (this.state.error) {
      // TODO localize
      return <div className="alert alert-danger">Error loading data: {this.state.error.message}</div>
    }

    if (!this.state.rows) {
      return (
        <div style={{ textAlign: "center", fontSize: 20 }}>
          <i className="fa fa-spinner fa-spin" />
        </div>
      )
    }

    if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
      return (
        <div style={{ fontStyle: "italic" }}>
          {localize(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale)}
        </div>
      )
    }

    return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex))
  }

  render() {
    const riProps = this.props.instanceCtx

    const style: React.CSSProperties = {
      marginTop: 5
    }

    // Fade if refreshing
    if (this.state.refreshing) {
      style.opacity = 0.6
    }

    return <div>{this.renderRows()}</div>
  }
}

/** Replace every part of an object, including array members
 * replacer should return input to leave unchanged
 */
const mapObject = (obj: any, replacer: (input: any) => any): any => {
  obj = replacer(obj)
  if (!obj) {
    return obj
  }
  if (_.isArray(obj)) {
    return _.map(obj, (item) => mapObject(item, replacer))
  }
  if (_.isObject(obj)) {
    return _.mapValues(obj, (item) => mapObject(item, replacer))
  }
  return obj
}
