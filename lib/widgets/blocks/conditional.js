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
var CompoundBlock_1 = __importDefault(require("../CompoundBlock"));
var blocks_1 = require("../blocks");
var mwater_expressions_1 = require("mwater-expressions");
var propertyEditors_1 = require("../propertyEditors");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var ConditionalBlock = /** @class */ (function (_super) {
    __extends(ConditionalBlock, _super);
    function ConditionalBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConditionalBlock.prototype.getChildren = function (contextVars) {
        if (this.blockDef.content) {
            return [{ blockDef: this.blockDef.content, contextVars: contextVars }];
        }
        return [];
    };
    ConditionalBlock.prototype.validate = function (options) {
        var _this = this;
        var error;
        if (!this.blockDef.content) {
            return "Content required";
        }
        // Validate cv
        var contextVar = options.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarId && (cv.type === "rowset" || cv.type === "row"); });
        if (!contextVar) {
            return "Context variable required";
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        // Validate expr
        error = exprValidator.validateExpr(this.blockDef.expr, { table: contextVar.table, types: ["boolean"] });
        if (error) {
            return error;
        }
        return null;
    };
    ConditionalBlock.prototype.processChildren = function (action) {
        var content = action(this.blockDef.content);
        return immer_1.default(this.blockDef, function (draft) {
            draft.content = content;
        });
    };
    /** Get context variable expressions needed to add */
    ConditionalBlock.prototype.getContextVarExprs = function (contextVar) {
        return (contextVar.id === this.blockDef.contextVarId && this.blockDef.expr) ? [this.blockDef.expr] : [];
    };
    ConditionalBlock.prototype.renderDesign = function (props) {
        var _this = this;
        var handleSetContent = function (blockDef) {
            props.store.alterBlock(_this.id, immer_1.default(function (b) {
                b.content = blockDef;
                return b;
            }), blockDef.id);
        };
        var contentNode = props.renderChildBlock(props, this.blockDef.content, handleSetContent);
        return (React.createElement("div", { style: { paddingTop: 5, paddingBottom: 5, border: "dashed 1px #CCC" } }, contentNode));
    };
    ConditionalBlock.prototype.renderInstance = function (props) {
        // Check expression value
        var value = props.getContextVarExprValue(this.blockDef.contextVarId, this.blockDef.expr);
        if (!value) {
            return React.createElement("div", null);
        }
        return React.createElement("div", null, props.renderChildBlock(props, this.blockDef.content));
    };
    ConditionalBlock.prototype.renderEditor = function (props) {
        var _this = this;
        var contextVar = props.contextVars.find(function (cv) { return cv.id === _this.blockDef.contextVarId; });
        // TODO ensure expressions do not use context variables after the one that has been selected (as the parent injector will not have access to the variable value)
        return (React.createElement("div", null,
            React.createElement("h3", null, "Rowset"),
            React.createElement(propertyEditors_1.LabeledProperty, { label: "Row/Rowset Variable" },
                React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "contextVarId" }, function (value, onChange) { return React.createElement(propertyEditors_1.ContextVarPropertyEditor, { value: value, onChange: onChange, contextVars: props.contextVars, types: ["row", "rowset"] }); })),
            contextVar && contextVar.table
                ?
                    React.createElement(propertyEditors_1.LabeledProperty, { label: "Conditional Expression" },
                        React.createElement(propertyEditors_1.PropertyEditor, { obj: this.blockDef, onChange: props.onChange, property: "expr" }, function (value, onChange) {
                            return React.createElement(mwater_expressions_ui_1.ExprComponent, { value: value, onChange: onChange, schema: props.schema, dataSource: props.dataSource, aggrStatuses: ["individual", "aggregate", "literal"], types: ["boolean"], variables: blocks_1.createExprVariables(props.contextVars), table: contextVar.table });
                        }))
                : null));
    };
    return ConditionalBlock;
}(CompoundBlock_1.default));
exports.ConditionalBlock = ConditionalBlock;
