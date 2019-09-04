import produce from 'immer'
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { BlockDef, RenderDesignProps, RenderEditorProps, RenderInstanceProps, ContextVar, ChildBlock, CreateBlock, ValidatableInstance } from '../blocks'
import { localize } from '../localization';
import { LocalizedTextPropertyEditor, PropertyEditor, LabeledProperty } from '../propertyEditors';
import VirtualDatabase from '../../database/VirtualDatabase';
import ContextVarsInjector from '../ContextVarsInjector';
import * as _ from 'lodash'
import { LocalizedString } from 'mwater-expressions';

export interface SaveCancelBlockDef extends BlockDef {
  type: "saveCancel"
  saveLabel: LocalizedString | null
  cancelLabel: LocalizedString | null
  child: BlockDef | null
  /** Message to confirm discarding changes */
  confirmDiscardMessage: LocalizedString | null
}

/** Block that has a save/cancel button pair at bottom. Changes are only sent to the database if save is clicked.
 * When either is clicked, the page is closed.
 */
export class SaveCancelBlock extends CompoundBlock<SaveCancelBlockDef> {
  getChildren(contextVars: ContextVar[]): ChildBlock[] {
    return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars}] : []
  }

  validate() { 
    if (!this.blockDef.child) {
      return "Contents required"
    }

    if (!this.blockDef.saveLabel) {
      return "Save label required"
    }

    if (!this.blockDef.cancelLabel) {
      return "Cancel label required"
    }

    if (!this.blockDef.confirmDiscardMessage) {
      return "Confirm discard message required"
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
        <LabeledProperty label="Confirm Discard Message">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="confirmDiscardMessage">
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

  /** True when control has been destroyed by save or cancel */
  destroyed: boolean

  /** True when control is saving */
  saving: boolean
}

/** Instance swaps out the database for a virtual database */
class SaveCancelInstance extends React.Component<SaveCancelInstanceProps, SaveCancelInstanceState> implements ValidatableInstance {
  instanceRefs: { [key: string]: React.Component<any> & ValidatableInstance }

  constructor(props: SaveCancelInstanceProps) {
    super(props)
    this.state = {
      virtualDatabase: new VirtualDatabase(props.renderInstanceProps.database, props.renderInstanceProps.schema, props.renderInstanceProps.locale), 
      destroyed: false,
      saving: false
    }

    this.instanceRefs = {}
  }

  validate = () => {
    // Confirm if changes present
    if (this.state.virtualDatabase.mutations.length > 0) {
      if (!confirm(localize(this.props.blockDef.confirmDiscardMessage, this.props.renderInstanceProps.locale))) {
        // Return empty string to block without message
        return ""
      }
    }
    return null
  }

  handleSave = async () => {
    // Validate all instances
    const validationMessages: string[] = []

    for (const key of Object.keys(this.instanceRefs)) {
      const component = this.instanceRefs[key]
      if (component.validate) {
        const msg = component.validate()
        if (msg !== null) {
          validationMessages.push(msg)
        }
      }
    }

    if (validationMessages.length > 0) {
      // "" just blocks
      if (_.compact(validationMessages).length > 0) {
        alert(_.compact(validationMessages).join("\n"))
      }
      return
    }

    this.setState({ saving: true })
    await this.state.virtualDatabase.commit()
    this.setState({ saving: false, destroyed: true })
    this.props.renderInstanceProps.pageStack.closePage()
  }

  handleCancel = () => {
    this.state.virtualDatabase.rollback()
    this.setState({ destroyed: true })
    this.props.renderInstanceProps.pageStack.closePage()
  }

  refHandler = (key: string, component: React.Component<any> | null) => {
    if (component) {
      this.instanceRefs[key] = component
    }
    else {
      delete this.instanceRefs[key]
    }
  }

  /** All sub-block elements must rendered using this function. 
   * @param instanceId if more than one child element with the same id will be rendered, instanceId must be a unique string 
   * per instance 
   */
  renderChildBlock = (props: RenderInstanceProps, childBlockDef: BlockDef | null, instanceId?: string) => {
    // Create block
    if (childBlockDef) {
      const block = this.props.createBlock(childBlockDef)

      const elem = block.renderInstance(props)

      // Add ref to element
      const key = instanceId ? childBlockDef.id + ":" + instanceId : childBlockDef.id
      const refedElem = React.cloneElement(elem, { ...elem.props, ref: this.refHandler.bind(null, key) })
      return refedElem
    }
    else {
      return null
    }
  }

  render() {
    if (this.state.destroyed) {
      return null
    }

    const saveLabelText = localize(this.props.blockDef.saveLabel, this.props.renderInstanceProps.locale)
    const cancelLabelText = localize(this.props.blockDef.cancelLabel, this.props.renderInstanceProps.locale)

    // Replace renderChildBlock with function that keeps all instances for validation
    const renderInstanceProps = { ...this.props.renderInstanceProps, 
      renderChildBlock: this.renderChildBlock
    }

    // Inject new database and re-inject all context variables. This is needed to allow computed expressions
    // to come from the virtual database
    return (
      <div>
        <ContextVarsInjector 
          createBlock={this.props.createBlock} 
          database={this.state.virtualDatabase}
          injectedContextVars={renderInstanceProps.contextVars}
          injectedContextVarValues={renderInstanceProps.contextVarValues}
          innerBlock={this.props.blockDef.child!}
          renderInstanceProps={renderInstanceProps}
          schema={renderInstanceProps.schema}>
          { (innerRenderInstanceProps: RenderInstanceProps, loading: boolean, refreshing: boolean) => {
            if (loading) {
              return <div style={{ color: "#AAA", fontSize: 18, textAlign: "center" }}><i className="fa fa-circle-o-notch fa-spin"/></div>
            }
            return (
              <div style={{ opacity: refreshing ? 0.6 : undefined }}>
                { innerRenderInstanceProps.renderChildBlock(innerRenderInstanceProps, this.props.blockDef.child) }
              </div>
            )
          }}
          </ContextVarsInjector>

        <div className="save-cancel-footer">
          <button type="button" className="btn btn-primary" onClick={this.handleSave} disabled={this.state.saving}>{saveLabelText}</button>
          &nbsp;
          <button type="button" className="btn btn-default" onClick={this.handleCancel} disabled={this.state.saving}>{cancelLabelText}</button>
        </div>
      </div>
    )
  }
}