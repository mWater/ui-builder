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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmbeddedExprs = exports.formatEmbeddedExprString = void 0;
const mwater_expressions_1 = require("mwater-expressions");
const blocks_1 = require("./widgets/blocks");
const d3Format = __importStar(require("d3-format"));
const moment_1 = __importDefault(require("moment"));
/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
exports.formatEmbeddedExprString = (options) => {
    let text = options.text;
    const formatLocale = options.formatLocale || d3Format;
    // Format and replace
    for (let i = 0; i < options.exprValues.length; i++) {
        let str;
        const expr = options.embeddedExprs[i].expr;
        const exprType = new mwater_expressions_1.ExprUtils(options.schema, blocks_1.createExprVariables(options.contextVars)).getExprType(expr);
        const format = options.embeddedExprs[i].format;
        const value = options.exprValues[i];
        if (value == null) {
            str = "";
        }
        else {
            if (exprType === "number" && value != null) {
                // d3 multiplies by 100 when appending a percentage. Remove this behaviour for consistency
                if ((format || "").includes("%")) {
                    str = formatLocale.format(format || "")(value / 100.0);
                }
                else {
                    str = formatLocale.format(format || "")(value);
                }
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
        text = text.replace(`{${i}}`, str);
    }
    return text;
};
/** Validate embedded expressions, returning null if ok, message otherwise */
exports.validateEmbeddedExprs = (options) => {
    for (const embeddedExpr of options.embeddedExprs) {
        const error = blocks_1.validateContextVarExpr({
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
};
