import * as React from "react";
import { QueryRepeatBlock } from "./queryRepeat";
import { RenderInstanceProps } from "../../blocks";
import { Row, Expr } from "mwater-expressions";
import { QueryOptions } from "../../../database/Database";
import * as _ from "lodash";
import { localize } from "../../localization";

interface Props {
  block: QueryRepeatBlock
  renderInstanceProps: RenderInstanceProps
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
    this.props.renderInstanceProps.database.addChangeListener(this.handleChange)
    this.performQuery()
  }

  componentDidUpdate(prevProps: Props) {
    // Redo query if changed
    const newQueryOptions = this.createQuery()
    if (!_.isEqual(newQueryOptions, this.queryOptions)) {
      this.performQuery()
    }
  }

  componentWillUnmount() {
    this.props.renderInstanceProps.database.removeChangeListener(this.handleChange)
  }

  /** Change listener to refresh database */
  handleChange = () => {
    this.performQuery()
  }

  createQuery(): QueryOptions {
    const rips = this.props.renderInstanceProps
    const block = this.props.block

    // Get expressions
    const rowsetCV = rips.contextVars.find(cv => cv.id === block.blockDef.rowsetContextVarId)!
    const rowExprs = block.getRowExprs(this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary)
    const rowsetCVValue = rips.contextVarValues[rowsetCV.id]

    // Create where
    const where: Expr = {
      type: "op",
      op: "and",
      table: rowsetCV.table!,
      exprs: _.compact([rowsetCVValue].concat(_.map(rips.getFilters(rowsetCV.id), f => f.expr)))
    }

    // Add own where
    if (block.blockDef.where) {
      where.exprs.push(block.blockDef.where)
    }

    const queryOptions: QueryOptions = {
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

    return queryOptions
  }

  performQuery() {
    const queryOptions = this.createQuery()
    this.queryOptions = queryOptions

    // Mark as refreshing
    this.setState({ refreshing: true })

    this.props.renderInstanceProps.database.query(queryOptions, this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.contextVarValues).then(rows => {
      // Check if still relevant
      if (_.isEqual(queryOptions, this.createQuery())) {
        this.setState({ rows, refreshing: false })
      }
    }).catch(error => {
      this.setState({ error: error })
    })
  }

  createRowRenderInstanceProps(rowIndex: number): RenderInstanceProps {
    const rips = this.props.renderInstanceProps

    // Row context variable
    const rowsetCV = this.props.renderInstanceProps.contextVars.find(cv => cv.id === this.props.block.blockDef.rowsetContextVarId)!
    const rowcv = this.props.block.createRowContextVar(rowsetCV!)

    // TODO move out of here to be faster
    const rowExprs = this.props.block.getRowExprs(this.props.renderInstanceProps.contextVars, this.props.renderInstanceProps.widgetLibrary, this.props.renderInstanceProps.actionLibrary)

    const innerContextVars = rips.contextVars.concat(rowcv)

    // Row context variable value
    const cvvalue = this.props.block.getRowContextVarValue(this.state.rows![rowIndex], rowExprs, this.props.renderInstanceProps.schema, rowsetCV, innerContextVars)

    return {
      ...rips, 
      contextVars: innerContextVars,
      contextVarValues: { ...rips.contextVarValues, [rowcv.id]: cvvalue },
      getContextVarExprValue: (cvid, expr) => {
        if (cvid !== rowcv.id) {
          return rips.getContextVarExprValue(cvid, expr)
        }
        // Look up expression
        const exprIndex = rowExprs.findIndex(rowExpr => _.isEqual(expr, rowExpr))
        return this.state.rows![rowIndex]["e" + exprIndex]
      }
    }
  }

  renderSeparator() {
    switch (this.props.block.blockDef.separator) {
      case "none":
        return null
      case "page_break":
        return <div className="page-break"/>
      case "solid_line":
        return <hr/>
    }
  }

  renderRow(row: Row, rowIndex: number) {
    const rowRIProps = this.createRowRenderInstanceProps(rowIndex)

    return (
      <div key={row.id}>
        { rowIndex > 0 ? this.renderSeparator() : null }
        {rowRIProps.renderChildBlock(rowRIProps, this.props.block.blockDef.content)}
      </div>
    )
  }

  renderRows() {
    if (this.state.error) {
      // TODO localize
      return <div className="alert alert-danger">Error loading data</div>
    }

    if (!this.state.rows) {
      return <i className="fa fa-spinner fa-spin"/>
    }

    if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
      return <div style={{ fontStyle: "italic" }}>
        {localize(this.props.block.blockDef.noRowsMessage, this.props.renderInstanceProps.locale)}
      </div>
    }

    return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex))
  }

  render() {
    const riProps = this.props.renderInstanceProps

    const style: React.CSSProperties = {
      marginTop: 5
    }

    // Fade if refreshing
    if (this.state.refreshing) {
      style.opacity = 0.6
    }

    return (
      <div>
        {this.renderRows()}
      </div>
    )  
  }
}