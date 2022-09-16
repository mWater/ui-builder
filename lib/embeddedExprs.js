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
exports.validateEmbeddedExprs = exports.formatEmbeddedExpr = exports.formatEmbeddedExprString = void 0;
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("./widgets/blocks");
const d3Format = __importStar(require("d3-format"));
const moment_1 = __importDefault(require("moment"));
/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
function formatEmbeddedExprString(options) {
    let text = options.text;
    // Format and replace
    for (let i = 0; i < options.exprValues.length; i++) {
        const str = formatEmbeddedExpr({
            embeddedExpr: options.embeddedExprs[i],
            contextVars: options.contextVars,
            exprValue: options.exprValues[i],
            locale: options.locale,
            formatLocale: options.formatLocale,
            schema: options.schema
        });
        text = text.replace(`{${i}}`, str);
    }
    return text;
}
exports.formatEmbeddedExprString = formatEmbeddedExprString;
/** Format an embedded expression */
function formatEmbeddedExpr(options) {
    const formatLocale = options.formatLocale || d3Format;
    const expr = options.embeddedExpr.expr;
    const exprType = new mwater_expressions_1.ExprUtils(options.schema, (0, blocks_1.createExprVariables)(options.contextVars)).getExprType(expr);
    const format = options.embeddedExpr.format;
    const value = options.exprValue;
    if (value == null) {
        return "";
    }
    else {
        if (exprType === "number" && value != null) {
            // d3 multiplies by 100 when appending a percentage. Remove this behaviour for consistency
            if ((format || "").includes("%")) {
                return formatLocale.format(format || "")(value / 100.0);
            }
            else {
                return formatLocale.format(format || "")(value);
            }
        }
        else if (exprType === "date" && value != null) {
            return (0, moment_1.default)(value, moment_1.default.ISO_8601).format(format || "ll");
        }
        else if (exprType === "datetime" && value != null) {
            return (0, moment_1.default)(value, moment_1.default.ISO_8601).format(format || "lll");
        }
        else {
            return new mwater_expressions_1.ExprUtils(options.schema, (0, blocks_1.createExprVariables)(options.contextVars)).stringifyExprLiteral(expr, value, options.locale);
        }
    }
}
exports.formatEmbeddedExpr = formatEmbeddedExpr;
/** Validate embedded expressions, returning null if ok, message otherwise */
function validateEmbeddedExprs(options) {
    for (const embeddedExpr of options.embeddedExprs) {
        const error = (0, blocks_1.validateContextVarExpr)({
            contextVars: options.contextVars,
            schema: options.schema,
            contextVarId: embeddedExpr.contextVarId,
            expr: embeddedExpr.expr
        });
        if (error) {
            return error;
        }
    }
    return null;
}
exports.validateEmbeddedExprs = validateEmbeddedExprs;
