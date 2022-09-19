import { LocalizedString } from "mwater-expressions"
import React from "react"
import { TextInput } from "react-library/lib/bootstrap"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from "../../.."

/** Localized string that is available as a prop */
export interface CodedLocalizedString {
  /** Name of the expression. Will be exposed as prop */
  name: string

  /** Text to localize */
  value: LocalizedString
}

/** Edits coded localized string. */
export const CodedLocalizedStringsEditor = (props: {
  value?: CodedLocalizedString[] | null
  onChange: (value: CodedLocalizedString[]) => void
  locale: string
}) => {
  const { value, onChange, locale } = props

  return (
    <div>
      <ListEditorComponent
        items={value || []}
        onItemsChange={onChange}
        renderItem={(item, index, onItemChange) => (
          <CodedLocalizedStringEditor value={item} onChange={onItemChange} locale={locale} />
        )}
        createNew={() => ({ name: "", value: { _base: "en", en: "" } })}
      />
    </div>
  )
}

/** Allows editing of an coded expression */
export const CodedLocalizedStringEditor = (props: {
  value: CodedLocalizedString
  onChange: (codedLocalizedString: CodedLocalizedString) => void
  locale: string
}) => {
  return (
    <div>
      <LabeledProperty label="String" key="value">
        <PropertyEditor obj={props.value} onChange={props.onChange} property="value">
          {(value, onChange) => <LocalizedTextPropertyEditor value={value} onChange={onChange} locale={props.locale} />}
        </PropertyEditor>
      </LabeledProperty>
      <LabeledProperty label="As Prop Name" key="name">
        <PropertyEditor obj={props.value} onChange={props.onChange} property="name">
          {(value, onChange) => <TextInput value={value} onChange={(v) => onChange(v || "")} />}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}
