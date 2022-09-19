"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodedLocalizedStringEditor = exports.CodedLocalizedStringsEditor = void 0;
const react_1 = __importDefault(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const __1 = require("../../..");
/** Edits coded localized string. */
const CodedLocalizedStringsEditor = (props) => {
    const { value, onChange, locale } = props;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: (item, index, onItemChange) => (react_1.default.createElement(exports.CodedLocalizedStringEditor, { value: item, onChange: onItemChange, locale: locale })), createNew: () => ({ name: "", value: { _base: "en", en: "" } }) })));
};
exports.CodedLocalizedStringsEditor = CodedLocalizedStringsEditor;
/** Allows editing of an coded expression */
const CodedLocalizedStringEditor = (props) => {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(__1.LabeledProperty, { label: "String", key: "value" },
            react_1.default.createElement(__1.PropertyEditor, { obj: props.value, onChange: props.onChange, property: "value" }, (value, onChange) => react_1.default.createElement(__1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
        react_1.default.createElement(__1.LabeledProperty, { label: "As Prop Name", key: "name" },
            react_1.default.createElement(__1.PropertyEditor, { obj: props.value, onChange: props.onChange, property: "name" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value, onChange: (v) => onChange(v || "") })))));
};
exports.CodedLocalizedStringEditor = CodedLocalizedStringEditor;
