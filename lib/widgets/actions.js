"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Actions are how blocks interact with things outside of themselves */
var Action = /** @class */ (function () {
    function Action(actionDef) {
        this.actionDef = actionDef;
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    Action.prototype.renderEditor = function (props) { return null; };
    /** Get any context variables expressions that this action needs */
    Action.prototype.getContextVarExprs = function (contextVar, widgetLibrary) { return []; };
    return Action;
}());
exports.Action = Action;
