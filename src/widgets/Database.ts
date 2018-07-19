import Expr from './Expr'

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

export interface QueryOneOptions {
  select: { [alias: string]: Expr },
  from: string,       // Table that this is from
  where?: Expr,       // Where clause
  order?: Order[]
}

interface Row {
  [alias: string]: any 
}

export interface Database {
  query(options: QueryOptions): Promise<Row[]>;
  queryOne(options: QueryOneOptions): Promise<Row>;
  
  watchQuery(options: QueryOptions, onChange: () => void): void;
  watchQueryOne(options: QueryOneOptions, onChange: () => void): void;

  
  // Adds a row, returning the primary key as a promise
  addRow(table: string, updates: { [column: string]: any }): Promise<any>;

  updateRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
  
  removeRow(table: string, primaryKey: any, updates: { [column: string]: any }): Promise<void>;
}
