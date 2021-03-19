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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleFilterBlock = void 0;
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importStar(require("react"));
var LeafBlock_1 = __importDefault(require("../LeafBlock"));
var blocks_1 = require("../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var propertyEditors_1 = require("../propertyEditors");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var localization_1 = require("../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ListEditor_1 = __importDefault(require("../ListEditor"));
/** Dropdown that filters one or more rowsets. The value of the filter is stored in the memo of the rowset filter
 * and depends on which type of filter it is.
 */
var ToggleFilterBlock = /** @class */ (function (_super) {
    __extends(ToggleFilterBlock, _super);
    function ToggleFilterBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ToggleFilterBlock.prototype.validate = function (options) {
        // Check that at least one option
        if (this.blockDef.options.length == 0) {
            return "At least one option required";
        }
        for (var _i = 0, _a = this.blockDef.options; _i < _a.length; _i++) {
            var option = _a[_i];
            var _loop_1 = function (filter) {
                // Validate rowset
                var rowsetCV = options.contextVars.find(function (cv) { return cv.id === filter.rowsetContextVarId && cv.type === "rowset"; });
                if (!rowsetCV) {
                    return { value: "Rowset required" };
                }
                if (!filter.filterExpr) {
                    return { value: "Filter expression required" };
                }
                var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
                var error = exprValidator.validateExpr(filter.filterExpr, { table: rowsetCV.table, types: ["boolean"] });
                if (error) {
                    return { value: error };
                }
            };
            // Validate filters
            for (var _b = 0, _c = option.filters; _b < _c.length; _b++) {
                var filter = _c[_b];
                var state_1 = _loop_1(filter);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            // Ensure that a max of one filter per rowset
            if (lodash_1.default.uniq(option.filters.map(function (f) { return f.rowsetContextVarId; })).length < option.filters.length) {
                return "Maximum of one filter per rowset per option";
            }
        }
        return null;
    };
    ToggleFilterBlock.prototype.canonicalize = function () {
        if (this.blockDef.forceSelection && this.blockDef.options.length > 0 && this.blockDef.initialOption == null) {
            return __assign(__assign({}, this.blockDef), { initialOption: 0 });
        }
        return this.blockDef;
    };
    ToggleFilterBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var options = this.blockDef.options.map(function (o, index) { return ({ value: index, label: localization_1.localize(o.label, props.locale) }); });
        return react_1.default.createElement(bootstrap_1.Toggle, { options: options, value: this.blockDef.initialOption, onChange: function (index) { return props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { initialOption: index })); }, allowReset: !this.blockDef.forceSelection, size: mapToggleSize(this.blockDef.size) });
    };
    ToggleFilterBlock.prototype.renderInstance = function (ctx) {
        return react_1.default.createElement(ToggleFilterInstance, { blockDef: this.blockDef, ctx: ctx });
    };
    ToggleFilterBlock.prototype.renderEditor = function (props) {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Size" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "size" }, function (value, onChange) {
                    return react_1.default.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [
                            { value: "normal", label: "Default" },
                            { value: "small", label: "Small" },
                            { value: "extrasmall", label: "Extra-small" },
                            { value: "large", label: "Large" }
                        ] });
                })),
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "forceSelection", key: "forceSelection" }, function (value, onChange) { return react_1.default.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Force Selection"); }),
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Options", key: "options" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "options" }, function (value, onOptionsChange) {
                    var handleAddSearchExpr = function () {
                        onOptionsChange((value || []).concat({ label: { _base: "en", en: "Option" }, filters: [] }));
                    };
                    return (react_1.default.createElement("div", null,
                        react_1.default.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onOptionsChange }, function (option, onOptionChange) { return (react_1.default.createElement(EditOptionComponent, { option: option, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, onChange: onOptionChange, locale: props.locale })); }),
                        react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Option")));
                }))));
    };
    return ToggleFilterBlock;
}(LeafBlock_1.default));
exports.ToggleFilterBlock = ToggleFilterBlock;
/** Edits a single toggle option */
function EditOptionComponent(props) {
    return react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Label", key: "label" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.option, onChange: props.onChange, property: "label" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filters", key: "filters" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.option, onChange: props.onChange, property: "filters" }, function (value, onChange) {
                function handleAddFilter() {
                    onChange(__spreadArrays(value, [{ rowsetContextVarId: null, filterExpr: null }]));
                }
                return react_1.default.createElement("div", null,
                    react_1.default.createElement(ListEditor_1.default, { items: value, onItemsChange: onChange }, function (filter, onFilterChange) {
                        return react_1.default.createElement(EditFilterComponent, { filter: filter, onChange: onFilterChange, contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource });
                    }),
                    react_1.default.createElement("button", { type: "button", className: "btn btn-link btn-xs", onClick: handleAddFilter }, "+ Add Filter"));
            })));
}
/** Edits a single filter of an option */
function EditFilterComponent(props) {
    var extraFilterCV = props.contextVars.find(function (cv) { return cv.id === props.filter.rowsetContextVarId; });
    return react_1.default.createElement("div", null,
        react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
            react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.filter, onChange: props.onChange, property: "rowsetContextVarId" }, function (value, onChange) { return react_1.default.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
        extraFilterCV ?
            react_1.default.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                react_1.default.createElement(propertyEditors_1.PropertyEditor, { obj: props.filter, onChange: props.onChange, property: "filterExpr" }, function (value, onChange) { return react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, schema: props.schema, dataSource: props.dataSource, onChange: onChange, table: extraFilterCV.table, variables: blocks_1.createExprVariables(props.contextVars), types: ["boolean"] }); }))
            : null);
}
function ToggleFilterInstance(props) {
    var blockDef = props.blockDef, ctx = props.ctx;
    var _a = react_1.useState(blockDef.initialOption), selectedIndex = _a[0], setSelectedIndex = _a[1];
    // Set filter
    react_1.useEffect(function () {
        // Get all rowset variables possibly used
        var rowsetCVIds = lodash_1.default.uniq(lodash_1.default.flattenDeep(blockDef.options.map(function (o) { return o.filters; }).map(function (fs) { return fs.map(function (f) { return f.rowsetContextVarId; }); })));
        var _loop_2 = function (rowsetCVId) {
            // Determine filter
            var option = selectedIndex != null ? blockDef.options[selectedIndex] : null;
            var filter = option ? option.filters.find(function (f) { return f.rowsetContextVarId == rowsetCVId; }) : null;
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
        };
        // For each rowset
        for (var _i = 0, rowsetCVIds_1 = rowsetCVIds; _i < rowsetCVIds_1.length; _i++) {
            var rowsetCVId = rowsetCVIds_1[_i];
            _loop_2(rowsetCVId);
        }
    }, [selectedIndex]);
    var options = blockDef.options.map(function (o, index) { return ({ value: index, label: localization_1.localize(o.label, ctx.locale) }); });
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
