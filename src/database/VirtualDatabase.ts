import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { Schema, Column, ExprEvaluator, ExprUtils, Expr } from "mwater-expressions";
import { PromiseExprEvaluator, PromiseExprEvaluatorRow } from "./PromiseExprEvaluator";
import * as _ from "lodash";
import { v4 as uuid } from 'uuid'
import LRU, { Cache } from 'lru-cache'
import canonical from 'canonical-json'
import { ContextVar, createExprVariables } from "../widgets/blocks";

/**
 * Database which is backed by a real database, but can accept changes such as adds, updates or removes
 * without sending them to the real database until commit is called.
 * The query results obtained from the database incorporate the changes that have been made to it (mutations).
 * commit or rollback must be called to unlisten for changes and the database should be discarded thereafter.
 */
export default class VirtualDatabase implements Database {
  database: Database
  schema: Schema
  locale: string
  mutations: Mutation[]
  changeListeners: DatabaseChangeListener[]

  /** Array of temporary primary keys that will be replaced by real ones when the insertions are committed */
  tempPrimaryKeys: string[]

  /** True when database is destroyed by commit or rollback */
  destroyed: boolean

  /** Cache of query results to increase performance. Cached by canonical json key based on query options */
  cache: Cache<string, Row[]>

  constructor(database: Database, schema: Schema, locale: string) {
    this.database = database
    this.schema = schema
    this.locale = locale

    this.mutations = []
    this.changeListeners = []
    this.tempPrimaryKeys = []
    this.destroyed = false
    this.cache = new LRU<string, Row[]>()

    database.addChangeListener(this.handleChange)
  }

