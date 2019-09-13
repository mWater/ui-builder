import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'

export interface VerticalBlockDef extends BlockDef {
  type: "vertical"
  items: BlockDef[]
}

export class VerticalBlock extends CompoundBlock<VerticalBlockDef> {
  get id() { return this.blockDef.id }

  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.items.map(bd => ({ blockDef: bd, contextVars: contextVars }))
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
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

  renderDesign(props: RenderDesignProps) {
    // Add keys
    return (
      <div style={{ paddingLeft: 5, paddingRight: 5 }}>
        { this.blockDef.items.map((childBlockDef, index) => React.cloneElement(props.renderChildBlock(props, childBlockDef), { key: index })) }
      </div>
    )      
  }

  renderInstance(props: RenderInstanceProps) {
    return (
      <div>
        { this.blockDef.items.map((childBlockDef, index) => {
          const childElem = props.renderChildBlock(props, childBlockDef)
          return childElem ? React.cloneElement(childElem, { key: index }) : null
        })}
      </div>
    )      
  }
}
