import _ from 'lodash'
import React, { CSSProperties } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, Expr } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import Async from 'react-select/lib/Async'
import { QueryOptions, Database } from "../../../database/Database";
import { InstanceCtx, getFilteredContextVarValues } from '../../../contexts';

/** Dropdown filter that is a text string. Should search in database for matches */
export default class TextInstance extends React.Component<{
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: any
  database: Database
  onChange: (value: any) => void
  locale: string
  instanceCtx: InstanceCtx
}> {

  getOptions = async (input: string) => {
    const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId)!
    const table = contextVar.table!
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    const whereExprs: Expr[] = []

    // Add context var value to only show possible text values. Do not filter on other
    // filters, as this causes problems due to https://github.com/JedWatson/react-select/issues/4012
    // as well as needing to exclude self-filters
    const cvValue = this.props.instanceCtx.contextVarValues[contextVar.id]
    if (cvValue) {
      whereExprs.push(cvValue)
    }

    // Filter by input string
    whereExprs.push({
      type: "op",
      op: "~*",
      table: table,
      exprs: [
        this.props.blockDef.filterExpr,
        { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
      ]
    })
    
    const queryOptions: QueryOptions = {
      select: { value: this.props.blockDef.filterExpr },
      distinct: true,
      from: table,
      where: {
        type: "op",
        op: "and",
        table: table,
        exprs: whereExprs
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
      control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
      menuPortal: (style: CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    return <Async 
      placeholder={localize(this.props.blockDef.placeholder, this.props.locale)}
      value={currentValue}
      defaultOptions={true}
      cacheOptions={window["xyzzy"]}
      loadOptions={this.getOptions}
      onChange={this.handleChange}
      isClearable={true}
      noOptionsMessage={noOptionsMessage}
      styles={styles}
      classNamePrefix="react-select-short" 
      menuPortalTarget={document.body}
    />
  }
}