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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchControl = void 0;
const React = __importStar(require("react"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const localization_1 = require("../../localization");
const react_1 = require("react");
/** Search block that filters the rowset */
const SearchBlockInstance = (props) => {
    const { blockDef, instanceCtx } = props;
    const [searchText, setSearchText] = react_1.useState("");
    const searchControlRef = react_1.useRef(null);
    // Focus if enabled
    react_1.useEffect(() => {
        if (blockDef.autoFocus && searchControlRef.current) {
            searchControlRef.current.focus();
        }
    }, []);
    const createExprFilter = (expr, searchText, table) => {
        const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const exprUtils = new mwater_expressions_1.ExprUtils(instanceCtx.schema, blocks_1.createExprVariables(instanceCtx.contextVars));
        // Get type of search expression
        const exprType = exprUtils.getExprType(expr);
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
            const enumValues = exprUtils.getExprEnumValues(expr).filter(ev => localization_1.localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()));
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "= any",
                table: table,
                exprs: [
                    expr,
                    { type: "literal", valueType: "enumset", value: enumValues.map(ev => ev.id) }
                ]
            };
        }
        if (exprType === "enumset") {
            // Find matching enums
            const enumValues = exprUtils.getExprEnumValues(expr).filter(ev => localization_1.localize(ev.name, instanceCtx.locale).toLowerCase().includes(searchText.toLowerCase()));
            if (enumValues.length === 0) {
                return null;
            }
            return {
                type: "op",
                op: "intersects",
                table: table,
                exprs: [
                    expr,
                    { type: "literal", valueType: "enumset", value: enumValues.map(ev => ev.id) }
                ]
            };
        }
        throw new Error("Unsupported search type " + exprType);
    };
    const createFilter = (searchText) => {
        // Get table
        const table = instanceCtx.contextVars.find(cv => cv.id === blockDef.rowsetContextVarId).table;
        if (searchText) {
            const searchExprs = blockDef.searchExprs.map(se => createExprFilter(se, searchText, table));
            const expr = {
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
    const handleChange = (value) => {
        setSearchText(value);
        // Set filter 
        instanceCtx.setFilter(blockDef.rowsetContextVarId, createFilter(value));
    };
    return React.createElement(SearchControl, { value: searchText, onChange: handleChange, ref: searchControlRef, placeholder: localization_1.localize(blockDef.placeholder, instanceCtx.locale) });
};
exports.default = SearchBlockInstance;
/** Simple input box with magnifying glass */
class SearchControl extends React.Component {
    constructor() {
        super(...arguments);
        this.inputRef = React.createRef();
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
        return (React.createElement("div", { style: { position: "relative", display: "inline-block", margin: 5, width: "15em" } },
            React.createElement("i", { className: "fa fa-search", style: { position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" } }),
            React.createElement("input", { type: "text", ref: this.inputRef, className: "form-control", style: { width: "100%" }, value: this.props.value, onChange: this.handleChange, placeholder: this.props.placeholder })));
    }
}
exports.SearchControl = SearchControl;
