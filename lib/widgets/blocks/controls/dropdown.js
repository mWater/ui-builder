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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const ControlBlock_1 = require("./ControlBlock");
const mwater_expressions_1 = require("mwater-expressions");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
const react_select_1 = __importDefault(require("react-select"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const IdDropdownComponent_1 = require("./IdDropdownComponent");
const embeddedExprs_1 = require("../../../embeddedExprs");
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const react_1 = require("react");
class DropdownBlock extends ControlBlock_1.ControlBlock {
    constructor() {
        super(...arguments);
        this.formatIdLabel = (ctx, labelValues) => {
            if (this.blockDef.idMode == "advanced") {
                return embeddedExprs_1.formatEmbeddedExprString({
                    text: localization_1.localize(this.blockDef.idLabelText, ctx.locale),
                    contextVars: [],
                    embeddedExprs: this.blockDef.idLabelEmbeddedExprs,
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
    }
    validate(options) {
        let error = super.validate(options);
        if (error) {
            return error;
        }
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const column = options.schema.getColumn(contextVar.table, this.blockDef.column);
        if (column.type === "id" || column.type == "id[]" || column.type == "join") {
            const idMode = this.blockDef.idMode || "simple";
            const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            const idTable = column.type == "join" ? column.join.toTable : column.idTable;
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
                for (const orderBy of this.blockDef.idOrderBy || []) {
                    error = exprValidator.validateExpr(orderBy.expr, { table: idTable });
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
                    error = exprValidator.validateExpr(searchExpr, { table: idTable, types: ["text", "enum", "enumset"] });
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
        return [
            { id: "dropdown-embed", name: "Label", table: idTable, type: "row" }
        ];
    }
    renderControl(props) {
        // If can't be rendered due to missing context variable, just show placeholder
        if (!props.rowContextVar || !this.blockDef.column) {
            return React.createElement(react_select_1.default, { menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return React.createElement(react_select_1.default, { menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
        }
        if (column.type === "enum") {
            return React.createElement(EnumDropdownInstance, { ctx: props, blockDef: this.blockDef, column: column });
        }
        if (column.type === "enumset") {
            return React.createElement(EnumsetDropdownInstance, { ctx: props, blockDef: this.blockDef, column: column });
        }
        if (column.type === "id") {
            return this.renderId(props, column);
        }
        if (column.type === "id[]") {
            return this.renderIds(props, column);
        }
        if (column.type === "boolean") {
            return this.renderBoolean(props, column);
        }
        // Dropdowns support n-1 and 1-1 joins as well as id columns
        if (column.type === "join" && (column.join.type === "n-1" || column.join.type === "1-1")) {
            return this.renderId(props, column);
        }
        throw new Error("Unsupported type");
    }
    renderId(props, column) {
        let labelEmbeddedExprs;
        let searchExprs;
        let orderBy;
        // Handle modes
        if (this.blockDef.idMode == "advanced") {
            labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr);
            searchExprs = this.blockDef.idSearchExprs || [];
            orderBy = this.blockDef.idOrderBy || [];
        }
        else {
            labelEmbeddedExprs = [this.blockDef.idLabelExpr];
            searchExprs = [this.blockDef.idLabelExpr];
            orderBy = [{ expr: this.blockDef.idLabelExpr, dir: "asc" }];
        }
        // Dropdowns support n-1 and 1-1 joins as well as id columns
        const idTable = column.type == "join" ? column.join.toTable : column.idTable;
        return React.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: idTable, value: props.value, onChange: props.onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: this.blockDef.idFilterExpr || null, formatLabel: this.formatIdLabel.bind(null, props), contextVars: props.contextVars, contextVarValues: props.contextVarValues, styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
    }
    renderIds(props, column) {
        let labelEmbeddedExprs;
        let searchExprs;
        let orderBy;
        // Handle modes
        if (this.blockDef.idMode == "advanced") {
            labelEmbeddedExprs = (this.blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr);
            searchExprs = this.blockDef.idSearchExprs || [];
            orderBy = this.blockDef.idOrderBy || [];
        }
        else {
            labelEmbeddedExprs = [this.blockDef.idLabelExpr];
            searchExprs = [this.blockDef.idLabelExpr];
            orderBy = [{ expr: this.blockDef.idLabelExpr, dir: "asc" }];
        }
        return React.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: column.idTable, value: props.value, onChange: props.onChange, multi: true, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: this.blockDef.idFilterExpr || null, formatLabel: this.formatIdLabel.bind(null, props), contextVars: props.contextVars, contextVarValues: props.contextVarValues, styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
    }
    renderBoolean(props, column) {
        console.log(props.value);
        return React.createElement(bootstrap_1.Select, { options: [
                { value: true, label: localization_1.localize(this.blockDef.trueLabel) || "Yes" },
                { value: false, label: localization_1.localize(this.blockDef.falseLabel) || "No" }
            ], value: props.value, onChange: props.onChange, nullLabel: "" });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        let column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        const isIdType = column && (column.type == "id" || column.type == "id[]" || column.type == "join");
        const idMode = this.blockDef.idMode || "simple";
        const idTable = column ? column.idTable : null;
        const isBooleanType = column && column.type == "boolean";
        const handleConvertToToggle = () => {
            props.store.replaceBlock({
                id: this.blockDef.id,
                type: "toggle",
                column: this.blockDef.column,
                required: this.blockDef.required,
                requiredMessage: this.blockDef.requiredMessage,
                rowContextVarId: this.blockDef.rowContextVarId,
                includeValues: this.blockDef.includeValues,
                excludeValues: this.blockDef.excludeValues
            });
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder", key: "placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idMode" }, (value, onChange) => React.createElement(bootstrap_1.Toggle, { value: value || "simple", onChange: onChange, options: [
                            { value: "simple", label: "Simple" },
                            { value: "advanced", label: "Advanced" }
                        ] })))
                : null,
            isIdType && idMode == "simple" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression", key: "idLabelExpr" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelExpr" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value || null, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: idTable })))
                : null,
            isIdType && idMode == "advanced" ?
                React.createElement("div", null,
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "idLabelText" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelText" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded label expressions", help: "Reference in text as {0}, {1}, etc.", key: "idLabelEmbeddedExprs" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelEmbeddedExprs" }, (value, onChange) => (React.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: this.generateEmbedContextVars(idTable) })))),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Option ordering", key: "idOrderBy" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idOrderBy" }, (value, onChange) => React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: idTable }))),
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions", key: "idSearchExprs" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idSearchExprs" }, (value, onItemsChange) => {
                            const handleAddSearchExpr = () => {
                                onItemsChange((value || []).concat(null));
                            };
                            return (React.createElement("div", null,
                                React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, (expr, onExprChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: idTable, types: ["text", "enum", "enumset"], variables: blocks_1.createExprVariables(props.contextVars) }))),
                                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                        })))
                : null,
            isIdType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Expression", key: "idFilterExpr" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idFilterExpr" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: idTable, variables: blocks_1.createExprVariables(props.contextVars) })))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Include Values", key: "includeValues" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "includeValues" }, (value, onChange) => React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues })))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Exclude Values", key: "excludeValues" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "excludeValues" }, (value, onChange) => React.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues })))
                : null,
            !isIdType ?
                React.createElement("div", { key: "convert_to_toggle" },
                    React.createElement("button", { className: "btn btn-link btn-sm", onClick: handleConvertToToggle }, "Convert to Toggle"))
                : null,
            isBooleanType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for true", key: "trueLabel", hint: "Must be set to allow localization" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "trueLabel" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "Yes" })))
                : null,
            isBooleanType ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label for false", key: "falseLabel", hint: "Must be set to allow localization" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "falseLabel" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "No" })))
                : null));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum"
            || column.type === "enumset"
            || column.type === "id"
            || column.type === "id[]"
            || column.type == "boolean"
            || (column.type == "join" && (column.join.type === "n-1" || column.join.type === "1-1"));
    }
}
exports.DropdownBlock = DropdownBlock;
function EnumDropdownInstance(props) {
    const { ctx, column, blockDef } = props;
    const enumValues = react_1.useMemo(() => {
        let result = column.enumValues;
        // Handle include/exclude
        if (blockDef.includeValues && blockDef.includeValues.length > 0) {
            result = result.filter(ev => blockDef.includeValues.includes(ev.id));
        }
        if (blockDef.excludeValues && blockDef.excludeValues.length > 0) {
            result = result.filter(ev => !blockDef.excludeValues.includes(ev.id));
        }
        return result;
    }, [column.enumValues, blockDef]);
    // Lookup enumvalue
    const enumValue = enumValues.find(ev => ev.id === ctx.value) || null;
    const getOptionLabel = (ev) => localization_1.localize(ev.name, ctx.locale);
    const getOptionValue = (ev) => ev.id;
    const handleChange = react_1.useCallback((ev) => {
        if (ctx.onChange) {
            ctx.onChange(ev ? ev.id : null);
        }
    }, [ctx.onChange]);
    return React.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(blockDef.placeholder, ctx.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: ctx.disabled || !ctx.onChange, isClearable: true, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
}
function EnumsetDropdownInstance(props) {
    const { ctx, column, blockDef } = props;
    const enumValues = react_1.useMemo(() => {
        let result = column.enumValues;
        // Handle include/exclude
        if (blockDef.includeValues && blockDef.includeValues.length > 0) {
            result = result.filter(ev => blockDef.includeValues.includes(ev.id));
        }
        if (blockDef.excludeValues && blockDef.excludeValues.length > 0) {
            result = result.filter(ev => !blockDef.excludeValues.includes(ev.id));
        }
        return result;
    }, [column.enumValues, blockDef]);
    // Map value to array
    let value = null;
    if (ctx.value) {
        value = lodash_1.default.compact(ctx.value.map((v) => enumValues.find(ev => ev.id === v)));
    }
    const getOptionLabel = (ev) => localization_1.localize(ev.name, ctx.locale);
    const getOptionValue = (ev) => ev.id;
    const handleChange = react_1.useCallback((evs) => {
        if (ctx.onChange) {
            ctx.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null);
        }
    }, [ctx.onChange]);
    return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(blockDef.placeholder, ctx.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: ctx.disabled || !ctx.onChange, isClearable: true, isMulti: true, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
}
