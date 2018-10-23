import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar, ValidatableInstance } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors";
import { Expr, Column, Schema } from "mwater-expressions";
import { Select, Checkbox } from "react-library/lib/bootstrap";
import { localize, LocalizedString } from "../../localization";

export interface ControlBlockDef extends BlockDef {
  /** Row context variable id */
  rowContextVarId: string | null

  /** Column id that control is controlling */
  column: string | null

  /** True if value is required */
  required: boolean

  /** Message to display if required is true and control is blank */
  requiredMessage?: LocalizedString
}

export interface RenderControlProps {
  value: any
  locale: string
  schema: Schema

  /** Context variable. Can be undefined in design mode */
  rowContextVar?: ContextVar

  /** True if control should be disabled */
  disabled: boolean

  onChange: (value: any) => void
}

export abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {

  abstract renderControl(props: RenderControlProps): React.ReactElement<any>

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  abstract renderControlEditor(props: RenderEditorProps): React.ReactElement<any> | null

  /** Filter the columns that this control is for */
  abstract filterColumn(column: Column): boolean

  renderDesign(props: RenderDesignProps) {
    const renderControlProps: RenderControlProps = {
      value: null, 
      rowContextVar: props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
      onChange: () => { return }, 
      locale: props.locale,
      schema: props.schema,
      disabled: false
    }
    
    return <ControlInstance renderControlProps={renderControlProps} block={this}/>      
  }

  renderInstance(props: RenderInstanceProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)!

    const id = props.getContextVarExprValue(this.blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    // Get current value
    const value = props.getContextVarExprValue(this.blockDef.rowContextVarId!, { type: "field", table: contextVar!.table!, column: this.blockDef.column! })

    const handleChange = async (newValue: T | null) => {
      // Update database
      const txn = props.database.transaction()
      await txn.updateRow(contextVar.table!, id, { [this.blockDef.column!]: newValue })
      await txn.commit()
    }

    const renderControlProps: RenderControlProps = {
      value: value,
      onChange: handleChange,
      schema: props.schema,
      locale: props.locale,
      rowContextVar: contextVar,
      disabled: id == null
    }

    return <ControlInstance renderControlProps={renderControlProps} block={this}/>      
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

        { this.blockDef.required ?
          <LabeledProperty label="Required Message">
            <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="requiredMessage">
              {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
            </PropertyEditor>
          </LabeledProperty>
        : null }

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

    if (this.blockDef.required && !this.blockDef.requiredMessage) {
      return "Required message required"
    }

    return null
  }
}

interface Props {
  block: ControlBlock<ControlBlockDef>
  renderControlProps: RenderControlProps
}

class ControlInstance extends React.Component<Props> implements ValidatableInstance {
  /** Validate the instance. Returns null if correct, message if not */
  validate = () => {
    // Check for null
    if (this.props.renderControlProps.value == null && this.props.block.blockDef.required) {
      return localize(this.props.block.blockDef.requiredMessage!, this.props.renderControlProps.locale)
    }
    return null
  }

  renderRequired() {
    return this.props.block.blockDef.required ? <div className="required-control">*</div> : null
  }

  render() {
    return (
      <div>
        { this.renderRequired() }
        { this.props.block.renderControl(this.props.renderControlProps) }
      </div>
    )
  }
} 