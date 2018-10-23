import * as React from 'react';
import { ControlBlock } from './ControlBlock';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
export class TextboxBlock extends ControlBlock {
    renderControl(props) {
        const handleChange = (v) => props.onChange(v);
        return React.createElement(Textbox, { value: props.value, onChange: handleChange, placeholder: localize(this.blockDef.placeholder, props.locale), disabled: props.disabled });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return (React.createElement(LabeledProperty, { label: "Placeholder" },
            React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))));
    }
    /** Filter the columns that this control is for */
    filterColumn(column) {
        return column.type === "text";
    }
}
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
                this.props.onChange(ev.target.value);
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