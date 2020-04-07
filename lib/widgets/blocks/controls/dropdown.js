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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var React = __importStar(require("react"));
var blocks_1 = require("../../blocks");
var ControlBlock_1 = require("./ControlBlock");
var mwater_expressions_1 = require("mwater-expressions");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
var react_select_1 = __importDefault(require("react-select"));
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var IdDropdownComponent_1 = require("./IdDropdownComponent");
var embeddedExprs_1 = require("../../../embeddedExprs");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ListEditor_1 = __importDefault(require("../../ListEditor"));
/** Styles for react-select */
var dropdownStyles = {
    // Keep menu above other controls
    menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
    menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
    control: function (style) { return (__assign(__assign({}, style), { minHeight: 34, height: 34 })); },
    valueContainer: function (style) { return (__assign(__assign({}, style), { top: -2 })); }
};
var DropdownBlock = /** @class */ (function (_super) {
    __extends(DropdownBlock, _super);
    function DropdownBlock() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.formatIdLabel = function (ctx, labelValues) {
            if (_this.blockDef.idMode == "advanced") {
                return embeddedExprs_1.formatEmbeddedExprString({
                    text: localization_1.localize(_this.blockDef.idLabelText, ctx.locale),
                    contextVars: [],
                    embeddedExprs: _this.blockDef.idLabelEmbeddedExprs,
                    exprValues: labelValues,
                    formatLocale: ctx.formatLocale,
                    locale: ctx.locale,
                    schema: ctx.schema
                });
            }
            else {
                return labelValues[0];
            }
        };
        return _this;
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
            var idMode = this.blockDef.idMode || "simple";
            var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            var idTable = column.join.toTable;
            if (idMode == "simple") {
                if (!this.blockDef.idLabelExpr) {
                    return "Label Expression required";
                }
                // Validate expr
                error = exprValidator.validateExpr(this.blockDef.idLabelExpr || null, { table: idTable, types: ["text"] });
                if (error) {
                    return error;
                }
            }
            else {
                // Complex mode
                if (!this.blockDef.idLabelText) {
                    return "Label required";
                }
                if (!this.blockDef.idLabelEmbeddedExprs || this.blockDef.idLabelEmbeddedExprs.length == 0) {
                    return "Label embedded expressions required";
                }
                if (!this.blockDef.idOrderBy || this.blockDef.idOrderBy.length == 0) {
                    return "Label order by required";
                }
                if (!this.blockDef.idSearchExprs || this.blockDef.idSearchExprs.length == 0) {
                    return "Label search required";
                }
                // Validate embedded expressions
                error = embeddedExprs_1.validateEmbeddedExprs({
                    embeddedExprs: this.blockDef.idLabelEmbeddedExprs,
                    schema: options.schema,
                    contextVars: this.generateEmbedContextVars(idTable)
                });
                if (error) {
                    return error;
                }
                // Validate orderBy
                for (var _i = 0, _a = this.blockDef.idOrderBy || []; _i < _a.length; _i++) {
                    var orderBy = _a[_i];
                    error = exprValidator.validateExpr(orderBy.expr, { table: idTable });
                    if (error) {
                        return error;
                    }
                }
                // Validate search
                for (var _b = 0, _c = this.blockDef.idSearchExprs; _b < _c.length; _b++) {
                    var searchExpr = _c[_b];
                    if (!searchExpr) {
                        return "Search expression required";
                    }
                    // Validate expr
                    error = exprValidator.validateExpr(searchExpr, { table: idTable, types: ["text", "enum", "enumset"] });
                    if (error) {
                        return error;
                    }
                }
            }
        }
        return null;
    };
    /** Generate a single synthetic context variable to allow embedded expressions to work in label */
    DropdownBlock.prototype.generateEmbedContextVars = function (idTable) {
        return [
            { id: "dropdown-embed", name: "Label", table: idTable, type: "row" }
        ];
    };
    DropdownBlock.prototype.renderControl = function (props) {
        // If can't be rendered due to missing context variable, just show placeholder
        if (!props.rowContextVar || !this.blockDef.column) {
            // TODO height
            return React.createElement(react_select_1.default, { styles: {
                    // Keep menu above other controls
                    menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
                    menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
                    control: function (style) { return (__assign(__assign({}, style), { minHeight: 34, height: 34 })); }
                } });
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
        if (column.type === "id") {
            return this.renderId(props, column);
        }
        if (column.type === "id[]") {
            return this.renderIds(props, column);
        }
        if (column.type === "join" && column.join.type === "n-1") {
            return this.renderId(props, column);
        }
        throw new Error("Unsupported type");
    };
    DropdownBlock.prototype.renderEnum = function (props, column) {
        var _this = this;
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return _this.blockDef.includeValues.includes(ev.id); });
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return !_this.blockDef.excludeValues.includes(ev.id); });
        }
        // Lookup enumvalue
        var enumValue = enumValues.find(function (ev) { return ev.id === props.value; }) || null;
        var getOptionLabel = function (ev) { return localization_1.localize(ev.name, props.locale); };
        var getOptionValue = function (ev) { return ev.id; };
        var handleChange = function (ev) { return props.onChange(ev ? ev.id : null); };
        return React.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, closeMenuOnScroll: true, menuPortalTarget: document.body, styles: dropdownStyles });
    };
    DropdownBlock.prototype.renderEnumset = function (props, column) {
        var _this = this;
        var enumValues = column.enumValues;
        // Handle include/exclude
        if (this.blockDef.includeValues && this.blockDef.includeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return _this.blockDef.includeValues.includes(ev.id); });
        }
        if (this.blockDef.excludeValues && this.blockDef.excludeValues.length > 0) {
            enumValues = enumValues.filter(function (ev) { return !_this.blockDef.excludeValues.includes(ev.id); });
        }
        // Map value to array
        var value = null;
        if (props.value) {
            value = lodash_1.default.compact(props.value.map(function (v) { return enumValues.find(function (ev) { return ev.id === v; }); }));
        }
        var getOptionLabel = function (ev) { return localization_1.localize(ev.name, props.locale); };
        var getOptionValue = function (ev) { return ev.id; };
        var handleChange = function (evs) {
            props.onChange(evs && evs.length > 0 ? evs.map(function (ev) { return ev.id; }) : null);
        };
        return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, isMulti: true, closeMenuOnScroll: true, menuPortalTarget: document.body, styles: dropdownStyles });
    };
    DropdownBlock.prototype.renderId = function (props, column) {
        var idTable = column.join ? column.join.toTable : column.idTable;
        var labelEmbeddedExprs;
        var searchExprs;
        var orderBy;
        // Handle modes
        if (this.blockDef.idMode == "advanced") {
            labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(function (ee) { return ee.expr; });
            searchExprs = this.blockDef.idSearchExprs || [];
            orderBy = this.blockDef.idOrderBy || [];
        }
        else {
            labelEmbeddedExprs = [this.blockDef.idLabelExpr];
            searchExprs = [this.blockDef.idLabelExpr];
            orderBy = [{ expr: this.blockDef.idLabelExpr, dir: "asc" }];
        }
        return React.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: idTable, value: props.value, onChange: props.onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: this.blockDef.idFilterExpr || null, formatLabel: this.formatIdLabel.bind(null, props), contextVars: props.contextVars, contextVarValues: props.contextVarValues, styles: dropdownStyles });
    };
    DropdownBlock.prototype.renderIds = function (props, column) {
        var labelEmbeddedExprs;
        var searchExprs;
        var orderBy;
        // Handle modes
        if (this.blockDef.idMode == "advanced") {
            labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(function (ee) { return ee.expr; });
            searchExprs = this.blockDef.idSearchExprs || [];
            orderBy = this.blockDef.idOrderBy || [];
        }
        else {
            labelEmbeddedExprs = [this.blockDef.idLabelExpr];
            searchExprs = [this.blockDef.idLabelExpr];
            orderBy = [{ expr: this.blockDef.idLabelExpr, dir: "asc" }];
        }
        return React.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: column.idTable, value: props.value, onChange: props.onChange, multi: true, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: this.blockDef.idFilterExpr || null, formatLabel: this.formatIdLabel.bind(null, props), contextVars: props.contextVars, contextVarValues: props.contextVarValues });
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    DropdownBlock.prototype.renderControlEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        var column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        var isIdType = column && (column.type === "join" || column.type == "id" || column.type == "id[]");
        var idMode = this.blockDef.idMode || "simple";
        var idTable = column && column.join ? column.join.toTable : (column ? column.idTable : null);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idMode" }, function (value, onChange) {
                        return React.createElement(bootstrap_1.Toggle, { value: value || "simple", onChange: onChange, options: [
                                { value: "simple", label: "Simple" },
                                { value: "advanced", label: "Advanced" }
                            ] });
                    }))
                : null,
            isIdType && idMode == "simple" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value || null, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: idTable }); }))
                : null,
            isIdType && idMode == "advanced" ?
                React.createElement("div", null,
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Label" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelText" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded label expressions", help: "Reference in text as {0}, {1}, etc." },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: _this.generateEmbedContextVars(idTable) })); })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Option ordering" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idOrderBy" }, function (value, onChange) {
                            return React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: idTable });
                        })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idSearchExprs" }, function (value, onItemsChange) {
                            var handleAddSearchExpr = function () {
                                onItemsChange((value || []).concat(null));
                            };
                            return (React.createElement("div", null,
                                React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, function (expr, onExprChange) { return (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: idTable, types: ["text", "enum", "enumset"] })); }),
                                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                        })))
                : null,
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idFilterExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: idTable }); }))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Include Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "includeValues" }, function (value, onChange) { return React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }); }))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Exclude Values" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "excludeValues" }, function (value, onChange) { return React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues }); }))
                : null));
    };
    /** Filter the columns that this control is for. Can't be expression */
    DropdownBlock.prototype.filterColumn = function (column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum"
            || column.type === "enumset"
            || column.type === "id"
            || column.type === "id[]"
            || (column.type === "join" && column.join.type === "n-1");
    };
    return DropdownBlock;
}(ControlBlock_1.ControlBlock));
exports.DropdownBlock = DropdownBlock;
