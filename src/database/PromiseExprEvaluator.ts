import { ExprEvaluator, ExprEvaluatorContext, Expr, ExprEvaluatorRow } from "mwater-expressions";

/** Represents a row to be evaluated */
export interface PromiseExprEvaluatorRow {
  /** gets primary key of row */
  getPrimaryKey(): Promise<any>

  /** gets the value of a column. 
   * For joins, getField will get array of rows for 1-n and n-n joins and a row for n-1 and 1-1 joins
   */
  getField(columnId: string): Promise<any>
}

export interface PromiseExprEvaluatorContext {
  /** current row. Optional for aggr expressions */
  row?: PromiseExprEvaluatorRow
  /** array of rows (for aggregate expressions) */
  rows?: PromiseExprEvaluatorRow[]
}

export class PromiseExprEvaluator {
  exprEvaluator: ExprEvaluator

  constructor(exprEvaluator: ExprEvaluator) {
    this.exprEvaluator = exprEvaluator
  }

  evaluate(expr: Expr, context: PromiseExprEvaluatorContext): Promise<any> {
    const innerContext: ExprEvaluatorContext = {}

    const callbackifyRow = (row: PromiseExprEvaluatorRow): ExprEvaluatorRow => {
      return {
        getPrimaryKey: (callback: (error: any, value?: any) => void) => {
          row.getPrimaryKey().then((value) => callback(null, value), (error) => callback(error))
        },
        getField: (columnId: string, callback: (error: any, value?: any) => void) => {
          row.getField(columnId).then((value) => callback(null, value), (error) => callback(error))
        }
      }
    }

    if (context.row) {
      innerContext.row = callbackifyRow(context.row)
    }
    if (context.rows) {
      innerContext.rows = context.rows.map(r => callbackifyRow(r))
    }
    return new Promise((resolve, reject) => {
      this.exprEvaluator.evaluate(expr, innerContext, (error, value) => {
        if (error) {
          reject(error)
          return
        }
        resolve(value)
      })
    })
  }
}