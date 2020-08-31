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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var React = __importStar(require("react"));
var ControlBlock_1 = require("./ControlBlock");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
/** Block which shows a toggle to control an enum or boolean or enumset */
var ToggleBlock = /** @class */ (function (_super) {
    __extends(ToggleBlock, _super);
    function ToggleBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToggleBlock.prototype.renderControl = function (props) {
        // If can't be displayed properly
        var defaultControl = React.createElement("div", { className: "btn-group" },
            React.createElement("button", { key: "1", type: "button", className: "btn btn-primary active" }, "Option 1"),
            React.createElement("button", { key: "2", type: "button", className: "btn btn-default" }, "Option 2"));
        // If can't be rendered due to missing context variable, just show error
        if (!props.rowContextVar || !this.blockDef.column) {
            return defaultControl;
        }
        // Get column
        var column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
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
    };
    ToggleBlock.prototype.renderEnum = function (props, column) {
        var _this = this;
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return _this.blockDef.includeValues.includes(ev.id); });
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return !_this.blockDef.excludeValues.includes(ev.id); });
        }
        return React.createElement("div", { className: "btn-group" }, enumValues.map(function (option) {
            return React.createElement("button", { key: option.id, type: "button", disabled: props.disabled, className: props.value == option.id ? "btn btn-primary active" : "btn btn-default", onClick: function () { return props.onChange(option.id == props.value ? null : option.id); } }, localization_1.localize(option.name, props.locale));
        }));
    };
    ToggleBlock.prototype.renderEnumset = function (props, column) {
        var _this = this;
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return _this.blockDef.includeValues.includes(ev.id); });
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return !_this.blockDef.excludeValues.includes(ev.id); });
        }
        var handleToggle = function (id) {
            if ((props.value || []).includes(id)) {
                var newValue = lodash_1.default.difference(props.value || [], [id]);
                props.onChange(newValue.length > 0 ? newValue : null);
            }
            else {
                var newValue = lodash_1.default.union(props.value || [], [id]);
                props.onChange(newValue);
            }
        };
        return React.createElement("div", { className: "btn-group" }, enumValues.map(function (option) {
            return React.createElement("button", { key: option.id, type: "button", disabled: props.disabled, className: (props.value || []).includes(option.id) ? "btn btn-primary active" : "btn btn-default", onClick: handleToggle.bind(null, option.id) }, localization_1.localize(option.name, props.locale));
        }));
    };
    ToggleBlock.prototype.renderBoolean = function (props, column) {
        return React.createElement("div", { className: "btn-group" },
            React.createElement("button", { key: "true", type: "button", disabled: props.disabled, className: props.value == true ? "btn btn-primary active" : "btn btn-default", onClick: function () { return props.onChange(props.value === true ? null : true); } }, localization_1.localize(this.blockDef.trueLabel, props.locale) || "Yes"),
            React.createElement("button", { key: "false", type: "button", disabled: props.disabled, className: props.value == false ? "btn btn-primary active" : "btn btn-default", onClick: function () { return props.onChange(props.value === false ? null : false); } }, localization_1.localize(this.blockDef.falseLabel, props.locale) || "No"));
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    ToggleBlock.prototype.renderControlEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        var column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Include Values", key: "includeValues" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "includeValues" }, function (value, onChange) { return React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }); }))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Exclude Values", key: "excludeValues" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "excludeValues" }, function (value, onChange) { return React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }); }))
                : null,
            column && column.type === "boolean" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for true", key: "trueLabel", hint: "Must be set to allow localization" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "trueLabel" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "Yes" }); }))
                : null,
            column && column.type === "boolean" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for false", key: "falseLabel", hint: "Must be set to allow localization" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "falseLabel" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "No" }); }))
                : null));
    };
    /** Filter the columns that this control is for. Can't be expression */
    ToggleBlock.prototype.filterColumn = function (column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum"
            || column.type === "enumset"
            || column.type === "boolean";
    };
    return ToggleBlock;
}(ControlBlock_1.ControlBlock));
exports.ToggleBlock = ToggleBlock;
