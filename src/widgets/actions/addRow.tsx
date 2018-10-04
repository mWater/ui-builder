import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps, ValidateActionOptions } from '../actions';
import { Expr } from 'mwater-expressions';
import * as _ from 'lodash'
import { ContextVar } from '../blocks';

interface ContextVarExpr {
  /** Optional context variable which expression is based on. Can be null for literal expression */
  contextVarId: string | null,
  
  /** Expression to generate column values */
  expr: Expr
}

export interface AddRowActionDef extends ActionDef {
  type: "addRow"
  table: string | null

  /** Expressions to generate column values */
  columnValues: { [columnId: string]: ContextVarExpr };  
}

export class AddRowAction extends Action<AddRowActionDef> {
  performAction(options: PerformActionOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }

  validate(options: ValidateActionOptions) {
    // TODO
    return null
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVar: ContextVar) {
    // Get ones for the specified context var
    return Object.values(this.actionDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr)
  }
  
  renderEditor(props: RenderActionEditorProps) {
    return <div>Test</div>
  }
}