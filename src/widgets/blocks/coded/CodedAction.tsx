import React from "react"
import { TextInput } from "react-library/lib/bootstrap"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { DesignCtx, LabeledProperty, ActionDefEditor, PropertyEditor } from "../../.."
import { ActionDef } from "../../actions"

/** Action that is available as a prop */
export interface CodedAction {
  /** Name of the action. Will be exposed as prop */
  name: string

  /** Expression to evaluate */
  actionDef: ActionDef | null
}

/** Edits coded actions. */
export const CodedActionsEditor = (props: {
  value?: CodedAction[] | null
  onChange: (value: CodedAction[]) => void
  designCtx: DesignCtx
}) => {
  const { value, onChange, designCtx } = props

  return (
    <div>
      <ListEditorComponent
        items={value || []}
        onItemsChange={onChange}
        renderItem={(item, index, onItemChange) => (
          <CodedActionEditor
            value={item}
            onChange={onItemChange}
            designCtx={designCtx}
          />
        )}
        createNew={() => ({ actionDef: null, name: "" })}
      />
    </div>
  )
}

/** Allows editing of an coded action */
export const CodedActionEditor = (props: {
  value: CodedAction
  onChange: (codedExpr: CodedAction) => void
  designCtx: DesignCtx
}) => {
  const { designCtx } = props

  return (
    <div>
      <LabeledProperty label="Action" key="action">
        <ActionDefEditor
          designCtx={designCtx}
          value={props.value.actionDef}
          onChange={actionDef => props.onChange({ ...props.value, actionDef })}
        />
      </LabeledProperty>
      <LabeledProperty label="As Prop Name" key="name">
        <PropertyEditor obj={props.value} onChange={props.onChange} property="name">
          {(value, onChange) => <TextInput value={value} onChange={(v) => onChange(v || "")} />}
        </PropertyEditor>
      </LabeledProperty>
    </div>
  )
}
