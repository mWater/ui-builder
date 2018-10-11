import * as React from 'react';
import LeafBlock from '../LeafBlock';
import { createExprVariables } from '../blocks';
import { LabeledProperty, LocalizedTextPropertyEditor, PropertyEditor, FormatEditor, ContextVarPropertyEditor } from '../propertyEditors';
import { localize } from '../localization';
import { Select } from 'react-library/lib/bootstrap';
import { ExprValidator, ExprUtils } from 'mwater-expressions';
import * as _ from 'lodash';
import { format } from 'd3-format';
import { ExprComponent } from 'mwater-expressions-ui';
import ListEditor from '../ListEditor';
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
            if (_.isNumber(exprValues[i])) {
                str = format(this.blockDef.embeddedExprs[i].format || "")(exprValues[i]);
            }
            else {
                str = new ExprUtils(props.schema, createExprVariables(props.contextVars)).stringifyExprLiteral(this.blockDef.expr, exprValues[i], props.locale);
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
    render() {
        const contextVar = this.props.contextVars.find(cv => cv.id === this.props.value.contextVarId);
        const exprType = new ExprUtils(this.props.schema, createExprVariables(this.props.contextVars)).getExprType(this.props.value.expr);
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "contextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: this.props.contextVars, types: ["row", "rowset"] }))),
            contextVar && contextVar.table
                ?
                    React.createElement(LabeledProperty, { label: "Expression" },
                        React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "expr" }, (value, onChange) => (React.createElement(ExprComponent, { value: value, onChange: onChange, schema: this.props.schema, dataSource: this.props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], variables: createExprVariables(this.props.contextVars), table: contextVar.table }))))
                : null,
            exprType === "number" ?
                React.createElement(LabeledProperty, { label: "Format" },
                    React.createElement(PropertyEditor, { obj: this.props.value, onChange: this.props.onChange, property: "format" }, (value, onChange) => (React.createElement(FormatEditor, { value: value, onChange: onChange }))))
                : null));
    }
}
//# sourceMappingURL=text.js.map