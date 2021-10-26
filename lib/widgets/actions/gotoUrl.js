"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GotoUrlAction = void 0;
const react_1 = __importDefault(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const embeddedExprs_1 = require("../../embeddedExprs");
const evalContextVarExpr_1 = require("../evalContextVarExpr");
/** Opens a URL optionally in a new tab */
class GotoUrlAction extends actions_1.Action {
    validate(designCtx) {
        // Check that url is present
        if (!this.actionDef.url) {
            return "URL required";
        }
        // Validate expressions
        const err = (0, embeddedExprs_1.validateEmbeddedExprs)({
            embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (err) {
            return err;
        }
        return null;
    }
    renderEditor(props) {
        const onChange = props.onChange;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "URL" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "url" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value || null, onChange: onChange }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "URL embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "urlEmbeddedExprs" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })))),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "newTab" }, (value, onChange) => (react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Open in new tab")))));
    }
    performAction(instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.actionDef.url;
            // Get any embedded expression values
            const exprValues = [];
            for (const ee of this.actionDef.urlEmbeddedExprs || []) {
                const contextVar = ee.contextVarId ? instanceCtx.contextVars.find((cv) => cv.id == ee.contextVarId) : null;
                exprValues.push(yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                    contextVar,
                    contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                    ctx: instanceCtx,
                    expr: ee.expr
                }));
            }
            // Format and replace
            url = (0, embeddedExprs_1.formatEmbeddedExprString)({
                text: url,
                embeddedExprs: this.actionDef.urlEmbeddedExprs || [],
                exprValues: exprValues,
                schema: instanceCtx.schema,
                contextVars: instanceCtx.contextVars,
                locale: instanceCtx.locale,
                formatLocale: instanceCtx.formatLocale
            });
            window.open(url, this.actionDef.newTab ? "_blank" : "_self");
        });
    }
}
exports.GotoUrlAction = GotoUrlAction;
