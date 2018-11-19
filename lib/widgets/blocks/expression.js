import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { createExprVariables } from '../blocks';
import { PropertyEditor, ContextVarPropertyEditor, LabeledProperty, NumberFormatEditor, DateFormatEditor, DatetimeFormatEditor } from '../propertyEditors';
import { ExprUtils, ExprValidator } from 'mwater-expressions';
import { ExprComponent } from 'mwater-expressions-ui';
import { format } from 'd3-format';
import moment from 'moment';
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
        const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        let str;
        if (exprType === "number" && value != null) {
            str = format(this.blockDef.format || "")(value);
        }
        else if (exprType === "date" && value != null) {
            str = moment(value, moment.ISO_8601).format(this.blockDef.format || "ll");
        }
        else if (exprType === "datetime" && value != null) {
            str = moment(value, moment.ISO_8601).format(this.blockDef.format || "lll");
        }
        else {
            str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, value, props.locale);
        }
        return (React.createElement("div", null, str));
    }
    renderEditor(props) {
        const contextVar = props.contextVars.find(cv => cv.id === this.blockDef.contextVarId);
        const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(this.blockDef.expr);
        const handleExprChange = (expr) => {
            // Clear format if type different
            const newExprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(expr);
            if (newExprType !== exprType) {
                props.onChange(Object.assign({}, this.blockDef, { expr: expr, format: null }));
            }
            else {
                props.onChange(Object.assign({}, this.blockDef, { expr: expr }));
            }
        };
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(LabeledProperty, { label: "Expression" },
                        React.createElement(ExprComponent, { value: this.blockDef.expr, onChange: handleExprChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: createExprVariables(props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(LabeledProperty, { label: "Number Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(NumberFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "date" ?
                React.createElement(LabeledProperty, { label: "Date Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DateFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "datetime" ?
                React.createElement(LabeledProperty, { label: "Date/time Format" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "format" }, (value, onChange) => (React.createElement(DatetimeFormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
//# sourceMappingURL=expression.js.map