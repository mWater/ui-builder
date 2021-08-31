"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnValuesEditor = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const immer_1 = __importDefault(require("immer"));
const localization_1 = require("./localization");
const propertyEditors_1 = require("./propertyEditors");
const react_select_1 = __importDefault(require("react-select"));
/** Allows editing list of column values for add */
class ColumnValuesEditor extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarExprChange = (columnId, contextVarId, expr) => {
            this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
                draft[columnId].contextVarId = contextVarId;
                draft[columnId].expr = expr;
            }));
        };
        this.handleRemove = (columnId) => {
            this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
                delete draft[columnId];
            }));
        };
        this.handleAdd = (option) => {
            if (option) {
                this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
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
        // Override for special case of allowing to set joins
        const idTable = column.type == "join" ? column.join.toTable : column.idTable;
        const type = column.type == "join" ? "id" : column.type;
        const contextVar = contextVarExpr.contextVarId ? this.props.contextVars.find(cv => cv.id == contextVarExpr.contextVarId) : null;
        return react_1.default.createElement("tr", { key: columnId },
            react_1.default.createElement("td", { key: "name" }, (0, localization_1.localize)(column.name, this.props.locale)),
            react_1.default.createElement("td", { key: "value" },
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                    react_1.default.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVarId: contextVarExpr.contextVarId, expr: contextVarExpr.expr, onChange: this.handleContextVarExprChange.bind(null, columnId), contextVars: this.props.contextVars, schema: this.props.schema, dataSource: this.props.dataSource, idTable: idTable, enumValues: column.enumValues, aggrStatuses: contextVar && contextVar.type == "rowset" ? ["aggregate", "literal"] : ["individual", "literal"], types: [type] }))),
            react_1.default.createElement("td", { key: "remove" },
                react_1.default.createElement("i", { className: "fa fa-remove", onClick: this.handleRemove.bind(null, columnId) })));
    }
    render() {
        // Only allow updateable column types
        const columns = this.props.schema.getColumns(this.props.table).filter(column => (!column.expr && (column.type != "join" || column.join.type == "1-1" || column.join.type == "n-1")));
        const options = lodash_1.default.sortBy(columns.map(column => ({ value: column.id, label: (0, localization_1.localize)(column.name, this.props.locale) })), "label");
        // Render list of existing ones in order
        return react_1.default.createElement("div", null,
            react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
                react_1.default.createElement("tbody", null, Object.keys(this.props.value).sort().map(columnId => this.renderColumn(columnId)))),
            react_1.default.createElement(react_select_1.default, { value: null, options: options, onChange: this.handleAdd, menuPortalTarget: document.body, styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } }));
    }
}
exports.ColumnValuesEditor = ColumnValuesEditor;
