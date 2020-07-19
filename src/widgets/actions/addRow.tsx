import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { ExprValidator, LiteralExpr, Expr, ExprUtils } from 'mwater-expressions';
import { ContextVar, createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect } from '../propertyEditors';
import { ContextVarExpr, ColumnValuesEditor } from '../columnValues';
import { InstanceCtx, DesignCtx } from '../../contexts';

export interface AddRowActionDef extends ActionDef {
  type: "addRow"
  table: string | null

  /** Expressions to generate column values */
  columnValues: { [columnId: string]: ContextVarExpr }
}

export class AddRowAction extends Action<AddRowActionDef> {
  async performAction(instanceCtx: InstanceCtx): Promise<void> {
    // Create row to insert
    const row = {}

    for (const columnId of Object.keys(this.actionDef.columnValues)) {
      const contextVarExpr: ContextVarExpr = this.actionDef.columnValues[columnId]
      row[columnId] = instanceCtx.getContextVarExprValue(contextVarExpr.contextVarId!, contextVarExpr.expr) 
    }

    const txn = instanceCtx.database.transaction()
    await txn.addRow(this.actionDef.table!, row)
    await txn.commit()
  }

  validate(designCtx: DesignCtx) {
    // Check that table is present
    if (!this.actionDef.table || !designCtx.schema.getTable(this.actionDef.table)) {
      return "Table required"
    }

    // Check each column value
    for (const columnId of Object.keys(this.actionDef.columnValues)) {
      const error = this.validateColumnValue(designCtx, columnId)
      if (error) {
        return error
      }
    }
    return null
  }

  validateColumnValue(designCtx: DesignCtx, columnId: string): string | null {
    // Check that column exists
    const column = designCtx.schema.getColumn(this.actionDef.table!, columnId)
    if (!column) {
      return "Column not found"
    }

    const exprValidator = new ExprValidator(designCtx.schema, createExprVariables(designCtx.contextVars))
    const exprUtils = new ExprUtils(designCtx.schema, createExprVariables(designCtx.contextVars))

    // Check context var
    const contextVarExpr: ContextVarExpr = this.actionDef.columnValues[columnId]
    let contextVar: ContextVar | undefined

    if (contextVarExpr.contextVarId) {
      contextVar = designCtx.contextVars.find(cv => cv.id === contextVarExpr.contextVarId)
      if (!contextVar || !contextVar.table) {
        return "Context variable not found"
      }
    }
    else {
      contextVar = undefined
      // Must be literal
      const aggrStatus = exprUtils.getExprAggrStatus(contextVarExpr.expr)
      if (aggrStatus && aggrStatus !== "literal") {
        return "Literal value required"
      }
    }

    // Validate expr
    let error
    error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar ? contextVar.table : undefined, types: [column.type] })
    if (error) {
      return error
    }
  
    return null
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVar: ContextVar): Expr[] {
    // Get ones for the specified context var
    return Object.values(this.actionDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr)
  }
  
  renderEditor(props: RenderActionEditorProps) {
    const onChange = props.onChange as (actionDef: AddRowActionDef) => void

    return (
      <div>
        <LabeledProperty label="Table">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="table">
            {(value, onChange) => 
              <TableSelect schema={props.schema} locale={props.locale} value={value} onChange={onChange}/>
            }
          </PropertyEditor>
        </LabeledProperty>
        { this.actionDef.table ? 
        <LabeledProperty label="Column Values">
          <PropertyEditor obj={this.actionDef} onChange={onChange} property="columnValues">
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

