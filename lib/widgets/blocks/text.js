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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var _ = __importStar(require("lodash"));
var embeddedExprs_1 = require("../../embeddedExprs");
var textual_1 = require("./textual");
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
    TextBlock.prototype.renderDesign = function (props) {
        var text = localization_1.localize(this.blockDef.text, props.locale);
        return this.renderText(text ? text : React.createElement("span", { className: "text-muted" }, "Text"));
    };
    TextBlock.prototype.renderInstance = function (instanceCtx) {
        var text = localization_1.localize(this.blockDef.text, instanceCtx.locale);
        // Get any embedded expression values
        var exprValues = _.map(this.blockDef.embeddedExprs || [], function (ee) { return instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr); });
        // Format and replace
        text = embeddedExprs_1.formatEmbeddedExprString({
            text: text,
            embeddedExprs: this.blockDef.embeddedExprs || [],
            exprValues: exprValues,
            schema: instanceCtx.schema,
            contextVars: instanceCtx.contextVars,
            locale: instanceCtx.locale,
            formatLocale: instanceCtx.formatLocale
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
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "embeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); })),
            this.renderTextualEditor(props)));
    };
    return TextBlock;
}(textual_1.TextualBlock));
exports.TextBlock = TextBlock;
