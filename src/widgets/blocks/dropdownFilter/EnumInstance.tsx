import React, { CSSProperties } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, EnumValue } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import ReactSelect from "react-select"
import { Styles } from "react-select/lib/styles";

/** Styles for react-select */
const dropdownStyles: Partial<Styles> = { 
  // Keep menu above other controls
  menu: style => ({ ...style, zIndex: 2000 }),
  menuPortal: style => ({ ...style, zIndex: 2000 }),
  control: style => ({ ...style, minHeight: 34, height: 34 }),
  valueContainer: style => ({ ...style, top: -2 })
}

export default class EnumInstance extends React.Component<{
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: any
  onChange: (value: any) => void
  locale: string
}> {

  render() {
    const enumValues = this.props.blockDef.filterExpr ? new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr) : null

    const enumValue = enumValues ? enumValues.find(ev => ev.id === this.props.value) : null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, this.props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => this.props.onChange(ev ? ev.id : null)

    // Make minimum size to fit text
    const minWidth = Math.min(300, Math.max(enumValue ? getOptionLabel(enumValue).length * 8 + 90 : 0, 150))

    const styles = {
      ...dropdownStyles,
      control: (style: CSSProperties) => ({ ...style, minHeight: 34, height: 34, minWidth: minWidth }),
    }

    return <ReactSelect
      value={enumValue} 
      onChange={handleChange}
      options={enumValues || undefined}
      placeholder={localize(this.props.blockDef.placeholder, this.props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isClearable={true}
      styles={styles}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      />
  }
}
