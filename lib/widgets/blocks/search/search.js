import * as React from 'react';
import LeafBlock from '../../LeafBlock';
import { createExprVariables } from '../../blocks';
import { ExprValidator } from 'mwater-expressions';
import { LabeledProperty, ContextVarPropertyEditor, PropertyEditor, LocalizedTextPropertyEditor } from '../../propertyEditors';
import SearchBlockInstance from './SearchBlockInstance';
import ListEditor from '../../ListEditor';
import { ExprComponent } from 'mwater-expressions-ui';
import { localize } from '../../localization';
export class SearchBlock extends LeafBlock {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (this.blockDef.searchExprs.length === 0) {
            return "Search expression required";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        for (const searchExpr of this.blockDef.searchExprs) {
            if (!searchExpr) {
                return "Search expression required";
            }
            let error;
            // Validate expr
            error = exprValidator.validateExpr(searchExpr, { table: rowsetCV.table, types: ["text", "enum", "enumset"] });
            if (error) {
                return error;
            }
        }
        return null;
    }
    renderDesign(props) {
        return (React.createElement("div", { className: "input-group", style: { padding: 5 } },
            React.createElement("span", { className: "input-group-addon" },
                React.createElement("i", { className: "fa fa-search" })),
            React.createElement("input", { type: "text", className: "form-control", style: { maxWidth: "20em" }, placeholder: localize(this.blockDef.placeholder, props.locale) })));
    }
    renderInstance(props) {
        return React.createElement(SearchBlockInstance, { blockDef: this.blockDef, renderInstanceProps: props });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Rowset" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(LabeledProperty, { label: "Search expressions" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "searchExprs" }, (value, onItemsChange) => {
                        const handleAddSearchExpr = () => {
                            onItemsChange(value.concat(null));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor, { items: value, onItemsChange: onItemsChange }, (expr, onExprChange) => (React.createElement(ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["text", "enum", "enumset"] }))),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                    }))
                : null,
            React.createElement(LabeledProperty, { label: "Placeholder" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
//# sourceMappingURL=search.js.map