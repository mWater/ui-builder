import { BlockDef, ContextVar, Filter } from "../../blocks"
import LeafBlock from "../../LeafBlock"
import React, { useEffect, useRef, useState } from "react"
import {
  LabeledProperty,
  PropertyEditor,
  ContextVarPropertyEditor,
  LocalizedTextPropertyEditor,
  ContextVarAndExprPropertyEditor,
  ContextVarExprPropertyEditor
} from "../../propertyEditors"
import { Expr, Column, Schema, DataSource, LocalizedString } from "mwater-expressions"
import { Select, Checkbox } from "react-library/lib/bootstrap"
import { localize } from "../../localization"
import { Database } from "../../../database/Database"
import { DataSourceDatabase } from "../../../database/DataSourceDatabase"
import { DesignCtx, InstanceCtx } from "../../../contexts"
import { FormatLocaleObject } from "d3-format"
import { getScrollParent } from "../../scrolling"
import { ContextVarExpr } from "../../../ContextVarExpr"
import { CollapsibleComponent } from "../collapsible"
import { useStabilizeFunction, useStabilizeValue } from "../../../hooks"

/** Definition for a control which is a widget that edits a single column */
export interface ControlBlockDef extends BlockDef {
  /** Row context variable id */
  rowContextVarId: string | null

  /** Column id that control is controlling */
  column: string | null

  /** True if value is required */
  required: boolean

  /** Message to display if required is true and control is blank */
  requiredMessage?: LocalizedString | null

  /** Optional expression to make readonly if true */
  readonlyExpr?: ContextVarExpr
}

export interface RenderControlProps {
  /** Value of the control column for the current row */
  value: any

  /** Primary key of the current row */
  rowId: any

  locale: string
  database: Database
  schema: Schema
  dataSource?: DataSource

  /** Context variable. Can be undefined in design mode */
  rowContextVar?: ContextVar

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }

  /** Get any filters set on a rowset context variable. This includes ones set by other blocks */
  getFilters(contextVarId: string): Filter[]

  /** True if control should be disabled. Is disabled if has no value and cannot have one */
  disabled: boolean

  /** True if value is saving */
  saving: boolean

  /** Call with new value. Is undefined if value is readonly */
  onChange?: (value: any) => void

  /** Locale object to use for formatting */
  formatLocale?: FormatLocaleObject

  /** True if in design mode */
  designMode: boolean
}

