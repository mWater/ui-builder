import _ from 'lodash'
import { Expr, PromiseExprEvaluatorRow, PromiseExprEvaluator, Row } from 'mwater-expressions'
import { ContextVar } from '../widgets/blocks';
import { QueryOptions } from "./Database"
import { ExprUtils } from "mwater-expressions"

export type OrderByDir = "asc" | "desc"

export interface OrderBy {
  expr: Expr
  dir: OrderByDir
}

/** Specification for a query that is made to a database */
export interface QueryOptions {
  select: { [alias: string]: Expr },
  distinct?: boolean,
  from: string,       // Table that this is from
  where?: Expr,       // Where clause
  orderBy?: OrderBy[], 
  limit?: number | null
}

export type DatabaseChangeListener = () => void

/** An abstraction of a database which allows querying using expressions. May be the live
 * database or a virtual database which is applying local changes that have not been submitted
 * to the server (see VirtualDatabase)
 */
export interface Database {
  query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }): Promise<Row[]>;
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener): void;
  removeChangeListener(changeListener: DatabaseChangeListener): void;

  transaction(): Transaction
}

/** Transaction of actions to apply to the database */
export interface Transaction {
  /** Adds a row, returning the primary key as a promise */
  addRow(table: string, values: { [column: string]: any }): Promise<any>;

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
  removeRow(table: string, primaryKey: any): Promise<void>;

  commit(): Promise<any>;
}

/** Database which performs no actions and always returns blank query results */
export class NullDatabase implements Database {
  async query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }) { return [] }
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) { return }
  removeChangeListener(changeListener: DatabaseChangeListener) { return }

  transaction() { return new NullTransaction() }
}

/** Transaction which performs no actions */
class NullTransaction implements Transaction {
  /** Adds a row, returning the primary key as a promise */
  async addRow(table: string, values: { [column: string]: any }) { return null }

  async updateRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }
  
  async removeRow(table: string, primaryKey: any) { return }

  async commit() { return }
}

/** Evaluates a database query given a set of rows of the type that are needed by the ExprEvaluator.
 * Useful for performing a query on a non-SQL database, e.g. in memory or MongoDb, etc.
 */
export async function performEvalQuery(options: {
  evalRows: PromiseExprEvaluatorRow[],
  query: QueryOptions,
  exprEval: PromiseExprEvaluator,
  exprUtils: ExprUtils
}): Promise<Row[]> {
  const { query, evalRows, exprEval, exprUtils } = options

  // Create temporary rows to manipulate
  let tempRows: any[] = evalRows.map(r => ({ row: r }))

  // Filter by where clause
  if (query.where) {
    for (const tempRow of tempRows) {
      tempRow["where"] = await exprEval.evaluate(query.where, { row: tempRow.row })
    }
    tempRows = tempRows.filter(row => row["where"] == true)
  }

  // Get list of selects in { id, expr, isAggr } format
  const selects = Object.keys(query.select).map(id => ({
    id: id,
    expr: query.select[id],
    isAggr: exprUtils.getExprAggrStatus(query.select[id]) === "aggregate"
  }))

  // Get list of orderBys in { expr, isAggr } format
  const orderBys = (query.orderBy || []).map(orderBy => ({
    expr: orderBy.expr,
    isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
  }))

  // Evaluate all non-aggr selects and non-aggr orderbys
  for (const tempRow of tempRows) {
    for (let i = 0 ; i < selects.length ; i++) {
      if (!selects[i].isAggr) {
        tempRow["s" + i] = await exprEval.evaluate(selects[i].expr, { row: tempRow.row })
      }
    }

    for (let i = 0 ; i < orderBys.length ; i++) {
      if (!orderBys[i].isAggr) {
        tempRow["o" + i] = await exprEval.evaluate(orderBys[i].expr, { row: tempRow.row })
      }
    }
  }

  // If any aggregate expressions, perform transform to aggregate
  if (selects.find(s => s.isAggr) || orderBys.find(o => o.isAggr)) {
    // Group by all non-aggregate selects and non-aggregate order bys
    const groups = _.groupBy(tempRows, tempRow => {
      // Concat stringified version of all non-aggr values
      let key = ""
      for (let i = 0 ; i < selects.length ; i++) {
        if (!selects[i].isAggr) {
          key += ":" + tempRow["s" + i]
        }
      }

      for (let i = 0 ; i < orderBys.length ; i++) {
        if (!orderBys[i].isAggr) {
          key += ":" + tempRow["o" + i]
        }
      }
      return key
    })

    // Evaluate each group, adding aggregate expressions to first item of each group
    for (const group of Object.values(groups)) {
      const tempRow = group[0]

      // Evaluate all aggr selects and aggr orderbys
      for (let i = 0 ; i < selects.length ; i++) {
        if (selects[i].isAggr) {
          tempRow["s" + i] = await exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: group.map(r => r.row) })
        }
      }

      for (let i = 0 ; i < orderBys.length ; i++) {
        if (orderBys[i].isAggr) {
          tempRow["o" + i] = await exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: group.map(r => r.row) })
        }
      }
    }

    // Flatten groups into single rows each
    tempRows = _.map(Object.values(groups), (group) => group[0])
  }

  // Order by
  if (query.orderBy && query.orderBy.length > 0) {
    tempRows = _.sortByOrder(tempRows, 
      query.orderBy.map((orderBy, i) => (tempRow: any) => tempRow["o" + i]),
      query.orderBy.map(orderBy => orderBy.dir))
  }

  // Limit
  if (query.limit) {
    tempRows = _.take(tempRows, query.limit)
  }

  // Create selects
  const projectedRows = []
  for (const tempRow of tempRows) {
    const projectedRow = {}

    // Project each one
    for (let i = 0 ; i < selects.length ; i++) {
      projectedRow[selects[i].id] = tempRow["s" + i]
    }

    projectedRows.push(projectedRow)
  }

  return projectedRows
}