  async query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }): Promise<Row[]> {
    const variables = createExprVariables(contextVars)
    const variableValues = contextVarValues
   
    const exprEval = new PromiseExprEvaluator(new ExprEvaluator(this.schema, this.locale, variables, variableValues))
    const exprUtils = new ExprUtils(this.schema, variables)

    // Create rows to evaluate
    const evalRows = (await this.queryEvalRows(options.from, options.where || null, contextVars, contextVarValues))

    // Create temporary rows to manipulate
    let tempRows: any[] = evalRows.map(r => ({ row: r }))

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
    if (options.orderBy && options.orderBy.length > 0) {
      tempRows = _.sortByOrder(tempRows, 
        options.orderBy.map((orderBy, i) => (tempRow: any) => tempRow["o" + i]),
        options.orderBy.map(orderBy => orderBy.dir))
    }

    // Limit
    if (options.limit) {
      tempRows = _.take(tempRows, options.limit)
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
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) {
    this.changeListeners = _.union(this.changeListeners, [changeListener])
  }

  removeChangeListener(changeListener: DatabaseChangeListener) {
    this.changeListeners = _.difference(this.changeListeners, [changeListener])
  }

  transaction(): Transaction {
    if (this.destroyed) {
      throw new Error("Cannot start transaction on destroyed database")
    }
    return new VirtualDatabaseTransaction(this)
  }

  /** Commit the changes that have been applied to this virtual database to the real underlying database and destroy the virtual database */
  async commit(): Promise<void> {
    if (this.mutations.length === 0) {
      this.destroyed = true
      this.database.removeChangeListener(this.handleChange)
      return
    }

    // Apply mutations in one transaction
    const txn = this.database.transaction()

    // Store mapping from temp to real primary keys
    const pkMapping = {}

    for (const mutation of this.mutations) {
      switch (mutation.type) {
        case "add":
          // Map any primary keys
          mutation.values = this.replaceTempPrimaryKeys(mutation.values, (pk) => {
            if (pkMapping[pk]) {
              return pkMapping[pk]
            }
            throw new Error("Missing mapping for " + pk)
          })

          const primaryKey = await txn.addRow(mutation.table, mutation.values)
          pkMapping[mutation.primaryKey] = primaryKey
          break
        case "update":
          // Map any primary keys
          mutation.updates = this.replaceTempPrimaryKeys(mutation.updates, (pk) => {
            if (pkMapping[pk]) {
              return pkMapping[pk]
            }
            throw new Error("Missing mapping for " + pk)
          })

          const updatePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey

          await txn.updateRow(mutation.table, updatePrimaryKey, mutation.updates)
          break
        case "remove":
          const removePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey

          await txn.removeRow(mutation.table, removePrimaryKey)
          break
      }
    }
    await txn.commit()
    this.mutations = []
    this.destroyed = true
    this.database.removeChangeListener(this.handleChange)
  }

  /** Rollback any changes and destroy the virtual database */
  rollback() {
    this.mutations = []
    this.destroyed = true
    this.database.removeChangeListener(this.handleChange)
  }

  /** Determine if a column should be included in the underlying query */
  shouldIncludeColumn(column: Column): boolean {
    // Normal columns that don't have an expression should be included
    if (column.type !== "join" && !column.expr) {
      return true
    }
    // n-1 joins should be included to get pk of joined row
    // 1-n joins that don't have an inverse column need to be included as otherwise
    // can't figure out which rows are at other end of the join
    if (column.type === "join" && (!column.join!.inverse || column.join!.type !== "1-n")) {
      return true
    }
    return false
  }
  
  /** Create the rows as needed by ExprEvaluator for a query */
  private async queryEvalRows(from: string, where: Expr, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }): Promise<PromiseExprEvaluatorRow[]> {
    // Create query with c_ for all columns, id and just the where clause
    let queryOptions: QueryOptions = {
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

    // TODO this ended up creating a "= null" condition which, when compiled, matched all rows
    // As for a long-term solution, it should probably search for any expression of "something = <temp primary key>" and replace
    // them with false.
    // // Replace any temporary primary keys with null to avoid text/integer conflicts in queries
    // queryOptions = this.replaceTempPrimaryKeys(queryOptions, () => null)

    // Perform query
    let rows: Row[] | undefined
    
    const queryCacheKey = canonical({ queryOptions: queryOptions, contextVars: contextVars, contextVarValues: contextVarValues })
    rows = this.cache.get(queryCacheKey)
    if (!rows) {
      rows = await this.database.query(queryOptions, contextVars, contextVarValues)
      this.cache.set(queryCacheKey, rows)
    }

    // Apply mutations
    rows = await this.mutateRows(rows, from, where, contextVars, contextVarValues)

    // Convert to rows as expr evaluator expects
    return rows.map(row => this.createEvalRow(row, from, contextVars, contextVarValues))
  }

  /** Replace temporary primary keys with different value */
  private replaceTempPrimaryKeys(input: any, replaceWith: (tempPk: string) => any): any {
    const escapeRegex = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

    let json = JSON.stringify(input)
    for (const tempPk of this.tempPrimaryKeys) {
      json = json.replace(new RegExp(escapeRegex(JSON.stringify(tempPk)), "g"), () => JSON.stringify(replaceWith(tempPk)))
    }
    return JSON.parse(json)
  }

  /** Create a single row structured for evaluation from a row in format { id: <primary key>, c_<column id>: value, ... } */
  private createEvalRow(row: Row, from: string, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }): PromiseExprEvaluatorRow {
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
          // Short-circuit if null/undefined
          if (row["c_" + columnId] == null) {
            return null
          }

          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "=", table: column.join!.toTable, exprs: [
              { type: "id", table: column.join!.toTable },
              { type: "literal", valueType: "id", idTable: column.join!.toTable, value: row["c_" + columnId] }
          ]}, contextVars, contextVarValues)
          return joinRows[0] || null
        }

        // For non-inverse 1-n and n-n, create rows based on key
        if (column.join!.type == "n-n" || !column.join!.inverse) {
          // Short-circuit if null/undefined
          if (row["c_" + columnId] == null || row["c_" + columnId].length == 0) {
            return []
          }

          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "= any", table: column.join!.toTable, exprs: [
              { type: "id", table: column.join!.toTable },
              { type: "literal", valueType: "id", idTable: column.join!.toTable, value: row["c_" + columnId] }
          ]}, contextVars, contextVarValues)
          return joinRows
        }

        // Inverse 1-n
        if (column.join!.type === "1-n" && column.join!.inverse) {
          const joinRows = await this.queryEvalRows(column.join!.toTable, {
            type: "op", op: "=", table: column.join!.toTable, exprs: [
              { type: "field", table: column.join!.toTable, column: column.join!.inverse! },
              { type: "literal", valueType: "id", idTable: from, value: row.id }
            ]}, contextVars, contextVarValues)
          return joinRows
        }

        throw new Error("Not implemented")
      }
    }
  }

  /** Apply all known mutations to a set of rows */
  private async mutateRows(rows: Row[], from: string, where: Expr, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }): Promise<Row[]> {
    const variables = createExprVariables(contextVars)
    const variableValues = contextVarValues

    // Copy rows to be mutated safely
    rows = rows.slice()

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

      // TODO: This is O(nxm) where n is number of rows and m
      if (mutation.type === "update") {
        for (let i = 0 ; i < rows.length ; i++) {
          if (rows[i].id === mutation.primaryKey) {
            const update = _.mapKeys(mutation.updates, (v, k) => "c_" + k)
            rows[i] = { ...rows[i], ...update }
          }
        }
      }

      if (mutation.type === "remove") {
        rows = rows.filter(row => row.id !== mutation.primaryKey)
      }
    }

    // Re-filter rows
    if (where) {
      const filteredRows: Row[] = []

      const exprEval = new PromiseExprEvaluator(new ExprEvaluator(this.schema, this.locale, variables, variableValues))
      for (const row of rows) {
        const evalRow = this.createEvalRow(row, from, contextVars, contextVarValues)
        if (await exprEval.evaluate(where, { row: evalRow })) {
          filteredRows.push(row)
        }
      }
      rows = filteredRows
    }

    return rows
  }

  private handleChange = () => {
    for (const changeListener of this.changeListeners) {
      changeListener()
    }
  }
}

