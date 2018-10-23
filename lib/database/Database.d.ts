import { Expr } from 'mwater-expressions';
import { ContextVar } from '../widgets/blocks';
export declare type OrderByDir = "asc" | "desc";
export interface OrderBy {
    expr: Expr;
    dir: OrderByDir;
}
export interface QueryOptions {
    select: {
        [alias: string]: Expr;
    };
    distinct?: boolean;
    from: string;
    where?: Expr;
    orderBy?: OrderBy[];
    limit?: number | null;
}
export interface Row {
    [alias: string]: any;
}
export declare type DatabaseChangeListener = () => void;
export interface Database {
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
}
export interface Transaction {
    /** Adds a row, returning the primary key as a promise */
    addRow(table: string, values: {
        [column: string]: any;
    }): Promise<any>;
    updateRow(table: string, primaryKey: any, updates: {
        [column: string]: any;
    }): Promise<void>;
    removeRow(table: string, primaryKey: any): Promise<void>;
    commit(): Promise<any>;
}
export declare class NullDatabase implements Database {
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<never[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): NullTransaction;
}
declare class NullTransaction implements Transaction {
    /** Adds a row, returning the primary key as a promise */
    addRow(table: string, values: {
        [column: string]: any;
    }): Promise<null>;
    updateRow(table: string, primaryKey: any, updates: {
        [column: string]: any;
    }): Promise<void>;
    removeRow(table: string, primaryKey: any): Promise<void>;
    commit(): Promise<void>;
}
export {};
