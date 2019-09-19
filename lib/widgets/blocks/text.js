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
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var mwater_expressions_1 = require("mwater-expressions");
var _ = __importStar(require("lodash"));
var d3_format_1 = require("d3-format");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var ListEditor_1 = __importDefault(require("../ListEditor"));
var moment_1 = __importDefault(require("moment"));
var TextBlock = /** @class */ (function (_super) {
    __extends(TextBlock, _super);
    function TextBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextBlock.prototype.getContextVarExprs = function (contextVar) {
        if (this.blockDef.embeddedExprs) {
            return _.compact(_.map(this.blockDef.embeddedExprs, function (ee) { return ee.contextVarId === contextVar.id ? ee.expr : null; }));
        }
        return [];
    };
    TextBlock.prototype.validate = function (options) {
        // Validate expressions
        if (this.blockDef.embeddedExprs) {
            var _loop_1 = function (embeddedExpr) {
                // Validate cv
                var contextVar = options.contextVars.find(function (cv) { return cv.id === embeddedExpr.contextVarId && (cv.type === "rowset" || cv.type === "row"); });
                if (!contextVar) {
                    return { value: "Context variable required" };
                }
                var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
                var error = void 0;
                // Validate expr
                error = exprValidator.validateExpr(embeddedExpr.expr, { table: contextVar.table });
                if (error) {
                    return { value: error };
                }
            };
            for (var _i = 0, _a = this.blockDef.embeddedExprs; _i < _a.length; _i++) {
                var embeddedExpr = _a[_i];
                var state_1 = _loop_1(embeddedExpr);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        return null;
    };
    TextBlock.prototype.renderText = function (content) {
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
        return React.createElement(this.blockDef.style, { style: style }, content);
    };
    TextBlock.prototype.renderDesign = function (props) {
        var text = localization_1.localize(this.blockDef.text, props.locale);
        return this.renderText(text ? text : React.createElement("span", { className: "text-muted" }, "Text"));
    };
    TextBlock.prototype.renderInstance = function (props) {
        var text = localization_1.localize(this.blockDef.text, props.locale);
        // Get any embedded expression values
        var exprValues = _.map(this.blockDef.embeddedExprs || [], function (ee) { return props.getContextVarExprValue(ee.contextVarId, ee.expr); });
        // Format and replace
        for (var i = 0; i < exprValues.length; i++) {
            var str = void 0;
            var expr = this.blockDef.embeddedExprs[i].expr;
            var exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(expr);
            var format = this.blockDef.embeddedExprs[i].format;
            var value = exprValues[i];
            if (value == null) {
                str = "";
            }
            else {
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
            }
            text = text.replace("{" + i + "}", str);
        }
        return this.renderText(text);
    };
    TextBlock.prototype.renderEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "text" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "div", label: "Plain Text" },
                            { value: "p", label: "Paragraph" },
                            { value: "h1", label: "Heading 1" },
                            { value: "h2", label: "Heading 2" },
                            { value: "h3", label: "Heading 3" },
                            { value: "h4", label: "Heading 4" }
                        ] });
                })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "bold" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Bold"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "italic" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Italic"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "underline" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Underline"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "left", onChange: onChange, options: [
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) },
                            { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "embeddedExprs" }, function (value, onChange) {
                    var handleAddEmbeddedExpr = function () {
                        onChange((value || []).concat([{ contextVarId: null, expr: null, format: null }]));
                    };
                    return (React.createElement("div", null,
                        React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onChange }, function (item, onItemChange) {
                            return React.createElement(EmbeddedExprEditor, { value: item, onChange: onItemChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars });
                        }),
                        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddEmbeddedExpr }, "+ Add Embedded Expression")));
                }))));
    };
    return TextBlock;
}(LeafBlock_1.default));
exports.TextBlock = TextBlock;
/** Allows editing of an embedded expression */
var EmbeddedExprEditor = /** @class */ (function (_super) {
    __extends(EmbeddedExprEditor, _super);
    function EmbeddedExprEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleExprChange = function (expr) {
            var exprType = new mwater_expressions_1.ExprUtils(_this.props.schema, blocks_1.createExprVariables(_this.props.contextVars)).getExprType(_this.props.value.expr);
            var newExprType = new mwater_expressions_1.ExprUtils(_this.props.schema, blocks_1.createExprVariables(_this.props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                _this.props.onChange(__assign(__assign({}, _this.props.value), { expr: expr, format: null }));
            }
            else {
                _this.props.onChange(__assign(__assign({}, _this.props.value), { expr: expr }));
            }
        };
        return _this;
    }
    EmbeddedExprEditor.prototype.render = function () {
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        var _this = this;
        var contextVar = this.props.contextVars.find(function (cv) { return cv.id === _this.props.value.contextVarId; });
        var exprType = new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "contextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: _this.props.contextVars, types: ["row", "rowset"] }); })),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                        React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.props.value.expr, onChange: this.handleExprChange, schema: this.props.schema, dataSource: this.props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: blocks_1.createExprVariables(this.props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })); }))
                : null));
    };
    return EmbeddedExprEditor;
}(React.Component));
