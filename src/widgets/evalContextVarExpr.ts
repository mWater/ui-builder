import _ from 'lodash'
import { Expr, PromiseExprEvaluator } from "mwater-expressions";
import { getFilteredContextVarValues, InstanceCtx } from "../contexts";
import { QueryOptions } from "../database/Database";
import { ContextVar, createExprVariables } from "./blocks";


/** 
 * Evaluate a context variable expression. 
 * contextVar does not need to be part of the context, but if it is, it will still be handled correctly
 */
export async function evalContextVarExpr(options: {
  contextVar: ContextVar | null, 
  contextVarValue: any,
  expr: Expr, 
  ctx: InstanceCtx
}) {
  const { contextVar, contextVarValue, expr, ctx } = options

  // Null expression has null value
  if (!expr) {
    return null
  }

  // If no context variable, evaluate expression
  if (contextVar == null) {
    return new PromiseExprEvaluator({ 
      schema: ctx.schema, 
      locale: ctx.locale,
      variables: createExprVariables(ctx.contextVars),
      variableValues: ctx.contextVarValues
    }).evaluateSync(expr)
  }

  // Evaluate row expression
  if (contextVar.type == "row") {
    // Simple case for no value
    if (contextVarValue == null) {
      return null
    }

    const table = contextVar.table!

    // Create query to get value
    const queryOptions: QueryOptions = {
      select: {
        value: expr
      },
      from: table,
      where: { 
        type: "op",
        op: "=",
        table: table,
        exprs: [{ type: "id", table: table }, { type: "literal", valueType: "id", idTable: table, value: contextVarValue }]
      }
    }

    // Create contextVars list that includes injected variable, adding it if not already present
    const contextVars = ctx.contextVars.slice()
    const filteredContextVarValues = getFilteredContextVarValues(ctx)
    if (!ctx.contextVars.includes(contextVar)) {
      contextVars.push(contextVar)
      filteredContextVarValues[contextVar.id] = contextVarValue
    }

    // Perform query
    const rows = await ctx.database.query(queryOptions, contextVars, filteredContextVarValues)
    return rows.length > 0 ? rows[0].value : null
  }

  // Evaluate rowset expression
  if (contextVar.type == "rowset") {
    const table = contextVar.table!

    // Create query to get value
    const queryOptions: QueryOptions = {
      select: {
        value: expr
      },
      from: table,
      where: contextVarValue as Expr,
      // If multiple returned, has no value, so use limit of 2
      limit: 2
    }

    // Determine if context variable is already in context
    const isExisting = ctx.contextVars.includes(contextVar)

    // If exists, add the filters
    if (isExisting) {
      queryOptions.where = {
        type: "op",
        table: table,
        op: "and",
        exprs: _.compact([queryOptions.where || null].concat(_.compact(ctx.getFilters(contextVar.id).map(f => f.expr))))
      }
      if (queryOptions.where.exprs.length === 0) {
        queryOptions.where = null
      }
    }

    // Create contextVars list that includes injected variable, adding it if not already present
    const contextVars = ctx.contextVars.slice()
    const filteredContextVarValues = getFilteredContextVarValues(ctx)
    if (!isExisting) {
      contextVars.push(contextVar)
      filteredContextVarValues[contextVar.id] = contextVarValue
    }

    // Perform query
    const rows = await ctx.database.query(queryOptions, contextVars, filteredContextVarValues)
    return rows.length == 1 ? rows[0].value : null
  }

  throw new Error("Context variable type not supported")
}