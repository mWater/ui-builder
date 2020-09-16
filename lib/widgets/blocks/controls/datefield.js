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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatefieldBlock = void 0;
var React = __importStar(require("react"));
var ControlBlock_1 = require("./ControlBlock");
var localization_1 = require("../../localization");
var propertyEditors_1 = require("../../propertyEditors");
var react_datepicker_1 = __importDefault(require("react-datepicker"));
var moment_1 = __importDefault(require("moment"));
var react_dom_1 = __importDefault(require("react-dom"));
/** Block that is a text input control linked to a specific field */
var DatefieldBlock = /** @class */ (function (_super) {
    __extends(DatefieldBlock, _super);
    function DatefieldBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DatefieldBlock.prototype.renderControl = function (props) {
        // Get column
        var column;
        if (props.rowContextVar && this.blockDef.column) {
            column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        }
        var datetime = column ? column.type === "datetime" : false;
        var format = this.blockDef.format ? this.blockDef.format : (datetime ? "lll" : "ll");
        return React.createElement(Datefield, { value: props.value, onChange: props.onChange, placeholder: localization_1.localize(this.blockDef.placeholder, props.locale), disabled: props.disabled, datetime: datetime, format: format });
    };
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    DatefieldBlock.prototype.renderControlEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowContextVarId; });
        // Get column
        var column;
        if (contextVar && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            column && column.type === "date" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })); }))
                : null,
            column && column.type === "datetime" ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, function (value, onChange) { return (React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })); }))
                : null));
    };
    /** Filter the columns that this control is for */
    DatefieldBlock.prototype.filterColumn = function (column) {
        return column.type === "date" || column.type === "datetime";
    };
    /** Clear format */
    DatefieldBlock.prototype.processColumnChanged = function (blockDef) {
        return __assign(__assign({}, blockDef), { format: null });
    };
    return DatefieldBlock;
}(ControlBlock_1.ControlBlock));
exports.DatefieldBlock = DatefieldBlock;
/** Date field */
var Datefield = /** @class */ (function (_super) {
    __extends(Datefield, _super);
    function Datefield() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (value) {
            if (_this.props.datetime) {
                _this.props.onChange(value ? value.toISOString() : null);
            }
            else {
                _this.props.onChange(value ? value.format("YYYY-MM-DD") : null);
            }
        };
        return _this;
    }
    Datefield.prototype.render = function () {
        return (React.createElement(react_datepicker_1.default, { isClearable: true, placeholderText: this.props.placeholder, disabled: this.props.disabled, selected: this.props.value ? moment_1.default(this.props.value, moment_1.default.ISO_8601) : null, onChange: this.handleChange, showTimeSelect: this.props.datetime, timeFormat: "HH:mm", dateFormat: this.props.format, className: "form-control", popperContainer: createPopperContainer, showMonthDropdown: true, showYearDropdown: true }));
    };
    return Datefield;
}(React.Component));
// https://github.com/Hacker0x01/react-datepicker/issues/1366
function createPopperContainer(props) {
    return react_dom_1.default.createPortal(React.createElement("div", { style: { zIndex: 10000 } }, props.children), document.body);
}
