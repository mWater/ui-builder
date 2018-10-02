import { Expr } from 'mwater-expressions'

export enum OrderByDir {
  asc = "asc",
  desc = "desc"
}

export interface OrderBy {
  expr: Expr
  dir: OrderByDir
}

export interface QueryOptions {
  select: { [alias: string]: Expr },
  from: string,       // Table that this is from
  where?: Expr,       // Where clause
  orderBy?: OrderBy[], 
  limit?: number | null
}

export interface Row {
  [alias: string]: any 
}

export type DatabaseChangeListener = () => void

export interface Database {
  query(options: QueryOptions): Promise<Row[]>;
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener): void;
  removeChangeListener(changeListener: DatabaseChangeListener): void;

  transaction(): Transaction
}

export interface Transaction {
  /** Adds a row, returning the primary key as a promise */
  addRow(table: string, updates: { [column: string]: any }): Promise<any>;

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
  removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;

  commit(): Promise<any>;
}

// interface DatabaseBatch {
//   addRow(table: string, updates: { [column: string]: any }): Promise<any>;

//   updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
//   removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;

//   complete(): void;
// }

export class MockDatabase implements Database {
  async query(options: QueryOptions) { return [] }
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: DatabaseChangeListener) { return }
  removeChangeListener(changeListener: DatabaseChangeListener) { return }

  transaction() { return new MockTransaction() }
}

class MockTransaction implements Transaction {
  /** Adds a row, returning the primary key as a promise */
  async addRow(table: string, updates: { [column: string]: any }) { return null }

  async updateRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }
  
  async removeRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }

  async commit() { return }
}