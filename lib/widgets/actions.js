"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
/** Actions are how blocks interact with things outside of themselves.
 * Actions can depend on context variables, but they do not have
 * context variable expressions computed for them. They need to calculate
 * them as needed using evalContextVarExpr themselves.
 */
class Action {
    constructor(actionDef) {
        this.actionDef = actionDef;
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props) { return null; }
}
exports.Action = Action;
