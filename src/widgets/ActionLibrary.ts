import { ActionDef, Action } from "./actions";
import { OpenPageAction, OpenPageActionDef } from "./actions/openPage";
import { AddRowAction, AddRowActionDef } from "./actions/addRow";
import { GotoUrlAction, GotoUrlActionDef } from "./actions/gotoUrl";
import { RemoveRowAction, RemoveRowActionDef } from "./actions/removeRow";

/** Library of actions */
export class ActionLibrary {
  /** Creates an action from an action def */
  createAction(actionDef: ActionDef): Action<ActionDef>  {
    switch(actionDef.type) {
      case "openPage":
        return new OpenPageAction(actionDef as OpenPageActionDef)
      case "addRow":
        return new AddRowAction(actionDef as AddRowActionDef)
      case "removeRow":
        return new RemoveRowAction(actionDef as RemoveRowActionDef)
      case "gotoUrl":
        return new GotoUrlAction(actionDef as GotoUrlActionDef)
    }
    throw new Error("Unknown action type")
  }

  /** Create a new action def with defaults set of the specified type */
  createNewActionDef(type: string): ActionDef {
    switch(type) {
      case "openPage":
        return {
          type: "openPage",
          pageType: "modal",
          widgetId: null,
          contextVarValues: {}
        } as OpenPageActionDef
      case "addRow": 
        return {
          type: "addRow",
          table: null,
          columnValues: {}
        } as AddRowActionDef
      case "removeRow": 
        return {
          type: "removeRow",
          contextVarId: null,
          idExpr: null
        } as RemoveRowActionDef
      case "gotoUrl": 
        return {
          type: "gotoUrl"
        } as GotoUrlActionDef
    }
    throw new Error("Unknown action type")
  }

  /** Get a list of all known action types */
  getActionTypes(): Array<{ type: string, name: string }> {
    return [
      { type: "openPage", name: "Open Page" },
      { type: "addRow", name: "Add Row" },
      { type: "removeRow", name: "Remove Row" },
      { type: "gotoUrl", name: "Goto URL" }
    ]
  }
}