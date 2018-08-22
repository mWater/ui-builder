import * as React from "react";

export class LocalizedTextPropertyEditor extends React.Component<{ obj: object, onChange: (obj: object) => void, locale: string, property: string }> {
  handleChange = (e: any) => {
    const locale = this.props.locale || "en"

    const value = Object.assign({}, this.props.obj[this.props.property] || {})
    value._base = this.props.locale
    value[locale] = e.target.value

    this.props.onChange(Object.assign({}, this.props.obj, { [this.props.property]: value }))
  }

  render() {
    const value = this.props.obj[this.props.property] || {}
    const locale = this.props.locale || "en"
    let str = ""
    if (value[locale]) {
      str = value[locale]
    }

    return (
      <input className="property-editor-text" type="text" value={str} onChange={this.handleChange}/>
    )
  }
}


// const x : VerticalBlockDef = {
//   id: "a",
//   type: "asdfasdf",
//   items: []
// }

// class Temp extends React.Component<{}> {
//   render() {
//     const dsfs = (b: BlockDef) => { return }
//     return <TextPropertyEditor value={x} onChange={dsfs} property="xid"/>
//   }
// }
