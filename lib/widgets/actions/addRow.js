"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const columnValues_1 = require("../columnValues");
class AddRowAction extends actions_1.Action {
    performAction(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield txn.addRow(this.actionDef.table, row);
            yield txn.commit();
        });
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
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
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
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            this.actionDef.table ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: props.onChange, property: "columnValues" }, (value, onChange) => React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.actionDef.table, contextVars: props.contextVars, locale: props.locale })))
                : null));
    }
}
exports.AddRowAction = AddRowAction;
//# sourceMappingURL=addRow.js.map