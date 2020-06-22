import React, { CSSProperties } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, EnumValue } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import ReactSelect from "react-select"

export default class EnumsetInstance extends React.Component<{
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: any
  onChange: (value: any) => void
  locale: string
}> {

  render() {
    const enumValues = this.props.blockDef.filterExpr ? new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr) : null

    // Get selected values as enum values
    const selectedValues = enumValues && this.props.value ? this.props.value.map((v: any) => enumValues.find(ev => ev.id == v)) : null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, this.props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (evs: EnumValue[] | null) => this.props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null)

    // Make minimum size to fit text TODO just max for now
    const minWidth = 400 //Math.min(300, Math.max(selectedValue ? getOptionLabel(selectedValue).length * 8 + 90 : 0, 150))

    const styles = {
      control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
      menuPortal: (style: CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    return <ReactSelect
      value={selectedValues} 
      isMulti={true}
      onChange={handleChange}
      options={enumValues || undefined}
      placeholder={localize(this.props.blockDef.placeholder, this.props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isClearable={true}
      styles={styles}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      classNamePrefix="react-select-short" 
    />
  }
}
