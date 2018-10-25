import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { ExprValidator } from 'mwater-expressions';
import { ContextVar, createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect } from '../propertyEditors';
import { ContextVarExpr, ColumnValuesEditor } from '../columnValues';

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

