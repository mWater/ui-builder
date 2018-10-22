import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, CreateBlock } from '../blocks'
import { LocalizedString, localize } from '../localization';
import { LocalizedTextPropertyEditor, PropertyEditor, LabeledProperty } from '../propertyEditors';
import VirtualDatabase from '../../database/VirtualDatabase';
import ContextVarsInjector from '../ContextVarsInjector';

export interface SaveCancelBlockDef extends BlockDef {
  type: "saveCancel"
  saveLabel: LocalizedString | null
  cancelLabel: LocalizedString | null
  child: BlockDef | null
}

export class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars}] : []
  }

  validate() { 
    if (!this.blockDef.child) {
      return "Contents required"
    }
    return null 
  }
 
  processChildren(action: (self: BlockDef | null) => BlockDef | null): BlockDef {
    return produce(this.blockDef, draft => {
      draft.child = action(draft.child)
    })
  }

  renderDesign(props: RenderDesignProps) {
    const handleAdd = (addedBlockDef: BlockDef) => {
      props.store.alterBlock(this.id, produce((b: SaveCancelBlockDef) => { 
        b.child = addedBlockDef 
        return b
      }), addedBlockDef.id)
    }

    const saveLabelText = localize(this.blockDef.saveLabel, props.locale)
    const cancelLabelText = localize(this.blockDef.cancelLabel, props.locale)

    return (
      <div>
        { props.renderChildBlock(props, this.blockDef.child, handleAdd) }
        <div className="save-cancel-footer">
          <button type="button" className="btn btn-primary">{saveLabelText}</button>
          &nbsp;
          <button type="button" className="btn btn-default">{cancelLabelText}</button>
        </div>
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    return <SaveCancelInstance renderInstanceProps={props} blockDef={this.blockDef} createBlock={this.createBlock} />
  }
  
  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Save Label">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="saveLabel">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Cancel Label">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="cancelLabel">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}

interface SaveCancelInstanceProps {
  renderInstanceProps: RenderInstanceProps
  blockDef: SaveCancelBlockDef
  createBlock: CreateBlock
}

interface SaveCancelInstanceState {
  virtualDatabase: VirtualDatabase
}

/** Instance swaps out the database for a virtual database */
class SaveCancelInstance extends React.Component<SaveCancelInstanceProps, SaveCancelInstanceState> {
  constructor(props: SaveCancelInstanceProps) {
    super(props)
    this.state = {
      virtualDatabase: new VirtualDatabase(props.renderInstanceProps.database, props.renderInstanceProps.schema, props.renderInstanceProps.locale)
    }
  }

  handleSave = () => {
    // TODO
  }

  handleCancel = () => {
    // TODO
  }

  render() {
    const saveLabelText = localize(this.props.blockDef.saveLabel, this.props.renderInstanceProps.locale)
    const cancelLabelText = localize(this.props.blockDef.cancelLabel, this.props.renderInstanceProps.locale)

    // Inject new database and re-inject all context variables. This is needed to allow computed expressions
    // to come from the virtual database
    return (
      <div>
        <ContextVarsInjector 
          createBlock={this.props.createBlock} 
          database={this.state.virtualDatabase}
          injectedContextVars={this.props.renderInstanceProps.contextVars}
          injectedContextVarValues={this.props.renderInstanceProps.contextVarValues}
          innerBlock={this.props.blockDef.child!}
          renderInstanceProps={this.props.renderInstanceProps}
          schema={this.props.renderInstanceProps.schema}>
          { (renderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
            if (loading) {
              return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
            }
            return (
              <div style={{ opacity: refreshing ? 0.6 : undefined }}>
                { renderInstanceProps.renderChildBlock(renderInstanceProps, this.props.blockDef.child) }
              </div>
            )
          }}
          </ContextVarsInjector>

        <div className="save-cancel-footer">
          <button type="button" className="btn btn-primary" onClick={this.handleSave}>{saveLabelText}</button>
          &nbsp;
          <button type="button" className="btn btn-default" onClick={this.handleCancel}>{cancelLabelText}</button>
        </div>
      </div>
    )
  }
}