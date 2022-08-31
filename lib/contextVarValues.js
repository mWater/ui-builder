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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContextVarValue = exports.ContextVarValueEditor = void 0;
const React = __importStar(require("react"));
const blocks_1 = require("./widgets/blocks");
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
/** Allows editing of the value for one context variable */
class ContextVarValueEditor extends React.Component {
    render() {
        const value = this.props.contextVarValue;
        if (this.props.contextVar.type === "row") {
            if (!this.props.schema.getTable(this.props.contextVar.table)) {
                return React.createElement("div", null, "Uneditable");
            }
            return (React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.props.onContextVarValueChange }));
        }
        if (this.props.contextVar.type === "rowset") {
            if (!this.props.schema.getTable(this.props.contextVar.table)) {
                return React.createElement("div", null, "Uneditable");
            }
            return (React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.props.onContextVarValueChange, variables: (0, blocks_1.createExprVariables)(this.props.availContextVars) }));
        }
        return (React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: [this.props.contextVar.type], idTable: this.props.contextVar.idTable, enumValues: this.props.contextVar.enumValues, value: value, onChange: this.props.onContextVarValueChange, variables: (0, blocks_1.createExprVariables)(this.props.availContextVars), preferLiteral: true }));
    }
}
exports.ContextVarValueEditor = ContextVarValueEditor;
/** Validate a context var value */
function validateContextVarValue(schema, contextVar, allContextVars, value) {
    const exprValidator = new mwater_expressions_1.ExprValidator(schema, (0, blocks_1.createExprVariables)(allContextVars));
    // Check type
    if (contextVar.type == "row") {
        if (value != null && typeof value != "string" && typeof value != "number") {
            return `Invalid value for row variable ${contextVar.name}`;
        }
    }
    else if (contextVar.type == "rowset") {
        // rowset must be a boolean expression
        const error = exprValidator.validateExpr(value, { table: contextVar.table, types: ["boolean"] });
        if (error) {
            return error;
        }
    }
    else {
        const error = exprValidator.validateExpr(value, { types: [contextVar.type] });
        if (error) {
            return error;
        }
    }
    return null;
}
exports.validateContextVarValue = validateContextVarValue;
