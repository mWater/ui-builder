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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionBlock = void 0;
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const mwater_expressions_1 = require("mwater-expressions");
const d3Format = __importStar(require("d3-format"));
const moment_1 = __importDefault(require("moment"));
const textual_1 = require("./textual");
const localization_1 = require("../localization");
class ExpressionBlock extends textual_1.TextualBlock {
    getContextVarExprs(contextVar) {
        return contextVar.id === this.blockDef.contextVarId && this.blockDef.expr ? [this.blockDef.expr] : [];
    }
    validate(ctx) {
        return (0, blocks_1.validateContextVarExpr)({
            schema: ctx.schema,
            contextVars: ctx.contextVars,
            contextVarId: this.blockDef.contextVarId,
            expr: this.blockDef.expr
        });
    }
    renderDesign(props) {
        let summary = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale);
        if (summary.length > 20) {
            summary = summary.substr(0, 20) + "...";
        }
        return this.renderText(React.createElement("div", null,
            React.createElement("span", { className: "text-muted" }, "<"),
            summary,
            React.createElement("span", { className: "text-muted" }, ">")));
    }
    renderInstance(props) {
        if (!this.blockDef.expr) {
            return React.createElement("div", null);
        }
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        const exprType = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars)).getExprType(this.blockDef.expr);
        const formatLocale = props.formatLocale || d3Format;
        let str;
        if (value == null) {
            str = "";
        }
        else {
            if (exprType === "number") {
                // d3 multiplies by 100 when appending a percentage. Remove this behaviour for consistency
                if ((this.blockDef.format || "").includes("%")) {
                    str = formatLocale.format(this.blockDef.format || "")(value / 100.0);
                }
                else {
                    str = formatLocale.format(this.blockDef.format || "")(value);
                }
            }
            else if (exprType === "date" && value != null) {
                str = (0, moment_1.default)(value, moment_1.default.ISO_8601).format(this.blockDef.format || "ll");
            }
            else if (exprType === "datetime" && value != null) {
                str = (0, moment_1.default)(value, moment_1.default.ISO_8601).format(this.blockDef.format || "lll");
            }
            else if (exprType == "boolean") {
                if (value == true) {
                    str = this.blockDef.trueLabel ? (0, localization_1.localize)(this.blockDef.trueLabel, props.locale) : "True";
                }
                else if (value == false) {
                    str = this.blockDef.falseLabel ? (0, localization_1.localize)(this.blockDef.falseLabel, props.locale) : "False";
                }
                else {
                    str = "";
                }
            }
            else {
                str = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale);
            }
        }
        let node;
        if (this.blockDef.html) {
            node = this.processHTML(str);
        }
        else if (this.blockDef.markdown) {
            node = this.processMarkdown(str);
        }
        else {
            node = str;
        }
        return this.renderText(node);
    }
    renderEditor(props) {
        const contextVar = this.blockDef.contextVarId
            ? props.contextVars.find((cv) => cv.id === this.blockDef.contextVarId) || null
            : null;
        const exprType = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars)).getExprType(this.blockDef.expr);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                React.createElement(propertyEditors_1.ContextVarAndExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: contextVar && contextVar.type == "row"
                        ? ["individual", "literal"]
                        : ["individual", "aggregate", "literal"], contextVarId: this.blockDef.contextVarId, expr: this.blockDef.expr, onChange: (contextVarId, expr) => {
                        props.store.replaceBlock(Object.assign(Object.assign({}, this.blockDef), { contextVarId, expr }));
                    } })),
            exprType === "number" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, (value, onChange) => React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange })))) : null,
            exprType === "date" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, (value, onChange) => React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })))) : null,
            exprType === "datetime" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, (value, onChange) => React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })))) : null,
            exprType === "boolean" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Display True As" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "trueLabel" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "True" }))))) : null,
            exprType === "boolean" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Display False As" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "falseLabel" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "False" }))))) : null,
            this.renderTextualEditor(props)));
    }
}
exports.ExpressionBlock = ExpressionBlock;
