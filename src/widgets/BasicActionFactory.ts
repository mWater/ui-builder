import { ActionFactory, ActionDef, Action } from "./actions";
import { OpenPageAction, OpenPageActionDef } from "./actions/openPage";
import { AddRowAction, AddRowActionDef } from "./actions/addRow";


export class BasicActionFactory implements ActionFactory {
  newActionDefs: { [type: string]: ActionDef }

  constructor() {
    this.newActionDefs = {}
  }

  /** Create an action from an action def */
  createAction(actionDef: ActionDef): Action<ActionDef> {
    switch(actionDef.type) {
      case "openPage":
        return new OpenPageAction(actionDef as OpenPageActionDef)
      case "addRow":
        return new AddRowAction(actionDef as AddRowActionDef)
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
    }
    throw new Error("Unknown action type")
  }

  /** Get a list of all known action types */
  getActionTypes(): Array<{ type: string, name: string }> {
    return [
      { type: "openPage", name: "Open Page" },
      { type: "addRow", name: "Add Row" }
    ]
  }
}