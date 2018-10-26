import * as React from 'react';
import { BlockDef, RenderEditorProps, ValidateBlockOptions, createExprVariables } from '../../blocks';
import { ControlBlock, ControlBlockDef, RenderControlProps } from './ControlBlock';
import { Column, EnumValue, Expr, ExprValidator, ExprCompiler } from 'mwater-expressions';
import { LocalizedString, localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select"
import { IdLiteralComponent, ExprComponent, FilterExprComponent } from 'mwater-expressions-ui';

export interface DropdownBlockDef extends ControlBlockDef {
  type: "dropdown"

  placeholder: LocalizedString | null

  /** Text expression to display for entries of type id */
  idLabelExpr?: Expr

  /** Filter expression for entries of type id */
  idFilterExpr?: Expr
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
    if (column.type === "join" && column.join!.type === "n-1") {
      return this.renderId(props, column)
    }
    throw new Error("Unsupported type")
  }

  renderEnum(props: RenderControlProps, column: Column) {
    const enumValues = column.enumValues!
    const enumValue = enumValues.find(ev => ev.id === props.value) || null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => props.onChange(ev ? ev.id : null)

    return <ReactSelect
      value={enumValue} 
      onChange={handleChange}
      options={column.enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
      />
  }

  renderEnumset(props: RenderControlProps, column: Column) {
    const enumValues = column.enumValues!

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
      options={column.enumValues}
      placeholder={localize(this.blockDef.placeholder, props.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isDisabled={props.disabled}
      isClearable={true}
      isMulti={true}
      />
  }

  renderId(props: RenderControlProps, column: Column) {
    const exprCompiler = new ExprCompiler(props.schema)
    const labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" })
    const filterExpr = exprCompiler.compileExpr({ expr: this.blockDef.idFilterExpr || null, tableAlias: "main" })
    
    // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
    // pick up any changes in a virtual database
    return <IdLiteralComponent
      schema={props.schema}
      dataSource={props.dataSource}
      idTable={column.join!.toTable}
      value={props.value}
      onChange={props.onChange}
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
      </div>
    )
  }

  /** Filter the columns that this control is for. Can't be expression */
  filterColumn(column: Column) {
    if (column.expr) {
      return false
    }

    return column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join!.type === "n-1")
  }
}
