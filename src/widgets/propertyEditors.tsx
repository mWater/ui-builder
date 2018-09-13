import * as React from "react";
import { Select } from "react-library/lib/bootstrap";
import { ContextVar } from "./blocks";

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
    obj: object, 
    onChange: (obj: object) => void, 
    locale: string, 
    property: string,
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

    const value = Object.assign({}, this.props.obj[this.props.property] || {})
    value._base = this.props.locale
    value[locale] = str

    this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }))
  }

  render() {
    const value = this.props.obj[this.props.property] || {}
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


export class ContextVarPropertyEditor extends React.Component<{ 
  value: ContextVar | null, 
  onChange: (value: ContextVar) => void,
  contextVars: ContextVar[],
  types?: string[]}> {

  render() {
    const contextVars = this.props.contextVars.filter(cv => !this.props.types || this.props.types.includes(cv.type))

    return <Select
      value={this.props.value}
      onChange={this.props.onChange}
      options={contextVars.map(cv => ({ label: cv.name, value: cv }))}
    />
  }
}
