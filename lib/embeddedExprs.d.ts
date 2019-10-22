import { Expr, Schema } from "mwater-expressions";
import { ContextVar } from "./widgets/blocks";
import { default as d3Format } from 'd3-format';
/** Expression which is embedded in the text string */
export interface EmbeddedExpr {
    /** Context variable (row or rowset) to use for expression */
    contextVarId: string | null;
    /** Expression to be displayed */
    expr: Expr;
    /** d3 format of expression for numbers, moment.js format for date (default ll) and datetime (default lll)  */
    format: string | null;
}
/** Format an embedded string which is a string with {0}, {1}, etc. to be replaced by expressions */
export declare const formatEmbeddedExprString: (options: {
    /** text with {0}, {1}... embedded */
    text: string;
    /** Expressions to be substituted in */
    embeddedExprs: EmbeddedExpr[];
    /** Values of expressions */
    exprValues: any[];
    schema: Schema;
    contextVars: ContextVar[];
    locale: string;
    formatLocale?: d3Format.FormatLocaleObject | undefined;
}) => string;
/** Validate embedded expressions, returning null if ok, message otherwise */
export declare const validateEmbeddedExprs: (options: {
    /** Expressions to be substituted in */
    embeddedExprs: EmbeddedExpr[];
    schema: Schema;
    contextVars: ContextVar[];
}) => string | null;
