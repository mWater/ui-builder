import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from '../blocks'
import BlockPlaceholder from '../BlockPlaceholder';
import { compact } from 'lodash-es'

export interface QueryTableBlockDef extends BlockDef {
  type: "queryTable"
  headers: Array<BlockDef | null>
  contents: Array<BlockDef | null>
  rowset: string
  // order?
  // limit?
  // where?
}

export class QueryTableBlock extends CompoundBlock {
  blockDef: QueryTableBlockDef
  createBlock: CreateBlock

  constructor(blockDef: QueryTableBlockDef, createBlock: CreateBlock) {
    super(blockDef, createBlock)
  }

  getChildBlockDefs(): BlockDef[] {
    return compact(this.blockDef.headers.concat(this.blockDef.contents))
  }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.headers = draft.headers.map(b => action(b))
      draft.contents = draft.contents.map(b => action(b))
    })
  }

  renderDesign(props: RenderDesignProps) {
    // // Allow dropping
    // const handleSetLabel = (blockDef: BlockDef) => {
    //   props.store.alterBlock(this.id, produce((b: QueryTableBlockDef) => { 
    //     b.label = blockDef 
    //     return b
    //   }), blockDef.id)
    // }

    // const handleSetContent = (blockDef: BlockDef) => {
    //   props.store.alterBlock(this.id, produce((b: QueryTableBlockDef) => { 
    //     b.content = blockDef 
    //     return b
    //   }), blockDef.id)
    // }

    // const labelNode = this.blockDef.label ?
    //   props.wrapDesignerElem(this.blockDef.label, this.createBlock(this.blockDef.label).renderDesign(props))
    //   : <BlockPlaceholder onSet={handleSetLabel} />

    // const contentNode = this.blockDef.content ?
    //   props.wrapDesignerElem(this.blockDef.content, this.createBlock(this.blockDef.content).renderDesign(props))
    //   : <BlockPlaceholder onSet={handleSetContent} />

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

  renderInstance(props: RenderInstanceProps) {
    // const labelNode = this.blockDef.label ?
    //   this.createBlock(this.blockDef.label).renderInstance(props) : null

    // const contentNode = this.blockDef.content ?
    //   this.createBlock(this.blockDef.content).renderInstance(props) : null

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
}

