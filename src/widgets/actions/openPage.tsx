import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps } from '../actions';
import { Expr } from 'mwater-expressions';
import * as _ from 'lodash'
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { NumberInput, Select } from 'react-library/lib/bootstrap';

/** Direct reference to another context variable */
interface ContextVarRef {
  type: "ref"
  
  /** Context variable whose value should be used */
  contextVarId: string | null,
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

  performAction(options: PerformActionOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { 
    return (
      <div>
        <LabeledProperty label="Page Type">
          <PropertyEditor obj={props.actionDef} onChange={props.onChange} property="pageType">
            {(value, onChange) => <Select value={value} onChange={onChange} options={[{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }]} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }

}

 