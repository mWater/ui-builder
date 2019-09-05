"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mwater_expressions_1 = require("mwater-expressions");
var _ = __importStar(require("lodash"));
var QueryCompiler = /** @class */ (function () {
    function QueryCompiler(schema, variables, variableValues) {
        this.schema = schema;
        this.variables = variables;
        this.variableValues = variableValues;
    }
    /** Compiles a query to JsonQL and also returns a function to map the returned
     * rows to the ones requested by the query. This is necessary due to invalid select aliases
     * that queries may have, so we normalize to c0, c1, etc. in the query
     */
    QueryCompiler.prototype.compileQuery = function (options) {
        var exprUtils = new mwater_expressions_1.ExprUtils(this.schema, this.variables);
        var exprCompiler = new mwater_expressions_1.ExprCompiler(this.schema, this.variables, this.variableValues);
        // Create shell of query
        var query = {
            type: "query",
            selects: [],
            from: exprCompiler.compileTable(options.from, "main"),
            groupBy: [],
            orderBy: []
        };
        if (options.distinct) {
            query.distinct = true;
        }
        var colKeys = _.keys(options.select);
        // Determine if any aggregate
        var isAggr = Object.values(options.select).some(function (expr) { return exprUtils.getExprAggrStatus(expr) === "aggregate"; })
            || (options.orderBy || []).some(function (order) { return exprUtils.getExprAggrStatus(order.expr) === "aggregate"; });
        // For each column
        colKeys.forEach(function (colKey, colIndex) {
            var colExpr = options.select[colKey];
            var exprType = exprUtils.getExprType(colExpr);
            var compiledExpr = exprCompiler.compileExpr({ expr: colExpr, tableAlias: "main" });
            // Handle special case of geometry, converting to GeoJSON
            if (exprType === "geometry") {
                // Convert to 4326 (lat/long). Force ::geometry for null
                compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr] }, 4326] }] };
            }
            query.selects.push({
                type: "select",
                expr: compiledExpr,
                alias: "c_" + colIndex
            });
            // Add group by if not aggregate
            if (isAggr && exprUtils.getExprAggrStatus(colExpr) !== "aggregate") {
                query.groupBy.push(colIndex + 1);
            }
        });
        // Compile orderings
        if (options.orderBy) {
            options.orderBy.forEach(function (order, index) {
                // Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
                query.selects.push({
                    type: "select",
                    expr: exprCompiler.compileExpr({ expr: order.expr, tableAlias: "main" }),
                    alias: "o_" + index
                });
                query.orderBy.push({ ordinal: colKeys.length + index + 1, direction: order.dir, nulls: (order.dir === "desc" ? "last" : "first") });
                // Add group by if non-aggregate
                if (isAggr && exprUtils.getExprAggrStatus(order.expr) !== "aggregate") {
                    query.groupBy.push(colKeys.length + index + 1);
                }
            });
        }
        // Add limit
        if (options.limit) {
            query.limit = options.limit;
        }
        // Add where
        if (options.where) {
            query.where = exprCompiler.compileExpr({ expr: options.where, tableAlias: "main" });
        }
        // Create row mapper
        var rowMapper = function (row) {
            // Transform rows to change c_N to columns keys
            var pairs = Object.entries(row)
                .filter(function (pair) { return pair[0].startsWith("c_"); })
                .map(function (pair) { return [colKeys[parseInt(pair[0].substr(2))], pair[1]]; });
            return _.zipObject(pairs);
        };
        return { jsonql: query, rowMapper: rowMapper };
    };
    return QueryCompiler;
}());
exports.QueryCompiler = QueryCompiler;
