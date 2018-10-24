import * as React from 'react';
import { Action } from '../actions';
import { ExprValidator } from 'mwater-expressions';
import * as _ from 'lodash';
import { createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect, ContextVarPropertyEditor } from '../propertyEditors';
import { localize } from '../localization';
import produce from 'immer';
import { ExprComponent } from 'mwater-expressions-ui';
import ReactSelect from 'react-select';
export class AddRowAction extends Action {
    async performAction(options) {
        // Create row to insert
        const row = {};
        for (const columnId of Object.keys(this.actionDef.columnValues)) {
            const contextVarExpr = this.actionDef.columnValues[columnId];
            row[columnId] = options.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
        }
        const txn = options.database.transaction();
        await txn.addRow(this.actionDef.table, row);
        await txn.commit();
    }
    validate(options) {
        // Check that table is present
        if (!this.actionDef.table || !options.schema.getTable(this.actionDef.table)) {
            return "Table required";
        }
        // Check each column value
        for (const columnId of Object.keys(this.actionDef.columnValues)) {
            const error = this.validateColumnValue(options, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    }
    validateColumnValue(options, columnId) {
        // Check that column exists
        const column = options.schema.getColumn(this.actionDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        // Get type of column
        const columnType = (column.type === "join") ? "id" : column.type;
        // Check context var
        const contextVarExpr = this.actionDef.columnValues[columnId];
        if (!contextVarExpr.contextVarId) {
            return "Context variable required";
        }
        const contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId);
        if (!contextVar || !contextVar.table) {
            return "Context variable not found";
        }
        // Validate expr
        let error;
        error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar.table, types: [columnType] });
        if (error) {
            return error;
        }
        return null;
    }
    /** Get any context variables expressions that this action needs */
    getContextVarExprs(contextVar) {
        // Get ones for the specified context var
        return Object.values(this.actionDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr);
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Table" },
                React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            this.actionDef.table ?
                React.createElement(LabeledProperty, { label: "Column Values" },
                    React.createElement(PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "columnValues" }, (value, onChange) => React.createElement(ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.actionDef.table, contextVars: props.contextVars, locale: props.locale })))
                : null));
    }
}
/** Allows editing list of column values for add */
class ColumnValuesEditor extends React.Component {
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
                    React.createElement(ContextVarPropertyEditor, { contextVars: this.props.contextVars, value: contextVarExpr.contextVarId, onChange: this.handleContextVarChange.bind(null, columnId), types: ["row", "rowset"] })),
                contextVar ?
                    React.createElement(LabeledProperty, { label: "Expression" },
                        React.createElement(ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: column.idTable || (column.type === "join" ? column.join.toTable : undefined), enumValues: column.enumValues, table: contextVar.table, value: contextVarExpr.expr, onChange: this.handleExprChange.bind(null, columnId) }))
                    : null),
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
//# sourceMappingURL=addRow.js.map