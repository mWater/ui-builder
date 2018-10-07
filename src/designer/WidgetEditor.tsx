import * as React from "react";
import {v4 as uuid} from 'uuid'
import { LabeledProperty, PropertyEditor } from "../widgets/propertyEditors"
import { WidgetDef } from "../widgets/widgets";
import { ContextVar } from "../widgets/blocks";
import { Schema, DataSource } from "mwater-expressions";
import { localize } from "../widgets/localization";
import { produce } from "immer";
import { ExprComponent, IdLiteralComponent } from "mwater-expressions-ui";
import ListEditor from "../widgets/ListEditor";
import ReactSelect from "react-select"
import * as _ from "lodash";
import { TextInput } from "react-library/lib/bootstrap";

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
    </div>)
  }
}

interface ContextVarsEditorProps {
  contextVars: ContextVar[]
  onChange: (contextVars: ContextVar[]) => void
  schema: Schema
}

class ContextVarEditor extends React.Component<{ contextVar: ContextVar, onChange: (contextVar: ContextVar) => void}> { 
  handleNameChange = () => {
    const name = window.prompt("Enter name", this.props.contextVar.name)
    if (name) {
      this.props.onChange({ ...this.props.contextVar, name })
    }
  }

  render() {
    return (
      <div>
        <a onClick={this.handleNameChange}>{this.props.contextVar.name}</a>
        &nbsp;({this.props.contextVar.type} {this.props.contextVar.table ? `of ${this.props.contextVar.table}` : ""})
      </div>
    )
  }
}

class ContextVarsEditor extends React.Component<ContextVarsEditorProps> {
  handleAddContextVar = (cv: { value: ContextVar, label: string }) => {
    this.props.onChange(this.props.contextVars.concat(cv.value))
  }

  render() {
    let contextVarOptions : Array<{ value: ContextVar, label: string }> = [];

    for (const table of this.props.schema.getTables().filter(t => !t.deprecated)) {
      contextVarOptions.push({
        value: {
          id: uuid(),
          name: localize(table.name) + " Row",
          type: "row",
          table: table.id
        }, 
        label: localize(table.name) + " Row"
      })

      contextVarOptions.push({
        value: {
          id: uuid(),
          name: localize(table.name) + " Rowset",
          type: "rowset",
          table: table.id
        }, 
        label: localize(table.name) + " Rowset"
      })
    }

    contextVarOptions = _.sortBy(contextVarOptions, "label")

    return (
      <div>
        <ListEditor items={this.props.contextVars} onItemsChange={this.props.onChange}>
          { (contextVar, onContextVarChange) => <ContextVarEditor contextVar={contextVar} onChange={onContextVarChange}/> }
        </ListEditor>
        <ReactSelect value={null} options={contextVarOptions} placeholder="+ Add Variable" onChange={this.handleAddContextVar} />
      </div>
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