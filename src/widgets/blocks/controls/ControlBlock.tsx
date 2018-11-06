import { BlockDef, RenderDesignProps, RenderInstanceProps, RenderEditorProps, ValidateBlockOptions, ContextVar, ValidatableInstance } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors";
import { Expr, Column, Schema, DataSource } from "mwater-expressions";
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
  dataSource: DataSource

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
      dataSource: props.dataSource,
      disabled: false
    }
    
    return (
      <div>
        {this.blockDef.required ? <div className="required-control">*</div> : null}
        {this.renderControl(renderControlProps)}
      </div>
    )
  }

  renderInstance(props: RenderInstanceProps) {
    return <ControlInstance renderInstanceProps={props} block={this}/>      
  }

  /** Allow subclasses to clear/update other fields on the column changing */
  processColumnChanged(blockDef: T): T {
    // Default does nothing
    return blockDef
  }

  renderEditor(props: RenderEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)

    const handleColumnChanged = (blockDef: T) => {
      props.onChange(this.processColumnChanged(blockDef))
    }

    return (
      <div>
        <LabeledProperty label="Context Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.onChange} property="rowContextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { contextVar ?
          <LabeledProperty label="Column">
            <PropertyEditor obj={this.blockDef} onChange={handleColumnChanged} property="column">
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
  validate(options: ValidateBlockOptions): string | null {
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
  renderInstanceProps: RenderInstanceProps
}

interface State {
  updating: boolean
}

class ControlInstance extends React.Component<Props, State> implements ValidatableInstance {
  constructor(props: Props) {
    super(props)
    this.state = {
      updating: false
    }
  }

  getValue() {
    const renderInstanceProps = this.props.renderInstanceProps
    const blockDef = this.props.block.blockDef
    const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!

    // Get current value
    return renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId!, { type: "field", table: contextVar!.table!, column: blockDef.column! })
  }

  /** Validate the instance. Returns null if correct, message if not */
  validate = () => {
    // Check for null
    if (this.getValue() == null && this.props.block.blockDef.required) {
      return localize(this.props.block.blockDef.requiredMessage!, this.props.renderInstanceProps.locale)
    }
    return null
  }

  handleChange = async (newValue: any) => {
    const renderInstanceProps = this.props.renderInstanceProps
    const blockDef = this.props.block.blockDef
    const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!
    const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    // Update database
    this.setState({ updating: true })
    try {
      const txn = this.props.renderInstanceProps.database.transaction()
      await txn.updateRow(contextVar.table!, id, { [blockDef.column!]: newValue })
      await txn.commit()
      // TODO error handling
    } finally {
      this.setState({ updating: false })
    }
  }

  renderRequired() {
    return this.props.block.blockDef.required ? <div className="required-control">*</div> : null
  }

  render() {
    const renderInstanceProps = this.props.renderInstanceProps
    const blockDef = this.props.block.blockDef
    const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!
    const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    const renderControlProps: RenderControlProps = {
      value: this.getValue(),
      onChange: this.handleChange,
      schema: this.props.renderInstanceProps.schema,
      dataSource: this.props.renderInstanceProps.dataSource,
      locale: this.props.renderInstanceProps.locale,
      rowContextVar: contextVar,
      disabled: id == null
    }

    return (
      <div style={{ opacity: this.state.updating ? 0.6 : undefined }}>
        { this.renderRequired() }
        { this.props.block.renderControl(renderControlProps) }
      </div>
    )
  }
} 