"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryCompiler = void 0;
const mwater_expressions_1 = require("mwater-expressions");
const _ = __importStar(require("lodash"));
class QueryCompiler {
    constructor(schema, variables, variableValues) {
        this.schema = schema;
        this.variables = variables;
        this.variableValues = variableValues;
    }
    /** Compiles a query to JsonQL and also returns a function to map the returned
     * rows to the ones requested by the query. This is necessary due to invalid select aliases
     * that queries may have, so we normalize to c0, c1, etc. in the query
     */
    compileQuery(options) {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.schema, this.variables);
        const exprCompiler = new mwater_expressions_1.ExprCompiler(this.schema, this.variables, this.variableValues);
        // Create shell of query
        const query = {
            type: "query",
            selects: [],
            from: exprCompiler.compileTable(options.from, "main"),
            groupBy: [],
            orderBy: []
        };
        if (options.distinct) {
            query.distinct = true;
        }
        const colKeys = _.keys(options.select);
        // Determine if any aggregate
        const isAggr = Object.values(options.select).some(expr => exprUtils.getExprAggrStatus(expr) === "aggregate")
            || (options.orderBy || []).some(order => exprUtils.getExprAggrStatus(order.expr) === "aggregate");
        // For each column
        colKeys.forEach((colKey, colIndex) => {
            const colExpr = options.select[colKey];
            const exprType = exprUtils.getExprType(colExpr);
            let compiledExpr = exprCompiler.compileExpr({ expr: colExpr, tableAlias: "main" });
            // Handle special case of geometry, converting to GeoJSON
            if (exprType === "geometry") {
                // Convert to 4326 (lat/long). Force ::geometry for null
                compiledExpr = {
                    type: "op", op: "::json", exprs: [
                        { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr] },
                                        { type: "op", op: "::integer", exprs: [4326] }
                                    ] }] }
                    ]
                };
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
            options.orderBy.forEach((order, index) => {
                // Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
                query.selects.push({
                    type: "select",
                    expr: exprCompiler.compileExpr({ expr: order.expr, tableAlias: "main" }),
                    alias: `o_${index}`
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
        const rowMapper = (row) => {
            // Transform rows to change c_N to columns keys
            const pairs = Object.entries(row)
                .filter((pair) => pair[0].startsWith("c_"))
                .map(pair => [colKeys[parseInt(pair[0].substr(2))], pair[1]]);
            return _.zipObject(pairs);
        };
        return { jsonql: query, rowMapper };
    }
}
exports.QueryCompiler = QueryCompiler;
