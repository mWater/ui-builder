import AsyncReactSelect from 'react-select/lib/Async'
import { Database } from "../../../database/Database"
import { Expr } from 'mwater-expressions';
import { useState, useCallback, useEffect } from 'react'
import React from 'react'
import { ContextVar } from '../../blocks'

interface SingleProps<T> {
  database: Database
  table: string
  value: T | null
  onChange: (value: T | null) => void

  placeholder?: string

  /** True to select multiple values */
  multi: false

  /** Expression to use for label */
  labelExpr: Expr

  filterExpr?: Expr

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }
}

interface MultiProps<T> {
  database: Database
  table: string
  value: T[] | null
  onChange: (value: T[] | null) => void

  placeholder?: string

  /** True to select multiple values */
  multi: true

  /** Expression to use for label */
  labelExpr: Expr

  filterExpr?: Expr

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }
}

type Props<T> = SingleProps<T> | MultiProps<T>

/** Displays a combo box that allows selecting one text values from an expression */
export function IdDropdownComponent<T>(props: Props<T>) {
  const [currentValue, setCurrentValue] = useState<{ label: string, value: T}>()
  const [loading, setLoading] = useState(false)

  // Load current value
  useEffect(() => {
    if (props.value) {
      setLoading(true)

      const where: Expr = props.multi ? 
        { type: "op", op: "= any", table: props.table, exprs: [
          { type: "id", table: props.table },
          { type: "literal", idTable: props.table, valueType: "id[]", value: props.value }
        ]}
      : 
        { type: "op", op: "=", table: props.table, exprs: [
          { type: "id", table: props.table },
          { type: "literal", idTable: props.table, valueType: "id", value: props.value }
        ]}

      const results = props.database.query({ 
        select: {
          value: { type: "id", table: props.table },
          label: props.labelExpr
        },
        from: props.table,
        where: where
      }, props.contextVars, props.contextVarValues)

      results.then((rows) => {
        if (props.multi) {
          if (rows[0]) {
            setCurrentValue(rows as any)
          }
          else {
            setCurrentValue(undefined)
          }
        }
        else {
          if (rows[0]) {
            setCurrentValue(rows[0] as any)
          }
          else {
            setCurrentValue(undefined)
          }
        }

        setLoading(false)
      }).catch(err => { throw err })
    }
    else {
      setCurrentValue(undefined)
    }
  }, [props.value, props.table, props.multi])

  // Callback that react-select uses to get values
  const loadOptions = useCallback((input: string, callback: any) => {
    // Determine filter expressions
    const filters: Expr[] = []
    if (input) {
      filters.push({
        type: "op", table: props.table, op: "~*", exprs: [
          props.labelExpr,
          { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
        ]
      })
    }
    if (props.filterExpr) {
      filters.push(props.filterExpr)
    }

    // Perform query to get options
    const results = props.database.query({ 
      select: {
        value: { type: "id", table: props.table },
        label: props.labelExpr
      },
      from: props.table,
      where: filters.length > 1 ? { type: "op", table: props.table, op: "and", exprs: filters } : filters[0],
      orderBy: [{ expr: props.labelExpr, dir: "asc" }],
      limit: 50
    }, props.contextVars, props.contextVarValues)

    results.then((rows) => {
      callback(rows)
    })
  }, [props.table, props.labelExpr, props.filterExpr])

  const handleChange = useCallback((value: any) => {
    if (props.multi) {
      props.onChange(value && value.length > 0 ? value.map((v: any) => v.value) : null) 
    } 
    else {
      props.onChange(value ? value.value : null)
    }
  }, [props.onChange])

  return <div style={{ width: "100%", minWidth: 160 }}>
    <AsyncReactSelect
      value={currentValue}
      placeholder={props.placeholder}
      loadOptions={loadOptions}
      isMulti={props.multi}
      isClearable={true}
      isLoading={loading}
      onChange={handleChange}
      noOptionsMessage={() => "Type to search"}
      defaultOptions={true}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      styles={{
        // Keep menu above fixed data table headers and map
        menu: (style) => {
          return _.extend({}, style, {
            zIndex: 2000
          });
        },
        menuPortal: (style) => {
          return _.extend({}, style, {
            zIndex: 2000
          });
        }
      }} />
  </div>
}

/** Escape a regex */
const escapeRegex = (str: string) => str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")