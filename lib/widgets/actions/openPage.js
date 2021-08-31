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
exports.OpenPageAction = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const actions_1 = require("../actions");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = __importDefault(require("immer"));
const mwater_expressions_1 = require("mwater-expressions");
const embeddedExprs_1 = require("../../embeddedExprs");
const blocks_1 = require("../blocks");
const localization_1 = require("../localization");
const evalContextVarExpr_1 = require("../evalContextVarExpr");
const contextVarValues_1 = require("../../contextVarValues");
class OpenPageAction extends actions_1.Action {
    validate(designCtx) {
        // Find widget
        if (!this.actionDef.widgetId) {
            return "Widget required";
        }
        // Ensure that widget exists 
        const widget = designCtx.widgetLibrary.widgets[this.actionDef.widgetId];
        if (!widget) {
            return "Invalid widget";
        }
        // Ensure that all context variables are correctly mapped
        for (const widgetCV of widget.contextVars) {
            // Don't allow unmapped variables
            if (!this.actionDef.contextVarValues[widgetCV.id]) {
                return "Missing variable mapping";
            }
            // Ensure that mapping is to available context var
            const contextVarValue = this.actionDef.contextVarValues[widgetCV.id];
            if (contextVarValue.type == "ref") {
                const srcCV = designCtx.contextVars.find(cv => cv.id === contextVarValue.contextVarId);
                if (!srcCV || !areContextVarCompatible(srcCV, widgetCV)) {
                    return "Invalid context variable";
                }
            }
            else if (contextVarValue.type == "literal") {
                const error = (0, contextVarValues_1.validateContextVarValue)(designCtx.schema, widgetCV, designCtx.contextVars, contextVarValue.value);
                if (error) {
                    return error;
                }
            }
            else if (contextVarValue.type == "contextVarExpr") {
                // Not for rowset type
                if (widgetCV.type == "rowset") {
                    return "Not available for rowsets";
                }
                const error = (0, blocks_1.validateContextVarExpr)({
                    contextVarId: contextVarValue.contextVarId,
                    contextVars: designCtx.contextVars,
                    expr: contextVarValue.expr,
                    schema: designCtx.schema,
                    idTable: widgetCV.type == "row" ? widgetCV.table : widgetCV.idTable,
                    types: widgetCV.type == "row" ? ["id"] : [widgetCV.type]
                });
                if (error) {
                    return error;
                }
            }
        }
        // Validate expressions
        const err = (0, embeddedExprs_1.validateEmbeddedExprs)({
            embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (err) {
            return err;
        }
        return null;
    }
    performAction(instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            const contextVarValues = {};
            const widget = instanceCtx.widgetLibrary.widgets[this.actionDef.widgetId];
            // Perform mappings of context vars
            for (const pageCV of widget.contextVars) {
                const pageCVId = pageCV.id;
                const contextVarValue = this.actionDef.contextVarValues[pageCVId];
                if (contextVarValue.type == "ref") {
                    // Look up outer context variable
                    const outerCV = instanceCtx.contextVars.find(cv => cv.id == contextVarValue.contextVarId);
                    if (!outerCV) {
                        throw new Error("Outer context variable not found");
                    }
                    // Get value 
                    let outerCVValue = instanceCtx.contextVarValues[outerCV.id];
                    // Add filters if rowset
                    if (outerCV.type == "rowset") {
                        outerCVValue = {
                            type: "op",
                            op: "and",
                            table: outerCV.table,
                            exprs: lodash_1.default.compact([outerCVValue].concat(lodash_1.default.map(instanceCtx.getFilters(outerCV.id), f => f.expr)))
                        };
                    }
                    // Inline variables used in rowsets as they may depend on context variables that aren't present in new page
                    if (outerCV.type == "rowset") {
                        outerCVValue = new mwater_expressions_1.ExprUtils(instanceCtx.schema, (0, blocks_1.createExprVariables)(instanceCtx.contextVars)).inlineVariableValues(outerCVValue, (0, blocks_1.createExprVariableValues)(instanceCtx.contextVars, instanceCtx.contextVarValues));
                    }
                    contextVarValues[pageCVId] = outerCVValue;
                }
                else if (contextVarValue.type == "null") {
                    contextVarValues[pageCVId] = null;
                }
                else if (contextVarValue.type == "literal") {
                    contextVarValues[pageCVId] = contextVarValue.value;
                }
                else if (contextVarValue.type == "contextVarExpr") {
                    // Get widget context variable
                    const widgetCV = widget.contextVars.find(cv => cv.id == pageCVId);
                    // Evaluate value
                    const contextVar = instanceCtx.contextVars.find(cv => cv.id == contextVarValue.contextVarId);
                    const value = yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                        contextVar: contextVar,
                        contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                        ctx: instanceCtx,
                        expr: contextVarValue.expr
                    });
                    // Wrap in literal expression if not row
                    contextVarValues[pageCVId] = widgetCV.type == "row" ? value : { type: "literal", valueType: widgetCV.type, idTable: widgetCV.idTable, value };
                }
            }
            // Include global context variables
            for (const globalContextVar of instanceCtx.globalContextVars || []) {
                contextVarValues[globalContextVar.id] = instanceCtx.contextVarValues[globalContextVar.id];
            }
            // Get title
            let title = (0, localization_1.localize)(this.actionDef.title, instanceCtx.locale);
            if (title) {
                // Get any embedded expression values
                const exprValues = [];
                for (const ee of this.actionDef.titleEmbeddedExprs || []) {
                    const contextVar = ee.contextVarId ? instanceCtx.contextVars.find(cv => cv.id == ee.contextVarId) : null;
                    exprValues.push(yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                        contextVar,
                        contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                        ctx: instanceCtx,
                        expr: ee.expr
                    }));
                }
                // Format and replace
                title = (0, embeddedExprs_1.formatEmbeddedExprString)({
                    text: title,
                    embeddedExprs: this.actionDef.titleEmbeddedExprs || [],
                    exprValues: exprValues,
                    schema: instanceCtx.schema,
                    contextVars: instanceCtx.contextVars,
                    locale: instanceCtx.locale,
                    formatLocale: instanceCtx.formatLocale
                });
            }
            const page = {
                type: this.actionDef.pageType,
                modalSize: this.actionDef.modalSize || "large",
                database: instanceCtx.database,
                widgetId: this.actionDef.widgetId,
                contextVarValues: contextVarValues,
                title: title
            };
            if (this.actionDef.replacePage) {
                instanceCtx.pageStack.replacePage(page);
            }
            else {
                instanceCtx.pageStack.openPage(page);
            }
        });
    }
    /** Render an optional property editor for the action. This may use bootstrap */
    renderEditor(props) {
        // Create widget options 
        const widgetOptions = lodash_1.default.sortByAll(Object.values(props.widgetLibrary.widgets), "group", "name").map(w => ({ label: (w.group ? `${w.group}: ` : "") + w.name, value: w.id }));
        const actionDef = this.actionDef;
        const onChange = props.onChange;
        const handleWidgetIdChange = (widgetId) => {
            onChange(Object.assign(Object.assign({}, actionDef), { widgetId: widgetId, contextVarValues: {} }));
        };
        const widgetDef = actionDef.widgetId ? props.widgetLibrary.widgets[actionDef.widgetId] : null;
        const renderContextVarValue = (contextVar) => {
            const cvv = actionDef.contextVarValues[contextVar.id];
            const handleCVVTypeSelect = (cvvType) => {
                props.onChange((0, immer_1.default)(actionDef, (draft) => {
                    if (cvvType == "null") {
                        draft.contextVarValues[contextVar.id] = { type: "null" };
                    }
                    else if (cvvType == "ref") {
                        draft.contextVarValues[contextVar.id] = { type: "ref", contextVarId: null };
                    }
                    else if (cvvType == "literal") {
                        draft.contextVarValues[contextVar.id] = { type: "literal", value: null };
                    }
                    else if (cvvType == "contextVarExpr") {
                        draft.contextVarValues[contextVar.id] = { type: "contextVarExpr", contextVarId: null, expr: null };
                    }
                }));
            };
            const handleCVVChange = (newCVV) => {
                props.onChange((0, immer_1.default)(actionDef, (draft) => {
                    draft.contextVarValues[contextVar.id] = newCVV;
                }));
            };
            // Create options list
            const options = [
                { value: "null", label: "No Value" },
                { value: "ref", label: "Existing Variable" },
            ];
            // Can't calculate value for rowset
            if (contextVar.type != "rowset") {
                options.push({ value: "contextVarExpr", label: "Expression" });
            }
            options.push({ value: "literal", label: "Literal Value" });
            function renderContextVarValueEditor() {
                if (!cvv) {
                    return null;
                }
                if (cvv.type == "null") {
                    return null;
                }
                if (cvv.type == "literal") {
                    // Do not allow referencing context variables, as they will not be available in the other page
                    return react_1.default.createElement(contextVarValues_1.ContextVarValueEditor, { schema: props.schema, dataSource: props.dataSource, contextVar: contextVar, contextVarValue: cvv.value, availContextVars: [], onContextVarValueChange: value => { handleCVVChange(Object.assign(Object.assign({}, cvv), { value })); } });
                }
                if (cvv.type == "ref") {
                    const refOptions = props.contextVars
                        .filter(cv => areContextVarCompatible(cv, contextVar))
                        .map(cv => ({ value: cv.id, label: cv.name }));
                    return react_1.default.createElement(bootstrap_1.Select, { options: refOptions, value: cvv.contextVarId, onChange: value => { handleCVVChange(Object.assign(Object.assign({}, cvv), { contextVarId: value })); }, nullLabel: "Select Variable..." });
                }
                if (cvv.type == "contextVarExpr") {
                    return react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVarId: cvv.contextVarId, contextVars: props.contextVars, dataSource: props.dataSource, expr: cvv.expr, schema: props.schema, types: [contextVar.type == "row" ? "id" : contextVar.type], idTable: contextVar.type == "row" ? contextVar.table : contextVar.idTable, onChange: (contextVarId, expr) => { handleCVVChange(Object.assign(Object.assign({}, cvv), { expr, contextVarId })); } });
                }
                return "Not supported";
            }
            return (react_1.default.createElement("tr", { key: contextVar.id },
                react_1.default.createElement("td", { key: "name" }, contextVar.name),
                react_1.default.createElement("td", { key: "value" },
                    react_1.default.createElement(bootstrap_1.Select, { options: options, value: cvv ? cvv.type : null, onChange: handleCVVTypeSelect, nullLabel: "Select..." }),
                    !cvv ? react_1.default.createElement("span", { className: "text-warning" }, "Value not set") : null,
                    renderContextVarValueEditor())));
        };
        const renderContextVarValues = () => {
            if (!widgetDef) {
                return null;
            }
            return (react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
                react_1.default.createElement("tbody", null, widgetDef.contextVars.map(renderContextVarValue))));
        };
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Page Type" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "pageType" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "modal", label: "Modal" }] }))),
            this.actionDef.pageType == "modal" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Modal Size" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "modalSize" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "large", onChange: onChange, options: [
                            { value: "small", label: "Small" },
                            { value: "normal", label: "Normal" },
                            { value: "large", label: "Large" },
                            { value: "full", label: "Full-screen" }
                        ] })))
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Page Widget" },
                react_1.default.createElement(bootstrap_1.Select, { value: actionDef.widgetId, onChange: handleWidgetIdChange, options: widgetOptions, nullLabel: "Select Widget" })),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "replacePage" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Replace current page")),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" }, renderContextVarValues()),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "title" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Page Title embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "titleEmbeddedExprs" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars }))))));
    }
}
exports.OpenPageAction = OpenPageAction;
/**
 * Determine if context variables are compatible to be passed in.
 */
function areContextVarCompatible(cv1, cv2) {
    if (cv1.type != cv2.type) {
        return false;
    }
    if (cv1.table != cv2.table) {
        return false;
    }
    if (cv1.idTable != cv2.idTable) {
        return false;
    }
    if (cv1.enumValues && !cv2.enumValues) {
        return false;
    }
    if (!cv1.enumValues && cv2.enumValues) {
        return false;
    }
    if (cv1.enumValues && cv2.enumValues) {
        if (!lodash_1.default.isEqual(cv1.enumValues.map(ev => ev.id), cv2.enumValues.map(ev => ev.id))) {
            return false;
        }
    }
    return true;
}
