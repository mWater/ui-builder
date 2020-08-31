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
var LeafBlock_1 = __importDefault(require("../../LeafBlock"));
var blocks_1 = require("../../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var propertyEditors_1 = require("../../propertyEditors");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var localization_1 = require("../../localization");
var react_select_1 = __importDefault(require("react-select"));
var EnumInstance_1 = __importDefault(require("./EnumInstance"));
var TextInstance_1 = __importDefault(require("./TextInstance"));
var DateExprComponent_1 = __importStar(require("./DateExprComponent"));
var immer_1 = __importDefault(require("immer"));
var EnumsetInstance_1 = __importDefault(require("./EnumsetInstance"));
var embeddedExprs_1 = require("../../../embeddedExprs");
var IdInstance_1 = require("./IdInstance");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ListEditor_1 = __importDefault(require("../../ListEditor"));
var DateFilterInstance_1 = require("./DateFilterInstance");
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
var DropdownFilterBlock = /** @class */ (function (_super) {
    __extends(DropdownFilterBlock, _super);
    function DropdownFilterBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropdownFilterBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate rowset
        var rowsetCV = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (!this.blockDef.filterExpr) {
            return "Filter expression required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Validate expr
        var error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "enumset", "text", "date", "datetime", "id"] });
        if (error) {
            return error;
        }
        var exprUtils = new mwater_expressions_1.ExprUtils(options.schema, blocks_1.createExprVariables(options.contextVars));
        var valueType = exprUtils.getExprType(this.blockDef.filterExpr);
        var valueIdTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr);
        // Validate extra filter exprs
        if (this.blockDef.extraFilters) {
            var _loop_1 = function (extraFilter) {
                // Validate rowset
                var extraRowsetCV = options.contextVars.find(function (cv) { return cv.id === extraFilter.rowsetContextVarId && cv.type === "rowset"; });
                if (!extraRowsetCV) {
                    return { value: "Rowset required" };
                }
                if (!extraFilter.filterExpr) {
                    return { value: "Filter expression required" };
                }
                // Validate expr
                var error_1 = void 0;
                error_1 = exprValidator.validateExpr(extraFilter.filterExpr, {
                    table: extraRowsetCV.table,
                    types: [valueType],
                    idTable: valueIdTableId || undefined
                });
                if (error_1) {
                    return { value: error_1 };
                }
            };
            for (var _i = 0, _a = this.blockDef.extraFilters; _i < _a.length; _i++) {
                var extraFilter = _a[_i];
                var state_1 = _loop_1(extraFilter);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        if (valueType === "id") {
            if (!valueIdTableId) {
                return "Id table required";
            }
            var valueIdTable = options.schema.getTable(valueIdTableId);
            if (!valueIdTable) {
                return "Id table missing";
            }
            var idMode = this.blockDef.idMode || "simple";
            var exprValidator_1 = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            if (this.blockDef.idWithin && !valueIdTable.ancestry && !valueIdTable.ancestryTable) {
                return "Within requires hierarchical table";
            }
            if (idMode == "simple") {
                if (!this.blockDef.idLabelExpr) {
                    return "Label Expression required";
                }
                // Validate expr
                error = exprValidator_1.validateExpr(this.blockDef.idLabelExpr || null, { table: valueIdTableId, types: ["text"] });
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
                    contextVars: this.generateEmbedContextVars(valueIdTableId)
                });
                if (error) {
                    return error;
                }
                // Validate orderBy
                for (var _b = 0, _c = this.blockDef.idOrderBy || []; _b < _c.length; _b++) {
                    var orderBy = _c[_b];
                    error = exprValidator_1.validateExpr(orderBy.expr, { table: valueIdTableId });
                    if (error) {
                        return error;
                    }
                }
                // Validate search
                for (var _d = 0, _e = this.blockDef.idSearchExprs; _d < _e.length; _d++) {
                    var searchExpr = _e[_d];
                    if (!searchExpr) {
                        return "Search expression required";
                    }
                    // Validate expr
                    error = exprValidator_1.validateExpr(searchExpr, { table: valueIdTableId, types: ["text", "enum", "enumset"] });
                    if (error) {
                        return error;
                    }
                }
            }
        }
        return null;
    };
    /** Generate a single synthetic context variable to allow embedded expressions to work in label */
    DropdownFilterBlock.prototype.generateEmbedContextVars = function (idTable) {
        return [
            { id: "dropdown-embed", name: "Label", table: idTable, type: "row" }
        ];
    };
    DropdownFilterBlock.prototype.createFilter = function (rowsetContextVarId, filterExpr, schema, contextVars, value) {
        var exprUtils = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars));
        var valueType = exprUtils.getExprType(filterExpr);
        var valueIdTable = exprUtils.getExprIdTable(filterExpr);
        var contextVar = contextVars.find(function (cv) { return cv.id === rowsetContextVarId; });
        var table = contextVar.table;
        switch (valueType) {
            case "enum":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [filterExpr, { type: "literal", valueType: "enum", value: value }] } : null,
                    memo: value
                };
            case "enumset":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "intersects", exprs: [filterExpr, { type: "literal", valueType: "enumset", value: value }] } : null,
                    memo: value
                };
            case "text":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [filterExpr, { type: "literal", valueType: "text", value: value }] } : null,
                    memo: value
                };
            case "date":
            case "datetime":
                var dateMode = this.blockDef.dateMode || "full";
                if (dateMode == "full") {
                    return {
                        id: this.blockDef.id,
                        expr: DateExprComponent_1.createDateFilterExpr(table, filterExpr, valueType == "datetime", value),
                        memo: value
                    };
                }
                else if (dateMode == "year") {
                    return {
                        id: this.blockDef.id,
                        expr: value ? { type: "op", table: table, op: "=", exprs: [
                                { type: "op", table: table, op: "year", exprs: [filterExpr] },
                                { type: "literal", valueType: "date", value: value }
                            ]
                        } : null,
                        memo: value
                    };
                }
                else if (dateMode == "yearmonth") {
                    return {
                        id: this.blockDef.id,
                        expr: value ? { type: "op", table: table, op: "=", exprs: [
                                { type: "op", table: table, op: "yearmonth", exprs: [filterExpr] },
                                { type: "literal", valueType: "date", value: value }
                            ]
                        } : null,
                        memo: value
                    };
                }
                else if (dateMode == "month") {
                    return {
                        id: this.blockDef.id,
                        expr: value ? { type: "op", table: table, op: "=", exprs: [
                                { type: "op", table: table, op: "month", exprs: [filterExpr] },
                                { type: "literal", valueType: "enum", value: value }
                            ]
                        } : null,
                        memo: value
                    };
                }
            case "id":
                return {
                    id: this.blockDef.id,
                    expr: value ? {
                        type: "op",
                        table: table,
                        op: this.blockDef.idWithin ? "within" : "=",
                        exprs: [filterExpr, { type: "literal", valueType: "id", idTable: valueIdTable, value: value }]
                    } : null,
                    memo: value
                };
        }
        throw new Error("Unknown type");
    };
    DropdownFilterBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var styles = {
            control: function (base) { return (__assign(__assign({}, base), { minWidth: 150 })); },
            // Keep menu above other controls
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        var placeholder = localization_1.localize(this.blockDef.placeholder, props.locale);
        var valueType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        var handleSetDefault = function (defaultValue) {
            props.store.alterBlock(_this.blockDef.id, function (bd) {
                return __assign(__assign({}, bd), { defaultValue: defaultValue });
            });
        };
        if (valueType === "date" || valueType === "datetime") {
            var dateMode = this.blockDef.dateMode || "full";
            if (dateMode == "full") {
                // Fake table
                var table = contextVar ? contextVar.table || "" : "";
                return (React.createElement("div", { style: { padding: 5 } },
                    React.createElement(DateExprComponent_1.default, { table: table, datetime: valueType === "datetime", value: this.blockDef.defaultValue, onChange: handleSetDefault, placeholder: placeholder, locale: props.locale })));
            }
            else {
                return (React.createElement("div", { style: { padding: 5 } },
                    React.createElement(DateFilterInstance_1.DateFilterInstance, { mode: dateMode, value: this.blockDef.defaultValue, onChange: handleSetDefault, placeholder: placeholder, locale: props.locale })));
            }
        }
        // Allow setting default for enum and enumset
        switch (valueType) {
            case "enum":
                return React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: this.blockDef.defaultValue, onChange: handleSetDefault, locale: props.locale });
            case "enumset":
                return React.createElement(EnumsetInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: this.blockDef.defaultValue, onChange: handleSetDefault, locale: props.locale });
        }
        return React.createElement("div", { style: { padding: 5 } },
            React.createElement(react_select_1.default, { classNamePrefix: "react-select-short", styles: styles, placeholder: placeholder, menuPortalTarget: document.body }));
    };
    DropdownFilterBlock.prototype.getInitialFilters = function (contextVarId, instanceCtx) {
        var filters = [];
        if (contextVarId == this.blockDef.rowsetContextVarId) {
            if (this.blockDef.defaultValue) {
                filters.push(this.createFilter(this.blockDef.rowsetContextVarId, this.blockDef.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue));
            }
        }
        // Add extra filters
        for (var _i = 0, _a = this.blockDef.extraFilters || []; _i < _a.length; _i++) {
            var extraFilter = _a[_i];
            if (contextVarId == extraFilter.rowsetContextVarId) {
                if (this.blockDef.defaultValue) {
                    filters.push(this.createFilter(extraFilter.rowsetContextVarId, extraFilter.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue));
                }
            }
        }
        return filters;
    };
    DropdownFilterBlock.prototype.renderInstance = function (ctx) {
        var _this = this;
        var contextVar = ctx.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var filter = ctx.getFilters(this.blockDef.rowsetContextVarId).find(function (f) { return f.id === _this.blockDef.id; });
        var value = filter ? filter.memo : null;
        var handleChange = function (newValue) {
            // Create filter
            var newFilter = _this.createFilter(_this.blockDef.rowsetContextVarId, _this.blockDef.filterExpr, ctx.schema, ctx.contextVars, newValue);
            ctx.setFilter(contextVar.id, newFilter);
            // Create extra filters
            for (var _i = 0, _a = _this.blockDef.extraFilters || []; _i < _a.length; _i++) {
                var extraFilter = _a[_i];
                var newExtraFilter = _this.createFilter(extraFilter.rowsetContextVarId, extraFilter.filterExpr, ctx.schema, ctx.contextVars, newValue);
                ctx.setFilter(extraFilter.rowsetContextVarId, newExtraFilter);
            }
        };
        var exprUtils = new mwater_expressions_1.ExprUtils(ctx.schema, blocks_1.createExprVariables(ctx.contextVars));
        var valueType = exprUtils.getExprType(this.blockDef.filterExpr);
        var placeholder = localization_1.localize(this.blockDef.placeholder, ctx.locale);
        var elem;
        switch (valueType) {
            case "enum":
                elem = React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, onChange: handleChange, locale: ctx.locale });
                break;
            case "enumset":
                elem = React.createElement(EnumsetInstance_1.default, { blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, onChange: handleChange, locale: ctx.locale });
                break;
            case "text":
                elem = React.createElement(TextInstance_1.default, { instanceCtx: ctx, blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, database: ctx.database, onChange: handleChange, locale: ctx.locale });
                break;
            case "date":
            case "datetime":
                var dateMode = this.blockDef.dateMode || "full";
                if (dateMode == "full") {
                    elem = React.createElement(DateExprComponent_1.default, { datetime: valueType == "datetime", table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder, locale: ctx.locale });
                }
                else {
                    elem = React.createElement(DateFilterInstance_1.DateFilterInstance, { mode: dateMode, value: value, onChange: handleChange, placeholder: placeholder, locale: ctx.locale });
                }
                break;
            case "id":
                elem = React.createElement(IdInstance_1.IdInstance, { blockDef: this.blockDef, ctx: ctx, value: value, onChange: handleChange, locale: ctx.locale });
                break;
            default:
                elem = React.createElement("div", null);
        }
        return React.createElement("div", { style: { padding: 5 } }, elem);
    };
    DropdownFilterBlock.prototype.renderEditor = function (ctx) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = ctx.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var idMode = this.blockDef.idMode || "simple";
        var exprUtils = new mwater_expressions_1.ExprUtils(ctx.schema, blocks_1.createExprVariables(ctx.contextVars));
        var exprType = exprUtils.getExprType(this.blockDef.filterExpr);
        var isIdType = exprType == "id";
        var idTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr);
        var idTable = idTableId ? ctx.schema.getTable(idTableId) : null;
        var isIdTableHierarchical = idTable ? idTable.ancestryTable != null || idTable.ancestry != null : null;
        var isDateType = exprType == "date" || exprType == "datetime";
        var handleExprChange = function (expr) {
            ctx.store.replaceBlock(immer_1.default(_this.blockDef, function (draft) {
                // Clear default value if expression changes
                draft.filterExpr = expr;
                delete draft.defaultValue;
            }));
        };
        var handleDateModeChange = function (dateMode) {
            ctx.store.replaceBlock(immer_1.default(_this.blockDef, function (draft) {
                // Clear default value if expression changes
                draft.dateMode = dateMode;
                delete draft.defaultValue;
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: ctx.contextVars, types: ["rowset"] }); })),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                    React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.blockDef.filterExpr, schema: ctx.schema, dataSource: ctx.dataSource, onChange: handleExprChange, table: rowsetCV.table, types: ["enum", "enumset", "text", "date", "datetime", "id"] }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: ctx.locale }); })),
            isDateType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "dateMode" },
                    React.createElement(bootstrap_1.Toggle, { value: this.blockDef.dateMode || "full", onChange: handleDateModeChange, options: [
                            { value: "full", label: "Full" },
                            { value: "year", label: "Year" },
                            { value: "yearmonth", label: "Year + Month" },
                            { value: "month", label: "Month" }
                        ] }))
                : null,
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idMode" }, function (value, onChange) {
                        return React.createElement(bootstrap_1.Toggle, { value: value || "simple", onChange: onChange, options: [
                                { value: "simple", label: "Simple" },
                                { value: "advanced", label: "Advanced" }
                            ] });
                    }))
                : null,
            isIdTableHierarchical ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Match Mode", key: "within" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idWithin" }, function (value, onChange) {
                        return React.createElement(bootstrap_1.Toggle, { value: value || false, onChange: onChange, options: [
                                { value: false, label: "Exact" },
                                { value: true, label: "Is Within" }
                            ] });
                    }))
                : null,
            isIdType && idMode == "simple" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression", key: "idLabelExpr" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value || null, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, types: ["text"], table: idTableId }); }))
                : null,
            isIdType && idMode == "advanced" ?
                React.createElement("div", null,
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "idLabelText" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelText" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: ctx.locale }); })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded label expressions", help: "Reference in text as {0}, {1}, etc.", key: "idLabelEmbeddedExprs" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelEmbeddedExprs" }, function (value, onChange) { return (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: _this.generateEmbedContextVars(idTableId) })); })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Option ordering", key: "idOrderBy" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idOrderBy" }, function (value, onChange) {
                            return React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: ctx.contextVars, table: idTableId });
                        })),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions", key: "idSearchExprs" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idSearchExprs" }, function (value, onItemsChange) {
                            var handleAddSearchExpr = function () {
                                onItemsChange((value || []).concat(null));
                            };
                            return (React.createElement("div", null,
                                React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, function (expr, onExprChange) { return (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: ctx.schema, dataSource: ctx.dataSource, onChange: onExprChange, table: idTableId, types: ["text", "enum", "enumset"] })); }),
                                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                        })))
                : null,
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression for id table", key: "idFilterExpr" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idFilterExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, table: idTableId }); }))
                : null,
            rowsetCV && this.blockDef.filterExpr ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Additional filters on other rowsets" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "extraFilters" }, function (value, onItemsChange) {
                        var handleAddExtraFilter = function () {
                            onItemsChange((value || []).concat({ rowsetContextVarId: null, filterExpr: null }));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, function (extraFilter, onExtraFilterChange) {
                                var extraFilterCV = ctx.contextVars.find(function (cv) { return cv.id === extraFilter.rowsetContextVarId; });
                                return React.createElement("div", null,
                                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                                        React.createElement(propertyEditors_1.PropertyEditor, { obj: extraFilter, onChange: onExtraFilterChange, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: ctx.contextVars, types: ["rowset"] }); })),
                                    extraFilterCV ?
                                        React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                                            React.createElement(propertyEditors_1.PropertyEditor, { obj: extraFilter, onChange: onExtraFilterChange, property: "filterExpr" }, function (value, onChange) { return React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, schema: ctx.schema, dataSource: ctx.dataSource, onChange: onChange, table: extraFilterCV.table, types: ["enum", "enumset", "text", "date", "datetime", "id"] }); }))
                                        : null);
                            }),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddExtraFilter }, "+ Add Filter")));
                    }))
                : null));
    };
    return DropdownFilterBlock;
}(LeafBlock_1.default));
exports.DropdownFilterBlock = DropdownFilterBlock;
