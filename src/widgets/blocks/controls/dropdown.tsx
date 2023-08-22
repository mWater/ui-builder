import _ from "lodash"
import React from "react"
import { createExprVariables, ContextVar } from "../../blocks"
import { ControlBlock, ControlBlockDef, RenderControlProps } from "./ControlBlock"
import { Column, EnumValue, Expr, ExprValidator, LocalizedString } from "mwater-expressions"
import { localize } from "../../localization"
import {
  LabeledProperty,
  PropertyEditor,
  LocalizedTextPropertyEditor,
  EnumArrayEditor,
  EmbeddedExprsEditor,
  OrderByArrayEditor
} from "../../propertyEditors"
import ReactSelect, { Styles } from "react-select"
import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { IdDropdownComponent } from "./IdDropdownComponent"
import { DesignCtx, InstanceCtx } from "../../../contexts"
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from "../../../embeddedExprs"
import { Database, OrderBy } from "../../../database/Database"
import { Toggle, Select } from "react-library/lib/bootstrap"
import ListEditor from "../../ListEditor"
import { ToggleBlockDef } from "./toggle"
import { memo, useCallback, useMemo } from "react"
import { useStabilizeFunction, useStabilizeValue } from "../../../hooks"

export interface DropdownBlockDef extends ControlBlockDef {
  type: "dropdown"

  placeholder: LocalizedString | null

  /** Filter expression for entries of type id */
  idFilterExpr?: Expr

  /** Values to include (if present, only include them) */
  includeValues?: any[] | null

  /** Values to exclude (if present, exclude them) */
  excludeValues?: any[] | null

  /** There are two modes: simple (just a label expression) and advanced (custom format for label, separate search and order) */
  idMode?: "simple" | "advanced"

  /** Simple mode: Text expression to display for entries of type id */
  idLabelExpr?: Expr

  /** Advanced mode: Label for id selections with {0}, {1}, etc embedded in it */
  idLabelText?: LocalizedString | null

  /** Advanced mode: Expressions embedded in the id label text string. Referenced by {0}, {1}, etc. Context variable is ignored */
  idLabelEmbeddedExprs?: EmbeddedExpr[]

  /** Advanced mode: Text/enum expressions to search on */
  idSearchExprs?: Expr[]

  /** Advanced mode: sort order of results */
  idOrderBy?: OrderBy[] | null

  /** Label for true value if boolean. Default is "Yes" */
  trueLabel?: LocalizedString | null

  /** Label for false value if boolean. Default is "No" */
  falseLabel?: LocalizedString | null
}

export class DropdownBlock extends ControlBlock<DropdownBlockDef> {
  validate(options: DesignCtx) {
    let error = super.validate(options)

    if (error) {
      return error
    }

    const contextVar = options.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId)!
    const column = options.schema.getColumn(contextVar.table!, this.blockDef.column!)!

