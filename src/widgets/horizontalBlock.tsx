import produce from 'immer'
import * as React from 'react';
import * as uuid from 'uuid/v4'
import CompoundBlock from './CompoundBlock';
import { BlockDef, CreateBlock, dropBlock, DropSide, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from './blocks'

export interface HorizontalBlockDef extends BlockDef {
  items: BlockDef[]
}

export class HorizontalBlock extends CompoundBlock {
  blockDef: HorizontalBlockDef
  createBlock: CreateBlock

  constructor(blockDef: HorizontalBlockDef, createBlock: CreateBlock) {
    super(blockDef, createBlock)
  }

  get id() { return this.blockDef.id }

  getChildBlockDefs(): BlockDef[] {
    return this.blockDef.items
  }
 
  getContextVarExprs(contextVarId: string) { return [] }

  getCreatedContextVars(): ContextVar[] { return [] }

  clone(): BlockDef {
    return produce(this.blockDef, draft => {
      draft.id = uuid()

      for (let i = 0; i< draft.items.length; i++) {
        draft.items[i] = this.createBlock(draft.items[i]).clone()
      }
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

    // Canonicalize items
    return produce(this.blockDef, draft => {
      const newItems = [] as BlockDef[];
      for (const item of draft.items) {
        const canonItem = this.createBlock(item).canonicalize() 
        if (canonItem) {
          newItems.push(canonItem)
        }
      }
      draft.items = newItems
    })
  }

  replaceBlock(blockId: string, replacementBlockDef: BlockDef | null): BlockDef | null {
    if (blockId === this.id) {
      return replacementBlockDef
    }

    return produce(this.blockDef as BlockDef, d => {
      const draft = d as HorizontalBlockDef

      for (let i = draft.items.length - 1; i >= 0 ; i--) {
        const childBlock = this.createBlock(draft.items[i]).replaceBlock(blockId, replacementBlockDef)
        if (childBlock) {
          draft.items[i] = childBlock
        }
        else {
          draft.items.splice(i, 1)
        }
      }
      return
    })
  }

  addBlock(addedBlockDef: BlockDef, parentBlockId: string | null, parentBlockSection: any): BlockDef {
    throw new Error("Not applicable");
  }

  dropBlock(droppedBlockDef: BlockDef, targetBlockId: string, dropSide: DropSide): BlockDef {
    // If self
    if (targetBlockId === this.id) {
      return dropBlock(droppedBlockDef, this.blockDef, dropSide)
    }

    return produce(this.blockDef, draft => {
      for (let i = 0; i < draft.items.length; i++) {
        // Insert if dropped left or right
        if ((dropSide === DropSide.left) && (draft.items[i].id === targetBlockId)) {
          draft.items.splice(i, 0, droppedBlockDef)
          return
        }
        else if ((dropSide === DropSide.right) && (draft.items[i].id === targetBlockId)) {
          draft.items.splice(i + 1, 0, droppedBlockDef)
          return
        }
        else {
          draft.items[i] = this.createBlock(draft.items[i]).dropBlock(droppedBlockDef, targetBlockId, dropSide)
        }
      }
    })
  }

  renderChildDesigner(props: RenderDesignProps, childBlockDef: BlockDef) {
    const childBlock = this.createBlock(childBlockDef)

    return (
      <div key={childBlockDef.id} style={{ display: "inline-block", width: (100/this.blockDef.items.length) + "%", verticalAlign: "top" }}>
        { childBlock.renderDesign(props) }
      </div>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return props.wrapDesignerElem(this.blockDef,
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        { this.blockDef.items.map(childBlock => this.renderChildDesigner(props, childBlock)) }
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
