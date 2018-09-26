import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from "../../propertyEditors";
import { Expr, Column } from "mwater-expressions";
import { ExprComponent } from "mwater-expressions-ui";
import { Select, Checkbox } from "react-library/lib/bootstrap";
import { localize } from "../../localization";

export interface ControlBlockDef extends BlockDef {
  /** Row context variable id */
  rowContextVarId: string | null

  /** Column id that control is controlling */
  column: string | null

  /** True if value is required */
  required: boolean
}

export abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {

  abstract renderControl(props: { value: any, onChange: (value: any) => void, locale: string }): React.ReactElement<any>

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  abstract renderControlEditor(props: RenderEditorProps): React.ReactElement<any> | null

  /** Filter the columns that this control is for */
  abstract filterColumn(column: Column): boolean

  renderDesign(props: RenderDesignProps) {
    // Simply render empty control
    return (
      <div>
        { this.renderRequired() }
        { this.renderControl({ value: null, onChange: () => { return }, locale: props.locale }) }
      </div>
    ) 
  }

  renderRequired() {
    return this.blockDef.required ? <div className="required-control">*</div> : null
  }

  renderInstance(props: RenderInstanceProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)

    const handleChange = (newValue: T | null) => {
      console.warn("TODO")
    }

    // Get current value
    const value = props.getContextVarExprValue(this.blockDef.rowContextVarId!, { type: "field", table: contextVar!.table!, column: this.blockDef.column! })

    return (
      <div>
        { this.renderRequired() }
        { this.renderControl({ value: value, onChange: handleChange, locale: props.locale}) }
      </div>
    )
  }

  renderEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)

    return (
      <div>
        <LabeledProperty label="Context Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="rowContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { contextVar ?
          <LabeledProperty label="Column">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="column">
              {(value, onChange) => {
                const columnOptions = props.schema.getColumns(contextVar.table!)
                  .filter(c => this.filterColumn(c))
                  .map(c => ({ value: c.id, label: localize(c.name) }))
                return <Select value={value} onChange={onChange} nullLabel="Select column" options={columnOptions}/>
              }}
            </PropertyEditor>
          </LabeledProperty>
          : null }

        <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="required">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Required</Checkbox>}
        </PropertyEditor>
        
        {this.renderControlEditor(props)}
      </div>
    )
  }

  getContextVarExprs(contextVar: ContextVar): Expr[] { 
    if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
      return [
        { type: "id", table: contextVar.table!},
        { type: "field", table: contextVar.table!, column: this.blockDef.column },
      ]
    }
    else {
      return []
    }
  }

  /** Determine if block is valid. null means valid, string is error message. Does not validate children */
  validate(options: ValidateBlockOptions) {
    // Validate row
    const rowCV = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId && cv.type === "row")
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