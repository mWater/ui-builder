import _ from 'lodash'
import React, { CSSProperties } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import Async from 'react-select/lib/Async'
import { QueryOptions, Database } from "../../../database/Database";
import { Styles } from 'react-select/lib/styles';

/** Styles for react-select */
const dropdownStyles: Partial<Styles> = { 
  // Keep menu above other controls
  menu: style => ({ ...style, zIndex: 2000 }),
  menuPortal: style => ({ ...style, zIndex: 2000 }),
  control: style => ({ ...style, minHeight: 34, height: 34 }),
  valueContainer: style => ({ ...style, top: -2 })
}

/** Dropdown filter that is a text string. Should search in database for matches */
export default class TextInstance extends React.Component<{
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: any
  database: Database
  onChange: (value: any) => void
  locale: string
}> {

  getOptions = async (input: string) => {
    const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId)!
    const table = contextVar.table!
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    
    const queryOptions: QueryOptions = {
      select: { value: this.props.blockDef.filterExpr },
      distinct: true,
      from: table,
      where: {
        type: "op",
        op: "~*",
        table: table,
        exprs: [
          this.props.blockDef.filterExpr,
          { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
        ]
      },
      orderBy: [{ expr: this.props.blockDef.filterExpr, dir: "asc" }],
      limit: 250
    }

    try {
      const rows = await this.props.database.query(queryOptions, this.props.contextVars, {})
      
      // Filter null and blank
      const values = rows.map(r => r.value).filter(v => v)
      return values.map(v => ({ value: v, label: v}))
    } catch (err) {
      // TODO localize
      alert("Unable to load options")
      return []
    }
  }

  handleChange = (option: any) => {
    const value = option ? (option.value || null) : null // Blank is null
    this.props.onChange(value)
  }

  render() {
    const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null

    // Make minimum size to fit text
    const minWidth = Math.min(300, Math.max(this.props.value ? this.props.value.length * 8 + 90 : 0, 150))

    const noOptionsMessage = () => "Type to search"
    const styles = {
      ...dropdownStyles,
      control: (style: CSSProperties) => ({ ...style, minHeight: 34, height: 34, minWidth: minWidth }),
    }

    return <Async 
      placeholder={localize(this.props.blockDef.placeholder, this.props.locale)}
      value={currentValue}
      defaultOptions={true}
      cacheOptions={null}
      loadOptions={this.getOptions}
      onChange={this.handleChange}
      isClearable={true}
      noOptionsMessage={noOptionsMessage}
      styles={styles}
    />
  }
}