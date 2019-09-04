import * as React from 'react';
import { RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';

export interface TextboxBlockDef extends ControlBlockDef {
  type: "textbox"

  placeholder: LocalizedString | null
}

/** Block that is a text input control linked to a specific field */
export class TextboxBlock extends ControlBlock<TextboxBlockDef> {
  renderControl(props: RenderControlProps) {
    return <Textbox
      value={props.value} 
      onChange={props.onChange}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      disabled={props.disabled}
      />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: RenderEditorProps) {
    return (
      <LabeledProperty label="Placeholder">
        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="placeholder">
          {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
        </PropertyEditor>
      </LabeledProperty>
    )
  }

  /** Filter the columns that this control is for */
  filterColumn(column: Column) {
    return column.type === "text"
  }
}

interface TextboxProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  disabled: boolean
}

/** Text box that updates only on blur */
class Textbox extends React.Component<TextboxProps, { text: string | null }> {
  constructor(props: TextboxProps) {
    super(props)

    this.state = { text: null }
  }

  componentDidUpdate(prevProps: TextboxProps) {
    // If different, override text
    if (prevProps.value !== this.props.value && this.state.text != null) {
      this.setState({ text: this.props.value })
    }
  }

  handleFocus = () => {
    // Start tracking state internally
    this.setState({ text: this.props.value });
  }

  handleBlur = (ev: React.ChangeEvent<HTMLInputElement>) => {
    // Stop tracking state internally
    this.setState({ text: null })
    
    // Only change if different
    const value = ev.target.value || null
    if (value !== this.props.value) {
      this.props.onChange(value)
    }
  }

  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: ev.target.value })
  }

  render() {
    return (
      <input 
        className="form-control"
        type="text"
        placeholder={this.props.placeholder}
        disabled={this.props.disabled}
        value={ this.state.text != null ? this.state.text : this.props.value || "" }
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
      />
    )
  }
}