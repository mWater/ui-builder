import { Database, QueryOptions, Row, DatabaseChangeListener, Transaction } from "./Database";
import { DataSource, Schema } from "mwater-expressions";
import { QueryCompiler } from "./QueryCompiler";
export declare class DataSourceDatabase implements Database {
    schema: Schema;
    dataSource: DataSource;
    queryCompiler: QueryCompiler;
    constructor(schema: Schema, dataSource: DataSource, queryCompiler: QueryCompiler);
    query(options: QueryOptions): Promise<Row[]>;
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener: DatabaseChangeListener): void;
    removeChangeListener(changeListener: DatabaseChangeListener): void;
    transaction(): Transaction;
}
