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
exports.TextboxBlock = void 0;
const React = __importStar(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
require("./textbox.css");
/** Block that is a text input control linked to a specific field */
class TextboxBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        return React.createElement(Textbox, { value: props.value, onChange: props.onChange ? props.onChange : () => { }, placeholder: (0, localization_1.localize)(this.blockDef.placeholder, props.locale), disabled: props.disabled || !props.onChange, numLines: this.blockDef.numLines || undefined, editOnFocus: this.blockDef.editOnFocus || false });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Number of lines" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "numLines" }, (value, onChange) => React.createElement(bootstrap_1.NumberInput, { value: value || 1, onChange: onChange, decimal: false }))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "editOnFocus" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Edit On Focus"))));
    }
    /** Filter the columns that this control is for */
    filterColumn(column) {
        return column.type === "text";
    }
}
exports.TextboxBlock = TextboxBlock;
/** Text box that updates only on blur */
class Textbox extends React.Component {
    constructor(props) {
        super(props);
        this.handleFocus = () => {
            // Start tracking state internally
            this.setState({ text: this.props.value, focused: true });
        };
        this.handleBlur = (ev) => {
            // Stop tracking state internally
            this.setState({ text: null, focused: false });
            // Only change if different
            const value = ev.target.value || null;
            if (value !== this.props.value) {
                this.props.onChange(value);
            }
        };
        this.handleChange = (ev) => {
            this.setState({ text: ev.target.value });
        };
        this.state = { text: null, focused: false };
    }
    componentDidUpdate(prevProps) {
        // If different, override text
        if (prevProps.value !== this.props.value && this.state.text != null) {
            this.setState({ text: this.props.value });
        }
    }
    render() {
        if (this.props.numLines && this.props.numLines > 1) {
            return (React.createElement("textarea", { className: this.props.editOnFocus ? "form-control edit-on-focus" : "form-control", placeholder: this.props.placeholder, disabled: this.props.disabled, value: this.state.text != null ? this.state.text : this.props.value || "", onFocus: this.handleFocus, onBlur: this.handleBlur, onChange: this.handleChange, rows: this.props.numLines }));
        }
        return (React.createElement("input", { className: this.props.editOnFocus ? "form-control edit-on-focus" : "form-control", type: "text", placeholder: this.props.placeholder, disabled: this.props.disabled, value: this.state.text != null ? this.state.text : this.props.value || "", onFocus: this.handleFocus, onBlur: this.handleBlur, onChange: this.handleChange }));
    }
}
