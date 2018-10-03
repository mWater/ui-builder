import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { Schema } from "mwater-expressions";

/** Amazingly, this seems to work really good */
export default class VirtualDatabase implements Database {
  database: Database
  schema: Schema

  constructor(database: Database, schema: Schema) {
    this.database = database
    this.schema = schema
  }

  async query(options: QueryOptions): Promise<Row[]> {
    return []
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
}

// export interface Transaction {
//   /** Adds a row, returning the primary key as a promise */
//   addRow(table: string, updates: { [column: string]: any }): Promise<any>;

//   updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
//   removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;

//   commit(): Promise<any>;
// }

