import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from "../../propertyEditors";
import { Expr, Column } from "mwater-expressions";
import { ExprComponent } from "mwater-expressions-ui";
import { Select } from "react-library/lib/bootstrap";
import { localize } from "../../localization";

interface ControlBlockDef extends BlockDef {
  /** Row context variable id */
  rowContextVarId: string | null

  /** Column id that control is controlling */
  column: string | null
}

abstract class ControlBlock<T> extends LeafBlock<ControlBlockDef> {

  abstract renderControl(props: { value: T | null, onChange: (value: T | null) => void }): React.ReactElement<any>

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  abstract renderControlEditor(props: RenderEditorProps): React.ReactElement<any>

  /** Filter the columns that this control is for */
  abstract filterColumn(column: Column): boolean

  renderDesign(props: RenderDesignProps) {
    // Simply render empty control
    return this.renderControl({ value: null, onChange: () => { return }})
  }

  renderInstance(props: RenderInstanceProps) {
    // Get current value
    // TODO
    return this.renderControl({ value: null, onChange: () => { return }})
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
      </div>
    )
  }

  getContextVarExprs(contextVarId: string): Expr[] { 
    return []
    // let exprs: Expr[] = []

    // if (this.blockDef.rowContextVarId === contextVarId)
    //   return [
    //     { type: }
    //   ]
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