import * as React from "react";
import { Select } from "react-library/lib/bootstrap";
import { ContextVar } from "./blocks";
import { ActionDef } from "./actions";
import { WidgetLibrary } from "../designer/widgetLibrary";
import { ActionLibrary } from "./ActionLibrary";
import { LocalizedString } from "mwater-expressions";

/* Components to build property editors. These may use bootstrap 3 as needed. */

export class LabeledProperty extends React.Component<{ label: string }> {
  render() {
    return (
      <div className="form-group">
        <label>{this.props.label}</label>
        <div style={{ paddingLeft: 5 }}>
          {this.props.children}
        </div>
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

export class TextPropertyEditor extends React.Component<{ 
  obj: object, 
  onChange: (obj: object) => void, 
  property: string,
  placeholder?: string,
  multiline?: boolean,
  allowCR?: boolean
 }> {

handleChange = (e: any) => {
  let str = e.target.value
  if (!this.props.allowCR) {
    str = str.replace(/[\r\n]+/g, " ")
  }

  this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: str }))
}

render() {
  const value = this.props.obj[this.props.property] || ""

  return (this.props.multiline 
    ?      
      <textarea className="form-control" value={value} onChange={this.handleChange} placeholder={this.props.placeholder} />
    :
      <input className="form-control" type="text" value={value} onChange={this.handleChange} placeholder={this.props.placeholder} />
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
