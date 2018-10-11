import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { createExprVariables } from '../blocks';
import { PropertyEditor, ContextVarPropertyEditor, LabeledProperty, FormatEditor } from '../propertyEditors';
import { ExprUtils, ExprValidator } from 'mwater-expressions';
import { ExprComponent } from 'mwater-expressions-ui';
import * as _ from 'lodash';
import { format } from 'd3-format';
export class ExpressionBlock extends LeafBlock {
    getContextVarExprs(contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    }
    validate(options) {
        // Validate cv
        const contextVar = options.contextVars.find(cv => cv.id === this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"));
        if (!contextVar) {
            return "Context variable required";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        let error;
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table });
        if (error) {
            return error;
        }
        return null;
    }
    renderDesign(props) {
        const summary = new ExprUtils(props.schema, createExprVariables(props.contextVars)).summarizeExpr(this.blockDef.expr, props.locale);
        return (React.createElement("div", null,
            React.createElement("span", { className: "text-muted" }, "<"),
            summary,
            React.createElement("span", { className: "text-muted" }, ">")));
    }
    renderInstance(props) {
        if (!this.blockDef.contextVarId || !this.blockDef.expr) {
            return React.createElement("div", null);
        }
        const value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        let str;
        if (_.isNumber(value)) {
            str = format(this.blockDef.format || "")(value);
        }
        else {
            str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale);
        }
        return (React.createElement("div", null, str));
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId);
        const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(LabeledProperty, { label: "Expression" },
                        React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "expr" }, (value, onChange) => (React.createElement(ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: createExprVariables(props.contextVars), table: contextVar.table }))))
                : null,
            exprType === "number" ?
                React.createElement(LabeledProperty, { label: "Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(FormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
//# sourceMappingURL=expression.js.map