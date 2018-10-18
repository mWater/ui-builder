import React from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, EnumValue } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import ReactSelect from "react-select"

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
    const styles = {
      control: (base: React.CSSProperties) => ({ ...base, height: 34, minHeight: 34 })
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
      />
  }
}
