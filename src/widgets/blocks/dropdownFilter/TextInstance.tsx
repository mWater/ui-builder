import _ from "lodash"
import React, { CSSProperties, memo, useCallback, useMemo } from "react"
import { DropdownFilterBlockDef } from "./dropdownFilter"
import { Schema, ExprUtils, Expr } from "mwater-expressions"
import { ContextVar, createExprVariables } from "../../blocks"
import { localize } from "../../localization"
import Async from "react-select/async"
import { QueryOptions, Database } from "../../../database/Database"
import { InstanceCtx, getFilteredContextVarValues } from "../../../contexts"
import { Styles } from "react-select"
import { useStabilizeFunction } from "../../../hooks"

/** Dropdown filter that is a text string. Should search in database for matches */
export default function TextInstance(props: {
  blockDef: DropdownFilterBlockDef
  schema: Schema
  contextVars: ContextVar[]
  value: any
  database: Database
  onChange: (value: any) => void
  locale: string
  instanceCtx: InstanceCtx
}) {
  const getOptions = useStabilizeFunction(async (input: string) => {
    const contextVar = props.contextVars.find((cv) => cv.id === props.blockDef.rowsetContextVarId)!
    const table = contextVar.table!
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

    const whereExprs: Expr[] = []

    // Add context var value to only show possible text values. Do not filter on other
    // filters, as this causes problems due to https://github.com/JedWatson/react-select/issues/4012
    // as well as needing to exclude self-filters
    const cvValue = props.instanceCtx.contextVarValues[contextVar.id]
    if (cvValue) {
      whereExprs.push(cvValue)
    }

    // Filter by input string
    whereExprs.push({
      type: "op",
      op: "~*",
      table: table,
      exprs: [props.blockDef.filterExpr, { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }]
    })

    const queryOptions: QueryOptions = {
      select: { value: props.blockDef.filterExpr },
      distinct: true,
      from: table,
      where: {
        type: "op",
        op: "and",
        table: table,
        exprs: whereExprs
      },
      orderBy: [{ expr: props.blockDef.filterExpr, dir: "asc" }],
      limit: 250
    }

    try {
      const rows = await props.database.query(queryOptions, props.contextVars, {})

      // Filter null and blank
      const values = rows.map((r) => r.value).filter((v) => v)
      return values.map((v) => ({ value: v, label: v }))
    } catch (err) {
      // TODO localize
      alert("Unable to load options")
      return []
    }
  })

  const handleChange = useStabilizeFunction((option: any) => {
    const value = option ? option.value || null : null // Blank is null
    props.onChange(value)
  })

  const currentValue = props.value ? { value: props.value, label: props.value } : null

  // Make minimum size to fit text
  const minWidth = Math.min(300, Math.max(props.value ? props.value.length * 8 + 90 : 0, 150))

  const noOptionsMessage = useCallback(() => "Type to search", [])
  const styles = useMemo<Partial<Styles>>(() => {
    return {
      control: (style: CSSProperties) => ({ ...style, minWidth: minWidth }),
      menuPortal: (style: CSSProperties) => ({ ...style, zIndex: 2000 })
    }
  }, [minWidth])

  return (
    <MemoAsync
      placeholder={localize(props.blockDef.placeholder, props.locale)}
      value={currentValue}
      defaultOptions={true}
      loadOptions={getOptions}
      onChange={handleChange}
      isClearable={true}
      noOptionsMessage={noOptionsMessage}
      styles={styles}
    />
  )
}

const MemoAsync = memo(
  (props: {
    placeholder: string | null
    value: any
    defaultOptions: boolean
    loadOptions: (input: string) => Promise<any>
    onChange: (value: any) => void
    noOptionsMessage: () => string
    styles?: Partial<Styles>
    isClearable: boolean
  }) => {
    return (
      <Async
        placeholder={props.placeholder}
        value={props.value}
        defaultOptions={props.defaultOptions}
        loadOptions={props.loadOptions}
        onChange={props.onChange}
        isClearable={props.isClearable}
        noOptionsMessage={props.noOptionsMessage}
        styles={props.styles}
        classNamePrefix="react-select-short"
        menuPortalTarget={document.body}
      />
    )
  }
)
