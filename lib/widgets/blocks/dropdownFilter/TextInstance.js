import React from "react";
import { ExprUtils } from "mwater-expressions";
import { createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import Async from 'react-select/lib/Async';
/** Dropdown filter that is a text string. Should search in database for matches */
export default class TextInstance extends React.Component {
    constructor() {
        super(...arguments);
        this.getOptions = async (input) => {
            const exprUtils = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr);
            const contextVar = this.props.contextVars.find(cv => cv.id === this.props.blockDef.rowsetContextVarId);
            const table = contextVar.table;
            const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const queryOptions = {
                select: { value: this.props.blockDef.filterExpr },
                distinct: true,
                from: table,
                where: {
                    type: "op",
                    op: "~*",
                    table: table,
                    exprs: [
                        this.props.blockDef.filterExpr,
                        { type: "literal", valueType: "text", value: "^" + escapeRegex(input) }
                    ]
                },
                orderBy: [{ expr: this.props.blockDef.filterExpr, dir: "asc" }],
                limit: 250
            };
            const rows = await this.props.database.query(queryOptions, this.props.contextVars, {});
            // Filter null and blank
            const values = rows.map(r => r.value).filter(v => v);
            return values.map(v => ({ value: v, label: v }));
        };
        this.handleChange = (option) => {
            const value = option ? (option.value || null) : null; // Blank is null
            this.props.onChange(value);
        };
    }
    render() {
        const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        const noOptionsMessage = () => "Type to search";
        const styles = {
            control: (base) => (Object.assign({}, base, { height: 34, minHeight: 34 }))
        };
        // TODO key: JSON.stringify(@props.filters)  # Include to force a change when filters change
        return React.createElement(Async, { placeholder: localize(this.props.blockDef.placeholder, this.props.locale), value: currentValue, defaultOptions: false, cacheOptions: null, loadOptions: this.getOptions, onChange: this.handleChange, isClearable: true, noOptionsMessage: noOptionsMessage, styles: styles });
        // styles: { 
        //   # Keep menu above fixed data table headers
        //   menu: (style) => _.extend({}, style, zIndex: 2)
        // }
    }
}
//# sourceMappingURL=TextInstance.js.map