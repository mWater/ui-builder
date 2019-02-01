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
const SearchBlockInstance_1 = __importStar(require("./SearchBlockInstance"));
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const localization_1 = require("../../localization");
class SearchBlock extends LeafBlock_1.default {
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (this.blockDef.searchExprs.length === 0) {
            return "Search expression required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        for (const searchExpr of this.blockDef.searchExprs) {
            if (!searchExpr) {
                return "Search expression required";
            }
            let error;
            // Validate expr
            error = exprValidator.validateExpr(searchExpr, { table: rowsetCV.table, types: ["text", "enum", "enumset"] });
            if (error) {
                return error;
            }
        }
        return null;
    }
    renderDesign(props) {
        return React.createElement(SearchBlockInstance_1.SearchControl, { value: "", placeholder: localization_1.localize(this.blockDef.placeholder, props.locale) });
    }
    renderInstance(props) {
        return React.createElement(SearchBlockInstance_1.default, { blockDef: this.blockDef, renderInstanceProps: props });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "searchExprs" }, (value, onItemsChange) => {
                        const handleAddSearchExpr = () => {
                            onItemsChange(value.concat(null));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor_1.default, { items: value, onItemsChange: onItemsChange }, (expr, onExprChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["text", "enum", "enumset"] }))),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))));
    }
}
exports.SearchBlock = SearchBlock;
//# sourceMappingURL=search.js.map