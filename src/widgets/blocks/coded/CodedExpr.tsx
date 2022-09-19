import { Expr, Schema, DataSource } from "mwater-expressions"
import React from "react"
import { TextInput } from "react-library/lib/bootstrap"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { ContextVar, LabeledProperty, ContextVarAndExprPropertyEditor, PropertyEditor } from "../../.."

/** Expression that is available as a prop */
export interface CodedExpr {
  /** Name of the expression. Will be exposed as prop */
  name: string

  /** Context variable (row or rowset) to use for expression */
  contextVarId: string | null

  /** Expression to evaluate */
  expr: Expr
}

/** Edits coded expressions. */
export function CodedExprsEditor(props: {
  value?: CodedExpr[] | null
  onChange: (value: CodedExpr[]) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) {
  const { value, onChange, schema, dataSource, contextVars } = props

  return (
    <div>
      <ListEditorComponent
        items={value || []}
        onItemsChange={onChange}
        renderItem={(item, index, onItemChange) => (
          <CodedExprEditor
            value={item}
            onChange={onItemChange}
            schema={schema}
            dataSource={dataSource}
            contextVars={contextVars} />
        )}
        createNew={() => ({ contextVarId: null, expr: null, name: "" })} />
    </div>
  )
}

/** Allows editing of an coded expression */
export const CodedExprEditor = (props: {
  value: CodedExpr
  onChange: (codedExpr: CodedExpr) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) => {
  const { schema, dataSource, contextVars } = props

  const handleChange = (contextVarId: string | null, expr: Expr) => {
    props.onChange({ ...props.value, contextVarId: contextVarId, expr: expr })
  }

  return (
    <div>
      <LabeledProperty label="Expression" key="expr">
        <ContextVarAndExprPropertyEditor
          contextVarId={props.value.contextVarId}
          expr={props.value.expr}
          onChange={handleChange}
          schema={schema}
          dataSource={dataSource}
          contextVars={contextVars}
          aggrStatuses={["individual", "aggregate", "literal"]}
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
