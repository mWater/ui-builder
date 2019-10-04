import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from '../blocks'
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { localize } from '../localization';
import { ActionDef } from '../actions';
import { Select, Checkbox } from 'react-library/lib/bootstrap';
import { WidgetLibrary } from '../../designer/widgetLibrary';
import { ActionLibrary } from '../ActionLibrary';
import { Expr, LocalizedString } from 'mwater-expressions';

export interface ButtonBlockDef extends BlockDef {
  type: "button"
  label: LocalizedString | null

  /** Action to perform when button is clicked */
  actionDef: ActionDef | null

  style: "default" | "primary" | "link"
  size: "normal" | "small" | "large" | "extrasmall"
  icon?: "plus" | "times" | "pencil"

  /** True to make block-style button */
  block?: boolean

  /** If present, message to display when confirming action */
  confirmMessage?: LocalizedString | null
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
    if (this.blockDef.actionDef) {
      const action = actionLibrary.createAction(this.blockDef.actionDef)
      return action.getContextVarExprs(contextVar)
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
      case "extrasmall":
        className += ` btn-xs`
        break
        case "large":
        className += ` btn-lg`
        break
    }

    if (this.blockDef.block) {
      className += " btn-block"
    }

    const icon = this.blockDef.icon ? <i className={`fa fa-${this.blockDef.icon}`}/> : null
    const style: React.CSSProperties = {}
    if (!this.blockDef.block) {
      style.margin = 5
    }

    return (
      <button type="button" className={className} onClick={onClick} style={style}>
        { icon }
        { icon && label ? "\u00A0" : null }
        { label }
      </button>
    )
  }

  renderDesign(props: RenderDesignProps) {
    return this.renderButton(props.locale, (() => null))
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    const handleClick = () => {
      // Confirm if confirm message
      if (this.blockDef.confirmMessage) {
        if (!confirm(localize(this.blockDef.confirmMessage, props.locale))) {
          return
        }
      }

      // Run action
      if (this.blockDef.actionDef) {
        const action = props.actionLibrary.createAction(this.blockDef.actionDef)

        action.performAction({
          contextVars: props.contextVars,
          database: props.database,
          schema: props.schema,
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
                { value: "extrasmall", label: "Extra-small"},
                { value: "large", label: "Large"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Icon">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="icon">
            {(value, onChange) => 
            <Select value={value} onChange={onChange}
              nullLabel="None"
              options={[
                { value: "plus", label: "Add"},
                { value: "pencil", label: "Edit"},
                { value: "times", label: "Remove"}
            ]}/> }
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="block">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Block-style</Checkbox>}
        </PropertyEditor>
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

        <LabeledProperty label="Confirm message">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="confirmMessage">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
