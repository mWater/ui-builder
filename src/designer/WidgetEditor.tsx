import * as React from "react"
import { v4 as uuid } from "uuid"
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, TableSelect } from "../widgets/propertyEditors"
import { validateWidget, WidgetDef } from "../widgets/widgets"
import { ContextVar } from "../widgets/blocks"
import { Schema, DataSource, EnumValue } from "mwater-expressions"
import { localize } from "../widgets/localization"
import _ from "lodash"
import { TextInput, Select, Checkbox, Toggle } from "react-library/lib/bootstrap"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { DesignCtx } from "../contexts"
import { ContextVarValueEditor, validateContextVarValue } from "../contextVarValues"

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
    const allContextVars = (this.props.designCtx.globalContextVars || []).concat(this.props.widgetDef.contextVars)

    const validationError = validateWidget(this.props.widgetDef, this.props.designCtx, false)

    return (
      <div>
        {validationError ? (
          <div className="text-danger">
            <i className="fa fa-exclamation-circle" /> {validationError}
          </div>
        ) : null}
        <LabeledProperty label="Name">
          <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="name">
            {(value, onChange) => <TextInput value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Description">
          <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="description">
            {(value, onChange) => <TextInput value={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Group" hint="Optional grouping of this widget. Blank for none">
          <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="group">
            {(value, onChange) => <TextInput value={value || ""} onChange={(val) => onChange(val || undefined)} />}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Variables" hint="Define data sources (rowsets or rows)">
          <PropertyEditor
            obj={this.props.widgetDef}
            onChange={this.props.onWidgetDefChange}
            property="privateContextVars"
          >
            {(value, onChange) => (
              <ContextVarsEditor
                contextVars={value || []}
                onChange={onChange}
                contextVarValues={this.props.widgetDef.privateContextVarValues || {}}
                onContextVarValuesChange={this.handlePrivateContextVarValuesChange}
                schema={this.props.designCtx.schema}
                dataSource={this.props.designCtx.dataSource}
                availContextVars={allContextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty
          label="External Variables"
          hint="These are passed in to the widget from its parent. Values for preview only"
        >
          <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="contextVars">
            {(value, onChange) => (
              <ContextVarsEditor
                contextVars={value}
                onChange={onChange}
                contextVarValues={this.props.widgetDef.contextVarPreviewValues}
                onContextVarValuesChange={this.handleContextVarPreviewValues}
                schema={this.props.designCtx.schema}
                dataSource={this.props.designCtx.dataSource}
                availContextVars={allContextVars}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        <LabeledProperty label="Global Variables" hint="Values for preview only">
          {(this.props.designCtx.globalContextVars || []).map((contextVar) => {
            return (
              <div key={contextVar.id} style={{ paddingBottom: 10 }}>
                <div>{contextVar.name}:</div>
                <ContextVarValueEditor
                  contextVar={contextVar}
                  contextVarValue={this.props.widgetDef.contextVarPreviewValues[contextVar.id]}
                  onContextVarValueChange={(value) => {
                    this.handleContextVarPreviewValues({
                      ...this.props.widgetDef.contextVarPreviewValues,
                      [contextVar.id]: value
                    })
                  }}
                  schema={this.props.designCtx.schema}
                  dataSource={this.props.designCtx.dataSource}
                  availContextVars={allContextVars}
                />
              </div>
            )
          })}
        </LabeledProperty>
        <PropertyEditor
          obj={this.props.widgetDef}
          onChange={this.props.onWidgetDefChange}
          property="virtualizeDatabaseInPreview"
        >
          {(value, onChange) => (
            <Checkbox value={value != null ? value : true} onChange={onChange}>
              Prevent changes to database in Preview
            </Checkbox>
          )}
        </PropertyEditor>
        <LabeledProperty label="Margins" hint="Use to remove all margins from control for TOC or dashboard">
          <PropertyEditor obj={this.props.widgetDef} onChange={this.props.onWidgetDefChange} property="pageMargins">
            {(value, onChange) => (
              <Toggle
                value={value || "normal"}
                onChange={onChange}
                size="sm"
                options={[
                  { value: "normal", label: "Normal" },
                  { value: "none", label: "None" }
                ]}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
        {/* <LabeledProperty label="Widget ID" hint="Advanced">
        <input type="text" value={this.props.widgetDef.id} className="form-control form-control-sm" onFocus={ev => { ev.target.select() }}/>
      </LabeledProperty> */}
      </div>
    )
  }
}

/** Edits a set of context variables and their values */
const ContextVarsEditor = (props: {
  contextVars: ContextVar[]
  onChange: (contextVars: ContextVar[]) => void

  /** Avaiable context variables (for expression builder) */
  availContextVars: ContextVar[]

  /** Values of context variables */
  contextVarValues: { [contextVarId: string]: any }
  onContextVarValuesChange: (values: { [contextVarId: string]: any }) => void

  schema: Schema
  dataSource: DataSource
}) => {
  const renderItem = (contextVar: ContextVar) => {
    let desc = contextVar.type
    if (contextVar.table) {
      desc += " of "
      desc += props.schema.getTable(contextVar.table)
        ? localize(props.schema.getTable(contextVar.table)!.name, "en")
        : contextVar.table
    }

    return (
      <div>
        <div>
          {contextVar.name} <span className="text-muted">- {desc}</span>
        </div>
        <ContextVarValueEditor
          contextVar={contextVar}
          contextVarValue={props.contextVarValues[contextVar.id]}
          onContextVarValueChange={(value) =>
            props.onContextVarValuesChange({ ...props.contextVarValues, [contextVar.id]: value })
          }
          schema={props.schema}
          dataSource={props.dataSource}
          availContextVars={props.availContextVars}
        />
      </div>
    )
  }

  const renderEditor = (item: Partial<ContextVar>, onItemChange: (item: Partial<ContextVar>) => void) => {
    return <ContextVarEditor contextVar={item} onContextVarChange={onItemChange} schema={props.schema} locale="en" />
  }

  const validateItem = (contextVar: Partial<ContextVar>) => {
    if (!contextVar.type) {
      alert("Type required")
      return false
    }

    if (contextVar.type === "row" || contextVar.type === "rowset") {
      if (!contextVar.table) {
        alert("Table required")
        return false
      }
    }
    return true
  }

  return (
    <ListEditorComponent
      items={props.contextVars}
      onItemsChange={props.onChange}
      renderItem={renderItem}
      addLabel="Add Variable"
      createNew={() => ({ id: uuid(), name: "Untitled", type: "rowset" } as ContextVar)}
      renderEditor={renderEditor}
      validateItem={validateItem}
      deleteConfirmPrompt="Delete variable?"
      editLink
    />
  )
}

function ContextVarEditor(props: {
  contextVar: Partial<ContextVar>
  onContextVarChange: (contextVar: Partial<ContextVar>) => void
  schema: Schema
  locale: string
}) {
  const mainTypeOptions = [
    { value: "row", label: "Single Row" },
    { value: "rowset", label: "Multiple Rows" },
    { value: "advanced", label: "Advanced..." }
  ]

  const advancedTypeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "enum", label: "Enum" },
    { value: "enumset", label: "Enum set" },
    { value: "id", label: "Reference" },
    { value: "id[]", label: "Reference List" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "Datetime" }
  ]

  return (
    <div style={{ paddingBottom: 200 }}>
      <LabeledProperty label="Name">
        <PropertyEditor obj={props.contextVar} property="name" onChange={props.onContextVarChange}>
          {(value, onChange) => <TextInput value={value || ""} onChange={(name) => onChange(name || undefined)} />}
        </PropertyEditor>
      </LabeledProperty>

      <LabeledProperty label="Type">
        <PropertyEditor obj={props.contextVar} property="type" onChange={props.onContextVarChange}>
          {(value, onChange) => (
            <div>
              <Toggle
                value={value == "row" || value == "rowset" ? value : "advanced"}
                onChange={(v) => onChange(v == "advanced" ? "text" : (v as any))}
                options={mainTypeOptions}
                size="sm"
              />
              {value && value != "row" && value != "rowset" ? (
                <div style={{ padding: 5 }}>
                  <Select value={value} onChange={onChange} options={advancedTypeOptions as any} />
                </div>
              ) : null}
            </div>
          )}
        </PropertyEditor>
      </LabeledProperty>

      {props.contextVar.type == "enum" || props.contextVar.type == "enumset" ? (
        <LabeledProperty label="Enum Options">
          <PropertyEditor obj={props.contextVar} property="enumValues" onChange={props.onContextVarChange}>
            {(value, onChange) => <EnumValuesEditor enumValues={value} onChange={onChange} />}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}

      {props.contextVar.type == "id" || props.contextVar.type == "id[]" ? (
        <LabeledProperty label="Referenced Table">
          <PropertyEditor obj={props.contextVar} property="idTable" onChange={props.onContextVarChange}>
            {(value, onChange) => (
              <TableSelect
                schema={props.schema}
                value={value || null}
                onChange={(t) => onChange(t || undefined)}
                locale={props.locale}
              />
            )}
          </PropertyEditor>
        </LabeledProperty>
      ) : null}

      <LabeledProperty
        label="Table"
        hint={props.contextVar.type != "row" && props.contextVar.type != "rowset" ? "Optional" : undefined}
      >
        <PropertyEditor obj={props.contextVar} property="table" onChange={props.onContextVarChange}>
          {(value, onChange) => (
            <TableSelect
              schema={props.schema}
              value={value || null}
              onChange={(t) => onChange(t || undefined)}
              locale={props.locale}
            />
          )}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}

/** Edits  */
function EnumValuesEditor(props: { enumValues?: EnumValue[]; onChange: (enumValues: EnumValue[]) => void }) {
  function renderItem(enumValue: EnumValue, index: number, onEnumValueChange: (enumValue: EnumValue) => void) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr" }}>
        <TextInput
          value={enumValue.id}
          onChange={(id) => {
            onEnumValueChange({ ...enumValue, id: id || "" })
          }}
        />
        <LocalizedTextPropertyEditor
          value={enumValue.name}
          onChange={(name) => {
            onEnumValueChange({ ...enumValue, name: name! })
          }}
          locale="en"
        />
      </div>
    )
  }
  return (
    <ListEditorComponent
      items={props.enumValues || []}
      onItemsChange={props.onChange}
      renderItem={renderItem}
      addLabel="Add Enum Option"
      createNew={() => ({ id: "", name: { _base: "en", en: "" } })}
    />
  )
}
