import * as React from 'react';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { NumberInput, Checkbox } from 'react-library/lib/bootstrap';
import { DesignCtx } from '../../../contexts';
import './textbox.css'

export interface TextboxBlockDef extends ControlBlockDef {
  type: "textbox"

  placeholder?: LocalizedString | null

  /** Number of lines in the text box. Default is 1. */
  numLines?: number | null

  /** True to only show edit when focused */
  editOnFocus?: boolean
}

/** Block that is a text input control linked to a specific field */
export class TextboxBlock extends ControlBlock<TextboxBlockDef> {
  renderControl(props: RenderControlProps) {
    return <Textbox
      value={props.value} 
      onChange={props.onChange ? props.onChange : () => {}}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      disabled={props.disabled || !props.onChange}
      numLines={this.blockDef.numLines || undefined}
      editOnFocus={this.blockDef.editOnFocus || false}
      />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx) {
    return (
      <div>
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Number of lines">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="numLines">
            {(value, onChange) => <NumberInput value={value || 1} onChange={onChange} decimal={false} />}
          </PropertyEditor>
        </LabeledProperty>
        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="editOnFocus">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Edit On Focus</Checkbox>}
        </PropertyEditor>
      </div>
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
  numLines?: number
  disabled: boolean
  editOnFocus: boolean
}

/** Text box that updates only on blur */
class Textbox extends React.Component<TextboxProps, { text: string | null, focused: boolean }> {
  constructor(props: TextboxProps) {
    super(props)

    this.state = { text: null, focused: false }
  }

  componentDidUpdate(prevProps: TextboxProps) {
    // If different, override text
    if (prevProps.value !== this.props.value && this.state.text != null) {
      this.setState({ text: this.props.value })
    }
  }

  handleFocus = () => {
    // Start tracking state internally
    this.setState({ text: this.props.value, focused: true })
  }

  handleBlur = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Stop tracking state internally
    this.setState({ text: null, focused: false })
    
    // Only change if different
    const value = ev.target.value || null
    if (value !== this.props.value) {
      this.props.onChange(value)
    }
  }

  handleChange = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({ text: ev.target.value })
  }

  render() {
    if (this.props.numLines && this.props.numLines > 1) {
      return (
        <textarea
          className={ this.props.editOnFocus ? "form-control edit-on-focus" : "form-control" }
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          value={ this.state.text != null ? this.state.text : this.props.value || "" }
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          rows={this.props.numLines}
        />
      )
    }
    return (
      <input 
        className={ this.props.editOnFocus ? "form-control edit-on-focus" : "form-control" }
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