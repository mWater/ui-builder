import { ActionDef, Action } from "./actions";
import { OpenPageAction, OpenPageActionDef } from "./actions/openPage";
import { AddRowAction, AddRowActionDef } from "./actions/addRow";
import { GotoUrlAction, GotoUrlActionDef } from "./actions/gotoUrl";

/** Library of actions */
export class ActionLibrary {
  /** Creates an action from an action def */
  createAction(actionDef: ActionDef): Action<ActionDef>  {
    switch(actionDef.type) {
      case "openPage":
        return new OpenPageAction(actionDef as OpenPageActionDef)
      case "addRow":
        return new AddRowAction(actionDef as AddRowActionDef)
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
          pageType: "normal",
          widgetId: null,
          contextVarValues: {}
        }
      case "addRow": 
        return {
          type: "addRow",
          table: null,
          columnValues: {}
        }
      case "gotoUrl": 
        return {
          type: "gotoUrl"
        }
    }
    throw new Error("Unknown action type")
  }

  /** Get a list of all known action types */
  getActionTypes(): Array<{ type: string, name: string }> {
    return [
      { type: "openPage", name: "Open Page" },
      { type: "addRow", name: "Add Row" },
      { type: "gotoUrl", name: "Goto URL" }
    ]
  }
}