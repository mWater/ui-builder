import produce from 'immer';
import * as React from 'react';
import CompoundBlock from '../CompoundBlock';
import { createExprVariables } from '../blocks';
import { ExprValidator } from 'mwater-expressions';
import { PropertyEditor, LabeledProperty, ContextVarPropertyEditor } from '../propertyEditors';
import { ExprComponent } from 'mwater-expressions-ui';
export class ConditionalBlock extends CompoundBlock {
    getChildren(contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars }];
        }
        return [];
    }
    validate(options) {
        let error;
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"));
        if (!contextVar) {
            return "Context variable required";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table, types: ["boolean"] });
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
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    }
    renderDesign(props) {
        const handleSetContent = (blockDef) => {
            props.store.alterBlock(this.id, produce((b) => {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        const contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    }
    renderInstance(props) {
        // Check expression value
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("div", null, props.renderChildBlock(props, this.blockDef.content));
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId);
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(LabeledProperty, { label: "Conditional Expression" },
                        React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "expr" }, (value, onChange) => React.createElement(ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], variables: createExprVariables(props.contextVars), table: contextVar.table })))
                : null));
    }
}
//# sourceMappingURL=conditional.js.map