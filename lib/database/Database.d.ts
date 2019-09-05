import { Expr } from 'mwater-expressions';
import { ContextVar } from '../widgets/blocks';
export declare type OrderByDir = "asc" | "desc";
export interface OrderBy {
    expr: Expr;
    dir: OrderByDir;
}
/** Specification for a query that is made to a database */
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
/** An abstraction of a database which allows querying using expressions. May be the live
 * database or a virtual database which is applying local changes that have not been submitted
 * to the server (see VirtualDatabase)
 */
export interface Database {
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
}
/** Transaction of actions to apply to the database */
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
/** Database which performs no actions and always returns blank query results */
export declare class NullDatabase implements Database {
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<never[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): NullTransaction;
}
/** Transaction which performs no actions */
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
