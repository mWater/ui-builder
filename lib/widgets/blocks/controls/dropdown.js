import * as React from 'react';
import { ControlBlock } from './ControlBlock';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select";
export class DropdownBlock extends ControlBlock {
    renderControl(props) {
        // If can't be rendered due to missing context variable, just show placeholder
        if (!props.rowContextVar || !this.blockDef.column) {
            return React.createElement(ReactSelect, null);
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return React.createElement(ReactSelect, null);
        }
        switch (column.type) {
            case "enum":
                return this.renderEnum(props, column);
            case "enumset":
                return this.renderEnumset(props, column);
        }
        throw new Error("Unsupported type");
    }
    renderEnum(props, column) {
        const enumValues = column.enumValues;
        const enumValue = enumValues.find(ev => ev.id === props.value) || null;
        const getOptionLabel = (ev) => localize(ev.name, props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (ev) => props.onChange(ev ? ev.id : null);
        return React.createElement(ReactSelect, { value: enumValue, onChange: handleChange, options: column.enumValues, placeholder: localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true });
    }
    renderEnumset(props, column) {
        const enumValues = column.enumValues;
        // Map value to array
        let value = null;
        if (props.value) {
            value = _.compact(props.value.map((v) => enumValues.find(ev => ev.id === v)));
        }
        const getOptionLabel = (ev) => localize(ev.name, props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (evs) => {
            props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null);
        };
        return React.createElement(ReactSelect, { value: value, onChange: handleChange, options: column.enumValues, placeholder: localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, isMulti: true });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        return (React.createElement(LabeledProperty, { label: "Placeholder" },
            React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum" || column.type === "enumset"; // TODO enumset, id, id[]
    }
}
//# sourceMappingURL=dropdown.js.map