import * as React from "react";
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
        const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        // Get table
        const table = this.props.renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowsetContextVarId).table;
        if (searchText) {
            const searchExprs = blockDef.searchExprs.map(se => {
                return {
                    type: "op",
                    op: "~*",
                    table: table,
                    exprs: [
                        se,
                        { type: "literal", valueType: "text", value: escapeRegex(searchText) }
                    ]
                };
            });
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
    render() {
        return (React.createElement("div", { className: "input-group", style: { padding: 5 } },
            React.createElement("span", { className: "input-group-addon" },
                React.createElement("i", { className: "fa fa-search" })),
            React.createElement("input", { type: "text", className: "form-control input-sm", style: { maxWidth: "20em" }, value: this.state.searchText, onChange: this.handleChange, placeholder: localize(this.props.blockDef.placeholder, this.props.renderInstanceProps.locale) })));
    }
}
//# sourceMappingURL=SearchBlockInstance.js.map