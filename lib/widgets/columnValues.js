"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const immer_1 = __importDefault(require("immer"));
const localization_1 = require("./localization");
const propertyEditors_1 = require("./propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const react_select_1 = __importDefault(require("react-select"));
/** Allows editing list of column values for add */
class ColumnValuesEditor extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarChange = (columnId, contextVarId) => {
            this.props.onChange(immer_1.default(this.props.value, (draft) => {
                draft[columnId].contextVarId = contextVarId;
            }));
        };
        this.handleExprChange = (columnId, expr) => {
            this.props.onChange(immer_1.default(this.props.value, (draft) => {
                draft[columnId].expr = expr;
            }));
        };
        this.handleRemove = (columnId) => {
            this.props.onChange(immer_1.default(this.props.value, (draft) => {
                delete draft[columnId];
            }));
        };
        this.handleAdd = (option) => {
            if (option) {
                this.props.onChange(immer_1.default(this.props.value, (draft) => {
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
        return react_1.default.createElement("tr", null,
            react_1.default.createElement("td", null, localization_1.localize(column.name, this.props.locale)),
            react_1.default.createElement("td", null,
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variable" },
                    react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: this.props.contextVars, value: contextVarExpr.contextVarId, onChange: this.handleContextVarChange.bind(null, columnId), allowNone: true, types: ["row", "rowset"] })),
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                    react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: column.idTable || (column.type === "join" ? column.join.toTable : undefined), enumValues: column.enumValues, table: contextVar ? contextVar.table : null, value: contextVarExpr.expr, types: [columnType], onChange: this.handleExprChange.bind(null, columnId) }))),
            react_1.default.createElement("td", null,
                react_1.default.createElement("i", { className: "fa fa-remove", onClick: this.handleRemove.bind(null, columnId) })));
    }
    render() {
        const options = _.sortBy(this.props.schema.getColumns(this.props.table).map(column => ({ value: column.id, label: localization_1.localize(column.name, this.props.locale) })), "label");
        // Render list of existing ones in order
        return react_1.default.createElement("div", null,
            react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
                react_1.default.createElement("tbody", null, Object.keys(this.props.value).sort().map(columnId => this.renderColumn(columnId)))),
            react_1.default.createElement(react_select_1.default, { value: null, options: options, onChange: this.handleAdd }));
    }
}
exports.ColumnValuesEditor = ColumnValuesEditor;
//# sourceMappingURL=columnValues.js.map