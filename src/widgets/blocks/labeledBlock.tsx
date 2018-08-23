import produce from 'immer'
import * as React from 'react';
import * as uuid from 'uuid/v4'
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, dropBlock, DropSide, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from '../blocks'
import { LocalizedString, localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor } from '../propertyEditors';
import BlockPlaceholder from '../BlockPlaceholder';

export interface LabeledBlockDef extends BlockDef {
  label: LocalizedString,
  child: BlockDef | null
}

export class LabeledBlock extends CompoundBlock {
  blockDef: LabeledBlockDef
  createBlock: CreateBlock

  constructor(blockDef: LabeledBlockDef, createBlock: CreateBlock) {
    super(blockDef, createBlock)
  }

  get id() { return this.blockDef.id }

  getChildBlockDefs(): BlockDef[] {
    return this.blockDef.child ? [this.blockDef.child] : []
  }
 
  getContextVarExprs(contextVarId: string) { return [] }

  getCreatedContextVars(): ContextVar[] { return [] }

  clone(): BlockDef {
    return produce(this.blockDef, draft => {
      draft.id = uuid()
      
      if (draft.child) {
        draft.child = this.createBlock(draft.child).clone()
      }
    })
  }

  canonicalize(): BlockDef | null {
    // Canonicalize child
    return produce(this.blockDef, draft => {
      if (draft.child) {
        draft.child = this.createBlock(draft.child).canonicalize() 
      }
    })
  }

  replaceBlock(blockId: string, replacementBlockDef: BlockDef | null): BlockDef | null {
    if (blockId === this.id) {
      return replacementBlockDef
    }

    return produce(this.blockDef, draft => {
      if (draft.child) {
        draft.child = this.createBlock(draft.child).replaceBlock(blockId, replacementBlockDef) 
      }
    })
  }

  addBlock(addedBlockDef: BlockDef, parentBlockId: string | null, parentBlockSection: any): BlockDef {
    return produce(this.blockDef, draft => {
      if (parentBlockId === this.id) {
        draft.child = addedBlockDef
      }
    })
  }

  dropBlock(droppedBlockDef: BlockDef, targetBlockId: string, dropSide: DropSide): BlockDef {
    // If self
    if (targetBlockId === this.id) {
      return dropBlock(droppedBlockDef, this.blockDef, dropSide)
    }

    return produce(this.blockDef, draft => {
      if (draft.child) {
        draft.child = this.dropBlock(droppedBlockDef, targetBlockId, dropSide) 
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.addBlock(addedBlockDef, this.id, "child")
    }

    const labelText = localize(this.blockDef.label, props.locale)

    return props.wrapDesignerElem(this.blockDef,
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div style={{fontWeight: "bold"}}>
          { labelText ? labelText : <span className="text-muted">Lorem Ipsum</span>}
        </div>
        { this.blockDef.child 
          ? 
            this.createBlock(this.blockDef.child).renderDesign(props) 
          : 
            <BlockPlaceholder onSet={handleAdd} /> }
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) { // TODO, ref: (blockInstance: BlockInstance | null) => void) {
    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div style={{fontWeight: "bold"}}>
          {localize(this.blockDef.label, props.locale)}
        </div>
        { this.blockDef.child ? this.createBlock(this.blockDef.child).renderInstance(props) : null }
      </div>
    )
  }
  
  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Label">
          <LocalizedTextPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="label"
            locale={props.locale}
            placeholder="Lorem Ipsum"
            multiline
          />
        </LabeledProperty>
      </div>
    )
  }
}