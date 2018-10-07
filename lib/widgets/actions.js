/** Actions are how blocks interact with things outside of themselves */
export class Action {
    constructor(actionDef) {
        this.actionDef = actionDef;
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props) { return null; }
}
//# sourceMappingURL=actions.js.map