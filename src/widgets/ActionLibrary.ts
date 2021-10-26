import { ActionDef, Action } from "./actions"
import { OpenPageAction, OpenPageActionDef } from "./actions/openPage"
import { AddRowAction, AddRowActionDef } from "./actions/addRow"
import { GotoUrlAction, GotoUrlActionDef } from "./actions/gotoUrl"
import { RemoveRowAction, RemoveRowActionDef } from "./actions/removeRow"
import { BrowserBackAction, BrowserBackActionDef } from "./actions/browserBack"
import { RefreshDataAction, RefreshDataActionDef } from "./actions/refreshData"

/** Library of actions */
export class ActionLibrary {
  customActions: {
    type: string
    name: string

    /** Creates a default action definition */
    actionDefFactory: (type: string) => ActionDef

    /** Creates an action */
    actionFactory: (actionDef: ActionDef) => Action<ActionDef>
  }[]

  constructor() {
    this.customActions = []
  }

  registerCustomAction(
    type: string,
    name: string,
    actionDefFactory: (type: string) => ActionDef,
    actionFactory: (actionDef: ActionDef) => Action<ActionDef>
  ) {
    this.customActions.push({ type, name, actionDefFactory, actionFactory })
  }

  /** Creates an action from an action def */
  createAction(actionDef: ActionDef): Action<ActionDef> {
    switch (actionDef.type) {
      case "openPage":
        return new OpenPageAction(actionDef as OpenPageActionDef)
      case "addRow":
        return new AddRowAction(actionDef as AddRowActionDef)
      case "removeRow":
        return new RemoveRowAction(actionDef as RemoveRowActionDef)
      case "gotoUrl":
        return new GotoUrlAction(actionDef as GotoUrlActionDef)
      case "browserBack":
        return new BrowserBackAction(actionDef as BrowserBackActionDef)
      case "refreshData":
        return new RefreshDataAction(actionDef as RefreshDataActionDef)
    }

    for (const customAction of this.customActions) {
      if (customAction.type == actionDef.type) {
        return customAction.actionFactory(actionDef)
      }
    }
    throw new Error("Unknown action type")
  }

  /** Create a new action def with defaults set of the specified type */
  createNewActionDef(type: string): ActionDef {
    switch (type) {
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
      case "browserBack":
        return {
          type: "browserBack"
        } as BrowserBackActionDef
      case "refreshData":
        return {
          type: "refreshData"
        } as RefreshDataActionDef
    }

    for (const customAction of this.customActions) {
      if (customAction.type == type) {
        return customAction.actionDefFactory(type)
      }
    }

    throw new Error("Unknown action type")
  }

  /** Get a list of all known action types */
  getActionTypes(): Array<{ type: string; name: string }> {
    const list = [
      { type: "openPage", name: "Open Page" },
      { type: "addRow", name: "Add Row" },
      { type: "removeRow", name: "Remove Row" },
      { type: "gotoUrl", name: "Goto URL" },
      { type: "browserBack", name: "Browser Back" },
      { type: "refreshData", name: "Refresh Data" }
    ]

    for (const customAction of this.customActions) {
      list.push({ type: customAction.type, name: customAction.name })
    }

    return list
  }
}
