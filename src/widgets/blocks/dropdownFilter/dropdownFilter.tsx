import * as React from 'react';
import LeafBlock from '../../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, Filter, ContextVar, createExprVariables } from '../../blocks'
import { Expr, ExprValidator, Schema, ExprUtils } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import { LocalizedString } from '../../localization';
import ReactSelect from "react-select"
import EnumInstance from './EnumInstance';
import TextInstance from './TextInstance';

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
    error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "text"] })
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
    }

    throw new Error("Unknown type")
  }

  renderDesign(props: RenderDesignProps) {
    return <ReactSelect/>
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)!
    const filter = props.getFilters(this.blockDef.rowsetContextVarId!).find(f => f.id === this.blockDef.id)
    const value = filter ? filter.memo : null

    const handleChange = (newValue: any) => {
      console.error(newValue)
      // Create filter
      const newFilter = this.createFilter(props.schema, props.contextVars, newValue)
      props.setFilter(contextVar.id, newFilter)
    }

    const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr)

    switch (valueType) {
      case "enum":
        return <EnumInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          onChange={handleChange}
          locale={props.locale} />
      case "text":
        return <TextInstance 
          blockDef={this.blockDef}
          schema={props.schema}
          contextVars={props.contextVars}
          value={value}
          database={props.database}
          onChange={handleChange}
          locale={props.locale} />
      }

    return <ReactSelect/>
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
                <ExprComponent value={expr} schema={props.schema} dataSource={props.dataSource} onChange={onExprChange} table={rowsetCV.table!} types={["enum", "text"]} />
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
