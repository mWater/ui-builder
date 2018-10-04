import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { Schema, Column, ExprEvaluator, ExprUtils, Expr } from "mwater-expressions";
import { PromiseExprEvaluator, PromiseExprEvaluatorRow } from "./PromiseExprEvaluator";
import * as _ from "lodash";
import * as uuid from 'uuid/v4'

export default class VirtualDatabase implements Database {
  database: Database
  schema: Schema
  locale: string
  mutations: Mutation[]

  constructor(database: Database, schema: Schema, locale: string) {
    this.database = database
    this.schema = schema
    this.locale = locale

    this.mutations = []
  }

  async query(options: QueryOptions): Promise<Row[]> {
    // Create rows to evaluate
    let evalRows: any[] = (await this.queryEvalRows(options.from, options.where)).map(r => ({ row: r }))

    const exprUtils = new ExprUtils(this.schema)
    
    // Get list of selects in { id, expr, isAggr } format
    const selects = Object.keys(options.select).map(id => ({
      id: id,
      expr: options.select[id],
      isAggr: exprUtils.getExprAggrStatus(options.select[id]) === "aggregate"
    }))

    // Get list of orderBys in { expr, isAggr } format
    const orderBys = (options.orderBy || []).map(orderBy => ({
      expr: orderBy.expr,
      isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
    }))

    const exprEval = new PromiseExprEvaluator(new ExprEvaluator(this.schema, this.locale))
    
    // Evaluate all non-aggr selects and non-aggr orderbys
    for (const evalRow of evalRows) {
      for (let i = 0 ; i < selects.length ; i++) {
        if (!selects[i].isAggr) {
          evalRow["s" + i] = await exprEval.evaluate(selects[i].expr, { row: evalRow.row })
        }
      }

      for (let i = 0 ; i < orderBys.length ; i++) {
        if (!orderBys[i].isAggr) {
          evalRow["o" + i] = await exprEval.evaluate(orderBys[i].expr, { row: evalRow.row })
        }
      }
    }

    // If any aggregate expressions, perform transform to aggregate
    if (selects.find(s => s.isAggr) || orderBys.find(o => o.isAggr)) {
      // Group by all non-aggregate selects and non-aggregate order bys
      const groups = _.groupBy(evalRows, evalRow => {
        // Concat stringified version of all non-aggr values
        let key = ""
        for (let i = 0 ; i < selects.length ; i++) {
          if (!selects[i].isAggr) {
            key += ":" + evalRow["s" + i]
          }
        }

        for (let i = 0 ; i < orderBys.length ; i++) {
          if (!orderBys[i].isAggr) {
            key += ":" + evalRow["o" + i]
          }
        }
        return key
      })

      // Evaluate each group, adding aggregate expressions to first item of each group
      for (const group of Object.values(groups)) {
        const evalRow = group[0]

        // Evaluate all aggr selects and aggr orderbys
        for (let i = 0 ; i < selects.length ; i++) {
          if (selects[i].isAggr) {
            evalRow["s" + i] = await exprEval.evaluate(selects[i].expr, { row: evalRow.row, rows: group.map(r => r.row) })
          }
        }

        for (let i = 0 ; i < orderBys.length ; i++) {
          if (orderBys[i].isAggr) {
            evalRow["o" + i] = await exprEval.evaluate(orderBys[i].expr, { row: evalRow.row, rows: group.map(r => r.row) })
          }
        }
      }

      // Flatten groups into single rows each
      evalRows = _.map(Object.values(groups), (group) => group[0])
    }

    // Order by
    if (options.orderBy && options.orderBy.length > 0) {
      evalRows = _.sortByOrder(evalRows, 
        options.orderBy.map((orderBy, i) => (evalRow: any) => evalRow["o" + i]),
        options.orderBy.map(orderBy => orderBy.dir))
    }

    // Limit
    if (options.limit) {
      evalRows = _.take(evalRows, options.limit)
    }

    // Create selects
    const projectedRows = []
    for (const evalRow of evalRows) {
      const projectedRow = {}

      // Project each one
      for (let i = 0 ; i < selects.length ; i++) {
        projectedRow[selects[i].id] = evalRow["s" + i]
      }

      projectedRows.push(projectedRow)
    }

    return projectedRows
  }
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) {
    return
  }

  removeChangeListener(changeListener: DatabaseChangeListener) {
    return
  }

  transaction(): Transaction {
    // TODO
    return {
      addRow: (table: string, values: { [column: string]: any }) => {
        const primaryKey = uuid()
        // TODO
        this.mutations.push({
          type: "add",
          table: table,
          primaryKey: primaryKey,
          values: values
        })
        return Promise.resolve(primaryKey)
      },
      updateRow: (table: string, primaryKey: any, updates: { [column: string]: any }) => {
        this.mutations.push({
          type: "update",
          table: table,
          primaryKey: primaryKey,
          updates: updates
        })
        return Promise.resolve()
      },
      removeRow: (table: string, primaryKey: any) => {
        this.mutations.push({
          type: "remove",
          table: table,
          primaryKey: primaryKey
        })
        return Promise.resolve()
      },
      commit: () => Promise.resolve()
    }
  }

  /** Commit the changes that have been applied to this virtual database to the real underlying database */
  commit(): void {
    // TODO
    return
  }

  // Create the rows as needed by ExprEvaluator for a query
  /** Determine if a column should be included in the underlying query */
  shouldIncludeColumn(column: Column): boolean {
    if (column.type !== "join" && !column.expr) {
      return true
    }
    if (column.type === "join" && (!column.join!.inverse || column.join!.type !== "1-n")) {
      return true
    }
    return false
  }

  private async queryEvalRows(from: string, where?: Expr): Promise<PromiseExprEvaluatorRow[]> {
    // Create query with c_ for all columns, id and just the where clause
    const queryOptions: QueryOptions = {
      select: {
        id: { type: "id", table: from }
      },
      from: from,
      where: where
    }

    // Add a select for each column
    for (const column of this.schema.getColumns(from)) {
      if (this.shouldIncludeColumn(column)) {
        queryOptions.select["c_" + column.id] = { type: "field", table: from, column: column.id }
      }
    }

    // Perform query
    let rows = await this.database.query(queryOptions)

    // Apply mutations
    rows = await this.mutateRows(rows, from, where)

    // Convert to rows as expr evaluator expects
    return rows.map(row => this.createEvalRow(row, from))
  }

  private createEvalRow(row: Row, from: string): PromiseExprEvaluatorRow {
    return {
      getPrimaryKey: () => Promise.resolve(row.id),
      getField: async (columnId: string) => {
        const column = this.schema.getColumn(from, columnId)!

        // For non-joins, return simple value
        if (column.type !== "join") {
          return row["c_" + columnId]
        }

        // For n-1 and 1-1 joins, create row
        if (column.join!.type === "n-1" || column.join!.type === "1-1") {
          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "=", table: column.join!.toTable, exprs: [
              { type: "id", table: column.join!.toTable },
              { type: "literal", valueType: "id", idTable: column.join!.toTable, value: row["c_" + columnId] }
          ]})
          return joinRows[0] || null
        }

        // For non-inverse 1-n and n-n, create rows based on key
        if (column.join!.type !== "1-n" || !column.join!.inverse) {
          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "=", table: column.join!.toTable, exprs: [
              { type: "id", table: column.join!.toTable },
              { type: "literal", valueType: "id", idTable: column.join!.toTable, value: row["c_" + columnId] }
          ]})
          return joinRows
        }

        // Inverse 1-n
        if (column.join!.type === "1-n" && column.join!.inverse) {
          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "=", table: column.join!.toTable, exprs: [
              { type: "field", table: column.join!.toTable, column: column.join!.inverse! },
              { type: "literal", valueType: "id", idTable: from, value: row.id }
            ]})
          return joinRows
        }

        throw new Error("Not implemented")
      }
    }
  }

  /** Apply all known mutations to a set of rows */
  private async mutateRows(rows: Row[], from: string, where?: Expr): Promise<Row[]> {
    for (const mutation of this.mutations) {
      // Only from correct table
      if (mutation.table !== from) {
        continue
      }

      if (mutation.type === "add") {
        const newRow = _.mapKeys(mutation.values, (v, k) => "c_" + k)
        rows.push({
          id: mutation.primaryKey,
          ...newRow
        })
      }
    }

    // Re-filter rows
    if (where) {
      const filteredRows: Row[] = []

      const exprEval = new PromiseExprEvaluator(new ExprEvaluator(this.schema))
      for (const row of rows) {
        const evalRow = this.createEvalRow(row, from)
        if (await exprEval.evaluate(where, { row: evalRow })) {
          filteredRows.push(row)
        }
      }
      rows = filteredRows
    }

    return rows
  }
}

type Mutation = AddMutation | UpdateMutation | RemoveMutation

interface AddMutation {
  type: "add",
  table: string,
  primaryKey: any,
  values: { [column: string]: any }
}

interface UpdateMutation {
  type: "update",
  table: string,
  primaryKey: any,
  updates: { [column: string]: any }
}

interface RemoveMutation {
  type: "remove",
  table: string,
  primaryKey: any
}