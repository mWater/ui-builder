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
class DropdownFilterBlock extends LeafBlock_1.default {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (!this.blockDef.filterExpr) {
            return "Filter expression required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Validate expr
        let error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "text", "date", "datetime"] });
        if (error) {
            return error;
        }
        return null;
    }
    createFilter(schema, contextVars, value) {
        const valueType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(this.blockDef.filterExpr);
        const contextVar = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const table = contextVar.table;
        switch (valueType) {
            case "enum":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr, { type: "literal", valueType: "enum", value: value }] } : null,
                    memo: value
                };
            case "text":
                return {
                    id: this.blockDef.id,
                    expr: value ? { type: "op", table: table, op: "=", exprs: [this.blockDef.filterExpr, { type: "literal", valueType: "text", value: value }] } : null,
                    memo: value
                };
            case "date":
                return {
                    id: this.blockDef.id,
                    expr: DateExprComponent_1.toExpr(table, this.blockDef.filterExpr, false, value),
                    memo: value
                };
            case "datetime":
                return {
                    id: this.blockDef.id,
                    expr: DateExprComponent_1.toExpr(table, this.blockDef.filterExpr, true, value),
                    memo: value
                };
        }
        throw new Error("Unknown type");
    }
    renderDesign(props) {
        const styles = {
            control: (base) => (Object.assign({}, base, { height: 34, minHeight: 34 }))
        };
        const valueType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        if (valueType === "date" || valueType === "datetime") {
            const doNothing = () => null;
            const placeholder = localization_1.localize(this.blockDef.placeholder, props.locale);
            return (React.createElement("div", { style: { padding: 5 } },
                React.createElement(DateExprComponent_1.default, { table: "", datetime: valueType === "datetime", value: null, onChange: doNothing, placeholder: placeholder })));
        }
        return React.createElement("div", { style: { padding: 5 } },
            React.createElement(react_select_1.default, { styles: styles }));
    }
    renderInstance(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const filter = props.getFilters(this.blockDef.rowsetContextVarId).find(f => f.id === this.blockDef.id);
        const value = filter ? filter.memo : null;
        const handleChange = (newValue) => {
            // Create filter
            const newFilter = this.createFilter(props.schema, props.contextVars, newValue);
            props.setFilter(contextVar.id, newFilter);
        };
        const valueType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        const placeholder = localization_1.localize(this.blockDef.placeholder, props.locale);
        let elem;
        switch (valueType) {
            case "enum":
                elem = React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, onChange: handleChange, locale: props.locale });
                break;
            case "text":
                elem = React.createElement(TextInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, database: props.database, onChange: handleChange, locale: props.locale });
                break;
            case "date":
                elem = React.createElement(DateExprComponent_1.default, { datetime: false, table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder });
                break;
            case "datetime":
                elem = React.createElement(DateExprComponent_1.default, { datetime: true, table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder });
                break;
            default:
                elem = React.createElement("div", null);
        }
        return React.createElement("div", { style: { padding: 5 } }, elem);
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "filterExpr" }, (expr, onExprChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["enum", "text", "date", "datetime"] }))))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.DropdownFilterBlock = DropdownFilterBlock;
//# sourceMappingURL=dropdownFilter.js.map