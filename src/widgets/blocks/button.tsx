import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps } from '../blocks'
import { TextPropertyEditor, LabeledProperty, LocalizedTextPropertyEditor, DropdownPropertyEditor } from '../propertyEditors';
import { localize, LocalizedString } from '../localization';

export interface ButtonBlockDef extends BlockDef {
  type: "button"
  label: LocalizedString
  /** default, primary  */
  style: string 
  /** normal, small, large */
  size: string
}

export class ButtonBlock extends LeafBlock<ButtonBlockDef> {
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
    return this.renderButton(props.locale, (() => null))
  }

  renderEditor(props: RenderEditorProps) {
    return (
      <div>
        <LabeledProperty label="Text">
          <LocalizedTextPropertyEditor 
            obj={this.blockDef}
            onChange={props.onChange}
            property="text"
            locale={props.locale}
            placeholder="Lorem ipsum"
            multiline
          />
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
      </div>
    )
  }
}
