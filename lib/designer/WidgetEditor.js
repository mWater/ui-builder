"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const uuid_1 = require("uuid");
const propertyEditors_1 = require("../widgets/propertyEditors");
const localization_1 = require("../widgets/localization");
const immer_1 = require("immer");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const ListEditor_1 = __importDefault(require("../widgets/ListEditor"));
const bootstrap_1 = require("react-library/lib/bootstrap");
const ActionCancelModalComponent_1 = __importDefault(require("react-library/lib/ActionCancelModalComponent"));
/** Edits the overall properties of a widget */
class WidgetEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarsChange = (contextVars) => {
            this.props.onWidgetDefChange(Object.assign({}, this.props.widgetDef, { contextVars }));
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Variables" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, (value, onChange) => React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, schema: this.props.schema }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Preview Variable Values" }, this.props.widgetDef.contextVars.map((contextVar) => {
                return React.createElement(ContextVarPreviewValue, { key: contextVar.id, contextVar: contextVar, widgetDef: this.props.widgetDef, schema: this.props.schema, dataSource: this.props.dataSource, onWidgetDefChange: this.props.onWidgetDefChange });
            })),
            React.createElement("div", { style: { color: "#EEE", fontSize: 9 } }, this.props.widgetDef.id)));
    }
}
exports.WidgetEditor = WidgetEditor;
class ContextVarsEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleAddContextVar = (contextVar) => {
            this.props.onChange(this.props.contextVars.concat(contextVar));
        };
        this.handleOpenAdd = () => {
            this.modalElem.show();
        };
        this.handleModalRef = (elem) => {
            this.modalElem = elem;
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(ListEditor_1.default, { items: this.props.contextVars, onItemsChange: this.props.onChange }, (contextVar, onContextVarChange) => React.createElement(ContextVarEditor, { contextVar: contextVar, onChange: onContextVarChange, schema: this.props.schema })),
            React.createElement(AddContextVarModal, { schema: this.props.schema, locale: "en", ref: this.handleModalRef, onAdd: this.handleAddContextVar }),
            React.createElement("button", { type: "button", className: "btn btn-link", onClick: this.handleOpenAdd },
                React.createElement("i", { className: "fa fa-plus" }),
                " Add Variable")));
    }
}
class ContextVarEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleNameChange = () => {
            const name = window.prompt("Enter name", this.props.contextVar.name);
            if (name) {
                this.props.onChange(Object.assign({}, this.props.contextVar, { name }));
            }
        };
    }
    render() {
        let desc = this.props.contextVar.type;
        if (this.props.contextVar.table) {
            desc += " of ";
            desc += this.props.schema.getTable(this.props.contextVar.table) ? localization_1.localize(this.props.schema.getTable(this.props.contextVar.table).name, "en") : this.props.contextVar.table;
        }
        return (React.createElement("div", null,
            React.createElement("a", { onClick: this.handleNameChange }, this.props.contextVar.name),
            "\u00A0(",
            desc,
            ")"));
    }
}
class AddContextVarModal extends React.Component {
    constructor(props) {
        super(props);
        this.handleAdd = () => {
            if (this.state.contextVar.type === "row" || this.state.contextVar.type === "rowset") {
                if (!this.state.contextVar.table) {
                    alert("Table required");
                    return;
                }
            }
            this.setState({ visible: false });
            this.props.onAdd(this.state.contextVar);
        };
        this.handleCancel = () => {
            this.setState({ visible: false });
        };
        this.handleContextVarChange = (contextVar) => {
            // Clear table
            if (contextVar.type !== "row" && contextVar.type !== "rowset") {
                contextVar = { id: contextVar.id, type: contextVar.type, name: contextVar.name };
            }
            this.setState({ contextVar: contextVar });
        };
        this.state = { visible: false };
    }
    show() {
        this.setState({
            visible: true,
            contextVar: { id: uuid_1.v4(), name: "Untitled", type: "row" }
        });
    }
    render() {
        if (!this.state.visible) {
            return null;
        }
        const typeOptions = [
            { value: "row", label: "Row of a table" },
            { value: "rowset", label: "Set of rows of a table" },
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "boolean", label: "Boolean" },
            { value: "date", label: "Date" },
            { value: "datetime", label: "Datetime" }
        ];
        return (React.createElement(ActionCancelModalComponent_1.default, { actionLabel: "Add", onAction: this.handleAdd, onCancel: this.handleCancel },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Name" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "name", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(bootstrap_1.TextInput, { value: value, onChange: onChange }))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Type" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "type", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: typeOptions }))),
            this.state.contextVar.type === "row" || this.state.contextVar.type === "rowset" ?
                React.createElement("div", { style: { paddingBottom: 200 } },
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Table" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.state.contextVar, property: "table", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(propertyEditors_1.TableSelect, { schema: this.props.schema, value: value || null, onChange: onChange, locale: this.props.locale }))))
                : null));
    }
}
/** Allows editing of the preview value for one context variable */
class ContextVarPreviewValue extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            this.props.onWidgetDefChange(immer_1.produce(this.props.widgetDef, (draft) => {
                draft.contextVarPreviewValues[this.props.contextVar.id] = value;
            }));
        };
    }
    renderValue(value) {
        if (this.props.contextVar.type === "row") {
            return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.handleChange });
        }
        if (this.props.contextVar.type === "rowset") {
            return React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.handleChange });
        }
        return React.createElement("i", null, "Not supported");
    }
    render() {
        const value = this.props.widgetDef.contextVarPreviewValues[this.props.contextVar.id];
        return (React.createElement("div", null,
            React.createElement("div", null,
                this.props.contextVar.name,
                ":"),
            this.renderValue(value)));
    }
}
//# sourceMappingURL=WidgetEditor.js.map