import _ from 'lodash'
import * as React from 'react';
import { BlockDef, createExprVariables, ContextVar } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue, Expr, ExprValidator, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor, EnumArrayEditor, EmbeddedExprsEditor, OrderByArrayEditor } from '../../propertyEditors';
import ReactSelect from "react-select"
import { ExprComponent, FilterExprComponent } from 'mwater-expressions-ui';
import { IdDropdownComponent } from './IdDropdownComponent';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import { EmbeddedExpr, validateEmbeddedExprs, formatEmbeddedExprString } from '../../../embeddedExprs';
import { OrderBy } from '../../../database/Database';
import { Toggle } from 'react-library/lib/bootstrap';
import ListEditor from '../../ListEditor';
import { Styles } from 'react-select/lib/styles';
import { ToggleBlockDef } from './toggle';

/** Styles for react-select */
const dropdownStyles: Partial<Styles> = { 
  // Keep menu above other controls
  menu: style => ({ ...style, zIndex: 2000 }),
  menuPortal: style => ({ ...style, zIndex: 2000 }),
  control: style => ({ ...style, minHeight: 34, height: 34 }),
  valueContainer: style => ({ ...style, top: -2 })
}

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
  idLabelText: LocalizedString | null

  /** Advanced mode: Expressions embedded in the id label text string. Referenced by {0}, {1}, etc. Context variable is ignored */
  idLabelEmbeddedExprs?: EmbeddedExpr[] 

  /** Advanced mode: Text/enum expressions to search on */
  idSearchExprs?: Expr[]

  /** Advanced mode: sort order of results */
  idOrderBy?: OrderBy[] | null
}

export class DropdownBlock extends ControlBlock<DropdownBlockDef> {
  validate(options: DesignCtx) {
    let error = super.validate(options)

    if (error) {
      return error
    }

    const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)!
    const column = options.schema.getColumn(contextVar.table!, this.blockDef.column!)!

    if (column.type === "join") {
      const idMode = this.blockDef.idMode || "simple"
      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
      const idTable = column.join!.toTable

      if (idMode == "simple") {
        if (!this.blockDef.idLabelExpr)  {
          return "Label Expression required"
        }

        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.idLabelExpr || null, { table: idTable, types: ["text"] })
        if (error) {
          return error
        }
      }
      else {
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
    return [
      { id: "dropdown-embed", name: "Label", table: idTable, type: "row" }
    ]
  }

  renderControl(props: RenderControlProps) {
    // If can't be rendered due to missing context variable, just show placeholder
    if (!props.rowContextVar || !this.blockDef.column) {
      // TODO height
      return <ReactSelect
        styles={{ 
          // Keep menu above other controls
          menu: (style) => ({ ...style, zIndex: 2000 }),
          menuPortal: (style) => ({ ...style, zIndex: 2000 }),
          control: style => ({ ...style, minHeight: 34, height: 34 })
        }} />
    }

    // Get column
    const column = props.schema.getColumn(props.rowContextVar.table!, this.blockDef.column)!
    if (!column) {
      return <ReactSelect/>
    }

    if (column.type === "enum") {
      return this.renderEnum(props, column)
    }
    if (column.type === "enumset") {
      return this.renderEnumset(props, column)
    }
    if (column.type === "id") {
      return this.renderId(props, column)
    }
    if (column.type === "id[]") {
      return this.renderIds(props, column)
    }
    if (column.type === "join" && column.join!.type === "n-1") {
      return this.renderId(props, column)
    }
    throw new Error("Unsupported type")
  }

