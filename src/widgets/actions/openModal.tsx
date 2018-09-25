import * as React from 'react';
import { ActionDef, Action, PerformActionOptions, RenderActionEditorProps } from '../actions';
import { Expr } from 'mwater-expressions';
import * as _ from 'lodash'

/** Direct reference to another context variable */
interface ContextVarRef {
  type: "ref"
  
  /** Context variable whose value should be used */
  contextVarId: string | null,
}

/** Action which opens a modal window */
export interface OpenModalActionDef extends ActionDef {
  type: "openModal"

  /** id of the widget that will be displayed in the modal */
  widgetId: string | null

  /** Values of context variables that widget inside modal needs */
  contextVarValues: { [contextVarId: string]: ContextVarRef };  
}

export class OpenModalAction extends Action<OpenModalActionDef> {
  
  performAction(options: PerformActionOptions): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
  /** Render an optional property editor for the action. This may use bootstrap */
  renderEditor(props: RenderActionEditorProps): React.ReactElement<any> | null { return null }

}

 