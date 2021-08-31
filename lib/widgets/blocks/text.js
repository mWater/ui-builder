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
exports.TextBlock = void 0;
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const localization_1 = require("../localization");
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
const embeddedExprs_1 = require("../../embeddedExprs");
const textual_1 = require("./textual");
class TextBlock extends textual_1.TextualBlock {
    getContextVarExprs(contextVar) {
        if (this.blockDef.embeddedExprs) {
            return _.compact(_.map(this.blockDef.embeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null));
        }
        return [];
    }
    validate(options) {
        // Validate expressions
        return (0, embeddedExprs_1.validateEmbeddedExprs)({
            embeddedExprs: this.blockDef.embeddedExprs || [],
            schema: options.schema,
            contextVars: options.contextVars
        });
    }
    renderDesign(props) {
        let text = (0, localization_1.localize)(this.blockDef.text, props.locale);
        // Replace expressions with name
        const exprUtils = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars));
        if (this.blockDef.embeddedExprs) {
            for (let i = 0; i < this.blockDef.embeddedExprs.length; i++) {
                if (this.blockDef.embeddedExprs[i].expr) {
                    text = text.replace(`{${i}}`, "{" + exprUtils.summarizeExpr(this.blockDef.embeddedExprs[i].expr, props.locale) + "}");
                }
            }
        }
        let node;
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
    }
    renderInstance(instanceCtx) {
        let text = (0, localization_1.localize)(this.blockDef.text, instanceCtx.locale);
        // Get any embedded expression values
        const exprValues = _.map(this.blockDef.embeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr));
        // Format and replace
        text = (0, embeddedExprs_1.formatEmbeddedExprString)({
            text: text,
            embeddedExprs: this.blockDef.embeddedExprs || [],
            exprValues: exprValues,
            schema: instanceCtx.schema,
            contextVars: instanceCtx.contextVars,
            locale: instanceCtx.locale,
            formatLocale: instanceCtx.formatLocale
        });
        let node;
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
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Text" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "text" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, multiline: this.blockDef.multiline || this.blockDef.markdown || this.blockDef.html, allowCR: this.blockDef.multiline || this.blockDef.markdown || this.blockDef.html }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "embeddedExprs" }, (value, onChange) => (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })))),
            this.renderTextualEditor(props)));
    }
}
exports.TextBlock = TextBlock;
