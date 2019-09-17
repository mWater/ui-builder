import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock } from '../blocks'
import { localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../propertyEditors';
import { LocalizedString } from 'mwater-expressions';

export interface LabeledBlockDef extends BlockDef {
  type: "labeled"
  label: LocalizedString | null,
  /** Optional help text */
  help?: LocalizedString | null,
  child: BlockDef | null
}

export class LabeledBlock extends CompoundBlock<LabeledBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars}] : []
  }

  validate() { return null }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    const child = action(this.blockDef.child)
    return produce(this.blockDef, draft => {
      draft.child = child
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
    const helpText = localize(this.blockDef.help, props.locale)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div style={{fontWeight: "bold"}}>
          { labelText ? labelText : <span className="text-muted">Label</span>}
        </div>
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
        <p className="help-block" style={{ marginLeft: 5 }}>
          {helpText}
        </p>
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    const labelText = localize(this.blockDef.label, props.locale)
    const helpText = localize(this.blockDef.help, props.locale)

    return (
      <div style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div style={{fontWeight: "bold"}}>
          {labelText}
        </div>
        { props.renderChildBlock(props, this.blockDef.child) }
        <p className="help-block" style={{ marginLeft: 5 }}>
          {helpText}
        </p>
      </div>
    )
  }
  
  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Label">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="label">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Help">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="help">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}