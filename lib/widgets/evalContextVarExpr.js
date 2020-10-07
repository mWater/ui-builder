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
exports.evalContextVarExpr = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var contexts_1 = require("../contexts");
var blocks_1 = require("./blocks");
/**
 * Evaluate a context variable expression.
 * contextVar does not need to be part of the context, but if it is, it will still be handled correctly
 */
function evalContextVarExpr(options) {
    return __awaiter(this, void 0, void 0, function () {
        var contextVar, contextVarValue, expr, ctx, table, queryOptions, contextVars, filteredContextVarValues, rows, table, queryOptions, isExisting, contextVars, filteredContextVarValues, rows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    contextVar = options.contextVar, contextVarValue = options.contextVarValue, expr = options.expr, ctx = options.ctx;
                    // Null expression has null value
                    if (!expr) {
                        return [2 /*return*/, null];
                    }
                    // If no context variable, evaluate expression
                    if (contextVar == null) {
                        return [2 /*return*/, new mwater_expressions_1.PromiseExprEvaluator({
                                schema: ctx.schema,
                                locale: ctx.locale,
                                variables: blocks_1.createExprVariables(ctx.contextVars),
                                variableValues: ctx.contextVarValues
                            }).evaluateSync(expr)];
                    }
                    if (!(contextVar.type == "row")) return [3 /*break*/, 2];
                    // Simple case for no value
                    if (contextVarValue == null) {
                        return [2 /*return*/, null];
                    }
                    table = contextVar.table;
                    queryOptions = {
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
                    contextVars = ctx.contextVars.slice();
                    filteredContextVarValues = contexts_1.getFilteredContextVarValues(ctx);
                    if (!ctx.contextVars.includes(contextVar)) {
                        contextVars.push(contextVar);
                        filteredContextVarValues[contextVar.id] = contextVarValue;
                    }
                    return [4 /*yield*/, ctx.database.query(queryOptions, contextVars, filteredContextVarValues)];
                case 1:
                    rows = _a.sent();
                    return [2 /*return*/, rows.length > 0 ? rows[0].value : null];
                case 2:
                    if (!(contextVar.type == "rowset")) return [3 /*break*/, 4];
                    table = contextVar.table;
                    queryOptions = {
                        select: {
                            value: expr
                        },
                        from: table,
                        where: contextVarValue,
                        // If multiple returned, has no value, so use limit of 2
                        limit: 2
                    };
                    isExisting = ctx.contextVars.includes(contextVar);
                    // If exists, add the filters
                    if (isExisting) {
                        queryOptions.where = {
                            type: "op",
                            table: table,
                            op: "and",
                            exprs: lodash_1.default.compact([queryOptions.where || null].concat(lodash_1.default.compact(ctx.getFilters(contextVar.id).map(function (f) { return f.expr; }))))
                        };
                        if (queryOptions.where.exprs.length === 0) {
                            queryOptions.where = null;
                        }
                    }
                    contextVars = ctx.contextVars.slice();
                    filteredContextVarValues = contexts_1.getFilteredContextVarValues(ctx);
                    if (!isExisting) {
                        contextVars.push(contextVar);
                        filteredContextVarValues[contextVar.id] = contextVarValue;
                    }
                    return [4 /*yield*/, ctx.database.query(queryOptions, contextVars, filteredContextVarValues)];
                case 3:
                    rows = _a.sent();
                    return [2 /*return*/, rows.length == 1 ? rows[0].value : null];
                case 4: throw new Error("Context variable type not supported");
            }
        });
    });
}
exports.evalContextVarExpr = evalContextVarExpr;
