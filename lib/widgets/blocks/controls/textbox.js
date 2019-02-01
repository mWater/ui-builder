"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
/** Block that is a text input control linked to a specific field */
class TextboxBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        return React.createElement(Textbox, { value: props.value, onChange: props.onChange, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), disabled: props.disabled });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return (React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))));
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
            this.setState({ text: this.props.value });
        };
        this.handleBlur = (ev) => {
            // Stop tracking state internally
            this.setState({ text: null });
            // Only change if different
            const value = ev.target.value || null;
            if (value !== this.props.value) {
                this.props.onChange(value);
            }
        };
        this.handleChange = (ev) => {
            this.setState({ text: ev.target.value });
        };
        this.state = { text: null };
    }
    componentDidUpdate(prevProps) {
        // If different, override text
        if (prevProps.value !== this.props.value && this.state.text != null) {
            this.setState({ text: this.props.value });
        }
    }
    render() {
        return (React.createElement("input", { className: "form-control", type: "text", placeholder: this.props.placeholder, disabled: this.props.disabled, value: this.state.text != null ? this.state.text : this.props.value || "", onFocus: this.handleFocus, onBlur: this.handleBlur, onChange: this.handleChange }));
    }
}
//# sourceMappingURL=textbox.js.map