  renderEnum(props: RenderControlProps, column: Column) {
    var enumValues = column.enumValues!

    // Handle include/exclude
    if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
      enumValues = enumValues.filter(ev => this.blockDef.includeValues!.includes(ev.id))
    }
    if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
      enumValues = enumValues.filter(ev => !this.blockDef.excludeValues!.includes(ev.id))
    }

    // Lookup enumvalue
    const enumValue = enumValues.find(ev => ev.id === props.value) || null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => props.onChange(ev ? ev.id : null)

    return <ReactSelect
      value={enumValue} 
      onChange={handleChange}
      options={enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      styles={dropdownStyles}
      />
  }

  renderEnumset(props: RenderControlProps, column: Column) {
    var enumValues = column.enumValues!

    // Handle include/exclude
    if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
      enumValues = enumValues.filter(ev => this.blockDef.includeValues!.includes(ev.id))
    }
    if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
      enumValues = enumValues.filter(ev => !this.blockDef.excludeValues!.includes(ev.id))
    }

    // Map value to array
    let value: EnumValue[] | null = null
    if (props.value) {
      value = _.compact(props.value.map((v: any) => enumValues.find(ev => ev.id === v)))
    }

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (evs: EnumValue[] | null) => {
      props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null)
    }

    return <ReactSelect
      value={value} 
      onChange={handleChange}
      options={enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
      isMulti={true}
      closeMenuOnScroll={true}
      menuPortalTarget={document.body}
      styles={dropdownStyles}
      />
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
    }
    else {
      return labelValues[0]
    }
  }

  renderId(props: RenderControlProps, column: Column) {
    const idTable = column.join ? column.join.toTable : column.idTable

    let labelEmbeddedExprs: Expr[]
    let searchExprs: Expr[]
    let orderBy: OrderBy[]

    // Handle modes
    if (this.blockDef.idMode == "advanced") {
      labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
      searchExprs = this.blockDef.idSearchExprs! || []
      orderBy = this.blockDef.idOrderBy! || []
    }
    else {
      labelEmbeddedExprs = [this.blockDef.idLabelExpr!]
      searchExprs = [this.blockDef.idLabelExpr!]
      orderBy = [{ expr: this.blockDef.idLabelExpr!, dir: "asc" }]
    }

    return <IdDropdownComponent
      database={props.database}
      table={idTable!}
      value={props.value}
      onChange={props.onChange}
      multi={false}
      labelEmbeddedExprs={labelEmbeddedExprs}
      searchExprs={searchExprs}
      orderBy={orderBy}
      filterExpr={this.blockDef.idFilterExpr || null}
      formatLabel={this.formatIdLabel.bind(null, props)}
      contextVars={props.contextVars}
      contextVarValues={props.contextVarValues}
      styles={dropdownStyles} />
  }

  renderIds(props: RenderControlProps, column: Column) {
    let labelEmbeddedExprs: Expr[]
    let searchExprs: Expr[]
    let orderBy: OrderBy[]

    // Handle modes
    if (this.blockDef.idMode == "advanced") {
      labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
      searchExprs = this.blockDef.idSearchExprs! || []
      orderBy = this.blockDef.idOrderBy! || []
    }
    else {
      labelEmbeddedExprs = [this.blockDef.idLabelExpr!]
      searchExprs = [this.blockDef.idLabelExpr!]
      orderBy = [{ expr: this.blockDef.idLabelExpr!, dir: "asc" }]
    }

    return <IdDropdownComponent
      database={props.database}
      table={column.idTable!}
      value={props.value}
      onChange={props.onChange}
      multi={true}
      labelEmbeddedExprs={labelEmbeddedExprs}
      searchExprs={searchExprs}
      orderBy={orderBy}
      filterExpr={this.blockDef.idFilterExpr || null}
      formatLabel={this.formatIdLabel.bind(null, props)}
      contextVars={props.contextVars}
      contextVarValues={props.contextVarValues} />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)
    let column: Column | null = null
    
    if (contextVar && contextVar.table && this.blockDef.column) {
      column = props.schema.getColumn(contextVar.table, this.blockDef.column)
    }

    const isIdType = column && (column.type === "join" || column.type == "id" || column.type == "id[]")
    const idMode = this.blockDef.idMode || "simple"
    const idTable = column && column.join ? column.join.toTable : (column ? column.idTable : null)

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
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        { isIdType ?
          <LabeledProperty label="Mode" key="mode">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idMode">
              {(value, onChange) => 
                <Toggle 
                  value={value || "simple"} 
                  onChange={onChange} 
                  options={[
                    { value: "simple", label: "Simple" },
                    { value: "advanced", label: "Advanced" }
                  ]} />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { isIdType && idMode == "simple" ?
          <LabeledProperty label="Label Expression" key="idLabelExpr">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelExpr">
              {(value, onChange) => <ExprComponent 
                value={value || null} 
                onChange={onChange} 
                schema={props.schema}
                dataSource={props.dataSource}
                types={["text"]}
                table={idTable!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { isIdType && idMode == "advanced" ?
          <div>
            <LabeledProperty label="Label" key="idLabelText">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelText">
                {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Embedded label expressions" help="Reference in text as {0}, {1}, etc." key="idLabelEmbeddedExprs">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idLabelEmbeddedExprs">
                {(value: EmbeddedExpr[] | null | undefined, onChange) => (
                  <EmbeddedExprsEditor 
                    value={value} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource}
                    contextVars={this.generateEmbedContextVars(idTable!)} />
                )}
              </PropertyEditor>
            </LabeledProperty>
            <LabeledProperty label="Option ordering" key="idOrderBy">
              <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idOrderBy">
                {(value, onChange) => 
                  <OrderByArrayEditor 
                    value={value || []} 
                    onChange={onChange} 
                    schema={props.schema} 
                    dataSource={props.dataSource} 
                    contextVars={props.contextVars}
                    table={idTable!} /> }
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
                        { (expr: Expr, onExprChange) => (
                          <ExprComponent value={expr} schema={props.schema} dataSource={props.dataSource} onChange={onExprChange} table={idTable!} types={["text", "enum", "enumset"]} />
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
        : null }
        { isIdType ?
          <LabeledProperty label="Filter Expression" key="idFilterExpr">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="idFilterExpr">
              {(value, onChange) => <FilterExprComponent 
                value={value} 
                onChange={onChange} 
                schema={props.schema}
                dataSource={props.dataSource}
                table={idTable!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { column && (column.type === "enum" || column.type === "enumset") ?
          <LabeledProperty label="Include Values" key="includeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="includeValues">
              {(value, onChange) => <EnumArrayEditor 
                value={value} 
                onChange={onChange} 
                enumValues={column!.enumValues!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { column && (column.type === "enum" || column.type === "enumset") ?
          <LabeledProperty label="Exclude Values" key="excludeValues">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="excludeValues">
              {(value, onChange) => <EnumArrayEditor 
                value={value} 
                onChange={onChange} 
                enumValues={column!.enumValues!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { !isIdType ? 
          <div key="convert_to_toggle">
            <button className="btn btn-link btn-sm" onClick={handleConvertToToggle}>Convert to Toggle</button>
          </div>
        : null }
      </div>
    )
  }

  /** Filter the columns that this control is for. Can't be expression */
  filterColumn(column: Column) {
    if (column.expr) {
      return false
    }

    return column.type === "enum" 
      || column.type === "enumset" 
      || column.type === "id" 
      || column.type === "id[]" 
      || (column.type === "join" && column.join!.type === "n-1")
  }
}