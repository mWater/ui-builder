"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodedActionEditor = exports.CodedActionsEditor = void 0;
const react_1 = __importDefault(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const __1 = require("../../..");
/** Edits coded actions. */
const CodedActionsEditor = (props) => {
    const { value, onChange, designCtx } = props;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: (item, index, onItemChange) => (react_1.default.createElement(exports.CodedActionEditor, { value: item, onChange: onItemChange, designCtx: designCtx })), createNew: () => ({ actionDef: null, name: "" }) })));
};
exports.CodedActionsEditor = CodedActionsEditor;
/** Allows editing of an coded action */
const CodedActionEditor = (props) => {
    const { designCtx } = props;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(__1.LabeledProperty, { label: "Action", key: "action" },
            react_1.default.createElement(__1.ActionDefEditor, { designCtx: designCtx, value: props.value.actionDef, onChange: actionDef => props.onChange(Object.assign(Object.assign({}, props.value), { actionDef })) })),
        react_1.default.createElement(__1.LabeledProperty, { label: "As Prop Name", key: "name" },
            react_1.default.createElement(__1.PropertyEditor, { obj: props.value, onChange: props.onChange, property: "name" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value, onChange: (v) => onChange(v || "") })))));
};
exports.CodedActionEditor = CodedActionEditor;
