import * as React from "react";
import { v4 as uuid } from 'uuid';
import { LabeledProperty, PropertyEditor, TableSelect } from "../widgets/propertyEditors";
import { localize } from "../widgets/localization";
import { produce } from "immer";
import { ExprComponent, IdLiteralComponent } from "mwater-expressions-ui";
import ListEditor from "../widgets/ListEditor";
import { TextInput, Select } from "react-library/lib/bootstrap";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
/** Edits the overall properties of a widget */
export class WidgetEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleContextVarsChange = (contextVars) => {
            this.props.onWidgetDefChange(Object.assign({}, this.props.widgetDef, { contextVars }));
        };
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Name" },
                React.createElement(PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "name" }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange }))),
            React.createElement(LabeledProperty, { label: "Variables" },
                React.createElement(PropertyEditor, { obj: this.props.widgetDef, onChange: this.props.onWidgetDefChange, property: "contextVars" }, (value, onChange) => React.createElement(ContextVarsEditor, { contextVars: value, onChange: onChange, schema: this.props.schema }))),
            React.createElement(LabeledProperty, { label: "Preview Variable Values" }, this.props.widgetDef.contextVars.map((contextVar) => {
                return React.createElement(ContextVarPreviewValue, { key: contextVar.id, contextVar: contextVar, widgetDef: this.props.widgetDef, schema: this.props.schema, dataSource: this.props.dataSource, onWidgetDefChange: this.props.onWidgetDefChange });
            })),
            React.createElement("div", { style: { color: "#EEE", fontSize: 9 } }, this.props.widgetDef.id)));
    }
}
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
            React.createElement(ListEditor, { items: this.props.contextVars, onItemsChange: this.props.onChange }, (contextVar, onContextVarChange) => React.createElement(ContextVarEditor, { contextVar: contextVar, onChange: onContextVarChange, schema: this.props.schema })),
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
            desc += this.props.schema.getTable(this.props.contextVar.table) ? localize(this.props.schema.getTable(this.props.contextVar.table).name, "en") : this.props.contextVar.table;
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
            contextVar: { id: uuid(), name: "Untitled", type: "row" }
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
        return (React.createElement(ActionCancelModalComponent, { actionLabel: "Add", onAction: this.handleAdd, onCancel: this.handleCancel },
            React.createElement(LabeledProperty, { label: "Name" },
                React.createElement(PropertyEditor, { obj: this.state.contextVar, property: "name", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange }))),
            React.createElement(LabeledProperty, { label: "Type" },
                React.createElement(PropertyEditor, { obj: this.state.contextVar, property: "type", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: typeOptions }))),
            this.state.contextVar.type === "row" || this.state.contextVar.type === "rowset" ?
                React.createElement("div", { style: { paddingBottom: 200 } },
                    React.createElement(LabeledProperty, { label: "Table" },
                        React.createElement(PropertyEditor, { obj: this.state.contextVar, property: "table", onChange: this.handleContextVarChange }, (value, onChange) => React.createElement(TableSelect, { schema: this.props.schema, value: value || null, onChange: onChange, locale: this.props.locale }))))
                : null));
    }
}
/** Allows editing of the preview value for one context variable */
class ContextVarPreviewValue extends React.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (value) => {
            this.props.onWidgetDefChange(produce(this.props.widgetDef, (draft) => {
                draft.contextVarPreviewValues[this.props.contextVar.id] = value;
            }));
        };
    }
    renderValue(value) {
        if (this.props.contextVar.type === "row") {
            return React.createElement(IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.handleChange });
        }
        if (this.props.contextVar.type === "rowset") {
            return React.createElement(ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.handleChange });
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