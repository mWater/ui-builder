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
var SearchBlockInstance_1 = __importStar(require("./SearchBlockInstance"));
var ListEditor_1 = __importDefault(require("../../ListEditor"));
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var localization_1 = require("../../localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var SearchBlock = /** @class */ (function (_super) {
    __extends(SearchBlock, _super);
    function SearchBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SearchBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate rowset
        var rowsetCV = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (this.blockDef.searchExprs.length === 0) {
            return "Search expression required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        for (var _i = 0, _a = this.blockDef.searchExprs; _i < _a.length; _i++) {
            var searchExpr = _a[_i];
            if (!searchExpr) {
                return "Search expression required";
            }
            var error = void 0;
            // Validate expr
            error = exprValidator.validateExpr(searchExpr, { table: rowsetCV.table, types: ["text", "enum", "enumset"] });
            if (error) {
                return error;
            }
        }
        return null;
    };
    SearchBlock.prototype.renderDesign = function (props) {
        return React.createElement(SearchBlockInstance_1.SearchControl, { value: "", placeholder: localization_1.localize(this.blockDef.placeholder, props.locale) });
    };
    SearchBlock.prototype.renderInstance = function (props) {
        return React.createElement(SearchBlockInstance_1.default, { blockDef: this.blockDef, instanceCtx: props });
    };
    SearchBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Search expressions" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "searchExprs" }, function (value, onItemsChange) {
                        var handleAddSearchExpr = function () {
                            onItemsChange(value.concat(null));
                        };
                        return (React.createElement("div", null,
                            React.createElement(ListEditor_1.default, { items: value, onItemsChange: onItemsChange }, function (expr, onExprChange) { return (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: expr, schema: props.schema, dataSource: props.dataSource, onChange: onExprChange, table: rowsetCV.table, types: ["text", "enum", "enumset"] })); }),
                            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddSearchExpr }, "+ Add Expression")));
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "autoFocus" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Automatically focus on load"); })));
    };
    return SearchBlock;
}(LeafBlock_1.default));
exports.SearchBlock = SearchBlock;
