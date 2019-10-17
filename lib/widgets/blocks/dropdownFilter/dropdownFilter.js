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
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var localization_1 = require("../../localization");
var react_select_1 = __importDefault(require("react-select"));
var EnumInstance_1 = __importDefault(require("./EnumInstance"));
var TextInstance_1 = __importDefault(require("./TextInstance"));
var DateExprComponent_1 = __importStar(require("./DateExprComponent"));
var immer_1 = __importDefault(require("immer"));
var DropdownFilterBlock = /** @class */ (function (_super) {
    __extends(DropdownFilterBlock, _super);
    function DropdownFilterBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropdownFilterBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate rowset
        var rowsetCV = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return "Rowset required";
        }
        if (!this.blockDef.filterExpr) {
            return "Filter expression required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Validate expr
        var error;
        error = exprValidator.validateExpr(this.blockDef.filterExpr, { table: rowsetCV.table, types: ["enum", "text", "date", "datetime"] });
        if (error) {
            return error;
        }
        return null;
    };
    DropdownFilterBlock.prototype.createFilter = function (schema, contextVars, value) {
        var _this = this;
        var valueType = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars)).getExprType(this.blockDef.filterExpr);
        var contextVar = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var table = contextVar.table;
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
    };
    DropdownFilterBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var styles = {
            control: function (base) { return (__assign(__assign({}, base), { height: 34, minHeight: 34 })); },
            // Keep menu above other controls
            menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        var valueType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        if (valueType === "date" || valueType === "datetime") {
            // Fake table
            var table = contextVar ? contextVar.table || "" : "";
            var handleSetDefault = function (defaultValue) {
                props.store.alterBlock(_this.blockDef.id, function (bd) {
                    return __assign(__assign({}, bd), { defaultValue: defaultValue });
                });
            };
            var placeholder = localization_1.localize(this.blockDef.placeholder, props.locale);
            return (React.createElement("div", { style: { padding: 5 } },
                React.createElement(DateExprComponent_1.default, { table: table, datetime: valueType === "datetime", value: this.blockDef.defaultValue, onChange: handleSetDefault, placeholder: placeholder, locale: props.locale })));
        }
        return React.createElement("div", { style: { padding: 5 } },
            React.createElement(react_select_1.default, { styles: styles }));
    };
    DropdownFilterBlock.prototype.getInitialFilters = function (options) {
        if (options.contextVarId == this.blockDef.rowsetContextVarId) {
            if (this.blockDef.defaultValue) {
                return [this.createFilter(options.schema, options.contextVars, this.blockDef.defaultValue)];
            }
        }
        return [];
    };
    DropdownFilterBlock.prototype.renderInstance = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var filter = props.getFilters(this.blockDef.rowsetContextVarId).find(function (f) { return f.id === _this.blockDef.id; });
        var value = filter ? filter.memo : null;
        var handleChange = function (newValue) {
            // Create filter
            var newFilter = _this.createFilter(props.schema, props.contextVars, newValue);
            props.setFilter(contextVar.id, newFilter);
        };
        var valueType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.filterExpr);
        var placeholder = localization_1.localize(this.blockDef.placeholder, props.locale);
        var elem;
        switch (valueType) {
            case "enum":
                elem = React.createElement(EnumInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, onChange: handleChange, locale: props.locale });
                break;
            case "text":
                elem = React.createElement(TextInstance_1.default, { blockDef: this.blockDef, schema: props.schema, contextVars: props.contextVars, value: value, database: props.database, onChange: handleChange, locale: props.locale });
                break;
            case "date":
                elem = React.createElement(DateExprComponent_1.default, { datetime: false, table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder, locale: props.locale });
                break;
            case "datetime":
                elem = React.createElement(DateExprComponent_1.default, { datetime: true, table: contextVar.table, value: value, onChange: handleChange, placeholder: placeholder, locale: props.locale });
                break;
            default:
                elem = React.createElement("div", null);
        }
        return React.createElement("div", { style: { padding: 5 } }, elem);
    };
    DropdownFilterBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var handleExprChange = function (expr) {
            props.onChange(immer_1.default(_this.blockDef, function (draft) {
                // Clear default value if expression changes
                draft.filterExpr = expr;
                delete draft.defaultValue;
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter expression" },
                    React.createElement(mwater_expressions_ui_1.ExprComponent, { value: this.blockDef.filterExpr, schema: props.schema, dataSource: props.dataSource, onChange: handleExprChange, table: rowsetCV.table, types: ["enum", "text", "date", "datetime"] }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return DropdownFilterBlock;
}(LeafBlock_1.default));
exports.DropdownFilterBlock = DropdownFilterBlock;
