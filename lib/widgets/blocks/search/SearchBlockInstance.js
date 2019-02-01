"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var blocks_1 = require("../../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var localization_1 = require("../../localization");
/** Search block that filters the rowset */
var SearchBlockInstance = /** @class */ (function (_super) {
    __extends(SearchBlockInstance, _super);
    function SearchBlockInstance(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChange = function (value) {
            var blockDef = _this.props.blockDef;
            _this.setState({ searchText: value });
            // Set filter 
            _this.props.renderInstanceProps.setFilter(blockDef.rowsetContextVarId, _this.createFilter(value));
        };
        _this.state = { searchText: "" };
        return _this;
    }
    SearchBlockInstance.prototype.createFilter = function (searchText) {
        var _this = this;
        var blockDef = this.props.blockDef;
        // Get table
        var table = this.props.renderInstanceProps.contextVars.find(function (cv) { return cv.id === _this.props.blockDef.rowsetContextVarId; }).table;
        if (searchText) {
            var searchExprs = blockDef.searchExprs.map(function (se) { return _this.createExprFilter(se, searchText, table); });
            var expr = {
                type: "op",
                op: "or",
                table: table,
                exprs: searchExprs
            };
            return { id: blockDef.id, expr: expr };
        }
        else {
            return { id: blockDef.id, expr: null };
        }
    };
    SearchBlockInstance.prototype.createExprFilter = function (expr, searchText, table) {
        var _this = this;
        var escapeRegex = function (s) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
        var exprUtils = new mwater_expressions_1.ExprUtils(this.props.renderInstanceProps.schema, blocks_1.createExprVariables(this.props.renderInstanceProps.contextVars));
        // Get type of search expression
        var exprType = exprUtils.getExprType(expr);
        if (exprType === "text") {
            return {
                type: "op",
                op: "~*",
                table: table,
                exprs: [
                    expr,
                    { type: "literal", valueType: "text", value: escapeRegex(searchText) }
                ]
            };
        }
        if (exprType === "enum") {
            // Find matching enums
            var enumValues = exprUtils.getExprEnumValues(expr).filter(function (ev) { return localization_1.localize(ev.name, _this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()); });
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "= any",
                table: table,
                exprs: [
                    expr,
                    { type: "literal", valueType: "enumset", value: enumValues.map(function (ev) { return ev.id; }) }
                ]
            };
        }
        if (exprType === "enumset") {
            // Find matching enums
            var enumValues = exprUtils.getExprEnumValues(expr).filter(function (ev) { return localization_1.localize(ev.name, _this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()); });
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "intersects",
                table: table,
                exprs: [
                    expr,
                    { type: "literal", valueType: "enumset", value: enumValues.map(function (ev) { return ev.id; }) }
                ]
            };
        }
        throw new Error("Unsupported search type " + exprType);
    };
    SearchBlockInstance.prototype.render = function () {
        return React.createElement(SearchControl, { value: this.state.searchText, onChange: this.handleChange, placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale) });
    };
    return SearchBlockInstance;
}(React.Component));
exports.default = SearchBlockInstance;
/** Simple input box with magnifying glass */
var SearchControl = /** @class */ (function (_super) {
    __extends(SearchControl, _super);
    function SearchControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (ev) {
            if (_this.props.onChange) {
                _this.props.onChange(ev.target.value);
            }
        };
        return _this;
    }
    SearchControl.prototype.render = function () {
        return (React.createElement("div", { style: { position: "relative", display: "inline-block", margin: 5 } },
            React.createElement("i", { className: "fa fa-search", style: { position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" } }),
            React.createElement("input", { type: "text", className: "form-control", style: { maxWidth: "20em" }, value: this.props.value, onChange: this.handleChange, placeholder: this.props.placeholder })));
    };
    return SearchControl;
}(React.Component));
exports.SearchControl = SearchControl;
//# sourceMappingURL=SearchBlockInstance.js.map