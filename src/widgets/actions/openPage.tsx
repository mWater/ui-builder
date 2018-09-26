import * as _ from 'lodash'
import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from '../propertyEditors';
import { Select } from 'react-library/lib/bootstrap';
import { WidgetDef } from '../widgets';
import produce from 'immer';

/** Direct reference to another context variable */
interface ContextVarRef {
  type: "ref"
  
  /** Context variable whose value should be used */
  contextVarId: string
}

/** Action which opens a page */
export interface OpenPageActionDef extends ActionDef {
  type: "openPage"

  pageType: "normal" | "modal"

  /** id of the widget that will be displayed in the page */
  widgetId: string | null

  /** Values of context variables that widget inside page needs */
  contextVarValues: { [contextVarId: string]: ContextVarRef }
}

export class OpenPageAction extends Action<OpenPageActionDef> {
  validate(options: ValidateActionOptions) {
    // Find widget
    if (!this.actionDef.widgetId) {
      return "Widget required"
    }

    // Ensure that widget exists 
    const widget = options.widgetLibrary.widgets[this.actionDef.widgetId]
    if (!widget) {
      return "Invalid widget"
    }

    // Ensure that all context variables are mapped
    for (const widgetCV of widget.contextVars) {
      if (!this.actionDef.contextVarValues[widgetCV.id]) {
        return "Missing mapping for " + widgetCV.name
      }
      // Ensure that mapping is to available context var
      if (!options.contextVars.find(cv => cv.id === this.actionDef.contextVarValues[widgetCV.id].contextVarId)) {
        return "Invalid context variable"
      }
      // TODO Check type and table
    }

    return null
  }

  performAction(options: PerformActionOptions): Promise<void> {
    const contextVarValues = {}

    // Perform mappings TODO test
    for (const cvid of Object.keys(this.actionDef.contextVarValues)) {
      contextVarValues[cvid] = options.getContextVarValue(this.actionDef.contextVarValues[cvid].contextVarId)
    }

    options.pageStack.openPage({
      type: this.actionDef.pageType,
      database: options.database,
      widgetId: this.actionDef.widgetId!,
      contextVarValues: contextVarValues
    })

    return Promise.resolve()
  }
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { 
    // Create widget options 
    const widgetOptions = _.sortBy(_.values(props.widgetLibrary.widgets).map(w => ({ label: w.name, value: w.id })), "name")

    const actionDef = props.actionDef as OpenPageActionDef

    const handleWidgetIdChange = (widgetId: string | null) => {
      props.onChange({ ...actionDef, widgetId: widgetId, contextVarValues: {} })
    }
    
    const widgetDef: WidgetDef | null = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null

    const renderContextVarValues = () => {
      if (!widgetDef) {
        return null
      }

      return (
        <table className="table table-bordered table-condensed">
          <tbody>
            { widgetDef.contextVars.map(contextVar => {
              const cvr = actionDef.contextVarValues[contextVar.id]
              const handleCVRChange = (contextVarId: string) => {
                props.onChange(produce(actionDef, (draft) => {
                  draft.contextVarValues[contextVar.id] = { type: "ref", contextVarId: contextVarId }
                }))
              }

              return (
                <tr key={contextVar.id}>
                  <td>{contextVar.name}</td>
                  <td>
                    <ContextVarPropertyEditor 
                      contextVars={props.contextVars}  
                      types={[contextVar.type]}
                      table={contextVar.table}
                      value={ cvr ? cvr.contextVarId : null }
                      onChange={ handleCVRChange }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )
    }

    return (
      <div>
        <LabeledProperty label="Page Type">
          <PropertyEditor obj={props.actionDef} onChange={props.onChange} property="pageType">
            {(value, onChange) => <Select value={value} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }]} />}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Page Widget">
          <Select value={actionDef.widgetId} onChange={handleWidgetIdChange} options={widgetOptions} nullLabel="Select Widget" />
        </LabeledProperty>

        <LabeledProperty label="Context Variables">
          {renderContextVarValues()}
        </LabeledProperty>
      </div>
    )
  }
}