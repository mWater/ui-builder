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
import { DesignCtx } from "../contexts";

interface WidgetEditorProps {
  designCtx: DesignCtx
  widgetDef: WidgetDef
  onWidgetDefChange(widgetDef: WidgetDef): void
}

/** Edits the overall properties of a widget */
export class WidgetEditor extends React.Component<WidgetEditorProps> {
  handleContextVarsChange = (contextVars: ContextVar[]) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, contextVars })
  }

  handleContextVarPreviewValues = (contextVarPreviewValues: { [contextVarId: string]: any }) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, contextVarPreviewValues })
  }

  handlePrivateContextVarValuesChange = (privateContextVarValues: { [contextVarId: string]: any }) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, privateContextVarValues })
  }

  render() {
    // Get list of all non-private context variables, including global
    const allContextVars = (this.props.designCtx.globalContextVars || [])
      .concat(this.props.widgetDef.contextVars)

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
      <LabeledProperty label="External Variables" hint="These are passed in to the widget from its parent">
        <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="contextVars"> 
          { (value, onChange) => <ContextVarsEditor contextVars={value} onChange={onChange} schema={this.props.designCtx.schema} /> }
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Preview External Variable Values" hint="For preview purposes only">
        {allContextVars.map((contextVar) => {
          return <div style={{ paddingBottom: 5 }} key={contextVar.id}>
            <ContextVarsValuesEditor 
              key={contextVar.id}
              contextVar={contextVar} 
              schema={this.props.designCtx.schema}
              dataSource={this.props.designCtx.dataSource}
              contextVarValues={this.props.widgetDef.contextVarPreviewValues}
              onContextVarValuesChange={this.handleContextVarPreviewValues}
              />
          </div>
        })}
      </LabeledProperty>
      <LabeledProperty label="Variables" hint="Define data sources here (rowsets or rows)">
        <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="privateContextVars"> 
          { (value, onChange) => <ContextVarsEditor contextVars={value || []} onChange={onChange} schema={this.props.designCtx.schema} /> }
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="Variable Values">
        {(this.props.widgetDef.privateContextVars || []).map((contextVar) => {
          return <div style={{ paddingBottom: 5 }} key={contextVar.id}>
            <ContextVarsValuesEditor 
              key={contextVar.id}
              contextVar={contextVar} 
              schema={this.props.designCtx.schema}
              dataSource={this.props.designCtx.dataSource}
              contextVarValues={this.props.widgetDef.privateContextVarValues}
              onContextVarValuesChange={this.handlePrivateContextVarValuesChange}
              />
          </div>
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

/** Allows editing of the value for one context variable */
class ContextVarsValuesEditor extends React.Component<{
  contextVar: ContextVar
  contextVarValues?: { [contextVarId: string]: any }
  onContextVarValuesChange: (values: { [contextVarId: string]: any }) => void
  schema: Schema
  dataSource: DataSource
}> {

  handleChange = (value: any) => {
    this.props.onContextVarValuesChange(produce(this.props.contextVarValues || {}, (draft) => {
      draft[this.props.contextVar.id] = value
    })) 
  }

  renderValue(value: any) {
    if ((this.props.contextVar.type === "row" || this.props.contextVar.type === "id") && this.props.schema.getTable(this.props.contextVar.table!)) {
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

    if (this.props.contextVar.type == "enum") {
      return <Select
        nullLabel=""
        value={value}
        onChange={this.handleChange}
        options={this.props.contextVar.enumValues!.map(ev => ({ value: ev.id, label: localize(ev.name) }))}
        />
    }

    if (this.props.contextVar.type == "boolean") {
      return <Select
        nullLabel=""
        value={value}
        onChange={this.handleChange}
        options={[{ value: true, label: "True" }, { value: false, label: "False" }]}
        />
    }

    return <i>Not supported</i>
  }
  render() {
    const value = (this.props.contextVarValues || {})[this.props.contextVar.id]

    return (
      <div>
        <div>{this.props.contextVar.name}:</div>
        {this.renderValue(value)}
      </div>
    )
  }
}