class VirtualDatabaseTransaction implements Transaction {
  virtualDatabase: VirtualDatabase

  /** Uncommitted mutations */
  mutations: Mutation[]

  constructor(virtualDatabase: VirtualDatabase) {
    this.virtualDatabase = virtualDatabase
    this.mutations = []
  }

  addRow(table: string, values: { [column: string]: any }) {
    const primaryKey = uuid()
    
    // Save temporary primary key
    this.virtualDatabase.tempPrimaryKeys.push(primaryKey)

    this.mutations.push({
      type: "add",
      table: table,
      primaryKey: primaryKey,
      values: values
    })
    return Promise.resolve(primaryKey)
  }

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }) {
    this.mutations.push({
      type: "update",
      table: table,
      primaryKey: primaryKey,
      updates: updates
    })
    return Promise.resolve()
  }

  removeRow(table: string, primaryKey: any) {
    // Remove locally if local
    if (this.virtualDatabase.tempPrimaryKeys.includes(primaryKey)) {
      this.mutations = this.mutations.filter(m => m.primaryKey !== primaryKey)
      this.virtualDatabase.mutations = this.virtualDatabase.mutations.filter(m => m.primaryKey !== primaryKey)
      return Promise.resolve()
    }

    this.mutations.push({
      type: "remove",
      table: table,
      primaryKey: primaryKey
    })
    return Promise.resolve()
  }

  commit(): Promise<void> {
    // Clear mutations and transfer to main database
    for (const mutation of this.mutations) {
      if (mutation.type == "add") {
        // Add mutations are always performed
        this.virtualDatabase.mutations.push(mutation)
      }
      else if (mutation.type == "update") {
        // Combine with add if present
        const existingAdd = this.virtualDatabase.mutations.find(m => 
          m.table == mutation.table 
          && m.type == "add" 
          && m.primaryKey == mutation.primaryKey) as AddMutation | undefined

        if (existingAdd) {
          existingAdd.values = { ...existingAdd.values, ...mutation.updates } 
          continue
        }

        // Combine with update if present
        const existingUpdate = this.virtualDatabase.mutations.find(m => 
          m.table == mutation.table 
          && m.type == "update" 
          && m.primaryKey == mutation.primaryKey) as UpdateMutation | undefined

        if (existingUpdate) {
          existingUpdate.updates = { ...existingUpdate.updates, ...mutation.updates }
          continue
        }

        this.virtualDatabase.mutations.push(mutation)
      }
      else if (mutation.type == "remove") {
        // Remove add if present
        // Combine with add if present
        const existingAddIndex = this.virtualDatabase.mutations.findIndex(m => 
          m.table == mutation.table 
          && m.type == "add" 
          && m.primaryKey == mutation.primaryKey)

        if (existingAddIndex >= 0) {
          this.virtualDatabase.mutations.splice(existingAddIndex, 1)
          continue
        }

        this.virtualDatabase.mutations.push(mutation)
      }
    }
    this.mutations = []

    for (const changeListener of this.virtualDatabase.changeListeners) {
      changeListener()
    }

    return Promise.resolve()
  }
}

export type Mutation = AddMutation | UpdateMutation | RemoveMutation

export interface AddMutation {
  type: "add",
  table: string,
  primaryKey: any,
  values: { [column: string]: any }
}

export interface UpdateMutation {
  type: "update",
  table: string,
  primaryKey: any,
  updates: { [column: string]: any }
}

export interface RemoveMutation {
  type: "remove",
  table: string,
  primaryKey: any
}