import * as React from 'react';
import { BlockDef, RenderEditorProps, ValidateBlockOptions, createExprVariables } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue, Expr, ExprValidator, ExprCompiler, LocalizedString } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor, EnumArrayEditor } from '../../propertyEditors';
import ReactSelect from "react-select"
import { IdLiteralComponent, ExprComponent, FilterExprComponent } from 'mwater-expressions-ui';

export interface DropdownBlockDef extends ControlBlockDef {
  type: "dropdown"

  placeholder: LocalizedString | null

  /** Text expression to display for entries of type id */
  idLabelExpr?: Expr

  /** Filter expression for entries of type id */
  idFilterExpr?: Expr

  /** Values to include (if present, only include them) */
  includeValues?: any[]

  /** Values to exclude (if present, exclude them) */
  excludeValues?: any[]
}

export class DropdownBlock extends ControlBlock<DropdownBlockDef> {
  validate(options: ValidateBlockOptions) {
    let error = super.validate(options)

    if (error) {
      return error
    }

    const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)!
    const column = options.schema.getColumn(contextVar.table!, this.blockDef.column!)!
    if (column.type === "join") {
      if (!this.blockDef.idLabelExpr)  {
        return "Label Expression required"
      }

      const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))

      // Validate expr
      error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: column.join!.toTable, types: ["text"] })
      if (error) {
        return error
      }
    }
    return null
  }

  renderControl(props: RenderControlProps) {
    // If can't be rendered due to missing context variable, just show placeholder
    if (!props.rowContextVar || !this.blockDef.column) {
      return <ReactSelect/>
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
      styles={{ 
        // Keep menu above other controls
        menu: (style) => ({ ...style, zIndex: 2000 }),
        menuPortal: (style) => ({ ...style, zIndex: 2000 })
      }}
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
      styles={{ 
        // Keep menu above other controls
        menu: (style) => ({ ...style, zIndex: 2000 }),
        menuPortal: (style) => ({ ...style, zIndex: 2000 })
      }}
      />
  }

  renderId(props: RenderControlProps, column: Column) {
    const exprCompiler = new ExprCompiler(props.schema)
    const labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" })
    const filterExpr = exprCompiler.compileExpr({ expr: this.blockDef.idFilterExpr || null, tableAlias: "main" })
    
    const idTable = column.join ? column.join.toTable : column.idTable

    // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
    // pick up any changes in a virtual database
    return <IdLiteralComponent
      schema={props.schema}
      dataSource={props.dataSource}
      idTable={idTable!}
      value={props.value}
      onChange={props.onChange}
      labelExpr={labelExpr} 
      filter={filterExpr} />
  }

  renderIds(props: RenderControlProps, column: Column) {
    const exprCompiler = new ExprCompiler(props.schema)
    const labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" })
    const filterExpr = exprCompiler.compileExpr({ expr: this.blockDef.idFilterExpr || null, tableAlias: "main" })
    
    // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
    // pick up any changes in a virtual database
    return <IdLiteralComponent
      schema={props.schema}
      dataSource={props.dataSource}
      idTable={column.idTable!}
      value={props.value}
      onChange={props.onChange}
      multi={true}
      labelExpr={labelExpr} 
      filter={filterExpr} />
  }

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  renderControlEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)
    let column: Column | null = null
    
    if (contextVar && contextVar.table && this.blockDef.column) {
      column = props.schema.getColumn(contextVar.table, this.blockDef.column)
    }

    return (
      <div>
        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
        { column && column.type === "join" ?
          <LabeledProperty label="Label Expression">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="idLabelExpr">
              {(value, onChange) => <ExprComponent 
                value={value} 
                onChange={onChange} 
                schema={props.schema}
                dataSource={props.dataSource}
                types={["text"]}
                table={column!.join!.toTable}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { column && column.type === "join" ?
          <LabeledProperty label="Filter Expression">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="idFilterExpr">
              {(value, onChange) => <FilterExprComponent 
                value={value} 
                onChange={onChange} 
                schema={props.schema}
                dataSource={props.dataSource}
                table={column!.join!.toTable}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
        : null }
        { column && (column.type === "enum" || column.type === "enumset") ?
          <LabeledProperty label="Include Values">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="includeValues">
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
          <LabeledProperty label="Exclude Values">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="excludeValues">
              {(value, onChange) => <EnumArrayEditor 
                value={value} 
                onChange={onChange} 
                enumValues={column!.enumValues!}
                />
              }
            </PropertyEditor>
          </LabeledProperty>
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
