"use strict";
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
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const ControlBlock_1 = require("./ControlBlock");
const mwater_expressions_1 = require("mwater-expressions");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
const react_select_1 = __importDefault(require("react-select"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
class DropdownBlock extends ControlBlock_1.ControlBlock {
    validate(options) {
        let error = super.validate(options);
        if (error) {
            return error;
        }
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const column = options.schema.getColumn(contextVar.table, this.blockDef.column);
        if (column.type === "join") {
            if (!this.blockDef.idLabelExpr) {
                return "Label Expression required";
            }
            const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
            // Validate expr
            error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: column.join.toTable, types: ["text"] });
            if (error) {
                return error;
            }
        }
        return null;
    }
    renderControl(props) {
        // If can't be rendered due to missing context variable, just show placeholder
        if (!props.rowContextVar || !this.blockDef.column) {
            return React.createElement(react_select_1.default, null);
        }
        // Get column
        const column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
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
    }
    renderEnum(props, column) {
        const enumValues = column.enumValues;
        const enumValue = enumValues.find(ev => ev.id === props.value) || null;
        const getOptionLabel = (ev) => localization_1.localize(ev.name, props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (ev) => props.onChange(ev ? ev.id : null);
        return React.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: column.enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, styles: {
                // Keep menu above other controls
                menu: (style) => (Object.assign({}, style, { zIndex: 2000 }))
            } });
    }
    renderEnumset(props, column) {
        const enumValues = column.enumValues;
        // Map value to array
        let value = null;
        if (props.value) {
            value = _.compact(props.value.map((v) => enumValues.find(ev => ev.id === v)));
        }
        const getOptionLabel = (ev) => localization_1.localize(ev.name, props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (evs) => {
            props.onChange(evs && evs.length > 0 ? evs.map(ev => ev.id) : null);
        };
        return React.createElement(react_select_1.default, { value: value, onChange: handleChange, options: column.enumValues, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isDisabled: props.disabled, isClearable: true, isMulti: true, styles: {
                // Keep menu above other controls
                menu: (style) => (Object.assign({}, style, { zIndex: 2000 }))
            } });
    }
    renderId(props, column) {
        const exprCompiler = new mwater_expressions_1.ExprCompiler(props.schema);
        const labelExpr = exprCompiler.compileExpr({ expr: this.blockDef.idLabelExpr || null, tableAlias: "main" });
        const filterExpr = exprCompiler.compileExpr({ expr: this.blockDef.idFilterExpr || null, tableAlias: "main" });
        // TODO Should use a local implementation that uses database, not dataSource for data. This one will not 
        // pick up any changes in a virtual database
        return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: props.schema, dataSource: props.dataSource, idTable: column.join.toTable, value: props.value, onChange: props.onChange, labelExpr: labelExpr, filter: filterExpr });
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        let column = null;
        if (contextVar && contextVar.table && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            column && column.type === "join" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Label Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "idLabelExpr" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["text"], table: column.join.toTable })))
                : null,
            column && column.type === "join" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter Expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "idFilterExpr" }, (value, onChange) => React.createElement(mwater_expressions_ui_1.FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: column.join.toTable })))
                : null));
    }
    /** Filter the columns that this control is for. Can't be expression */
    filterColumn(column) {
        if (column.expr) {
            return false;
        }
        return column.type === "enum" || column.type === "enumset" || (column.type === "join" && column.join.type === "n-1");
    }
}
exports.DropdownBlock = DropdownBlock;
//# sourceMappingURL=dropdown.js.map