    if (column.type === "id" || column.type == "id[]" || column.type == "join") {
      const idMode = this.blockDef.idMode || "simple"
      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
      const idTable = column.type == "join" ? column.join!.toTable : column.idTable!

      // Validate filter
      error = exprValidator.validateExpr(this.blockDef.idFilterExpr || null, { table: idTable, types: ["boolean"] })
      if (error) {
        return error
      }

      if (idMode == "simple") {
        if (!this.blockDef.idLabelExpr) {
          return "Label Expression required"
        }

        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.idLabelExpr || null, { table: idTable, types: ["text"] })
        if (error) {
          return error
        }
      } else {
        // Complex mode
        if (!this.blockDef.idLabelText) {
          return "Label required"
        }
        if (!this.blockDef.idLabelEmbeddedExprs || this.blockDef.idLabelEmbeddedExprs.length == 0) {
          return "Label embedded expressions required"
        }
        if (!this.blockDef.idOrderBy || this.blockDef.idOrderBy.length == 0) {
          return "Label order by required"
        }
        if (!this.blockDef.idSearchExprs || this.blockDef.idSearchExprs.length == 0) {
          return "Label search required"
        }

        // Validate embedded expressions
        error = validateEmbeddedExprs({
          embeddedExprs: this.blockDef.idLabelEmbeddedExprs,
          schema: options.schema,
          contextVars: this.generateEmbedContextVars(idTable)
        })

        if (error) {
          return error
        }

        // Validate orderBy
        for (const orderBy of this.blockDef.idOrderBy || []) {
          error = exprValidator.validateExpr(orderBy.expr, { table: idTable })
          if (error) {
            return error
          }
        }

        // Validate search
        for (const searchExpr of this.blockDef.idSearchExprs) {
          if (!searchExpr) {
            return "Search expression required"
          }

          // Validate expr
          error = exprValidator.validateExpr(searchExpr, { table: idTable, types: ["text", "enum", "enumset"] })
          if (error) {
            return error
          }
        }
      }
    }
    return null
  }

  /** Generate a single synthetic context variable to allow embedded expressions to work in label */
  generateEmbedContextVars(idTable: string): ContextVar[] {
    return [{ id: "dropdown-embed", name: "Label", table: idTable, type: "row" }]
  }

  renderControl(props: RenderControlProps) {
    // If can't be rendered due to missing context variable, just show placeholder
    if (!props.rowContextVar || !this.blockDef.column || props.invalid) {
      return (
        <ReactSelect
          menuPortalTarget={document.body}
          classNamePrefix="react-select-short"
          styles={{ menuPortal: (style) => ({ ...style, zIndex: 2000 }) }}
        />
      )
    }

    // Get column
    const column = props.schema.getColumn(props.rowContextVar.table!, this.blockDef.column)!
    if (!column) {
      return (
        <ReactSelect
          menuPortalTarget={document.body}
          classNamePrefix="react-select-short"
          styles={{ menuPortal: (style) => ({ ...style, zIndex: 2000 }) }}
        />
      )
    }

    if (column.type === "enum") {
      return (
        <EnumDropdownInstance
          blockDef={this.blockDef}
          column={column}
          locale={props.locale}
          disabled={props.disabled}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
    if (column.type === "enumset") {
      return (
        <EnumsetDropdownInstance
          blockDef={this.blockDef}
          column={column}
          locale={props.locale}
          disabled={props.disabled}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
    if (column.type === "id") {
      return (
        <IdDropdownInstance
          blockDef={this.blockDef}
          column={column}
          contextVars={props.contextVars}
          contextVarValues={props.contextVarValues}
          database={props.database}
          disabled={props.disabled}
          formatIdLabel={this.formatIdLabel.bind(null, props)}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
    if (column.type === "id[]") {
      return (
        <IdsDropdownInstance
          blockDef={this.blockDef}
          column={column}
          contextVars={props.contextVars}
          contextVarValues={props.contextVarValues}
          database={props.database}
          disabled={props.disabled}
          formatIdLabel={this.formatIdLabel.bind(null, props)}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
    if (column.type === "boolean") {
      return this.renderBoolean(props, column)
    }
    // Dropdowns support n-1 and 1-1 joins as well as id columns
    if (column.type === "join" && (column.join!.type === "n-1" || column.join!.type === "1-1")) {
      return (
        <IdDropdownInstance
          blockDef={this.blockDef}
          column={column}
          contextVars={props.contextVars}
          contextVarValues={props.contextVarValues}
          database={props.database}
          disabled={props.disabled}
          formatIdLabel={this.formatIdLabel.bind(null, props)}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
    throw new Error("Unsupported type")
  }

  formatIdLabel = (ctx: RenderControlProps, labelValues: any[]): string => {
    if (this.blockDef.idMode == "advanced") {
      return formatEmbeddedExprString({
        text: localize(this.blockDef.idLabelText, ctx.locale),
        contextVars: [],
        embeddedExprs: this.blockDef.idLabelEmbeddedExprs!,
        exprValues: labelValues,
        formatLocale: ctx.formatLocale,
        locale: ctx.locale,
        schema: ctx.schema
      })
    } else {
      return labelValues[0]
    }
  }

  renderBoolean(props: RenderControlProps, column: Column) {
    console.log(props.value)
    return (
      <Select
        options={[
          { value: true, label: localize(this.blockDef.trueLabel) || "Yes" },
          { value: false, label: localize(this.blockDef.falseLabel) || "No" }
        ]}
        value={props.value}
        onChange={props.onChange}
        nullLabel={""}
      />
    )
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId)
    let column: Column | null = null

    if (contextVar && contextVar.table && this.blockDef.column) {
      column = props.schema.getColumn(contextVar.table, this.blockDef.column)
    }

    const isIdType = column && (column.type == "id" || column.type == "id[]" || column.type == "join")
    const idMode = this.blockDef.idMode || "simple"
    const idTable = column ? column.idTable : null
    const isBooleanType = column && column.type == "boolean"

    const handleConvertToToggle = () => {
      props.store.replaceBlock({
        id: this.blockDef.id,
        type: "toggle",
        column: this.blockDef.column,
        required: this.blockDef.required,
        requiredMessage: this.blockDef.requiredMessage,
        rowContextVarId: this.blockDef.rowContextVarId,
        includeValues: this.blockDef.includeValues,
        excludeValues: this.blockDef.excludeValues
      } as ToggleBlockDef)
    }

    return (
      <div>
        <LabeledProperty label="Placeholder" key="placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => (
              <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
            )}
          </PropertyEditor>
        </LabeledProperty>
        {isIdType ? (
          <LabeledProperty label="Mode" key="mode">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idMode">
              {(value, onChange) => (
                <Toggle
                  value={value || "simple"}
                  onChange={onChange}
                  options={[
                    { value: "simple", label: "Simple" },
                    { value: "advanced", label: "Advanced" }
                  ]}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {isIdType && idMode == "simple" ? (
          <LabeledProperty label="Label Expression" key="idLabelExpr">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelExpr">
              {(value, onChange) => (
                <ExprComponent
                  value={value || null}
                  onChange={onChange}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  types={["text"]}
                  table={idTable!}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {isIdType && idMode == "advanced" ? (
          <div>
            <LabeledProperty label="Label" key="idLabelText">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelText">
                {(value, onChange) => (
                  <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />
                )}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty
              label="Embedded label expressions"
              help="Reference in text as {0}, {1}, etc."
              key="idLabelEmbeddedExprs"
            >
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelEmbeddedExprs">
                {(value: EmbeddedExpr[] | null | undefined, onChange) => (
                  <EmbeddedExprsEditor
                    value={value}
                    onChange={onChange}
                    schema={props.schema}
                    dataSource={props.dataSource}
                    contextVars={this.generateEmbedContextVars(idTable!)}
                  />
                )}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Option ordering" key="idOrderBy">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idOrderBy">
                {(value, onChange) => (
                  <OrderByArrayEditor
                    value={value || []}
                    onChange={onChange}
                    schema={props.schema}
                    dataSource={props.dataSource}
                    contextVars={props.contextVars}
                    table={idTable!}
                  />
                )}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Search expressions" key="idSearchExprs">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idSearchExprs">
                {(value, onItemsChange) => {
                  const handleAddSearchExpr = () => {
                    onItemsChange((value || []).concat(null))
                  }
                  return (
                    <div>
                      <ListEditor items={value || []} onItemsChange={onItemsChange}>
                        {(expr: Expr, onExprChange) => (
                          <ExprComponent
                            value={expr}
                            schema={props.schema}
                            dataSource={props.dataSource}
                            onChange={onExprChange}
                            table={idTable!}
                            types={["text", "enum", "enumset"]}
                            variables={createExprVariables(props.contextVars)}
                          />
                        )}
                      </ListEditor>
                      <button type="button" className="btn btn-link btn-sm" onClick={handleAddSearchExpr}>
                        + Add Expression
                      </button>
                    </div>
                  )
                }}
              </PropertyEditor>
            </LabeledProperty>
          </div>
        ) : null}
        {isIdType ? (
          <LabeledProperty label="Filter Expression" key="idFilterExpr">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idFilterExpr">
              {(value, onChange) => (
                <FilterExprComponent
                  value={value}
                  onChange={onChange}
                  schema={props.schema}
                  dataSource={props.dataSource}
                  table={idTable!}
                  variables={createExprVariables(props.contextVars)}
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {column && (column.type === "enum" || column.type === "enumset") ? (
          <LabeledProperty label="Include Values" key="includeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="includeValues">
              {(value, onChange) => (
                <EnumArrayEditor value={value} onChange={onChange} enumValues={column!.enumValues!} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {column && (column.type === "enum" || column.type === "enumset") ? (
          <LabeledProperty label="Exclude Values" key="excludeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="excludeValues">
              {(value, onChange) => (
                <EnumArrayEditor value={value} onChange={onChange} enumValues={column!.enumValues!} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {!isIdType ? (
          <div key="convert_to_toggle">
            <button className="btn btn-link btn-sm" onClick={handleConvertToToggle}>
              Convert to Toggle
            </button>
          </div>
        ) : null}
        {isBooleanType ? (
          <LabeledProperty label="Label for true" key="trueLabel" hint="Must be set to allow localization">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="trueLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor
                  value={value}
                  onChange={onChange}
                  locale={props.locale}
                  placeholder="Yes"
                />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
        {isBooleanType ? (
          <LabeledProperty label="Label for false" key="falseLabel" hint="Must be set to allow localization">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="falseLabel">
              {(value, onChange) => (
                <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} placeholder="No" />
              )}
            </PropertyEditor>
          </LabeledProperty>
        ) : null}
      </div>
    )
  }

  /** Filter the columns that this control is for. Can't be expression */
  filterColumn(column: Column) {
    if (column.expr) {
      return false
    }

    return (
      column.type === "enum" ||
      column.type === "enumset" ||
      column.type === "id" ||
      column.type === "id[]" ||
      column.type == "boolean" ||
      (column.type == "join" && (column.join!.type === "n-1" || column.join!.type === "1-1"))
    )
  }
}

const EnumDropdownInstance = memo(
  (props: {
    blockDef: DropdownBlockDef
    column: Column
    locale: string
    disabled: boolean
    value: any
    onChange?: (value: any) => void
  }) => {
    const { column, blockDef } = props

    const enumValues = useMemo(() => {
      let result = column.enumValues!

      // Handle include/exclude
      if (blockDef.includeValues && blockDef.includeValues.length > 0) {
        result = result.filter((ev) => blockDef.includeValues!.includes(ev.id))
      }
      if (blockDef.excludeValues && blockDef.excludeValues.length > 0) {
        result = result.filter((ev) => !blockDef.excludeValues!.includes(ev.id))
      }
      return result
    }, [column.enumValues, blockDef])

    // Lookup enumvalue
    const enumValue = enumValues.find((ev) => ev.id === props.value) || null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = useCallback(
      (ev: EnumValue | null) => {
        if (props.onChange) {
          props.onChange(ev ? ev.id : null)
        }
      },
      [props.onChange]
    )

    return (
      <ReactSelect
        value={enumValue}
        onChange={handleChange}
        options={enumValues}
        placeholder={localize(blockDef.placeholder, props.locale)}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        isDisabled={props.disabled || !props.onChange}
        isClearable={true}
        closeMenuOnScroll={true}
        menuPortalTarget={document.body}
        classNamePrefix="react-select-short"
        styles={{ menuPortal: (style) => ({ ...style, zIndex: 2000 }) }}
      />
    )
  }
)

const EnumsetDropdownInstance = memo(
  (props: {
    blockDef: DropdownBlockDef
    column: Column
    locale: string
    disabled: boolean
    value: any
    onChange?: (value: any) => void
  }) => {
    const { column, blockDef } = props

    const enumValues = useMemo(() => {
      let result = column.enumValues!

      // Handle include/exclude
      if (blockDef.includeValues && blockDef.includeValues.length > 0) {
        result = result.filter((ev) => blockDef.includeValues!.includes(ev.id))
      }
      if (blockDef.excludeValues && blockDef.excludeValues.length > 0) {
        result = result.filter((ev) => !blockDef.excludeValues!.includes(ev.id))
      }
      return result
    }, [column.enumValues, blockDef])

    // Map value to array
    let value: EnumValue[] | null = null
    if (props.value) {
      value = _.compact(props.value.map((v: any) => enumValues.find((ev) => ev.id === v)))
    }

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = useCallback(
      (evs: EnumValue[] | null) => {
        if (props.onChange) {
          props.onChange(evs && evs.length > 0 ? evs.map((ev) => ev.id) : null)
        }
      },
      [props.onChange]
    )

    return (
      <ReactSelect
        value={value}
        onChange={handleChange}
        options={enumValues}
        placeholder={localize(blockDef.placeholder, props.locale)}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        isDisabled={props.disabled || !props.onChange}
        isClearable={true}
        isMulti={true}
        closeMenuOnScroll={true}
        menuPortalTarget={document.body}
        classNamePrefix="react-select-short"
        styles={{ menuPortal: (style) => ({ ...style, zIndex: 2000 }) }}
      />
    )
  }
)

function IdDropdownInstance(props: {
  blockDef: DropdownBlockDef
  column: Column
  database: Database
  disabled: boolean
  formatIdLabel: (labelValues: any[]) => string
  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }
  value: any
  onChange?: (value: any) => void
}) {
  const { column, blockDef } = props

  const labelEmbeddedExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced"
      ? (blockDef.idLabelEmbeddedExprs || []).map((ee) => ee.expr)
      : [blockDef.idLabelExpr!]
  }, [blockDef])

  const searchExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced" ? blockDef.idSearchExprs! || [] : [blockDef.idLabelExpr!]
  }, [blockDef])

  const orderBy: OrderBy[] = useMemo(() => {
    return blockDef.idMode == "advanced" ? blockDef.idOrderBy! || [] : [{ expr: blockDef.idLabelExpr!, dir: "asc" }]
  }, [blockDef])

  // Dropdowns support n-1 and 1-1 joins as well as id columns
  const idTable = column.type == "join" ? column.join!.toTable : column.idTable!

  const styles = useMemo<Partial<Styles>>(() => {
    return { menuPortal: (style) => ({ ...style, zIndex: 2000 }) }
  }, [])

  // Stabilize functions and values
  const onChange = useStabilizeFunction(props.onChange)
  const formatIdLabel = useStabilizeFunction(props.formatIdLabel)
  const contextVars = useStabilizeValue(props.contextVars)
  const contextVarValues = useStabilizeValue(props.contextVarValues)
  const value = useStabilizeValue(props.value)

  return (
    <IdDropdownComponent
      database={props.database}
      table={idTable}
      value={value}
      onChange={onChange}
      multi={false}
      labelEmbeddedExprs={labelEmbeddedExprs}
      searchExprs={searchExprs}
      orderBy={orderBy}
      filterExpr={blockDef.idFilterExpr || null}
      formatLabel={formatIdLabel}
      contextVars={contextVars}
      contextVarValues={contextVarValues}
      styles={styles}
    />
  )
}

function IdsDropdownInstance(props: {
  blockDef: DropdownBlockDef
  column: Column
  database: Database
  disabled: boolean
  formatIdLabel: (labelValues: any[]) => string
  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }
  value: any
  onChange?: (value: any) => void
}) {
  const { column, blockDef } = props

  const labelEmbeddedExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced"
      ? (blockDef.idLabelEmbeddedExprs || []).map((ee) => ee.expr)
      : [blockDef.idLabelExpr!]
  }, [blockDef])

  const searchExprs: Expr[] = useMemo(() => {
    return blockDef.idMode == "advanced" ? blockDef.idSearchExprs! || [] : [blockDef.idLabelExpr!]
  }, [blockDef])

  const orderBy: OrderBy[] = useMemo(() => {
    return blockDef.idMode == "advanced" ? blockDef.idOrderBy! || [] : [{ expr: blockDef.idLabelExpr!, dir: "asc" }]
  }, [blockDef])

  const styles = useMemo<Partial<Styles>>(() => {
    return { menuPortal: (style) => ({ ...style, zIndex: 2000 }) }
  }, [])

  // Stabilize functions and values
  const onChange = useStabilizeFunction(props.onChange)
  const formatIdLabel = useStabilizeFunction(props.formatIdLabel)
  const contextVars = useStabilizeValue(props.contextVars)
  const contextVarValues = useStabilizeValue(props.contextVarValues)
  const value = useStabilizeValue(props.value)

  return (
    <IdDropdownComponent
      database={props.database}
      table={column.idTable!}
      value={value}
      onChange={onChange}
      multi={true}
      labelEmbeddedExprs={labelEmbeddedExprs}
      searchExprs={searchExprs}
      orderBy={orderBy}
      filterExpr={blockDef.idFilterExpr || null}
      formatLabel={formatIdLabel}
      contextVars={contextVars}
      contextVarValues={contextVarValues}
      styles={styles}
    />
  )
}
