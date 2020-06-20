import _ from 'lodash'
import { Expr, Schema, DataSource, LiteralType } from "mwater-expressions";
import React from "react";
import { ContextVar } from "./blocks";
import produce from "immer";
import { localize } from "./localization";
import { LabeledProperty, ContextVarPropertyEditor, ContextVarExprPropertyEditor } from "./propertyEditors";
import { ExprComponent } from "mwater-expressions-ui";
import ReactSelect from 'react-select'

/** Expression based on a context variable */
export interface ContextVarExpr {
  /** Context variable which expression is based on. Null for literal-only */
  contextVarId: string | null,
  
  /** Expression to generate column values */
  expr: Expr
}

export interface ColumnValues { 
  [columnId: string]: ContextVarExpr 
}

/** Allows editing list of column values for add */
export class ColumnValuesEditor extends React.Component<{
  value: ColumnValues
  onChange: (value: ColumnValues) => void
  schema: Schema
  dataSource: DataSource
  table: string
  contextVars: ContextVar[]
  locale: string
}> {

  handleContextVarExprChange = (columnId: string, contextVarId: string | null, expr: Expr) => {
    this.props.onChange(produce(this.props.value, (draft) => {
      draft[columnId].contextVarId = contextVarId
      draft[columnId].expr = expr
    }))
  }

  handleRemove = (columnId: string) => {
    this.props.onChange(produce(this.props.value, (draft) => {
      delete draft[columnId]
    }))
  }

  handleAdd = (option?: { label: string, value: string }) => {
    if (option) {
      this.props.onChange(produce(this.props.value, (draft) => {
        draft[option.value] = { contextVarId: null, expr: null }
      }))
    }
  }

  renderColumn(columnId: string) {
    const column = this.props.schema.getColumn(this.props.table, columnId)
    if (!column) {
      return null
    }
    const contextVarExpr: ContextVarExpr = this.props.value[columnId]!

    const contextVar = this.props.contextVars.find(cv => cv.id === contextVarExpr.contextVarId)

    // Get type of column
    const columnType = (column.type === "join") ? "id" : column.type

    return <tr key={columnId}>
      <td key="name">{localize(column.name, this.props.locale)}</td>
      <td key="value">
        <LabeledProperty label="Expression">
          <ContextVarExprPropertyEditor 
            contextVarId={contextVarExpr.contextVarId} 
            expr={contextVarExpr.expr}
            onChange={this.handleContextVarExprChange.bind(null, columnId)}
            contextVars={this.props.contextVars} 
            schema={this.props.schema} 
            dataSource={this.props.dataSource}
            idTable={column.idTable || (column.type === "join" ? column.join!.toTable : undefined)}
            enumValues={column.enumValues}
            types={[columnType as LiteralType]}
          />
        </LabeledProperty>
      </td>
      <td key="remove">
        <i className="fa fa-remove" onClick={this.handleRemove.bind(null, columnId)}/>
      </td>
    </tr>
  }

  render() {
    const options = _.sortBy(this.props.schema.getColumns(this.props.table).map(column => ({ value: column.id, label: localize(column.name, this.props.locale)})), "label")

    // Render list of existing ones in order
    return <div>
      <table className="table table-bordered table-condensed">
        <tbody>
          { Object.keys(this.props.value).sort().map(columnId => this.renderColumn(columnId)) }
        </tbody>
      </table>

      <ReactSelect value={null} options={options} onChange={this.handleAdd} />
    </div>
  }
}