import * as React from "react";
import { getFixedWidth, QueryTableBlock } from "./queryTable";
import { Row, Expr, IdExpr, PromiseExprEvaluator } from "mwater-expressions";
import { QueryOptions } from "../../../database/Database";
import * as _ from "lodash";
import { localize } from "../../localization";
import { InstanceCtx, getFilteredContextVarValues } from "../../../contexts";
import { BlockDef, createExprVariables, createExprVariableValues } from "../../blocks";

interface Props {
  block: QueryTableBlock
  instanceCtx: InstanceCtx
}

interface State {
  rows?: Row[]
  refreshing: boolean
  error?: Error

  /** Which column is being ordered on, if any */
  columnOrderIndex: number | null

  /** Ordering of column. Default to asc */
  columnOrderDir: "asc" | "desc"

  /** Limit. Use this rather than limit of block def as Show more... may extend it */
  limit: number | null

  /** True if more rows are available (for soft limits) */
  moreRowsAvail: boolean
}

/** Instance of a query table */
export default class QueryTableBlockInstance extends React.Component<Props, State> {
  /** Current query options to determine if refresh needed */
  queryOptions?: QueryOptions 

  constructor(props: Props) {
    super(props)

    // First column with initial ordering sets the initial ordering
    let columnOrderIndex: number | null = null
    let columnOrderDir: "asc" | "desc" = "asc"

    const blockDef = this.props.block.blockDef
    for (let colIndex = 0 ; colIndex < blockDef.contents.length ; colIndex++) {
      if (blockDef.columnInfos && blockDef.columnInfos[colIndex] && blockDef.columnInfos[colIndex]!.orderExpr && blockDef.columnInfos[colIndex]!.initialOrderDir) {
        columnOrderIndex = colIndex
        columnOrderDir = blockDef.columnInfos[colIndex]!.initialOrderDir!
      }
    }
    
    this.state = { 
      refreshing: false,
      columnOrderIndex,
      columnOrderDir,
      limit: props.block.blockDef.limit,
      moreRowsAvail: false
    }
  }

  componentDidMount() {
    this.props.instanceCtx.database.addChangeListener(this.handleChange)
    this.performQuery()
  }

