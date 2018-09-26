import * as React from "react";
import { QueryTableBlockDef, QueryTableBlock } from "./queryTable";
import { RenderInstanceProps, ContextVar } from "../../blocks";
import { Row, Expr } from "mwater-expressions";
import { QueryOptions } from "../../../Database";
import * as _ from "lodash";

interface Props {
  block: QueryTableBlock
  renderInstanceProps: RenderInstanceProps
}

interface State {
  rows?: Row[]
  refreshing: boolean
}

// TODO handle db refresh
export default class QueryTableBlockInstance extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = { refreshing: false }
  }

  componentDidMount() {
    this.performQuery()
  }

  performQuery() {
    this.setState({ refreshing: true })
    const rips = this.props.renderInstanceProps
    const block = this.props.block

    // Get expressions
    const rowsetCV = rips.contextVars.find(cv => cv.id === block.blockDef.rowset)!
    const rowExprs = block.getRowExprs(this.props.renderInstanceProps.contextVars)
    const rowsetCVValue = rips.getContextVarValue(rowsetCV.id)

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
      where: where,
      limit: block.blockDef.limit
    }

    // Add expressions
    if (block.blockDef.mode === "singleRow") {
      queryOptions.select.id = { type: "id", table: rowsetCV.table! }
    }
    rowExprs.forEach((expr, index) => {
      queryOptions.select["e" + index] = expr
    })

    rips.database.query(queryOptions).then(rows => {
      this.setState({ rows, refreshing: false })
    }).catch(error => {
      // TODO handle errors
    })
  }

  createRowRenderInstanceProps(rowIndex: number): RenderInstanceProps {
    const rips = this.props.renderInstanceProps

    // Row context variable
    const rowsetCV = this.props.renderInstanceProps.contextVars.find(cv => cv.id === this.props.block.blockDef.rowset)!
    const rowcv = this.props.block.createRowContextVar(rowsetCV!)

    // TODO move out of here to be faster
    const rowExprs = this.props.block.getRowExprs(this.props.renderInstanceProps.contextVars)

    // Row context variable value
    const cvvalue = this.props.block.getRowContextVarValue(this.state.rows![rowIndex], rowExprs, this.props.renderInstanceProps.schema, rowsetCV)

    return {
      ...rips, 
      contextVars: rips.contextVars.concat(rowcv),
      getContextVarValue: (cvid) => cvid === rowcv.id ? cvvalue : rips.getContextVarValue(cvid),
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

  renderRow(row: Row, rowIndex: number) {
    const rowRIProps = this.createRowRenderInstanceProps(rowIndex)

    const handleRowClick = () => {
      // Run action
      if (this.props.block.blockDef.rowClickAction) {
        const actionDef = this.props.block.blockDef.rowClickAction
        const action = this.props.renderInstanceProps.actionLibrary.createAction(actionDef)

        action.performAction({
          contextVars: rowRIProps.contextVars,
          database: rowRIProps.database,
          locale: rowRIProps.locale,
          getContextVarValue: rowRIProps.getContextVarValue,
          pageStack: rowRIProps.pageStack
        })
      }
      const rowsetCV = this.props.renderInstanceProps.contextVars.find(cv => cv.id === this.props.block.blockDef.rowset)!
      const rowExprs = this.props.block.getRowExprs(this.props.renderInstanceProps.contextVars)

      // Row context variable value
      const cvvalue = this.props.block.getRowContextVarValue(this.state.rows![rowIndex], rowExprs, this.props.renderInstanceProps.schema, rowsetCV)


    }

    return (
      <tr>
        { this.props.block.blockDef.contents.map((b, colIndex) => {
          return (
            <td key={colIndex} onClick={handleRowClick}>
              {rowRIProps.renderChildBlock(rowRIProps, b)}
            </td>
          )
        })}
     </tr>
    )
  }

  renderRows() {
    if (!this.state.rows) {
      return (
        <tr>
          <th colSpan={this.props.block.blockDef.contents.length}>
            <i className="fa fa-spinner fa-spin"/>
          </th>
        </tr>)
    }

    return this.state.rows.map((row, rowIndex) => this.renderRow(row, rowIndex))
  }

  render() {
    const riProps = this.props.renderInstanceProps

    // TODO fade when refreshing

    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            { this.props.block.blockDef.headers.map((b, index) => {
              return <th key={index}>{riProps.renderChildBlock(riProps, b)}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {this.renderRows()}
        </tbody>
      </table>
    )  
  }
}