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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetEditor = void 0;
var React = __importStar(require("react"));
var uuid_1 = require("uuid");
var propertyEditors_1 = require("../widgets/propertyEditors");
var widgets_1 = require("../widgets/widgets");
var localization_1 = require("../widgets/localization");
var bootstrap_1 = require("react-library/lib/bootstrap");
var ListEditorComponent_1 = require("react-library/lib/ListEditorComponent");
var contextVarValues_1 = require("../contextVarValues");
/** Edits the overall properties of a widget */
var WidgetEditor = /** @class */ (function (_super) {
    __extends(WidgetEditor, _super);
    function WidgetEditor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleContextVarsChange = function (contextVars) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { contextVars: contextVars }));
        };
        _this.handleContextVarPreviewValues = function (contextVarPreviewValues) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { contextVarPreviewValues: contextVarPreviewValues }));
        };
        _this.handlePrivateContextVarValuesChange = function (privateContextVarValues) {
            _this.props.onWidgetDefChange(__assign(__assign({}, _this.props.widgetDef), { privateContextVarValues: privateContextVarValues }));
        };
        return _this;
    }
    WidgetEditor.prototype.render = function () {
        var _this = this;
        // Get list of all non-private context variables, including global
        var allContextVars = (this.props.designCtx.globalContextVars || [])
            .concat(this.props.widgetDef.contextVars);
        var validationError = widgets_1.validateWidget(this.props.widgetDef, this.props.designCtx, false);
        return (React.createElement("div", null,
            validationError ?
                React.createElement("div", { className: "text-danger" },
                    React.createElement("i", { className: "fa fa-exclamation-circle" }),
                    " ",
                    validationError)
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Description" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "description" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Group", hint: "Optional grouping of this widget. Blank for none" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "group" }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value || "", onChange: function (val) { return onChange(val || undefined); } }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables", hint: "Define data sources (rowsets or rows)" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "privateContextVars" }, function (value, onChange) { return React.createElement(ContextVarsEditor, { contextVars: value || [], onChange: onChange, contextVarValues: _this.props.widgetDef.privateContextVarValues || {}, onContextVarValuesChange: _this.handlePrivateContextVarValuesChange, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "External Variables", hint: "These are passed in to the widget from its parent. Values for preview only" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, function (value, onChange) { return React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, contextVarValues: _this.props.widgetDef.contextVarPreviewValues, onContextVarValuesChange: _this.handleContextVarPreviewValues, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Global Variables", hint: "Values for preview only" }, (this.props.designCtx.globalContextVars || []).map(function (contextVar) {
                return React.createElement("div", { key: contextVar.id, style: { paddingBottom: 10 } },
                    React.createElement("div", null,
                        contextVar.name,
                        ":"),
                    React.createElement(contextVarValues_1.ContextVarValueEditor, { contextVar: contextVar, contextVarValue: _this.props.widgetDef.contextVarPreviewValues[contextVar.id], onContextVarValueChange: function (value) {
                            var _a;
                            _this.handleContextVarPreviewValues(__assign(__assign({}, _this.props.widgetDef.contextVarPreviewValues), (_a = {}, _a[contextVar.id] = value, _a)));
                        }, schema: _this.props.designCtx.schema, dataSource: _this.props.designCtx.dataSource, availContextVars: allContextVars }));
            })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "virtualizeDatabaseInPreview" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value != null ? value : true, onChange: onChange }, "Prevent changes to database in Preview"); }),
            React.createElement("div", { style: { color: "#D8D8D8", fontSize: 9 } }, this.props.widgetDef.id)));
    };
    return WidgetEditor;
}(React.Component));
exports.WidgetEditor = WidgetEditor;
/** Edits a set of context variables and their values */
var ContextVarsEditor = function (props) {
    var renderItem = function (contextVar) {
        var desc = contextVar.type;
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
            React.createElement(contextVarValues_1.ContextVarValueEditor, { contextVar: contextVar, contextVarValue: props.contextVarValues[contextVar.id], onContextVarValueChange: function (value) {
                    var _a;
                    return props.onContextVarValuesChange(__assign(__assign({}, props.contextVarValues), (_a = {}, _a[contextVar.id] = value, _a)));
                }, schema: props.schema, dataSource: props.dataSource, availContextVars: props.availContextVars }));
    };
    var renderEditor = function (item, onItemChange) {
        return React.createElement(ContextVarEditor, { contextVar: item, onContextVarChange: onItemChange, schema: props.schema, locale: "en" });
    };
    var validateItem = function (contextVar) {
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
    return React.createElement(ListEditorComponent_1.ListEditorComponent, { items: props.contextVars, onItemsChange: props.onChange, renderItem: renderItem, addLabel: "Add Variable", createNew: function () { return ({ id: uuid_1.v4(), name: "Untitled", type: "rowset" }); }, renderEditor: renderEditor, validateItem: validateItem, deleteConfirmPrompt: "Delete variable?", editLink: true });
};
function ContextVarEditor(props) {
    var mainTypeOptions = [
        { value: "row", label: "Single Row" },
        { value: "rowset", label: "Multiple Rows" },
        { value: "advanced", label: "Advanced..." }
    ];
    var advancedTypeOptions = [
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
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "name", onChange: props.onContextVarChange }, function (value, onChange) { return React.createElement(bootstrap_1.TextInput, { value: value || "", onChange: function (name) { return onChange(name || undefined); } }); })),
        React.createElement(propertyEditors_1.LabeledProperty, { label: "Type" },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "type", onChange: props.onContextVarChange }, function (value, onChange) { return (React.createElement("div", null,
                React.createElement(bootstrap_1.Toggle, { value: value == "row" || value == "rowset" ? value : "advanced", onChange: function (v) { return onChange(v == "advanced" ? "text" : v); }, options: mainTypeOptions, size: "sm" }),
                value && value != "row" && value != "rowset" ?
                    React.createElement("div", { style: { padding: 5 } },
                        React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: advancedTypeOptions }))
                    : null)); })),
        props.contextVar.type == "enum" || props.contextVar.type == "enumset" ?
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Enum Options" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "enumValues", onChange: props.onContextVarChange }, function (value, onChange) { return (React.createElement(EnumValuesEditor, { enumValues: value, onChange: onChange })); }))
            : null,
        props.contextVar.type == "id" || props.contextVar.type == "id[]" ?
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Referenced Table" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "idTable", onChange: props.onContextVarChange }, function (value, onChange) { return React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, value: value || null, onChange: function (t) { return onChange(t || undefined); }, locale: props.locale }); }))
            : null,
        React.createElement(propertyEditors_1.LabeledProperty, { label: "Table", hint: props.contextVar.type != "row" && props.contextVar.type != "rowset" ? "Optional" : undefined },
            React.createElement(propertyEditors_1.PropertyEditor, { obj: props.contextVar, property: "table", onChange: props.onContextVarChange }, function (value, onChange) { return React.createElement(propertyEditors_1.TableSelect, { schema: props.schema, value: value || null, onChange: function (t) { return onChange(t || undefined); }, locale: props.locale }); })));
}
/** Edits  */
function EnumValuesEditor(props) {
    function renderItem(enumValue, index, onEnumValueChange) {
        return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 2fr" } },
            React.createElement(bootstrap_1.TextInput, { value: enumValue.id, onChange: function (id) { onEnumValueChange(__assign(__assign({}, enumValue), { id: id || "" })); } }),
            React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: enumValue.name, onChange: function (name) { onEnumValueChange(__assign(__assign({}, enumValue), { name: name })); }, locale: "en" }));
    }
    return React.createElement(ListEditorComponent_1.ListEditorComponent, { items: props.enumValues || [], onItemsChange: props.onChange, renderItem: renderItem, addLabel: "Add Enum Option", createNew: function () { return ({ id: "", name: { _base: "en", en: "" } }); } });
}
/** Individual item of a context variable list */
// class ContextVarListItem extends React.Component<{ contextVar: ContextVar, onChange: (contextVar: ContextVar) => void, schema: Schema}> { 
//   handleNameChange = () => {
//     const name = window.prompt("Enter name", this.props.contextVar.name)
//     if (name) {
//       this.props.onChange({ ...this.props.contextVar, name })
//     }
//   }
//   render() {
//     let desc = this.props.contextVar.type
//     if (this.props.contextVar.table) {
//       desc += " of "
//       desc += this.props.schema.getTable(this.props.contextVar.table) ? localize(this.props.schema.getTable(this.props.contextVar.table)!.name, "en") : this.props.contextVar.table
//     }
//     return (
//       <div>
//         <a onClick={this.handleNameChange}>{this.props.contextVar.name}</a>
//         &nbsp; <span className="text-muted">- {desc}</span>
//       </div>
//     )
//   }
// }
// interface AddContextVarModalProps {
//   schema: Schema
//   locale: string
//   onAdd: (contextVar: ContextVar) => void
// }
// interface AddContextVarModalState {
//   visible: boolean
//   contextVar?: ContextVar
// }
// class AddContextVarModal extends React.Component<AddContextVarModalProps, AddContextVarModalState> {
//   constructor(props: AddContextVarModalProps) {
//     super(props)
//     this.state = { visible: false }
//   }
//   show() {
//     this.setState({
//       visible: true,
//       contextVar: { id: uuid(), name: "Untitled", type: "rowset" }
//     })
//   }
//   handleAdd = () => {
//     if (this.state.contextVar!.type === "row" || this.state.contextVar!.type === "rowset") {
//       if (!this.state.contextVar!.table) {
//         alert("Table required")
//         return
//       }
//     }
//     this.setState({ visible: false })
//     this.props.onAdd(this.state.contextVar!)
//   }
//   handleCancel = () => {
//     this.setState({ visible: false })
//   }
//   handleContextVarChange = (contextVar: ContextVar) => {
//     // Clear table
//     if (contextVar.type !== "row" && contextVar.type !== "rowset") {
//       contextVar = { id: contextVar.id, type: contextVar.type, name: contextVar.name }
//     }
//     this.setState({ contextVar: contextVar })
//   }
//   render() {
//     if (!this.state.visible) {
//       return null
//     }
//     const typeOptions = [
//       { value: "rowset", label: "Set of rows of a table" },
//       { value: "row", label: "Row of a table" },
//       { value: "text", label: "Text" },
//       { value: "number", label: "Number" },
//       { value: "boolean", label: "Boolean" },
//       { value: "date", label: "Date" },
//       { value: "datetime", label: "Datetime" }
//     ]
//     return (
//       <ActionCancelModalComponent actionLabel="Add" onAction={this.handleAdd} onCancel={this.handleCancel}>
//         <LabeledProperty label="Name">
//           <PropertyEditor obj={this.state.contextVar!} property="name" onChange={this.handleContextVarChange}>
//             {(value, onChange) => <TextInput value={value} onChange={onChange}/>}
//           </PropertyEditor>
//         </LabeledProperty>
//         <LabeledProperty label="Type">
//           <PropertyEditor obj={this.state.contextVar!} property="type" onChange={this.handleContextVarChange}>
//             {(value, onChange) => <Select value={value} onChange={onChange} options={typeOptions} />}
//           </PropertyEditor>
//         </LabeledProperty>
//         { this.state.contextVar!.type === "row" || this.state.contextVar!.type === "rowset" ?
//           <div style={{ paddingBottom: 200 }}>
//             <LabeledProperty label="Table">
//               <PropertyEditor obj={this.state.contextVar!} property="table" onChange={this.handleContextVarChange}>
//                 {(value, onChange) => <TableSelect schema={this.props.schema} value={value || null} onChange={onChange} locale={this.props.locale} />}
//               </PropertyEditor>
//             </LabeledProperty>
//           </div>
//         : null }
//       </ActionCancelModalComponent>
//     )
//   }
// }
