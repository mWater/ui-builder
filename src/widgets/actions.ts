import * as React from 'react'
import { ContextVar } from './blocks';
import { Database } from '../Database';
import { WidgetLibrary } from '../designer/widgetLibrary';
import { PageStack } from '../PageStack';
import { ActionLibrary } from './ActionLibrary';
import { Schema } from 'mwater-expressions';

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

  /** Action being edited */
  actionDef: ActionDef

  /** Widget library that lists all available widgets */
  widgetLibrary: WidgetLibrary

  onChange(actionDef: ActionDef): void
}

export interface PerformActionOptions {
  /** locale to display (e.g. "en") */
  locale: string
  database: Database
  pageStack: PageStack

  /** Context variables for the action */
  contextVars: ContextVar[]

  /** Gets the value of a context variable */
  getContextVarValue(contextVarId: string): any
}

export interface ValidateActionOptions {
  schema: Schema
  contextVars: ContextVar[]

  /** Widget library that lists all available widgets */
  widgetLibrary: WidgetLibrary
}

/** Actions are how blocks interact with things outside of themselves */
export abstract class Action<T extends ActionDef> {
  actionDef: T

  constructor(actionDef: T) {
    this.actionDef = actionDef
  }

  /** Determine if action is valid. null means valid, string is error message */
  abstract validate(options: ValidateActionOptions): string | null

  /** Get any context variables expressions that this action needs TODO needed? */
  // getContextVarExprs(contextVarId: string): Expr[] { return [] }

  /** Perform the action, returning a promise that fulfills when complete */
  abstract performAction(options: PerformActionOptions): Promise<void>
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { return null }
}