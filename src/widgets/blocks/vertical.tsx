import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from '../blocks'

export interface VerticalBlockDef extends BlockDef {
  type: "vertical"
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
 
  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    // Apply action to all children, discarding null ones
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

    // Flatten out nested vertical blocks
    return produce(this.blockDef, (draft) => {
      draft.items = draft.items.map(item => item.type === "vertical" ? item.items : item).reduce((a, b) => a.concat(b), [])
    })
  }

  renderChildDesign(props: RenderDesignProps, childBlockDef: BlockDef) {
    return (
      <div key={childBlockDef.id}>
        { props.renderChildBlock(props, childBlockDef) }
      </div>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return (
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        { this.blockDef.items.map(childBlock => this.renderChildDesign(props, childBlock)) }
      </div>
    )      
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        { this.blockDef.items.map(childBlockDef => props.renderChildBlock(props, childBlockDef)) }
      </div>
    )      
  }
}
