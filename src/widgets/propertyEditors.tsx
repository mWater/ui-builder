import * as React from "react";
import { Select } from "react-library/lib/bootstrap";
import { ContextVar, createExprVariables } from "./blocks";
import { ActionDef } from "./actions";
import { WidgetLibrary } from "../designer/widgetLibrary";
import { ActionLibrary } from "./ActionLibrary";
import { LocalizedString, Schema, DataSource, Expr, Table } from "mwater-expressions";
import { OrderBy, OrderByDir } from "../database/Database";
import ListEditor from "./ListEditor";
import { ExprComponent } from "mwater-expressions-ui";
import * as PropTypes from 'prop-types'
import ReactSelect from "react-select"
import { localize } from "./localization";

/* Components to build property editors. These may use bootstrap 3 as needed. */

export class LabeledProperty extends React.Component<{ label: string, help?: string }> {
  render() {
    return (
      <div className="form-group">
        <label>{this.props.label}</label>
        <div style={{ paddingLeft: 5 }}>
          {this.props.children}
        </div>
        <p className="help-block" style={{ marginLeft: 5 }}>
          {this.props.help}
        </p>
      </div>
    )
  }
}

/** Creates a property editor for a property */
export class PropertyEditor<T, K extends keyof T> extends React.Component<{
  obj: T,
  onChange: (obj: T) => void, 
  property: K,
  children: (value: T[K], onChange: (value: T[K]) => void) => React.ReactElement<any>
}> {

  handleChange = (value: T[K]) => {
    this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }))
  }

  render() {
    const value = this.props.obj[this.props.property]
  
    return this.props.children(value, this.handleChange)
  }
}

export class LocalizedTextPropertyEditor extends React.Component<{ 
    value: LocalizedString | null, 
    onChange: (value: LocalizedString | null) => void, 
    locale: string, 
    placeholder?: string,
    multiline?: boolean,
    allowCR?: boolean
   }> {

  handleChange = (e: any) => {
    const locale = this.props.locale || "en"
    let str = e.target.value
    if (!this.props.allowCR) {
      str = str.replace(/[\r\n]+/g, " ")
    }

    if (!str) {
      this.props.onChange(null)
      return 
    }

    const value = Object.assign({}, this.props.value || {}) as LocalizedString
    value._base = this.props.locale
    value[locale] = str

    this.props.onChange(value)
  }

  render() {
    const value = this.props.value || { _base: "en" }
    const locale = this.props.locale || "en"
    let str = ""
    if (value[locale]) {
      str = value[locale]
    }

    return (this.props.multiline 
      ?      
        <textarea className="form-control" value={str} onChange={this.handleChange} placeholder={this.props.placeholder} />
      :
        <input className="form-control" type="text" value={str} onChange={this.handleChange} placeholder={this.props.placeholder} />
    )
  }
}

interface Option {
  label: string,
  value: any
}

export class DropdownPropertyEditor extends React.Component<{ 
    obj: object, 
    onChange: (obj: object) => void,
    property: string,
    options: Option[],
    nullLabel?: string }> {

  handleChange = (value: any) => {
    this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }))
  }

  render() {
    const value = this.props.obj[this.props.property]

    return (
      <Select
        value={value}
        onChange={this.handleChange}
        options={this.props.options} 
        nullLabel={this.props.nullLabel}
      />
    )
  }
}

/** Allows selecting a context variable */
export class ContextVarPropertyEditor extends React.Component<{ 
  value: string | null, 
  onChange: (value: string) => void,
  contextVars: ContextVar[],
  types?: string[],
  table?: string
}> {

  render() {
    let contextVars = this.props.contextVars.filter(cv => !this.props.types || this.props.types.includes(cv.type))
    contextVars = contextVars.filter(cv => !this.props.table || this.props.table === cv.table)

    return <Select
      value={this.props.value}
      onChange={this.props.onChange}
      nullLabel="Select..."
      options={contextVars.map(cv => ({ label: cv.name, value: cv.id }))}
    />
  }
}

/** Edits an action definition, allowing selection of action */
export class ActionDefEditor extends React.Component<{
  value: ActionDef | null
  onChange: (actionDef: ActionDef | null) => void
  locale: string
  contextVars: ContextVar[]
  actionLibrary: ActionLibrary
  widgetLibrary: WidgetLibrary
}> {

  handleChangeAction = (type: string | null) => {
    if (type) {
      this.props.onChange(this.props.actionLibrary.createNewActionDef(type))
    }
    else {
      this.props.onChange(null)
    }
  }

  render() {
    const action = this.props.value ? this.props.actionLibrary.createAction(this.props.value) : null

    return (
      <div>
        <Select 
          nullLabel="No Action"
          onChange={this.handleChangeAction}
          value={this.props.value ? this.props.value.type : null}
          options={this.props.actionLibrary.getActionTypes().map(at => ({ label: at.name, value: at.type }))}
        />
        { action 
          ? action.renderEditor({ 
              widgetLibrary: this.props.widgetLibrary,
              actionDef: this.props.value!, 
              locale: this.props.locale, 
              contextVars: this.props.contextVars, 
              onChange: this.props.onChange 
            }) 
          : null }
      </div>
    )
    
  }
}

