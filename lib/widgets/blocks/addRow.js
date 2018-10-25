import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { createExprVariables } from '../blocks';
import { ExprValidator } from 'mwater-expressions';
import ContextVarsInjector from '../ContextVarsInjector';
import { TextInput } from 'react-library/lib/bootstrap';
import { PropertyEditor, LabeledProperty, TableSelect } from '../propertyEditors';
import { ColumnValuesEditor } from '../columnValues';
export class AddRowBlock extends CompoundBlock {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    }
    createContextVar() {
        if (this.blockDef.table) {
            return { type: "row", id: this.blockDef.id, name: this.blockDef.name || "Added row", table: this.blockDef.table };
        }
        return null;
    }
    validate(options) {
        let error;
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Check that table is present
        if (!this.blockDef.table || !options.schema.getTable(this.blockDef.table)) {
            return "Table required";
        }
        // Check each column value
        for (const columnId of Object.keys(this.blockDef.columnValues)) {
            error = this.validateColumnValue(options, columnId);
            if (error) {
                return error;
            }
        }
        return null;
    }
    validateColumnValue(options, columnId) {
        // Check that column exists
        const column = options.schema.getColumn(this.blockDef.table, columnId);
        if (!column) {
            return "Column not found";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        // Get type of column
        const columnType = (column.type === "join") ? "id" : column.type;
        // Check context var
        const contextVarExpr = this.blockDef.columnValues[columnId];
        let contextVar;
        if (contextVarExpr.contextVarId) {
            contextVar = options.contextVars.find(cv => cv.id === contextVarExpr.contextVarId);
            if (!contextVar || !contextVar.table) {
                return "Context variable not found";
            }
        }
        else {
            contextVar = undefined;
            // Must be literal
            if (contextVarExpr.expr && contextVarExpr.expr.type !== "literal") {
                return "Literal value required";
            }
        }
        // Validate expr
        let error;
        error = exprValidator.validateExpr(contextVarExpr.expr, { table: contextVar ? contextVar.table : undefined, types: [columnType] });
        if (error) {
            return error;
        }
        return null;
    }
    processChildren(action) {
        return produce(this.blockDef, draft => {
            if (draft.content) {
                draft.content = action(draft.content);
            }
        });
    }
    /** Get context variable expressions needed to add */
    getContextVarExprs(contextVar) {
        // Get ones for the specified context var
        return Object.values(this.blockDef.columnValues).filter(cve => cve.contextVarId === contextVar.id).map(cve => cve.expr);
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        // Create props for child
        const contextVar = this.createContextVar();
        let contentProps = props;
        // Add context variable if knowable
        if (contextVar) {
            contentProps = Object.assign({}, contentProps, { contextVars: props.contextVars.concat([contextVar]) });
        }
        const contentNode = props.renderChildBlock(contentProps, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        const contextVar = this.createContextVar();
        return React.createElement(AddRowInstance, { blockDef: this.blockDef, contextVar: contextVar, createBlock: this.createBlock, database: props.database, renderInstanceProps: props, schema: props.schema });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Add Row"),
            React.createElement(LabeledProperty, { label: "Table" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            React.createElement(LabeledProperty, { label: "Variable Name" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "name" }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange, placeholder: "Unnamed" }))),
            this.blockDef.table ?
                React.createElement(LabeledProperty, { label: "Column Values" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "columnValues" }, (value, onChange) => React.createElement(ColumnValuesEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, contextVars: props.contextVars, locale: props.locale })))
                : null));
    }
}
/** Instance which adds a row and then injects as context variable */
class AddRowInstance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addedRowId: null
        };
    }
    componentDidMount() {
        this.performAdd();
    }
    async performAdd() {
        // Create row to insert
        const row = {};
        for (const columnId of Object.keys(this.props.blockDef.columnValues)) {
            const contextVarExpr = this.props.blockDef.columnValues[columnId];
            if (contextVarExpr.contextVarId != null) {
                row[columnId] = this.props.renderInstanceProps.getContextVarExprValue(contextVarExpr.contextVarId, contextVarExpr.expr);
            }
            else {
                row[columnId] = contextVarExpr.expr ? contextVarExpr.expr.value : null;
            }
        }
        const txn = this.props.database.transaction();
        const addedRowId = await txn.addRow(this.props.blockDef.table, row);
        await txn.commit();
        this.setState({ addedRowId });
    }
    render() {
        // Render wait while adding
        if (!this.state.addedRowId) {
            return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
        }
        // Inject context variable
        return React.createElement(ContextVarsInjector, { injectedContextVars: [this.props.contextVar], injectedContextVarValues: { [this.props.contextVar.id]: this.state.addedRowId }, createBlock: this.props.createBlock, database: this.props.database, innerBlock: this.props.blockDef.content, renderInstanceProps: this.props.renderInstanceProps, schema: this.props.schema }, (renderInstanceProps, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, this.props.renderInstanceProps.renderChildBlock(renderInstanceProps, this.props.blockDef.content)));
        });
    }
}
//# sourceMappingURL=addRow.js.map