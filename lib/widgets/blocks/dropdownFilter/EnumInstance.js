"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("../../blocks");
const localization_1 = require("../../localization");
const react_select_1 = __importDefault(require("react-select"));
class EnumInstance extends react_1.default.Component {
    render() {
        const enumValues = this.props.blockDef.filterExpr ? new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr) : null;
        const enumValue = enumValues ? enumValues.find(ev => ev.id === this.props.value) : null;
        const getOptionLabel = (ev) => localization_1.localize(ev.name, this.props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (ev) => this.props.onChange(ev ? ev.id : null);
        // Make minimum size to fit text
        const minWidth = Math.min(300, Math.max(enumValue ? getOptionLabel(enumValue).length * 8 + 90 : 0, 150));
        const styles = {
            control: (style) => (Object.assign(Object.assign({}, style), { minWidth: minWidth })),
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        return react_1.default.createElement(react_select_1.default, { value: enumValue, onChange: handleChange, options: enumValues || undefined, placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, styles: styles, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short" });
    }
}
exports.default = EnumInstance;
