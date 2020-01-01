import _ from 'lodash'
import * as React from "react";
import { Select } from "react-library/lib/bootstrap";
import { ContextVar, createExprVariables } from "./blocks";
import { ActionDef } from "./actions";
import { LocalizedString, Schema, DataSource, Expr, Table, EnumValue, ExprUtils } from "mwater-expressions";
import { OrderBy } from "../database/Database";
import ListEditor from "./ListEditor";
import { ExprComponent } from "mwater-expressions-ui";
import * as PropTypes from 'prop-types'
import ReactSelect from "react-select"
import { localize } from "./localization";
import { EmbeddedExpr } from "../embeddedExprs";
import { DesignCtx } from "../contexts";

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
  onChange: (obj: any) => void, 
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
    value?: LocalizedString | null, 
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
  value?: string | null, 
  onChange: (value: string) => void,
  contextVars: ContextVar[],
  types?: string[],
  table?: string, 
  /** Makes null say "None", not "Select..." */
  allowNone?: boolean, 
  filter?: (contextVar: ContextVar) => boolean
}> {

  render() {
    let contextVars = this.props.contextVars.filter(cv => !this.props.types || this.props.types.includes(cv.type))
    contextVars = contextVars.filter(cv => !this.props.table || this.props.table === cv.table)
    if (this.props.filter) {
      contextVars.filter(this.props.filter)
    }

    return <Select
      value={this.props.value}
      onChange={this.props.onChange}
      nullLabel={this.props.allowNone ? "None" : "Select..."}
      options={contextVars.map(cv => ({ label: cv.name, value: cv.id }))}
    />
  }
}

/** Edits an action definition, allowing selection of action */
export class ActionDefEditor extends React.Component<{
  value?: ActionDef | null
  onChange: (actionDef: ActionDef | null) => void
  designCtx: DesignCtx
}> {

  handleChangeAction = (type: string | null) => {
    if (type) {
      this.props.onChange(this.props.designCtx.actionLibrary.createNewActionDef(type))
    }
    else {
      this.props.onChange(null)
    }
  }

  render() {
    const action = this.props.value ? this.props.designCtx.actionLibrary.createAction(this.props.value) : null

    return (
      <div>
        <Select 
          nullLabel="No Action"
          onChange={this.handleChangeAction}
          value={this.props.value ? this.props.value.type : null}
          options={this.props.designCtx.actionLibrary.getActionTypes().map(at => ({ label: at.name, value: at.type }))}
        />
        { action 
          ? action.renderEditor({ ...this.props.designCtx, onChange: this.props.onChange })
          : null }
      </div>
    )
    
  }
}

/** Edits an array of order by expressions */
export class OrderByArrayEditor extends React.Component<{
  value?: OrderBy[] | null
  onChange: (value: OrderBy[]) => void
  table: string
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}> {

  handleAddOrderByExpr = () => {
    this.props.onChange((this.props.value || []).concat([{ expr: null, dir: "asc" }]))
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
    this.props.onChange({ ...this.props.value, dir: (this.props.value.dir === "asc") ? "desc" : "asc" })
  }

  render() {
    return (
      <div>
        <div style={{ float: "left" }}>
          <a onClick={this.handleDirToggle}>
            { this.props.value.dir === "asc" ? <i className="fa fa-arrow-up"/> : <i className="fa fa-arrow-down"/> }
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
export class NumberFormatEditor extends React.Component<{ value: string | null, onChange: (value: string) => void }> {
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
          { value: ".0%", label: "Percent rounded: 12%" },
          { value: ".1%", label: "Percent rounded: 12.3%" },
          { value: ".2%", label: "Percent rounded: 12.34%" }
        ]} />
    )
  }
}

/** Edits a moment.js date format */
export class DateFormatEditor extends React.Component<{ value: string | null, onChange: (value: string) => void }> {
  render() {
    return (
      <Select 
        value={this.props.value || ""} 
        onChange={this.props.onChange}
        nullLabel="Short (Sep 4, 1986)"
        options={[
          { value: "LL", label: "Long (September 4, 1986)" },
          { value: "YYYY-MM-DD", label: "YYYY-MM-DD (1986-04-09)" },
        ]} />
    )
  }
}

