import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions } from '../blocks'
import { TextPropertyEditor, LabeledProperty, LocalizedTextPropertyEditor, DropdownPropertyEditor, PropertyEditor, ActionDefEditor } from '../propertyEditors';
import { localize, LocalizedString } from '../localization';
import { ActionDef } from '../actions';

export interface ButtonBlockDef extends BlockDef {
  type: "button"
  label: LocalizedString

  /** Action to perform when button is clicked */
  actionDef: ActionDef | null

  /** default, primary  */
  style: string 
  /** normal, small, large */
  size: string
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
          getContextVarValue: props.getContextVarValue,
          pageStack: props.pageStack
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
          <DropdownPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="style"
            options={[
              { value: "default", label: "Default"},
              { value: "primary", label: "Primary"},
            ]}
          />
        </LabeledProperty>
        <LabeledProperty label="Size">
          <DropdownPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="size"
            options={[
              { value: "normal", label: "Default"},
              { value: "small", label: "Small"},
              { value: "large", label: "Large"}
            ]}
          />
        </LabeledProperty>
        <LabeledProperty label="When button clicked">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="actionDef">
            {(value, onChange) => (
              <ActionDefEditor 
                value={value} 
                onChange={onChange} 
                locale={props.locale}
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
