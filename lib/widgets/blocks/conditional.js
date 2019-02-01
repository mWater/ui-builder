"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
class ConditionalBlock extends CompoundBlock_1.default {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars }];
        }
        return [];
    }
    validate(options) {
        let error;
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"));
        if (!contextVar) {
            return "Context variable required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        return null;
    }
    processChildren(action) {
        return immer_1.default(this.blockDef, draft => {
            if (draft.content) {
                draft.content = action(draft.content);
            }
        });
    }
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, immer_1.default((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        // Check expression value
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("div", null, props.renderChildBlock(props, this.blockDef.content));
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId);
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional Expression" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "expr" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], variables: blocks_1.createExprVariables(props.contextVars), table: contextVar.table })))
                : null));
    }
}
exports.ConditionalBlock = ConditionalBlock;
//# sourceMappingURL=conditional.js.map