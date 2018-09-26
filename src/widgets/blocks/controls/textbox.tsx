import * as React from 'react';
import { BlockDef, RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef } from './ControlBlock';
import { Column } from 'mwater-expressions';
import { LocalizedString, localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';

export interface TextboxBlockDef extends ControlBlockDef {
  type: "textbox"

  placeholder: LocalizedString
}

export class TextboxBlock extends ControlBlock<TextboxBlockDef> {
  renderControl(props: { value: any, onChange: (value: any) => void, locale: string }) {
    const handleChange = (v: string) => props.onChange(v || null)

    return <Textbox
      value={props.value as (string | null) || ""} 
      onChange={handleChange}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
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
  value: string
  onChange: (value: string) => void
  placeholder?: string
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

  handleFocus = (ev: React.ChangeEvent<HTMLInputElement>) => {
    // Start tracking state internally
    this.setState({ text: this.props.value })
  }

  handleBlur = (ev: React.ChangeEvent<HTMLInputElement>) => {
    // Stop tracking state internally
    this.setState({ text: null })
    
    this.props.onChange(ev.target.value)
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
        value={ this.state.text != null ? this.state.text : this.props.value }
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onChange={this.handleChange}
      />
    )
  }
}