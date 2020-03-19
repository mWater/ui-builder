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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("../../blocks");
var localization_1 = require("../../localization");
var react_select_1 = __importDefault(require("react-select"));
var EnumsetInstance = /** @class */ (function (_super) {
    __extends(EnumsetInstance, _super);
    function EnumsetInstance() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EnumsetInstance.prototype.render = function () {
        var _this = this;
        var enumValues = this.props.blockDef.filterExpr ? new mwater_expressions_1.ExprUtils(this.props.schema, blocks_1.createExprVariables(this.props.contextVars)).getExprEnumValues(this.props.blockDef.filterExpr) : null;
        // Get selected values as enum values
        var selectedValues = enumValues && this.props.value ? this.props.value.map(function (v) { return enumValues.find(function (ev) { return ev.id == v; }); }) : null;
        var getOptionLabel = function (ev) { return localization_1.localize(ev.name, _this.props.locale); };
        var getOptionValue = function (ev) { return ev.id; };
        var handleChange = function (evs) { return _this.props.onChange(evs && evs.length > 0 ? evs.map(function (ev) { return ev.id; }) : null); };
        // Make minimum size to fit text TODO just max for now
        var minWidth = 400; //Math.min(300, Math.max(selectedValue ? getOptionLabel(selectedValue).length * 8 + 90 : 0, 150))
        var styles = {
            control: function (base) { return (__assign(__assign({}, base), { height: 40, minHeight: 40, minWidth: minWidth })); },
            // Keep menu above other controls
            menu: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); },
            menuPortal: function (style) { return (__assign(__assign({}, style), { zIndex: 2000 })); }
        };
        return react_1.default.createElement(react_select_1.default, { value: selectedValues, isMulti: true, onChange: handleChange, options: enumValues || undefined, placeholder: localization_1.localize(this.props.blockDef.placeholder, this.props.locale), getOptionLabel: getOptionLabel, getOptionValue: getOptionValue, isClearable: true, styles: styles, closeMenuOnScroll: true, menuPortalTarget: document.body });
    };
    return EnumsetInstance;
}(react_1.default.Component));
exports.default = EnumsetInstance;
