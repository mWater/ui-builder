import produce from 'immer';
import * as React from 'react';
import * as _ from 'lodash';
import CompoundBlock from '../../CompoundBlock';
import { getBlockTree, createExprVariables } from '../../blocks';
import { ExprUtils, ExprValidator } from 'mwater-expressions';
import QueryTableBlockInstance from './QueryTableBlockInstance';
import { LabeledProperty, PropertyEditor, ContextVarPropertyEditor, ActionDefEditor, OrderByArrayEditor } from '../../propertyEditors';
import { NumberInput, Select } from 'react-library/lib/bootstrap';
import { ExprComponent } from 'mwater-expressions-ui';
export class QueryTableBlock extends CompoundBlock {
    getChildren(contextVars) {
        // Get rowset context variable
        const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const headerChildren = _.compact(this.blockDef.headers).map(bd => ({ blockDef: bd, contextVars: contextVars }));
        const contentChildren = _.compact(this.blockDef.contents).map(bd => ({ blockDef: bd, contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars }));
        return headerChildren.concat(contentChildren);
    }
    validate(options) {
        // Validate rowset
        const rowsetCV = options.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        const exprValidator = new ExprValidator(options.schema, createExprVariables(options.contextVars));
        let error;
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table });
        if (error) {
            return error;
        }
        // Validate action
        if (this.blockDef.rowClickAction) {
            const action = options.actionLibrary.createAction(this.blockDef.rowClickAction);
            // Create row context variable
            const rowCV = this.createRowContextVar(rowsetCV);
            error = action.validate({
                schema: options.schema,
                contextVars: options.contextVars.concat(rowCV),
                widgetLibrary: options.widgetLibrary
            });
            if (error) {
                return error;
            }
        }
        return null;
    }
    processChildren(action) {
        return produce(this.blockDef, draft => {
            draft.headers = draft.headers.map(b => action(b));
            draft.contents = draft.contents.map(b => action(b));
        });
    }
    /** Create the context variable used */
    createRowContextVar(rowsetCV) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table };
            case "multiRow":
                return { id: this.getRowContextVarId(), name: "Table row rowset", type: "rowset", table: rowsetCV.table };
        }
        throw new Error("Unknown mode");
    }
    getRowContextVarId() {
        switch (this.blockDef.mode) {
            case "singleRow":
                return this.blockDef.id + "_row";
            case "multiRow":
                return this.blockDef.id + "_rowset";
        }
    }
    /** Get list of expressions used in a row by content blocks */
    getRowExprs(contextVars, widgetLibrary) {
        const rowsetCV = contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return [];
        }
        let exprs = [];
        const rowCV = this.createRowContextVar(rowsetCV);
        for (const contentBlockDef of this.blockDef.contents) {
            // Get block tree, compiling expressions for each one
            if (contentBlockDef) {
                for (const descChildBlock of getBlockTree(contentBlockDef, this.createBlock, contextVars)) {
                    exprs = exprs.concat(this.createBlock(descChildBlock.blockDef).getContextVarExprs(rowCV, widgetLibrary));
                }
            }
        }
        return exprs;
    }
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row, rowExprs, schema, rowsetCV, contextVars) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return row.id;
            case "multiRow":
                const exprUtils = new ExprUtils(schema, createExprVariables(contextVars));
                // Create "and" filter
                const ands = [];
                rowExprs.forEach((expr, index) => {
                    if (exprUtils.getExprAggrStatus(expr) === "individual") {
                        ands.push({
                            type: "op",
                            op: "=",
                            table: rowsetCV.table,
                            exprs: [
                                expr,
                                { type: "literal", valueType: exprUtils.getExprType(expr), value: row["e" + index] }
                            ]
                        });
                    }
                });
                return { type: "op", op: "and", table: rowsetCV.table, exprs: ands };
        }
    }
    renderDesign(props) {
        const setHeader = (index, blockDef) => {
            props.store.alterBlock(this.id, produce(b => {
                b.headers[index] = blockDef;
            }), blockDef.id);
        };
        const setContent = (index, blockDef) => {
            props.store.alterBlock(this.id, produce(b => {
                b.contents[index] = blockDef;
            }), blockDef.id);
        };
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        let contentProps = props;
        // Add context variable if knowable
        if (rowsetCV) {
            contentProps = Object.assign({}, contentProps, { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        return (React.createElement("table", { className: "table table-bordered" },
            React.createElement("thead", null,
                React.createElement("tr", null, this.blockDef.headers.map((b, index) => {
                    return React.createElement("th", { key: index }, props.renderChildBlock(props, b, setHeader.bind(null, index)));
                }))),
            React.createElement("tbody", null,
                React.createElement("tr", null, this.blockDef.contents.map((b, index) => {
                    return React.createElement("td", { key: index }, props.renderChildBlock(contentProps, b, setContent.bind(null, index)));
                })))));
    }
    renderInstance(props) {
        return React.createElement(QueryTableBlockInstance, { block: this, renderInstanceProps: props });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find(cv => cv.id === this.blockDef.rowsetContextVarId);
        const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        const handleAddColumn = () => {
            props.onChange(produce(this.blockDef, b => {
                b.headers.push(null);
                b.contents.push(null);
            }));
        };
        // Remove last column
        const handleRemoveColumn = () => {
            props.onChange(produce(this.blockDef, b => {
                if (b.headers.length > 1) {
                    b.headers.splice(b.headers.length - 1, 1);
                    b.contents.splice(b.contents.length - 1, 1);
                }
            }));
        };
        return (React.createElement("div", null,
            React.createElement(LabeledProperty, { label: "Rowset" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, (value, onChange) => React.createElement(ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }))),
            React.createElement(LabeledProperty, { label: "Mode" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "mode" }, (value, onChange) => React.createElement(Select, { value: value, onChange: onChange, options: [{ value: "singleRow", label: "One item per row" }, { value: "multiRow", label: "Multiple item per row" }] }))),
            rowsetCV ?
                React.createElement(LabeledProperty, { label: "Filter" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "where" }, (value, onChange) => (React.createElement(ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: createExprVariables(props.contextVars), table: rowsetCV.table }))))
                : null,
            rowCV ?
                React.createElement(LabeledProperty, { label: "Ordering" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "orderBy" }, (value, onChange) => React.createElement(OrderByArrayEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: rowsetCV.table })))
                : null,
            React.createElement(LabeledProperty, { label: "Maximum rows" },
                React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "limit" }, (value, onChange) => React.createElement(NumberInput, { value: value, onChange: onChange, decimal: false }))),
            rowCV ?
                React.createElement(LabeledProperty, { label: "When row clicked" },
                    React.createElement(PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowClickAction" }, (value, onChange) => (React.createElement(ActionDefEditor, { value: value, onChange: onChange, locale: props.locale, actionLibrary: props.actionLibrary, widgetLibrary: props.widgetLibrary, contextVars: props.contextVars.concat(rowCV) }))))
                : null,
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddColumn },
                React.createElement("i", { className: "fa fa-plus" }),
                " Add Column"),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleRemoveColumn },
                React.createElement("i", { className: "fa fa-minus" }),
                " Remove Column")));
    }
}
//# sourceMappingURL=queryTable.js.map