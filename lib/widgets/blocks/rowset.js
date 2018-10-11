import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { createExprVariables } from '../blocks';
import { ExprValidator } from 'mwater-expressions';
import ContextVarsInjector from '../ContextVarsInjector';
import { TextInput } from 'react-library/lib/bootstrap';
import { FilterExprComponent } from 'mwater-expressions-ui';
import { PropertyEditor, LabeledProperty, TableSelect } from '../propertyEditors';
export class RowsetBlock extends CompoundBlock {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            const contextVar = this.createContextVar();
            return [{ blockDef: this.blockDef.content, contextVars: contextVar ? contextVars.concat([contextVar]) : contextVars }];
        }
        return [];
    }
    createContextVar() {
        if (this.blockDef.table) {
            return { type: "rowset", id: this.blockDef.id, name: this.blockDef.name || "Unnamed", table: this.blockDef.table };
        }
        return null;
    }
    validate(options) {
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        let error;
        if (!this.blockDef.table) {
            return "Missing table";
        }
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.filter, { table: this.blockDef.table, types: ["boolean"] });
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
        // Inject context variable TODO
        return React.createElement(ContextVarsInjector, { injectedContextVars: [contextVar], injectedContextVarValues: { [contextVar.id]: this.blockDef.filter }, createBlock: this.createBlock, database: props.database, innerBlock: this.blockDef.content, renderInstanceProps: props, schema: props.schema }, (renderInstanceProps, loading, refreshing) => {
            if (loading) {
                return React.createElement("div", { style: { color: "#AAA", fontSize: 18, textAlign: "center" } },
                    React.createElement("i", { className: "fa fa-circle-o-notch fa-spin" }));
            }
            return (React.createElement("div", { style: { opacity: refreshing ? 0.6 : undefined } }, props.renderChildBlock(renderInstanceProps, this.blockDef.content)));
        });
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(LabeledProperty, { label: "Table" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "table" }, (value, onChange) => React.createElement(TableSelect, { schema: props.schema, locale: props.locale, value: value, onChange: onChange }))),
            React.createElement(LabeledProperty, { label: "Name" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "name" }, (value, onChange) => React.createElement(TextInput, { value: value, onChange: onChange, placeholder: "Unnamed" }))),
            this.blockDef.table ?
                React.createElement(LabeledProperty, { label: "Filter" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "filter" }, (value, onChange) => React.createElement(FilterExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: this.blockDef.table, variables: createExprVariables(props.contextVars) })))
                : null));
    }
}
//# sourceMappingURL=rowset.js.map