"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var openPage_1 = require("./actions/openPage");
var addRow_1 = require("./actions/addRow");
var gotoUrl_1 = require("./actions/gotoUrl");
var removeRow_1 = require("./actions/removeRow");
/** Library of actions */
var ActionLibrary = /** @class */ (function () {
    function ActionLibrary() {
    }
    /** Creates an action from an action def */
    ActionLibrary.prototype.createAction = function (actionDef) {
        switch (actionDef.type) {
            case "openPage":
                return new openPage_1.OpenPageAction(actionDef);
            case "addRow":
                return new addRow_1.AddRowAction(actionDef);
            case "removeRow":
                return new removeRow_1.RemoveRowAction(actionDef);
            case "gotoUrl":
                return new gotoUrl_1.GotoUrlAction(actionDef);
        }
        throw new Error("Unknown action type");
    };
    /** Create a new action def with defaults set of the specified type */
    ActionLibrary.prototype.createNewActionDef = function (type) {
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
    };
    /** Get a list of all known action types */
    ActionLibrary.prototype.getActionTypes = function () {
        return [
            { type: "openPage", name: "Open Page" },
            { type: "addRow", name: "Add Row" },
            { type: "removeRow", name: "Remove Row" },
            { type: "gotoUrl", name: "Goto URL" }
        ];
    };
    return ActionLibrary;
}());
exports.ActionLibrary = ActionLibrary;
