"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mwater_expressions_1 = require("mwater-expressions");
var blocks_1 = require("./widgets/blocks");
var d3_format_1 = __importDefault(require("d3-format"));
var moment_1 = __importDefault(require("moment"));
/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
exports.formatEmbeddedExprString = function (options) {
    var text = options.text;
    var formatLocale = options.formatLocale || d3_format_1.default;
    // Format and replace
    for (var i = 0; i < options.exprValues.length; i++) {
        var str = void 0;
        var expr = options.embeddedExprs[i].expr;
        var exprType = new mwater_expressions_1.ExprUtils(options.schema, blocks_1.createExprVariables(options.contextVars)).getExprType(expr);
        var format = options.embeddedExprs[i].format;
        var value = options.exprValues[i];
        if (value == null) {
            str = "";
        }
        else {
            if (exprType === "number" && value != null) {
                str = formatLocale.format(format || "")(value);
            }
            else if (exprType === "date" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(format || "ll");
            }
            else if (exprType === "datetime" && value != null) {
                str = moment_1.default(value, moment_1.default.ISO_8601).format(format || "lll");
            }
            else {
                str = new mwater_expressions_1.ExprUtils(options.schema, blocks_1.createExprVariables(options.contextVars)).stringifyExprLiteral(expr, value, options.locale);
            }
        }
        text = text.replace("{" + i + "}", str);
    }
    return text;
};
/** Validate embedded expressions, returning null if ok, message otherwise */
exports.validateEmbeddedExprs = function (options) {
    var _loop_1 = function (embeddedExpr) {
        // Validate cv
        var contextVar = options.contextVars.find(function (cv) { return cv.id === embeddedExpr.contextVarId && (cv.type === "rowset" || cv.type === "row"); });
        if (!contextVar) {
            return { value: "Context variable required" };
        }
        var exprValidator = new mwater_expressions_1.ExprValidator(options.schema, blocks_1.createExprVariables(options.contextVars));
        var error = void 0;
        // Validate expr
        error = exprValidator.validateExpr(embeddedExpr.expr, { table: contextVar.table });
        if (error) {
            return { value: error };
        }
    };
    for (var _i = 0, _a = options.embeddedExprs; _i < _a.length; _i++) {
        var embeddedExpr = _a[_i];
        var state_1 = _loop_1(embeddedExpr);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return null;
};
