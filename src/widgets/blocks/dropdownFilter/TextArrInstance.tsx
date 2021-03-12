import _ from 'lodash'
import React, { CSSProperties } from "react";
import { DropdownFilterBlockDef } from "./dropdownFilter";
import { Schema, ExprUtils, Expr } from "mwater-expressions";
import { ContextVar, createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import Async from 'react-select/async'
import { QueryOptions, Database } from "../../../database/Database";
import { InstanceCtx, getFilteredContextVarValues } from '../../../contexts';

/** Dropdown filter that is a text[]. Should search in database for matches, returning value to match */
export default class TextArrInstance extends React.Component<{
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: string | undefined
  database: Database
  onChange: (value: string | undefined) => void
  locale: string
  instanceCtx: InstanceCtx
}> {
  /** Options to be displayed (unfiltered) */
  options: { value: string, label: string }[]

  async loadOptions() {
    const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId)!
    const table = contextVar.table!

    const whereExprs: Expr[] = []

    // Add context var value to only show possible text values. Do not filter on other
    // filters, as this causes problems due to https://github.com/JedWatson/react-select/issues/4012
    // as well as needing to exclude self-filters
    const cvValue = this.props.instanceCtx.contextVarValues[contextVar.id]
    if (cvValue) {
      whereExprs.push(cvValue)
    }

    // Filter out blanks
    whereExprs.push({
      type: "op",
      op: "is not null",
      table: table,
      exprs: [this.props.blockDef.filterExpr]
    })

    // Query all distinct values, which will include possibly more than one copy of each text string, as it
    // can appear in different combinations
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
      limit: 250
    }

    try {
      const rows = await this.props.database.query(queryOptions, this.props.contextVars, {})

      // Flatten and keep distinct
      const values = _.uniq(_.flatten(rows.map(r => r.value))).sort()
      return values.map(v => ({ value: v, label: v }))
    } catch (err) {
      // TODO localize
      alert("Unable to load options")
      return []
    }
  }

  getOptions = async (input: string) => {
    // Load options if not loaded
    if (!this.options) {
      this.options = await this.loadOptions()
    }

    // Filter by input string
    if (input) {
      return this.options.filter(o => o.label.toLowerCase().startsWith(input.toLowerCase()))
    }
    else {
      return this.options
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