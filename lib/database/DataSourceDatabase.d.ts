import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { DataSource, Schema } from "mwater-expressions";
import { ContextVar } from "../widgets/blocks";
declare type TransactionHandler = () => Transaction;
/** Database which is driven from a data source. Changes must be handled externally and updates triggered manually */
export declare class DataSourceDatabase implements Database {
    schema: Schema;
    dataSource: DataSource;
    transactionHandler?: TransactionHandler;
    changeListeners: DatabaseChangeListener[];
    constructor(schema: Schema, dataSource: DataSource, transactionHandler?: TransactionHandler);
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    /** Force change event to fire after clearing cache */
    triggerChange(): void;
    transaction(): Transaction;
}
export {};
