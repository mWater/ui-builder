import { ExprEvaluator, Expr } from "mwater-expressions";
/** Represents a row to be evaluated */
export interface PromiseExprEvaluatorRow {
    /** gets primary key of row */
    getPrimaryKey(): Promise<any>;
    /** gets the value of a column.
     * For joins, getField will get array of rows for 1-n and n-n joins and a row for n-1 and 1-1 joins
     */
    getField(columnId: string): Promise<any>;
}
export interface PromiseExprEvaluatorContext {
    /** current row. Optional for aggr expressions */
    row?: PromiseExprEvaluatorRow;
    /** array of rows (for aggregate expressions) */
    rows?: PromiseExprEvaluatorRow[];
}
export declare class PromiseExprEvaluator {
    private exprEvaluator;
    constructor(exprEvaluator: ExprEvaluator);
    evaluate(expr: Expr, context: PromiseExprEvaluatorContext): Promise<any>;
}
