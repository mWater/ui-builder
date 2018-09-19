import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, BlockStore } from '../blocks'
import * as _ from 'lodash'
import { Expr } from 'mwater-expressions';
import { Row } from '../../Database';

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"
  /** Determines if one table row contains one or multiple database table rows */
  mode: "singleRow" | "multiRow"  
  headers: Array<BlockDef | null>
  contents: Array<BlockDef | null>
  rowset: string
  limit: number
  where: Expr | null
  // order?
}

export class QueryTableBlock extends CompoundBlock<QueryTableBlockDef> {
  getChildBlockDefs(): BlockDef[] {
    return _.compact(this.blockDef.headers.concat(this.blockDef.contents))
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.headers = draft.headers.map(b => action(b))
      draft.contents = draft.contents.map(b => action(b))
    })
  }

  renderDesign(props: RenderDesignProps) {
    const setHeader = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.headers[index] = blockDef
      }))
    }

    const setContent = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.contents[index] = blockDef
      }))
    }

    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            { this.blockDef.headers.map((b, index) => {
              return <th key={index}>{props.renderChildBlock(props, b, setHeader.bind(null, index))}</th>
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            { this.blockDef.contents.map((b, index) => {
              return <td key={index}>{props.renderChildBlock(props, b, setContent.bind(null, index))}</td>
            })}
          </tr>
        </tbody>
      </table>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderEditor(props: RenderEditorProps) {
    const handleAddColumn = () => {
      props.onChange(produce(this.blockDef, b => {
        b.headers.push(null)
        b.contents.push(null)
      }))
    }

    // Remove last column
    const handleRemoveColumn = () => {
      props.onChange(produce(this.blockDef, b => {
        if (b.headers.length > 1) {
          b.headers.splice(b.headers.length - 1, 1)
          b.contents.splice(b.contents.length - 1, 1)
        }
      }))
    }

    return (
      <div>
        <button type="button" className="btn btn-default" onClick={handleAddColumn}>
          <i className="fa fa-plus"/> Add Column
        </button>
        <button type="button" className="btn btn-default" onClick={handleRemoveColumn}>
          <i className="fa fa-minus"/> Remove Column
        </button>
      </div>
    )
  }
}

class QueryTableBlockInstance extends React.Component<{
  blockDef: QueryTableBlockDef
  renderInstanceProps: RenderInstanceProps
}, {
  rows?: Row[]
}> {

  componentDidMount() {
    // TODO
  }

  createRowRenderInstanceProps(rowIndex: number): RenderInstanceProps {
    const rip = this.props.renderInstanceProps

    // Row context variable
    const rowcv: ContextVar = {
      id: this.props.blockDef.id,
      name: "Table Row",
      table: rip.contextVars.find(cv => cv.id === this.props.blockDef.rowset)!.table!, // TODO guard against not found?
      type: this.props.blockDef.mode === "multiRow" ? "rowset" : "row"
    }

    // Row context variable value
    let cvValue: any

    if (this.props.blockDef.mode === "multiRow") {
      // Create filter 
      // TODO
      throw new Error("Mode not supported")
    }
    else if (this.props.blockDef.mode === "singleRow") {
      // Value is primary key
      cvValue = this.state.rows![rowIndex].id
    }
    else {
      throw new Error("Mode not supported")
    }
      
    return {
      ...rip, 
      contextVars: rip.contextVars.concat(rowcv),
      getContextVarValue: (cvid) => cvid === rowcv.id ? cvValue : rip.getContextVarValue(cvid),
      getContextVarExprValue: (cvid, expr) => {
        if (cvid !== rowcv.id) {
          return rip.getContextVarExprValue(cvid, expr)
        }
        // TODO map expression to query column
      }
    }
  }

  renderRow(row: Row, rowIndex: number) {
    const rowRIProps = this.createRowRenderInstanceProps(rowIndex)

    return (
      <tr>
        { this.props.blockDef.contents.map((b, colIndex) => {
          return (
            <td key={colIndex}>
              {rowRIProps.renderChildBlock(rowRIProps, b)}
            </td>
          )
        })}
     </tr>
    )
  }

  renderRows() {
    if (!this.state.rows) {
      return null
    }

    return this.state.rows.map(this.renderRow)
  }

  render() {
    const riProps = this.props.renderInstanceProps

    return (
      <table className="table table-bordered">
        <thead>
          <tr>
            { this.props.blockDef.headers.map((b, index) => {
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