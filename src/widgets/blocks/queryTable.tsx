import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, BlockStore } from '../blocks'
import * as _ from 'lodash'

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"
  headers: Array<BlockDef | null>
  contents: Array<BlockDef | null>
  rowset: string
  // order?
  // limit?
  // where?
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