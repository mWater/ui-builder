import { QueryCompiler } from "./QueryCompiler";
import { createExprVariables } from "../widgets/blocks";
export class DataSourceDatabase {
    constructor(schema, dataSource) {
        this.schema = schema;
        this.dataSource = dataSource;
    }
    query(options, contextVars, contextVarValues) {
        const queryCompiler = new QueryCompiler(this.schema, createExprVariables(contextVars), contextVarValues);
        const { jsonql, rowMapper } = queryCompiler.compileQuery(options);
        return new Promise((resolve, reject) => {
            this.dataSource.performQuery(jsonql, (error, rows) => {
                if (error) {
                    reject(error);
                }
                else {
                    // Transform rows to remove c_ from columns
                    resolve(rows.map(rowMapper));
                }
            });
        });
    }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) {
        // TODO
    }
    removeChangeListener(changeListener) {
        // TODO
    }
    transaction() {
        throw new Error("Not implemented");
    }
}
//# sourceMappingURL=DataSourceDatabase.js.map