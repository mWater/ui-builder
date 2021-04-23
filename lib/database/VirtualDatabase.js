"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Database_1 = require("./Database");
var mwater_expressions_1 = require("mwater-expressions");
var lodash_1 = __importDefault(require("lodash"));
var uuid_1 = require("uuid");
var blocks_1 = require("../widgets/blocks");
var BatchingCache_1 = require("./BatchingCache");
/**
 * Database which is backed by a real database, but can accept changes such as adds, updates or removes
 * without sending them to the real database until commit is called.
 * The query results obtained from the database incorporate the changes that have been made to it (mutations).
 * commit or rollback must be called to unlisten for changes and the database should be discarded thereafter.
 */
var VirtualDatabase = /** @class */ (function () {
    function VirtualDatabase(database, schema, locale) {
        var _this = this;
        this.handleChange = function () {
            for (var _i = 0, _a = _this.changeListeners; _i < _a.length; _i++) {
                var changeListener = _a[_i];
                changeListener();
            }
            // Clear caches
            _this.queryCache = new BatchingCache_1.BatchingCache(function (request) {
                return _this.database.query(request.queryOptions, request.contextVars, request.contextVarValues);
            });
        };
        this.database = database;
        this.schema = schema;
        this.locale = locale;
        this.mutations = [];
        this.changeListeners = [];
        this.tempPrimaryKeys = [];
        this.destroyed = false;
        // Create cache that calls underlying database
        this.queryCache = new BatchingCache_1.BatchingCache(function (request) {
            return _this.database.query(request.queryOptions, request.contextVars, request.contextVarValues);
        });
        database.addChangeListener(this.handleChange);
    }
    VirtualDatabase.prototype.query = function (query, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () {
            var variables, variableValues, exprUtils, exprEval, evalRows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = blocks_1.createExprVariables(contextVars);
                        variableValues = blocks_1.createExprVariableValues(contextVars, contextVarValues);
                        exprUtils = new mwater_expressions_1.ExprUtils(this.schema, variables);
                        // Pass through if no changes and not id query
                        if (this.shouldPassthrough(query, exprUtils, contextVars, contextVarValues)) {
                            return [2 /*return*/, this.database.query(query, contextVars, contextVarValues)];
                        }
                        exprEval = new mwater_expressions_1.PromiseExprEvaluator({ schema: this.schema, locale: this.locale, variables: variables, variableValues: variableValues });
                        return [4 /*yield*/, this.queryEvalRows(query.from, query.where || null, contextVars, contextVarValues)];
                    case 1:
                        evalRows = (_a.sent());
                        // Perform actual query
                        return [2 /*return*/, Database_1.performEvalQuery({ evalRows: evalRows, exprUtils: exprUtils, exprEval: exprEval, query: query })];
                }
            });
        });
    };
    /** Determine if query should be simply sent to the underlying database.
     * Do if no mutations to any tables referenced *and* it is not a simple id = query which
     * is best to cache *and* it doesn't reference temporary primary keys
     */
    VirtualDatabase.prototype.shouldPassthrough = function (query, exprUtils, contextVars, contextVarValues) {
        // Determine which tables are referenced
        var tablesReferenced = [query.from];
        for (var _i = 0, _a = Object.values(query.select); _i < _a.length; _i++) {
            var expr = _a[_i];
            tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(expr).map(function (f) { return f.table; }));
        }
        tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(query.where || null).map(function (f) { return f.table; }));
        for (var _b = 0, _c = query.orderBy || []; _b < _c.length; _b++) {
            var orderBy = _c[_b];
            tablesReferenced = tablesReferenced.concat(exprUtils.getReferencedFields(orderBy.expr).map(function (f) { return f.table; }));
        }
        tablesReferenced = lodash_1.default.uniq(tablesReferenced);
        var mutatedTables = lodash_1.default.uniq(this.mutations.map(function (m) { return m.table; }));
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
    };
    /** Test if an expression references a temporary primary key, meaning it cannot be sent to the server */
    VirtualDatabase.prototype.doesReferenceTempPk = function (expr, exprUtils, contextVars, contextVarValues) {
        var _this = this;
        if (!expr) {
            return false;
        }
        // Inline variables, since if an expression references a variable that has the value of a temporary primary key, 
        // it won't show up in the JSON unless inlined
        var inlinedExpr = exprUtils.inlineVariableValues(expr, blocks_1.createExprVariableValues(contextVars, contextVarValues));
        return (JSON.stringify(inlinedExpr).match(/"pk_[0-9a-zA-Z]+_temp"/g) || []).some(function (m) { return _this.tempPrimaryKeys.includes(JSON.parse(m)); });
    };
    /** Adds a listener which is called with each change to the database */
    VirtualDatabase.prototype.addChangeListener = function (changeListener) {
        this.changeListeners = lodash_1.default.union(this.changeListeners, [changeListener]);
    };
    VirtualDatabase.prototype.removeChangeListener = function (changeListener) {
        this.changeListeners = lodash_1.default.difference(this.changeListeners, [changeListener]);
    };
    VirtualDatabase.prototype.transaction = function () {
        if (this.destroyed) {
            throw new Error("Cannot start transaction on destroyed database");
        }
        return new VirtualDatabaseTransaction(this);
    };
    /** Commit the changes that have been applied to this virtual database to the real underlying database and destroy the virtual database */
    VirtualDatabase.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var txn, pkMapping, _i, _a, mutation, _b, primaryKey, updatePrimaryKey, removePrimaryKey;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.mutations.length === 0) {
                            this.destroyed = true;
                            this.database.removeChangeListener(this.handleChange);
                            return [2 /*return*/];
                        }
                        txn = this.database.transaction();
                        pkMapping = {};
                        _i = 0, _a = this.mutations;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        mutation = _a[_i];
                        _b = mutation.type;
                        switch (_b) {
                            case "add": return [3 /*break*/, 2];
                            case "update": return [3 /*break*/, 4];
                            case "remove": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 8];
                    case 2:
                        // Map any primary keys
                        mutation.values = this.replaceTempPrimaryKeys(mutation.values, function (pk) {
                            if (pkMapping[pk]) {
                                return pkMapping[pk];
                            }
                            throw new Error("Missing mapping for " + pk);
                        });
                        return [4 /*yield*/, txn.addRow(mutation.table, mutation.values)];
                    case 3:
                        primaryKey = _c.sent();
                        pkMapping[mutation.primaryKey] = primaryKey;
                        return [3 /*break*/, 8];
                    case 4:
                        // Map any primary keys
                        mutation.updates = this.replaceTempPrimaryKeys(mutation.updates, function (pk) {
                            if (pkMapping[pk]) {
                                return pkMapping[pk];
                            }
                            throw new Error("Missing mapping for " + pk);
                        });
                        updatePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey;
                        return [4 /*yield*/, txn.updateRow(mutation.table, updatePrimaryKey, mutation.updates)];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        removePrimaryKey = pkMapping[mutation.primaryKey] ? pkMapping[mutation.primaryKey] : mutation.primaryKey;
                        return [4 /*yield*/, txn.removeRow(mutation.table, removePrimaryKey)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [4 /*yield*/, txn.commit()];
                    case 10:
                        _c.sent();
                        this.mutations = [];
                        this.destroyed = true;
                        this.database.removeChangeListener(this.handleChange);
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Rollback any changes and destroy the virtual database */
    VirtualDatabase.prototype.rollback = function () {
        this.mutations = [];
        this.destroyed = true;
        this.database.removeChangeListener(this.handleChange);
    };
    /** Determine if a column should be included in the underlying query */
    VirtualDatabase.prototype.shouldIncludeColumn = function (column) {
        // Compute expressions on the fly
        if (column.expr) {
            return false;
        }
        // Don't include joins except 'n-1' and '1-1'
        if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
            return false;
        }
        return true;
    };
    /** Create the rows as needed by PromiseExprEvaluator for a query */
    VirtualDatabase.prototype.queryEvalRows = function (from, where, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () {
            var variables, exprUtils, queryOptions, _i, _a, column, rows;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        variables = blocks_1.createExprVariables(contextVars);
                        exprUtils = new mwater_expressions_1.ExprUtils(this.schema, variables);
                        queryOptions = {
                            select: {
                                id: { type: "id", table: from }
                            },
                            from: from,
                            where: where
                        };
                        // Add a select for each column
                        for (_i = 0, _a = this.schema.getColumns(from); _i < _a.length; _i++) {
                            column = _a[_i];
                            if (this.shouldIncludeColumn(column)) {
                                queryOptions.select["c_" + column.id] = { type: "field", table: from, column: column.id };
                            }
                        }
                        if (!this.tempPrimaryKeys.includes(Database_1.getWherePrimaryKey(where))) return [3 /*break*/, 1];
                        rows = [];
                        return [3 /*break*/, 4];
                    case 1:
                        if (!this.doesReferenceTempPk(where, exprUtils, contextVars, contextVarValues)) return [3 /*break*/, 2];
                        // This is a tricky decision, as there is a query that references a temporary primary key 
                        // and as such, rows that do not exist. This part of the query cannot be sent to the real 
                        // database. However, a query that had a *not* on that condition would incorrectly be missing
                        // any real matching rows.
                        rows = [];
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.queryCache.get({ queryOptions: queryOptions, contextVars: contextVars, contextVarValues: contextVarValues })];
                    case 3:
                        rows = _b.sent();
                        _b.label = 4;
                    case 4: return [4 /*yield*/, this.mutateRows(rows, from, where, contextVars, contextVarValues)
                        // Convert to rows as expr evaluator expects
                    ];
                    case 5:
                        // Apply mutations
                        rows = _b.sent();
                        // Convert to rows as expr evaluator expects
                        return [2 /*return*/, rows.map(function (row) { return _this.createEvalRow(row, from, contextVars, contextVarValues); })];
                }
            });
        });
    };
    /** Replace temporary primary keys with different value */
    VirtualDatabase.prototype.replaceTempPrimaryKeys = function (input, replaceWith) {
        var json = JSON.stringify(input);
        json = json.replace(new RegExp(/"pk_[0-9a-zA-Z]+_temp"/, "g"), function (tempPkJson) { return JSON.stringify(replaceWith(JSON.parse(tempPkJson))); });
        return JSON.parse(json);
    };
    /** Create a single row structured for evaluation from a row in format { id: <primary key>, c_<column id>: value, ... } */
    VirtualDatabase.prototype.createEvalRow = function (row, from, contextVars, contextVarValues) {
        var _this = this;
        return {
            getPrimaryKey: function () { return Promise.resolve(row.id); },
            getField: function (columnId) { return __awaiter(_this, void 0, void 0, function () {
                var column, joinRows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            column = this.schema.getColumn(from, columnId);
                            if (!(column.type === "join" && column.join.type == "1-n" && column.join.inverse)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.queryEvalRows(column.join.toTable, {
                                    type: "op", op: "=",
                                    table: column.join.toTable, exprs: [
                                        { type: "field", table: column.join.toTable, column: column.join.inverse },
                                        { type: "literal", valueType: "id", idTable: from, value: row.id }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 1:
                            joinRows = _a.sent();
                            return [2 /*return*/, Promise.all(joinRows.map(function (r) { return r.getPrimaryKey(); }))];
                        case 2:
                            // Non n-1 or 1-1 joins not available
                            if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
                                console.warn("Attempt to get join field " + columnId);
                                return [2 /*return*/, null];
                            }
                            // Return simple value
                            return [2 /*return*/, row["c_" + columnId]];
                    }
                });
            }); },
            followJoin: function (columnId) { return __awaiter(_this, void 0, void 0, function () {
                var column, idTable, joinRows, joinRows, joinRows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            column = this.schema.getColumn(from, columnId);
                            idTable = column.type == "id" || column.type == "id[]" ? column.idTable : column.join.toTable;
                            if (!(column.type == "join" && column.join.type === "1-n" && column.join.inverse)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.queryEvalRows(column.join.toTable, {
                                    type: "op", op: "=", table: idTable,
                                    exprs: [
                                        { type: "field", table: idTable, column: column.join.inverse },
                                        { type: "literal", valueType: "id", idTable: from, value: row.id }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 1:
                            joinRows = _a.sent();
                            return [2 /*return*/, joinRows];
                        case 2:
                            // Non n-1 or 1-1 joins not available
                            if (column.type == "join" && column.join.type != "n-1" && column.join.type != "1-1") {
                                console.warn("Attempt to get join field " + columnId);
                                return [2 /*return*/, null];
                            }
                            if (!(column.type == "id" || column.type == "join")) return [3 /*break*/, 4];
                            // Short-circuit if null/undefined
                            if (row["c_" + columnId] == null) {
                                return [2 /*return*/, null];
                            }
                            return [4 /*yield*/, this.queryEvalRows(idTable, {
                                    type: "op", op: "=", table: idTable, exprs: [
                                        { type: "id", table: idTable },
                                        { type: "literal", valueType: "id", idTable: idTable, value: row["c_" + columnId] }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 3:
                            joinRows = _a.sent();
                            return [2 /*return*/, joinRows[0] || null];
                        case 4:
                            if (!(column.type == "id[]")) return [3 /*break*/, 6];
                            // Short-circuit if null/undefined
                            if (row["c_" + columnId] == null || row["c_" + columnId].length == 0) {
                                return [2 /*return*/, []];
                            }
                            return [4 /*yield*/, this.queryEvalRows(idTable, {
                                    type: "op", op: "= any", table: idTable, exprs: [
                                        { type: "id", table: idTable },
                                        { type: "literal", valueType: "id", idTable: idTable, value: row["c_" + columnId] }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 5:
                            joinRows = _a.sent();
                            return [2 /*return*/, joinRows];
                        case 6: throw new Error("Not implemented");
                    }
                });
            }); }
        };
    };
    /** Apply all known mutations to a set of rows */
    VirtualDatabase.prototype.mutateRows = function (rows, from, where, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () {
            var variables, variableValues, _loop_1, _i, _a, mutation, filteredRows, exprEval, _b, rows_1, row, evalRow;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        variables = blocks_1.createExprVariables(contextVars);
                        variableValues = blocks_1.createExprVariableValues(contextVars, contextVarValues);
                        // Copy rows to be mutated safely
                        rows = rows.slice();
                        _loop_1 = function (mutation) {
                            // Only from correct table
                            if (mutation.table !== from) {
                                return "continue";
                            }
                            if (mutation.type === "add") {
                                var newRow = lodash_1.default.mapKeys(mutation.values, function (v, k) { return "c_" + k; });
                                rows.push(__assign({ id: mutation.primaryKey }, newRow));
                            }
                            // TODO: This is O(nxm) where n is number of rows and m
                            if (mutation.type === "update") {
                                for (var i = 0; i < rows.length; i++) {
                                    if (rows[i].id === mutation.primaryKey) {
                                        var update = lodash_1.default.mapKeys(mutation.updates, function (v, k) { return "c_" + k; });
                                        rows[i] = __assign(__assign({}, rows[i]), update);
                                    }
                                }
                            }
                            if (mutation.type === "remove") {
                                rows = rows.filter(function (row) { return row.id !== mutation.primaryKey; });
                            }
                        };
                        for (_i = 0, _a = this.mutations; _i < _a.length; _i++) {
                            mutation = _a[_i];
                            _loop_1(mutation);
                        }
                        if (!where) return [3 /*break*/, 5];
                        filteredRows = [];
                        exprEval = new mwater_expressions_1.PromiseExprEvaluator({ schema: this.schema, locale: this.locale, variables: variables, variableValues: variableValues });
                        _b = 0, rows_1 = rows;
                        _c.label = 1;
                    case 1:
                        if (!(_b < rows_1.length)) return [3 /*break*/, 4];
                        row = rows_1[_b];
                        evalRow = this.createEvalRow(row, from, contextVars, contextVarValues);
                        return [4 /*yield*/, exprEval.evaluate(where, { row: evalRow })];
                    case 2:
                        if (_c.sent()) {
                            filteredRows.push(row);
                        }
                        _c.label = 3;
                    case 3:
                        _b++;
                        return [3 /*break*/, 1];
                    case 4:
                        rows = filteredRows;
                        _c.label = 5;
                    case 5: return [2 /*return*/, rows];
                }
            });
        });
    };
    return VirtualDatabase;
}());
exports.default = VirtualDatabase;
var VirtualDatabaseTransaction = /** @class */ (function () {
    function VirtualDatabaseTransaction(virtualDatabase) {
        this.virtualDatabase = virtualDatabase;
        this.mutations = [];
    }
    VirtualDatabaseTransaction.prototype.addRow = function (table, values) {
        // Use a pattern for easy replacement
        var primaryKey = "pk_" + uuid_1.v4().replace(/-/g, "") + "_temp";
        // Save temporary primary key
        this.virtualDatabase.tempPrimaryKeys.push(primaryKey);
        this.mutations.push({
            type: "add",
            table: table,
            primaryKey: primaryKey,
            values: values
        });
        return Promise.resolve(primaryKey);
    };
    VirtualDatabaseTransaction.prototype.updateRow = function (table, primaryKey, updates) {
        this.mutations.push({
            type: "update",
            table: table,
            primaryKey: primaryKey,
            updates: updates
        });
        return Promise.resolve();
    };
    VirtualDatabaseTransaction.prototype.removeRow = function (table, primaryKey) {
        // Remove locally if local
        if (this.virtualDatabase.tempPrimaryKeys.includes(primaryKey)) {
            this.mutations = this.mutations.filter(function (m) { return m.primaryKey !== primaryKey; });
            this.virtualDatabase.mutations = this.virtualDatabase.mutations.filter(function (m) { return m.primaryKey !== primaryKey; });
            return Promise.resolve();
        }
        this.mutations.push({
            type: "remove",
            table: table,
            primaryKey: primaryKey
        });
        return Promise.resolve();
    };
    VirtualDatabaseTransaction.prototype.commit = function () {
        var _loop_2 = function (mutation) {
            if (mutation.type == "add") {
                // Add mutations are always performed
                this_1.virtualDatabase.mutations.push(mutation);
            }
            else if (mutation.type == "update") {
                // Combine with add if present
                var existingAdd = this_1.virtualDatabase.mutations.find(function (m) {
                    return m.table == mutation.table
                        && m.type == "add"
                        && m.primaryKey == mutation.primaryKey;
                });
                if (existingAdd) {
                    existingAdd.values = __assign(__assign({}, existingAdd.values), mutation.updates);
                    return "continue";
                }
                // Combine with update if present
                var existingUpdate = this_1.virtualDatabase.mutations.find(function (m) {
                    return m.table == mutation.table
                        && m.type == "update"
                        && m.primaryKey == mutation.primaryKey;
                });
                if (existingUpdate) {
                    existingUpdate.updates = __assign(__assign({}, existingUpdate.updates), mutation.updates);
                    return "continue";
                }
                this_1.virtualDatabase.mutations.push(mutation);
            }
            else if (mutation.type == "remove") {
                // Remove add if present
                // Combine with add if present
                var existingAddIndex = this_1.virtualDatabase.mutations.findIndex(function (m) {
                    return m.table == mutation.table
                        && m.type == "add"
                        && m.primaryKey == mutation.primaryKey;
                });
                if (existingAddIndex >= 0) {
                    this_1.virtualDatabase.mutations.splice(existingAddIndex, 1);
                    return "continue";
                }
                this_1.virtualDatabase.mutations.push(mutation);
            }
        };
        var this_1 = this;
        // Clear mutations and transfer to main database
        for (var _i = 0, _a = this.mutations; _i < _a.length; _i++) {
            var mutation = _a[_i];
            _loop_2(mutation);
        }
        this.mutations = [];
        for (var _b = 0, _c = this.virtualDatabase.changeListeners; _b < _c.length; _b++) {
            var changeListener = _c[_b];
            changeListener();
        }
        return Promise.resolve();
    };
    return VirtualDatabaseTransaction;
}());
