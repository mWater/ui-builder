import React from "react";
import { ExprUtils } from "mwater-expressions";
import { createExprVariables } from "../../blocks";
import { localize } from "../../localization";
import ReactSelect from "react-select";
export default class EnumInstance extends React.Component {
    render() {
        const enumValues = this.props.blockDef.filterExpr ? new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr) : null;
        const enumValue = enumValues ? enumValues.find(ev => ev.id === this.props.value) : null;
        const getOptionLabel = (ev) => localize(ev.name, this.props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (ev) => this.props.onChange(ev ? ev.id : null);
        const styles = {
            control: (base) => (Object.assign({}, base, { height: 34, minHeight: 34, minWidth: 150 }))
        };
        return React.createElement(ReactSelect, { value: enumValue, onChange: handleChange, options: enumValues || undefined, placeholder: localize(this.props.blockDef.placeholder, this.props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, styles: styles });
    }
}
//# sourceMappingURL=EnumInstance.js.map