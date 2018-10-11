import * as React from 'react';
import LeafBlock from '../LeafBlock'
import { BlockDef, RenderDesignProps, RenderInstanceProps, ValidateBlockOptions, RenderEditorProps, Filter, ContextVar, createExprVariables } from '../blocks'
import { Expr, ExprValidator, Schema, ExprUtils, EnumValue, Variable } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import { LocalizedString, localize } from '../localization';
import ReactSelect from "react-select"

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
    error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum"] })
    if (error) {
      return error
    }

    return null
  }

  renderDesign(props: RenderDesignProps) {
    return this.renderControl({ schema: props.schema, locale: props.locale, contextVars: props.contextVars, value: null, onChange: () => { return }})
  }

  renderInstance(props: RenderInstanceProps): React.ReactElement<any> {
    const table = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId)!.table!
    const filter = props.getFilters(this.blockDef.rowsetContextVarId!).find(f => f.id === this.blockDef.id)
    const value = filter ? filter.memo : null

    const handleChange = (newValue: any) => {
      // Create filter
      const newFilter: Filter = {
        id: this.blockDef.id,
        expr: newValue ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr!, { type: "literal", valueType: "enum", value: newValue }]} : null,
        memo: newValue
      }
      props.setFilter(this.blockDef.rowsetContextVarId!, newFilter)
    }

    return this.renderControl({ schema: props.schema, locale: props.locale, contextVars: props.contextVars, value: value, onChange: handleChange})
  }

  renderControl(options: {
    schema: Schema, 
    locale: string, 
    contextVars: ContextVar[],
    value: any, 
    onChange: (value: any) => void
  }) {
    const enumValues = this.blockDef.filterExpr ? new ExprUtils(options.schema, createExprVariables(options.contextVars)).getExprEnumValues(this.blockDef.filterExpr) : null

    const enumValue = enumValues ? enumValues.find(ev => ev.id === options.value) : null

    const getOptionLabel = (ev: EnumValue) => localize(ev.name, options.locale)
    const getOptionValue = (ev: EnumValue) => ev.id
    const handleChange = (ev: EnumValue | null) => options.onChange(ev ? ev.id : null)

    return <ReactSelect
      value={enumValue} 
      onChange={handleChange}
      options={enumValues || undefined}
      placeholder={localize(this.blockDef.placeholder, options.locale)}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      isClearable={true}
      />
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
                <ExprComponent value={expr} schema={props.schema} dataSource={props.dataSource} onChange={onExprChange} table={rowsetCV.table!} types={["enum"]} />
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
