import * as React from 'react';
import LeafBlock from '../../LeafBlock'
import { BlockDef, Filter, ContextVar, createExprVariables } from '../../blocks'
import { Expr, ExprValidator, Schema, ExprUtils, LocalizedString } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import { localize } from '../../localization';
import ReactSelect from "react-select"
import EnumInstance from './EnumInstance';
import TextInstance from './TextInstance';
import DateExprComponent, { toExpr, DateValue } from './DateExprComponent';
import produce from 'immer';
import { DesignCtx, InstanceCtx } from '../../../contexts';
import EnumsetInstance from './EnumsetInstance';

export interface DropdownFilterBlockDef extends BlockDef {
  type: "dropdownFilter"

  /** Placeholder in box */
  placeholder: LocalizedString | null

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Expression to filter on  */
  filterExpr: Expr

  /** Default value of filter */
  defaultValue?: any
}

export class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
  validate(options: DesignCtx) {
    // Validate rowset
    const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset")
    if (!rowsetCV) {
      return "Rowset required"
    }

    if (!this.blockDef.filterExpr) {
      return "Filter expression required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))

    // Validate expr
    let error
    error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "enumset", "text", "date", "datetime"] })
    if (error) {
      return error
    }

    return null
  }

  createFilter(schema: Schema, contextVars: ContextVar[], value: any): Filter {
    const valueType = new ExprUtils(schema, createExprVariables(contextVars)).getExprType(this.blockDef.filterExpr)
    const contextVar = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)!
    const table = contextVar.table!

    switch (valueType) {
      case "enum":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr!, { type: "literal", valueType: "enum", value: value }]} : null,
          memo: value
        }
      case "enumset":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "intersects", exprs: [this.blockDef.filterExpr!, { type: "literal", valueType: "enumset", value: value }]} : null,
          memo: value
        }
      case "text":
        return {
          id: this.blockDef.id,
          expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr!, { type: "literal", valueType: "text", value: value }]} : null,
          memo: value
        }
      case "date":
        return {
          id: this.blockDef.id,
          expr: toExpr(table, this.blockDef.filterExpr!, false, value),
          memo: value
        }
      case "datetime":
        return {
          id: this.blockDef.id,
          expr: toExpr(table, this.blockDef.filterExpr!, true, value),
          memo: value
        }
    }

    throw new Error("Unknown type")
  }

  renderDesign(props: DesignCtx) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const styles = {
      control: (base: React.CSSProperties) => ({ ...base, height: 40, minHeight: 40, minWidth: 150 }),
      // Keep menu above other controls
      menu: (style: React.CSSProperties) => ({ ...style, zIndex: 2000 }),
      menuPortal: (style: React.CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr)

    if (valueType === "date" || valueType === "datetime") {
      // Fake table
      const table = contextVar ? contextVar.table || "" : ""
      const handleSetDefault = (defaultValue: DateValue) => {
        props.store.alterBlock(this.blockDef.id, (bd) => {
          return { ...bd, defaultValue: defaultValue }
        })
      }
      const placeholder = localize(this.blockDef.placeholder, props.locale)
      return (
        <div style={{ padding: 5 }}>
          <DateExprComponent 
            table={table} 
            datetime={valueType === "datetime"} 
            value={this.blockDef.defaultValue} 
            onChange={handleSetDefault} 
            placeholder={placeholder}
            locale={props.locale}/>
        </div>
      )
    }

    return <div style={{ padding: 5 }}><ReactSelect styles={styles}/></div>
  }

  getInitialFilters(contextVarId: string, instanceCtx: InstanceCtx): Filter[] { 
    if (contextVarId == this.blockDef.rowsetContextVarId) {
      if (this.blockDef.defaultValue) {
        return [this.createFilter(instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue)]
      }
    }
    return [] 
  }

  renderInstance(props: InstanceCtx): React.ReactElement<any> {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)!
    const filter = props.getFilters(this.blockDef.rowsetContextVarId!).find(f => f.id === this.blockDef.id)
    const value = filter ? filter.memo : null

    const handleChange = (newValue: any) => {
      // Create filter
      const newFilter = this.createFilter(props.schema, props.contextVars, newValue)
      props.setFilter(contextVar.id, newFilter)
    }

    const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr)
    const placeholder = localize(this.blockDef.placeholder, props.locale)

    let elem: React.ReactElement<any>

    switch (valueType) {
      case "enum":
        elem = <EnumInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "enumset":
        elem = <EnumsetInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "text":
        elem = <TextInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          database={props.database}
          onChange={handleChange}
          locale={props.locale} />
        break
      case "date":
        elem = <DateExprComponent 
          datetime={false} 
          table={contextVar.table!} 
          value={value} 
          onChange={handleChange} 
          placeholder={placeholder}
          locale={props.locale}
         />
        break
      case "datetime":
        elem = <DateExprComponent 
          datetime={true} 
          table={contextVar.table!} 
          value={value} 
          onChange={handleChange} 
          placeholder={placeholder}
          locale={props.locale}
        />
        break
      default:
        elem = <div/>
    }

    return <div style={{ padding: 5 }}>{elem}</div>
  }    

  renderEditor(props: DesignCtx) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    const handleExprChange = (expr: Expr) => {
      props.store.replaceBlock(produce(this.blockDef, (draft) => {
        // Clear default value if expression changes
        draft.filterExpr = expr
        delete draft.defaultValue
      }))
    }

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        {rowsetCV ?
          <LabeledProperty label="Filter expression">
            <ExprComponent 
              value={this.blockDef.filterExpr} 
              schema={props.schema} 
              dataSource={props.dataSource} 
              onChange={handleExprChange} 
              table={rowsetCV.table!} 
              types={["enum", "enumset", "text", "date", "datetime"]} />
          </LabeledProperty>
        : null}

        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
