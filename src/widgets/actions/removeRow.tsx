import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from '../propertyEditors';
import { InstanceCtx, DesignCtx } from '../../contexts';

export interface RemoveRowActionDef extends ActionDef {
  type: "removeRow"

  /** Context variable (row) to remove */
  contextVarId: string | null
}

/** Remove a single row specified by a context variable */
export class RemoveRowAction extends Action<RemoveRowActionDef> {
  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    const contextVar = instanceCtx.contextVars.find(cv => cv.id === this.actionDef.contextVarId)

    // Remove row
    const table = contextVar!.table!
    const id = instanceCtx.contextVarValues[this.actionDef.contextVarId!]

    // Do nothing if no row
    if (!id) {
      return
    }

    const txn = instanceCtx.database.transaction()
    await txn.removeRow(table, id)
    await txn.commit()
  }

  validate(designCtx: DesignCtx) {
    // Validate cv
    const contextVar = designCtx.contextVars.find(cv => cv.id === this.actionDef.contextVarId && cv.type === "row")
    if (!contextVar) {
      return "Context variable required"
    }

    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    const onChange = props.onChange as (actionDef: RemoveRowActionDef) => void

    return (
      <div>
        <LabeledProperty label="Row Variable to delete">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row"]} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )            
  }
}

