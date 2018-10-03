import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { Schema, Column, ExprEvaluator } from "mwater-expressions";
import { PromiseExprEvaluator, PromiseExprEvaluatorRow } from "./PromiseExprEvaluator";

/** Amazingly, this seems to work really good */
export default class VirtualDatabase implements Database {
  database: Database
  schema: Schema
  locale: string

  constructor(database: Database, schema: Schema, locale: string) {
    this.database = database
    this.schema = schema
    this.locale = locale
  }

  /** Determine if a column should be included in the underlying query */
  shouldIncludeColumn(column: Column): boolean {
    if (column.type !== "join" && !column.expr) {
      return true
    }
    if (column.type === "join" && !column.join!.inverse) {
      return true
    }
    return false
  }

  async query(options: QueryOptions): Promise<Row[]> {
    // Create query with c_ for all columns, id and just the where clause
    const queryOptions: QueryOptions = {
      select: {
        id: { type: "id", table: options.from }
      },
      from: options.from,
      where: options.where
    }

    // Add a select for each column
    for (const column of this.schema.getColumns(options.from)) {
      if (this.shouldIncludeColumn(column)) {
        queryOptions.select["c_" + column.id] = { type: "field", table: options.from, column: column.id }
      }
    }

    // Perform query
    const rows = await this.database.query(queryOptions)
    
    // Order by
    
    // Limit

    const exprEval = new PromiseExprEvaluator(new ExprEvaluator(this.schema, this.locale))

    // Create selects
    const projectedRows = []
    for (const row of rows) {
      const evalRow: PromiseExprEvaluatorRow = {
        getPrimaryKey: () => Promise.resolve(row.id),
        getField: (columnId: string) => Promise.resolve(row["c_" + columnId])
      }
      const projectedRow = {}

      // Project each one
      for (const key of Object.keys(options.select)) {
        projectedRow[key] = await exprEval.evaluate(options.select[key], { row: evalRow })
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
    throw new Error("Not implemented")
  }

  /** Commit the changes that have been applied to this virtual database to the real underlying database */
  commit(): void {
    return
  }
}

// export interface Transaction {
//   /** Adds a row, returning the primary key as a promise */
//   addRow(table: string, updates: { [column: string]: any }): Promise<any>;

//   updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
//   removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;

//   commit(): Promise<any>;
// }

