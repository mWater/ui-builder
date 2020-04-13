import { BlockDef, ContextVar } from "../../blocks";
import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors";
import { Expr, Column, Schema, DataSource, LocalizedString } from "mwater-expressions";
import { Select, Checkbox } from "react-library/lib/bootstrap";
import { localize } from "../../localization";
import { Database } from "../../../database/Database";
import { DataSourceDatabase } from "../../../database/DataSourceDatabase";
import { DesignCtx, InstanceCtx } from "../../../contexts";
import { FormatLocaleObject } from "d3-format";
import { getScrollParent } from "../../scrolling";

/** Definition for a control which is a widget that edits a single column */
export interface ControlBlockDef extends BlockDef {
  /** Row context variable id */
  rowContextVarId: string | null

  /** Column id that control is controlling */
  column: string | null

  /** True if value is required */
  required: boolean

  /** Message to display if required is true and control is blank */
  requiredMessage?: LocalizedString | null
}

export interface RenderControlProps {
  value: any
  locale: string
  database: Database
  schema: Schema
  dataSource?: DataSource

  /** Context variable. Can be undefined in design mode */
  rowContextVar?: ContextVar

  contextVars: ContextVar[]
  contextVarValues: { [contextVarId: string]: any }

  /** True if control should be disabled */
  disabled: boolean

  onChange: (value: any) => void

  /** Locale object to use for formatting */
  formatLocale?: FormatLocaleObject
}

/** Abstract class for a control such as a dropdown, text field, etc that operates on a single column */
export abstract class ControlBlock<T extends ControlBlockDef> extends LeafBlock<T> {

  abstract renderControl(props: RenderControlProps): React.ReactElement<any>

  /** Implement this to render any editor parts that are not selecting the basic row cv and column */
  abstract renderControlEditor(props: DesignCtx): React.ReactElement<any> | null

  /** Filter the columns that this control is for */
  abstract filterColumn(column: Column): boolean

  renderDesign(designCtx: DesignCtx) {
    const renderControlProps: RenderControlProps = {
      value: null, 
      rowContextVar: designCtx.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
      onChange: () => { return }, 
      locale: designCtx.locale,
      database: new DataSourceDatabase(designCtx.schema, designCtx.dataSource),
      schema: designCtx.schema,
      dataSource: designCtx.dataSource,
      disabled: false,
      contextVars: designCtx.contextVars,
      contextVarValues: {},
      formatLocale: designCtx.formatLocale
    }
    
    return this.renderControl(renderControlProps)
  }

  renderInstance(props: InstanceCtx) {
    return <ControlInstance instanceCtx={props} block={this}/>      
  }

  /** Allow subclasses to clear/update other fields on the column changing */
  processColumnChanged(blockDef: T): T {
    // Default does nothing
    return blockDef
  }

  renderEditor(props: DesignCtx) {
    const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId)

    const handleColumnChanged = (blockDef: T) => {
      props.store.replaceBlock(this.processColumnChanged(blockDef))
    }

    return (
      <div>
        <LabeledProperty label="Context Variable">
          <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="rowContextVarId">
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

        <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="required">
          {(value, onChange) => <Checkbox value={value} onChange={onChange}>Required</Checkbox>}
        </PropertyEditor>

        { this.blockDef.required ?
          <LabeledProperty label="Required Message">
            <PropertyEditor obj={this.blockDef} onChange={props.store.replaceBlock} property="requiredMessage">
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
  validate(options: DesignCtx): string | null {
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

interface Props {
  block: ControlBlock<ControlBlockDef>
  instanceCtx: InstanceCtx
}

interface State {
  updating: boolean

  /** Message if a required error is present. null for no error */
  requiredError: string | null
}

class ControlInstance extends React.Component<Props, State> {
  controlRef: React.RefObject<HTMLDivElement>

  /** Function to call to unregister validation */
  unregisterValidation: () => void

  constructor(props: Props) {
    super(props)

    this.controlRef = React.createRef()

    this.state = {
      updating: false,
      requiredError: null
    }
  }

  componentDidMount() {
    this.unregisterValidation = this.props.instanceCtx.registerForValidation(this.validate)
  }

  componentWillUnmount() {
    this.unregisterValidation()
  }

  getValue() {
    const instanceCtx = this.props.instanceCtx
    const blockDef = this.props.block.blockDef
    const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!

    // Get current value
    return instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, { type: "field", table: contextVar!.table!, column: blockDef.column! })
  }

  /** Validate the instance. Returns null if correct, message if not */
  validate = (isFirstError: boolean) => {
    // Check for null
    if (this.getValue() == null && this.props.block.blockDef.required) {
      this.setState({ requiredError: this.props.block.blockDef.requiredMessage ? localize(this.props.block.blockDef.requiredMessage, this.props.instanceCtx.locale) : "" })

      // Scroll into view if first error
      if (isFirstError && this.controlRef.current && this.controlRef.current.scrollIntoView) {
        this.controlRef.current.scrollIntoView(true)

        // Add some padding
        const scrollParent = getScrollParent(this.controlRef.current)
        if (scrollParent)
          scrollParent.scrollBy(0, -30)
      }

      return ""
    }
    else {
      this.setState({ requiredError: null })
      return null
    }
  }

  handleChange = async (newValue: any) => {
    const instanceCtx = this.props.instanceCtx
    const blockDef = this.props.block.blockDef
    const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!
    const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    // Update database
    this.setState({ updating: true })
    try {
      const txn = this.props.instanceCtx.database.transaction()
      await txn.updateRow(contextVar.table!, id, { [blockDef.column!]: newValue })
      await txn.commit()
    } catch (err) {
      // TODO localize
      alert("Unable to save changes: " + err.message)
      console.error(err.message)
    } finally {
      this.setState({ updating: false })
    }
  }

  render() {
    const instanceCtx = this.props.instanceCtx
    const blockDef = this.props.block.blockDef
    const contextVar = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowContextVarId)!
    const id = instanceCtx.getContextVarExprValue(blockDef.rowContextVarId!, { type: "id", table: contextVar!.table! })

    const renderControlProps: RenderControlProps = {
      value: this.getValue(),
      onChange: this.handleChange,
      schema: this.props.instanceCtx.schema,
      dataSource: this.props.instanceCtx.dataSource,
      database: this.props.instanceCtx.database,
      locale: this.props.instanceCtx.locale,
      rowContextVar: contextVar,
      disabled: id == null,
      contextVars: this.props.instanceCtx.contextVars,
      contextVarValues: this.props.instanceCtx.contextVarValues
    }

    const style: React.CSSProperties = {
      opacity: this.state.updating ? 0.6 : undefined
    }

    // Add red border if required
    if (this.state.requiredError) {
      style.border = "1px solid rgb(169, 68, 66)",
      style.padding = 3
      style.backgroundColor = "rgb(169, 68, 66)"
    }

    return (
      <div>
        <div style={style} ref={this.controlRef} key="control">
          { this.props.block.renderControl(renderControlProps) }
        </div>
        { this.state.requiredError ? 
          <div key="error" className="text-danger">{this.state.requiredError}</div>
        : null}
      </div>
    )
  }
} 