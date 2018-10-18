import * as React from "react";
import { createExprVariables } from "../../blocks";
import { ExprUtils } from "mwater-expressions";
import { localize } from "../../localization";
export default class SearchBlockInstance extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (ev) => {
            const blockDef = this.props.blockDef;
            const searchText = ev.target.value;
            this.setState({ searchText: searchText });
            // Set filter 
            this.props.renderInstanceProps.setFilter(blockDef.rowsetContextVarId, this.createFilter(searchText));
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
        return (React.createElement("div", { className: "input-group", style: { padding: 5 } },
            React.createElement("span", { className: "input-group-addon" },
                React.createElement("i", { className: "fa fa-search" })),
            React.createElement("input", { type: "text", className: "form-control", style: { maxWidth: "20em" }, value: this.state.searchText, onChange: this.handleChange, placeholder: localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale) })));
    }
}
//# sourceMappingURL=SearchBlockInstance.js.map