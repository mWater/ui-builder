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
var lodash_1 = __importDefault(require("lodash"));
var stable_1 = __importDefault(require("stable"));
/** Database which performs no actions and always returns blank query results */
var NullDatabase = /** @class */ (function () {
    function NullDatabase() {
    }
    NullDatabase.prototype.query = function (options, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, []];
        }); });
    };
    /** Adds a listener which is called with each change to the database */
    NullDatabase.prototype.addChangeListener = function (changeListener) { return; };
    NullDatabase.prototype.removeChangeListener = function (changeListener) { return; };
    NullDatabase.prototype.transaction = function () { return new NullTransaction(); };
    return NullDatabase;
}());
exports.NullDatabase = NullDatabase;
/** Transaction which performs no actions */
var NullTransaction = /** @class */ (function () {
    function NullTransaction() {
    }
    /** Adds a row, returning the primary key as a promise */
    NullTransaction.prototype.addRow = function (table, values) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, null];
        }); });
    };
    NullTransaction.prototype.updateRow = function (table, primaryKey, updates) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    NullTransaction.prototype.removeRow = function (table, primaryKey) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    NullTransaction.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    return NullTransaction;
}());
/** Evaluates a database query given a set of rows of the type that are needed by the ExprEvaluator.
 * Useful for performing a query on a non-SQL database, e.g. in memory or MongoDb, etc.
 */
