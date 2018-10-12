import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { createExprVariables } from '../blocks';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, NumberFormatEditor, ContextVarPropertyEditor, DateFormatEditor, DatetimeFormatEditor } from '../propertyEditors';
import { localize } from '../localization';
import { Select } from 'react-library/lib/bootstrap';
import { ExprValidator, ExprUtils } from 'mwater-expressions';
import * as _ from 'lodash';
import { format as d3Format } from 'd3-format';
import { ExprComponent } from 'mwater-expressions-ui';
import ListEditor from '../ListEditor';
import moment from 'moment';
export class TextBlock extends LeafBlock {
    getContextVarExprs(contextVar) {
        if (this.blockDef.embeddedExprs) {
            return _.compact(_.map(this.blockDef.embeddedExprs, ee => ee.contextVarId === contextVar.id ? ee.expr : null));
        }
        return [];
    }
    validate(options) {
        // Validate expressions
        if (this.blockDef.embeddedExprs) {
            for (const embeddedExpr of this.blockDef.embeddedExprs) {
                // Validate cv
                const contextVar = options.contextVars.find(cv => cv.id === embeddedExpr.contextVarId && (cv.type === "rowset" || cv.type === "row"));
                if (!contextVar) {
                    return "Context variable required";
                }
                const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
                let error;
                // Validate expr
                error = exprValidator.validateExpr(embeddedExpr.expr, { table: contextVar.table });
                if (error) {
                    return error;
                }
            }
        }
        return null;
    }
    renderDesign(props) {
        const text = localize(this.blockDef.text, props.locale);
        return React.createElement(this.blockDef.style, {}, text ? text : React.createElement("span", { className: "text-muted" }, "Text"));
    }
    renderInstance(props) {
        let text = localize(this.blockDef.text, props.locale);
        // Get any embedded expression values
        const exprValues = _.map(this.blockDef.embeddedExprs || [], ee => props.getContextVarExprValue(ee.contextVarId, ee.expr));
        // Format and replace
        for (let i = 0; i < exprValues.length; i++) {
            let str;
            const expr = this.blockDef.embeddedExprs[i].expr;
            const exprType = new ExprUtils(props.schema, createExprVariables(props.contextVars)).getExprType(expr);
            const format = this.blockDef.embeddedExprs[i].format;
            const value = exprValues[i];
            if (exprType === "number" && value != null) {
                str = d3Format(format || "")(value);
            }
            else if (exprType === "date" && value != null) {
                str = moment(value, moment.ISO_8601).format(format || "ll");
            }
            else if (exprType === "datetime" && value != null) {
                str = moment(value, moment.ISO_8601).format(format || "lll");
            }
            else {
                str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(expr, value, props.locale);
            }
            text = text.replace(`{${i}}`, str);
        }
        return React.createElement(this.blockDef.style, {}, text);
    }
    renderEditor(props) {
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Text" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "text" }, (value, onChange) => React.createElement(LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }))),
            React.createElement(LabeledProperty, { label: "Style" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "style" }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: [
                        { value: "div", label: "Plain Text" },
                        { value: "p", label: "Paragraph" },
                        { value: "h1", label: "Heading 1" },
                        { value: "h2", label: "Heading 2" },
                        { value: "h3", label: "Heading 3" },
                        { value: "h4", label: "Heading 4" }
                    ] }))),
            React.createElement(LabeledProperty, { label: "Embedded expressions", help: "Reference in text as {0}, {1}, etc." },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "embeddedExprs" }, (value, onChange) => {
                    const handleAddEmbeddedExpr = () => {
                        onChange((value || []).concat([{ contextVarId: null, expr: null, format: null }]));
                    };
                    return (React.createElement("div", null,
                        React.createElement(ListEditor, { items: value || [], onItemsChange: onChange }, (item, onItemChange) => React.createElement(EmbeddedExprEditor, { value: item, onChange: onItemChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars })),
                        React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddEmbeddedExpr }, "+ Add Embedded Expression")));
                }))));
    }
}
/** Allows editing of an embedded expression */
class EmbeddedExprEditor extends React.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            // Clear format
            this.props.onChange(Object.assign({}, this.props.value, { expr: expr, format: null }));
        };
    }
    render() {
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        const contextVar = this.props.contextVars.find(cv => cv.id === this.props.value.contextVarId);
        const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: this.props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(LabeledProperty, { label: "Expression" },
                        React.createElement(ExprComponent, { value: this.props.value.expr, onChange: this.handleExprChange, schema: this.props.schema, dataSource: this.props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: createExprVariables(this.props.contextVars), table: contextVar.table }))
                : null,
            exprType === "number" ?
                React.createElement(LabeledProperty, { label: "Number Format" },
                    React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(NumberFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "date" ?
                React.createElement(LabeledProperty, { label: "Date Format" },
                    React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(DateFormatEditor, { value: value, onChange: onChange }))))
                : null,
            exprType === "datetime" ?
                React.createElement(LabeledProperty, { label: "Date/time Format" },
                    React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(DatetimeFormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
//# sourceMappingURL=text.js.map