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
exports.ToggleFilterBlock = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../LeafBlock"));
const blocks_1 = require("../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../propertyEditors");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const localization_1 = require("../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditor_1 = __importDefault(require("../ListEditor"));
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
class ToggleFilterBlock extends LeafBlock_1.default {
    validate(options) {
        // Check that at least one option
        if (this.blockDef.options.length == 0) {
            return "At least one option required";
        }
        for (const option of this.blockDef.options) {
            // Validate filters
            for (const filter of option.filters) {
                // Validate rowset
                const rowsetCV = options.contextVars.find(cv => cv.id === filter.rowsetContextVarId && cv.type === "rowset");
                if (!rowsetCV) {
                    return "Rowset required";
                }
                const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
                const error = exprValidator.validateExpr(filter.filterExpr, { table: rowsetCV.table, types: ["boolean"] });
                if (error) {
                    return error;
                }
            }
            // Ensure that a max of one filter per rowset
            if (lodash_1.default.uniq(option.filters.map(f => f.rowsetContextVarId)).length < option.filters.length) {
                return "Maximum of one filter per rowset per option";
            }
        }
        return null;
    }
    canonicalize() {
        if (this.blockDef.forceSelection && this.blockDef.options.length > 0 && this.blockDef.initialOption == null) {
            return { ...this.blockDef, initialOption: 0 };
        }
        return this.blockDef;
    }
    renderDesign(props) {
        const options = this.blockDef.options.map((o, index) => ({ value: index, label: localization_1.localize(o.label, props.locale) }));
        return react_1.default.createElement(bootstrap_1.Toggle, { options: options, value: this.blockDef.initialOption, onChange: index => props.store.replaceBlock({ ...this.blockDef, initialOption: index }), allowReset: !this.blockDef.forceSelection, size: mapToggleSize(this.blockDef.size) });
    }
    renderInstance(ctx) {
        return react_1.default.createElement(ToggleFilterInstance, { blockDef: this.blockDef, ctx: ctx });
    }
    renderEditor(props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [
                        { value: "normal", label: "Default" },
                        { value: "small", label: "Small" },
                        { value: "extrasmall", label: "Extra-small" },
                        { value: "large", label: "Large" }
                    ] }))),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "forceSelection", key: "forceSelection" }, (value, onChange) => react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Force Selection")),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Options", key: "options" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "options" }, (value, onOptionsChange) => {
                    const handleAddSearchExpr = () => {
                        onOptionsChange((value || []).concat({ label: { _base: "en", en: "Option" }, filters: [] }));
                    };
                    return (react_1.default.createElement("div", null,
                        react_1.default.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onOptionsChange }, (option, onOptionChange) => (react_1.default.createElement(EditOptionComponent, { option: option, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, onChange: onOptionChange, locale: props.locale }))),
                        react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Option")));
                }))));
    }
}
exports.ToggleFilterBlock = ToggleFilterBlock;
/** Edits a single toggle option */
function EditOptionComponent(props) {
    return react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "label" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.option, onChange: props.onChange, property: "label" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filters", key: "filters" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.option, onChange: props.onChange, property: "filters" }, (value, onChange) => {
                function handleAddFilter() {
                    onChange([...value, { rowsetContextVarId: null, filterExpr: null }]);
                }
                return react_1.default.createElement("div", null,
                    react_1.default.createElement(ListEditor_1.default, { items: value, onItemsChange: onChange }, (filter, onFilterChange) => {
                        return react_1.default.createElement(EditFilterComponent, { filter: filter, onChange: onFilterChange, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource });
                    }),
                    react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-xs", onClick: handleAddFilter }, "+ Add Filter"));
            })));
}
/** Edits a single filter of an option */
function EditFilterComponent(props) {
    const extraFilterCV = props.contextVars.find(cv => cv.id === props.filter.rowsetContextVarId);
    return react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.filter, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
        extraFilterCV ?
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.filter, onChange: props.onChange, property: "filterExpr" }, (value, onChange) => react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, schema: props.schema, dataSource: props.dataSource, onChange: onChange, table: extraFilterCV.table, variables: blocks_1.createExprVariables(props.contextVars), types: ["boolean"] })))
            : null);
}
function ToggleFilterInstance(props) {
    const { blockDef, ctx } = props;
    const [selectedIndex, setSelectedIndex] = react_1.useState(blockDef.initialOption);
    // Set filter
    react_1.useEffect(() => {
        // Get all rowset variables possibly used
        const rowsetCVIds = lodash_1.default.uniq(lodash_1.default.flattenDeep(blockDef.options.map(o => o.filters).map(fs => fs.map(f => f.rowsetContextVarId))));
        // For each rowset
        for (const rowsetCVId of rowsetCVIds) {
            // Determine filter
            const option = selectedIndex != null ? blockDef.options[selectedIndex] : null;
            const filter = option ? option.filters.find(f => f.rowsetContextVarId == rowsetCVId) : null;
            if (filter) {
                ctx.setFilter(rowsetCVId, {
                    id: blockDef.id,
                    expr: filter.filterExpr
                });
            }
            else {
                ctx.setFilter(rowsetCVId, {
                    id: blockDef.id,
                    expr: null
                });
            }
        }
    }, [selectedIndex]);
    const options = blockDef.options.map((o, index) => ({ value: index, label: localization_1.localize(o.label, ctx.locale) }));
    return react_1.default.createElement(bootstrap_1.Toggle, { options: options, value: selectedIndex, onChange: setSelectedIndex, allowReset: !blockDef.forceSelection, size: mapToggleSize(blockDef.size) });
}
/** Map to toggle sizes */
function mapToggleSize(size) {
    if (size == "small") {
        return "sm";
    }
    if (size == "large") {
        return "lg";
    }
    if (size == "extrasmall") {
        return "xs";
    }
    return undefined;
}