function performEvalQuery(options) {
    return __awaiter(this, void 0, void 0, function () {
        var query, evalRows, exprEval, exprUtils, tempRows, contextRows_1, wherePromises, whereValues_1, selects, orderBys, contextRows, _i, tempRows_1, tempRow, i, i, _a, tempRows_2, tempRow, i, _b, _c, i, _d, _e, groups, _f, _g, group, tempRow, i, i, _h, _j, group, tempRow, i, _k, _l, i, _m, _o, _loop_1, i, projectedRows, _p, tempRows_3, tempRow, projectedRow, i;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    query = options.query, evalRows = options.evalRows, exprEval = options.exprEval, exprUtils = options.exprUtils;
                    tempRows = evalRows.map(function (r) { return ({ row: r }); });
                    if (!query.where) return [3 /*break*/, 2];
                    contextRows_1 = tempRows.map(function (tr) { return tr.row; });
                    wherePromises = tempRows.map(function (tempRow) { return exprEval.evaluate(query.where, { row: tempRow.row, rows: contextRows_1 }); });
                    return [4 /*yield*/, Promise.all(wherePromises)];
                case 1:
                    whereValues_1 = _q.sent();
                    tempRows = tempRows.filter(function (row, index) { return whereValues_1[index] == true; });
                    _q.label = 2;
                case 2:
                    selects = Object.keys(query.select).map(function (id) { return ({
                        id: id,
                        expr: query.select[id],
                        isAggr: exprUtils.getExprAggrStatus(query.select[id]) === "aggregate"
                    }); });
                    orderBys = (query.orderBy || []).map(function (orderBy) { return ({
                        expr: orderBy.expr,
                        isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
                    }); });
                    contextRows = tempRows.map(function (tr) { return tr.row; });
                    for (_i = 0, tempRows_1 = tempRows; _i < tempRows_1.length; _i++) {
                        tempRow = tempRows_1[_i];
                        for (i = 0; i < selects.length; i++) {
                            if (!selects[i].isAggr) {
                                tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: contextRows });
                            }
                        }
                        for (i = 0; i < orderBys.length; i++) {
                            if (!orderBys[i].isAggr) {
                                tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: contextRows });
                            }
                        }
                    }
                    _a = 0, tempRows_2 = tempRows;
                    _q.label = 3;
                case 3:
                    if (!(_a < tempRows_2.length)) return [3 /*break*/, 12];
                    tempRow = tempRows_2[_a];
                    i = 0;
                    _q.label = 4;
                case 4:
                    if (!(i < selects.length)) return [3 /*break*/, 7];
                    if (!!selects[i].isAggr) return [3 /*break*/, 6];
                    _b = tempRow;
                    _c = "s" + i;
                    return [4 /*yield*/, tempRow["s" + i]];
                case 5:
                    _b[_c] = _q.sent();
                    _q.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 4];
                case 7:
                    i = 0;
                    _q.label = 8;
                case 8:
                    if (!(i < orderBys.length)) return [3 /*break*/, 11];
                    if (!!orderBys[i].isAggr) return [3 /*break*/, 10];
                    _d = tempRow;
                    _e = "o" + i;
                    return [4 /*yield*/, tempRow["o" + i]];
                case 9:
                    _d[_e] = _q.sent();
                    _q.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 8];
                case 11:
                    _a++;
                    return [3 /*break*/, 3];
                case 12:
                    if (!(selects.find(function (s) { return s.isAggr; }) || orderBys.find(function (o) { return o.isAggr; }))) return [3 /*break*/, 23];
                    groups = lodash_1.default.groupBy(tempRows, function (tempRow) {
                        // Concat stringified version of all non-aggr values
                        var key = "";
                        for (var i = 0; i < selects.length; i++) {
                            if (!selects[i].isAggr) {
                                key += ":" + tempRow["s" + i];
                            }
                        }
                        for (var i = 0; i < orderBys.length; i++) {
                            if (!orderBys[i].isAggr) {
                                key += ":" + tempRow["o" + i];
                            }
                        }
                        return key;
                    });
                    // Evaluate each group, adding aggregate expressions to first item of each group
                    for (_f = 0, _g = Object.values(groups); _f < _g.length; _f++) {
                        group = _g[_f];
                        tempRow = group[0];
                        // Evaluate all aggr selects and aggr orderbys
                        for (i = 0; i < selects.length; i++) {
                            if (selects[i].isAggr) {
                                tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: group.map(function (r) { return r.row; }) });
                            }
                        }
                        for (i = 0; i < orderBys.length; i++) {
                            if (orderBys[i].isAggr) {
                                tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: group.map(function (r) { return r.row; }) });
                            }
                        }
                    }
                    _h = 0, _j = Object.values(groups);
                    _q.label = 13;
                case 13:
                    if (!(_h < _j.length)) return [3 /*break*/, 22];
                    group = _j[_h];
                    tempRow = group[0];
                    i = 0;
                    _q.label = 14;
                case 14:
                    if (!(i < selects.length)) return [3 /*break*/, 17];
                    if (!selects[i].isAggr) return [3 /*break*/, 16];
                    _k = tempRow;
                    _l = "s" + i;
                    return [4 /*yield*/, tempRow["s" + i]];
                case 15:
                    _k[_l] = _q.sent();
                    _q.label = 16;
                case 16:
                    i++;
                    return [3 /*break*/, 14];
                case 17:
                    i = 0;
                    _q.label = 18;
                case 18:
                    if (!(i < orderBys.length)) return [3 /*break*/, 21];
                    if (!orderBys[i].isAggr) return [3 /*break*/, 20];
                    _m = tempRow;
                    _o = "o" + i;
                    return [4 /*yield*/, tempRow["o" + i]];
                case 19:
                    _m[_o] = _q.sent();
                    _q.label = 20;
                case 20:
                    i++;
                    return [3 /*break*/, 18];
                case 21:
                    _h++;
                    return [3 /*break*/, 13];
                case 22:
                    // Flatten groups into single rows each
                    tempRows = lodash_1.default.map(Object.values(groups), function (group) { return group[0]; });
                    _q.label = 23;
                case 23:
                    // Order by
                    if (query.orderBy && query.orderBy.length > 0) {
                        _loop_1 = function (i) {
                            tempRows = stableSort(tempRows, function (tempRow) { return tempRow["o" + i]; }, query.orderBy[i].dir);
                        };
                        // Sort by orders in reverse to prioritize first
                        for (i = query.orderBy.length - 1; i >= 0; i--) {
                            _loop_1(i);
                        }
                    }
                    // Limit
                    if (query.limit) {
                        tempRows = lodash_1.default.take(tempRows, query.limit);
                    }
                    projectedRows = [];
                    for (_p = 0, tempRows_3 = tempRows; _p < tempRows_3.length; _p++) {
                        tempRow = tempRows_3[_p];
                        projectedRow = {};
                        // Project each one
                        for (i = 0; i < selects.length; i++) {
                            projectedRow[selects[i].id] = tempRow["s" + i];
                        }
                        projectedRows.push(projectedRow);
                    }
                    return [2 /*return*/, projectedRows];
            }
        });
    });
}
exports.performEvalQuery = performEvalQuery;
/** Determine if a where clause expression filters by primary key, and if so, return the key */
function getWherePrimaryKey(where) {
    if (!where) {
        return null;
    }
    // Only match if is a single expression that uses =
    if (where.type == "op" && where.op == "=" && where.exprs[0].type == "id" && where.exprs[1].type == "literal") {
        return where.exprs[1].value;
    }
    // And expressions that are collapsible are ok
    if (where.type == "op" && where.op == "and" && where.exprs.length == 1) {
        return getWherePrimaryKey(where.exprs[0]);
    }
    return null;
}
exports.getWherePrimaryKey = getWherePrimaryKey;
/** Determine if a query is aggregate (either select or order clauses) */
function isQueryAggregate(query, exprUtils) {
    for (var _i = 0, _a = Object.values(query.select); _i < _a.length; _i++) {
        var select = _a[_i];
        if (exprUtils.getExprAggrStatus(select) === "aggregate") {
            return true;
        }
    }
    for (var _b = 0, _c = query.orderBy || []; _b < _c.length; _b++) {
        var orderBy = _c[_b];
        if (exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate") {
            return true;
        }
    }
    return false;
}
exports.isQueryAggregate = isQueryAggregate;
/** Stable sort on field */
function stableSort(items, iteratee, direction) {
    return stable_1.default(items, function (a, b) { return direction == "asc" ? normalCompare(iteratee(a), iteratee(b)) : normalCompare(iteratee(b), iteratee(a)); });
}
exports.stableSort = stableSort;
/** Compare two values in normal sense of the word (numbers as numbers, strings as strings with locale) */
function normalCompare(a, b) {
    if (typeof a == "number" && typeof b == "number") {
        return a > b ? 1 : (a < b ? -1 : 0);
    }
    return String(a).localeCompare(b);
}
