import { JsonQL, Schema, ExprUtils, ExprCompiler, Expr } from "mwater-expressions";
import { QueryOptions } from "./database/Database";
import * as _ from "lodash";

export class QueryCompiler {
  schema: Schema

  constructor(schema: Schema) {
    this.schema = schema
  }
  
  compileQuery(options: QueryOptions): JsonQL {
    const exprUtils = new ExprUtils(this.schema)
    const exprCompiler = new ExprCompiler(this.schema)

    // Create shell of query
    const query: JsonQL = {
      type: "query",
      selects: [],
      from: exprCompiler.compileTable(options.from, "main"),
      groupBy: [],
      orderBy: []
    }

    const colKeys = _.keys(options.select)

    // Determine if any aggregate
    const isAggr = Object.values(options.select).some(expr => exprUtils.getExprAggrStatus(expr) === "aggregate") 
      || (options.orderBy || []).some(order => exprUtils.getExprAggrStatus(order.expr) === "aggregate")

    // For each column
    colKeys.forEach((colKey, colIndex) => {
      const colExpr = options.select[colKey]

      const exprType = exprUtils.getExprType(colExpr)
      let compiledExpr = exprCompiler.compileExpr({ expr: colExpr, tableAlias: "main"})

      // Handle special case of geometry, converting to GeoJSON
      if (exprType === "geometry") {
        // Convert to 4326 (lat/long). Force ::geometry for null
        compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr]}, 4326] }] }
      }

      query.selects.push({
        type: "select",
        expr: compiledExpr,
        alias: "c_" + colKey
      })

      // Add group by if not aggregate
      if (isAggr && exprUtils.getExprAggrStatus(colExpr) !== "aggregate") {
        query.groupBy.push(colIndex + 1)
      }
    })

    // Compile orderings
    if (options.orderBy) {
      options.orderBy.forEach((order, index) => {
        // Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
        query.selects.push({
          type: "select",
          expr: exprCompiler.compileExpr({ expr: order.expr, tableAlias: "main" }),
          alias: `o${index}`
        })

        query.orderBy.push({ ordinal: colKeys.length + index + 1, direction: order.dir, nulls: (order.dir === "desc" ? "last" : "first") })

        // Add group by if non-aggregate
        if (isAggr && exprUtils.getExprAggrStatus(order.expr) !== "aggregate") {
          query.groupBy.push(colKeys.length + index + 1)
        }
      })
    }

    // Add limit
    if (options.limit) {
      query.limit = options.limit
    }

    // Add where
    if (options.where) {
      query.where = exprCompiler.compileExpr({ expr: options.where, tableAlias: "main" })
    }
    
    return query
  }
}