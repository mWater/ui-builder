import * as React from "react";
import { createExprVariables } from "../../blocks";
import { ExprUtils } from "mwater-expressions";
import { localize } from "../../localization";
/** Search block that filters the rowset */
export default class SearchBlockInstance extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (value) => {
            const blockDef = this.props.blockDef;
            this.setState({ searchText: value });
            // Set filter 
            this.props.renderInstanceProps.setFilter(blockDef.rowsetContextVarId, this.createFilter(value));
        };
        this.state = { searchText: "" };
    }
    createFilter(searchText) {
        const blockDef = this.props.blockDef;
        // Get table
        const table = this.props.renderInstanceProps.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId).table;
        if (searchText) {
            const searchExprs = blockDef.searchExprs.map(se => this.createExprFilter(se, searchText, table));
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
    }
    createExprFilter(expr, searchText, table) {
        const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const exprUtils = new ExprUtils(this.props.renderInstanceProps.schema, createExprVariables(this.props.renderInstanceProps.contextVars));
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
            const enumValues = exprUtils.getExprEnumValues(expr).filter(ev => localize(ev.name, this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()));
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
            const enumValues = exprUtils.getExprEnumValues(expr).filter(ev => localize(ev.name, this.props.renderInstanceProps.locale).toLowerCase().includes(searchText.toLowerCase()));
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
    }
    render() {
        return React.createElement(SearchControl, { value: this.state.searchText, onChange: this.handleChange, placeholder: localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale) });
    }
}
/** Simple input box with magnifying glass */
export class SearchControl extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (ev) => {
            if (this.props.onChange) {
                this.props.onChange(ev.target.value);
            }
        };
    }
    render() {
        return (React.createElement("div", { style: { position: "relative", display: "inline-block", margin: 5 } },
            React.createElement("i", { className: "fa fa-search", style: { position: "absolute", right: 8, top: 10, color: "#AAA", pointerEvents: "none" } }),
            React.createElement("input", { type: "text", className: "form-control", style: { maxWidth: "20em" }, value: this.props.value, onChange: this.handleChange, placeholder: this.props.placeholder })));
    }
}
//# sourceMappingURL=SearchBlockInstance.js.map