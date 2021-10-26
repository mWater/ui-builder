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
exports.ToggleBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const React = __importStar(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
/** Block which shows a toggle to control an enum or boolean or enumset */
class ToggleBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        // If can't be displayed properly
        const defaultControl = (React.createElement("div", { className: "btn-group" },
            React.createElement("button", { key: "1", type: "button", className: "btn btn-primary active" }, "Option 1"),
            React.createElement("button", { key: "2", type: "button", className: "btn btn-default" }, "Option 2")));
        // If can't be rendered due to missing context variable, just show error
        if (!props.rowContextVar || !this.blockDef.column) {
            return defaultControl;
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return defaultControl;
        }
        if (column.type === "enum") {
            return this.renderEnum(props, column);
        }
        if (column.type === "enumset") {
            return this.renderEnumset(props, column);
        }
        if (column.type === "boolean") {
            return this.renderBoolean(props, column);
        }
        throw new Error("Unsupported type");
    }
    renderEnum(props, column) {
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter((ev) => this.blockDef.includeValues.includes(ev.id));
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter((ev) => !this.blockDef.excludeValues.includes(ev.id));
        }
        return (React.createElement("div", { className: "btn-group" }, enumValues.map((option) => {
            return (React.createElement("button", { key: option.id, type: "button", disabled: props.disabled || !props.onChange, className: props.value == option.id ? "btn btn-primary active" : "btn btn-default", onClick: props.onChange != null ? () => props.onChange(option.id == props.value ? null : option.id) : undefined }, (0, localization_1.localize)(option.name, props.locale)));
        })));
    }
    renderEnumset(props, column) {
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter((ev) => this.blockDef.includeValues.includes(ev.id));
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter((ev) => !this.blockDef.excludeValues.includes(ev.id));
        }
        const handleToggle = (id) => {
            if ((props.value || []).includes(id)) {
                const newValue = lodash_1.default.difference(props.value || [], [id]);
                props.onChange(newValue.length > 0 ? newValue : null);
            }
            else {
                const newValue = lodash_1.default.union(props.value || [], [id]);
                props.onChange(newValue);
            }
        };
        return (React.createElement("div", { className: "btn-group" }, enumValues.map((option) => {
            return (React.createElement("button", { key: option.id, type: "button", disabled: props.disabled || !props.onChange, className: (props.value || []).includes(option.id) ? "btn btn-primary active" : "btn btn-default", onClick: handleToggle.bind(null, option.id) }, (0, localization_1.localize)(option.name, props.locale)));
        })));
    }
    renderBoolean(props, column) {
        return (React.createElement("div", { className: "btn-group" },
            React.createElement("button", { key: "true", type: "button", disabled: props.disabled || !props.onChange, className: props.value == true ? "btn btn-primary active" : "btn btn-default", onClick: props.onChange ? () => props.onChange(props.value === true ? null : true) : undefined }, (0, localization_1.localize)(this.blockDef.trueLabel, props.locale) || "Yes"),
            React.createElement("button", { key: "false", type: "button", disabled: props.disabled || !props.onChange, className: props.value == false ? "btn btn-primary active" : "btn btn-default", onClick: props.onChange ? () => props.onChange(props.value === false ? null : false) : undefined }, (0, localization_1.localize)(this.blockDef.falseLabel, props.locale) || "No")));
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId);
        let column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            column && (column.type === "enum" || column.type === "enumset") ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Include Values", key: "includeValues" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "includeValues" }, (value, onChange) => (React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }))))) : null,
            column && (column.type === "enum" || column.type === "enumset") ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Exclude Values", key: "excludeValues" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "excludeValues" }, (value, onChange) => (React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }))))) : null,
            column && column.type === "boolean" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for true", key: "trueLabel", hint: "Must be set to allow localization" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "trueLabel" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "Yes" }))))) : null,
            column && column.type === "boolean" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for false", key: "falseLabel", hint: "Must be set to allow localization" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "falseLabel" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "No" }))))) : null));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum" || column.type === "enumset" || column.type === "boolean";
    }
}
exports.ToggleBlock = ToggleBlock;
