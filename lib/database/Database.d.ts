import { Expr, PromiseExprEvaluatorRow, PromiseExprEvaluator, Row } from "mwater-expressions";
import { ContextVar } from "../widgets/blocks";
import { ExprUtils } from "mwater-expressions";
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
export declare type DatabaseChangeListener = () => void;
/** An abstraction of a database which allows querying using expressions. May be the live
 * database or a virtual database which is applying local changes that have not been submitted
 * to the server (see VirtualDatabase)
 */
export interface Database {
    /** Perform a query. Note: contextVarValues should have filters baked into them. Use getFilteredContextVarValues(...) */
    query(options: QueryOptions, contextVars: ContextVar[], filteredContextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    /** Start a transaction */
    transaction(): Transaction;
    /** Trigger all change listeners to perform a refresh. Automatically done after transaction completion */
    refresh(): void;
}
/** Transaction of actions to apply to the database */
export interface Transaction {
    /** Adds a row, returning a temporary primary key as a promise. This
     * primary key is only valid within the transaction. The commit will
     * return the actual new primary key.
     */
    addRow(table: string, values: {
        [column: string]: any;
    }): Promise<any>;
    /** Updates a row */
    updateRow(table: string, primaryKey: any, updates: {
        [column: string]: any;
    }): Promise<void>;
    /** Removes a row */
    removeRow(table: string, primaryKey: any): Promise<void>;
    /** Commits the transaction, returning an array of primary keys (for add mutations) and null otherwise.
     * For example, if there are two adds and a remove, the returned array will contain [<primary key1>, <primary key2>, null]
     */
    commit(): Promise<any[]>;
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
    refresh(): void;
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
    commit(): Promise<never[]>;
}
/** Evaluates a database query given a set of rows of the type that are needed by the PromiseExprEvaluator.
 * Useful for performing a query on a non-SQL database, e.g. in memory or MongoDb, etc.
 */
export declare function performEvalQuery(options: {
    evalRows: PromiseExprEvaluatorRow[];
    query: QueryOptions;
    exprEval: PromiseExprEvaluator;
    exprUtils: ExprUtils;
}): Promise<Row[]>;
/** Determine if a where clause expression filters by primary key, and if so, return the key */
export declare function getWherePrimaryKey(where?: Expr): any;
/** Determine if a where clause expression filters by multiple primary keys, and if so, return the keys */
export declare function getWherePrimaryKeys(where?: Expr): any[] | null;
/** Determine if a query is aggregate (either select or order clauses) */
export declare function isQueryAggregate(query: QueryOptions, exprUtils: ExprUtils): boolean;
/** Stable sort on field */
export declare function stableSort<T>(items: T[], iteratee: (item: T) => any, direction: "asc" | "desc"): T[];
/** Hook to listen for database changes. Returns an integer that increments with each change */
export declare function useDatabaseChangeListener(database: Database): number;
/** Determine if a primary key is a temporary one */
export declare function isTempPrimaryKey(primaryKey: any): boolean;
export {};
