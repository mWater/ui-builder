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
exports.NumberboxBlock = void 0;
var React = __importStar(require("react"));
var ControlBlock_1 = require("./ControlBlock");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var NumberboxBlock = /** @class */ (function (_super) {
    __extends(NumberboxBlock, _super);
    function NumberboxBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberboxBlock.prototype.renderControl = function (props) {
        return React.createElement(bootstrap_1.NumberInput, { value: props.value, onChange: props.onChange, style: { width: "12em" }, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), decimal: this.blockDef.decimal, decimalPlaces: this.blockDef.decimalPlaces != null ? this.blockDef.decimalPlaces : undefined });
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    NumberboxBlock.prototype.renderControlEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "decimal" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, " Decimal Number"); }),
            this.blockDef.decimal ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Decimal Places" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "decimalPlaces" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false }); }))
                : null));
    };
    /** Filter the columns that this control is for. Can't be expression */
    NumberboxBlock.prototype.filterColumn = function (column) {
        if (column.expr) {
            return false;
        }
        return column.type === "number";
    };
    return NumberboxBlock;
}(ControlBlock_1.ControlBlock));
exports.NumberboxBlock = NumberboxBlock;
