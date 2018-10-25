import * as React from 'react';
import { Action } from '../actions';
import { ExprValidator } from 'mwater-expressions';
import { createExprVariables } from '../blocks';
import { LabeledProperty, PropertyEditor, TableSelect } from '../propertyEditors';
import { ColumnValuesEditor } from '../columnValues';
export class AddRowAction extends Action {
    async performAction(options) {
        // Create row to insert
        const row = {};
        for (const columnId of Object.keys(this.actionDef.columnValues)) {
            const contextVarExpr = this.actionDef.columnValues[columnId];
            if (contextVarExpr.contextVarId != null) {
                row[columnId] = options.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
            }
            else {
                row[columnId] = contextVarExpr.expr ? contextVarExpr.expr.value : null;
            }
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
        let contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId);
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            if (contextVarExpr.expr && contextVarExpr.expr.type !== "literal") {
                return "Literal value required";
            }
        }
        // Validate expr
        let error;
        error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar ? contextVar.table : undefined, types: [columnType] });
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
//# sourceMappingURL=addRow.js.map