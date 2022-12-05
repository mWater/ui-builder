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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownFilterBlock = void 0;
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../../propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const localization_1 = require("../../localization");
const react_select_1 = __importDefault(require("react-select"));
const EnumInstance_1 = __importDefault(require("./EnumInstance"));
const TextInstance_1 = __importDefault(require("./TextInstance"));
const DateExprComponent_1 = __importStar(require("./DateExprComponent"));
const immer_1 = __importDefault(require("immer"));
const EnumsetInstance_1 = __importDefault(require("./EnumsetInstance"));
const embeddedExprs_1 = require("../../../embeddedExprs");
const IdInstance_1 = require("./IdInstance");
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const DateFilterInstance_1 = require("./DateFilterInstance");
const TextArrInstance_1 = __importDefault(require("./TextArrInstance"));
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
class DropdownFilterBlock extends LeafBlock_1.default {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (!this.blockDef.filterExpr) {
            return "Filter expression required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        // Validate expr
        let error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, {
            table: rowsetCV.table,
            types: ["enum", "enumset", "text", "date", "datetime", "id", "text[]"]
        });
        if (error) {
            return error;
        }
        const exprUtils = new mwater_expressions_1.ExprUtils(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
        const valueType = exprUtils.getExprType(this.blockDef.filterExpr);
        const valueIdTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr);
        // Validate extra filter exprs
        if (this.blockDef.extraFilters) {
            for (const extraFilter of this.blockDef.extraFilters) {
                // Validate rowset
                const extraRowsetCV = options.contextVars.find((cv) => cv.id === extraFilter.rowsetContextVarId && cv.type === "rowset");
                if (!extraRowsetCV) {
                    return "Rowset required";
                }
                if (!extraFilter.filterExpr) {
                    return "Filter expression required";
                }
                // Validate expr
                let error;
                error = exprValidator.validateExpr(extraFilter.filterExpr, {
                    table: extraRowsetCV.table,
                    types: [valueType],
                    idTable: valueIdTableId || undefined
                });
                if (error) {
                    return error;
                }
            }
        }
        if (valueType === "id") {
            if (!valueIdTableId) {
                return "Id table required";
            }
            const valueIdTable = options.schema.getTable(valueIdTableId);
            if (!valueIdTable) {
                return "Id table missing";
            }
            const idMode = this.blockDef.idMode || "simple";
            const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
            if (this.blockDef.idWithin && !valueIdTable.ancestry && !valueIdTable.ancestryTable) {
                return "Within requires hierarchical table";
            }
            if (idMode == "simple") {
                if (!this.blockDef.idLabelExpr) {
                    return "Label Expression required";
                }
                // Validate expr
                error = exprValidator.validateExpr(this.blockDef.idLabelExpr || null, {
                    table: valueIdTableId,
                    types: ["text"]
                });
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
                error = (0, embeddedExprs_1.validateEmbeddedExprs)({
                    embeddedExprs: this.blockDef.idLabelEmbeddedExprs,
                    schema: options.schema,
                    contextVars: this.generateEmbedContextVars(valueIdTableId)
                });
                if (error) {
                    return error;
                }
                // Validate orderBy
                for (const orderBy of this.blockDef.idOrderBy || []) {
                    error = exprValidator.validateExpr(orderBy.expr, { table: valueIdTableId });
                    if (error) {
                        return error;
                    }
                }
                // Validate search
                for (const searchExpr of this.blockDef.idSearchExprs) {
                    if (!searchExpr) {
                        return "Search expression required";
                    }
                    // Validate expr
                    error = exprValidator.validateExpr(searchExpr, { table: valueIdTableId, types: ["text", "enum", "enumset"] });
                    if (error) {
                        return error;
                    }
                }
            }
        }
        return null;
    }
    /** Generate a single synthetic context variable to allow embedded expressions to work in label */
    generateEmbedContextVars(idTable) {
        return [{ id: "dropdown-embed", name: "Label", table: idTable, type: "row" }];
    }
    /** Create a filter of the appropriate type for the value selected */
    createFilter(rowsetContextVarId, filterExpr, schema, contextVars, value) {
        const exprUtils = new mwater_expressions_1.ExprUtils(schema, (0, blocks_1.createExprVariables)(contextVars));
        const valueType = exprUtils.getExprType(filterExpr);
        const valueIdTable = exprUtils.getExprIdTable(filterExpr);
        const contextVar = contextVars.find((cv) => cv.id === rowsetContextVarId);
        const table = contextVar.table;
        switch (valueType) {
            case "enum":
                return {
                    id: this.blockDef.id,
                    expr: value
                        ? {
                            type: "op",
                            table: table,
                            op: "=",
                            exprs: [filterExpr, { type: "literal", valueType: "enum", value: value }]
                        }
                        : null,
                    memo: value
                };
            case "enumset":
                return {
                    id: this.blockDef.id,
                    expr: value
                        ? {
                            type: "op",
                            table: table,
                            op: "intersects",
                            exprs: [filterExpr, { type: "literal", valueType: "enumset", value: value }]
                        }
                        : null,
                    memo: value
                };
            case "text":
                return {
                    id: this.blockDef.id,
                    expr: value
                        ? {
                            type: "op",
                            table: table,
                            op: "=",
                            exprs: [filterExpr, { type: "literal", valueType: "text", value: value }]
                        }
                        : null,
                    memo: value
                };
            case "date":
            case "datetime":
                const dateMode = this.blockDef.dateMode || "full";
                if (dateMode == "full") {
                    return {
                        id: this.blockDef.id,
                        expr: (0, DateExprComponent_1.createDateFilterExpr)(table, filterExpr, valueType == "datetime", value),
                        memo: value
                    };
                }
                else if (dateMode == "year") {
                    return {
                        id: this.blockDef.id,
                        expr: value
                            ? {
                                type: "op",
                                table: table,
                                op: "=",
                                exprs: [
                                    { type: "op", table: table, op: "year", exprs: [filterExpr] },
                                    { type: "literal", valueType: "date", value: value }
                                ]
                            }
                            : null,
                        memo: value
                    };
                }
                else if (dateMode == "yearmonth") {
                    return {
                        id: this.blockDef.id,
                        expr: value
                            ? {
                                type: "op",
                                table: table,
                                op: "=",
                                exprs: [
                                    { type: "op", table: table, op: "yearmonth", exprs: [filterExpr] },
                                    { type: "literal", valueType: "date", value: value }
                                ]
                            }
                            : null,
                        memo: value
                    };
                }
                else if (dateMode == "month") {
                    return {
                        id: this.blockDef.id,
                        expr: value
                            ? {
                                type: "op",
                                table: table,
                                op: "=",
                                exprs: [
                                    { type: "op", table: table, op: "month", exprs: [filterExpr] },
                                    { type: "literal", valueType: "enum", value: value }
                                ]
                            }
                            : null,
                        memo: value
                    };
                }
            case "id":
                return {
                    id: this.blockDef.id,
                    expr: value
                        ? {
                            type: "op",
                            table: table,
                            op: this.blockDef.idWithin ? "within" : "=",
                            exprs: [filterExpr, { type: "literal", valueType: "id", idTable: valueIdTable, value: value }]
                        }
                        : null,
                    memo: value
                };
            case "text[]":
                return {
                    id: this.blockDef.id,
                    expr: value
                        ? {
                            type: "op",
                            table: table,
                            op: "intersects",
                            exprs: [filterExpr, { type: "literal", valueType: "text[]", value: [value] }]
                        }
                        : null,
                    memo: value
                };
        }
        throw new Error("Unknown type");
    }
    renderDesign(props) {
        const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        const styles = {
            control: (base) => (Object.assign(Object.assign({}, base), { minWidth: 150 })),
            // Keep menu above other controls
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        const placeholder = (0, localization_1.localize)(this.blockDef.placeholder, props.locale);
        const valueType = new mwater_expressions_1.ExprUtils(props.schema, (0, blocks_1.createExprVariables)(props.contextVars)).getExprType(this.blockDef.filterExpr);
        const handleSetDefault = (defaultValue) => {
            props.store.alterBlock(this.blockDef.id, (bd) => {
                return Object.assign(Object.assign({}, bd), { defaultValue });
            });
        };
        if (valueType === "date" || valueType === "datetime") {
            const dateMode = this.blockDef.dateMode || "full";
            if (dateMode == "full") {
                // Fake table
                const table = contextVar ? contextVar.table || "" : "";
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
                return (React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: this.blockDef.defaultValue, onChange: handleSetDefault, locale: props.locale }));
            case "enumset":
                return (React.createElement(EnumsetInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: this.blockDef.defaultValue, onChange: handleSetDefault, locale: props.locale }));
        }
        return (React.createElement("div", { style: { padding: 5 } },
            React.createElement(react_select_1.default, { classNamePrefix: "react-select-short", styles: styles, placeholder: placeholder, menuPortalTarget: document.body })));
    }
    getInitialFilters(contextVarId, instanceCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = [];
            if (contextVarId == this.blockDef.rowsetContextVarId) {
                if (this.blockDef.defaultValue) {
                    filters.push(this.createFilter(this.blockDef.rowsetContextVarId, this.blockDef.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue));
                }
            }
            // Add extra filters
            for (const extraFilter of this.blockDef.extraFilters || []) {
                if (contextVarId == extraFilter.rowsetContextVarId) {
                    if (this.blockDef.defaultValue) {
                        filters.push(this.createFilter(extraFilter.rowsetContextVarId, extraFilter.filterExpr, instanceCtx.schema, instanceCtx.contextVars, this.blockDef.defaultValue));
                    }
                }
            }
            return filters;
        });
    }
    renderInstance(ctx) {
        const contextVar = ctx.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        const filter = ctx.getFilters(this.blockDef.rowsetContextVarId).find((f) => f.id === this.blockDef.id);
        const value = filter ? filter.memo : null;
        const handleChange = (newValue) => {
            // Create filter
            const newFilter = this.createFilter(this.blockDef.rowsetContextVarId, this.blockDef.filterExpr, ctx.schema, ctx.contextVars, newValue);
            ctx.setFilter(contextVar.id, newFilter);
            // Create extra filters
            for (const extraFilter of this.blockDef.extraFilters || []) {
                const newExtraFilter = this.createFilter(extraFilter.rowsetContextVarId, extraFilter.filterExpr, ctx.schema, ctx.contextVars, newValue);
                ctx.setFilter(extraFilter.rowsetContextVarId, newExtraFilter);
            }
        };
        const exprUtils = new mwater_expressions_1.ExprUtils(ctx.schema, (0, blocks_1.createExprVariables)(ctx.contextVars));
        const valueType = exprUtils.getExprType(this.blockDef.filterExpr);
        const placeholder = (0, localization_1.localize)(this.blockDef.placeholder, ctx.locale);
        let elem;
        switch (valueType) {
            case "enum":
                elem = (React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, onChange: handleChange, locale: ctx.locale }));
                break;
            case "enumset":
                elem = (React.createElement(EnumsetInstance_1.default, { blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, onChange: handleChange, locale: ctx.locale }));
                break;
            case "text":
                elem = (React.createElement(TextInstance_1.default, { instanceCtx: ctx, blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, database: ctx.database, onChange: handleChange, locale: ctx.locale }));
                break;
            case "date":
            case "datetime":
                const dateMode = this.blockDef.dateMode || "full";
                if (dateMode == "full") {
                    elem = (React.createElement(DateExprComponent_1.default, { datetime: valueType == "datetime", table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder, locale: ctx.locale }));
                }
                else {
                    elem = (React.createElement(DateFilterInstance_1.DateFilterInstance, { mode: dateMode, value: value, onChange: handleChange, placeholder: placeholder, locale: ctx.locale }));
                }
                break;
            case "id":
                elem = (React.createElement(IdInstance_1.IdInstance, { blockDef: this.blockDef, ctx: ctx, value: value, onChange: handleChange, locale: ctx.locale }));
                break;
            case "text[]":
                elem = (React.createElement(TextArrInstance_1.default, { instanceCtx: ctx, blockDef: this.blockDef, schema: ctx.schema, contextVars: ctx.contextVars, value: value, database: ctx.database, onChange: handleChange, locale: ctx.locale }));
                break;
            default:
                elem = React.createElement("div", null);
        }
        return React.createElement("div", { style: { padding: 5 } }, elem);
    }
    renderEditor(ctx) {
        // Get rowset context variable
        const rowsetCV = ctx.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        const idMode = this.blockDef.idMode || "simple";
        const exprUtils = new mwater_expressions_1.ExprUtils(ctx.schema, (0, blocks_1.createExprVariables)(ctx.contextVars));
        const exprType = exprUtils.getExprType(this.blockDef.filterExpr);
        const isIdType = exprType == "id";
        const idTableId = exprUtils.getExprIdTable(this.blockDef.filterExpr);
        const idTable = idTableId ? ctx.schema.getTable(idTableId) : null;
        const isIdTableHierarchical = idTable ? idTable.ancestryTable != null || idTable.ancestry != null : null;
        const isDateType = exprType == "date" || exprType == "datetime";
        const handleExprChange = (expr) => {
            ctx.store.replaceBlock((0, immer_1.default)(this.blockDef, (draft) => {
                // Clear default value if expression changes
                draft.filterExpr = expr;
                delete draft.defaultValue;
            }));
        };
        const handleDateModeChange = (dateMode) => {
            ctx.store.replaceBlock((0, immer_1.default)(this.blockDef, (draft) => {
                // Clear default value if expression changes
                draft.dateMode = dateMode;
                delete draft.defaultValue;
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "rowsetContextVarId" }, (value, onChange) => (React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: ctx.contextVars, types: ["rowset"] })))),
            rowsetCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.blockDef.filterExpr, schema: ctx.schema, dataSource: ctx.dataSource, onChange: handleExprChange, table: rowsetCV.table, variables: (0, blocks_1.createExprVariables)(ctx.contextVars), types: ["enum", "enumset", "text", "date", "datetime", "id", "text[]"] }))) : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: ctx.locale }))),
            isDateType ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "dateMode" },
                React.createElement(bootstrap_1.Toggle, { value: this.blockDef.dateMode || "full", onChange: handleDateModeChange, options: [
                        { value: "full", label: "Full" },
                        { value: "year", label: "Year" },
                        { value: "yearmonth", label: "Year + Month" },
                        { value: "month", label: "Month" }
                    ] }))) : null,
            isIdType ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idMode" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value || "simple", onChange: onChange, options: [
                        { value: "simple", label: "Simple" },
                        { value: "advanced", label: "Advanced" }
                    ] }))))) : null,
            isIdTableHierarchical ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Match Mode", key: "within" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idWithin" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value || false, onChange: onChange, options: [
                        { value: false, label: "Exact" },
                        { value: true, label: "Is Within" }
                    ] }))))) : null,
            isIdType && idMode == "simple" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression", key: "idLabelExpr" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value || null, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, types: ["text"], table: idTableId }))))) : null,
            isIdType && idMode == "advanced" ? (React.createElement("div", null,
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "idLabelText" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelText" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: ctx.locale })))),
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded label expressions", help: "Reference in text as {0}, {1}, etc.", key: "idLabelEmbeddedExprs" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idLabelEmbeddedExprs" }, (value, onChange) => (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: this.generateEmbedContextVars(idTableId) })))),
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Option ordering", key: "idOrderBy" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idOrderBy" }, (value, onChange) => (React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, contextVars: ctx.contextVars, table: idTableId })))),
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions", key: "idSearchExprs" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idSearchExprs" }, (value, onItemsChange) => {
                        const handleAddSearchExpr = () => {
                            onItemsChange((value || []).concat(null));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, (expr, onExprChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: ctx.schema, dataSource: ctx.dataSource, onChange: onExprChange, table: idTableId, types: ["text", "enum", "enumset"], variables: (0, blocks_1.createExprVariables)(ctx.contextVars) }))),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                    })))) : null,
            isIdType ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression for id table", key: "idFilterExpr" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "idFilterExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: ctx.schema, dataSource: ctx.dataSource, table: idTableId }))))) : null,
            rowsetCV && this.blockDef.filterExpr ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Additional filters on other rowsets" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: ctx.store.replaceBlock, property: "extraFilters" }, (value, onItemsChange) => {
                    const handleAddExtraFilter = () => {
                        onItemsChange((value || []).concat({ rowsetContextVarId: null, filterExpr: null }));
                    };
                    return (React.createElement("div", null,
                        React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, (extraFilter, onExtraFilterChange) => {
                            const extraFilterCV = ctx.contextVars.find((cv) => cv.id === extraFilter.rowsetContextVarId);
                            return (React.createElement("div", null,
                                React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                                    React.createElement(propertyEditors_1.PropertyEditor, { obj: extraFilter, onChange: onExtraFilterChange, property: "rowsetContextVarId" }, (value, onChange) => (React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: ctx.contextVars, types: ["rowset"] })))),
                                extraFilterCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                                    React.createElement(propertyEditors_1.PropertyEditor, { obj: extraFilter, onChange: onExtraFilterChange, property: "filterExpr" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, schema: ctx.schema, dataSource: ctx.dataSource, onChange: onChange, table: extraFilterCV.table, types: ["enum", "enumset", "text", "date", "datetime", "id"] }))))) : null));
                        }),
                        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddExtraFilter }, "+ Add Filter")));
                }))) : null));
    }
}
exports.DropdownFilterBlock = DropdownFilterBlock;
