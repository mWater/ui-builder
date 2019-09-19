import * as React from "react";
import {v4 as uuid} from 'uuid'
import { LabeledProperty, PropertyEditor, TableSelect } from "../widgets/propertyEditors"
import { WidgetDef } from "../widgets/widgets";
import { ContextVar } from "../widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
import { localize } from "../widgets/localization";
import { produce } from "immer";
import { ExprComponent, IdLiteralComponent } from "mwater-expressions-ui";
import ListEditor from "../widgets/ListEditor";
import * as _ from "lodash";
import { TextInput, Select } from "react-library/lib/bootstrap";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";

interface WidgetEditorProps {
  widgetDef: WidgetDef
  schema: Schema
  dataSource: DataSource
  onWidgetDefChange(widgetDef: WidgetDef): void
}

/** Edits the overall properties of a widget */
export class WidgetEditor extends React.Component<WidgetEditorProps> {
  handleContextVarsChange = (contextVars: ContextVar[]) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, contextVars })
  }

  render() {
    return (<div>
      <LabeledProperty label="Name">
        <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="name"> 
          { (value, onChange) => <TextInput value={value} onChange={onChange} /> }
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Description">
        <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="description"> 
          { (value, onChange) => <TextInput value={value} onChange={onChange} /> }
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Variables">
        <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="contextVars"> 
          { (value, onChange) => <ContextVarsEditor contextVars={value} onChange={onChange} schema={this.props.schema} /> }
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Preview Variable Values">
        {this.props.widgetDef.contextVars.map((contextVar) => {
          return <ContextVarPreviewValue 
            key={contextVar.id}
            contextVar={contextVar} 
            widgetDef={this.props.widgetDef} 
            schema={this.props.schema}
            dataSource={this.props.dataSource}
            onWidgetDefChange={this.props.onWidgetDefChange}
            />
        })}
      </LabeledProperty>
      <div style={{ color: "#EEE", fontSize: 9 }}>{this.props.widgetDef.id}</div>

    </div>)
  }
}

interface ContextVarsEditorProps {
  contextVars: ContextVar[]
  onChange: (contextVars: ContextVar[]) => void
  schema: Schema
}

class ContextVarsEditor extends React.Component<ContextVarsEditorProps> {
  modalElem: AddContextVarModal | null

  handleAddContextVar = (contextVar: ContextVar) => {
    this.props.onChange(this.props.contextVars.concat(contextVar))
  }

  handleOpenAdd = () => {
    this.modalElem!.show()
  }

  handleModalRef = (elem: AddContextVarModal | null) => {
    this.modalElem = elem
  }

  render() {
    return (
      <div>
        <ListEditor items={this.props.contextVars} onItemsChange={this.props.onChange}>
          { (contextVar, onContextVarChange) => <ContextVarEditor contextVar={contextVar} onChange={onContextVarChange} schema={this.props.schema}/> }
        </ListEditor>
        <AddContextVarModal schema={this.props.schema} locale="en" ref={this.handleModalRef} onAdd={this.handleAddContextVar} />
        <button type="button" className="btn btn-link" onClick={this.handleOpenAdd}>
          <i className="fa fa-plus"/> Add Variable
        </button>
      </div>
    )
  }
}

class ContextVarEditor extends React.Component<{ contextVar: ContextVar, onChange: (contextVar: ContextVar) => void, schema: Schema}> { 
  handleNameChange = () => {
    const name = window.prompt("Enter name", this.props.contextVar.name)
    if (name) {
      this.props.onChange({ ...this.props.contextVar, name })
    }
  }

  render() {
    let desc = this.props.contextVar.type
    if (this.props.contextVar.table) {
      desc += " of "
      desc += this.props.schema.getTable(this.props.contextVar.table) ? localize(this.props.schema.getTable(this.props.contextVar.table)!.name, "en") : this.props.contextVar.table
    }

    return (
      <div>
        <a onClick={this.handleNameChange}>{this.props.contextVar.name}</a>
        &nbsp;({desc})
      </div>
    )
  }
}

interface AddContextVarModalProps {
  schema: Schema
  locale: string
  onAdd: (contextVar: ContextVar) => void
}

