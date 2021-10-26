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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatefieldBlock = void 0;
const React = __importStar(require("react"));
const ControlBlock_1 = require("./ControlBlock");
const localization_1 = require("../../localization");
const propertyEditors_1 = require("../../propertyEditors");
const react_datepicker_1 = __importDefault(require("react-datepicker"));
const moment_1 = __importDefault(require("moment"));
const react_dom_1 = __importDefault(require("react-dom"));
/** Block that is a text input control linked to a specific field */
class DatefieldBlock extends ControlBlock_1.ControlBlock {
    renderControl(props) {
        // Get column
        let column;
        if (props.rowContextVar && this.blockDef.column) {
            column = props.schema.getColumn(props.rowContextVar.table, this.blockDef.column);
        }
        const datetime = column ? column.type === "datetime" : false;
        const format = this.blockDef.format ? this.blockDef.format : datetime ? "lll" : "ll";
        return (React.createElement(Datefield, { value: props.value, onChange: props.onChange, placeholder: (0, localization_1.localize)(this.blockDef.placeholder, props.locale), disabled: props.disabled || !props.onChange, datetime: datetime, format: format }));
    }
    /** Implement this to render any editor parts that are not selecting the basic row cv and column */
    renderControlEditor(props) {
        const contextVar = props.contextVars.find((cv) => cv.id === this.blockDef.rowContextVarId);
        // Get column
        let column;
        if (contextVar && this.blockDef.column) {
            column = props.schema.getColumn(contextVar.table, this.blockDef.column);
        }
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Placeholder" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "placeholder" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            column && column.type === "date" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Date Format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, (value, onChange) => React.createElement(propertyEditors_1.DateFormatEditor, { value: value, onChange: onChange })))) : null,
            column && column.type === "datetime" ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Date/time Format" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "format" }, (value, onChange) => React.createElement(propertyEditors_1.DatetimeFormatEditor, { value: value, onChange: onChange })))) : null));
    }
    /** Filter the columns that this control is for */
    filterColumn(column) {
        return column.type === "date" || column.type === "datetime";
    }
    /** Clear format */
    processColumnChanged(blockDef) {
        return Object.assign(Object.assign({}, blockDef), { format: null });
    }
}
exports.DatefieldBlock = DatefieldBlock;
/** Date field */
class Datefield extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            if (!this.props.onChange) {
                return;
            }
            if (this.props.datetime) {
                this.props.onChange(value ? value.toISOString() : null);
            }
            else {
                this.props.onChange(value ? value.format("YYYY-MM-DD") : null);
            }
        };
    }
    render() {
        return (React.createElement(react_datepicker_1.default, { isClearable: true, placeholderText: this.props.placeholder, disabled: this.props.disabled || !this.props.onChange, selected: this.props.value ? (0, moment_1.default)(this.props.value, moment_1.default.ISO_8601) : null, onChange: this.handleChange, showTimeSelect: this.props.datetime, timeFormat: "HH:mm", dateFormat: this.props.format, className: "form-control", popperContainer: createPopperContainer, showMonthDropdown: true, showYearDropdown: true }));
    }
}
// https://github.com/Hacker0x01/react-datepicker/issues/1366
function createPopperContainer(props) {
    return react_dom_1.default.createPortal(React.createElement("div", { style: { zIndex: 10000 } }, props.children), document.body);
}
