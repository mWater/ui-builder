import produce from 'immer'
import * as React from 'react';
import { Block, BlockDef, ContextVar, ChildBlock } from '../blocks'
import { localize } from '../localization';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor } from '../propertyEditors';
import { LocalizedString } from 'mwater-expressions';
import { DesignCtx, InstanceCtx } from '../../contexts';
import { Checkbox, Toggle } from 'react-library/lib/bootstrap';

export interface LabeledBlockDef extends BlockDef {
  type: "labeled"
  label: LocalizedString | null

  /** Optional help text shown at bottom */
  help?: LocalizedString | null

  /** Optional hint text shown after label in faded */
  hint?: LocalizedString | null

  /** True to display required red star */
  requiredStar?: boolean

  /** Layout of control. Default is stacked */
  layout?: "stacked" | "horizontal"

  child: BlockDef | null
}

export class LabeledBlock extends Block<LabeledBlockDef> {
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

  renderDesign(props: DesignCtx) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: LabeledBlockDef) => { 
        b.child = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    const labelText = localize(this.blockDef.label, props.locale)
    const hintText = localize(this.blockDef.hint, props.locale)
    const helpText = localize(this.blockDef.help, props.locale)

    return this.blockDef.layout == "horizontal" ?
      <HorizLabeledControl
        designMode
        labelText={labelText || "Label"}
        hintText={hintText}
        helpText={helpText}
        requiredStar={this.blockDef.requiredStar}>
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
      </HorizLabeledControl>
    :
      <StackedLabeledControl
        labelText={labelText || "Label"}
        hintText={hintText}
        helpText={helpText}
        requiredStar={this.blockDef.requiredStar}>
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
      </StackedLabeledControl>
  }

  renderInstance(props: InstanceCtx) {
    const labelText = localize(this.blockDef.label, props.locale)
    const hintText = localize(this.blockDef.hint, props.locale)
    const helpText = localize(this.blockDef.help, props.locale)

    return this.blockDef.layout == "horizontal" ?
      <HorizLabeledControl
        labelText={labelText || "Label"}
        hintText={hintText}
        helpText={helpText}
        requiredStar={this.blockDef.requiredStar}>
        { props.renderChildBlock(props, this.blockDef.child) }
      </HorizLabeledControl>
    :
       <StackedLabeledControl
        labelText={labelText}
        hintText={hintText}
        helpText={helpText}
        requiredStar={this.blockDef.requiredStar}>
        { props.renderChildBlock(props, this.blockDef.child) }
      </StackedLabeledControl>
  }
  
  renderEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Label">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="label">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Hint">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="hint">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Help">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="help">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="requiredStar">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Show required star</Checkbox>}
        </PropertyEditor>
        <LabeledProperty label="Layout">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="layout">
            {(value, onChange) => 
            <Toggle value={value || "stacked"} onChange={onChange}
              options={[
                { value: "stacked", label: "Stacked"},
                { value: "horizontal", label: "Horizontal"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>    
      </div>
    )
  }
}

function StackedLabeledControl(props: {
  labelText: string
  requiredStar?: boolean
  hintText: string
  helpText: string
  children: any
}) {
  return <div style={{ paddingTop: 5, paddingBottom: 5 }}>
    <div key="label">
      <span key="label" style={{fontWeight: "bold"}}>
        { props.labelText }
      </span>
      { props.requiredStar ?
        <span style={{ color: "red", paddingLeft: 2 }}>*</span>
      : null }
      { props.hintText ?
        <span key="hint" className="text-muted"> - {props.hintText}</span>
      : null }
    </div>
    { props.children }
    { props.helpText ? 
      <p className="help-block" style={{ marginLeft: 5 }}>
        {props.helpText}
      </p>
    : null }
  </div>
}

function HorizLabeledControl(props: {
  /** Add a tiny space to top of label to make line up */
  designMode?: boolean
  labelText: string
  requiredStar?: boolean
  hintText: string
  helpText: string
  children: any
}) {
  return <div style={{ paddingTop: 5, paddingBottom: 5, display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto auto", alignItems: "center" }}>
    <div key="label" style={{ paddingTop: props.designMode ? 2 : undefined, marginRight: 5}}>
      <span key="label" style={{ fontWeight: "bold" }}>
        { props.labelText }
      </span>
      { props.requiredStar ?
        <span style={{ color: "red", paddingLeft: 2 }}>*</span>
      : null }
    </div>
    <div key="content">
      { props.children }
    </div>
    <div key="blank"/>
    <div key="help" style={{ marginLeft: 5 }}>
      <span key="hint" className="text-muted" style={{ marginLeft: 5 }}>{props.hintText}</span>
      <span key="help" style={{ marginLeft: 5 }}>{props.helpText}</span>
    </div>
  </div>
}