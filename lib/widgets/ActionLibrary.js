import { OpenPageAction } from "./actions/openPage";
import { AddRowAction } from "./actions/addRow";
/** Library of actions */
export class ActionLibrary {
    /** Creates an action from an action def */
    createAction(actionDef) {
        switch (actionDef.type) {
            case "openPage":
                return new OpenPageAction(actionDef);
            case "addRow":
                return new AddRowAction(actionDef);
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
        }
        throw new Error("Unknown action type");
    }
    /** Get a list of all known action types */
    getActionTypes() {
        return [
            { type: "openPage", name: "Open Page" },
            { type: "addRow", name: "Add Row" }
        ];
    }
}
//# sourceMappingURL=ActionLibrary.js.map