import * as React from "react";
import * as uuid from 'uuid/v4'
import { LabeledProperty, TextPropertyEditor } from "../widgets/propertyEditors"
import { WidgetDef } from "../widgets/widgets";
import { ContextVar } from "../widgets/blocks";
import { Select } from "react-library/lib/bootstrap";
import { Schema } from "mwater-expressions";
import { localize } from "../widgets/localization";

interface WidgetEditorProps {
  widgetDef: WidgetDef
  schema: Schema
  onWidgetDefChange(widgetDef: WidgetDef): void
}

export class WidgetEditor extends React.Component<WidgetEditorProps> {
  handleContextVarsChange = (contextVars: ContextVar[]) => {
    this.props.onWidgetDefChange({ ...this.props.widgetDef, contextVars })
  }

  render() {
    return (<div>
      <LabeledProperty label="Name">
        <TextPropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="name" />
      </LabeledProperty>
      <ContextVarsEditor contextVars={this.props.widgetDef.contextVars} onChange={this.handleContextVarsChange} schema={this.props.schema} />
    </div>)
  }
}

interface ContextVarsEditorProps {
  contextVars: ContextVar[]
  onChange: (contextVars: ContextVar[]) => void
  schema: Schema
}

class ContextVarsEditor extends React.Component<ContextVarsEditorProps> {
  handleAddContextVar = (contextVar: ContextVar) => {
    this.props.onChange(this.props.contextVars.concat(contextVar))
  }

  render() {
    const contextVarOptions : Array<{ value: ContextVar, label: string }> = [];

    for (const table of this.props.schema.getTables()) {
      contextVarOptions.push({
        value: {
          id: uuid(),
          name: localize(table.name) + " Row",
          type: "row",
          table: table.id
        }, label: localize(table.name) + " Row"})
    }

    return (
      <div>
        <ListEditor items={this.props.contextVars} onItemsChange={this.props.onChange}>
          {(contextVar, onContextVarChange) => 
            <div>
              {contextVar.name}: {contextVar.type} {contextVar.table ? ` (${contextVar.table})` : ""}
            </div>
          }
        </ListEditor>
        <Select value={null} nullLabel="+ Add Context Variable" options={contextVarOptions} onChange={this.handleAddContextVar}/>
      </div>
    )
  }
}

interface ListEditorProps<T> {
  items: T[],
  onItemsChange(items: T[]): void,
  children(item: T, onItemChange: ((item: T) => void)): React.ReactElement<any>
}

class ListEditor<T> extends React.Component<ListEditorProps<T>> {
  handleRemove = (index: number) => {
    const items = this.props.items.slice()
    items.splice(index, 1)
    this.props.onItemsChange(items)
  }

  handleItemChange = (index: number, item: T) => {
    const items = this.props.items.slice()
    items[index] = item
    this.props.onItemsChange(items)
  }

  renderItem(item: T, index: number) {
    return (
      <li className="list-group-item">
        <span className="badge" onClick={this.handleRemove.bind(null, index)}>
          <i className="fa fa-remove"/>
        </span>
        {this.props.children(item, this.handleItemChange.bind(null, index))}
      </li>
    )
  }

  render() {
    return (
      <ul className="list-group">
        {this.props.items.map((item, index) => this.renderItem(item, index))}
      </ul>
    )
  }
}

