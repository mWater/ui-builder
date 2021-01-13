import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, RenderActionEditorProps } from '../actions';
import { ExprValidator, LiteralExpr, Expr, ExprUtils, LiteralType } from 'mwater-expressions';
import { ContextVar, createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect } from '../propertyEditors';
import { ColumnValuesEditor } from '../columnValues';
import { InstanceCtx, DesignCtx } from '../../contexts';
import { evalContextVarExpr } from '../evalContextVarExpr';
import { ContextVarExpr } from '../../ContextVarExpr';

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
      const contextVar = contextVarExpr.contextVarId ? instanceCtx.contextVars.find(cv => cv.id == contextVarExpr.contextVarId)! : null
      row[columnId] = await evalContextVarExpr({ 
        contextVar, 
        contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
        ctx: instanceCtx,
        expr: contextVarExpr.expr
      })
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

    // Override for special case of allowing to set joins
    const idTable = column.type == "join" ? column.join!.toTable : column.idTable
    const type = column.type == "join" ? "id" : column.type as LiteralType
    
    // Validate expr
    let error
    error = exprValidator.validateExpr(contextVarExpr.expr, { 
      table: contextVar ? contextVar.table : undefined, 
      types: [type],
      idTable: idTable
    })
    if (error) {
      return error
    }
  
    return null
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

