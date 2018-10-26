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
            dataSource: props.dataSource,
            disabled: false
        };
        return (React.createElement("div", null,
            this.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null,
            this.renderControl(renderControlProps)));
    }
    renderInstance(props) {
        return React.createElement(ControlInstance, { renderInstanceProps: props, block: this });
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
    constructor(props) {
        super(props);
        /** Validate the instance. Returns null if correct, message if not */
        this.validate = () => {
            // Check for null
            if (this.getValue() == null && this.props.block.blockDef.required) {
                return localize(this.props.block.blockDef.requiredMessage, this.props.renderInstanceProps.locale);
            }
            return null;
        };
        this.handleChange = async (newValue) => {
            const renderInstanceProps = this.props.renderInstanceProps;
            const blockDef = this.props.block.blockDef;
            const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
            const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
            // Update database
            this.setState({ updating: true });
            try {
                const txn = this.props.renderInstanceProps.database.transaction();
                await txn.updateRow(contextVar.table, id, { [blockDef.column]: newValue });
                await txn.commit();
                // TODO error handling
            }
            finally {
                this.setState({ updating: false });
            }
        };
        this.state = {
            updating: false
        };
    }
    getValue() {
        const renderInstanceProps = this.props.renderInstanceProps;
        const blockDef = this.props.block.blockDef;
        const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        // Get current value
        return renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "field", table: contextVar.table, column: blockDef.column });
    }
    renderRequired() {
        return this.props.block.blockDef.required ? React.createElement("div", { className: "required-control" }, "*") : null;
    }
    render() {
        const renderInstanceProps = this.props.renderInstanceProps;
        const blockDef = this.props.block.blockDef;
        const contextVar = renderInstanceProps.contextVars.find(cv => cv.id === blockDef.rowContextVarId);
        const id = renderInstanceProps.getContextVarExprValue(blockDef.rowContextVarId, { type: "id", table: contextVar.table });
        const renderControlProps = {
            value: this.getValue(),
            onChange: this.handleChange,
            schema: this.props.renderInstanceProps.schema,
            dataSource: this.props.renderInstanceProps.dataSource,
            locale: this.props.renderInstanceProps.locale,
            rowContextVar: contextVar,
            disabled: id == null
        };
        return (React.createElement("div", { style: { opacity: this.state.updating ? 0.6 : undefined } },
            this.renderRequired(),
            this.props.block.renderControl(renderControlProps)));
    }
}
//# sourceMappingURL=ControlBlock.js.map