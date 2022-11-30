import { Database, QueryOptions, DatabaseChangeListener, Transaction } from "./Database";
import { Schema, Column, Row } from "mwater-expressions";
import { ContextVar } from "../widgets/blocks";
import { BatchingCache } from "./BatchingCache";
/**
 * Database which is backed by a real database, but can accept changes such as adds, updates or removes
 * without sending them to the real database until commit is called.
 * The query results obtained from the database incorporate the changes that have been made to it (mutations).
 * commit or rollback must be called to unlisten for changes and the database should be discarded thereafter.
 */
export default class VirtualDatabase implements Database {
    database: Database;
    schema: Schema;
    locale: string;
    mutations: Mutation[];
    changeListeners: DatabaseChangeListener[];
    /** Cache of query results (of underlying database) to increase performance */
    queryCache: BatchingCache<{
        query: QueryOptions;
        contextVars: ContextVar[];
        contextVarValues: {
            [contextVarId: string]: any;
        };
    }, Row[]>;
    /** Array of temporary primary keys that will be replaced by real ones when the insertions are committed */
    tempPrimaryKeys: string[];
    /** True when database is destroyed by commit or rollback */
    destroyed: boolean;
    constructor(database: Database, schema: Schema, locale: string);
    query(query: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Determine if query should be simply sent to the underlying database.
     * Do if no mutations to any tables referenced *and* it doesn't reference temporary primary keys
     */
    private shouldPassthrough;
    /** Test if an expression references a temporary primary key, meaning it cannot be sent to the server */
    private doesReferenceTempPk;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
    refresh(): void;
    /** Commit the changes that have been applied to this virtual database to the real underlying database and destroy the virtual database */
    commit(): Promise<void>;
    /** Rollback any changes and destroy the virtual database */
    rollback(): void;
    /** Determine if a column should be included in the underlying query */
    shouldIncludeColumn(column: Column): boolean;
    /** Create the rows as needed by PromiseExprEvaluator for a query */
    private queryEvalRows;
    /** Replace temporary primary keys with different value */
    private replaceTempPrimaryKeys;
    /** Create a single row structured for evaluation from a row in format { id: <primary key>, c_<column id>: value, ... } */
    private createEvalRow;
    /** Apply all known mutations to a set of rows */
    private mutateRows;
    private handleChange;
}
/** Mutation to the database, whether add, update or remove */
export declare type Mutation = AddMutation | UpdateMutation | RemoveMutation;
/** Add a single row */
export interface AddMutation {
    type: "add";
    /** Table id to add to */
    table: string;
    /** Temporary primary key for the added row */
    primaryKey: any;
    /** Values to add to the new row, excluding the primary key */
    values: {
        [column: string]: any;
    };
}
/** Update a single row */
export interface UpdateMutation {
    type: "update";
    /** Table id to update */
    table: string;
    /** Primary key of row to update */
    primaryKey: any;
    /** Values update in the row */
    updates: {
        [column: string]: any;
    };
}
/** Remove a single row */
export interface RemoveMutation {
    type: "remove";
    /** Table id to remove from */
    table: string;
    /** Primary key of row to remove */
    primaryKey: any;
}
/** Determine if a primary key is a temporary one */
export declare function isTempPrimaryKey(primaryKey: any): boolean;
