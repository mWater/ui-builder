"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
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
var CompoundBlock_1 = __importDefault(require("../../CompoundBlock"));
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
    QueryTableBlock.prototype.validate = function (options) {
        var _this = this;
        // Validate rowset
        var rowsetCV = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return "Rowset required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        var error;
        // Validate where
        error = exprValidator.validateExpr(this.blockDef.where, { table: rowsetCV.table });
        if (error) {
            return error;
        }
        // Validate action
        if (this.blockDef.rowClickAction) {
            var action = options.actionLibrary.createAction(this.blockDef.rowClickAction);
            // Create row context variable
            var rowCV = this.createRowContextVar(rowsetCV);
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
    };
    QueryTableBlock.prototype.processChildren = function (action) {
        return immer_1.default(this.blockDef, function (draft) {
            draft.headers = draft.headers.map(function (b) { return action(b); });
            draft.contents = draft.contents.map(function (b) { return action(b); });
        });
    };
    /** Create the context variable used */
    QueryTableBlock.prototype.createRowContextVar = function (rowsetCV) {
        switch (this.blockDef.mode) {
            case "singleRow":
                return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table };
            case "multiRow":
                return { id: this.getRowContextVarId(), name: "Table row rowset", type: "rowset", table: rowsetCV.table };
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
    QueryTableBlock.prototype.getRowExprs = function (contextVars, widgetLibrary, actionLibrary) {
        var _this = this;
        var rowsetCV = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return [];
        }
        var exprs = [];
        var rowCV = this.createRowContextVar(rowsetCV);
        for (var _i = 0, _a = this.blockDef.contents; _i < _a.length; _i++) {
            var contentBlockDef = _a[_i];
            // Get block tree, compiling expressions for each one
            if (contentBlockDef) {
                for (var _b = 0, _c = blocks_1.getBlockTree(contentBlockDef, this.createBlock, contextVars); _b < _c.length; _b++) {
                    var descChildBlock = _c[_b];
                    exprs = exprs.concat(this.createBlock(descChildBlock.blockDef).getContextVarExprs(rowCV, widgetLibrary, actionLibrary));
                }
            }
        }
        // Get action expressions too
        if (this.blockDef.rowClickAction) {
            var action = actionLibrary.createAction(this.blockDef.rowClickAction);
            exprs = exprs.concat(action.getContextVarExprs(rowCV, widgetLibrary));
        }
        return exprs;
    };
    QueryTableBlock.prototype.getContextVarExprs = function (contextVar, widgetLibrary, actionLibrary) {
        // Include action expressions
        if (this.blockDef.rowClickAction) {
            var action = actionLibrary.createAction(this.blockDef.rowClickAction);
            return action.getContextVarExprs(contextVar, widgetLibrary);
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
            contentProps = __assign({}, contentProps, { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        return (React.createElement("table", { className: "table table-bordered" },
            React.createElement("thead", null,
                React.createElement("tr", null, this.blockDef.headers.map(function (b, index) {
                    return React.createElement("th", { key: index }, props.renderChildBlock(props, b, setHeader.bind(null, index)));
                }))),
            React.createElement("tbody", null,
                React.createElement("tr", null, this.blockDef.contents.map(function (b, index) {
                    return React.createElement("td", { key: index }, props.renderChildBlock(contentProps, b, setContent.bind(null, index)));
                })))));
    };
    QueryTableBlock.prototype.renderInstance = function (props) {
        return React.createElement(QueryTableBlockInstance_1.default, { block: this, renderInstanceProps: props });
    };
    QueryTableBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        var handleAddColumn = function () {
            props.onChange(immer_1.default(_this.blockDef, function (b) {
                b.headers.push(null);
                b.contents.push(null);
            }));
        };
        // Remove last column
        var handleRemoveColumn = function () {
            props.onChange(immer_1.default(_this.blockDef, function (b) {
                if (b.headers.length > 1) {
                    b.headers.splice(b.headers.length - 1, 1);
                    b.contents.splice(b.contents.length - 1, 1);
                }
            }));
        };
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Mode" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "mode" }, function (value, onChange) { return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: [{ value: "singleRow", label: "One item per row" }, { value: "multiRow", label: "Multiple item per row" }] }); })),
            rowsetCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Filter" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "where" }, function (value, onChange) { return (React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, types: ["boolean"], variables: blocks_1.createExprVariables(props.contextVars), table: rowsetCV.table })); }))
                : null,
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "Ordering" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "orderBy" }, function (value, onChange) {
                        return React.createElement(propertyEditors_1.OrderByArrayEditor, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, contextVars: props.contextVars, table: rowsetCV.table });
                    }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Maximum rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "limit" }, function (value, onChange) { return React.createElement(bootstrap_1.NumberInput, { value: value, onChange: onChange, decimal: false }); })),
            rowCV ?
                React.createElement(propertyEditors_1.LabeledProperty, { label: "When row clicked" },
                    React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "rowClickAction" }, function (value, onChange) { return (React.createElement(propertyEditors_1.ActionDefEditor, { value: value, onChange: onChange, locale: props.locale, schema: props.schema, dataSource: props.dataSource, actionLibrary: props.actionLibrary, widgetLibrary: props.widgetLibrary, contextVars: props.contextVars.concat(rowCV) })); }))
                : null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Message to display when no rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "noRowsMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); })),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleAddColumn },
                React.createElement("i", { className: "fa fa-plus" }),
                " Add Column"),
            React.createElement("button", { type: "button", className: "btn btn-link btn-sm", onClick: handleRemoveColumn },
                React.createElement("i", { className: "fa fa-minus" }),
                " Remove Column")));
    };
    return QueryTableBlock;
}(CompoundBlock_1.default));
exports.QueryTableBlock = QueryTableBlock;
//# sourceMappingURL=queryTable.js.map