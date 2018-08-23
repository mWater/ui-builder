import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from '../blocks'

export interface VerticalBlockDef extends BlockDef {
  items: BlockDef[]
}

export class VerticalBlock extends CompoundBlock {
  blockDef: VerticalBlockDef
  createBlock: CreateBlock

  constructor(blockDef: VerticalBlockDef, createBlock: CreateBlock) {
    super(blockDef, createBlock)
  }

  get id() { return this.blockDef.id }

  getChildBlockDefs(): BlockDef[] {
    return this.blockDef.items
  }
 
  getContextVarExprs(contextVarId: string) { return [] }

  getCreatedContextVars(): ContextVar[] { return [] }

  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      const newItems: BlockDef[] = []
      for (const item of draft.items) {
        const newItem = action(item)
        if (newItem) {
          newItems.push(newItem)
        }
      }
      draft.items = newItems
    })
  }

  canonicalize(): BlockDef | null {
    // Remove if zero items
    if (this.blockDef.items.length === 0) {
      return null
    }
    // Collapse if one item
    if (this.blockDef.items.length === 1) {
      return this.blockDef.items[0]
    }
    return this.blockDef
  }

  addBlock(addedBlockDef: BlockDef, parentBlockId: string | null, parentBlockSection: any): BlockDef {
    return produce(this.blockDef as BlockDef, draft => {
      for (let i = draft.items.length - 1; i >= 0 ; i--) {
        draft.items[i] = this.createBlock(draft.items[i]).addBlock(addedBlockDef, parentBlockId, parentBlockSection)
      }
    })
  }

  renderChildDesign(props: RenderDesignProps, childBlockDef: BlockDef) {
    const childBlock = this.createBlock(childBlockDef)

    return (
      <div key={childBlockDef.id}>
        { childBlock.renderDesign(props) }
      </div>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return props.wrapDesignerElem(this.blockDef,
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        { this.blockDef.items.map(childBlock => this.renderChildDesign(props, childBlock)) }
      </div>
    )      
  }

  renderInstance(props: RenderInstanceProps) {
    return <div/>
  }
  
  renderEditor(props: RenderEditorProps) {
    return null
  }
}
