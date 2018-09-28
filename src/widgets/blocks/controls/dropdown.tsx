import * as React from 'react';
import { BlockDef, RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue } from 'mwater-expressions';
import { LocalizedString, localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select"

export interface DropdownBlockDef extends ControlBlockDef {
  type: "dropdown"

  placeholder: LocalizedString
}

export class DropdownBlock extends ControlBlock<DropdownBlockDef> {
  renderControl(props: RenderControlProps) {
    // If can't be rendered due to missing context variable, just show placeholder
    if (!props.rowContextVar || !this.blockDef.column) {
      return <ReactSelect/>
    }

    // Get column
    const column = props.schema.getColumn(props.rowContextVar.table!, this.blockDef.column)!
    if (!column) {
      return <ReactSelect/>
    }

    const enumValues = column.enumValues!
    const enumValue = enumValues.find(ev => ev.id === props.value)

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => props.onChange(ev ? ev.id : null)

    // TODO value null or undefined?
    return <ReactSelect
      value={enumValue} 
      onChange={handleChange}
      options={column.enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
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
    return column.type === "enum" // TODO enumset, id, id[]
  }
}
