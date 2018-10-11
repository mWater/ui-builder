import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { DataSource, Schema } from "mwater-expressions";
import { QueryCompiler } from "./QueryCompiler";
import { createExprVariables, ContextVar } from "../widgets/blocks";


export class DataSourceDatabase implements Database {
  schema: Schema
  dataSource: DataSource

  constructor(schema: Schema, dataSource: DataSource) {
    this.schema = schema
    this.dataSource = dataSource
  }
  
  query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: { [contextVarId: string]: any }) {
    const queryCompiler = new QueryCompiler(this.schema, createExprVariables(contextVars), contextVarValues)
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
    // TODO
  }

  removeChangeListener(changeListener: DatabaseChangeListener){
    // TODO
  }

  transaction(): Transaction {
    throw new Error("Not implemented")
  }
}