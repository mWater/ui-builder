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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var ControlBlock_1 = require("./ControlBlock");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
/** Block that is a text input control linked to a specific field */
var TextboxBlock = /** @class */ (function (_super) {
    __extends(TextboxBlock, _super);
    function TextboxBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextboxBlock.prototype.renderControl = function (props) {
        return React.createElement(Textbox, { value: props.value, onChange: props.onChange, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), disabled: props.disabled, numLines: this.blockDef.numLines || undefined });
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    TextboxBlock.prototype.renderControlEditor = function (props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of lines" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "numLines" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value || 1, onChange: onChange, decimal: false }); }))));
    };
    /** Filter the columns that this control is for */
    TextboxBlock.prototype.filterColumn = function (column) {
        return column.type === "text";
    };
    return TextboxBlock;
}(ControlBlock_1.ControlBlock));
exports.TextboxBlock = TextboxBlock;
/** Text box that updates only on blur */
var Textbox = /** @class */ (function (_super) {
    __extends(Textbox, _super);
    function Textbox(props) {
        var _this = _super.call(this, props) || this;
        _this.handleFocus = function () {
            // Start tracking state internally
            _this.setState({ text: _this.props.value });
        };
        _this.handleBlur = function (ev) {
            // Stop tracking state internally
            _this.setState({ text: null });
            // Only change if different
            var value = ev.target.value || null;
            if (value !== _this.props.value) {
                _this.props.onChange(value);
            }
        };
        _this.handleChange = function (ev) {
            _this.setState({ text: ev.target.value });
        };
        _this.state = { text: null };
        return _this;
    }
    Textbox.prototype.componentDidUpdate = function (prevProps) {
        // If different, override text
        if (prevProps.value !== this.props.value && this.state.text != null) {
            this.setState({ text: this.props.value });
        }
    };
    Textbox.prototype.render = function () {
        if (this.props.numLines && this.props.numLines > 1) {
            return (React.createElement("textarea", { className: "form-control", placeholder: this.props.placeholder, disabled: this.props.disabled, value: this.state.text != null ? this.state.text : this.props.value || "", onFocus: this.handleFocus, onBlur: this.handleBlur, onChange: this.handleChange, rows: this.props.numLines }));
        }
        return (React.createElement("input", { className: "form-control", type: "text", placeholder: this.props.placeholder, disabled: this.props.disabled, value: this.state.text != null ? this.state.text : this.props.value || "", onFocus: this.handleFocus, onBlur: this.handleBlur, onChange: this.handleChange }));
    };
    return Textbox;
}(React.Component));
