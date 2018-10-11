import * as React from "react";
import { v4 as uuid } from 'uuid';
import { LabeledProperty, PropertyEditor } from "../widgets/propertyEditors";
import { localize } from "../widgets/localization";
import { produce } from "immer";
import { ExprComponent, IdLiteralComponent } from "mwater-expressions-ui";
import ListEditor from "../widgets/ListEditor";
import ReactSelect from "react-select";
import * as _ from "lodash";
import { TextInput } from "react-library/lib/bootstrap";
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
            }))));
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
        return (React.createElement("div", null,
            React.createElement("a", { onClick: this.handleNameChange }, this.props.contextVar.name),
            "\u00A0(",
            this.props.contextVar.type,
            this.props.contextVar.table ? ` of ${this.props.contextVar.table}` : "",
            ")"));
    }
}
class ContextVarsEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleAddContextVar = (cv) => {
            this.props.onChange(this.props.contextVars.concat(cv.value));
        };
    }
    render() {
        let contextVarOptions = [];
        for (const table of this.props.schema.getTables().filter(t => !t.deprecated)) {
            contextVarOptions.push({
                value: {
                    id: uuid(),
                    name: localize(table.name) + " Row",
                    type: "row",
                    table: table.id
                },
                label: localize(table.name) + " Row"
            });
            contextVarOptions.push({
                value: {
                    id: uuid(),
                    name: localize(table.name) + " Rowset",
                    type: "rowset",
                    table: table.id
                },
                label: localize(table.name) + " Rowset"
            });
        }
        contextVarOptions = _.sortBy(contextVarOptions, "label");
        contextVarOptions = [
            { value: { id: uuid(), name: "Unnamed", type: "text" }, label: "Text" },
            { value: { id: uuid(), name: "Unnamed", type: "number" }, label: "Number" },
            { value: { id: uuid(), name: "Unnamed", type: "boolean" }, label: "Boolean" },
            { value: { id: uuid(), name: "Unnamed", type: "date" }, label: "Date" },
            { value: { id: uuid(), name: "Unnamed", type: "datetime" }, label: "Datetime" }
        ].concat(contextVarOptions);
        return (React.createElement("div", null,
            React.createElement(ListEditor, { items: this.props.contextVars, onItemsChange: this.props.onChange }, (contextVar, onContextVarChange) => React.createElement(ContextVarEditor, { contextVar: contextVar, onChange: onContextVarChange })),
            React.createElement(ReactSelect, { value: null, options: contextVarOptions, placeholder: "+ Add Variable", onChange: this.handleAddContextVar })));
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