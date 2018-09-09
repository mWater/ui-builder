import * as React from 'react'
import { ContextVar } from './blocks';
import { Database } from './Database';
import { Expr } from 'mwater-expressions';

// Action definition
export interface ActionDef {
  type: string,  // Type of the action
  [index: string]: any  // Other props
}

export interface RenderActionEditorProps {
  /** Context variables for the action */
  contextVars: ContextVar[]

  /** locale of the editor (e.g. "en") */
  locale: string

  onChange(actionDef: ActionDef): void
}

export interface PerformActionOptions {
  /** locale to display (e.g. "en") */
  locale: string,
  database: Database,

  /** Context variables for the action */
  contextVars: ContextVar[],

  /** Gets the value of a context variable */
  getContextVarValue(contextVarId: string): any,
}

/** Actions are how blocks interact with things outside of themselves */
export abstract class Action<T extends ActionDef> {
  actionDef: T

  constructor(actionDef: T) {
    this.actionDef = actionDef
  }

  /** Get any context variables expressions that this action needs */
  getContextVarExprs(contextVarId: string): Expr[] { return [] }

  /** Perform the aciton, returning a promise that fulfills when complete */
  abstract performAction(options: PerformActionOptions): Promise<void>
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { return null }
}