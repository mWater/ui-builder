import * as React from 'react';
import { Action } from '../actions';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from '../propertyEditors';
/** Remove a single row specified by a context variable */
export class RemoveRowAction extends Action {
    async performAction(options) {
        const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId);
        // Remove row
        const table = contextVar.table;
        const id = options.contextVarValues[this.actionDef.contextVarId];
        // Do nothing if no row
        if (!id) {
            return;
        }
        const txn = options.database.transaction();
        await txn.removeRow(table, id);
        await txn.commit();
    }
    validate(options) {
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId && cv.type === "row");
        if (!contextVar) {
            return "Context variable required";
        }
        return null;
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Row Variable to delete" },
                React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] })))));
    }
}
//# sourceMappingURL=removeRow.js.map