interface AddContextVarModalState {
  visible: boolean
  contextVar?: ContextVar
}

class AddContextVarModal extends React.Component<AddContextVarModalProps, AddContextVarModalState> {
  constructor(props: AddContextVarModalProps) {
    super(props)

    this.state = { visible: false }
  }

  show() {
    this.setState({
      visible: true,
      contextVar: { id: uuid(), name: "Untitled", type: "row" }
    })
  }

  handleAdd = () => {
    if (this.state.contextVar!.type === "row" || this.state.contextVar!.type === "rowset") {
      if (!this.state.contextVar!.table) {
        alert("Table required")
        return
      }
    }
    this.setState({ visible: false })
    this.props.onAdd(this.state.contextVar!)
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  handleContextVarChange = (contextVar: ContextVar) => {
    // Clear table
    if (contextVar.type !== "row" && contextVar.type !== "rowset") {
      contextVar = { id: contextVar.id, type: contextVar.type, name: contextVar.name }
    }

    this.setState({ contextVar: contextVar })
  }

  render() {
    if (!this.state.visible) {
      return null
    }

    const typeOptions = [
      { value: "row", label: "Row of a table" },
      { value: "rowset", label: "Set of rows of a table" },
      { value: "text", label: "Text" },
      { value: "number", label: "Number" },
      { value: "boolean", label: "Boolean" },
      { value: "date", label: "Date" },
      { value: "datetime", label: "Datetime" }
    ]

    return (
      <ActionCancelModalComponent actionLabel="Add" onAction={this.handleAdd} onCancel={this.handleCancel}>
        <LabeledProperty label="Name">
          <PropertyEditor obj={this.state.contextVar!} property="name" onChange={this.handleContextVarChange}>
            {(value, onChange) => <TextInput value={value} onChange={onChange}/>}
          </PropertyEditor>
        </LabeledProperty>

        <LabeledProperty label="Type">
          <PropertyEditor obj={this.state.contextVar!} property="type" onChange={this.handleContextVarChange}>
            {(value, onChange) => <Select value={value} onChange={onChange} options={typeOptions} />}
          </PropertyEditor>
        </LabeledProperty>

        { this.state.contextVar!.type === "row" || this.state.contextVar!.type === "rowset" ?
          <div style={{ paddingBottom: 200 }}>
            <LabeledProperty label="Table">
              <PropertyEditor obj={this.state.contextVar!} property="table" onChange={this.handleContextVarChange}>
                {(value, onChange) => <TableSelect schema={this.props.schema} value={value || null} onChange={onChange} locale={this.props.locale} />}
              </PropertyEditor>
            </LabeledProperty>
          </div>
        : null }

      </ActionCancelModalComponent>
    )
  }
}

/** Allows editing of the preview value for one context variable */
class ContextVarPreviewValue extends React.Component<{
  contextVar: ContextVar
  widgetDef: WidgetDef
  schema: Schema
  dataSource: DataSource
  onWidgetDefChange(widgetDef: WidgetDef): void
}> {

  handleChange = (value: any) => {
    this.props.onWidgetDefChange(produce(this.props.widgetDef, (draft) => {
      draft.contextVarPreviewValues[this.props.contextVar.id] = value
    })) 
  }

  renderValue(value: any) {
    if (this.props.contextVar.type === "row") {
      return <IdLiteralComponent 
        schema={this.props.schema} 
        dataSource={this.props.dataSource}
        idTable={this.props.contextVar.table!}
        value={value}
        onChange={this.handleChange}
        />
    }

    if (this.props.contextVar.type === "rowset") {
      return <ExprComponent 
        schema={this.props.schema} 
        dataSource={this.props.dataSource}
        table={this.props.contextVar.table!}
        types={["boolean"]}
        value={value}
        onChange={this.handleChange}
        />
    }
    return <i>Not supported</i>
  }
  render() {
    const value = this.props.widgetDef.contextVarPreviewValues[this.props.contextVar.id]

    return (
      <div>
        <div>{this.props.contextVar.name}:</div>
        {this.renderValue(value)}
      </div>
    )
  }
}