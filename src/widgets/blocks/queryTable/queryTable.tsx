import produce from 'immer'
import * as React from 'react';
import * as _ from 'lodash'
import CompoundBlock from '../../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, getBlockTree, ChildBlock } from '../../blocks'
import { Expr, Schema, ExprUtils } from 'mwater-expressions';
import { Row } from '../../../Database';
import QueryTableBlockInstance from './QueryTableBlockInstance';

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"

  /** Determines if one table row contains one or multiple database table rows */
  mode: "singleRow" | "multiRow"  
  headers: Array<BlockDef | null>
  contents: Array<BlockDef | null>

  /** Id of context variable of rowset for table to use */
  rowset: string
  limit: number
  where: Expr | null
  // order?
}

export class QueryTableBlock extends CompoundBlock<QueryTableBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    // Get rowset context variable
    const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowset)

    const headerChildren: ChildBlock[] = _.compact(this.blockDef.headers).map(bd => ({ blockDef: bd, contextVars: [] }))
    const contentChildren: ChildBlock[] = _.compact(this.blockDef.contents).map(bd => ({ blockDef: bd, contextVars: rowsetCV ? [this.createRowContextVar(rowsetCV)] : [] }))
    return headerChildren.concat(contentChildren)
  }

  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.headers = draft.headers.map(b => action(b))
      draft.contents = draft.contents.map(b => action(b))
    })
  }

  /** Create the context variable used */
  createRowContextVar(rowsetCV: ContextVar): ContextVar {
    switch (this.blockDef.mode) {
      case "singleRow":
        return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table }
      case "multiRow":
        return { id: this.getRowContextVarId(), name: "Table row rowset", type: "rowset", table: rowsetCV.table }
    }
  }

  getRowContextVarId() {
    switch (this.blockDef.mode) {
      case "singleRow":
        return this.blockDef.id + "_row"
      case "multiRow":
        return this.blockDef.id + "_rowset"
    }
  }

  /** Get list of expressions used in a row by content blocks */
  getRowExprs(contextVars: ContextVar[]): Expr[] {
    let exprs: Expr[] = []

    for (const contentBlockDef of this.blockDef.contents) {
      // Get block tree, compiling expressions for each one
      if (contentBlockDef) {
        for (const descBlock of getBlockTree(contentBlockDef, this.createBlock, contextVars)) {
          exprs = exprs.concat(descBlock.getContextVarExprs(this.getRowContextVarId()))
        }
      }
    }
    return exprs
  }

  /** 
   * Get the value of the row context variable for a specific row. 
   * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
   */
  getRowContextVarValue(row: Row, rowExprs: Expr[], schema: Schema, rowsetCV: ContextVar): any {
    switch (this.blockDef.mode) {
      case "singleRow":
        return row.id
      case "multiRow":
        const exprUtils = new ExprUtils(schema)

        // Create "and" filter
        const ands: Expr[] = []
        rowExprs.forEach((expr, index) => {
          if (exprUtils.getExprAggrStatus(expr) === "individual") {
            ands.push({
              type: "op",
              op: "=",
              table: rowsetCV.table!,
              exprs: [
                expr,
                { type: "literal", valueType: exprUtils.getExprType(expr)!, value: row["e" + index] }
              ]
            })
          }
        })

        return { type: "op", op: "and", table: rowsetCV.table!, exprs: ands }

    }
  }

  renderDesign(props: RenderDesignProps) {
    const setHeader = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.headers[index] = blockDef
      }), blockDef.id)
    }

    const setContent = (index: number, blockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce(b => {
        b!.contents[index] = blockDef
      }), blockDef.id)
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
    return <QueryTableBlockInstance block={this} renderInstanceProps={props}/>
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

