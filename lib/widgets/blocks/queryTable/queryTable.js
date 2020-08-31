"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var immer_1 = __importDefault(require("immer"));
var React = __importStar(require("react"));
var _ = __importStar(require("lodash"));
var blocks_1 = require("../../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var QueryTableBlockInstance_1 = __importDefault(require("./QueryTableBlockInstance"));
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var QueryTableBlock = /** @class */ (function (_super) {
    __extends(QueryTableBlock, _super);
    function QueryTableBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueryTableBlock.prototype.getChildren = function (contextVars) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var headerChildren = _.compact(this.blockDef.headers).map(function (bd) { return ({ blockDef: bd, contextVars: contextVars }); });
        var contentChildren = _.compact(this.blockDef.contents).map(function (bd) { return ({ blockDef: bd, contextVars: rowsetCV ? contextVars.concat(_this.createRowContextVar(rowsetCV)) : contextVars }); });
        return headerChildren.concat(contentChildren);
    };
    QueryTableBlock.prototype.validate = function (designCtx) {
        var _this = this;
        // Validate rowset
        var rowsetCV = designCtx.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return "Rowset required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(designCtx.schema, blocks_1.createExprVariables(designCtx.contextVars));
        var error;
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table });
        if (error) {
            return error;
        }
        // Validate orderBy
        for (var _i = 0, _a = this.blockDef.orderBy || []; _i < _a.length; _i++) {
            var orderBy = _a[_i];
            error = exprValidator.validateExpr(orderBy.expr, { table: rowsetCV.table });
            if (error) {
                return error;
            }
        }
        // Validate action
        if (this.blockDef.rowClickAction) {
            var action = designCtx.actionLibrary.createAction(this.blockDef.rowClickAction);
            // Create row context variable
            var rowCV = this.createRowContextVar(rowsetCV);
            error = action.validate(__assign(__assign({}, designCtx), { contextVars: designCtx.contextVars.concat(rowCV) }));
            if (error) {
                return error;
            }
        }
        return null;
    };
    QueryTableBlock.prototype.processChildren = function (action) {
        var headers = this.blockDef.headers.map(function (b) { return action(b); });
        var contents = this.blockDef.contents.map(function (b) { return action(b); });
        return immer_1.default(this.blockDef, function (draft) {
            draft.headers = headers;
            draft.contents = contents;
        });
    };
    /** Create the context variable used */
    QueryTableBlock.prototype.createRowContextVar = function (rowsetCV) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return { id: this.getRowContextVarId(), name: "Table row of " + rowsetCV.name, type: "row", table: rowsetCV.table };
            case "multiRow":
                return { id: this.getRowContextVarId(), name: "Table row rowset of " + rowsetCV.name, type: "rowset", table: rowsetCV.table };
        }
        throw new Error("Unknown mode");
    };
    QueryTableBlock.prototype.getRowContextVarId = function () {
        switch (this.blockDef.mode) {
            case "singleRow":
                return this.blockDef.id + "_row";
            case "multiRow":
                return this.blockDef.id + "_rowset";
        }
    };
    /** Get list of expressions used in a row by content blocks */
    QueryTableBlock.prototype.getRowExprs = function (contextVars, ctx) {
        var _this = this;
        var rowsetCV = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return [];
        }
        var exprs = [];
        var rowCV = this.createRowContextVar(rowsetCV);
        // Get expressions for all content blocks
        for (var _i = 0, _a = this.blockDef.contents; _i < _a.length; _i++) {
            var contentBlockDef = _a[_i];
            if (contentBlockDef) {
                exprs = exprs.concat(ctx.createBlock(contentBlockDef).getSubtreeContextVarExprs(rowCV, __assign(__assign({}, ctx), { contextVars: contextVars.concat([rowCV]) })));
            }
        }
        // Get action expressions too
        if (this.blockDef.rowClickAction) {
            var action = ctx.actionLibrary.createAction(this.blockDef.rowClickAction);
            exprs = exprs.concat(action.getContextVarExprs(rowCV));
        }
        return exprs;
    };
    QueryTableBlock.prototype.getContextVarExprs = function (contextVar, ctx) {
        // Include action expressions
        if (this.blockDef.rowClickAction) {
            var action = ctx.actionLibrary.createAction(this.blockDef.rowClickAction);
            return action.getContextVarExprs(contextVar);
        }
        return [];
    };
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    QueryTableBlock.prototype.getRowContextVarValue = function (row, rowExprs, schema, rowsetCV, contextVars) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return row.id;
            case "multiRow":
                var exprUtils_1 = new mwater_expressions_1.ExprUtils(schema, blocks_1.createExprVariables(contextVars));
                // Create "and" filter
                var ands_1 = [];
                rowExprs.forEach(function (expr, index) {
                    if (exprUtils_1.getExprAggrStatus(expr) === "individual") {
                        ands_1.push({
                            type: "op",
                            op: "=",
                            table: rowsetCV.table,
                            exprs: [
                                expr,
                                { type: "literal", valueType: exprUtils_1.getExprType(expr), value: row["e" + index] }
                            ]
                        });
                    }
                });
                return (ands_1.length > 0) ? { type: "op", op: "and", table: rowsetCV.table, exprs: ands_1 } : null;
        }
    };
    QueryTableBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var setHeader = function (index, blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.headers[index] = blockDef;
            }), blockDef.id);
        };
        var setContent = function (index, blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.contents[index] = blockDef;
            }), blockDef.id);
        };
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        var contentProps = props;
        // Add context variable if knowable
        if (rowsetCV) {
            contentProps = __assign(__assign({}, contentProps), { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        var className = "table";
        switch (this.blockDef.borders || "horizontal") {
            case "all":
                className += " table-bordered";
                break;
            case "none":
                className += " table-borderless";
                break;
        }
        switch (this.blockDef.padding || "normal") {
            case "compact":
                className += " table-condensed";
                break;
        }
        return (React.createElement("table", { className: className },
            React.createElement("colgroup", null, this.blockDef.contents.map(function (b, colIndex) {
                // Determine width
                var columnInfos = _this.blockDef.columnInfos;
                var width = columnInfos && columnInfos[colIndex] ? columnInfos[colIndex].columnWidth || "auto" : "auto";
                return React.createElement("col", { key: colIndex, style: { width: width } });
            })),
            !this.blockDef.hideHeaders ?
                React.createElement("thead", null,
                    React.createElement("tr", { key: "header" }, this.blockDef.headers.map(function (b, index) {
                        return React.createElement("th", { key: index }, props.renderChildBlock(props, b, setHeader.bind(null, index)));
                    })))
                : null,
            React.createElement("tbody", null,
                React.createElement("tr", { key: "child" }, this.blockDef.contents.map(function (b, index) {
                    return React.createElement("td", { key: index }, props.renderChildBlock(contentProps, b, setContent.bind(null, index)));
                })))));
    };
    QueryTableBlock.prototype.renderInstance = function (props) {
        return React.createElement(QueryTableBlockInstance_1.default, { block: this, instanceCtx: props });
    };
    QueryTableBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        var handleAddColumn = function () {
            props.store.replaceBlock(immer_1.default(_this.blockDef, function (b) {
                setLength(b.contents, _this.blockDef.contents.length + 1);
                setLength(b.headers, _this.blockDef.contents.length + 1);
                b.columnInfos = b.columnInfos || [];
                setLength(b.columnInfos, _this.blockDef.contents.length + 1);
            }));
        };
        // Remove last column
        var handleRemoveColumn = function () {
            props.store.replaceBlock(immer_1.default(_this.blockDef, function (b) {
                if (b.contents.length > 1) {
                    setLength(b.contents, _this.blockDef.contents.length - 1);
                    setLength(b.headers, _this.blockDef.contents.length - 1);
                    b.columnInfos = b.columnInfos || [];
                    setLength(b.columnInfos, _this.blockDef.headers.length - 1);
                }
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "mode" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value, onChange: onChange, options: [{ value: "singleRow", label: "One item per row" }, { value: "multiRow", label: "Multiple item per row" }] }); })),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "where" }, function (value, onChange) { return (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: blocks_1.createExprVariables(props.contextVars), table: rowsetCV.table })); }))
                : null,
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Ordering" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "orderBy" }, function (value, onChange) {
                        return React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: rowsetCV.table });
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Maximum rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "limit" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false }); })),
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "When row clicked" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowClickAction" }, function (value, onChange) { return (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, designCtx: __assign(__assign({}, props), { contextVars: props.contextVars.concat(rowCV) }) })); }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Message to display when no rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "noRowsMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "hideHeaders" }, function (value, onChange) { return React.createElement(bootstrap_1.Checkbox, { value: value, onChange: onChange }, "Hide Headers"); }),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Borders" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "borders" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value || "horizontal", onChange: onChange, options: [{ value: "none", label: "None" }, { value: "horizontal", label: "Horizontal" }, { value: "all", label: "All" }] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Padding" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "padding" }, function (value, onChange) { return React.createElement(bootstrap_1.Toggle, { value: value || "normal", onChange: onChange, options: [{ value: "normal", label: "Normal" }, { value: "compact", label: "Compact" }] }); })),
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Columns" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "columnInfos" }, function (value, onChange) { return React.createElement(ColumnInfosEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, table: rowCV.table, numColumns: _this.blockDef.contents.length }); }))
                : null,
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddColumn },
                React.createElement("i", { className: "fa fa-plus" }),
                " Add Column"),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleRemoveColumn },
                React.createElement("i", { className: "fa fa-minus" }),
                " Remove Column")));
    };
    return QueryTableBlock;
}(blocks_1.Block));
exports.QueryTableBlock = QueryTableBlock;
/** Edits column info */
var ColumnInfosEditor = function (props) {
    var handleOrderExprChange = function (colIndex, expr) {
        props.onChange(immer_1.default(props.value || [], function (draft) {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].orderExpr = expr;
        }));
    };
    var handleInitialOrderDirChange = function (colIndex, initialOrderDir) {
        props.onChange(immer_1.default(props.value || [], function (draft) {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].initialOrderDir = initialOrderDir;
        }));
    };
    var handleColumnWidthChange = function (colIndex, columnWidth) {
        props.onChange(immer_1.default(props.value || [], function (draft) {
            // Make sure exists
            draft[colIndex] = draft[colIndex] || { orderExpr: null, initialOrderDir: null };
            draft[colIndex].columnWidth = columnWidth;
        }));
    };
    return React.createElement("ul", { className: "list-group" }, _.map(_.range(props.numColumns), function (colIndex) {
        return React.createElement("li", { className: "list-group-item", key: colIndex },
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Sort Icons", hint: "Allow dynamic sorting if present", key: "sort" },
                React.createElement("div", { style: { display: "inline-block", paddingLeft: 5, paddingRight: 10 } },
                    React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: props.schema, dataSource: props.dataSource, onChange: handleOrderExprChange.bind(null, colIndex), table: props.table, value: props.value && props.value[colIndex] ? props.value[colIndex].orderExpr : null, types: ["text", "number", "date", "datetime"] })),
                props.value && props.value[colIndex] && props.value[colIndex].orderExpr ?
                    React.createElement(bootstrap_1.Toggle, { options: [{ value: "asc", label: "Asc" }, { value: "desc", label: "Desc" }, { value: null, label: "No Initial Sort" }], allowReset: false, value: props.value && props.value[colIndex] ? props.value[colIndex].initialOrderDir : null, onChange: handleInitialOrderDirChange.bind(null, colIndex), size: "sm" })
                    : null),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Width", key: "width" },
                React.createElement(propertyEditors_1.TableColumnWidthEditor, { columnWidth: props.value && props.value[colIndex] ? props.value[colIndex].columnWidth || "auto" : "auto", onChange: handleColumnWidthChange.bind(null, colIndex) })));
    }));
};
/** Set the length of an array, adding/removing nulls as necessary */
function setLength(arr, length) {
    // Shorten
    if (arr.length > length) {
        arr.splice(length, arr.length - length);
    }
    if (arr.length < length) {
        for (var i = 0; i < length - arr.length; i++) {
            arr.push(null);
        }
    }
}
