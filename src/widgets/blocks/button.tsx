import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { localize, LocalizedString } from '../localization';
import { ActionDef } from '../actions';
import { Select } from 'react-library/lib/bootstrap';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
import { Expr } from 'mwater-expressions';

export interface ButtonBlockDef extends BlockDef {
  type: "button"
  label: LocalizedString | null

  /** Action to perform when button is clicked */
  actionDef: ActionDef | null

  style: "default" | "primary" | "link"
  size: "normal" | "small" | "large"
}

export class ButtonBlock extends LeafBlock<ButtonBlockDef> {
  validate(options: ValidateBlockOptions) { 
    let error: string | null

    // Validate action
    if (this.blockDef.actionDef) {
      const action = options.actionLibrary.createAction(this.blockDef.actionDef)

      error = action.validate({
        schema: options.schema,
        contextVars: options.contextVars,
        widgetLibrary: options.widgetLibrary
      })
      if (error) {
        return error
      }
    }
    return null 
  }

  getContextVarExprs(contextVar: ContextVar, widgetLibrary: WidgetLibrary, actionLibrary: ActionLibrary): Expr[] { 
    // Include action expressions
    if (this.blockDef.rowClickAction) {
      const action = actionLibrary.createAction(this.blockDef.rowClickAction)
      return action.getContextVarExprs(contextVar, widgetLibrary)
    }

    return [] 
  }
 
  renderButton(locale: string, onClick: () => void) {
    const label = localize(this.blockDef.label, locale)
    let className = "btn btn-" + this.blockDef.style

    switch (this.blockDef.size) {
      case "normal":
        break
      case "small":
        className += ` btn-sm`
        break
      case "large":
        className += ` btn-lg`
        break
    }

    return (
      <button type="button" className={className} onClick={onClick}>
        { label }
      </button>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return this.renderButton(props.locale, (() => null))
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    const handleClick = () => {
      // Run action
      if (this.blockDef.actionDef) {
        const action = props.actionLibrary.createAction(this.blockDef.actionDef)

        action.performAction({
          contextVars: props.contextVars,
          database: props.database,
          locale: props.locale,
          contextVarValues: props.contextVarValues,
          pageStack: props.pageStack, 
          getContextVarExprValue: props.getContextVarExprValue
        })
      }
    }

    return this.renderButton(props.locale, handleClick)
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Text">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="label">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Style">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="style">
            {(value, onChange) => 
            <Select value={value} onChange={onChange}
              options={[
                { value: "default", label: "Default"},
                { value: "primary", label: "Primary"},
                { value: "link", label: "Link"},
              ]}
            /> }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Size">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="size">
            {(value, onChange) => 
            <Select value={value} onChange={onChange}
              options={[
                { value: "normal", label: "Default"},
                { value: "small", label: "Small"},
                { value: "large", label: "Large"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="When button clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="actionDef">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                locale={props.locale}
                schema={props.schema}
                dataSource={props.dataSource}
                actionLibrary={props.actionLibrary} 
                widgetLibrary={props.widgetLibrary}
                contextVars={props.contextVars} />
            )}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
