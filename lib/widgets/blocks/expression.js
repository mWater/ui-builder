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
var blocks_1 = require("../blocks");
var propertyEditors_1 = require("../propertyEditors");
var mwater_expressions_1 = require("mwater-expressions");
var d3Format = __importStar(require("d3-format"));
var moment_1 = __importDefault(require("moment"));
var textual_1 = require("./textual");
var ExpressionBlock = /** @class */ (function (_super) {
    __extends(ExpressionBlock, _super);
    function ExpressionBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpressionBlock.prototype.getContextVarExprs = function (contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    };
    ExpressionBlock.prototype.validate = function (ctx) {
        return blocks_1.validateContextVarExpr({
            schema: ctx.schema,
            contextVars: ctx.contextVars,
            contextVarId: this.blockDef.contextVarId,
            expr: this.blockDef.expr
        });
    };
    ExpressionBlock.prototype.renderDesign = function (props) {
        var summary = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale);
        return this.renderText(React.createElement("div", null,
            React.createElement("span", { className: "text-muted" }, "<"),
            summary,
            React.createElement("span", { className: "text-muted" }, ">")));
    };
    ExpressionBlock.prototype.renderInstance = function (props) {
        if (!this.blockDef.expr) {
            return React.createElement("div", null);
        }
        var value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        var exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        var formatLocale = props.formatLocale || d3Format;
        var str;
        if (value == null) {
            str = "";
        }
        else {
            if (exprType === "number") {
                str = formatLocale.format(this.blockDef.format || "")(value);
            }
            else if (exprType === "date" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(this.blockDef.format || "ll");
            }
            else if (exprType === "datetime" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(this.blockDef.format || "lll");
            }
            else {
                str = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale);
            }
        }
        return this.renderText(str);
    };
    ExpressionBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarId; });
        var exprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        var handleExprChange = function (expr) {
            // Clear format if type different
            var newExprType = new mwater_expressions_1.ExprUtils(props.schema, blocks_1.createExprVariables(props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { expr: expr, format: null }));
            }
            else {
                props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { expr: expr }));
            }
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Expression" },
                React.createElement(propertyEditors_1.ContextVarExprPropertyEditor, { contextVars: props.contextVars, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], contextVarId: this.blockDef.contextVarId, expr: this.blockDef.expr, onChange: function (contextVarId, expr) {
                        props.store.replaceBlock(__assign(__assign({}, _this.blockDef), { contextVarId: contextVarId, expr: expr }));
                    } })),
            exprType === "number" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Number Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.NumberFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            exprType === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            this.renderTextualEditor(props)));
    };
    return ExpressionBlock;
}(textual_1.TextualBlock));
exports.ExpressionBlock = ExpressionBlock;
