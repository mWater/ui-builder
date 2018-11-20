import * as React from 'react';
import * as _ from 'lodash'
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { ExprValidator, LiteralExpr, Expr, ExprUtils } from 'mwater-expressions';
import { ContextVar, createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect, ContextVarPropertyEditor } from '../propertyEditors';
import { ContextVarExpr, ColumnValuesEditor } from '../columnValues';
import { ExprComponent } from 'mwater-expressions-ui';

export interface RemoveRowActionDef extends ActionDef {
  type: "removeRow"

  /** Context variable (row) to use for expression */
  contextVarId: string | null

  /** Expression that generates id of row to be deleted */
  idExpr: Expr
}

export class RemoveRowAction extends Action<RemoveRowActionDef> {
  async performAction(options: PerformActionOptions): Promise<void> {
    // Remove row
    const table = new ExprUtils(options.schema, createExprVariables(options.contextVars)).getExprIdTable(this.actionDef.idExpr)
    const id = options.getContextVarExprValue(this.actionDef.contextVarId!, this.actionDef.idExpr)

    // Do nothing if no row
    if (!id) {
      return
    }

    const txn = options.database.transaction()
    await txn.removeRow(table!, id)
    await txn.commit()
  }

  validate(options: ValidateActionOptions) {
    // Validate cv
    const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId && cv.type === "row")
    if (!contextVar) {
      return "Context variable required"
    }

    const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars))
    let error: string | null
    
    // Validate expr
    if (!this.actionDef.idExpr) {
      return "Missing id expression"
    }

    error = exprValidator.validateExpr(this.actionDef.idExpr, { table: contextVar.table, types: ["id"] })
    if (error) {
      return error
    }

    return null
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVar: ContextVar) {
    return (contextVar.id === this.actionDef.contextVarId && this.actionDef.idExpr) ? [this.actionDef.idExpr] : [] 
  }
  
  renderEditor(props: RenderActionEditorProps) {
    const contextVar = props.contextVars.find(cv => cv.id === this.actionDef.contextVarId)
 
    return (
      <div>
        <LabeledProperty label="Row Variable">
          <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="contextVarId">
            {(value, onChange) => <ContextVarPropertyEditor value={value} onChange={onChange} contextVars={props.contextVars} types={["row"]} />}
          </PropertyEditor>
        </LabeledProperty>

        { contextVar && contextVar.table 
          ?
          <LabeledProperty label="Id Expression">
            <PropertyEditor obj={this.actionDef} onChange={props.onChange} property="idExpr">
              {(value, onChange) => 
                <ExprComponent 
                  value={value} 
                  onChange={onChange} 
                  schema={props.schema} 
                  dataSource={props.dataSource} 
                  aggrStatuses={["individual", "literal"]}
                  variables={createExprVariables(props.contextVars)}
                  types={["id"]}
                  table={contextVar.table!}/>
              }
              </PropertyEditor>
            </LabeledProperty>
          : null }
      </div>
    )            
  }
}

