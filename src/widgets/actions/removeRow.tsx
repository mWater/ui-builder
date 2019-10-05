import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from '../propertyEditors';

export interface RemoveRowActionDef extends ActionDef {
  type: "removeRow"

  /** Context variable (row) to remove */
  contextVarId: string | null
}

/** Remove a single row specified by a context variable */
export class RemoveRowAction extends Action<RemoveRowActionDef> {
  async performAction(options: PerformActionOptions): Promise<void> {
    const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId)

    // Remove row
    const table = contextVar!.table!
    const id = options.contextVarValues[this.actionDef.contextVarId!]

    // Do nothing if no row
    if (!id) {
      return
    }

    const txn = options.database.transaction()
    await txn.removeRow(table, id)
    await txn.commit()
  }

  validate(options: ValidateActionOptions) {
    // Validate cv
    const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId && cv.type === "row")
    if (!contextVar) {
      return "Context variable required"
    }

    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    return (
      <div>
        <LabeledProperty label="Row Variable to delete">
          <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row"]} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )            
  }
}

