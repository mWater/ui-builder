"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceDatabase = void 0;
const lodash_1 = __importDefault(require("lodash"));
const QueryCompiler_1 = require("./QueryCompiler");
const blocks_1 = require("../widgets/blocks");
/** Database which is driven from a data source. Changes must be handled externally and updates triggered manually */
class DataSourceDatabase {
    constructor(schema, dataSource, transactionHandler) {
        this.schema = schema;
        this.dataSource = dataSource;
        this.transactionHandler = transactionHandler;
        this.changeListeners = [];
    }
    query(options, contextVars, filteredContextVarValues) {
        const queryCompiler = new QueryCompiler_1.QueryCompiler(this.schema, blocks_1.createExprVariables(contextVars), blocks_1.createExprVariableValues(contextVars, filteredContextVarValues));
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
        this.changeListeners = lodash_1.default.union(this.changeListeners, [changeListener]);
    }
    removeChangeListener(changeListener) {
        this.changeListeners = lodash_1.default.difference(this.changeListeners, [changeListener]);
    }
    /** Force change event to fire after clearing cache */
    triggerChange() {
        this.dataSource.clearCache();
        for (const changeListener of this.changeListeners) {
            changeListener();
        }
    }
    transaction() {
        if (!this.transactionHandler) {
            throw new Error("Not implemented");
        }
        return this.transactionHandler();
    }
}
exports.DataSourceDatabase = DataSourceDatabase;
