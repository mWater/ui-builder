import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { LabeledProperty, PropertyEditor } from '../propertyEditors';
import { TextInput, Checkbox } from 'react-library/lib/bootstrap';

export interface GotoUrlActionDef extends ActionDef {
  type: "gotoUrl"
  url?: string

  /** True to open in new tab */
  newTab?: boolean
}

export class GotoUrlAction extends Action<GotoUrlActionDef> {
  async performAction(options: PerformActionOptions): Promise<void> {
    window.open(this.actionDef.url, this.actionDef.newTab ? "_blank" : "_self")
  }

  validate(options: ValidateActionOptions) {
    // Check that url is present
    if (!this.actionDef.url) {
      return "URL required"
    }
    return null
  }

  renderEditor(props: RenderActionEditorProps) {
    return (
      <div>
        <LabeledProperty label="URL">
          <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="url">
            {(value, onChange) => 
              <TextInput value={value} onChange={onChange}/>
            }
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="newTab">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Open in new tab</Checkbox>}
        </PropertyEditor>
      </div>
    )
  }
}

