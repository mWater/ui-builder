import * as React from "react";

/* Components to build property editors. These may use bootstrap 3 as needed. */

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

  handleChange = (ev: any) => {
    const value = JSON.parse(ev.target.value)
    this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }))
  }

  render() {
    const value = this.props.obj[this.props.property]
    const options = this.props.options.slice()
    if (this.props.nullLabel) {
      options.unshift({ value: null, label: this.props.nullLabel })
    }

    return (
      <select
        className="form-control"
        value={JSON.stringify(value !== null ? value : null)}
        onChange={this.handleChange}>
        {options.map(option => <option key={JSON.stringify(option.value)} value={JSON.stringify(option.value)}>{option.label}</option>)}
      </select>
    )
  }
}

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