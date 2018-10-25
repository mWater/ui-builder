import React from "react";
import produce from "immer";
import { localize } from "./localization";
import { LabeledProperty, ContextVarPropertyEditor } from "./propertyEditors";
import { ExprComponent } from "mwater-expressions-ui";
import ReactSelect from 'react-select';
/** Allows editing list of column values for add */
export class ColumnValuesEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarChange = (columnId, contextVarId) => {
            this.props.onChange(produce(this.props.value, (draft) => {
                draft[columnId].contextVarId = contextVarId;
            }));
        };
        this.handleExprChange = (columnId, expr) => {
            this.props.onChange(produce(this.props.value, (draft) => {
                draft[columnId].expr = expr;
            }));
        };
        this.handleRemove = (columnId) => {
            this.props.onChange(produce(this.props.value, (draft) => {
                delete draft[columnId];
            }));
        };
        this.handleAdd = (option) => {
            if (option) {
                this.props.onChange(produce(this.props.value, (draft) => {
                    draft[option.value] = { contextVarId: null, expr: null };
                }));
            }
        };
    }
    renderColumn(columnId) {
        const column = this.props.schema.getColumn(this.props.table, columnId);
        if (!column) {
            return null;
        }
        const contextVarExpr = this.props.value[columnId];
        const contextVar = this.props.contextVars.find(cv => cv.id === contextVarExpr.contextVarId);
        // Get type of column
        const columnType = (column.type === "join") ? "id" : column.type;
        return React.createElement("tr", null,
            React.createElement("td", null, localize(column.name, this.props.locale)),
            React.createElement("td", null,
                React.createElement(LabeledProperty, { label: "Variable" },
                    React.createElement(ContextVarPropertyEditor, { contextVars: this.props.contextVars, value: contextVarExpr.contextVarId, onChange: this.handleContextVarChange.bind(null, columnId), allowNone: true, types: ["row", "rowset"] })),
                React.createElement(LabeledProperty, { label: "Expression" },
                    React.createElement(ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: column.idTable || (column.type === "join" ? column.join.toTable : undefined), enumValues: column.enumValues, table: contextVar ? contextVar.table : null, value: contextVarExpr.expr, onChange: this.handleExprChange.bind(null, columnId) }))),
            React.createElement("td", null,
                React.createElement("i", { className: "fa fa-remove", onClick: this.handleRemove.bind(null, columnId) })));
    }
    render() {
        const options = _.sortBy(this.props.schema.getColumns(this.props.table).map(column => ({ value: column.id, label: localize(column.name, this.props.locale) })), "label");
        // Render list of existing ones in order
        return React.createElement("div", null,
            React.createElement("table", { className: "table table-bordered table-condensed" },
                React.createElement("tbody", null, Object.keys(this.props.value).sort().map(columnId => this.renderColumn(columnId)))),
            React.createElement(ReactSelect, { value: null, options: options, onChange: this.handleAdd }));
    }
}
//# sourceMappingURL=columnValues.js.map