"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Actions are how blocks interact with things outside of themselves */
class Action {
    constructor(actionDef) {
        this.actionDef = actionDef;
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props) { return null; }
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar, widgetLibrary) { return []; }
}
exports.Action = Action;
//# sourceMappingURL=actions.js.map