"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
/** Remove a single row specified by a context variable */
class RemoveRowAction extends actions_1.Action {
    performAction(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextVar = options.contextVars.find(cv => cv.id === this.actionDef.contextVarId);
            // Remove row
            const table = contextVar.table;
            const id = options.contextVarValues[this.actionDef.contextVarId];
            // Do nothing if no row
            if (!id) {
                return;
            }
            const txn = options.database.transaction();
            yield txn.removeRow(table, id);
            yield txn.commit();
        });
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
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row Variable to delete" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] })))));
    }
}
exports.RemoveRowAction = RemoveRowAction;
//# sourceMappingURL=removeRow.js.map