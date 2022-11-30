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
exports.isTempPrimaryKey = exports.useDatabaseChangeListener = exports.stableSort = exports.isQueryAggregate = exports.getWherePrimaryKeys = exports.getWherePrimaryKey = exports.performEvalQuery = exports.NullDatabase = void 0;
const lodash_1 = __importDefault(require("lodash"));
const stable_1 = __importDefault(require("stable"));
const react_1 = require("react");
/** Database which performs no actions and always returns blank query results */
class NullDatabase {
    query(options, contextVars, contextVarValues) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    /** Adds a listener which is called with each change to the database */
    addChangeListener(changeListener) {
        return;
    }
    removeChangeListener(changeListener) {
        return;
    }
    transaction() {
        return new NullTransaction();
    }
    refresh() {
        return;
    }
}
exports.NullDatabase = NullDatabase;
/** Transaction which performs no actions */
class NullTransaction {
    /** Adds a row, returning the primary key as a promise */
    addRow(table, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    updateRow(table, primaryKey, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    removeRow(table, primaryKey) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
}
/** Evaluates a database query given a set of rows of the type that are needed by the PromiseExprEvaluator.
 * Useful for performing a query on a non-SQL database, e.g. in memory or MongoDb, etc.
 */
function performEvalQuery(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { query, evalRows, exprEval, exprUtils } = options;
        // Create temporary rows to manipulate
        let tempRows = evalRows.map((r) => ({ row: r }));
        // Filter by where clause (in parallel)
        if (query.where) {
            const contextRows = tempRows.map((tr) => tr.row);
            const wherePromises = tempRows.map((tempRow) => exprEval.evaluate(query.where, { row: tempRow.row, rows: contextRows }));
            const whereValues = yield Promise.all(wherePromises);
            tempRows = tempRows.filter((row, index) => whereValues[index] == true);
        }
        // Get list of selects in { id, expr, isAggr } format
        const selects = Object.keys(query.select).map((id) => ({
            id: id,
            expr: query.select[id],
            isAggr: exprUtils.getExprAggrStatus(query.select[id]) === "aggregate"
        }));
        // Get list of orderBys in { expr, isAggr } format
        const orderBys = (query.orderBy || []).map((orderBy) => ({
            expr: orderBy.expr,
            isAggr: exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate"
        }));
        // Evaluate all non-aggr selects and non-aggr orderbys
        const contextRows = tempRows.map((tr) => tr.row);
        for (const tempRow of tempRows) {
            for (let i = 0; i < selects.length; i++) {
                if (!selects[i].isAggr) {
                    tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: contextRows });
                }
            }
            for (let i = 0; i < orderBys.length; i++) {
                if (!orderBys[i].isAggr) {
                    tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: contextRows });
                }
            }
        }
        // Evaluate promises
        for (const tempRow of tempRows) {
            for (let i = 0; i < selects.length; i++) {
                if (!selects[i].isAggr) {
                    tempRow["s" + i] = yield tempRow["s" + i];
                }
            }
            for (let i = 0; i < orderBys.length; i++) {
                if (!orderBys[i].isAggr) {
                    tempRow["o" + i] = yield tempRow["o" + i];
                }
            }
        }
        // If any aggregate expressions, perform transform to aggregate
        if (selects.find((s) => s.isAggr) || orderBys.find((o) => o.isAggr)) {
            // Group by all non-aggregate selects and non-aggregate order bys
            const groups = lodash_1.default.groupBy(tempRows, (tempRow) => {
                // Concat stringified version of all non-aggr values
                let key = "";
                for (let i = 0; i < selects.length; i++) {
                    if (!selects[i].isAggr) {
                        key += ":" + tempRow["s" + i];
                    }
                }
                for (let i = 0; i < orderBys.length; i++) {
                    if (!orderBys[i].isAggr) {
                        key += ":" + tempRow["o" + i];
                    }
                }
                return key;
            });
            // Evaluate each group, adding aggregate expressions to first item of each group
            for (const group of Object.values(groups)) {
                const tempRow = group[0];
                // Evaluate all aggr selects and aggr orderbys
                for (let i = 0; i < selects.length; i++) {
                    if (selects[i].isAggr) {
                        tempRow["s" + i] = exprEval.evaluate(selects[i].expr, { row: tempRow.row, rows: group.map((r) => r.row) });
                    }
                }
                for (let i = 0; i < orderBys.length; i++) {
                    if (orderBys[i].isAggr) {
                        tempRow["o" + i] = exprEval.evaluate(orderBys[i].expr, { row: tempRow.row, rows: group.map((r) => r.row) });
                    }
                }
            }
            // Evaluate promises
            for (const group of Object.values(groups)) {
                const tempRow = group[0];
                // Evaluate all aggr selects and aggr orderbys
                for (let i = 0; i < selects.length; i++) {
                    if (selects[i].isAggr) {
                        tempRow["s" + i] = yield tempRow["s" + i];
                    }
                }
                for (let i = 0; i < orderBys.length; i++) {
                    if (orderBys[i].isAggr) {
                        tempRow["o" + i] = yield tempRow["o" + i];
                    }
                }
            }
            // Flatten groups into single rows each
            tempRows = lodash_1.default.map(Object.values(groups), (group) => group[0]);
        }
        // If all aggregate and no rows, create single row to mirror SQL behaviour of creating single evaluated row
        if (selects.every((s) => s.isAggr) && orderBys.every((o) => o.isAggr) && tempRows.length == 0) {
            const tempRow = {};
            // Evaluate all selects and orderbys
            for (let i = 0; i < selects.length; i++) {
                tempRow["s" + i] = yield exprEval.evaluate(selects[i].expr, { rows: [] });
            }
            for (let i = 0; i < orderBys.length; i++) {
                tempRow["o" + i] = yield exprEval.evaluate(orderBys[i].expr, { rows: [] });
            }
            tempRows.push(tempRow);
        }
        // Order by
        if (query.orderBy && query.orderBy.length > 0) {
            // Sort by orders in reverse to prioritize first
            for (let i = query.orderBy.length - 1; i >= 0; i--) {
                tempRows = stableSort(tempRows, (tempRow) => tempRow["o" + i], query.orderBy[i].dir);
            }
        }
        // Limit
        if (query.limit) {
            tempRows = lodash_1.default.take(tempRows, query.limit);
        }
        // Create selects
        const projectedRows = [];
        for (const tempRow of tempRows) {
            const projectedRow = {};
            // Project each one
            for (let i = 0; i < selects.length; i++) {
                projectedRow[selects[i].id] = tempRow["s" + i];
            }
            projectedRows.push(projectedRow);
        }
        return projectedRows;
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
/** Determine if a where clause expression filters by multiple primary keys, and if so, return the keys */
function getWherePrimaryKeys(where) {
    if (!where) {
        return null;
    }
    // Only match if is a single expression that uses = any
    if (where.type == "op" && where.op == "= any" && where.exprs[0].type == "id" && where.exprs[1].type == "literal") {
        return where.exprs[1].value;
    }
    // And expressions that are collapsible are ok
    if (where.type == "op" && where.op == "and" && where.exprs.length == 1) {
        return getWherePrimaryKeys(where.exprs[0]);
    }
    return null;
}
exports.getWherePrimaryKeys = getWherePrimaryKeys;
/** Determine if a query is aggregate (either select or order clauses) */
function isQueryAggregate(query, exprUtils) {
    for (const select of Object.values(query.select)) {
        if (exprUtils.getExprAggrStatus(select) === "aggregate") {
            return true;
        }
    }
    for (const orderBy of query.orderBy || []) {
        if (exprUtils.getExprAggrStatus(orderBy.expr) === "aggregate") {
            return true;
        }
    }
    return false;
}
exports.isQueryAggregate = isQueryAggregate;
/** Stable sort on field */
function stableSort(items, iteratee, direction) {
    return (0, stable_1.default)(items, (a, b) => direction == "asc" ? normalCompare(iteratee(a), iteratee(b)) : normalCompare(iteratee(b), iteratee(a)));
}
exports.stableSort = stableSort;
/** Compare two values in normal sense of the word (numbers as numbers, strings as strings with locale) */
function normalCompare(a, b) {
    // Null go to last
    if (a == null && b == null) {
        return 0;
    }
    else if (a == null) {
        return 1;
    }
    else if (b == null) {
        return -1;
    }
    if (typeof a == "number" && typeof b == "number") {
        return a > b ? 1 : a < b ? -1 : 0;
    }
    return String(a).localeCompare(b);
}
/** Hook to listen for database changes. Returns an integer that increments with each change */
function useDatabaseChangeListener(database) {
    const [incr, setIncr] = (0, react_1.useState)(0);
    const listener = (0, react_1.useCallback)(() => {
        setIncr((cur) => cur + 1);
    }, []);
    (0, react_1.useEffect)(() => {
        database.addChangeListener(listener);
        return () => {
            database.removeChangeListener(listener);
        };
    }, [database]);
    return incr;
}
exports.useDatabaseChangeListener = useDatabaseChangeListener;
/** Determine if a primary key is a temporary one */
function isTempPrimaryKey(primaryKey) {
    return typeof primaryKey == "string" && primaryKey.match(/^pk_[0-9a-zA-Z]+_temp$/) != null;
}
exports.isTempPrimaryKey = isTempPrimaryKey;
