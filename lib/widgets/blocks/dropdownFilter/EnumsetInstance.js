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
class EnumsetInstance extends react_1.default.Component {
    render() {
        const enumValues = this.props.blockDef.filterExpr
            ? new mwater_expressions_1.ExprUtils(this.props.schema, (0, blocks_1.createExprVariables)(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr)
            : null;
        // Get selected values as enum values
        const selectedValues = enumValues && this.props.value ? this.props.value.map((v) => enumValues.find((ev) => ev.id == v)) : null;
        const getOptionLabel = (ev) => (0, localization_1.localize)(ev.name, this.props.locale);
        const getOptionValue = (ev) => ev.id;
        const handleChange = (evs) => this.props.onChange(evs && evs.length > 0 ? evs.map((ev) => ev.id) : null);
        // Make minimum size to fit text TODO just max for now
        const minWidth = 400; //Math.min(300, Math.max(selectedValue ? getOptionLabel(selectedValue).length * 8 + 90 : 0, 150))
        const styles = {
            control: (style) => (Object.assign(Object.assign({}, style), { minWidth: minWidth })),
            menuPortal: (style) => (Object.assign(Object.assign({}, style), { zIndex: 2000 }))
        };
        return (react_1.default.createElement(react_select_1.default, { value: selectedValues, isMulti: true, onChange: handleChange, options: enumValues || undefined, placeholder: (0, localization_1.localize)(this.props.blockDef.placeholder, this.props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, styles: styles, closeMenuOnScroll: true, menuPortalTarget: document.body, classNamePrefix: "react-select-short" }));
    }
}
exports.default = EnumsetInstance;