/** Edits an array of order by expressions */
export class OrderByArrayEditor extends React.Component<{
  value?: OrderBy[]
  onChange: (value: OrderBy[]) => void
  table: string
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}> {

  handleAddOrderByExpr = () => {
    this.props.onChange((this.props.value || []).concat([{ expr: null, dir: OrderByDir.asc }]))
  }

  render() {
    return (
      <div>
        <ListEditor items={this.props.value || []} onItemsChange={this.props.onChange}>
          { (orderBy: OrderBy, onOrderByChange) => (
            <OrderByEditor value={orderBy} schema={this.props.schema} dataSource={this.props.dataSource} onChange={onOrderByChange} table={this.props.table} contextVars={this.props.contextVars} />
          )}
        </ListEditor>
        <button type="button" className="btn btn-link btn-sm" onClick={this.handleAddOrderByExpr}>
          + Add Order By
        </button>
      </div>
    )
  }
}

export class OrderByEditor extends React.Component<{
  value: OrderBy
  onChange: (value: OrderBy) => void
  table: string
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}> {

  handleExprChange = (expr: Expr) => {
    this.props.onChange({ ...this.props.value, expr: expr })
  }

  handleDirToggle = () => {
    this.props.onChange({ ...this.props.value, dir: (this.props.value.dir === OrderByDir.asc) ? OrderByDir.desc : OrderByDir.asc })
  }

  render() {
    return (
      <div>
        <div style={{ float: "left" }}>
          <a onClick={this.handleDirToggle}>
            { this.props.value.dir === OrderByDir.asc ? <i className="fa fa-arrow-up"/> : <i className="fa fa-arrow-down"/> }
          </a>
        </div>
        <ExprComponent 
          schema={this.props.schema} 
          dataSource={this.props.dataSource}
          types={["text", "number", "enum", "boolean", "date", "datetime"]}
          table={this.props.table}
          value={this.props.value.expr}
          variables={createExprVariables(this.props.contextVars)}
          onChange={this.handleExprChange}
        />
      </div>
    )
  }
}

/** Edits a d3 format */
export class FormatEditor extends React.Component<{ value: string | null, onChange: (value: string) => void }> {
  render() {
    return (
      <Select 
        value={this.props.value || ""} 
        onChange={this.props.onChange}
        options={[
          { value: ",", label: "Normal: 1,234.567" },
          { value: "", label: "Plain: 1234.567" },
          { value: ",.0f", label: "Rounded: 1,234" },
          { value: ",.2f", label: "Two decimals: 1,234.56" },
          { value: "$,.2f", label: "Currency: $1,234.56" },
          { value: "$,.0f", label: "Currency rounded: $1,234" },
          { value: ".0%", label: "Percent rounded: 12%" }
        ]} />
    )
  }
}

interface TableSelectContext {
  tableSelectElementFactory: (options: {
    schema: Schema
    value: string | null
    onChange: (tableId: string) => void
  }) => React.ReactElement<any>
}

/** Allow selecting a table */
export class TableSelect extends React.Component<{
  schema: Schema
  locale: string
  value: string | null
  onChange: (tableId: string) => void
}> {
  static contextTypes = {
    tableSelectElementFactory: PropTypes.func  // Can be overridden by setting tableSelectElementFactory in context that takes ({ schema, value, onChange, filter, onFilterChange })
  }
  
  context: TableSelectContext

  handleTableChange = (table: Table) => {
    this.props.onChange(table.id)
  }

  getOptionLabel = (table: Table) => localize(table.name, this.props.locale)

  getOptionValue = (table: Table) => table.id

  render() {
    if (this.context.tableSelectElementFactory) {
      return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value, onChange: this.props.onChange })
    }
    
    const tables = _.sortBy(this.props.schema.getTables(), (table) => localize(table.name, this.props.locale))

    return <ReactSelect 
      value={tables.find(t => t.id === this.props.value)} 
      options={tables}
      onChange={this.handleTableChange} 
      getOptionLabel={this.getOptionLabel}
      getOptionValue={this.getOptionValue}
    />
  }
}