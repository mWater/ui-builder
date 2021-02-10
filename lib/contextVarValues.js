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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContextVarValue = exports.ContextVarValueEditor = void 0;
var React = __importStar(require("react"));
var blocks_1 = require("./widgets/blocks");
var mwater_expressions_1 = require("mwater-expressions");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
/** Allows editing of the value for one context variable */
var ContextVarValueEditor = /** @class */ (function (_super) {
    __extends(ContextVarValueEditor, _super);
    function ContextVarValueEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContextVarValueEditor.prototype.render = function () {
        var value = this.props.contextVarValue;
        if (this.props.contextVar.type === "row" && this.props.schema.getTable(this.props.contextVar.table)) {
            return React.createElement(mwater_expressions_ui_1.IdLiteralComponent, { schema: this.props.schema, dataSource: this.props.dataSource, idTable: this.props.contextVar.table, value: value, onChange: this.props.onContextVarValueChange });
        }
        if (this.props.contextVar.type === "rowset") {
            return React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table, types: ["boolean"], value: value, onChange: this.props.onContextVarValueChange, variables: blocks_1.createExprVariables(this.props.availContextVars) });
        }
        return React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, table: this.props.contextVar.table || null, types: [this.props.contextVar.type], idTable: this.props.contextVar.idTable, enumValues: this.props.contextVar.enumValues, value: value, onChange: this.props.onContextVarValueChange, variables: blocks_1.createExprVariables(this.props.availContextVars), preferLiteral: true });
    };
    return ContextVarValueEditor;
}(React.Component));
exports.ContextVarValueEditor = ContextVarValueEditor;
/** Validate a context var value */
function validateContextVarValue(schema, contextVar, allContextVars, value) {
    var exprValidator = new mwater_expressions_1.ExprValidator(schema, blocks_1.createExprVariables(allContextVars));
    // Check type
    if (contextVar.type == "row") {
        if (value != null && typeof (value) != "string" && typeof (value) != "number") {
            return "Invalid value for row variable " + contextVar.name;
        }
    }
    else if (contextVar.type == "rowset") {
        // rowset must be a boolean expression
        var error = exprValidator.validateExpr(value, { table: contextVar.table, types: ["boolean"] });
        if (error) {
            return error;
        }
    }
    else {
        var error = exprValidator.validateExpr(value, { types: [contextVar.type] });
        if (error) {
            return error;
        }
    }
    return null;
}
exports.validateContextVarValue = validateContextVarValue;
