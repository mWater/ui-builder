"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRowAction = void 0;
const React = __importStar(require("react"));
const actions_1 = require("../actions");
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../blocks");
const propertyEditors_1 = require("../propertyEditors");
const columnValues_1 = require("../columnValues");
const evalContextVarExpr_1 = require("../evalContextVarExpr");
class AddRowAction extends actions_1.Action {
    performAction(instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create row to insert
            const row = {};
            for (const columnId of Object.keys(this.actionDef.columnValues)) {
                const contextVarExpr = this.actionDef.columnValues[columnId];
                const contextVar = contextVarExpr.contextVarId
                    ? instanceCtx.contextVars.find((cv) => cv.id == contextVarExpr.contextVarId)
                    : null;
                row[columnId] = yield (0, evalContextVarExpr_1.evalContextVarExpr)({
                    contextVar,
                    contextVarValue: contextVar ? instanceCtx.contextVarValues[contextVar.id] : null,
                    ctx: instanceCtx,
                    expr: contextVarExpr.expr
                });
            }
            const txn = instanceCtx.database.transaction();
            yield txn.addRow(this.actionDef.table, row);
            yield txn.commit();
        });
    }
    validate(designCtx) {
        // Check that table is present
        if (!this.actionDef.table || !designCtx.schema.getTable(this.actionDef.table)) {
            return "Table required";
        }
        // Check each column value
        for (const columnId of Object.keys(this.actionDef.columnValues)) {
            const error = this.validateColumnValue(designCtx, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    }
    validateColumnValue(designCtx, columnId) {
        // Check that column exists
        const column = designCtx.schema.getColumn(this.actionDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(designCtx.schema, (0, blocks_1.createExprVariables)(designCtx.contextVars));
        const exprUtils = new mwater_expressions_1.ExprUtils(designCtx.schema, (0, blocks_1.createExprVariables)(designCtx.contextVars));
        // Check context var
        const contextVarExpr = this.actionDef.columnValues[columnId];
        let contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = designCtx.contextVars.find((cv) => cv.id === contextVarExpr.contextVarId);
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            const aggrStatus = exprUtils.getExprAggrStatus(contextVarExpr.expr);
            if (aggrStatus && aggrStatus !== "literal") {
                return "Literal value required";
            }
        }
        // Override for special case of allowing to set joins
        const idTable = column.type == "join" ? column.join.toTable : column.idTable;
        const type = column.type == "join" ? "id" : column.type;
        // Validate expr
        let error;
        error = exprValidator.validateExpr(contextVarExpr.expr, {
            table: contextVar ? contextVar.table : undefined,
            types: [type],
            idTable: idTable,
            aggrStatuses: contextVar && contextVar.type == "rowset" ? ["aggregate", "literal"] : ["individual", "literal"]
        });
        if (error) {
            return error;
        }
        return null;
    }
    renderEditor(props) {
        const onChange = props.onChange;
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "table" }, (value, onChange) => (React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange })))),
            this.actionDef.table ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Column Values" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.actionDef, onChange: onChange, property: "columnValues" }, (value, onChange) => (React.createElement(columnValues_1.ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.actionDef.table, contextVars: props.contextVars, locale: props.locale }))))) : null));
    }
}
exports.AddRowAction = AddRowAction;
