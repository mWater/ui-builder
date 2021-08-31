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
exports.evalContextVarExpr = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const contexts_1 = require("../contexts");
const blocks_1 = require("./blocks");
/**
 * Evaluate a context variable expression.
 * contextVar does not need to be part of the context, but if it is, it will still be handled correctly
 */
function evalContextVarExpr(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { contextVar, contextVarValue, expr, ctx } = options;
        // Null expression has null value
        if (!expr) {
            return null;
        }
        // If no context variable, evaluate expression
        if (contextVar == null) {
            return new mwater_expressions_1.PromiseExprEvaluator({
                schema: ctx.schema,
                locale: ctx.locale,
                variables: (0, blocks_1.createExprVariables)(ctx.contextVars),
                variableValues: (0, blocks_1.createExprVariableValues)(ctx.contextVars, ctx.contextVarValues)
            }).evaluateSync(expr);
        }
        // Evaluate row expression
        if (contextVar.type == "row") {
            // Simple case for no value
            if (contextVarValue == null) {
                return null;
            }
            const table = contextVar.table;
            // Create query to get value
            const queryOptions = {
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
            };
            // Create contextVars list that includes injected variable, adding it if not already present
            const contextVars = ctx.contextVars.slice();
            const filteredContextVarValues = (0, contexts_1.getFilteredContextVarValues)(ctx);
            if (!ctx.contextVars.includes(contextVar)) {
                contextVars.push(contextVar);
                filteredContextVarValues[contextVar.id] = contextVarValue;
            }
            // Perform query
            const rows = yield ctx.database.query(queryOptions, contextVars, filteredContextVarValues);
            return rows.length > 0 ? rows[0].value : null;
        }
        // Evaluate rowset expression
        if (contextVar.type == "rowset") {
            const table = contextVar.table;
            // Determine if aggregate
            const aggrStatus = new mwater_expressions_1.ExprUtils(ctx.schema, (0, blocks_1.createExprVariables)(ctx.contextVars)).getExprAggrStatus(expr);
            // Create query to get value
            const queryOptions = {
                select: {
                    value: expr
                },
                distinct: aggrStatus == "aggregate" ? false : true,
                from: table,
                where: contextVarValue,
                // If multiple returned, has no value, so use limit of 2
                limit: 2
            };
            // Determine if context variable is already in context
            const isExisting = ctx.contextVars.includes(contextVar);
            // If exists, add the filters
            if (isExisting) {
                queryOptions.where = {
                    type: "op",
                    table: table,
                    op: "and",
                    exprs: lodash_1.default.compact([queryOptions.where || null].concat(lodash_1.default.compact(ctx.getFilters(contextVar.id).map(f => f.expr))))
                };
                if (queryOptions.where.exprs.length === 0) {
                    queryOptions.where = null;
                }
            }
            // Create contextVars list that includes injected variable, adding it if not already present
            const contextVars = ctx.contextVars.slice();
            const filteredContextVarValues = (0, contexts_1.getFilteredContextVarValues)(ctx);
            if (!isExisting) {
                contextVars.push(contextVar);
                filteredContextVarValues[contextVar.id] = contextVarValue;
            }
            // Perform query
            const rows = yield ctx.database.query(queryOptions, contextVars, filteredContextVarValues);
            return rows.length == 1 ? rows[0].value : null;
        }
        throw new Error("Context variable type not supported");
    });
}
exports.evalContextVarExpr = evalContextVarExpr;
