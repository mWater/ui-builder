"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var React = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var mwater_expressions_1 = require("mwater-expressions");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var d3_format_1 = require("d3-format");
var moment_1 = __importDefault(require("moment"));
var bootstrap_1 = require("react-library/lib/bootstrap");
var ExpressionBlock = /** @class */ (function (_super) {
    __extends(ExpressionBlock, _super);
    function ExpressionBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpressionBlock.prototype.getContextVarExprs = function (contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    };
    ExpressionBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate cv
        var contextVar = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"); });
        if (!contextVar) {
            return "Context variable required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        var error;
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table });
        if (error) {
            return error;
        }
        return null;
    };
    ExpressionBlock.prototype.renderDesign = function (props) {
        var summary = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale);
        var style = this.getStyle();
        var className = this.getClassName();
        return (React.createElement("div", { style: style },
            React.createElement("span", { className: "text-muted" }, "<"),
            React.createElement("span", { className: this.getClassName() }, summary),
            React.createElement("span", { className: "text-muted" }, ">")));
    };
    ExpressionBlock.prototype.getClassName = function () {
        if (this.blockDef.color) {
            return "text-" + this.blockDef.color;
        }
        return "";
    };
    ExpressionBlock.prototype.getStyle = function () {
        var style = {};
        if (this.blockDef.bold) {
            style.fontWeight = "bold";
        }
        if (this.blockDef.italic) {
            style.fontStyle = "italic";
        }
        if (this.blockDef.underline) {
            style.textDecoration = "underline";
        }
        if (this.blockDef.align) {
            style.textAlign = this.blockDef.align;
        }
        if (this.blockDef.multiline) {
            style.whiteSpace = "pre-line";
        }
        return style;
    };
    ExpressionBlock.prototype.renderInstance = function (props) {
        if (!this.blockDef.contextVarId || !this.blockDef.expr) {
            return React.createElement("div", null);
        }
        var value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        var exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        var style = this.getStyle();
        var str;
        if (value == null) {
            str = "";
        }
        else {
            if (exprType === "number") {
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
        }
        return (React.createElement("div", { style: style, className: this.getClassName() }, str));
    };
    ExpressionBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarId; });
        var exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        var handleExprChange = function (expr) {
            // Clear format if type different
            var newExprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                props.onChange(__assign(__assign({}, _this.blockDef), { expr: expr, format: null }));
            }
            else {
                props.onChange(__assign(__assign({}, _this.blockDef), { expr: expr }));
            }
        };
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }); })),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                        React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.blockDef.expr, onChange: handleExprChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: blocks_1.createExprVariables(props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "bold" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Bold"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "italic" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Italic"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "underline" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Underline"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "multiline" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Multi-line"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "left", onChange: onChange, options: [
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) },
                            { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Color" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "color" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value || null, onChange: onChange, options: [
                            { value: null, label: "Default" },
                            { value: "muted", label: "Muted" },
                            { value: "primary", label: "Primary" },
                            { value: "info", label: "Info" },
                            { value: "success", label: "Success" },
                            { value: "warning", label: "Warning" },
                            { value: "danger", label: "Danger" }
                        ] });
                }))));
    };
    return ExpressionBlock;
}(LeafBlock_1.default));
exports.ExpressionBlock = ExpressionBlock;
