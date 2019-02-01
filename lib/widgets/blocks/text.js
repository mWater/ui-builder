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
const localization_1 = require("../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
const d3_format_1 = require("d3-format");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const ListEditor_1 = __importDefault(require("../ListEditor"));
const moment_1 = __importDefault(require("moment"));
class TextBlock extends LeafBlock_1.default {
    getContextVarExprs(contextVar) {
        if (this.blockDef.embeddedExprs) {
            return _.compact(_.map(this.blockDef.embeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null));
        }
        return [];
    }
    validate(options) {
        // Validate expressions
        if (this.blockDef.embeddedExprs) {
            for (const embeddedExpr of this.blockDef.embeddedExprs) {
                // Validate cv
                const contextVar = options.contextVars.find(cv => cv.id === embeddedExpr.contextVarId && (cv.type === "rowset" || cv.type === "row"));
                if (!contextVar) {
                    return "Context variable required";
                }
                const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
                let error;
                // Validate expr
                error = exprValidator.validateExpr(embeddedExpr.expr, { table: contextVar.table });
                if (error) {
                    return error;
                }
            }
        }
        return null;
    }
    renderText(content) {
        const style = {};
        if (this.blockDef.bold) {
            style.fontWeight = "bold";
        }
        if (this.blockDef.italic) {
            style.fontStyle = "italic";
        }
        if (this.blockDef.underline) {
            style.textDecoration = "underline";
        }
        return React.createElement(this.blockDef.style, { style: style }, content);
    }
    renderDesign(props) {
        const text = localization_1.localize(this.blockDef.text, props.locale);
        return this.renderText(text ? text : React.createElement("span", { className: "text-muted" }, "Text"));
    }
    renderInstance(props) {
        let text = localization_1.localize(this.blockDef.text, props.locale);
        // Get any embedded expression values
        const exprValues = _.map(this.blockDef.embeddedExprs || [], ee => props.getContextVarExprValue(ee.contextVarId, ee.expr));
        // Format and replace
        for (let i = 0; i < exprValues.length; i++) {
            let str;
            const expr = this.blockDef.embeddedExprs[i].expr;
            const exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(expr);
            const format = this.blockDef.embeddedExprs[i].format;
            const value = exprValues[i];
            if (exprType === "number" && value != null) {
                str = d3_format_1.format(format || "")(value);
            }
            else if (exprType === "date" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(format || "ll");
            }
            else if (exprType === "datetime" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(format || "lll");
            }
            else {
                str = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).stringifyExprLiteral(expr, value, props.locale);
            }
            text = text.replace(`{${i}}`, str);
        }
        return this.renderText(text);
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "text" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                        { value: "div", label: "Plain Text" },
                        { value: "p", label: "Paragraph" },
                        { value: "h1", label: "Heading 1" },
                        { value: "h2", label: "Heading 2" },
                        { value: "h3", label: "Heading 3" },
                        { value: "h4", label: "Heading 4" }
                    ] }))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "bold" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Bold")),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "italic" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Italic")),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "underline" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Underline")),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "embeddedExprs" }, (value, onChange) => {
                    const handleAddEmbeddedExpr = () => {
                        onChange((value || []).concat([{ contextVarId: null, expr: null, format: null }]));
                    };
                    return (React.createElement("div", null,
                        React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onChange }, (item, onItemChange) => React.createElement(EmbeddedExprEditor, { value: item, onChange: onItemChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })),
                        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddEmbeddedExpr }, "+ Add Embedded Expression")));
                }))));
    }
}
exports.TextBlock = TextBlock;
/** Allows editing of an embedded expression */
class EmbeddedExprEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            const exprType = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr);
            const newExprType = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                this.props.onChange(Object.assign({}, this.props.value, { expr: expr, format: null }));
            }
            else {
                this.props.onChange(Object.assign({}, this.props.value, { expr: expr }));
            }
        };
    }
    render() {
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        const contextVar = this.props.contextVars.find(cv => cv.id === this.props.value.contextVarId);
        const exprType = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: this.props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                        React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.props.value.expr, onChange: this.handleExprChange, schema: this.props.schema, dataSource: this.props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: blocks_1.createExprVariables(this.props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
//# sourceMappingURL=text.js.map