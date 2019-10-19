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
var CompoundBlock_1 = __importDefault(require("../../CompoundBlock"));
var blocks_1 = require("../../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var QueryRepeatBlockInstance_1 = __importDefault(require("./QueryRepeatBlockInstance"));
var propertyEditors_1 = require("../../propertyEditors");
var bootstrap_1 = require("react-library/lib/bootstrap");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var QueryRepeatBlock = /** @class */ (function (_super) {
    __extends(QueryRepeatBlock, _super);
    function QueryRepeatBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QueryRepeatBlock.prototype.getChildren = function (contextVars) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        if (this.blockDef.content) {
            return [{
                    blockDef: this.blockDef.content,
                    contextVars: rowsetCV ? contextVars.concat(this.createRowContextVar(rowsetCV)) : contextVars
                }];
        }
        return [];
    };
    QueryRepeatBlock.prototype.validate = function (options) {
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
        // TODO Validate order by
        return null;
    };
    QueryRepeatBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) { draft.content = content; });
    };
    /** Create the context variable used */
    QueryRepeatBlock.prototype.createRowContextVar = function (rowsetCV) {
        return { id: this.getRowContextVarId(), name: "Table row", type: "row", table: rowsetCV.table };
    };
    QueryRepeatBlock.prototype.getRowContextVarId = function () {
        return this.blockDef.id + "_row";
    };
    /** Get list of expressions used in a row by content blocks */
    QueryRepeatBlock.prototype.getRowExprs = function (contextVars, ctx) {
        var _this = this;
        var rowsetCV = contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        if (!rowsetCV) {
            return [];
        }
        var exprs = [];
        var rowCV = this.createRowContextVar(rowsetCV);
        // Get expressions for content
        if (this.blockDef.content) {
            exprs = exprs.concat(this.createBlock(this.blockDef.content).getSubtreeContextVarExprs(rowCV, __assign(__assign({}, ctx), { contextVars: contextVars.concat([rowCV]) })));
        }
        return exprs;
    };
    QueryRepeatBlock.prototype.getContextVarExprs = function () {
        return [];
    };
    /**
     * Get the value of the row context variable for a specific row.
     * Row should have fields e0, e1, etc. to represent expressions. If singleRow mode, should have id field
     * contextVars: includes rowsetCV and row one
     */
    QueryRepeatBlock.prototype.getRowContextVarValue = function (row, rowExprs, schema, rowsetCV, contextVars) {
        return row.id;
    };
    QueryRepeatBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var setContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
            }), blockDef.id);
        };
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId && cv.type === "rowset"; });
        var contentProps = props;
        // Add context variable if knowable
        if (rowsetCV) {
            contentProps = __assign(__assign({}, contentProps), { contextVars: props.contextVars.concat([this.createRowContextVar(rowsetCV)]) });
        }
        return (props.renderChildBlock(contentProps, this.blockDef.content, setContent));
    };
    QueryRepeatBlock.prototype.renderInstance = function (props) {
        return React.createElement(QueryRepeatBlockInstance_1.default, { block: this, instanceCtx: props });
    };
    QueryRepeatBlock.prototype.renderEditor = function (props) {
        var _this = this;
        // Get rowset context variable
        var rowsetCV = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.rowsetContextVarId; });
        var rowCV = rowsetCV ? this.createRowContextVar(rowsetCV) : null;
        var separatorOptions = [
            { value: "none", label: "None" },
            { value: "solid_line", label: "Solid Line" },
            { value: "page_break", label: "Page Break" }
        ];
        return (React.createElement("div", null,
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Rowset" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "rowsetContextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["rowset"] }); })),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Separator" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "separator" }, function (value, onChange) { return React.createElement(bootstrap_1.Select, { value: value, onChange: onChange, options: separatorOptions }); })),
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
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Message to display when no rows" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.store.replaceBlock, property: "noRowsMessage" }, function (value, onChange) { return React.createElement(propertyEditors_1.LocalizedTextPropertyEditor, { value: value, onChange: onChange, locale: props.locale }); }))));
    };
    return QueryRepeatBlock;
}(CompoundBlock_1.default));
exports.QueryRepeatBlock = QueryRepeatBlock;
