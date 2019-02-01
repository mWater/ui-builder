"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const d3_format_1 = require("d3-format");
const moment_1 = __importDefault(require("moment"));
class ExpressionBlock extends LeafBlock_1.default {
    getContextVarExprs(contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    }
    validate(options) {
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"));
        if (!contextVar) {
            return "Context variable required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        let error;
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table });
        if (error) {
            return error;
        }
        return null;
    }
    renderDesign(props) {
        const summary = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale);
        return (React.createElement("div", null,
            React.createElement("span", { className: "text-muted" }, "<"),
            summary,
            React.createElement("span", { className: "text-muted" }, ">")));
    }
    renderInstance(props) {
        if (!this.blockDef.contextVarId || !this.blockDef.expr) {
            return React.createElement("div", null);
        }
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        const exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        let str;
        if (exprType === "number" && value != null) {
            str = d3_format_1.format(this.blockDef.format || "")(value);
        }
        else if (exprType === "date" && value != null) {
            str = moment_1.default(value, moment_1.default.ISO_8601).format(this.blockDef.format || "ll");
        }
        else if (exprType === "datetime" && value != null) {
            str = moment_1.default(value, moment_1.default.ISO_8601).format(this.blockDef.format || "lll");
        }
        else {
            str = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale);
        }
        return (React.createElement("div", null, str));
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId);
        const exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        const handleExprChange = (expr) => {
            // Clear format if type different
            const newExprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                props.onChange(Object.assign({}, this.blockDef, { expr: expr, format: null }));
            }
            else {
                props.onChange(Object.assign({}, this.blockDef, { expr: expr }));
            }
        };
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                        React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.blockDef.expr, onChange: handleExprChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: blocks_1.createExprVariables(props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
exports.ExpressionBlock = ExpressionBlock;
//# sourceMappingURL=expression.js.map