/** Edits a moment.js datetime format */
export class DatetimeFormatEditor extends React.Component<{ value: string | null, onChange: (value: string) => void }> {
  render() {
    return (
      <Select 
        value={this.props.value || ""} 
        onChange={this.props.onChange}
        nullLabel="Short (Sep 4, 1986 8:30 PM)"
        options={[
          { value: "llll", label: "Medium (Thu, Sep 4, 1986 8:30 PM)" },
          { value: "LLLL", label: "Long (Thursday, September 4, 1986 8:30 PM)" },
          { value: "ll", label: "Short Date (Sep 4, 1986)" },
          { value: "LL", label: "Long Date (September 4, 1986)" },
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
  value?: string | null
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
      return this.context.tableSelectElementFactory({ schema: this.props.schema, value: this.props.value || null, onChange: this.props.onChange })
    }
    
    const tables = _.sortBy(this.props.schema.getTables(), (table) => localize(table.name, this.props.locale))

    return <ReactSelect 
      value={tables.find(t => t.id === this.props.value) || null} 
      options={tables}
      onChange={this.handleTableChange} 
      getOptionLabel={this.getOptionLabel}
      getOptionValue={this.getOptionValue}
    />
  }
}

/** Edits an array of enum values */
export const EnumArrayEditor = (props: {
  value?: string[] | null
  onChange: (value: string[] | null) => void
  enumValues: EnumValue[]
  locale?: string
  placeholder?: string
}) => {
  // Map value to array
  let value: EnumValue[] | null = null
  if (props.value) {
    value = _.compact((props.value || []).map((v: any) => props.enumValues.find(ev => ev.id === v)!))
  }

  const getOptionLabel = (ev: EnumValue) => localize(ev.name, props.locale)
  const getOptionValue = (ev: EnumValue) => ev.id
  const handleChange = (evs: EnumValue[] | null) => {
    props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null)
  }

  return <ReactSelect
    value={value} 
    onChange={handleChange}
    options={props.enumValues}
    placeholder={props.placeholder}
    getOptionLabel={getOptionLabel}
    getOptionValue={getOptionValue}
    isClearable={true}
    isMulti={true}
    styles={{ 
      // Keep menu above other controls
      menu: (style) => ({ ...style, zIndex: 2000 })
    }}
    />
}

/** Edits embedded expressions. */
export const EmbeddedExprsEditor = (props: { 
  value?: EmbeddedExpr[] | null
  onChange: (value: EmbeddedExpr[]) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) => {
  const { value, onChange, schema, dataSource, contextVars } = props

  const handleAddEmbeddedExpr = () => {
    onChange((value || []).concat([{ contextVarId: contextVars.length > 0 ? contextVars[contextVars.length - 1].id : null, expr: null, format: null }]))
  }

  return (
    <div>
      <ListEditor items={value || []} onItemsChange={onChange}>
        {(item, onItemChange) => 
          <EmbeddedExprEditor value={item} onChange={onItemChange} schema={schema} dataSource={dataSource} contextVars={contextVars} />
        }
      </ListEditor>
      <button type="button" className="btn btn-link btn-sm" onClick={handleAddEmbeddedExpr}>
        + Add Embedded Expression
      </button>
    </div>
  )
}

/** Allows editing of an embedded expression */
export class EmbeddedExprEditor extends React.Component<{
  value: EmbeddedExpr
  onChange: (embeddedExpr: EmbeddedExpr) => void
  contextVars: ContextVar[]
  schema: Schema
  dataSource: DataSource
}> {

  handleExprChange = (expr: Expr) => {
    const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr)
    const newExprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(expr)
    
    if (newExprType !== exprType) {
      this.props.onChange({ ...this.props.value, expr: expr, format: null })
    }
    else {
      this.props.onChange({ ...this.props.value, expr: expr })
    }
  }

  render() {
    // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)

    const contextVar = this.props.contextVars.find(cv => cv.id === this.props.value.contextVarId)
    const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr)

    return (
      <div>
        <LabeledProperty label="Row/Rowset Variable">
          <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={this.props.contextVars} types={["row", "rowset"]} />}
          </PropertyEditor>
        </LabeledProperty>
    
        { contextVar && contextVar.table 
          ?
          <LabeledProperty label="Expression">
            <ExprComponent 
              value={this.props.value.expr} 
              onChange={this.handleExprChange} 
              schema={this.props.schema} 
              dataSource={this.props.dataSource} 
              aggrStatuses={["individual", "aggregate", "literal"]}
              variables={createExprVariables(this.props.contextVars)}
              table={contextVar.table!}/>
          </LabeledProperty>
          : null
        }

        { exprType === "number" ?
          <LabeledProperty label="Number Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <NumberFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "date" ?
          <LabeledProperty label="Date Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <DateFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }

        { exprType === "datetime" ?
          <LabeledProperty label="Date/time Format">
            <PropertyEditor obj={this.props.value} onChange={this.props.onChange} property="format">
              {(value: string, onChange) => (
                <DatetimeFormatEditor
                  value={value} 
                  onChange={onChange} />
              )}
            </PropertyEditor>
          </LabeledProperty>
          : null
        }
      </div>
    )
  }
}

