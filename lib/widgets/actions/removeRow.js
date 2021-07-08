"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRowAction = void 0;
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
/** Remove a single row specified by a context variable */
class RemoveRowAction extends actions_1.Action {
    async performAction(instanceCtx) {
        const contextVar = instanceCtx.contextVars.find(cv => cv.id === this.actionDef.contextVarId);
        // Remove row
        const table = contextVar.table;
        const id = instanceCtx.contextVarValues[this.actionDef.contextVarId];
        // Do nothing if no row
        if (!id) {
            return;
        }
        const txn = instanceCtx.database.transaction();
        await txn.removeRow(table, id);
        await txn.commit();
    }
    validate(designCtx) {
        // Validate cv
        const contextVar = designCtx.contextVars.find(cv => cv.id === this.actionDef.contextVarId && cv.type === "row");
        if (!contextVar) {
            return "Context variable required";
        }
        return null;
    }
    renderEditor(props) {
        const onChange = props.onChange;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row Variable to delete" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "contextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] })))));
    }
}
exports.RemoveRowAction = RemoveRowAction;
