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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetEditor = void 0;
const React = __importStar(require("react"));
const uuid_1 = require("uuid");
const propertyEditors_1 = require("../widgets/propertyEditors");
const widgets_1 = require("../widgets/widgets");
const localization_1 = require("../widgets/localization");
const bootstrap_1 = require("react-library/lib/bootstrap");
const ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
const contextVarValues_1 = require("../contextVarValues");
/** Edits the overall properties of a widget */
class WidgetEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarsChange = (contextVars) => {
            this.props.onWidgetDefChange(Object.assign(Object.assign({}, this.props.widgetDef), { contextVars }));
        };
        this.handleContextVarPreviewValues = (contextVarPreviewValues) => {
            this.props.onWidgetDefChange(Object.assign(Object.assign({}, this.props.widgetDef), { contextVarPreviewValues }));
        };
        this.handlePrivateContextVarValuesChange = (privateContextVarValues) => {
            this.props.onWidgetDefChange(Object.assign(Object.assign({}, this.props.widgetDef), { privateContextVarValues }));
        };
    }
    render() {
        // Get list of all non-private context variables, including global
        const allContextVars = (this.props.designCtx.globalContextVars || [])
            .concat(this.props.widgetDef.contextVars);
        const validationError = widgets_1.validateWidget(this.props.widgetDef, this.props.designCtx, false);
        return (React.createElement("div", null,
            validationError ?
                React.createElement("div", { className: "text-danger" },
                    React.createElement("i", { className: "fa fa-exclamation-circle" }),
                    " ",
                    validationError)
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Description" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "description" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Group", hint: "Optional grouping of this widget. Blank for none" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "group" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || "", onChange: val => onChange(val || undefined) }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables", hint: "Define data sources (rowsets or rows)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "privateContextVars" }, (value, onChange) => React.createElement(ContextVarsEditor, { contextVars: value || [], onChange: onChange, contextVarValues: this.props.widgetDef.privateContextVarValues || {}, onContextVarValuesChange: this.handlePrivateContextVarValuesChange, schema: this.props.designCtx.schema, dataSource: this.props.designCtx.dataSource, availContextVars: allContextVars }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "External Variables", hint: "These are passed in to the widget from its parent. Values for preview only" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, (value, onChange) => React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, contextVarValues: this.props.widgetDef.contextVarPreviewValues, onContextVarValuesChange: this.handleContextVarPreviewValues, schema: this.props.designCtx.schema, dataSource: this.props.designCtx.dataSource, availContextVars: allContextVars }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Global Variables", hint: "Values for preview only" }, (this.props.designCtx.globalContextVars || []).map((contextVar) => {
                return React.createElement("div", { key: contextVar.id, style: { paddingBottom: 10 } },
                    React.createElement("div", null,
                        contextVar.name,
                        ":"),
                    React.createElement(contextVarValues_1.ContextVarValueEditor, { contextVar: contextVar, contextVarValue: this.props.widgetDef.contextVarPreviewValues[contextVar.id], onContextVarValueChange: value => {
                            this.handleContextVarPreviewValues(Object.assign(Object.assign({}, this.props.widgetDef.contextVarPreviewValues), { [contextVar.id]: value }));
                        }, schema: this.props.designCtx.schema, dataSource: this.props.designCtx.dataSource, availContextVars: allContextVars }));
            })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "virtualizeDatabaseInPreview" }, (value, onChange) => React.createElement(bootstrap_1.Checkbox, { value: value != null ? value : true, onChange: onChange }, "Prevent changes to database in Preview")),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Widget ID", hint: "Advanced" },
                React.createElement("input", { type: "text", value: this.props.widgetDef.id, className: "form-control input-sm", onFocus: ev => { ev.target.select(); } }))));
    }
}
exports.WidgetEditor = WidgetEditor;
/** Edits a set of context variables and their values */
const ContextVarsEditor = (props) => {
    const renderItem = (contextVar) => {
        let desc = contextVar.type;
        if (contextVar.table) {
            desc += " of ";
            desc += props.schema.getTable(contextVar.table) ? localization_1.localize(props.schema.getTable(contextVar.table).name, "en") : contextVar.table;
        }
        return React.createElement("div", null,
            React.createElement("div", null,
                contextVar.name,
                " ",
                React.createElement("span", { className: "text-muted" },
                    "- ",
                    desc)),
            React.createElement(contextVarValues_1.ContextVarValueEditor, { contextVar: contextVar, contextVarValue: props.contextVarValues[contextVar.id], onContextVarValueChange: value => props.onContextVarValuesChange(Object.assign(Object.assign({}, props.contextVarValues), { [contextVar.id]: value })), schema: props.schema, dataSource: props.dataSource, availContextVars: props.availContextVars }));
    };
    const renderEditor = (item, onItemChange) => {
        return React.createElement(ContextVarEditor, { contextVar: item, onContextVarChange: onItemChange, schema: props.schema, locale: "en" });
    };
    const validateItem = (contextVar) => {
        if (!contextVar.type) {
            alert("Type required");
            return false;
        }
        if (contextVar.type === "row" || contextVar.type === "rowset") {
            if (!contextVar.table) {
                alert("Table required");
                return false;
            }
        }
        return true;
    };
    return React.createElement(ListEditorComponent_1.ListEditorComponent, { items: props.contextVars, onItemsChange: props.onChange, renderItem: renderItem, addLabel: "Add Variable", createNew: () => ({ id: uuid_1.v4(), name: "Untitled", type: "rowset" }), renderEditor: renderEditor, validateItem: validateItem, deleteConfirmPrompt: "Delete variable?", editLink: true });
};
function ContextVarEditor(props) {
    const mainTypeOptions = [
        { value: "row", label: "Single Row" },
        { value: "rowset", label: "Multiple Rows" },
        { value: "advanced", label: "Advanced..." }
    ];
    const advancedTypeOptions = [
        { value: "text", label: "Text" },
        { value: "number", label: "Number" },
        { value: "boolean", label: "Boolean" },
        { value: "enum", label: "Enum" },
        { value: "enumset", label: "Enum set" },
        { value: "id", label: "Reference" },
        { value: "id[]", label: "Reference List" },
        { value: "date", label: "Date" },
        { value: "datetime", label: "Datetime" }
    ];
    return React.createElement("div", { style: { paddingBottom: 200 } },
        React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "name", onChange: props.onContextVarChange }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value || "", onChange: name => onChange(name || undefined) }))),
        React.createElement(propertyEditors_1.LabeledProperty, { label: "Type" },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "type", onChange: props.onContextVarChange }, (value, onChange) => (React.createElement("div", null,
                React.createElement(bootstrap_1.Toggle, { value: value == "row" || value == "rowset" ? value : "advanced", onChange: v => onChange(v == "advanced" ? "text" : v), options: mainTypeOptions, size: "sm" }),
                value && value != "row" && value != "rowset" ?
                    React.createElement("div", { style: { padding: 5 } },
                        React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: advancedTypeOptions }))
                    : null)))),
        props.contextVar.type == "enum" || props.contextVar.type == "enumset" ?
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Enum Options" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "enumValues", onChange: props.onContextVarChange }, (value, onChange) => (React.createElement(EnumValuesEditor, { enumValues: value, onChange: onChange }))))
            : null,
        props.contextVar.type == "id" || props.contextVar.type == "id[]" ?
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Referenced Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "idTable", onChange: props.onContextVarChange }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, value: value || null, onChange: t => onChange(t || undefined), locale: props.locale })))
            : null,
        React.createElement(propertyEditors_1.LabeledProperty, { label: "Table", hint: props.contextVar.type != "row" && props.contextVar.type != "rowset" ? "Optional" : undefined },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "table", onChange: props.onContextVarChange }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, value: value || null, onChange: t => onChange(t || undefined), locale: props.locale }))));
}
/** Edits  */
function EnumValuesEditor(props) {
    function renderItem(enumValue, index, onEnumValueChange) {
        return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr" } },
            React.createElement(bootstrap_1.TextInput, { value: enumValue.id, onChange: id => { onEnumValueChange(Object.assign(Object.assign({}, enumValue), { id: id || "" })); } }),
            React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: enumValue.name, onChange: name => { onEnumValueChange(Object.assign(Object.assign({}, enumValue), { name: name })); }, locale: "en" }));
    }
    return React.createElement(ListEditorComponent_1.ListEditorComponent, { items: props.enumValues || [], onItemsChange: props.onChange, renderItem: renderItem, addLabel: "Add Enum Option", createNew: () => ({ id: "", name: { _base: "en", en: "" } }) });
}
