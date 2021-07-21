"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const mwater_expressions_1 = require("mwater-expressions");
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = require("uuid");
const blocks_1 = require("../widgets/blocks");
const BatchingCache_1 = require("./BatchingCache");
/**
 * Database which is backed by a real database, but can accept changes such as adds, updates or removes
 * without sending them to the real database until commit is called.
 * The query results obtained from the database incorporate the changes that have been made to it (mutations).
 * commit or rollback must be called to unlisten for changes and the database should be discarded thereafter.
 */
class VirtualDatabase {
    constructor(database, schema, locale) {
        this.handleChange = () => {
            // Clear caches
            this.queryCache = new BatchingCache_1.BatchingCache(request => {
                return this.database.query(request.query, request.contextVars, request.contextVarValues);
            });
            for (const changeListener of this.changeListeners) {
                changeListener();
            }
        };
        this.database = database;
        this.schema = schema;
        this.locale = locale;
        this.mutations = [];
        this.changeListeners = [];
        this.tempPrimaryKeys = [];
        this.destroyed = false;
        // Create cache that calls underlying database
        this.queryCache = new BatchingCache_1.BatchingCache(request => {
            return this.database.query(request.query, request.contextVars, request.contextVarValues);
        });
        database.addChangeListener(this.handleChange);
    }
    query(query, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = blocks_1.createExprVariables(contextVars);
            const variableValues = blocks_1.createExprVariableValues(contextVars, contextVarValues);
            const exprUtils = new mwater_expressions_1.ExprUtils(this.schema, variables);
            // Pass through if no changes and not id query
            if (this.shouldPassthrough(query, exprUtils, contextVars, contextVarValues)) {
                return this.queryCache.get({ query, contextVars, contextVarValues });
            }
            const exprEval = new mwater_expressions_1.PromiseExprEvaluator({ schema: this.schema, locale: this.locale, variables, variableValues });
            // Create rows to evaluate (just use where clause to filter)
            const evalRows = (yield this.queryEvalRows(query.from, query.where || null, contextVars, contextVarValues));
            // Perform actual query
            return Database_1.performEvalQuery({ evalRows, exprUtils, exprEval, query: query });
        });
    }
    /** Determine if query should be simply sent to the underlying database.
     * Do if no mutations to any tables referenced *and* it is not a simple id = query which
     * is best to cache *and* it doesn't reference temporary primary keys
     */
    shouldPassthrough(query, exprUtils, contextVars, contextVarValues) {
        // Determine which tables are referenced
        let tablesReferenced = [query.from];
        for (const expr of Object.values(query.select)) {
            tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(expr).map(f => f.table));
        }
        tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(query.where || null).map(f => f.table));
        for (const orderBy of query.orderBy || []) {
            tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(orderBy.expr).map(f => f.table));
        }
        tablesReferenced = lodash_1.default.uniq(tablesReferenced);
        const mutatedTables = lodash_1.default.uniq(this.mutations.map(m => m.table));
        // Can't passthrough if depends on mutated table
        if (lodash_1.default.intersection(tablesReferenced, mutatedTables).length > 0) {
            return false;
        }
        // Don't passthrough if simple id query, so that caching still happens
        if (Database_1.getWherePrimaryKey(query.where)) {
            return false;
        }
        // Can't passthrough if depends on primary key
        if (this.doesReferenceTempPk(query.where, exprUtils, contextVars, contextVarValues)) {
            return false;
        }
        return true;
    }
    /** Test if an expression references a temporary primary key, meaning it cannot be sent to the server */
    doesReferenceTempPk(expr, exprUtils, contextVars, contextVarValues) {
        if (!expr) {
            return false;
        }
        // Inline variables, since if an expression references a variable that has the value of a temporary primary key, 
        // it won't show up in the JSON unless inlined
        const inlinedExpr = exprUtils.inlineVariableValues(expr, blocks_1.createExprVariableValues(contextVars, contextVarValues));
        return (JSON.stringify(inlinedExpr).match(/"pk_[0-9a-zA-Z]+_temp"/g) || []).some(m => this.tempPrimaryKeys.includes(JSON.parse(m)));
    }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) {
        this.changeListeners = lodash_1.default.union(this.changeListeners, [changeListener]);
    }
    removeChangeListener(changeListener) {
        this.changeListeners = lodash_1.default.difference(this.changeListeners, [changeListener]);
    }
    transaction() {
        if (this.destroyed) {
            throw new Error("Cannot start transaction on destroyed database");
        }
        return new VirtualDatabaseTransaction(this);
    }
    /** Commit the changes that have been applied to this virtual database to the real underlying database and destroy the virtual database */
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mutations.length === 0) {
                this.destroyed = true;
                this.database.removeChangeListener(this.handleChange);
                return;
            }
            // Apply mutations in one transaction
            const txn = this.database.transaction();
            // Store mapping from temp to real primary keys
            const pkMapping = {};
            for (const mutation of this.mutations) {
                switch (mutation.type) {
                    case "add":
                        // Map any primary keys
                        const mappedValues = this.replaceTempPrimaryKeys(mutation.values, (pk) => {
                            if (pkMapping[pk]) {
                                return pkMapping[pk];
                            }
                            throw new Error("Missing mapping for " + pk);
                        });
                        const primaryKey = yield txn.addRow(mutation.table, mappedValues);
                        pkMapping[mutation.primaryKey] = primaryKey;
                        break;
                    case "update":
                        // Map any primary keys
                        const mappedUpdates = this.replaceTempPrimaryKeys(mutation.updates, (pk) => {
                            if (pkMapping[pk]) {
                                return pkMapping[pk];
                            }
                            throw new Error("Missing mapping for " + pk);
                        });
                        const updatePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey;
                        yield txn.updateRow(mutation.table, updatePrimaryKey, mappedUpdates);
                        break;
                    case "remove":
                        const removePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey;
                        yield txn.removeRow(mutation.table, removePrimaryKey);
                        break;
                }
            }
            yield txn.commit();
            this.mutations = [];
            this.destroyed = true;
            this.database.removeChangeListener(this.handleChange);
        });
    }
    /** Rollback any changes and destroy the virtual database */
    rollback() {
        this.mutations = [];
        this.destroyed = true;
        this.database.removeChangeListener(this.handleChange);
    }
    /** Determine if a column should be included in the underlying query */
    shouldIncludeColumn(column) {
        // Compute expressions on the fly
        if (column.expr) {
            return false;
        }
        // Don't include joins except 'n-1' and '1-1'
        if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
            return false;
        }
        return true;
    }
    /** Create the rows as needed by PromiseExprEvaluator for a query */
    queryEvalRows(from, where, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = blocks_1.createExprVariables(contextVars);
            const exprUtils = new mwater_expressions_1.ExprUtils(this.schema, variables);
            // Create query with c_ for all columns, id and just the where clause
            let queryOptions = {
                select: {
                    id: { type: "id", table: from }
                },
                from: from,
                where: where
            };
            // Alter where clause to include any rows that have been updated, as the update
            // may have altered the row in such a way as it now matches the where clause
            const updatedIds = lodash_1.default.uniq(this.mutations.filter(m => m.type == "update").map(m => m.primaryKey));
            if (updatedIds.length > 0 && where) {
                queryOptions.where = {
                    type: "op",
                    op: "or",
                    table: from,
                    exprs: [
                        { type: "op", table: from, op: "= any", exprs: [
                                { type: "id", table: from },
                                { type: "literal", valueType: "id[]", idTable: from, value: updatedIds }
                            ] },
                        where
                    ]
                };
            }
            // Add a select for each column
            for (const column of this.schema.getColumns(from)) {
                if (this.shouldIncludeColumn(column)) {
                    queryOptions.select["c_" + column.id] = { type: "field", table: from, column: column.id };
                }
            }
            // Perform query
            let rows;
            // Skip if us just a query on a temporary row, which will not match anything
            if (this.tempPrimaryKeys.includes(Database_1.getWherePrimaryKey(where))) {
                rows = [];
            }
            else if (this.doesReferenceTempPk(where, exprUtils, contextVars, contextVarValues)) {
                // This is a tricky decision, as there is a query that references a temporary primary key 
                // and as such, rows that do not exist. This part of the query cannot be sent to the real 
                // database. However, a query that had a *not* on that condition would incorrectly be missing
                // any real matching rows.
                rows = [];
            }
            else {
                rows = yield this.queryCache.get({ query: queryOptions, contextVars: contextVars, contextVarValues: contextVarValues });
            }
            // Apply mutations
            rows = yield this.mutateRows(rows, from, where, contextVars, contextVarValues);
            // Convert to rows as expr evaluator expects
            return rows.map(row => this.createEvalRow(row, from, contextVars, contextVarValues));
        });
    }
    /** Replace temporary primary keys with different value */
    replaceTempPrimaryKeys(input, replaceWith) {
        let json = JSON.stringify(input);
        json = json.replace(new RegExp(/"pk_[0-9a-zA-Z]+_temp"/, "g"), (tempPkJson) => JSON.stringify(replaceWith(JSON.parse(tempPkJson))));
        return JSON.parse(json);
    }
    /** Create a single row structured for evaluation from a row in format { id: <primary key>, c_<column id>: value, ... } */
    createEvalRow(row, from, contextVars, contextVarValues) {
        return {
            getPrimaryKey: () => Promise.resolve(row.id),
            getField: (columnId) => __awaiter(this, void 0, void 0, function* () {
                const column = this.schema.getColumn(from, columnId);
                // Special case is 1-n join with inverse, as they are not included in the query
                if (column.type === "join" && column.join.type == "1-n" && column.join.inverse) {
                    // Get the rows and then extract the primary keys
                    const joinRows = yield this.queryEvalRows(column.join.toTable, {
                        type: "op", op: "=",
                        table: column.join.toTable, exprs: [
                            { type: "field", table: column.join.toTable, column: column.join.inverse },
                            { type: "literal", valueType: "id", idTable: from, value: row.id }
                        ]
                    }, contextVars, contextVarValues);
                    return Promise.all(joinRows.map(r => r.getPrimaryKey()));
                }
                // Non n-1 or 1-1 joins not available
                if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
                    console.warn(`Attempt to get join field ${columnId}`);
                    return null;
                }
                // Return simple value
                return row["c_" + columnId];
            }),
            followJoin: (columnId) => __awaiter(this, void 0, void 0, function* () {
                const column = this.schema.getColumn(from, columnId);
                const idTable = column.type == "id" || column.type == "id[]" ? column.idTable : column.join.toTable;
                // Inverse 1-n uses the inverse column to get rows, as these are not included in the row values
                if (column.type == "join" && column.join.type === "1-n" && column.join.inverse) {
                    const joinRows = yield this.queryEvalRows(column.join.toTable, {
                        type: "op", op: "=", table: idTable,
                        exprs: [
                            { type: "field", table: idTable, column: column.join.inverse },
                            { type: "literal", valueType: "id", idTable: from, value: row.id }
                        ]
                    }, contextVars, contextVarValues);
                    return joinRows;
                }
                // Non n-1 or 1-1 joins not available
                if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
                    console.warn(`Attempt to get join field ${columnId}`);
                    return null;
                }
                // For ones with single row
                if (column.type == "id" || column.type == "join") {
                    // Short-circuit if null/undefined
                    if (row["c_" + columnId] == null) {
                        return null;
                    }
                    const joinRows = yield this.queryEvalRows(idTable, {
                        type: "op", op: "=", table: idTable, exprs: [
                            { type: "id", table: idTable },
                            { type: "literal", valueType: "id", idTable: idTable, value: row["c_" + columnId] }
                        ]
                    }, contextVars, contextVarValues);
                    return joinRows[0] || null;
                }
                // For ones with multiple rows
                if (column.type == "id[]") {
                    // Short-circuit if null/undefined
                    if (row["c_" + columnId] == null || row["c_" + columnId].length == 0) {
                        return [];
                    }
                    const joinRows = yield this.queryEvalRows(idTable, {
                        type: "op", op: "= any", table: idTable, exprs: [
                            { type: "id", table: idTable },
                            { type: "literal", valueType: "id", idTable: idTable, value: row["c_" + columnId] }
                        ]
                    }, contextVars, contextVarValues);
                    return joinRows;
                }
                throw new Error("Not implemented");
            })
        };
    }
    /** Apply all known mutations to a set of rows */
    mutateRows(rows, from, where, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = blocks_1.createExprVariables(contextVars);
            const variableValues = blocks_1.createExprVariableValues(contextVars, contextVarValues);
            // Copy rows to be mutated safely
            rows = rows.slice();
            for (const mutation of this.mutations) {
                // Only from correct table
                if (mutation.table !== from) {
                    continue;
                }
                if (mutation.type === "add") {
                    const newRow = lodash_1.default.mapKeys(mutation.values, (v, k) => "c_" + k);
                    rows.push(Object.assign({ id: mutation.primaryKey }, newRow));
                }
                // TODO: This is O(nxm) where n is number of rows and m
                if (mutation.type === "update") {
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].id === mutation.primaryKey) {
                            const update = lodash_1.default.mapKeys(mutation.updates, (v, k) => "c_" + k);
                            rows[i] = Object.assign(Object.assign({}, rows[i]), update);
                        }
                    }
                }
                if (mutation.type === "remove") {
                    rows = rows.filter(row => row.id !== mutation.primaryKey);
                }
            }
            // Re-filter rows
            if (where) {
                const filteredRows = [];
                const exprEval = new mwater_expressions_1.PromiseExprEvaluator({ schema: this.schema, locale: this.locale, variables, variableValues });
                for (const row of rows) {
                    const evalRow = this.createEvalRow(row, from, contextVars, contextVarValues);
                    if (yield exprEval.evaluate(where, { row: evalRow })) {
                        filteredRows.push(row);
                    }
                }
                rows = filteredRows;
            }
            return rows;
        });
    }
}
exports.default = VirtualDatabase;
class VirtualDatabaseTransaction {
    constructor(virtualDatabase) {
        this.virtualDatabase = virtualDatabase;
        this.mutations = [];
    }
    addRow(table, values) {
        // Use a pattern for easy replacement
        const primaryKey = `pk_${uuid_1.v4().replace(/-/g, "")}_temp`;
        // Save temporary primary key
        this.virtualDatabase.tempPrimaryKeys.push(primaryKey);
        this.mutations.push({
            type: "add",
            table: table,
            primaryKey: primaryKey,
            values: values
        });
        return Promise.resolve(primaryKey);
    }
    updateRow(table, primaryKey, updates) {
        this.mutations.push({
            type: "update",
            table: table,
            primaryKey: primaryKey,
            updates: updates
        });
        return Promise.resolve();
    }
    removeRow(table, primaryKey) {
        // Remove locally if local
        if (this.virtualDatabase.tempPrimaryKeys.includes(primaryKey)) {
            this.mutations = this.mutations.filter(m => m.primaryKey !== primaryKey);
            this.virtualDatabase.mutations = this.virtualDatabase.mutations.filter(m => m.primaryKey !== primaryKey);
            return Promise.resolve();
        }
        this.mutations.push({
            type: "remove",
            table: table,
            primaryKey: primaryKey
        });
        return Promise.resolve();
    }
    commit() {
        const primaryKeys = this.mutations.map(m => m.type == "add" ? m.primaryKey : null);
        // Clear mutations and transfer to main database
        for (const mutation of this.mutations) {
            if (mutation.type == "add") {
                // Add mutations are always performed
                this.virtualDatabase.mutations.push(mutation);
            }
            else if (mutation.type == "update") {
                // Combine with add if present
                const existingAdd = this.virtualDatabase.mutations.find(m => m.table == mutation.table
                    && m.type == "add"
                    && m.primaryKey == mutation.primaryKey);
                if (existingAdd) {
                    existingAdd.values = Object.assign(Object.assign({}, existingAdd.values), mutation.updates);
                    continue;
                }
                // Combine with update if present
                const existingUpdate = this.virtualDatabase.mutations.find(m => m.table == mutation.table
                    && m.type == "update"
                    && m.primaryKey == mutation.primaryKey);
                if (existingUpdate) {
                    existingUpdate.updates = Object.assign(Object.assign({}, existingUpdate.updates), mutation.updates);
                    continue;
                }
                this.virtualDatabase.mutations.push(mutation);
            }
            else if (mutation.type == "remove") {
                // Remove add if present
                // Combine with add if present
                const existingAddIndex = this.virtualDatabase.mutations.findIndex(m => m.table == mutation.table
                    && m.type == "add"
                    && m.primaryKey == mutation.primaryKey);
                if (existingAddIndex >= 0) {
                    this.virtualDatabase.mutations.splice(existingAddIndex, 1);
                    continue;
                }
                this.virtualDatabase.mutations.push(mutation);
            }
        }
        this.mutations = [];
        for (const changeListener of this.virtualDatabase.changeListeners) {
            changeListener();
        }
        return Promise.resolve(primaryKeys);
    }
}
