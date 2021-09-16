"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionLibrary = void 0;
const openPage_1 = require("./actions/openPage");
const addRow_1 = require("./actions/addRow");
const gotoUrl_1 = require("./actions/gotoUrl");
const removeRow_1 = require("./actions/removeRow");
const browserBack_1 = require("./actions/browserBack");
const refreshData_1 = require("./actions/refreshData");
/** Library of actions */
class ActionLibrary {
    constructor() {
        this.customActions = [];
    }
    registerCustomAction(type, name, actionDefFactory, actionFactory) {
        this.customActions.push({ type, name, actionDefFactory, actionFactory });
    }
    /** Creates an action from an action def */
    createAction(actionDef) {
        switch (actionDef.type) {
            case "openPage":
                return new openPage_1.OpenPageAction(actionDef);
            case "addRow":
                return new addRow_1.AddRowAction(actionDef);
            case "removeRow":
                return new removeRow_1.RemoveRowAction(actionDef);
            case "gotoUrl":
                return new gotoUrl_1.GotoUrlAction(actionDef);
            case "browserBack":
                return new browserBack_1.BrowserBackAction(actionDef);
            case "refreshData":
                return new refreshData_1.RefreshDataAction(actionDef);
        }
        for (const customAction of this.customActions) {
            if (customAction.type == actionDef.type) {
                return customAction.actionFactory(actionDef);
            }
        }
        throw new Error("Unknown action type");
    }
    /** Create a new action def with defaults set of the specified type */
    createNewActionDef(type) {
        switch (type) {
            case "openPage":
                return {
                    type: "openPage",
                    pageType: "modal",
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
            case "browserBack":
                return {
                    type: "browserBack"
                };
            case "refresh":
                return {
                    type: "refreshData"
                };
        }
        for (const customAction of this.customActions) {
            if (customAction.type == type) {
                return customAction.actionDefFactory(type);
            }
        }
        throw new Error("Unknown action type");
    }
    /** Get a list of all known action types */
    getActionTypes() {
        const list = [
            { type: "openPage", name: "Open Page" },
            { type: "addRow", name: "Add Row" },
            { type: "removeRow", name: "Remove Row" },
            { type: "gotoUrl", name: "Goto URL" },
            { type: "browserBack", name: "Browser Back" },
            { type: "refreshData", name: "Refresh Data" }
        ];
        for (const customAction of this.customActions) {
            list.push({ type: customAction.type, name: customAction.name });
        }
        return list;
    }
}
exports.ActionLibrary = ActionLibrary;
