import { Database, QueryOptions, Row, DatabaseChangeListener } from "./Database";
import { DataSource, JsonQL, ExprUtils, Schema, ExprCompiler } from "mwater-expressions";
import { QueryCompiler } from "./QueryCompiler";


export class DataSourceDatabase implements Database {
  schema: Schema
  dataSource: DataSource
  queryCompiler: QueryCompiler

  constructor(schema: Schema, dataSource: DataSource, queryCompiler: QueryCompiler) {
    this.schema = schema
    this.dataSource = dataSource
    this.queryCompiler = queryCompiler
  }
  
  async query(options: QueryOptions) {
    const jsonql = this.queryCompiler.compileQuery(options)
    
    return await new Promise<Row[]>((resolve, reject) => {
      this.dataSource.performQuery(jsonql, (error, rows) => {
        if (error) {
          reject(error)
        }
        else {
          // Transform rows to remove c_ from columns
          resolve(rows.map(row => Object.entries(row).filter((pair: any[]) => pair[0].startsWith("c_")).reduce((acc: any, val: any) => (acc[val[0].substr(2)] = val[1], acc), {})))
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

  /** Adds a row, returning the primary key as a promise */
  addRow(table: string, updates: { [column: string]: any }): Promise<any> {
    throw new Error("TODO")
  }

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void> {
    throw new Error("TODO")
  }
  
  removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void> {
    throw new Error("TODO")
  }

}