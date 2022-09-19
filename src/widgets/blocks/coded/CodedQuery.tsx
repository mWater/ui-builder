import { Schema, DataSource, Expr, ExprValidator } from "mwater-expressions"
import React from "react"
import { ListEditorComponent } from "react-library/lib/ListEditorComponent"
import { Checkbox, FormGroup, NumberInput, TextInput } from "react-library/lib/bootstrap"
import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { OrderBy, ContextVar, createExprVariables, TableSelect, OrderByArrayEditor } from "../../.."

/** Query that is available as a prop */
export interface CodedQuery {
  /** Name of the query. Will be exposed as prop */
  name: string

  selects: { alias: string; expr: Expr }[]
  distinct?: boolean
  from: string
  where?: Expr
  orderBy?: OrderBy[]
  limit?: number | null
}

/** Edits coded queries. */
export function CodedQueriesEditor(props: {
  value?: CodedQuery[] | null
  onChange: (value: CodedQuery[]) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) {
  const { value, onChange, schema, dataSource, contextVars } = props

  function renderItem(item: CodedQuery) {
    return <div>{item.name}</div>
  }

  function createNew(): Partial<CodedQuery> {
    return {}
  }

  function renderEditor(item: Partial<CodedQuery>, onChange: (item: Partial<CodedQuery>) => void) {
    return (
      <CodedQueryEditor
        value={item}
        onChange={onChange}
        contextVars={contextVars}
        schema={schema}
        dataSource={dataSource}
      />
    )
  }

  return (
    <div>
      <ListEditorComponent
        items={value || []}
        onItemsChange={onChange}
        renderItem={renderItem}
        createNew={createNew}
        validateItem={(item) => {
          const error = validateCodedQuery(item, schema, contextVars)
          if (error) {
            alert(error)
          }
          return error == null
        }}
        renderEditor={renderEditor}
      />
    </div>
  )
}

export function CodedQueryEditor(props: {
  value: Partial<CodedQuery>
  onChange: (value: Partial<CodedQuery>) => void
  schema: Schema
  dataSource: DataSource
  contextVars: ContextVar[]
}) {
  const { value, onChange, schema, dataSource, contextVars } = props

  function renderSelect(
    select: { alias: string; expr: Expr },
    index: number,
    onSelectChange: (select: { alias: string; expr: Expr }) => void
  ) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: 10 }}>
        <TextInput
          value={select.alias}
          onChange={(alias) => {
            onSelectChange({ ...select, alias: alias || "" })
          }}
          style={{ display: "inline-block", width: "6em" }}
        />
        <ExprComponent
          value={select.expr}
          schema={schema}
          dataSource={dataSource}
          table={value.from}
          onChange={(expr) => {
            onSelectChange({ ...select, expr })
          }}
          variables={createExprVariables(contextVars)}
        />
      </div>
    )
  }

  return (
    <div>
      <FormGroup label="Name of query" hint="Passed in as prop">
        <TextInput value={value.name || null} onChange={(name) => onChange({ ...value, name: name || "" })} />
      </FormGroup>
      <hr />
      <FormGroup label="From">
        <TableSelect
          schema={schema}
          value={value.from}
          onChange={(from) => {
            onChange({ ...value, from: from || undefined })
          }}
          locale="en"
        />
      </FormGroup>
      <Checkbox
        value={value.distinct || false}
        onChange={(distinct) => {
          onChange({ ...value, distinct })
        }}
      >
        Distinct
      </Checkbox>
      {value.from ? (
        <div>
          <FormGroup label="Select">
            <ListEditorComponent
              items={value.selects || []}
              onItemsChange={(selects) => {
                onChange({ ...value, selects })
              }}
              renderItem={renderSelect}
              createNew={() => ({ name: "", expr: null })}
            />
          </FormGroup>
          <FormGroup label="Where">
            <FilterExprComponent
              schema={schema}
              value={value.where}
              onChange={(where) => {
                onChange({ ...value, where })
              }}
              dataSource={dataSource}
              table={value.from}
              variables={createExprVariables(contextVars)}
            />
          </FormGroup>
          <FormGroup label="Order">
            <OrderByArrayEditor
              value={value.orderBy}
              onChange={(orderBy) => {
                onChange({ ...value, orderBy })
              }}
              table={value.from}
              contextVars={contextVars}
              schema={schema}
              dataSource={dataSource}
            />
          </FormGroup>
          <FormGroup label="Limit">
            <NumberInput
              value={value.limit}
              onChange={(limit) => {
                onChange({ ...value, limit })
              }}
              decimal={false}
            />
          </FormGroup>
        </div>
      ) : null}
    </div>
  )
}

/** Validate a coded query, returning null if ok, or error */
export function validateCodedQuery(codedQuery: Partial<CodedQuery>, schema: Schema, contextVars: ContextVar[]) {
  if (!codedQuery.name) {
    return "Name required"
  }
  if (!codedQuery.selects) {
    return "Selects required"
  }
  if (!codedQuery.from) {
    return "From required"
  }

  const exprValidator = new ExprValidator(schema, createExprVariables(contextVars))

  for (const select of codedQuery.selects) {
    const error = exprValidator.validateExpr(select.expr, {
      table: codedQuery.from,
      aggrStatuses: ["aggregate", "literal", "individual"]
    })
    if (error) {
      return error
    }
  }

  const whereError = exprValidator.validateExpr(codedQuery.where || null, {
    table: codedQuery.from,
    types: ["boolean"]
  })
  if (whereError) {
    return whereError
  }

  // Validate orderBy
  for (const orderBy of codedQuery.orderBy || []) {
    const error = exprValidator.validateExpr(orderBy.expr, { table: codedQuery.from })
    if (error) {
      return error
    }
  }

  return null
}
