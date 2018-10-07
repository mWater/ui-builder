import LeafBlock from "../../LeafBlock";
import * as React from "react";
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor } from "../../propertyEditors";
import { Select, Checkbox } from "react-library/lib/bootstrap";
import { localize } from "../../localization";
export class ControlBlock extends LeafBlock {
    renderDesign(props) {
        // Simply render empty control
        return (React.createElement("div", null,
            this.renderRequired(),
            this.renderControl({
                value: null,
                rowContextVar: props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
                onChange: () => { return; },
                locale: props.locale,
                schema: props.schema,
                disabled: false
            })));
    }
    renderRequired() {
        return this.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null;
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
        return (React.createElement("div", null,
            this.renderRequired(),
            this.renderControl({
                value: value,
                rowContextVar: props.contextVars.find(cv => cv.id === this.blockDef.rowContextVarId),
                onChange: handleChange,
                locale: props.locale,
                schema: props.schema,
                disabled: id == null // Disable if no primary key
            })));
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
        return null;
    }
}
//# sourceMappingURL=ControlBlock.js.map