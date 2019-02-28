import * as React from 'react';
import LeafBlock from '../../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, Filter, ContextVar, createExprVariables } from '../../blocks'
import { Expr, ExprValidator, Schema, ExprUtils } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import { LocalizedString, localize } from '../../localization';
import ReactSelect from "react-select"
import EnumInstance from './EnumInstance';
import TextInstance from './TextInstance';
import DateExprComponent, { toExpr } from './DateExprComponent';

export interface DropdownFilterBlockDef extends BlockDef {
  type: "dropdownFilter"

  /** Placeholder in box */
  placeholder: LocalizedString | null

  /** Id of context variable of rowset for table to use */
  rowsetContextVarId: string | null

  /** Expression to filter on  */
  filterExpr: Expr
}

export class DropdownFilterBlock extends LeafBlock<DropdownFilterBlockDef> {
  validate(options: ValidateBlockOptions) {
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
    error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "text", "date", "datetime"] })
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

  renderDesign(props: RenderDesignProps) {
    const styles = {
      control: (base: React.CSSProperties) => ({ ...base, height: 34, minHeight: 34 }),
      // Keep menu above other controls
      menu: (style: React.CSSProperties) => ({ ...style, zIndex: 2000 })
    }

    const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr)

    if (valueType === "date" || valueType === "datetime") {
      const doNothing = () => null
      const placeholder = localize(this.blockDef.placeholder, props.locale)
      return (
        <div style={{ padding: 5 }}>
          <DateExprComponent table="" datetime={valueType === "datetime"} value={null} onChange={doNothing} placeholder={placeholder}/>
        </div>
      )
    }

    return <div style={{ padding: 5 }}><ReactSelect styles={styles}/></div>
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
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
        elem = <DateExprComponent datetime={false} table={contextVar.table!} value={value} onChange={handleChange} placeholder={placeholder}/>
        break
      case "datetime":
        elem = <DateExprComponent datetime={true} table={contextVar.table!} value={value} onChange={handleChange} placeholder={placeholder}/>
        break
      default:
        elem = <div/>
    }

    return <div style={{ padding: 5 }}>{elem}</div>
  }    

  renderEditor(props: RenderEditorProps) {
    // Get rowset context variable
    const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)

    return (
      <div>
        <LabeledProperty label="Rowset">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="rowsetContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>

        {rowsetCV ?
          <LabeledProperty label="Filter expression">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="filterExpr">
              {(expr: Expr, onExprChange) => (
                <ExprComponent value={expr} schema={props.schema} dataSource={props.dataSource} onChange={onExprChange} table={rowsetCV.table!} types={["enum", "text", "date", "datetime"]} />
              )}
            </PropertyEditor>
          </LabeledProperty>
        : null}

        <LabeledProperty label="Placeholder">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="placeholder">
            {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
          </PropertyEditor>
        </LabeledProperty>
      </div>
    )
  }
}
