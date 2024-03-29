import { Expr, Schema } from "mwater-expressions";
import { ContextVar } from "./widgets/blocks";
import { FormatLocaleObject } from "d3-format";
/** Expression which is embedded in the text string */
export interface EmbeddedExpr {
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be displayed */
    expr: Expr;
    /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll). Note: % is not multiplied by 100!  */
    format: string | null;
}
/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
export declare function formatEmbeddedExprString(options: {
    /** text with {0}, {1}... embedded */
    text: string;
    /** Expressions to be substituted in */
    embeddedExprs: EmbeddedExpr[];
    /** Values of expressions */
    exprValues: any[];
    schema: Schema;
    contextVars: ContextVar[];
    locale: string;
    formatLocale?: FormatLocaleObject;
}): string;
/** Format an embedded expression */
export declare function formatEmbeddedExpr(options: {
    /** Expression to be embedded */
    embeddedExpr: EmbeddedExpr;
    /** Value of expression */
    exprValue: any;
    schema: Schema;
    contextVars: ContextVar[];
    locale: string;
    formatLocale?: FormatLocaleObject;
}): string;
/** Validate embedded expressions, returning null if ok, message otherwise */
export declare function validateEmbeddedExprs(options: {
    /** Expressions to be substituted in */
    embeddedExprs: EmbeddedExpr[];
    schema: Schema;
    contextVars: ContextVar[];
}): string | null;
