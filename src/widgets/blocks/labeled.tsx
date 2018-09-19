import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, CreateBlock, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import { LocalizedString, localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor } from '../propertyEditors';
import BlockPlaceholder from '../BlockPlaceholder';

export interface LabeledBlockDef extends BlockDef {
  type: "labeled"
  label: LocalizedString,
  child: BlockDef | null
}

export class LabeledBlock extends CompoundBlock<LabeledBlockDef> {
  getChildren(): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: [] }] : []
  }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.child = action(draft.child)
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
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
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