import _ from "lodash"
import ReactSelect from "react-select"
import { Database, OrderBy, QueryOptions, useDatabaseChangeListener } from "../../../database/Database"
import { Expr } from "mwater-expressions"
import { useState, useCallback, useEffect, memo } from "react"
import React from "react"
import { ContextVar } from "../../blocks"
import { Styles } from "react-select"

export interface SingleProps<T> {
  database: Database
  table: string
  value: T | null
  onChange?: (value: T | null) => void

  placeholder?: string

  /** True to select multiple values */
  multi: false

  /** Format the label given the label values */
  formatLabel: (labelValues: any[]) => string

  /** Expressions which are embedded in the label as {0}, {1}... */
  labelEmbeddedExprs: Expr[]

  /** Text/enum expressions to search on */
  searchExprs: Expr[]

  /** Sort order of results */
  orderBy: OrderBy[]

  /** Optional filter on options */
  filterExpr?: Expr

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }

  /** Styling for react-select */
  styles?: Partial<Styles>
}

export interface MultiProps<T> {
  database: Database
  table: string
  value: T[] | null
  onChange?: (value: T[] | null) => void

  placeholder?: string

  /** True to select multiple values */
  multi: true

  /** Format the label given the label values */
  formatLabel: (labelValues: any[]) => string

  /** Expressions which are embedded in the label as {0}, {1}... */
  labelEmbeddedExprs: Expr[]

  /** Text/enum expressions to search on */
  searchExprs: Expr[]

  /** Sort order of results */
  orderBy: OrderBy[]

  /** Optional filter on options */
  filterExpr?: Expr

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }

  /** Optional styling for react-select */
  styles?: Partial<Styles>
}

export type Props<T> = SingleProps<T> | MultiProps<T>

/** One option of the control */
export interface Option<T> {
  /** Values of parts of the label */
  labelValues: string[]
  id: T
}

/** Displays a combo box that allows selecting one id value from a list */
function IdDropdownComponent<T>(props: Props<T>) {
  const [currentValue, setCurrentValue] = useState<Option<T> | Option<T>[]>()
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<Option<T>[]>([])

  // Keep track of latest input value to ensure options are latest
  const inputValueRef = React.useRef(inputValue)
  inputValueRef.current = inputValue

  // Increment when database is changed
  const refreshTrigger = useDatabaseChangeListener(props.database)

  /** Creates an option from a query row that is in form { id:, label0:, label1:, ...} */
  const rowToOption = (row: any) => {
    const value: Option<T> = { id: row.id, labelValues: [] }
    for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
      value.labelValues[i] = row[`label${i}`]
    }
    return value
  }

  // Load current value
  useEffect(() => {
    if (props.value) {
      setLoading(true)

      const where: Expr = props.multi
        ? {
            type: "op",
            op: "= any",
            table: props.table,
            exprs: [
              { type: "id", table: props.table },
              { type: "literal", idTable: props.table, valueType: "id[]", value: props.value }
            ]
          }
        : {
            type: "op",
            op: "=",
            table: props.table,
            exprs: [
              { type: "id", table: props.table },
              { type: "literal", idTable: props.table, valueType: "id", value: props.value }
            ]
          }

      const query: QueryOptions = {
        select: {
          id: { type: "id", table: props.table }
        },
        from: props.table,
        where: where
      }

      // Add label exprs
      for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
        query.select[`label${i}`] = props.labelEmbeddedExprs[i]
      }

      const results = props.database.query(query, props.contextVars, props.contextVarValues)

      results
        .then((rows) => {
          if (props.multi) {
            if (rows[0]) {
              setCurrentValue(rows.map((r) => rowToOption(r)))
            } else {
              setCurrentValue(undefined)
            }
          } else {
            if (rows[0]) {
              setCurrentValue(rowToOption(rows[0]))
            } else {
              setCurrentValue(undefined)
            }
          }

          setLoading(false)
        })
        .catch((err) => {
          throw err
        })
    } else {
      setCurrentValue(undefined)
    }
  }, [props.value, props.table, props.multi, refreshTrigger])

  // Callback that react-select uses to get values
  const loadOptions = useCallback(
    (input: string) => {
      // Determine filter expressions
      const filters: Expr[] = []
      if (input) {
        const orFilter: Expr = {
          type: "op",
          table: props.table,
          op: "or",
          exprs: props.searchExprs.map((se) => ({
            type: "op",
            table: props.table,
            op: "~*",
            exprs: [se, { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }]
          }))
        }
        filters.push(orFilter)
      }
      if (props.filterExpr) {
        filters.push(props.filterExpr)
      }

      // Perform query to get options
      const query: QueryOptions = {
        select: {
          id: { type: "id", table: props.table }
        },
        from: props.table,
        where: filters.length > 1 ? { type: "op", table: props.table, op: "and", exprs: filters } : filters[0],
        orderBy: props.orderBy,
        limit: 50
      }

      // Add label exprs
      for (let i = 0; i < props.labelEmbeddedExprs.length; i++) {
        query.select[`label${i}`] = props.labelEmbeddedExprs[i]
      }

      const results = props.database.query(query, props.contextVars, props.contextVarValues)

      results.then((rows) => {
        // If not stale, set options
        if (inputValueRef.current == input) {
          setOptions(rows.map((r) => rowToOption(r)))
        }
      })
    },
    [props.table, props.filterExpr]
  )

  useEffect(() => {
    loadOptions(inputValue)
  }, [inputValue, refreshTrigger])

  const handleChange = useCallback(
    (option: any) => {
      if (!props.onChange) {
        return
      }

      if (props.multi) {
        props.onChange(option && option.length > 0 ? option.map((v: Option<T>) => v.id) : null)
      } else {
        props.onChange(option ? option.id : null)
      }
    },
    [props.onChange]
  )

  const getOptionLabel = useCallback(
    (option: Option<T>) => {
      return props.formatLabel(option.labelValues)
    },
    [props.formatLabel]
  )

  const getOptionValue = useCallback((option: Option<T>) => {
    return option.id + ""
  }, [])

  // Filtering is done by query
  const filterOption = useCallback(() => true, [])

  return (
    <div style={{ width: "100%", minWidth: 160 }}>
      <ReactSelect
        inputValue={inputValue}
        onInputChange={setInputValue}
        value={currentValue}
        placeholder={props.placeholder}
        isMulti={props.multi}
        isClearable={true}
        isLoading={loading}
        onChange={props.onChange ? handleChange : undefined}
        options={loading ? [] : options}
        filterOption={filterOption}
        isDisabled={!props.onChange}
        noOptionsMessage={() => "..."}
        closeMenuOnScroll={true}
        menuPortalTarget={document.body}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        classNamePrefix="react-select-short"
        styles={props.styles}
      />
    </div>
  )
}

/** Escape a regex */
const escapeRegex = (str: string) => str.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")

// Memoize for speed
const MemoIdDropdownComponent = memo(IdDropdownComponent)
export { MemoIdDropdownComponent as IdDropdownComponent }
