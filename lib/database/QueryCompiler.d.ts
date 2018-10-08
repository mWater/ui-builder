import { JsonQL, Schema, Row } from "mwater-expressions";
import { QueryOptions } from "./Database";
export declare class QueryCompiler {
    schema: Schema;
    constructor(schema: Schema);
    /** Compiles a query to JsonQL and also returns a function to map the returned
     * rows to the ones requested by the query. This is necessary due to invalid select aliases
     * that queries may have, so we normalize to c0, c1, etc. in the query
     */
    compileQuery(options: QueryOptions): {
        jsonql: JsonQL;
        rowMapper: (row: Row) => Row;
    };
}