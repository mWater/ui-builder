"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredContextVarValues = void 0;
const lodash_1 = __importDefault(require("lodash"));
/** Gets context variables with filters baked into rowsets. Use for all queries, as that may depend on rowset filters */
function getFilteredContextVarValues(instanceCtx) {
    const results = {};
    for (const cv of instanceCtx.contextVars) {
        if (cv.type == "rowset") {
            // Create and expression
            const expr = {
                type: "op",
                op: "and",
                table: cv.table,
                exprs: lodash_1.default.compact([instanceCtx.contextVarValues[cv.id]].concat(lodash_1.default.map(instanceCtx.getFilters(cv.id), f => f.expr)))
            };
            if (expr.exprs.length == 1) {
                results[cv.id] = expr.exprs[0];
            }
            else if (expr.exprs.length == 0) {
                results[cv.id] = null;
            }
            else {
                results[cv.id] = expr;
            }
        }
        else {
            results[cv.id] = instanceCtx.contextVarValues[cv.id];
        }
    }
    return results;
}
exports.getFilteredContextVarValues = getFilteredContextVarValues;
