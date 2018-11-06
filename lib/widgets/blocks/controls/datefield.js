import * as React from 'react';
import { ControlBlock } from './ControlBlock';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor, DateFormatEditor, DatetimeFormatEditor } from '../../propertyEditors';
import DatePicker from 'react-datepicker';
import moment from 'moment';
/** Block that is a text input control linked to a specific field */
export class DatefieldBlock extends ControlBlock {
    renderControl(props) {
        // Get column
        let column;
        if (props.rowContextVar && this.blockDef.column) {
            column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        }
        const datetime = column ? column.type === "datetime" : false;
        const format = this.blockDef.format ? this.blockDef.format : (datetime ? "lll" : "ll");
        return React.createElement(Datefield, { value: props.value, onChange: props.onChange, placeholder: localize(this.blockDef.placeholder, props.locale), disabled: props.disabled, datetime: datetime, format: format });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        // Get column
        let column;
        if (contextVar && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Placeholder" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            column && column.type === "date" ?
                React.createElement(LabeledProperty, { label: "Date Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DateFormatEditor, { value: value, onChange: onChange }))))
                : null,
            column && column.type === "datetime" ?
                React.createElement(LabeledProperty, { label: "Date/time Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DatetimeFormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
    /** Filter the columns that this control is for */
    filterColumn(column) {
        return column.type === "date" || column.type === "datetime";
    }
    /** Clear format */
    processColumnChanged(blockDef) {
        return Object.assign({}, blockDef, { format: null });
    }
}
/** Text box that updates only on blur */
class Datefield extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            if (this.props.datetime) {
                this.props.onChange(value ? value.toISOString() : null);
            }
            else {
                this.props.onChange(value ? value.format("YYYY-MM-DD") : null);
            }
        };
    }
    render() {
        return (React.createElement(DatePicker, { placeholderText: this.props.placeholder, disabled: this.props.disabled, selected: this.props.value ? moment(this.props.value, moment.ISO_8601) : null, onChange: this.handleChange, showTimeSelect: this.props.datetime, timeFormat: "HH:mm", dateFormat: this.props.format, className: "form-control" }));
    }
}
//# sourceMappingURL=datefield.js.map