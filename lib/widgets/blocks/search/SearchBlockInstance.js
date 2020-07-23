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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchControl = void 0;
var React = __importStar(require("react"));
var blocks_1 = require("../../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var localization_1 = require("../../localization");
var react_1 = require("react");
/** Search block that filters the rowset */
var SearchBlockInstance = function (props) {
    var blockDef = props.blockDef, instanceCtx = props.instanceCtx;
    var _a = react_1.useState(""), searchText = _a[0], setSearchText = _a[1];
    var searchControlRef = react_1.useRef(null);
    // Focus if enabled
    react_1.useEffect(function () {
        if (blockDef.autoFocus && searchControlRef.current) {
            searchControlRef.current.focus();
        }
    }, []);
    var createExprFilter = function (expr, searchText, table) {
        var escapeRegex = function (s) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
        var exprUtils = new mwater_expressions_1.ExprUtils(instanceCtx.schema, blocks_1.createExprVariables(instanceCtx.contextVars));
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
            var enumValues = exprUtils.getExprEnumValues(expr).filter(function (ev) { return localization_1.localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()); });
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
            var enumValues = exprUtils.getExprEnumValues(expr).filter(function (ev) { return localization_1.localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()); });
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
    var createFilter = function (searchText) {
        // Get table
        var table = instanceCtx.contextVars.find(function (cv) { return cv.id === blockDef.rowsetContextVarId; }).table;
        if (searchText) {
            var searchExprs = blockDef.searchExprs.map(function (se) { return createExprFilter(se, searchText, table); });
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
    var handleChange = function (value) {
        setSearchText(value);
        // Set filter 
        instanceCtx.setFilter(blockDef.rowsetContextVarId, createFilter(value));
    };
    return React.createElement(SearchControl, { value: searchText, onChange: handleChange, ref: searchControlRef, placeholder: localization_1.localize(blockDef.placeholder, instanceCtx.locale) });
};
exports.default = SearchBlockInstance;
/** Simple input box with magnifying glass */
var SearchControl = /** @class */ (function (_super) {
    __extends(SearchControl, _super);
    function SearchControl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inputRef = React.createRef();
        _this.handleChange = function (ev) {
            if (_this.props.onChange) {
                _this.props.onChange(ev.target.value);
            }
        };
        return _this;
    }
    SearchControl.prototype.focus = function () {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    };
    SearchControl.prototype.render = function () {
        return (React.createElement("div", { style: { position: "relative", display: "inline-block", margin: 5 } },
            React.createElement("i", { className: "fa fa-search", style: { position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" } }),
            React.createElement("input", { type: "text", ref: this.inputRef, className: "form-control", style: { maxWidth: "20em", minWidth: "10em" }, value: this.props.value, onChange: this.handleChange, placeholder: this.props.placeholder })));
    };
    return SearchControl;
}(React.Component));
exports.SearchControl = SearchControl;
