"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixedWidth = exports.QueryTableBlock = void 0;
const immer_1 = __importDefault(require("immer"));
const React = __importStar(require("react"));
const _ = __importStar(require("lodash"));
const blocks_1 = require("../../blocks");
const mwater_expressions_1 = require("mwater-expressions");
const QueryTableBlockInstance_1 = __importDefault(require("./QueryTableBlockInstance"));
const propertyEditors_1 = require("../../propertyEditors");
const bootstrap_1 = require("react-library/lib/bootstrap");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const uuid_1 = __importDefault(require("uuid"));
class QueryTableBlock extends blocks_1.Block {
    getChildren(contextVars) {
        // Get rowset context variable
        const rowsetCV = contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        const headerChildren = _.compact(this.blockDef.headers).map((bd) => ({
            blockDef: bd,
            contextVars: contextVars
        }));
        const contentChildren = _.compact(this.blockDef.contents).map((bd) => ({
            blockDef: bd,
            contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars
        }));
        const footerChildren = _.compact(this.blockDef.footers || []).map((bd) => ({
            blockDef: bd,
            contextVars: contextVars
        }));
        return headerChildren.concat(contentChildren).concat(footerChildren);
    }
    validate(designCtx) {
        // Validate rowset
        const rowsetCV = designCtx.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return "Rowset required";
        }
        const exprValidator = new mwater_expressions_1.ExprValidator(designCtx.schema, (0, blocks_1.createExprVariables)(designCtx.contextVars));
        let error;
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        // Validate orderBy
        for (const orderBy of this.blockDef.orderBy || []) {
            error = exprValidator.validateExpr(orderBy.expr, { table: rowsetCV.table });
            if (error) {
                return error;
            }
        }
        // Validate action
        if (this.blockDef.rowClickAction) {
            const action = designCtx.actionLibrary.createAction(this.blockDef.rowClickAction);
            // Create row context variable
            const rowCV = this.createRowContextVar(rowsetCV);
            error = action.validate(Object.assign(Object.assign({}, designCtx), { contextVars: designCtx.contextVars.concat(rowCV) }));
            if (error) {
                return error;
            }
        }
        return null;
    }
    processChildren(action) {
        const headers = this.blockDef.headers.map((b) => action(b));
        const contents = this.blockDef.contents.map((b) => action(b));
        const footers = this.blockDef.footers ? this.blockDef.footers.map((b) => action(b)) : undefined;
        return (0, immer_1.default)(this.blockDef, (draft) => {
            draft.headers = headers;
            draft.contents = contents;
            draft.footers = footers;
        });
    }
    /** Create the context variable used */
    createRowContextVar(rowsetCV) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return {
                    id: this.getRowContextVarId(),
                    name: `Table row of ${rowsetCV.name}`,
                    type: "row",
                    table: rowsetCV.table
                };
            case "multiRow":
                return {
                    id: this.getRowContextVarId(),
                    name: `Table row rowset of ${rowsetCV.name}`,
                    type: "rowset",
                    table: rowsetCV.table
                };
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
    getRowExprs(contextVars, ctx) {
        const rowsetCV = contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        if (!rowsetCV) {
            return [];
        }
        let exprs = [];
        const rowCV = this.createRowContextVar(rowsetCV);
        // Get expressions for all content blocks
        for (const contentBlockDef of this.blockDef.contents) {
            if (contentBlockDef) {
                exprs = exprs.concat(ctx.createBlock(contentBlockDef).getSubtreeContextVarExprs(rowCV, Object.assign(Object.assign({}, ctx), { contextVars: contextVars.concat([rowCV]) })));
            }
        }
        return exprs;
    }
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    getRowContextVarValue(row, rowExprs, schema, rowsetCV, contextVars, rowsetContextVarValue) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return row.id;
            case "multiRow":
                const exprUtils = new mwater_expressions_1.ExprUtils(schema, (0, blocks_1.createExprVariables)(contextVars));
                // Create "and" filter
                const ands = [];
                // Add overall rowset filter
                if (rowsetContextVarValue) {
                    ands.push(rowsetContextVarValue);
                }
                rowExprs.forEach((expr, index) => {
                    if (exprUtils.getExprAggrStatus(expr) === "individual") {
                        ands.push({
                            type: "op",
                            op: "=",
                            table: rowsetCV.table,
                            exprs: [expr, { type: "literal", valueType: exprUtils.getExprType(expr), value: row["e" + index] }]
                        });
                    }
                });
                return ands.length > 0 ? { type: "op", op: "and", table: rowsetCV.table, exprs: ands } : null;
        }
    }
    renderDesign(props) {
        const setHeader = (index, blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.headers[index] = blockDef;
            }), blockDef.id);
        };
        const setContent = (index, blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.contents[index] = blockDef;
            }), blockDef.id);
        };
        const setFooter = (index, blockDef) => {
            props.store.alterBlock(this.id, (0, immer_1.default)((b) => {
                b.footers[index] = blockDef;
            }), blockDef.id);
        };
        const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId && cv.type === "rowset");
        let contentProps = props;
        // Add context variable if knowable
        if (rowsetCV) {
            contentProps = Object.assign(Object.assign({}, contentProps), { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        const divStyle = {};
        const tableStyle = {};
        if (getFixedWidth(this.blockDef)) {
            tableStyle.width = getFixedWidth(this.blockDef);
            divStyle.overflowX = "auto";
        }
        let className = "ui-builder-table";
        switch (this.blockDef.borders || "horizontal") {
            case "all":
                className += " ui-builder-table-bordered";
                break;
            case "none":
                className += " ui-builder-table-borderless";
                break;
        }
        switch (this.blockDef.padding || "normal") {
            case "compact":
                className += " ui-builder-table-condensed";
                break;
        }
        if (this.blockDef.striped) {
            className += " ui-builder-table-striped";
        }
        const getColumnVerticalAlign = (colIndex) => {
            const columnInfos = this.blockDef.columnInfos;
            return columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].verticalAlign || "top" : "top";
        };
        return (React.createElement("div", { style: divStyle },
            React.createElement("table", { className: className, style: tableStyle },
                React.createElement("colgroup", null, this.blockDef.contents.map((b, colIndex) => {
                    // Determine width
                    const columnInfos = this.blockDef.columnInfos;
                    const width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].columnWidth || "auto" : "auto";
                    return React.createElement("col", { key: colIndex, style: { width: width } });
                })),
                !this.blockDef.hideHeaders ? (React.createElement("thead", null,
                    React.createElement("tr", { key: "header" }, this.blockDef.headers.map((b, index) => {
                        return React.createElement("th", { key: index }, props.renderChildBlock(props, b, setHeader.bind(null, index)));
                    })))) : null,
                React.createElement("tbody", null,
                    React.createElement("tr", { key: "child" }, this.blockDef.contents.map((b, index) => {
                        return (React.createElement("td", { key: index, style: { verticalAlign: getColumnVerticalAlign(index) } }, props.renderChildBlock(contentProps, b, setContent.bind(null, index))));
                    }))),
                this.blockDef.footers ? (React.createElement("tfoot", null,
                    React.createElement("tr", { key: "footer" }, this.blockDef.footers.map((b, index) => {
                        return React.createElement("td", { key: index }, props.renderChildBlock(props, b, setFooter.bind(null, index)));
                    })))) : null)));
    }
    renderInstance(props) {
        return React.createElement(QueryTableBlockInstance_1.default, { block: this, instanceCtx: props });
    }
    renderEditor(props) {
        // Get rowset context variable
        const rowsetCV = props.contextVars.find((cv) => cv.id === this.blockDef.rowsetContextVarId);
        const rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        const handleAddColumn = () => {
            props.store.replaceBlock((0, immer_1.default)(this.blockDef, (b) => {
                setLength(b.contents, this.blockDef.contents.length + 1);
                setLength(b.headers, this.blockDef.contents.length + 1);
                if (b.footers) {
                    setLength(b.footers, this.blockDef.contents.length + 1);
                }
                b.headers[b.headers.length - 1] = {
                    id: uuid_1.default.v4(),
                    type: "text",
                    text: { _base: "en", en: "Header" },
                    style: "div"
                };
                b.columnInfos = b.columnInfos || [];
                setLength(b.columnInfos, this.blockDef.contents.length + 1);
            }));
        };
        // Remove last column
        const handleRemoveColumn = () => {
            props.store.replaceBlock((0, immer_1.default)(this.blockDef, (b) => {
                if (b.contents.length > 1) {
                    setLength(b.contents, this.blockDef.contents.length - 1);
                    setLength(b.headers, this.blockDef.contents.length - 1);
                    if (b.footers) {
                        setLength(b.footers, this.blockDef.contents.length - 1);
                    }
                    b.columnInfos = b.columnInfos || [];
                    setLength(b.columnInfos, this.blockDef.contents.length - 1);
                }
            }));
        };
        const handleAddFooters = () => {
            props.store.replaceBlock((0, immer_1.default)(this.blockDef, (b) => {
                b.footers = [];
                setLength(b.footers, this.blockDef.contents.length);
            }));
        };
        const handleRemoveFooters = () => {
            props.store.replaceBlock((0, immer_1.default)(this.blockDef, (b) => {
                delete b.footers;
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, (value, onChange) => (React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "mode" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [
                        { value: "singleRow", label: "One item per row" },
                        { value: "multiRow", label: "Multiple item per row" }
                    ] })))),
            rowsetCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "where" }, (value, onChange) => (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: (0, blocks_1.createExprVariables)(props.contextVars), table: rowsetCV.table }))))) : null,
            rowCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Ordering" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "orderBy" }, (value, onChange) => (React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: rowsetCV.table }))))) : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Maximum rows" },
                React.createElement("div", null,
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "limit" }, (value, onChange) => (React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false, style: { display: "inline-block" } }))),
                    this.blockDef.limit != null ? (React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "limitType" }, (value, onChange) => (React.createElement("div", { style: { paddingLeft: 10, display: "inline-block" } },
                        React.createElement(bootstrap_1.Checkbox, { value: value != "hard", onChange: (v) => onChange(v !== false ? "soft" : "hard") }, "Enable 'Show More...'"))))) : null)),
            rowCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "When row clicked" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowClickAction" }, (value, onChange) => (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: Object.assign(Object.assign({}, props), { contextVars: props.contextVars.concat(rowCV) }) }))))) : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Message to display when no rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "noRowsMessage" }, (value, onChange) => (React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale })))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "hideHeaders" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Hide Headers"))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Borders" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "borders" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value || "horizontal", onChange: onChange, options: [
                        { value: "none", label: "None" },
                        { value: "horizontal", label: "Horizontal" },
                        { value: "all", label: "All" }
                    ] })))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "padding" }, (value, onChange) => (React.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [
                        { value: "normal", label: "Normal" },
                        { value: "compact", label: "Compact" }
                    ] })))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "striped" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Striped"))),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Maximum height", hint: "Scrolls if exceeds" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "maxHeight" }, (value, onChange) => (React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false, style: { display: "inline-block" }, placeholder: "Unlimited" })))),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "stickyHeaders" }, (value, onChange) => (React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Sticky Headers (may not work in all settings)"))),
            rowCV ? (React.createElement(propertyEditors_1.LabeledProperty, { label: "Columns" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnInfos" }, (value, onChange) => (React.createElement(ColumnInfosEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: rowCV.table, numColumns: this.blockDef.contents.length, variables: (0, blocks_1.createExprVariables)(props.contextVars) }))))) : null,
            React.createElement("div", null,
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddColumn },
                    React.createElement("i", { className: "fa fa-plus" }),
                    " Add Column"),
                React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleRemoveColumn },
                    React.createElement("i", { className: "fa fa-minus" }),
                    " Remove Column")),
            this.blockDef.footers != null ? (React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleRemoveFooters }, "Remove Footer")) : (React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddFooters }, "Add Footer"))));
    }
}
exports.QueryTableBlock = QueryTableBlock;
/** Edits column info */
const ColumnInfosEditor = (props) => {
    const handleOrderExprChange = (colIndex, expr) => {
        props.onChange((0, immer_1.default)(props.value || [], (draft) => {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].orderExpr = expr;
        }));
    };
    const handleInitialOrderDirChange = (colIndex, initialOrderDir) => {
        props.onChange((0, immer_1.default)(props.value || [], (draft) => {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].initialOrderDir = initialOrderDir;
        }));
    };
    const handleColumnWidthChange = (colIndex, columnWidth) => {
        props.onChange((0, immer_1.default)(props.value || [], (draft) => {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].columnWidth = columnWidth;
        }));
    };
    const handleVerticalAlignChange = (colIndex, verticalAlign) => {
        props.onChange((0, immer_1.default)(props.value || [], (draft) => {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].verticalAlign = verticalAlign;
        }));
    };
    return (React.createElement("ul", { className: "list-group" }, _.map(_.range(props.numColumns), (colIndex) => {
        return (React.createElement("li", { className: "list-group-item", key: colIndex },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Sort Icons", hint: "Allow dynamic sorting if present", key: "sort" },
                React.createElement("div", { style: { display: "inline-block", paddingLeft: 5, paddingRight: 10 } },
                    React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: props.schema, dataSource: props.dataSource, onChange: handleOrderExprChange.bind(null, colIndex), table: props.table, value: props.value && props.value[colIndex] ? props.value[colIndex].orderExpr : null, types: ["text", "number", "date", "datetime"], variables: props.variables })),
                props.value && props.value[colIndex] && props.value[colIndex].orderExpr ? (React.createElement(bootstrap_1.Toggle, { options: [
                        { value: "asc", label: "Asc" },
                        { value: "desc", label: "Desc" },
                        { value: null, label: "No Initial Sort" }
                    ], allowReset: false, value: props.value && props.value[colIndex] ? props.value[colIndex].initialOrderDir : null, onChange: handleInitialOrderDirChange.bind(null, colIndex), size: "sm" })) : null),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width", key: "width" },
                React.createElement(propertyEditors_1.TableColumnWidthEditor, { columnWidth: props.value && props.value[colIndex] ? props.value[colIndex].columnWidth || "auto" : "auto", onChange: handleColumnWidthChange.bind(null, colIndex) })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Vertical Alignment" },
                React.createElement(bootstrap_1.Toggle, { value: props.value && props.value[colIndex] ? props.value[colIndex].verticalAlign || "top" : "top", onChange: handleVerticalAlignChange.bind(null, colIndex), size: "sm", options: [
                        { value: "top", label: "Top" },
                        { value: "middle", label: "Middle" },
                        { value: "bottom", label: "Bottom" }
                    ] }))));
    })));
};
/** Set the length of an array, adding/removing nulls as necessary */
function setLength(arr, length) {
    // Shorten
    if (arr.length > length) {
        arr.splice(length, arr.length - length);
    }
    if (arr.length < length) {
        const toAdd = length - arr.length;
        for (let i = 0; i < toAdd; i++) {
            arr.push(null);
        }
    }
}
/** Determine if table is fixed width and if it is, return the width in pixels */
function getFixedWidth(blockDef) {
    if (blockDef.columnInfos &&
        blockDef.columnInfos.every((ci) => ci && ci.columnWidth && ci.columnWidth.match(/[0-9]+px/))) {
        return _.sum(blockDef.columnInfos.map((ci) => parseFloat(ci.columnWidth)));
    }
    return null;
}
exports.getFixedWidth = getFixedWidth;
