import * as React from 'react';
import { Action } from '../actions';
export class AddRowAction extends Action {
    performAction(options) {
        throw new Error("Method not implemented.");
    }
    validate(options) {
        // TODO
        return null;
    }
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar) {
        // Get ones for the specified context var
        return Object.values(this.actionDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr);
    }
    renderEditor(props) {
        return React.createElement("div", null, "Test");
    }
}
//# sourceMappingURL=addRow.js.map