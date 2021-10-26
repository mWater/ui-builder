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
exports.NumberboxBlock = void 0;
const React = __importStar(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
class NumberboxBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        return (React.createElement(bootstrap_1.NumberInput, { value: props.value, onChange: props.onChange, style: { maxWidth: "12em", width: "100%" }, placeholder: (0, localization_1.localize)(this.blockDef.placeholder, props.locale), decimal: this.blockDef.decimal, decimalPlaces: this.blockDef.decimalPlaces != null ? this.blockDef.decimalPlaces : undefined }));
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "decimal" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange },
                " ",
                "Decimal Number"))),
            this.blockDef.decimal ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Decimal Places" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "decimalPlaces" }, (value, onChange) => React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false })))) : null));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "number";
    }
}
exports.NumberboxBlock = NumberboxBlock;
