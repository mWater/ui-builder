import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { createExprVariables } from '../../blocks';
import { ExprValidator, ExprUtils } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
import ReactSelect from "react-select";
import EnumInstance from './EnumInstance';
import TextInstance from './TextInstance';
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
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        // Validate expr
        let error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "text"] });
        if (error) {
            return error;
        }
        return null;
    }
    createFilter(schema, contextVars, value) {
        const valueType = new ExprUtils(schema, createExprVariables(contextVars)).getExprType(this.blockDef.filterExpr);
        const contextVar = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const table = contextVar.table;
        switch (valueType) {
            case "enum":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr, { type: "literal", valueType: "enum", value: value }] } : null,
                    memo: value
                };
            case "text":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr, { type: "literal", valueType: "text", value: value }] } : null,
                    memo: value
                };
        }
        throw new Error("Unknown type");
    }
    renderDesign(props) {
        const styles = {
            control: (base) => (Object.assign({}, base, { height: 34, minHeight: 34 }))
        };
        return React.createElement("div", { style: { padding: 5 } },
            React.createElement(ReactSelect, { styles: styles }));
    }
    renderInstance(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const filter = props.getFilters(this.blockDef.rowsetContextVarId).find(f => f.id === this.blockDef.id);
        const value = filter ? filter.memo : null;
        const handleChange = (newValue) => {
            console.error(newValue);
            // Create filter
            const newFilter = this.createFilter(props.schema, props.contextVars, newValue);
            props.setFilter(contextVar.id, newFilter);
        };
        const valueType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        let elem;
        switch (valueType) {
            case "enum":
                elem = React.createElement(EnumInstance, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, onChange: handleChange, locale: props.locale });
                break;
            case "text":
                elem = React.createElement(TextInstance, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, database: props.database, onChange: handleChange, locale: props.locale });
                break;
            default:
                elem = React.createElement("div", null);
        }
        return React.createElement("div", { style: { padding: 5 } }, elem);
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Rowset" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(LabeledProperty, { label: "Filter expression" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "filterExpr" }, (expr, onExprChange) => (React.createElement(ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["enum", "text"] }))))
                : null,
            React.createElement(LabeledProperty, { label: "Placeholder" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
//# sourceMappingURL=dropdownFilter.js.map