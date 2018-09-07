import { Expr } from 'mwater-expressions'

export enum OrderDir {
  asc = "asc",
  desc = "desc"
}

export interface Order {
  expr: Expr,
  dir: OrderDir
}

export interface QueryOptions {
  select: { [alias: string]: Expr },
  from: string,       // Table that this is from
  where?: Expr,       // Where clause
  order?: Order[], 
  limit?: number
}

// export interface QueryOneOptions {
//   select: { [alias: string]: Expr },
//   from: string,       // Table that this is from
//   where?: Expr,       // Where clause
//   order?: Order[]
// }

interface Row {
  [alias: string]: any 
}

type ChangeListener = () => void

export interface Database {
  query(options: QueryOptions): Promise<Row[]>;
  
  /** Adds a listener which is called with each change to the database */
  addChangeListener(changeListener: ChangeListener): void;
  removeChangeListener(changeListener: ChangeListener): void;

  /** Adds a row, returning the primary key as a promise */
  addRow(table: string, updates: { [column: string]: any }): Promise<any>;

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
  removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;

  // batch(): DatabaseBatch;
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
  addChangeListener(changeListener: ChangeListener) { return }
  removeChangeListener(changeListener: ChangeListener) { return }

  /** Adds a row, returning the primary key as a promise */
  async addRow(table: string, updates: { [column: string]: any }) { return null }

  async updateRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }
  
  async removeRow(table: string, primaryKey: any, updates: { [column: string]: any }) { return }
}