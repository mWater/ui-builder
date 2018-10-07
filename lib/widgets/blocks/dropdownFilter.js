import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { ExprValidator, ExprUtils } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import { localize } from '../localization';
import ReactSelect from "react-select";
export class DropdownFilterBlock extends LeafBlock {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (!this.blockDef.filterExpr) {
            return "Filter expression required";
        }
        const exprValidator = new ExprValidator(options.schema);
        // Validate expr
        let error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum"] });
        if (error) {
            return error;
        }
        return null;
    }
    renderDesign(props) {
        return this.renderControl(props.schema, props.locale, null, () => { return; });
    }
    renderInstance(props) {
        const table = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId).table;
        const filter = props.getFilters(this.blockDef.rowsetContextVarId).find(f => f.id === this.blockDef.id);
        const value = filter ? filter.memo : null;
        const handleChange = (newValue) => {
            // Create filter
            const newFilter = {
                id: this.blockDef.id,
                expr: newValue ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr, { type: "literal", valueType: "enum", value: newValue }] } : null,
                memo: newValue
            };
            props.setFilter(this.blockDef.rowsetContextVarId, newFilter);
        };
        return this.renderControl(props.schema, props.locale, value, handleChange);
    }
    renderControl(schema, locale, value, onChange) {
        const enumValues = this.blockDef.filterExpr ? new ExprUtils(schema).getExprEnumValues(this.blockDef.filterExpr) : null;
        const enumValue = enumValues ? enumValues.find(ev => ev.id === value) : null;
        const getOptionLabel = (ev) => localize(ev.name, locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (ev) => onChange(ev ? ev.id : null);
        return React.createElement(ReactSelect, { value: enumValue, onChange: handleChange, options: enumValues || undefined, placeholder: localize(this.blockDef.placeholder, locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Rowset" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(LabeledProperty, { label: "Filter expression" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "filterExpr" }, (expr, onExprChange) => (React.createElement(ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["enum"] }))))
                : null,
            React.createElement(LabeledProperty, { label: "Placeholder" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
//# sourceMappingURL=dropdownFilter.js.map