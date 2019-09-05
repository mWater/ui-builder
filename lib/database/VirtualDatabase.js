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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mwater_expressions_1 = require("mwater-expressions");
var PromiseExprEvaluator_1 = require("./PromiseExprEvaluator");
var _ = __importStar(require("lodash"));
var uuid_1 = require("uuid");
var lru_cache_1 = __importDefault(require("lru-cache"));
var canonical_json_1 = __importDefault(require("canonical-json"));
var blocks_1 = require("../widgets/blocks");
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
        };
        this.database = database;
        this.schema = schema;
        this.locale = locale;
        this.mutations = [];
        this.changeListeners = [];
        this.tempPrimaryKeys = [];
        this.destroyed = false;
        this.cache = new lru_cache_1.default();
        database.addChangeListener(this.handleChange);
    }
    VirtualDatabase.prototype.query = function (options, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () {
            var variables, variableValues, evalRows, exprUtils, selects, orderBys, exprEval, _i, evalRows_1, evalRow, i, _a, _b, i, _c, _d, groups, _e, _f, group, evalRow, i, _g, _h, i, _j, _k, projectedRows, _l, evalRows_2, evalRow, projectedRow, i;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        variables = blocks_1.createExprVariables(contextVars);
                        variableValues = contextVarValues;
                        return [4 /*yield*/, this.queryEvalRows(options.from, options.where || null, contextVars, contextVarValues)];
                    case 1:
                        evalRows = (_m.sent()).map(function (r) { return ({ row: r }); });
                        exprUtils = new mwater_expressions_1.ExprUtils(this.schema, variables);
                        selects = Object.keys(options.select).map(function (id) { return ({
                            id: id,
                            expr: options.select[id],
                            isAggr: exprUtils.getExprAggrStatus(options.select[id]) === "aggregate"
                        }); });
                        orderBys = (options.orderBy || []).map(function (orderBy) { return ({
                            expr: orderBy.expr,
                            isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
                        }); });
                        exprEval = new PromiseExprEvaluator_1.PromiseExprEvaluator(new mwater_expressions_1.ExprEvaluator(this.schema, this.locale, variables, variableValues));
                        _i = 0, evalRows_1 = evalRows;
                        _m.label = 2;
                    case 2:
                        if (!(_i < evalRows_1.length)) return [3 /*break*/, 11];
                        evalRow = evalRows_1[_i];
                        i = 0;
                        _m.label = 3;
                    case 3:
                        if (!(i < selects.length)) return [3 /*break*/, 6];
                        if (!!selects[i].isAggr) return [3 /*break*/, 5];
                        _a = evalRow;
                        _b = "s" + i;
                        return [4 /*yield*/, exprEval.evaluate(selects[i].expr, { row: evalRow.row })];
                    case 4:
                        _a[_b] = _m.sent();
                        _m.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        i = 0;
                        _m.label = 7;
                    case 7:
                        if (!(i < orderBys.length)) return [3 /*break*/, 10];
                        if (!!orderBys[i].isAggr) return [3 /*break*/, 9];
                        _c = evalRow;
                        _d = "o" + i;
                        return [4 /*yield*/, exprEval.evaluate(orderBys[i].expr, { row: evalRow.row })];
                    case 8:
                        _c[_d] = _m.sent();
                        _m.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 7];
                    case 10:
                        _i++;
                        return [3 /*break*/, 2];
                    case 11:
                        if (!(selects.find(function (s) { return s.isAggr; }) || orderBys.find(function (o) { return o.isAggr; }))) return [3 /*break*/, 22];
                        groups = _.groupBy(evalRows, function (evalRow) {
                            // Concat stringified version of all non-aggr values
                            var key = "";
                            for (var i = 0; i < selects.length; i++) {
                                if (!selects[i].isAggr) {
                                    key += ":" + evalRow["s" + i];
                                }
                            }
                            for (var i = 0; i < orderBys.length; i++) {
                                if (!orderBys[i].isAggr) {
                                    key += ":" + evalRow["o" + i];
                                }
                            }
                            return key;
                        });
                        _e = 0, _f = Object.values(groups);
                        _m.label = 12;
                    case 12:
                        if (!(_e < _f.length)) return [3 /*break*/, 21];
                        group = _f[_e];
                        evalRow = group[0];
                        i = 0;
                        _m.label = 13;
                    case 13:
                        if (!(i < selects.length)) return [3 /*break*/, 16];
                        if (!selects[i].isAggr) return [3 /*break*/, 15];
                        _g = evalRow;
                        _h = "s" + i;
                        return [4 /*yield*/, exprEval.evaluate(selects[i].expr, { row: evalRow.row, rows: group.map(function (r) { return r.row; }) })];
                    case 14:
                        _g[_h] = _m.sent();
                        _m.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 13];
                    case 16:
                        i = 0;
                        _m.label = 17;
                    case 17:
                        if (!(i < orderBys.length)) return [3 /*break*/, 20];
                        if (!orderBys[i].isAggr) return [3 /*break*/, 19];
                        _j = evalRow;
                        _k = "o" + i;
                        return [4 /*yield*/, exprEval.evaluate(orderBys[i].expr, { row: evalRow.row, rows: group.map(function (r) { return r.row; }) })];
                    case 18:
                        _j[_k] = _m.sent();
                        _m.label = 19;
                    case 19:
                        i++;
                        return [3 /*break*/, 17];
                    case 20:
                        _e++;
                        return [3 /*break*/, 12];
                    case 21:
                        // Flatten groups into single rows each
                        evalRows = _.map(Object.values(groups), function (group) { return group[0]; });
                        _m.label = 22;
                    case 22:
                        // Order by
                        if (options.orderBy && options.orderBy.length > 0) {
                            evalRows = _.sortByOrder(evalRows, options.orderBy.map(function (orderBy, i) { return function (evalRow) { return evalRow["o" + i]; }; }), options.orderBy.map(function (orderBy) { return orderBy.dir; }));
                        }
                        // Limit
                        if (options.limit) {
                            evalRows = _.take(evalRows, options.limit);
                        }
                        projectedRows = [];
                        for (_l = 0, evalRows_2 = evalRows; _l < evalRows_2.length; _l++) {
                            evalRow = evalRows_2[_l];
                            projectedRow = {};
                            // Project each one
                            for (i = 0; i < selects.length; i++) {
                                projectedRow[selects[i].id] = evalRow["s" + i];
                            }
                            projectedRows.push(projectedRow);
                        }
                        return [2 /*return*/, projectedRows];
                }
            });
        });
    };
    /** Adds a listener which is called with each change to the database */
    VirtualDatabase.prototype.addChangeListener = function (changeListener) {
        this.changeListeners = _.union(this.changeListeners, [changeListener]);
    };
    VirtualDatabase.prototype.removeChangeListener = function (changeListener) {
        this.changeListeners = _.difference(this.changeListeners, [changeListener]);
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
            var txn, pkMapping, _i, _a, mutation, _b, primaryKey;
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
                        return [4 /*yield*/, txn.updateRow(mutation.table, mutation.primaryKey, mutation.updates)];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, txn.removeRow(mutation.table, mutation.primaryKey)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [4 /*yield*/, txn.commit()];
                    case 10:
                        _c.sent();
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
        if (column.type !== "join" && !column.expr) {
            return true;
        }
        if (column.type === "join" && (!column.join.inverse || column.join.type !== "1-n")) {
            return true;
        }
        return false;
    };
    /** Create the rows as needed by ExprEvaluator for a query */
    VirtualDatabase.prototype.queryEvalRows = function (from, where, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () {
            var queryOptions, _i, _a, column, rows, queryCacheKey;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
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
                        queryCacheKey = canonical_json_1.default({ queryOptions: queryOptions, contextVars: contextVars, contextVarValues: contextVarValues });
                        rows = this.cache.get(queryCacheKey);
                        if (!!rows) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.database.query(queryOptions, contextVars, contextVarValues)];
                    case 1:
                        rows = _b.sent();
                        this.cache.set(queryCacheKey, rows);
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.mutateRows(rows, from, where, contextVars, contextVarValues)
                        // Convert to rows as expr evaluator expects
                    ];
                    case 3:
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
        var escapeRegex = function (s) { return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); };
        var json = JSON.stringify(input);
        var _loop_1 = function (tempPk) {
            json = json.replace(new RegExp(escapeRegex(JSON.stringify(tempPk)), "g"), function () { return JSON.stringify(replaceWith(tempPk)); });
        };
        for (var _i = 0, _a = this.tempPrimaryKeys; _i < _a.length; _i++) {
            var tempPk = _a[_i];
            _loop_1(tempPk);
        }
        return JSON.parse(json);
    };
    /** Create a single row structured for evaluation from a row in format { id: <primary key>, c_<column id>: value, ... } */
    VirtualDatabase.prototype.createEvalRow = function (row, from, contextVars, contextVarValues) {
        var _this = this;
        return {
            getPrimaryKey: function () { return Promise.resolve(row.id); },
            getField: function (columnId) { return __awaiter(_this, void 0, void 0, function () {
                var column, joinRows, joinRows, joinRows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            column = this.schema.getColumn(from, columnId);
                            // For non-joins, return simple value
                            if (column.type !== "join") {
                                return [2 /*return*/, row["c_" + columnId]];
                            }
                            if (!(column.join.type === "n-1" || column.join.type === "1-1")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.queryEvalRows(column.join.toTable, {
                                    type: "op", op: "=", table: column.join.toTable, exprs: [
                                        { type: "id", table: column.join.toTable },
                                        { type: "literal", valueType: "id", idTable: column.join.toTable, value: row["c_" + columnId] }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 1:
                            joinRows = _a.sent();
                            return [2 /*return*/, joinRows[0] || null];
                        case 2:
                            if (!(column.join.type !== "1-n" || !column.join.inverse)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.queryEvalRows(column.join.toTable, {
                                    type: "op", op: "=", table: column.join.toTable, exprs: [
                                        { type: "id", table: column.join.toTable },
                                        { type: "literal", valueType: "id", idTable: column.join.toTable, value: row["c_" + columnId] }
                                    ]
                                }, contextVars, contextVarValues)];
                        case 3:
                            joinRows = _a.sent();
                            return [2 /*return*/, joinRows];
                        case 4:
                            if (!(column.join.type === "1-n" && column.join.inverse)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.queryEvalRows(column.join.toTable, {
                                    type: "op", op: "=", table: column.join.toTable, exprs: [
                                        { type: "field", table: column.join.toTable, column: column.join.inverse },
                                        { type: "literal", valueType: "id", idTable: from, value: row.id }
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
            var _loop_2, _i, _a, mutation, filteredRows, exprEval, _b, rows_1, row, evalRow;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Copy rows to be mutated safely
                        rows = rows.slice();
                        _loop_2 = function (mutation) {
                            // Only from correct table
                            if (mutation.table !== from) {
                                return "continue";
                            }
                            if (mutation.type === "add") {
                                var newRow = _.mapKeys(mutation.values, function (v, k) { return "c_" + k; });
                                rows.push(__assign({ id: mutation.primaryKey }, newRow));
                            }
                            // TODO: This is O(nxm) where n is number of rows and m
                            if (mutation.type === "update") {
                                for (var i = 0; i < rows.length; i++) {
                                    if (rows[i].id === mutation.primaryKey) {
                                        var update = _.mapKeys(mutation.updates, function (v, k) { return "c_" + k; });
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
                            _loop_2(mutation);
                        }
                        if (!where) return [3 /*break*/, 5];
                        filteredRows = [];
                        exprEval = new PromiseExprEvaluator_1.PromiseExprEvaluator(new mwater_expressions_1.ExprEvaluator(this.schema));
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
        var primaryKey = uuid_1.v4();
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
        // Clear mutations and transfer to main database
        this.virtualDatabase.mutations = this.virtualDatabase.mutations.concat(this.mutations);
        this.mutations = [];
        for (var _i = 0, _a = this.virtualDatabase.changeListeners; _i < _a.length; _i++) {
            var changeListener = _a[_i];
            changeListener();
        }
        return Promise.resolve();
    };
    return VirtualDatabaseTransaction;
}());
