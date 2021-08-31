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
exports.ButtonBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const propertyEditors_1 = require("../propertyEditors");
const localization_1 = require("../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const embeddedExprs_1 = require("../../embeddedExprs");
class ButtonBlock extends LeafBlock_1.default {
    validate(designCtx) {
        let error;
        // Validate expressions
        error = (0, embeddedExprs_1.validateEmbeddedExprs)({
            embeddedExprs: this.blockDef.labelEmbeddedExprs || [],
            schema: designCtx.schema,
            contextVars: designCtx.contextVars
        });
        if (error) {
            return error;
        }
        // Validate action
        if (this.blockDef.actionDef) {
            const action = designCtx.actionLibrary.createAction(this.blockDef.actionDef);
            error = action.validate(designCtx);
            if (error) {
                return error;
            }
        }
        return null;
    }
    getContextVarExprs(contextVar, ctx) {
        let exprs = [];
        if (this.blockDef.labelEmbeddedExprs) {
            exprs = exprs.concat(lodash_1.default.compact(lodash_1.default.map(this.blockDef.labelEmbeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null)));
        }
        return exprs;
    }
    renderDesign(props) {
        const label = (0, localization_1.localize)(this.blockDef.label, props.locale);
        return react_1.default.createElement(ButtonComponent, { label: label, blockDef: this.blockDef });
    }
    renderInstance(instanceCtx) {
        return react_1.default.createElement(ButtonInstance, { blockDef: this.blockDef, instanceCtx: instanceCtx });
    }
    renderEditor(props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "labelEmbeddedExprs" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Style" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "style" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                        { value: "default", label: "Default" },
                        { value: "primary", label: "Primary" },
                        { value: "link", label: "Link" },
                        { value: "plainlink", label: "Plain Link" },
                    ] }))),
            this.blockDef.style != "plainlink" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                            { value: "normal", label: "Default" },
                            { value: "small", label: "Small" },
                            { value: "extrasmall", label: "Extra-small" },
                            { value: "large", label: "Large" }
                        ] })))
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Icon" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "icon" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Select, { value: value, onChange: onChange, nullLabel: "None", options: [
                        { value: "plus", label: "Add" },
                        { value: "pencil", label: "Edit" },
                        { value: "times", label: "Remove" },
                        { value: "print", label: "Print" },
                        { value: "upload", label: "Upload" },
                        { value: "download", label: "Download" },
                        { value: "info-circle", label: "Information" },
                        { value: "link", label: "Link" },
                        { value: "external-link", label: "External Link" },
                        { value: "search", label: "Search" },
                        { value: "question-circle", label: "Help" },
                        { value: "folder-open", label: "Open" },
                        { value: "refresh", label: "Refresh" },
                        { value: "arrow-right", label: "Right Arrow" }
                    ] }))),
            this.blockDef.style != "plainlink" ?
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "block" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Block-style"))
                : null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "When button clicked" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "actionDef" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: props })))),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Confirm message" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "confirmMessage" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.ButtonBlock = ButtonBlock;
function ButtonInstance(props) {
    const { instanceCtx, blockDef } = props;
    // Track when action in process
    const [busy, setBusy] = (0, react_1.useState)(false);
    const handleClick = (ev) => __awaiter(this, void 0, void 0, function* () {
        // Ensure button doesn't trigger other actions
        ev.stopPropagation();
        // Confirm if confirm message
        if (blockDef.confirmMessage) {
            if (!confirm((0, localization_1.localize)(blockDef.confirmMessage, instanceCtx.locale))) {
                return;
            }
        }
        // Run action
        if (blockDef.actionDef) {
            const action = instanceCtx.actionLibrary.createAction(blockDef.actionDef);
            try {
                setBusy(true);
                yield action.performAction(instanceCtx);
            }
            finally {
                setBusy(false);
            }
        }
    });
    // Get label
    let label = (0, localization_1.localize)(blockDef.label, instanceCtx.locale);
    if (label) {
        // Get any embedded expression values
        const exprValues = lodash_1.default.map(blockDef.labelEmbeddedExprs || [], ee => instanceCtx.getContextVarExprValue(ee.contextVarId, ee.expr));
        // Format and replace
        label = (0, embeddedExprs_1.formatEmbeddedExprString)({
            text: label,
            embeddedExprs: blockDef.labelEmbeddedExprs || [],
            exprValues: exprValues,
            schema: instanceCtx.schema,
            contextVars: instanceCtx.contextVars,
            locale: instanceCtx.locale,
            formatLocale: instanceCtx.formatLocale
        });
    }
    return react_1.default.createElement(ButtonComponent, { blockDef: blockDef, label: label, onClick: handleClick, busy: busy });
}
/** Draws the button */
function ButtonComponent(props) {
    const { label, onClick, blockDef } = props;
    const icon = blockDef.icon ? react_1.default.createElement("i", { className: `fa fa-fw fa-${blockDef.icon}` }) : null;
    // Special case of plain link
    if (blockDef.style == "plainlink") {
        return react_1.default.createElement("div", null,
            react_1.default.createElement("a", { onClick: props.onClick, style: { cursor: "pointer" } },
                icon,
                icon && label ? "\u00A0" : null,
                label));
    }
    let className = "btn btn-" + blockDef.style;
    switch (blockDef.size) {
        case "normal":
            break;
        case "small":
            className += ` btn-sm`;
            break;
        case "extrasmall":
            className += ` btn-xs`;
            break;
        case "large":
            className += ` btn-lg`;
            break;
    }
    if (blockDef.block) {
        className += " btn-block";
    }
    const style = {};
    if (!blockDef.block) {
        style.margin = 5;
    }
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("button", { type: "button", className: className, onClick: props.onClick, style: style, disabled: props.busy },
            props.busy && icon ? react_1.default.createElement("i", { className: "fa fa-spinner fa-spin fa-fw" }) : icon,
            icon && label ? "\u00A0" : null,
            label)));
}
