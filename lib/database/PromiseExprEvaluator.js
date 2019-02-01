"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
class PromiseExprEvaluator {
    constructor(exprEvaluator) {
        this.exprEvaluator = exprEvaluator;
    }
    evaluate(expr, context) {
        const innerContext = {};
        const callbackifyRow = (row) => {
            return {
                getPrimaryKey: (callback) => {
                    row.getPrimaryKey().then((value) => callback(null, value), (error) => callback(error));
                },
                getField: (columnId, callback) => {
                    row.getField(columnId).then((value) => {
                        // If value is row, callbackify
                        if (value && value.getPrimaryKey) {
                            value = callbackifyRow(value);
                        }
                        else if (_.isArray(value) && value.length > 0 && value[0].getPrimaryKey) {
                            value = value.map(r => callbackifyRow(r));
                        }
                        callback(null, value);
                    }, (error) => callback(error));
                }
            };
        };
        if (context.row) {
            innerContext.row = callbackifyRow(context.row);
        }
        if (context.rows) {
            innerContext.rows = context.rows.map(r => callbackifyRow(r));
        }
        return new Promise((resolve, reject) => {
            this.exprEvaluator.evaluate(expr, innerContext, (error, value) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(value);
            });
        });
    }
}
exports.PromiseExprEvaluator = PromiseExprEvaluator;
//# sourceMappingURL=PromiseExprEvaluator.js.map