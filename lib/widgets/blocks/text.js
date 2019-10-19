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
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var _ = __importStar(require("lodash"));
var embeddedExprs_1 = require("../../embeddedExprs");
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
        return embeddedExprs_1.validateEmbeddedExprs({
            embeddedExprs: this.blockDef.embeddedExprs || [],
            schema: options.schema,
            contextVars: options.contextVars
        });
    };
    TextBlock.prototype.getClassName = function () {
        if (this.blockDef.color) {
            return "text-" + this.blockDef.color;
        }
        return "";
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
        if (this.blockDef.multiline) {
            style.whiteSpace = "pre-line";
        }
        return React.createElement(this.blockDef.style, { style: style, className: this.getClassName() }, content);
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
        text = embeddedExprs_1.formatEmbeddedExprString({
            text: text,
            embeddedExprs: this.blockDef.embeddedExprs || [],
            exprValues: exprValues,
            schema: props.schema,
            contextVars: props.contextVars,
            locale: props.locale
        });
        return this.renderText(text);
    };
    TextBlock.prototype.renderEditor = function (props) {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "text" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, multiline: _this.blockDef.multiline, allowCR: _this.blockDef.multiline });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [
                            { value: "div", label: "Plain Text" },
                            { value: "p", label: "Paragraph" },
                            { value: "h1", label: "Heading 1" },
                            { value: "h2", label: "Heading 2" },
                            { value: "h3", label: "Heading 3" },
                            { value: "h4", label: "Heading 4" },
                            { value: "h5", label: "Heading 5" }
                        ] });
                })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "bold" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Bold"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "italic" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Italic"); }),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "underline" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Underline"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Alignment" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "align" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Toggle, { value: value || "left", onChange: onChange, options: [
                            { value: "left", label: React.createElement("i", { className: "fa fa-align-left" }) },
                            { value: "center", label: React.createElement("i", { className: "fa fa-align-center" }) },
                            { value: "right", label: React.createElement("i", { className: "fa fa-align-right" }) },
                            { value: "justify", label: React.createElement("i", { className: "fa fa-align-justify" }) }
                        ] });
                })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "multiline" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Multi-line"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Color" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "color" }, function (value, onChange) {
                    return React.createElement(bootstrap_1.Select, { value: value || null, onChange: onChange, options: [
                            { value: null, label: "Default" },
                            { value: "muted", label: "Muted" },
                            { value: "primary", label: "Primary" },
                            { value: "info", label: "Info" },
                            { value: "success", label: "Success" },
                            { value: "warning", label: "Warning" },
                            { value: "danger", label: "Danger" }
                        ] });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "embeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); }))));
    };
    return TextBlock;
}(LeafBlock_1.default));
exports.TextBlock = TextBlock;
