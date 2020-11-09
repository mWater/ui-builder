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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextBlock = void 0;
var React = __importStar(require("react"));
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var localization_1 = require("../localization");
var mwater_expressions_1 = require("mwater-expressions");
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
        // Replace expressions with name
        var exprUtils = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars));
        if (this.blockDef.embeddedExprs) {
            for (var i = 0; i < this.blockDef.embeddedExprs.length; i++) {
                if (this.blockDef.embeddedExprs[i].expr) {
                    text = text.replace("{" + i + "}", "{" + exprUtils.summarizeExpr(this.blockDef.embeddedExprs[i].expr, props.locale) + "}");
                }
            }
        }
        var node;
        if (this.blockDef.html) {
            node = this.processHTML(text);
        }
        else if (this.blockDef.markdown) {
            node = this.processMarkdown(text);
        }
        else {
            node = text;
        }
        return this.renderText(text ? node : React.createElement("span", { className: "text-muted" }, "Text"));
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
        var node;
        if (this.blockDef.html) {
            node = this.processHTML(text);
        }
        else if (this.blockDef.markdown) {
            node = this.processMarkdown(text);
        }
        else {
            node = text;
        }
        return this.renderText(node);
    };
    TextBlock.prototype.renderEditor = function (props) {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "text" }, function (value, onChange) {
                    return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, multiline: _this.blockDef.multiline || _this.blockDef.markdown || _this.blockDef.html, allowCR: _this.blockDef.multiline || _this.blockDef.markdown || _this.blockDef.html });
                })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "embeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })); })),
            this.renderTextualEditor(props)));
    };
    return TextBlock;
}(textual_1.TextualBlock));
exports.TextBlock = TextBlock;
