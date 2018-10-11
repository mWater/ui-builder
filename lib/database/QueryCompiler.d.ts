import { JsonQL, Schema, Row, Variable } from "mwater-expressions";
import { QueryOptions } from "./Database";
export declare class QueryCompiler {
    schema: Schema;
    variables: Variable[];
    variableValues: {
        [variableId: string]: any;
    };
    constructor(schema: Schema, variables: Variable[], variableValues: {
        [variableId: string]: any;
    });
    /** Compiles a query to JsonQL and also returns a function to map the returned
     * rows to the ones requested by the query. This is necessary due to invalid select aliases
     * that queries may have, so we normalize to c0, c1, etc. in the query
     */
    compileQuery(options: QueryOptions): {
        jsonql: JsonQL;
        rowMapper: (row: Row) => Row;
    };
}
