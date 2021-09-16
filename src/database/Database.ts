import _ from 'lodash'
import { Expr, PromiseExprEvaluatorRow, PromiseExprEvaluator, Row, LiteralExpr } from 'mwater-expressions'
import { ContextVar } from '../widgets/blocks';
import stable from 'stable'
import { ExprUtils } from "mwater-expressions"
import { useEffect, useState, useCallback } from 'react';

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
  /** Perform a query. Note: contextVarValues should have filters baked into them. Use getFilteredContextVarValues(...) */
  query(options: QueryOptions, contextVars: ContextVar[], filteredContextVarValues: { [contextVarId: string]: any }): Promise<Row[]>

  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener): void
  removeChangeListener(changeListener: DatabaseChangeListener): void

  /** Start a transaction */
  transaction(): Transaction

  /** Trigger all change listeners to perform a refresh. Automatically done after transaction completion */
  refresh(): void
}

/** Transaction of actions to apply to the database */
export interface Transaction {
  /** Adds a row, returning a temporary primary key as a promise. This 
   * primary key is only valid within the transaction. The commit will 
   * return the actual new primary key.
   */
  addRow(table: string, values: { [column: string]: any }): Promise<any>

  /** Updates a row */
  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>
  
  /** Removes a row */
  removeRow(table: string, primaryKey: any): Promise<void>

  /** Commits the transaction, returning an array of primary keys (for add mutations) and null otherwise.
   * For example, if there are two adds and a remove, the returned array will contain [<primary key1>, <primary key2>, null]
   */
  commit(): Promise<any[]>
}

/** Database which performs no actions and always returns blank query results */
export class NullDatabase implements Database {
  async query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }) { return [] }
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) { return }
  removeChangeListener(changeListener: DatabaseChangeListener) { return }

  transaction() { return new NullTransaction() }

  refresh() { return }
}

/** Transaction which performs no actions */
class NullTransaction implements Transaction {
  /** Adds a row, returning the primary key as a promise */
  async addRow(table: string, values: { [column: string]: any }) { return null }

  async updateRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }
  
  async removeRow(table: string, primaryKey: any) { return }

  async commit() { return [] }
}

/** Evaluates a database query given a set of rows of the type that are needed by the PromiseExprEvaluator.
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

  // Filter by where clause (in parallel)
  if (query.where) {
    const contextRows = tempRows.map(tr => tr.row)
    const wherePromises = tempRows.map(tempRow => exprEval.evaluate(query.where!, { row: tempRow.row, rows: contextRows }))
    const whereValues = await Promise.all<boolean>(wherePromises)
    tempRows = tempRows.filter((row, index) => whereValues[index] == true)
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
  const contextRows = tempRows.map(tr => tr.row)
  for (const tempRow of tempRows) {
    for (let i = 0 ; i < selects.length ; i++) {
      if (!selects[i].isAggr) {
        tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: contextRows })
      }
    }

    for (let i = 0 ; i < orderBys.length ; i++) {
      if (!orderBys[i].isAggr) {
        tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: contextRows })
      }
    }
  }

  // Evaluate promises
  for (const tempRow of tempRows) {
    for (let i = 0 ; i < selects.length ; i++) {
      if (!selects[i].isAggr) {
        tempRow["s" + i] = await tempRow["s" + i]
      }
    }

    for (let i = 0 ; i < orderBys.length ; i++) {
      if (!orderBys[i].isAggr) {
        tempRow["o" + i] = await tempRow["o" + i]
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
          tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: group.map(r => r.row) })
        }
      }

      for (let i = 0 ; i < orderBys.length ; i++) {
        if (orderBys[i].isAggr) {
          tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: group.map(r => r.row) })
        }
      }
    }

    // Evaluate promises
    for (const group of Object.values(groups)) {
      const tempRow = group[0]

      // Evaluate all aggr selects and aggr orderbys
      for (let i = 0 ; i < selects.length ; i++) {
        if (selects[i].isAggr) {
          tempRow["s" + i] = await tempRow["s" + i]
        }
      }

      for (let i = 0 ; i < orderBys.length ; i++) {
        if (orderBys[i].isAggr) {
          tempRow["o" + i] = await tempRow["o" + i]
        }
      }
    }

    // Flatten groups into single rows each
    tempRows = _.map(Object.values(groups), (group) => group[0])
  }

  // If all aggregate and no rows, create single row to mirror SQL behaviour of creating single evaluated row
  if (selects.every(s => s.isAggr) && orderBys.every(o => o.isAggr) && tempRows.length == 0) {
    const tempRow: any = {}

    // Evaluate all selects and orderbys
    for (let i = 0 ; i < selects.length ; i++) {
      tempRow["s" + i] = await exprEval.evaluate(selects[i].expr, { rows: [] })
    }

    for (let i = 0 ; i < orderBys.length ; i++) {
      tempRow["o" + i] = await exprEval.evaluate(orderBys[i].expr, { rows: [] })
    }

    tempRows.push(tempRow)
  }

  // Order by
  if (query.orderBy && query.orderBy.length > 0) {
    // Sort by orders in reverse to prioritize first
    for (let i = query.orderBy.length - 1 ; i >= 0 ; i--) {
      tempRows = stableSort(tempRows, (tempRow: any) => tempRow["o" + i], query.orderBy[i].dir)
    }
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

/** Determine if a where clause expression filters by primary key, and if so, return the key */
export function getWherePrimaryKey(where?: Expr): any {
  if (!where) {
    return null
  }

  // Only match if is a single expression that uses =
  if (where.type == "op" && where.op == "=" && where.exprs[0]!.type == "id" && where.exprs[1]!.type == "literal") {
    return (where.exprs[1] as LiteralExpr).value
  }

  // And expressions that are collapsible are ok
  if (where.type == "op" && where.op == "and" && where.exprs.length == 1) {
    return getWherePrimaryKey(where.exprs[0])
  }

  return null
}

/** Determine if a query is aggregate (either select or order clauses) */
export function isQueryAggregate(query: QueryOptions, exprUtils: ExprUtils) {
  for (const select of Object.values(query.select)) {
    if (exprUtils.getExprAggrStatus(select) === "aggregate"){
      return true
    }
  }

  for (const orderBy of query.orderBy || []) {
    if (exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"){
      return true
    }
  }
  return false
}

/** Stable sort on field */
export function stableSort<T>(items: T[], iteratee: (item: T) => any, direction: "asc" | "desc") {
  return stable(items, (a, b) => direction == "asc" ? normalCompare(iteratee(a), iteratee(b)) : normalCompare(iteratee(b), iteratee(a)))
}
  
/** Compare two values in normal sense of the word (numbers as numbers, strings as strings with locale) */
function normalCompare(a: any, b: any): number {
  // Null go to last
  if (a == null && b == null) {
    return 0
  }
  else if (a == null) {
    return 1
  }
  else if (b == null) {
    return -1
  }
  
  if (typeof a == "number" && typeof b == "number") {
    return a > b ? 1 : (a < b ? -1 : 0)
  }
  return String(a).localeCompare(b)
}

/** Hook to listen for database changes. Returns an integer that increments with each change */
export function useDatabaseChangeListener(database: Database) {
  const [incr, setIncr] = useState(0)

  const listener = useCallback(() => {
    setIncr(cur => cur + 1)
  }, [])

  useEffect(() => {
    database.addChangeListener(listener)
    return () => {
      database.removeChangeListener(listener)
    }
  }, [database])

  return incr
}