import * as React from 'react';
import { BlockDef, RenderEditorProps } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue } from 'mwater-expressions';
import { LocalizedString, localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select"

export interface DropdownBlockDef extends ControlBlockDef {
  type: "dropdown"

  placeholder: LocalizedString | null
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

    switch (column.type) {
      case "enum":
        return this.renderEnum(props, column)
      case "enumset":
        return this.renderEnumset(props, column)
    }
    throw new Error("Unsupported type")
  }

  renderEnum(props: RenderControlProps, column: Column) {
    const enumValues = column.enumValues!
    const enumValue = enumValues.find(ev => ev.id === props.value) || null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => props.onChange(ev ? ev.id : null)

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

  renderEnumset(props: RenderControlProps, column: Column) {
    const enumValues = column.enumValues!

    // Map value to array
    let value: EnumValue[] | null = null
    if (props.value) {
      value = _.compact(props.value.map((v: any) => enumValues.find(ev => ev.id === v)))
    }

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (evs: EnumValue[] | null) => {
      props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null)
    }

    return <ReactSelect
      value={value} 
      onChange={handleChange}
      options={column.enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
      isMulti={true}
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

  /** Filter the columns that this control is for. Can't be expression */
  filterColumn(column: Column) {
    if (column.expr) {
      return false
    }

    return column.type === "enum" || column.type === "enumset" // TODO enumset, id, id[]
  }
}