  componentDidUpdate(prevProps: Props) {
    // Redo query if changed
    const newQueryOptions = this.createQuery()
    if (!_.isEqual(newQueryOptions, this.queryOptions) || !_.isEqual(this.props.instanceCtx.contextVarValues, prevProps.instanceCtx.contextVarValues)) {
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

  handleShowMore = () => {
    this.setState({ limit: this.state.limit! + this.props.block.blockDef.limit! })
  }

  createQuery(): QueryOptions {
    const rips = this.props.instanceCtx
    const block = this.props.block

    // Get expressions
    const rowsetCV = rips.contextVars.find(cv => cv.id === block.blockDef.rowsetContextVarId)!
    const rowExprs = block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx)
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

    let queryOptions: QueryOptions = {
      select: {},
      from: rowsetCV.table!,
      where: where.exprs.length > 0 ? where : null,
      orderBy: [],
      // Add extra row to see if more available
      limit: this.state.limit != null ? this.state.limit + 1 : null
    }

    // Add column ordering if present
    if (this.state.columnOrderIndex != null) {
      queryOptions.orderBy!.push({ expr: block.blockDef.columnInfos![this.state.columnOrderIndex]!.orderExpr, dir: this.state.columnOrderDir })
    }
    
    // Add order by
    if (block.blockDef.orderBy) {
      queryOptions.orderBy = queryOptions.orderBy!.concat(block.blockDef.orderBy)
    }

    // Stabilize sort order if in singleRow mode
    if (block.blockDef.mode === "singleRow") {
      queryOptions.orderBy!.push({ expr: { type: "id", table: rowsetCV.table! }, dir: "asc" })
    }

    // Add expressions
    if (block.blockDef.mode === "singleRow") {
      queryOptions.select.id = { type: "id", table: rowsetCV.table! }
    }
    rowExprs.forEach((expr, index) => {
      queryOptions.select["e" + index] = expr
    })

    // Add count to ensure that query is aggregate
    if (block.blockDef.mode == "multiRow") {
      queryOptions.select["cnt"] = { type: "op", table: rowsetCV.table!, op: "count", exprs: [] }
    }

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

    this.props.instanceCtx.database.query(queryOptions, this.props.instanceCtx.contextVars, getFilteredContextVarValues(this.props.instanceCtx)).then(rows => {
      // Check if still relevant
      if (_.isEqual(queryOptions, this.createQuery())) {
        // Take limit of rows
        const limitedRows = this.state.limit != null ? _.take(rows, this.state.limit) : rows
        this.setState({ 
          rows: limitedRows, 
          refreshing: false, 
          // If soft limit and more available, show that
          moreRowsAvail: (this.props.block.blockDef.limitType || "soft") == "soft" && rows.length > limitedRows.length 
        })
      }
    }).catch(error => {
      this.setState({ error: error })
    })
  }

  createRowInstanceCtx(rowIndex: number): InstanceCtx {
    const rips = this.props.instanceCtx

    // Row context variable
    const rowsetCV = this.props.instanceCtx.contextVars.find(cv => cv.id === this.props.block.blockDef.rowsetContextVarId)!
    const rowcv = this.props.block.createRowContextVar(rowsetCV!)

    // TODO move out of here to be faster
    const rowExprs = this.props.block.getRowExprs(this.props.instanceCtx.contextVars, this.props.instanceCtx)

    const innerContextVars = rips.contextVars.concat(rowcv)

    // Row context variable value
    const cvvalue = this.props.block.getRowContextVarValue(this.state.rows![rowIndex], rowExprs, 
      this.props.instanceCtx.schema, 
      rowsetCV, 
      innerContextVars,
      getFilteredContextVarValues(this.props.instanceCtx)[rowsetCV.id]
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
        const exprIndex = rowExprs.findIndex(rowExpr => _.isEqual(expr, rowExpr))
        return this.state.rows![rowIndex]["e" + exprIndex]
      },
      getFilters: (cvid) => {
        // If this creates a rowset, it has no filters as it can't be filtered
        if (cvid == rowcv.id) {
          return []
        }
        return rips.getFilters(cvid)
      },
      setFilter: (cvid, filter) => {
        // Can't set filter for rowset
        if (cvid == rowcv.id) {
          throw new Error("Can't set filter for query table rowset")
        }
        rips.setFilter(cvid, filter)
      }
    }
  }

  renderRow(row: Row, rowIndex: number) {
    const rowRIProps = this.createRowInstanceCtx(rowIndex)

    const handleRowClick = () => {
      // Run action
      if (this.props.block.blockDef.rowClickAction) {
        const actionDef = this.props.block.blockDef.rowClickAction
        const action = this.props.instanceCtx.actionLibrary.createAction(actionDef)

        action.performAction({ ...rowRIProps })
      }
    }

    // Use row id if possible, otherwise just the index
    const rowKey = this.props.block.blockDef.mode == "singleRow" ? row.id : rowIndex

    // Show pointer if works on click
    const rowStyle: React.CSSProperties = {}
    if (this.props.block.blockDef.rowClickAction) {
      rowStyle.cursor = "pointer"
    }

    const getColumnVerticalAlign = (colIndex: number) => {
      const columnInfos = this.props.block.blockDef.columnInfos
      return columnInfos && columnInfos[colIndex] ? columnInfos[colIndex]!.verticalAlign || "top" : "top"
    }

    return (
      <tr key={rowKey} style={rowStyle}>
        { this.props.block.blockDef.contents.map((b, colIndex) => {
          return (
            <td key={colIndex} onClick={handleRowClick} style={{ verticalAlign: getColumnVerticalAlign(colIndex) }}>
              {rowRIProps.renderChildBlock(rowRIProps, b)}
            </td>
          )
        })}
     </tr>
    )
  }

