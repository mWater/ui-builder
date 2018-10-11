import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { DataSource, Schema } from "mwater-expressions";
import { ContextVar } from "../widgets/blocks";
export declare class DataSourceDatabase implements Database {
    schema: Schema;
    dataSource: DataSource;
    constructor(schema: Schema, dataSource: DataSource);
    query(options: QueryOptions, contextVars: ContextVar[], contextVarValues: {
        [contextVarId: string]: any;
    }): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
}
