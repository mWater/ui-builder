import { Expr, Schema, DataSource } from "mwater-expressions";
import React from "react";
import { ContextVar } from "./blocks";
import produce from "immer";
import { localize } from "./localization";
import { LabeledProperty, ContextVarPropertyEditor } from "./propertyEditors";
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

  handleContextVarChange = (columnId: string, contextVarId: string) => {
    this.props.onChange(produce(this.props.value, (draft) => {
      draft[columnId].contextVarId = contextVarId
    }))
  }

  handleExprChange = (columnId: string, expr: Expr) => {
    this.props.onChange(produce(this.props.value, (draft) => {
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

    return <tr>
      <td>{localize(column.name, this.props.locale)}</td>
      <td>
        <LabeledProperty label="Variable">
          <ContextVarPropertyEditor 
            contextVars={this.props.contextVars} 
            value={contextVarExpr.contextVarId} 
            onChange={this.handleContextVarChange.bind(null, columnId)}
            allowNone={true}
            types={["row", "rowset"]}
            />
        </LabeledProperty>
        <LabeledProperty label="Expression">
          <ExprComponent 
            schema={this.props.schema} 
            dataSource={this.props.dataSource}
            idTable={column.idTable || (column.type === "join" ? column.join!.toTable : undefined)}
            enumValues={column.enumValues}
            table={contextVar ? contextVar.table! : null}
            value={contextVarExpr.expr}
            onChange={this.handleExprChange.bind(null, columnId)}
          />
        </LabeledProperty>
      </td>
      <td>
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