  renderRows() {
    if (this.state.error) {
      // TODO localize
      return (
        <tr key="error">
          <td key="error" colSpan={this.props.block.blockDef.contents.length}>
            <div className="alert alert-danger">Error loading data</div>
          </td>
        </tr>)
    }

    if (!this.state.rows) {
      return (
        <tr key="spin">
          <td key="spin" colSpan={this.props.block.blockDef.contents.length}>
            <i className="fa fa-spinner fa-spin"/>
          </td>
        </tr>)
    }

    if (this.state.rows.length === 0 && this.props.block.blockDef.noRowsMessage) {
      return (
        <tr key="norows">
          <td key="norows" colSpan={this.props.block.blockDef.contents.length} style={{ fontStyle: "italic" }}>
            {localize(this.props.block.blockDef.noRowsMessage, this.props.instanceCtx.locale)}
          </td>
        </tr>
      )
    }

    return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex))
  }

  /** Render one header of the table */
  renderHeader(header: BlockDef | null, index: number) {
    const riProps = this.props.instanceCtx
    const blockDef = this.props.block.blockDef

    const renderOrder = () => {
      if (!blockDef.columnInfos || !blockDef.columnInfos[index] || !blockDef.columnInfos[index]!.orderExpr) {
        return null
      }

      const handleOrderClick = () => {
        // Get current order
        const currentOrder = this.state.columnOrderIndex == index ? this.state.columnOrderDir : null

        if (currentOrder == "asc") {
          this.setState({ columnOrderDir: "desc" })
        }
        else if (currentOrder == "desc") {
          this.setState({ columnOrderIndex: null })
        }
        else { 
          this.setState({ columnOrderDir: "asc", columnOrderIndex: index })
        }
      }

      // If not sorted 
      if (this.state.columnOrderIndex != index) {
        return <div key="order" style={{ float: "right", color: "#CCC", cursor: "pointer" }} onClick={handleOrderClick}>
          <i className="fa fa-sort fa-fw"/>
        </div>
      }

      return <div key="order" style={{ float: "right", cursor: "pointer" }} onClick={handleOrderClick}>
        { this.state.columnOrderDir == "asc" ? <i className="fa fa-sort-asc fa-fw"/> : <i className="fa fa-sort-desc fa-fw"/> }
      </div>
    }
    
    return <th key={index}>
      { renderOrder() }      
      {riProps.renderChildBlock(riProps, header)}
    </th>
  }

  /** Render the show more rows at bottom */
  renderShowMore() {
    if (!this.state.moreRowsAvail) {
      return null
    }

    return <tr key="showMore">
      <td colSpan={this.props.block.blockDef.contents.length}>
        <a style={{ cursor: "pointer" }} onClick={this.handleShowMore}>{this.props.instanceCtx.T("Show more...")}</a>
      </td>
    </tr>
  }

  render() {
    const blockDef = this.props.block.blockDef

    const divStyle: React.CSSProperties = {}

    const tableStyle: React.CSSProperties = {
      marginTop: 5,
    }

    if (getFixedWidth(this.props.block.blockDef)) {
      tableStyle.width = getFixedWidth(this.props.block.blockDef)!
      divStyle.overflowX = "auto"
    }

    // Fade if refreshing
    if (this.state.refreshing) {
      tableStyle.opacity = 0.6
    }

    let className = "table"
    switch (blockDef.borders || "horizontal") {
      case "all":
        className += " table-bordered"
        break
      case "none":
        className += " table-borderless"
        break
    }

    switch (blockDef.padding || "normal") {
      case "compact":
        className += " table-condensed"
        break
    }

    // Put hover if an action connected
    if (blockDef.rowClickAction) {
      className += " table-hover"
    }

    if (blockDef.striped) {
      className += " table-striped"
    }

    return (
      <div style={divStyle}>
        <table className={className} style={tableStyle}>
          <colgroup>
            {blockDef.contents.map((b, colIndex) => {
              // Determine width
              const columnInfos = blockDef.columnInfos
              const width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex]!.columnWidth || "auto" : "auto"
              return <col key={colIndex} style={{ width: width }}/>
            })}
          </colgroup>
          { !blockDef.hideHeaders ? 
          <thead>
            <tr key="header">
              { blockDef.headers.map((b, index) => this.renderHeader(b, index)) }
            </tr>
          </thead>
          : null }
          <tbody>
            {this.renderRows()}
            {this.renderShowMore()}
          </tbody>
          { blockDef.footers ?
          <tfoot>
            <tr>
              { blockDef.footers.map((b, index) => <td key={index}>{this.props.instanceCtx.renderChildBlock(this.props.instanceCtx, b)}</td>)}
            </tr>
          </tfoot>
          : null}
        </table>
      </div>
    )  
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
