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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabeledBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const blocks_1 = require("../blocks");
const localization_1 = require("../localization");
const propertyEditors_1 = require("../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class LabeledBlock extends blocks_1.Block {
    getChildren(contextVars) {
        return this.blockDef.child ? [{ blockDef: this.blockDef.child, contextVars: contextVars }] : [];
    }
    validate() { return null; }
    processChildren(action) {
        const child = action(this.blockDef.child);
        return (0, immer_1.default)(this.blockDef, draft => {
            draft.child = child;
        });
    }
    renderDesign(props) {
        const handleAdd = (addedBlockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.child = addedBlockDef;
                return b;
            }), addedBlockDef.id);
        };
        const labelText = (0, localization_1.localize)(this.blockDef.label, props.locale);
        const hintText = (0, localization_1.localize)(this.blockDef.hint, props.locale);
        const helpText = (0, localization_1.localize)(this.blockDef.help, props.locale);
        return this.blockDef.layout == "horizontal" ?
            React.createElement(HorizLabeledControl, { designMode: true, labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child, handleAdd))
            :
                React.createElement(StackedLabeledControl, { labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child, handleAdd));
    }
    renderInstance(props) {
        const labelText = (0, localization_1.localize)(this.blockDef.label, props.locale);
        const hintText = (0, localization_1.localize)(this.blockDef.hint, props.locale);
        const helpText = (0, localization_1.localize)(this.blockDef.help, props.locale);
        return this.blockDef.layout == "horizontal" ?
            React.createElement(HorizLabeledControl, { labelText: labelText || "Label", hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child))
            :
                React.createElement(StackedLabeledControl, { labelText: labelText, hintText: hintText, helpText: helpText, requiredStar: this.blockDef.requiredStar }, props.renderChildBlock(props, this.blockDef.child));
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "label" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Hint" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "hint" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Help" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "help" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "requiredStar" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Show required star")),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Layout" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "layout" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "stacked", onChange: onChange, options: [
                        { value: "stacked", label: "Stacked" },
                        { value: "horizontal", label: "Horizontal" }
                    ] })))));
    }
}
exports.LabeledBlock = LabeledBlock;
function StackedLabeledControl(props) {
    return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5 } },
        React.createElement("div", { key: "label" },
            React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, props.labelText),
            props.requiredStar ?
                React.createElement("span", { style: { color: "red", paddingLeft: 2 } }, "*")
                : null,
            props.hintText ?
                React.createElement("span", { key: "hint", className: "text-muted" },
                    " - ",
                    props.hintText)
                : null),
        props.children,
        props.helpText ?
            React.createElement("p", { className: "help-block", style: { marginLeft: 5 } }, props.helpText)
            : null);
}
function HorizLabeledControl(props) {
    return React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto auto", alignItems: "center" } },
        React.createElement("div", { key: "label", style: { paddingTop: props.designMode ? 2 : undefined, marginRight: 5 } },
            React.createElement("span", { key: "label", style: { fontWeight: "bold" } }, props.labelText),
            props.requiredStar ?
                React.createElement("span", { style: { color: "red", paddingLeft: 2 } }, "*")
                : null),
        React.createElement("div", { key: "content" }, props.children),
        props.helpText || props.hintText ?
            React.createElement("div", { key: "blank" })
            : null,
        props.helpText || props.hintText ?
            React.createElement("div", { key: "help", style: { marginLeft: 5 } },
                React.createElement("span", { key: "hint", className: "text-muted", style: { marginLeft: 5 } }, props.hintText),
                React.createElement("span", { key: "help", style: { marginLeft: 5 } }, props.helpText))
            : null);
}
