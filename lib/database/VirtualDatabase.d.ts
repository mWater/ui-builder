import { Database, QueryOptions, DatabaseChangeListener, Transaction } from "./Database";
import { Schema, Column, ExprUtils, Row } from "mwater-expressions";
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
        queryOptions: QueryOptions;
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
     * Do if no mutations to any tables referenced *and* it is not a simple id = query which
     * is best to cache.
     */
    shouldPassthrough(query: QueryOptions, exprUtils: ExprUtils): boolean;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
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
export declare type Mutation = AddMutation | UpdateMutation | RemoveMutation;
export interface AddMutation {
    type: "add";
    table: string;
    primaryKey: any;
    values: {
        [column: string]: any;
    };
}
export interface UpdateMutation {
    type: "update";
    table: string;
    primaryKey: any;
    updates: {
        [column: string]: any;
    };
}
export interface RemoveMutation {
    type: "remove";
    table: string;
    primaryKey: any;
}
