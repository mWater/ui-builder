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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchBlock = void 0;
const React = __importStar(require("react"));
const LeafBlock_1 = __importDefault(require("../../LeafBlock"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const propertyEditors_1 = require("../../propertyEditors");
const SearchBlockInstance_1 = __importStar(require("./SearchBlockInstance"));
const ListEditor_1 = __importDefault(require("../../ListEditor"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const localization_1 = require("../../localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const immer_1 = require("immer");
class SearchBlock extends LeafBlock_1.default {
    validate(options) {
        function validateSearchTarget(searchTarget) {
            // Validate rowset
            const rowsetCV = options.contextVars.find(cv => cv.id === searchTarget.rowsetContextVarId && cv.type === "rowset");
            if (!rowsetCV) {
                return "Rowset required";
            }
            if (searchTarget.searchExprs.length === 0) {
                return "Search expression required";
            }
            const exprValidator = new mwater_expressions_1.ExprValidator(options.schema, (0, blocks_1.createExprVariables)(options.contextVars));
            for (const searchExpr of searchTarget.searchExprs) {
                if (!searchExpr) {
                    return "Search expression required";
                }
                let error;
                // Validate expr
                error = exprValidator.validateExpr(searchExpr, { table: rowsetCV.table, types: ["text", "enum", "enumset", "text[]"] });
                if (error) {
                    return error;
                }
            }
            return null;
        }
        let error = validateSearchTarget(this.blockDef);
        if (error) {
            return error;
        }
        // Validate extras
        if (this.blockDef.extraSearchTargets) {
            for (const searchTarget of this.blockDef.extraSearchTargets) {
                error = validateSearchTarget(searchTarget);
                if (error) {
                    return error;
                }
            }
        }
        return null;
    }
    renderDesign(props) {
        return React.createElement(SearchBlockInstance_1.SearchControl, { value: "", placeholder: (0, localization_1.localize)(this.blockDef.placeholder, props.locale) });
    }
    renderInstance(props) {
        return React.createElement(SearchBlockInstance_1.default, { blockDef: this.blockDef, instanceCtx: props });
    }
    renderEditor(props) {
        function renderSearchTarget(searchTarget, onSearchTargetChange) {
            // Get rowset context variable
            const rowsetCV = props.contextVars.find(cv => cv.id === searchTarget.rowsetContextVarId);
            return (React.createElement("div", null,
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: searchTarget, onChange: onSearchTargetChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
                rowsetCV ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: searchTarget, onChange: onSearchTargetChange, property: "searchExprs" }, (value, onItemsChange) => {
                            const handleAddSearchExpr = () => {
                                onItemsChange(value.concat(null));
                            };
                            return (React.createElement("div", null,
                                React.createElement(ListEditor_1.default, { items: value, onItemsChange: onItemsChange }, (expr, onExprChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["text", "enum", "enumset", "text[]"], variables: (0, blocks_1.createExprVariables)(props.contextVars) }))),
                                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                        }))
                    : null));
        }
        return (React.createElement("div", null,
            renderSearchTarget(this.blockDef, (searchTarget) => {
                props.store.replaceBlock((0, immer_1.produce)(this.blockDef, draft => {
                    draft.rowsetContextVarId = searchTarget.rowsetContextVarId;
                    draft.searchExprs = searchTarget.searchExprs;
                }));
            }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "autoFocus" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Automatically focus on load")),
            this.blockDef.rowsetContextVarId && this.blockDef.searchExprs.length > 0 ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Additional searches on other rowsets" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "extraSearchTargets" }, (value, onItemsChange) => {
                        const handleAddExtraSearchTarget = () => {
                            onItemsChange((value || []).concat({ rowsetContextVarId: null, searchExprs: [] }));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor_1.default, { items: value || [], onItemsChange: onItemsChange }, (searchTarget, onSearchTargetChange) => renderSearchTarget(searchTarget, onSearchTargetChange)),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddExtraSearchTarget }, "+ Add Search")));
                    }))
                : null));
    }
}
exports.SearchBlock = SearchBlock;
