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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var blocks_1 = require("../../blocks");
var ControlBlock_1 = require("./ControlBlock");
var mwater_expressions_1 = require("mwater-expressions");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
var react_select_1 = __importDefault(require("react-select"));
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var DropdownBlock = /** @class */ (function (_super) {
    __extends(DropdownBlock, _super);
    function DropdownBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropdownBlock.prototype.validate = function (options) {
        var _this = this;
        var error = _super.prototype.validate.call(this, options);
        if (error) {
            return error;
        }
        var contextVar = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        var column = options.schema.getColumn(contextVar.table, this.blockDef.column);
        if (column.type === "join") {
            if (!this.blockDef.idLabelExpr) {
                return "Label Expression required";
            }
            var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            // Validate expr
            error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: column.join.toTable, types: ["text"] });
            if (error) {
                return error;
            }
        }
        return null;
    };
    DropdownBlock.prototype.renderControl = function (props) {
        // If can't be rendered due to missing context variable, just show placeholder
        if (!props.rowContextVar || !this.blockDef.column) {
            return React.createElement(react_select_1.default, null);
        }
        // Get column
        var column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return React.createElement(react_select_1.default, null);
        }
        if (column.type === "enum") {
            return this.renderEnum(props, column);
        }
        if (column.type === "enumset") {
            return this.renderEnumset(props, column);
        }
        if (column.type === "join" && column.join.type === "n-1") {
            return this.renderId(props, column);
        }
        throw new Error("Unsupported type");
    };
    DropdownBlock.prototype.renderEnum = function (props, column) {
        var enumValues = column.enumValues;
        var enumValue = enumValues.find(function (ev) { return ev.id === props.value; }) || null;
        var getOptionLabel = function (ev) { return localization_1.localize(ev.name, props.locale); };
        var getOptionValue = function (ev) { return ev.id; };
        var handleChange = function (ev) { return props.onChange(ev ? ev.id : null); };
        return React.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: column.enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, styles: {
                // Keep menu above other controls
                menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
            } });
    };
    DropdownBlock.prototype.renderEnumset = function (props, column) {
        var enumValues = column.enumValues;
        // Map value to array
        var value = null;
        if (props.value) {
            value = _.compact(props.value.map(function (v) { return enumValues.find(function (ev) { return ev.id === v; }); }));
        }
        var getOptionLabel = function (ev) { return localization_1.localize(ev.name, props.locale); };
        var getOptionValue = function (ev) { return ev.id; };
        var handleChange = function (evs) {
            props.onChange(evs && evs.length > 0 ? evs.map(function (ev) { return ev.id; }) : null);
        };
        return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: column.enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, isMulti: true, styles: {
                // Keep menu above other controls
                menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
            } });
    };
    DropdownBlock.prototype.renderId = function (props, column) {
        var exprCompiler = new mwater_expressions_1.ExprCompiler(props.schema);
        var labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" });
        var filterExpr = exprCompiler.compileExpr({ expr: this.blockDef.idFilterExpr || null, tableAlias: "main" });
        // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
        // pick up any changes in a virtual database
        return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: props.schema, dataSource: props.dataSource, idTable: column.join.toTable, value: props.value, onChange: props.onChange, labelExpr: labelExpr, filter: filterExpr });
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    DropdownBlock.prototype.renderControlEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        var column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            column && column.type === "join" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "idLabelExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: column.join.toTable }); }))
                : null,
            column && column.type === "join" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "idFilterExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: column.join.toTable }); }))
                : null));
    };
    /** Filter the columns that this control is for. Can't be expression */
    DropdownBlock.prototype.filterColumn = function (column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join.type === "n-1");
    };
    return DropdownBlock;
}(ControlBlock_1.ControlBlock));
exports.DropdownBlock = DropdownBlock;
