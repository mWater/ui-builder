import * as React from 'react';
import { createExprVariables } from '../../blocks';
import { ControlBlock } from './ControlBlock';
import { ExprValidator, ExprCompiler } from 'mwater-expressions';
import { localize } from '../../localization';
import { LabeledProperty, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import ReactSelect from "react-select";
import { IdLiteralComponent, ExprComponent } from 'mwater-expressions-ui';
export class DropdownBlock extends ControlBlock {
    validate(options) {
        let error = super.validate(options);
        if (error) {
            return error;
        }
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const column = options.schema.getColumn(contextVar.table, this.blockDef.column);
        if (column.type === "join") {
            if (!this.blockDef.idLabelExpr) {
                return "Label Expression required";
            }
            const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
            // Validate expr
            error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: column.join.toTable, types: ["text"] });
            if (error) {
                return error;
            }
        }
        return null;
    }
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
        if (column.type === "enum") {
            return this.renderEnum(props, column);
        }
        if (column.type === "enumset") {
            return this.renderEnumset(props, column);
        }
        if (column.type === "join" && column.join.type === "n-1") {
            return this.renderId(props, column);
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
    renderId(props, column) {
        const exprCompiler = new ExprCompiler(props.schema);
        const labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" });
        // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
        // pick up any changes in a virtual database
        return React.createElement(IdLiteralComponent, { schema: props.schema, dataSource: props.dataSource, idTable: column.join.toTable, value: props.value, onChange: props.onChange, labelExpr: labelExpr });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        let column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Placeholder" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            column && column.type === "join" ?
                React.createElement(LabeledProperty, { label: "Label Expression" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "idLabelExpr" }, (value, onChange) => React.createElement(ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: column.join.toTable })))
                : null));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join.type === "n-1");
    }
}
//# sourceMappingURL=dropdown.js.map