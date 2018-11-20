import { OpenPageAction } from "./actions/openPage";
import { AddRowAction } from "./actions/addRow";
import { GotoUrlAction } from "./actions/gotoUrl";
import { RemoveRowAction } from "./actions/removeRow";
/** Library of actions */
export class ActionLibrary {
    /** Creates an action from an action def */
    createAction(actionDef) {
        switch (actionDef.type) {
            case "openPage":
                return new OpenPageAction(actionDef);
            case "addRow":
                return new AddRowAction(actionDef);
            case "removeRow":
                return new RemoveRowAction(actionDef);
            case "gotoUrl":
                return new GotoUrlAction(actionDef);
        }
        throw new Error("Unknown action type");
    }
    /** Create a new action def with defaults set of the specified type */
    createNewActionDef(type) {
        switch (type) {
            case "openPage":
                return {
                    type: "openPage",
                    pageType: "normal",
                    widgetId: null,
                    contextVarValues: {}
                };
            case "addRow":
                return {
                    type: "addRow",
                    table: null,
                    columnValues: {}
                };
            case "removeRow":
                return {
                    type: "removeRow",
                    contextVarId: null,
                    idExpr: null
                };
            case "gotoUrl":
                return {
                    type: "gotoUrl"
                };
        }
        throw new Error("Unknown action type");
    }
    /** Get a list of all known action types */
    getActionTypes() {
        return [
            { type: "openPage", name: "Open Page" },
            { type: "addRow", name: "Add Row" },
            { type: "removeRow", name: "Remove Row" },
            { type: "gotoUrl", name: "Goto URL" }
        ];
    }
}
//# sourceMappingURL=ActionLibrary.js.map