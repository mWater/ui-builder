"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionLibrary = void 0;
var openPage_1 = require("./actions/openPage");
var addRow_1 = require("./actions/addRow");
var gotoUrl_1 = require("./actions/gotoUrl");
var removeRow_1 = require("./actions/removeRow");
var browserBack_1 = require("./actions/browserBack");
/** Library of actions */
var ActionLibrary = /** @class */ (function () {
    function ActionLibrary() {
        this.customActions = [];
    }
    ActionLibrary.prototype.registerCustomAction = function (type, name, actionDefFactory, actionFactory) {
        this.customActions.push({ type: type, name: name, actionDefFactory: actionDefFactory, actionFactory: actionFactory });
    };
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
            case "browserBack":
                return new browserBack_1.BrowserBackAction(actionDef);
        }
        for (var _i = 0, _a = this.customActions; _i < _a.length; _i++) {
            var customAction = _a[_i];
            if (customAction.type == actionDef.type) {
                return customAction.actionFactory(actionDef);
            }
        }
        throw new Error("Unknown action type");
    };
    /** Create a new action def with defaults set of the specified type */
    ActionLibrary.prototype.createNewActionDef = function (type) {
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
        }
        for (var _i = 0, _a = this.customActions; _i < _a.length; _i++) {
            var customAction = _a[_i];
            if (customAction.type == type) {
                return customAction.actionDefFactory(type);
            }
        }
        throw new Error("Unknown action type");
    };
    /** Get a list of all known action types */
    ActionLibrary.prototype.getActionTypes = function () {
        var list = [
            { type: "openPage", name: "Open Page" },
            { type: "addRow", name: "Add Row" },
            { type: "removeRow", name: "Remove Row" },
            { type: "gotoUrl", name: "Goto URL" },
            { type: "browserBack", name: "Browser Back" }
        ];
        for (var _i = 0, _a = this.customActions; _i < _a.length; _i++) {
            var customAction = _a[_i];
            list.push({ type: customAction.type, name: customAction.name });
        }
        return list;
    };
    return ActionLibrary;
}());
exports.ActionLibrary = ActionLibrary;
