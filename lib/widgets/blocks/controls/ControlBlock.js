import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, LocalizedTextPropertyEditor } from "../../propertyEditors";
import { Select, Checkbox } from "react-library/lib/bootstrap";
import { localize } from "../../localization";
export class ControlBlock extends LeafBlock {
    renderDesign(props) {
        const renderControlProps = {
            value: null,
            rowContextVar: props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
            onChange: () => { return; },
            locale: props.locale,
            schema: props.schema,
            disabled: false
        };
        return React.createElement(ControlInstance, { renderControlProps: renderControlProps, block: this });
    }
    renderInstance(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        const id = props.getContextVarExprValue(this.blockDef.rowContextVarId, { type: "id", table: contextVar.table });
        // Get current value
        const value = props.getContextVarExprValue(this.blockDef.rowContextVarId, { type: "field", table: contextVar.table, column: this.blockDef.column });
        const handleChange = async (newValue) => {
            // Update database
            const txn = props.database.transaction();
            await txn.updateRow(contextVar.table, id, { [this.blockDef.column]: newValue });
            await txn.commit();
        };
        const renderControlProps = {
            value: value,
            onChange: handleChange,
            schema: props.schema,
            locale: props.locale,
            rowContextVar: contextVar,
            disabled: id == null
        };
        return React.createElement(ControlInstance, { renderControlProps: renderControlProps, block: this });
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Context Variable" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowContextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row"] }))),
            contextVar ?
                React.createElement(LabeledProperty, { label: "Column" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "column" }, (value, onChange) => {
                        const columnOptions = props.schema.getColumns(contextVar.table)
                            .filter(c => this.filterColumn(c))
                            .map(c => ({ value: c.id, label: localize(c.name) }));
                        return React.createElement(Select, { value: value, onChange: onChange, nullLabel: "Select column", options: columnOptions });
                    }))
                : null,
            React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "required" }, (value, onChange) => React.createElement(Checkbox, { value: value, onChange: onChange }, "Required")),
            this.blockDef.required ?
                React.createElement(LabeledProperty, { label: "Required Message" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "requiredMessage" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))
                : null,
            this.renderControlEditor(props)));
    }
    getContextVarExprs(contextVar) {
        if (this.blockDef.rowContextVarId && this.blockDef.rowContextVarId === contextVar.id && this.blockDef.column) {
            return [
                { type: "id", table: contextVar.table },
                { type: "field", table: contextVar.table, column: this.blockDef.column },
            ];
        }
        else {
            return [];
        }
    }
    /** Determine if block is valid. null means valid, string is error message. Does not validate children */
    validate(options) {
        // Validate row
        const rowCV = options.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId && cv.type === "row");
        if (!rowCV) {
            return "Row required";
        }
        if (!this.blockDef.column || !options.schema.getColumn(rowCV.table, this.blockDef.column)) {
            return "Column required";
        }
        if (!this.filterColumn(options.schema.getColumn(rowCV.table, this.blockDef.column))) {
            return "Valid column required";
        }
        if (this.blockDef.required && !this.blockDef.requiredMessage) {
            return "Required message required";
        }
        return null;
    }
}
class ControlInstance extends React.Component {
    constructor() {
        super(...arguments);
        /** Validate the instance. Returns null if correct, message if not */
        this.validate = () => {
            // Check for null
            if (this.props.renderControlProps.value == null && this.props.block.blockDef.required) {
                return localize(this.props.block.blockDef.requiredMessage, this.props.renderControlProps.locale);
            }
            return null;
        };
    }
    renderRequired() {
        return this.props.block.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null;
    }
    render() {
        return (React.createElement("div", null,
            this.renderRequired(),
            this.props.block.renderControl(this.props.renderControlProps)));
    }
}
//# sourceMappingURL=ControlBlock.js.map