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
        var query, evalRows, exprEval, exprUtils, tempRows, _i, tempRows_1, tempRow, _a, _b, selects, orderBys, _c, tempRows_2, tempRow, i, _d, _e, i, _f, _g, groups, _h, _j, group, tempRow, i, _k, _l, i, _m, _o, projectedRows, _p, tempRows_3, tempRow, projectedRow, i;
        return __generator(this, function (_q) {
            switch (_q.label) {
                case 0:
                    query = options.query, evalRows = options.evalRows, exprEval = options.exprEval, exprUtils = options.exprUtils;
                    tempRows = evalRows.map(function (r) { return ({ row: r }); });
                    if (!query.where) return [3 /*break*/, 5];
                    _i = 0, tempRows_1 = tempRows;
                    _q.label = 1;
                case 1:
                    if (!(_i < tempRows_1.length)) return [3 /*break*/, 4];
                    tempRow = tempRows_1[_i];
                    _a = tempRow;
                    _b = "where";
                    return [4 /*yield*/, exprEval.evaluate(query.where, { row: tempRow.row })];
                case 2:
                    _a[_b] = _q.sent();
                    _q.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    tempRows = tempRows.filter(function (row) { return row["where"] == true; });
                    _q.label = 5;
                case 5:
                    selects = Object.keys(query.select).map(function (id) { return ({
                        id: id,
                        expr: query.select[id],
                        isAggr: exprUtils.getExprAggrStatus(query.select[id]) === "aggregate"
                    }); });
                    orderBys = (query.orderBy || []).map(function (orderBy) { return ({
                        expr: orderBy.expr,
                        isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
                    }); });
                    _c = 0, tempRows_2 = tempRows;
                    _q.label = 6;
                case 6:
                    if (!(_c < tempRows_2.length)) return [3 /*break*/, 15];
                    tempRow = tempRows_2[_c];
                    i = 0;
                    _q.label = 7;
                case 7:
                    if (!(i < selects.length)) return [3 /*break*/, 10];
                    if (!!selects[i].isAggr) return [3 /*break*/, 9];
                    _d = tempRow;
                    _e = "s" + i;
                    return [4 /*yield*/, exprEval.evaluate(selects[i].expr, { row: tempRow.row })];
                case 8:
                    _d[_e] = _q.sent();
                    _q.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 7];
                case 10:
                    i = 0;
                    _q.label = 11;
                case 11:
                    if (!(i < orderBys.length)) return [3 /*break*/, 14];
                    if (!!orderBys[i].isAggr) return [3 /*break*/, 13];
                    _f = tempRow;
                    _g = "o" + i;
                    return [4 /*yield*/, exprEval.evaluate(orderBys[i].expr, { row: tempRow.row })];
                case 12:
                    _f[_g] = _q.sent();
                    _q.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 11];
                case 14:
                    _c++;
                    return [3 /*break*/, 6];
                case 15:
                    if (!(selects.find(function (s) { return s.isAggr; }) || orderBys.find(function (o) { return o.isAggr; }))) return [3 /*break*/, 26];
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
                    _h = 0, _j = Object.values(groups);
                    _q.label = 16;
                case 16:
                    if (!(_h < _j.length)) return [3 /*break*/, 25];
                    group = _j[_h];
                    tempRow = group[0];
                    i = 0;
                    _q.label = 17;
                case 17:
                    if (!(i < selects.length)) return [3 /*break*/, 20];
                    if (!selects[i].isAggr) return [3 /*break*/, 19];
                    _k = tempRow;
                    _l = "s" + i;
                    return [4 /*yield*/, exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: group.map(function (r) { return r.row; }) })];
                case 18:
                    _k[_l] = _q.sent();
                    _q.label = 19;
                case 19:
                    i++;
                    return [3 /*break*/, 17];
                case 20:
                    i = 0;
                    _q.label = 21;
                case 21:
                    if (!(i < orderBys.length)) return [3 /*break*/, 24];
                    if (!orderBys[i].isAggr) return [3 /*break*/, 23];
                    _m = tempRow;
                    _o = "o" + i;
                    return [4 /*yield*/, exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: group.map(function (r) { return r.row; }) })];
                case 22:
                    _m[_o] = _q.sent();
                    _q.label = 23;
                case 23:
                    i++;
                    return [3 /*break*/, 21];
                case 24:
                    _h++;
                    return [3 /*break*/, 16];
                case 25:
                    // Flatten groups into single rows each
                    tempRows = lodash_1.default.map(Object.values(groups), function (group) { return group[0]; });
                    _q.label = 26;
                case 26:
                    // Order by
                    if (query.orderBy && query.orderBy.length > 0) {
                        tempRows = lodash_1.default.sortByOrder(tempRows, query.orderBy.map(function (orderBy, i) { return function (tempRow) { return tempRow["o" + i]; }; }), query.orderBy.map(function (orderBy) { return orderBy.dir; }));
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
