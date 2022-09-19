"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodedExprEditor = exports.CodedExprsEditor = void 0;
const react_1 = __importDefault(require("react"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const __1 = require("../../..");
/** Edits coded expressions. */
function CodedExprsEditor(props) {
    const { value, onChange, schema, dataSource, contextVars } = props;
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(ListEditorComponent_1.ListEditorComponent, { items: value || [], onItemsChange: onChange, renderItem: (item, index, onItemChange) => (react_1.default.createElement(exports.CodedExprEditor, { value: item, onChange: onItemChange, schema: schema, dataSource: dataSource, contextVars: contextVars })), createNew: () => ({ contextVarId: null, expr: null, name: "" }) })));
}
exports.CodedExprsEditor = CodedExprsEditor;
/** Allows editing of an coded expression */
const CodedExprEditor = (props) => {
    const { schema, dataSource, contextVars } = props;
    const handleChange = (contextVarId, expr) => {
        props.onChange(Object.assign(Object.assign({}, props.value), { contextVarId: contextVarId, expr: expr }));
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(__1.LabeledProperty, { label: "Expression", key: "expr" },
            react_1.default.createElement(__1.ContextVarAndExprPropertyEditor, { contextVarId: props.value.contextVarId, expr: props.value.expr, onChange: handleChange, schema: schema, dataSource: dataSource, contextVars: contextVars, aggrStatuses: ["individual", "aggregate", "literal"] })),
        react_1.default.createElement(__1.LabeledProperty, { label: "As Prop Name", key: "name" },
            react_1.default.createElement(__1.PropertyEditor, { obj: props.value, onChange: props.onChange, property: "name" }, (value, onChange) => react_1.default.createElement(bootstrap_1.TextInput, { value: value, onChange: (v) => onChange(v || "") })))));
};
exports.CodedExprEditor = CodedExprEditor;
