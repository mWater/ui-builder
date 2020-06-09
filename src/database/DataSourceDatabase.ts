import _ from 'lodash'
import { Database, QueryOptions, DatabaseChangeListener, Transaction } from "./Database";
import { DataSource, Schema, Row } from "mwater-expressions";
import { QueryCompiler } from "./QueryCompiler";
import { createExprVariables, ContextVar } from "../widgets/blocks";

type TransactionHandler = () => Transaction

/** Database which is driven from a data source. Changes must be handled externally and updates triggered manually */
export class DataSourceDatabase implements Database {
  schema: Schema
  dataSource: DataSource
  transactionHandler?: TransactionHandler
  changeListeners: DatabaseChangeListener[]

  constructor(schema: Schema, dataSource: DataSource, transactionHandler?: TransactionHandler) {
    this.schema = schema
    this.dataSource = dataSource
    this.transactionHandler = transactionHandler
    this.changeListeners = []
  }
  
  query(options: QueryOptions, contextVars: ContextVar[], filteredContextVarValues: { [contextVarId: string]: any }) {
    const queryCompiler = new QueryCompiler(this.schema, createExprVariables(contextVars), filteredContextVarValues)
    const { jsonql, rowMapper } = queryCompiler.compileQuery(options)
    
    return new Promise<Row[]>((resolve, reject) => {
      this.dataSource.performQuery(jsonql, (error, rows) => {
        if (error) {
          reject(error)
        }
        else {
          // Transform rows to remove c_ from columns
          resolve(rows.map(rowMapper))
        }
      })
    })
  }
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) {
    this.changeListeners = _.union(this.changeListeners, [changeListener])
  }

  removeChangeListener(changeListener: DatabaseChangeListener) {
    this.changeListeners = _.difference(this.changeListeners, [changeListener])
  }

  /** Force change event to fire after clearing cache */
  triggerChange() {
    this.dataSource.clearCache()
    
    for (const changeListener of this.changeListeners) {
      changeListener()
    }
  }

  transaction(): Transaction {
    if (!this.transactionHandler) {
      throw new Error("Not implemented")
    }
    return this.transactionHandler()
  }
}