import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { Expr, ExprValidator, Schema, LiteralExpr, DataSource } from 'mwater-expressions';
import * as _ from 'lodash'
import { ContextVar, createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect, ContextVarPropertyEditor } from '../propertyEditors';
import { localize } from '../localization';
import produce from 'immer';
import { ExprComponent } from 'mwater-expressions-ui';

interface ContextVarExpr {
  /** Context variable which expression is based on */
  contextVarId: string | null,
  
  /** Expression to generate column values */
  expr: Expr
}

export interface AddRowActionDef extends ActionDef {
  type: "addRow"
  table: string | null

  /** Expressions to generate column values */
  columnValues: { [columnId: string]: ContextVarExpr }
}

export class AddRowAction extends Action<AddRowActionDef> {
  async performAction(options: PerformActionOptions): Promise<void> {
    // Create row to insert
    const row = {}

    for (const columnId of Object.keys(this.actionDef.columnValues)) {
      const contextVarExpr: ContextVarExpr = this.actionDef.columnValues[columnId]

      row[columnId] = options.getContextVarExprValue(contextVarExpr.contextVarId!, contextVarExpr.expr)
    }

    const txn = options.database.transaction()
    await txn.addRow(this.actionDef.table!, row)
    await txn.commit()
  }

  validate(options: ValidateActionOptions) {
    // Check that table is present
    if (!this.actionDef.table || !options.schema.getTable(this.actionDef.table)) {
      return "Table required"
    }

    // Check each column value
    for (const columnId of Object.keys(this.actionDef.columnValues)) {
      const error = this.validateColumnValue(options, columnId)
      if (error) {
        return error
      }
    }
    return null
  }

  validateColumnValue(options: ValidateActionOptions, columnId: string): string | null {
    // Check that column exists
    const column = options.schema.getColumn(this.actionDef.table!, columnId)
    if (!column) {
      return "Column not found"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))

    // Get type of column
    const columnType = (column.type === "join") ? "id" : column.type

    // Check context var
    const contextVarExpr: ContextVarExpr = this.actionDef.columnValues[columnId]
    if (!contextVarExpr.contextVarId) {
      return "Context variable required"
    }

    const contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId)
    if (!contextVar || !contextVar.table) {
      return "Context variable not found"
    }

    // Validate expr
    let error
    error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar.table, types: [columnType] })
    if (error) {
      return error
    }
  
    return null
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVar: ContextVar) {
    // Get ones for the specified context var
    return Object.values(this.actionDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr)
  }
  
  renderEditor(props: RenderActionEditorProps) {
    return (
      <div>
        <LabeledProperty label="Table">
          <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="table">
            {(value, onChange) => 
              <TableSelect schema={props.schema} locale={props.locale} value={value} onChange={onChange}/>
            }
          </PropertyEditor>
        </LabeledProperty>
        { this.actionDef.table ? 
        <LabeledProperty label="Column Values">
          <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="columnValues">
            {(value, onChange) => 
              <ColumnValuesEditor 
                value={value} 
                onChange={onChange}
                schema={props.schema} 
                dataSource={props.dataSource}
                table={this.actionDef.table!}
                contextVars={props.contextVars}
                locale={props.locale}
                />}
          </PropertyEditor>
        </LabeledProperty>
        : null }
      </div>
    )
  }
}

/** Allows editing list of column values for add */
class ColumnValuesEditor extends React.Component<{
  value: { [columnId: string]: ContextVarExpr }
  onChange: (value: { [columnId: string]: ContextVarExpr }) => void
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

  renderColumn(columnId: string) {
    const column = this.props.schema.getColumn(this.props.table, columnId)
    if (!column) {
      return null
    }
    const contextVarExpr: ContextVarExpr = this.props.value.columnValues[columnId]!

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
            types={["row", "rowset"]}
            />
        </LabeledProperty>
        { contextVar ? 
          <LabeledProperty label="Expression">
            <ExprComponent 
              schema={this.props.schema} 
              dataSource={this.props.dataSource}
              idTable={column.idTable || (column.type === "join" ? column.join!.toTable : undefined)}
              enumValues={column.enumValues}
              table={contextVar.table!}
              value={contextVarExpr.expr}
              onChange={this.handleExprChange.bind(null, columnId)}
            />
          </LabeledProperty>
        : null }
      </td>
      <td>
        <i className="fa fa-remove" onClick={this.handleRemove.bind(null, columnId)}/>/>
      </td>
    </tr>
  }

  render() {
    // Render list of existing ones in order
    return <div>
      <table className="table table-bordered table-condensed">
        <tbody>
          { Object.keys(this.props.value).sort().map(columnId => {
            this.renderColumn(columnId)
          })}
        </tbody>
      </table>
    </div>
  }
}