import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, CreateBlock, ContextVar, ChildBlock } from '../blocks'
import { DesignCtx, InstanceCtx } from '../../contexts';

export interface VerticalBlockDef extends BlockDef {
  type: "vertical"
  items: BlockDef[]
}

export class VerticalBlock extends Block<VerticalBlockDef> {
  get id() { return this.blockDef.id }

  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }))
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    // Apply action to all children, discarding null ones
    const newItems: BlockDef[] = []
    for (const item of this.blockDef.items) {
      const newItem = action(item)
      if (newItem) {
        newItems.push(newItem)
      }
    }

    return produce(this.blockDef, draft => { draft.items = newItems })
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
      const items = draft.items.map(item => item.type === "vertical" ? (item as VerticalBlockDef).items : item)
      draft.items = items.reduce((a: BlockDef[], b) => a.concat(b), []) as BlockDef[]
    })
  }

  renderDesign(props: DesignCtx) {
    // Add keys
    return (
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        { this.blockDef.items.map((childBlockDef, index) => React.cloneElement(props.renderChildBlock(props, childBlockDef), { key: index })) }
      </div>
    )      
  }

  renderInstance(props: InstanceCtx) {
    return (
      <div>
        { this.blockDef.items.map((childBlockDef, index) => {
          const childElem = props.renderChildBlock(props, childBlockDef)
          return childElem ? React.cloneElement(childElem, { key: index }) : null
        })}
      </div>
    )      
  }

  getLabel() { return "" } 
}
