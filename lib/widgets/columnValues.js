"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var immer_1 = __importDefault(require("immer"));
var localization_1 = require("./localization");
var propertyEditors_1 = require("./propertyEditors");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var react_select_1 = __importDefault(require("react-select"));
/** Allows editing list of column values for add */
var ColumnValuesEditor = /** @class */ (function (_super) {
    __extends(ColumnValuesEditor, _super);
    function ColumnValuesEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleContextVarChange = function (columnId, contextVarId) {
            _this.props.onChange(immer_1.default(_this.props.value, function (draft) {
                draft[columnId].contextVarId = contextVarId;
            }));
        };
        _this.handleExprChange = function (columnId, expr) {
            _this.props.onChange(immer_1.default(_this.props.value, function (draft) {
                draft[columnId].expr = expr;
            }));
        };
        _this.handleRemove = function (columnId) {
            _this.props.onChange(immer_1.default(_this.props.value, function (draft) {
                delete draft[columnId];
            }));
        };
        _this.handleAdd = function (option) {
            if (option) {
                _this.props.onChange(immer_1.default(_this.props.value, function (draft) {
                    draft[option.value] = { contextVarId: null, expr: null };
                }));
            }
        };
        return _this;
    }
    ColumnValuesEditor.prototype.renderColumn = function (columnId) {
        var column = this.props.schema.getColumn(this.props.table, columnId);
        if (!column) {
            return null;
        }
        var contextVarExpr = this.props.value[columnId];
        var contextVar = this.props.contextVars.find(function (cv) { return cv.id === contextVarExpr.contextVarId; });
        // Get type of column
        var columnType = (column.type === "join") ? "id" : column.type;
        return react_1.default.createElement("tr", { key: columnId },
            react_1.default.createElement("td", null, localization_1.localize(column.name, this.props.locale)),
            react_1.default.createElement("td", null,
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Variable" },
                    react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { contextVars: this.props.contextVars, value: contextVarExpr.contextVarId, onChange: this.handleContextVarChange.bind(null, columnId), allowNone: true, types: ["row", "rowset"] })),
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                    react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: column.idTable || (column.type === "join" ? column.join.toTable : undefined), enumValues: column.enumValues, table: contextVar ? contextVar.table : null, value: contextVarExpr.expr, types: [columnType], onChange: this.handleExprChange.bind(null, columnId) }))),
            react_1.default.createElement("td", null,
                react_1.default.createElement("i", { className: "fa fa-remove", onClick: this.handleRemove.bind(null, columnId) })));
    };
    ColumnValuesEditor.prototype.render = function () {
        var _this = this;
        var options = lodash_1.default.sortBy(this.props.schema.getColumns(this.props.table).map(function (column) { return ({ value: column.id, label: localization_1.localize(column.name, _this.props.locale) }); }), "label");
        // Render list of existing ones in order
        return react_1.default.createElement("div", null,
            react_1.default.createElement("table", { className: "table table-bordered table-condensed" },
                react_1.default.createElement("tbody", null, Object.keys(this.props.value).sort().map(function (columnId) { return _this.renderColumn(columnId); }))),
            react_1.default.createElement(react_select_1.default, { value: null, options: options, onChange: this.handleAdd }));
    };
    return ColumnValuesEditor;
}(react_1.default.Component));
exports.ColumnValuesEditor = ColumnValuesEditor;
