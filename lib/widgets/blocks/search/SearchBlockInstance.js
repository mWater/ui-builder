"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchControl = void 0;
const react_1 = __importDefault(require("react"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const localization_1 = require("../../localization");
const react_2 = require("react");
/** Search block that filters the rowset */
const SearchBlockInstance = (props) => {
    const { blockDef, instanceCtx } = props;
    const [searchText, setSearchText] = (0, react_2.useState)("");
    const searchControlRef = (0, react_2.useRef)(null);
    // Focus if enabled
    (0, react_2.useEffect)(() => {
        if (blockDef.autoFocus && searchControlRef.current) {
            searchControlRef.current.focus();
        }
    }, []);
    const createExprFilter = (expr, searchText, table) => {
        const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const exprUtils = new mwater_expressions_1.ExprUtils(instanceCtx.schema, (0, blocks_1.createExprVariables)(instanceCtx.contextVars));
        // Get type of search expression
        const exprType = exprUtils.getExprType(expr);
        if (exprType === "text") {
            return {
                type: "op",
                op: "~*",
                table: table,
                exprs: [expr, { type: "literal", valueType: "text", value: escapeRegex(searchText) }]
            };
        }
        if (exprType === "text[]") {
            return {
                type: "op",
                op: "~*",
                table: table,
                exprs: [
                    { type: "op", op: "to text", table: table, exprs: [expr] },
                    { type: "literal", valueType: "text", value: escapeRegex(searchText) }
                ]
            };
        }
        if (exprType === "enum") {
            // Find matching enums
            const enumValues = exprUtils
                .getExprEnumValues(expr)
                .filter((ev) => (0, localization_1.localize)(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()));
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "= any",
                table: table,
                exprs: [expr, { type: "literal", valueType: "enumset", value: enumValues.map((ev) => ev.id) }]
            };
        }
        if (exprType === "enumset") {
            // Find matching enums
            const enumValues = exprUtils
                .getExprEnumValues(expr)
                .filter((ev) => (0, localization_1.localize)(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()));
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "intersects",
                table: table,
                exprs: [expr, { type: "literal", valueType: "enumset", value: enumValues.map((ev) => ev.id) }]
            };
        }
        throw new Error("Unsupported search type " + exprType);
    };
    /** Create a filter for the target with the specified filter id */
    function createFilter(searchTarget, filterId, searchText) {
        // Get table
        const table = instanceCtx.contextVars.find((cv) => cv.id === searchTarget.rowsetContextVarId).table;
        if (searchText) {
            const searchExprs = searchTarget.searchExprs.map((se) => createExprFilter(se, searchText, table));
            const expr = {
                type: "op",
                op: "or",
                table: table,
                exprs: searchExprs
            };
            return { id: filterId, expr: expr };
        }
        else {
            return { id: filterId, expr: null };
        }
    }
    const handleChange = (value) => {
        setSearchText(value);
        // Set filters
        instanceCtx.setFilter(blockDef.rowsetContextVarId, createFilter(blockDef, blockDef.id, value));
        // Set extra filters
        if (blockDef.extraSearchTargets) {
            for (let i = 0; i < blockDef.extraSearchTargets.length; i++) {
                const searchTarget = blockDef.extraSearchTargets[i];
                instanceCtx.setFilter(searchTarget.rowsetContextVarId, createFilter(searchTarget, `${blockDef.id}-${i}`, value));
            }
        }
    };
    return (react_1.default.createElement(SearchControl, { value: searchText, onChange: handleChange, ref: searchControlRef, placeholder: (0, localization_1.localize)(blockDef.placeholder, instanceCtx.locale) }));
};
exports.default = SearchBlockInstance;
/** Simple input box with magnifying glass */
class SearchControl extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.inputRef = react_1.default.createRef();
        this.handleChange = (ev) => {
            if (this.props.onChange) {
                this.props.onChange(ev.target.value);
            }
        };
    }
    focus() {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }
    render() {
        return (react_1.default.createElement("div", { style: { position: "relative", display: "inline-block", margin: 5, width: "15em" } },
            react_1.default.createElement("i", { className: "fa fa-search", style: { position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" } }),
            react_1.default.createElement("input", { type: "text", ref: this.inputRef, className: "form-control", style: { width: "100%" }, value: this.props.value, onChange: this.handleChange, placeholder: this.props.placeholder })));
    }
}
exports.SearchControl = SearchControl;
