import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar } from '../blocks'
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
 
  processChildren(action: (self: BlockDef) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      if (draft.child) {
        draft.child = action(draft.child)
      }
    })
  }

  renderDesign(props: RenderDesignProps) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: LabeledBlockDef) => { 
        b.child = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    const labelText = localize(this.blockDef.label, props.locale)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div style={{fontWeight: "bold"}}>
          { labelText ? labelText : <span className="text-muted">Label</span>}
        </div>
        { this.blockDef.child 
          ? 
            props.wrapDesignerElem(this.blockDef.child, this.createBlock(this.blockDef.child).renderDesign(props))
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
            placeholder="Lorem ipsum"
            multiline
          />
        </LabeledProperty>
      </div>
    )
  }
}