/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
export abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {
  abstract renderControl(props: RenderControlProps): React.ReactElement<any>

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx): React.ReactElement<any> | null {
    return null
  }

  /** Filter the columns that this control is for */
  abstract filterColumn(column: Column): boolean

  renderDesign(designCtx: DesignCtx) {
    const renderControlProps: RenderControlProps = {
      value: null,
      rowId: null,
      rowContextVar: designCtx.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId),
      onChange: () => {
        return
      },
      locale: designCtx.locale,
      database: new DataSourceDatabase(designCtx.schema, designCtx.dataSource),
      schema: designCtx.schema,
      dataSource: designCtx.dataSource,
      disabled: false,
      getFilters: () => [],
      contextVars: designCtx.contextVars,
      contextVarValues: {},
      formatLocale: designCtx.formatLocale,
      saving: false,
      designMode: true
    }

    return this.renderControl(renderControlProps)
  }

  renderInstance(props: InstanceCtx) {
    return <ControlInstance instanceCtx={props} block={this} />
  }

  /** Allow subclasses to clear/update other fields on the column changing */
  processColumnChanged(blockDef: T): T {
    // Default does nothing
    return blockDef
  }

  renderEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId)

    const handleColumnChanged = (blockDef: T) => {
      props.store.replaceBlock(this.processColumnChanged(blockDef))
    }

    return (
      <div>
        <LabeledProperty label="Context Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowContextVarId">
            {(value, onChange) => (
              <ContextVarPropertyEditor
                value={value}
                onChange={onChange}
                contextVars={props.contextVars}
                types={["row"]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>

        {contextVar ? (
          <LabeledProperty label="Column">
            <PropertyEditor obj={this.blockDef} onChange={handleColumnChanged} property="column">
              {(value, onChange) => {
                const columnOptions = props.schema
                  .getColumns(contextVar.table!)
                  .filter((c) => this.filterColumn(c))
                  .map((c) => ({ value: c.id, label: localize(c.name) }))
                return <Select value={value} onChange={onChange} nullLabel="Select column" options={columnOptions} />
              }}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="required">
          {(value, onChange) => (
            <Checkbox value={value} onChange={onChange}>
              Required
            </Checkbox>
          )}
        </PropertyEditor>

        {this.blockDef.required ? (
          <LabeledProperty label="Required Message">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="requiredMessage">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}

        {this.renderControlEditor(props)}

        <br />

        <CollapsibleComponent label="Optional Readonly Expression" initialCollapsed>
          <LabeledProperty label="Readonly" hint="optional expression that makes read-only if true">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="readonlyExpr">
              {(value, onChange) => (
                <ContextVarExprPropertyEditor
                  schema={props.schema}
                  dataSource={props.dataSource}
                  contextVars={props.contextVars}
                  contextVarExpr={value}
                  onChange={onChange}
                  types={["boolean"]}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        </CollapsibleComponent>
      </div>
    )
  }

  getContextVarExprs(contextVar: ContextVar): Expr[] {
    const exprs: Expr[] = []

    if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
      exprs.push({ type: "id", table: contextVar.table! })
      exprs.push({ type: "field", table: contextVar.table!, column: this.blockDef.column })
    }

    if (this.blockDef.readonlyExpr && this.blockDef.readonlyExpr.contextVarId == contextVar.id) {
      exprs.push(this.blockDef.readonlyExpr.expr)
    }

    return exprs
  }

  /** Determine if block is valid. null means valid, string is error message. Does not validate children */
  validate(options: DesignCtx): string | null {
    // Validate row
    const rowCV = options.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId && cv.type === "row")
    if (!rowCV) {
      return "Row required"
    }

    if (!this.blockDef.column || !options.schema.getColumn(rowCV.table!, this.blockDef.column)) {
      return "Column required"
    }

    if (!this.filterColumn(options.schema.getColumn(rowCV.table!, this.blockDef.column!)!)) {
      return "Valid column required"
    }

    return null
  }
}

interface Props {
  block: ControlBlock<ControlBlockDef>
  instanceCtx: InstanceCtx
}

interface State {
  /** True if mid-saving */
  saving: boolean

  /** Message if a required error is present. null for no error */
  requiredError: string | null
}

/** Instance of the control that does optimistic value changes */
function ControlInstance(props: { block: ControlBlock<ControlBlockDef>; instanceCtx: InstanceCtx }) {
  const { block, instanceCtx } = props
  const blockDef = props.block.blockDef

  const controlRef = useRef<HTMLDivElement>(null)

  const [saving, setSaving] = useState(false)
  const [requiredError, setRequiredError] = useState<string | null>(null)

  function getValue() {
    const contextVar = instanceCtx.contextVars.find((cv) => cv.id === blockDef.rowContextVarId)!

    // Get current value
    return instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, {
      type: "field",
      table: contextVar!.table!,
      column: blockDef.column!
    })
  }

  const value = getValue()

  /** Store local value to update optimistically */
  const [localValue, setLocalValue] = useState<any>(value)

  // Update local value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  /** Validate the instance. Returns null if correct, message if not */
  function validate(isFirstError: boolean) {
    // Check for null
    if (getValue() == null && blockDef.required) {
      setRequiredError(blockDef.requiredMessage ? localize(blockDef.requiredMessage, instanceCtx.locale) : "")

      // Scroll into view if first error
      if (isFirstError && controlRef.current && controlRef.current.scrollIntoView) {
        controlRef.current.scrollIntoView(true)

        // Add some padding
        const scrollParent = getScrollParent(controlRef.current)
        if (scrollParent) scrollParent.scrollBy(0, -30)
      }
      return ""
    } else {
      setRequiredError(null)
      return null
    }
  }

  useEffect(() => {
    return instanceCtx.registerForValidation(validate)
  }, [validate])

  // Provide stable value (important for arrays which change === value)
  const stableValue = useStabilizeValue(localValue)

  // Provide stable onChange function
  const stableOnChange = useStabilizeFunction(async (newValue: any) => {
    // Optimistically update local value
    setLocalValue(newValue)

    const contextVar = instanceCtx.contextVars.find((cv) => cv.id === blockDef.rowContextVarId)!
    const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    // Update database
    setSaving(true)
    try {
      const txn = instanceCtx.database.transaction()
      await txn.updateRow(contextVar.table!, id, { [blockDef.column!]: newValue })
      await txn.commit()
    } catch (err) {
      // Reset value
      setLocalValue(getValue())

      // TODO localize
      alert("Unable to save changes: " + err.message)
      console.error(err.message)
    } finally {
      setSaving(false)
    }
    return
  })

  const contextVar = instanceCtx.contextVars.find((cv) => cv.id === blockDef.rowContextVarId)!
  const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

  const readonly = blockDef.readonlyExpr
    ? instanceCtx.getContextVarExprValue(blockDef.readonlyExpr.contextVarId, blockDef.readonlyExpr.expr)
    : false

  const renderControlProps: RenderControlProps = {
    value: stableValue,
    onChange: readonly || id == null ? undefined : stableOnChange,
    rowId: id,
    schema: instanceCtx.schema,
    dataSource: instanceCtx.dataSource,
    database: instanceCtx.database,
    getFilters: instanceCtx.getFilters,
    locale: instanceCtx.locale,
    rowContextVar: contextVar,
    disabled: id == null,
    contextVars: instanceCtx.contextVars,
    contextVarValues: instanceCtx.contextVarValues,
    saving: saving,
    designMode: false
  }

  const style: React.CSSProperties = {}

  // Add red border if required
  if (requiredError != null) {
    ;(style.border = "1px solid rgb(169, 68, 66)"), (style.padding = 3)
    style.backgroundColor = "rgb(169, 68, 66)"
  }

  return (
    <div>
      <div style={style} ref={controlRef} key="control">
        {block.renderControl(renderControlProps)}
      </div>
      {requiredError ? (
        <div key="error" className="text-danger">
          {requiredError}
        </div>
      ) : null}
    </div>
  )
}
