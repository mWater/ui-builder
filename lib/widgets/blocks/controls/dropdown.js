"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
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
const react_2 = require("react");
const stabilizingHooks_1 = require("../../../stabilizingHooks");
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
            return react_1.default.createElement(react_select_1.default, { menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        if (!column) {
            return react_1.default.createElement(react_select_1.default, { menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
        }
        if (column.type === "enum") {
            return react_1.default.createElement(EnumDropdownInstance, { blockDef: this.blockDef, column: column, locale: props.locale, disabled: props.disabled, value: props.value, onChange: props.onChange });
        }
        if (column.type === "enumset") {
            return react_1.default.createElement(EnumsetDropdownInstance, { blockDef: this.blockDef, column: column, locale: props.locale, disabled: props.disabled, value: props.value, onChange: props.onChange });
        }
        if (column.type === "id") {
            return react_1.default.createElement(IdDropdownInstance, { blockDef: this.blockDef, column: column, contextVars: props.contextVars, contextVarValues: props.contextVarValues, database: props.database, disabled: props.disabled, formatIdLabel: this.formatIdLabel.bind(null, props), value: props.value, onChange: props.onChange });
        }
        if (column.type === "id[]") {
            return react_1.default.createElement(IdsDropdownInstance, { blockDef: this.blockDef, column: column, contextVars: props.contextVars, contextVarValues: props.contextVarValues, database: props.database, disabled: props.disabled, formatIdLabel: this.formatIdLabel.bind(null, props), value: props.value, onChange: props.onChange });
        }
        if (column.type === "boolean") {
            return this.renderBoolean(props, column);
        }
        // Dropdowns support n-1 and 1-1 joins as well as id columns
        if (column.type === "join" && (column.join.type === "n-1" || column.join.type === "1-1")) {
            return react_1.default.createElement(IdDropdownInstance, { blockDef: this.blockDef, column: column, contextVars: props.contextVars, contextVarValues: props.contextVarValues, database: props.database, disabled: props.disabled, formatIdLabel: this.formatIdLabel.bind(null, props), value: props.value, onChange: props.onChange });
        }
        throw new Error("Unsupported type");
    }
    renderBoolean(props, column) {
        console.log(props.value);
        return react_1.default.createElement(bootstrap_1.Select, { options: [
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
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder", key: "placeholder" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            isIdType ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Mode", key: "mode" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idMode" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "simple", onChange: onChange, options: [
                            { value: "simple", label: "Simple" },
                            { value: "advanced", label: "Advanced" }
                        ] })))
                : null,
            isIdType && idMode == "simple" ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression", key: "idLabelExpr" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelExpr" }, (value, onChange) => react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: value || null, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: idTable })))
                : null,
            isIdType && idMode == "advanced" ?
                react_1.default.createElement("div", null,
                    react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "idLabelText" },
                        react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelText" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
                    react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Embedded label expressions", help: "Reference in text as {0}, {1}, etc.", key: "idLabelEmbeddedExprs" },
                        react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idLabelEmbeddedExprs" }, (value, onChange) => (react_1.default.createElement(propertyEditors_1.EmbeddedExprsEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: this.generateEmbedContextVars(idTable) })))),
                    react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Option ordering", key: "idOrderBy" },
                        react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idOrderBy" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.OrderByArrayEditor, { value: value || [], onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: idTable }))),
                    react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions", key: "idSearchExprs" },
                        react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idSearchExprs" }, (value, onItemsChange) => {
                            const handleAddSearchExpr = () => {
                                onItemsChange((value || []).concat(null));
                            };
                            return (react_1.default.createElement("div", null,
                                react_1.default.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, (expr, onExprChange) => (react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: idTable, types: ["text", "enum", "enumset"], variables: blocks_1.createExprVariables(props.contextVars) }))),
                                react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                        })))
                : null,
            isIdType ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Expression", key: "idFilterExpr" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "idFilterExpr" }, (value, onChange) => react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: idTable, variables: blocks_1.createExprVariables(props.contextVars) })))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Include Values", key: "includeValues" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "includeValues" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues })))
                : null,
            column && (column.type === "enum" || column.type === "enumset") ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Exclude Values", key: "excludeValues" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "excludeValues" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.EnumArrayEditor, { value: value, onChange: onChange, enumValues: column.enumValues })))
                : null,
            !isIdType ?
                react_1.default.createElement("div", { key: "convert_to_toggle" },
                    react_1.default.createElement("button", { className: "btn btn-link btn-sm", onClick: handleConvertToToggle }, "Convert to Toggle"))
                : null,
            isBooleanType ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label for true", key: "trueLabel", hint: "Must be set to allow localization" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "trueLabel" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "Yes" })))
                : null,
            isBooleanType ?
                react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label for false", key: "falseLabel", hint: "Must be set to allow localization" },
                    react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "falseLabel" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale, placeholder: "No" })))
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
const EnumDropdownInstance = react_2.memo((props) => {
    const { column, blockDef } = props;
    const enumValues = react_2.useMemo(() => {
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
    const enumValue = enumValues.find(ev => ev.id === props.value) || null;
    const getOptionLabel = (ev) => localization_1.localize(ev.name, props.locale);
    const getOptionValue = (ev) => ev.id;
    const handleChange = react_2.useCallback((ev) => {
        if (props.onChange) {
            props.onChange(ev ? ev.id : null);
        }
    }, [props.onChange]);
    return react_1.default.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled || !props.onChange, isClearable: true, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
});
const EnumsetDropdownInstance = react_2.memo((props) => {
    const { column, blockDef } = props;
    const enumValues = react_2.useMemo(() => {
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
    if (props.value) {
        value = lodash_1.default.compact(props.value.map((v) => enumValues.find(ev => ev.id === v)));
    }
    const getOptionLabel = (ev) => localization_1.localize(ev.name, props.locale);
    const getOptionValue = (ev) => ev.id;
    const handleChange = react_2.useCallback((evs) => {
        if (props.onChange) {
            props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null);
        }
    }, [props.onChange]);
    return react_1.default.createElement(react_select_1.default, { value: value, onChange: handleChange, options: enumValues, placeholder: localization_1.localize(blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled || !props.onChange, isClearable: true, isMulti: true, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short", styles: { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) } });
});
function IdDropdownInstance(props) {
    const { column, blockDef } = props;
    const labelEmbeddedExprs = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? (blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const searchExprs = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idSearchExprs || []
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const orderBy = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idOrderBy || []
            : [{ expr: blockDef.idLabelExpr, dir: "asc" }];
    }, [blockDef]);
    // Dropdowns support n-1 and 1-1 joins as well as id columns
    const idTable = column.type == "join" ? column.join.toTable : column.idTable;
    const styles = react_2.useMemo(() => {
        return { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) };
    }, []);
    // Stabilize functions and values
    const onChange = stabilizingHooks_1.useStabilizeFunction(props.onChange);
    const formatIdLabel = stabilizingHooks_1.useStabilizeFunction(props.formatIdLabel);
    const contextVars = stabilizingHooks_1.useStabilizeValue(props.contextVars);
    const contextVarValues = stabilizingHooks_1.useStabilizeValue(props.contextVarValues);
    const value = stabilizingHooks_1.useStabilizeValue(props.value);
    return react_1.default.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: idTable, value: value, onChange: onChange, multi: false, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: blockDef.idFilterExpr || null, formatLabel: formatIdLabel, contextVars: contextVars, contextVarValues: contextVarValues, styles: styles });
}
function IdsDropdownInstance(props) {
    const { column, blockDef } = props;
    const labelEmbeddedExprs = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? (blockDef.idLabelEmbeddedExprs || []).map(ee => ee.expr)
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const searchExprs = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idSearchExprs || []
            : [blockDef.idLabelExpr];
    }, [blockDef]);
    const orderBy = react_2.useMemo(() => {
        return blockDef.idMode == "advanced"
            ? blockDef.idOrderBy || []
            : [{ expr: blockDef.idLabelExpr, dir: "asc" }];
    }, [blockDef]);
    const styles = react_2.useMemo(() => {
        return { menuPortal: style => (Object.assign(Object.assign({}, style), { zIndex: 2000 })) };
    }, []);
    // Stabilize functions and values
    const onChange = stabilizingHooks_1.useStabilizeFunction(props.onChange);
    const formatIdLabel = stabilizingHooks_1.useStabilizeFunction(props.formatIdLabel);
    const contextVars = stabilizingHooks_1.useStabilizeValue(props.contextVars);
    const contextVarValues = stabilizingHooks_1.useStabilizeValue(props.contextVarValues);
    const value = stabilizingHooks_1.useStabilizeValue(props.value);
    return react_1.default.createElement(IdDropdownComponent_1.IdDropdownComponent, { database: props.database, table: column.idTable, value: value, onChange: onChange, multi: true, labelEmbeddedExprs: labelEmbeddedExprs, searchExprs: searchExprs, orderBy: orderBy, filterExpr: blockDef.idFilterExpr || null, formatLabel: formatIdLabel, contextVars: contextVars, contextVarValues: contextVarValues, styles: styles });
}
