"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
/** Expression evaluator that is promise-based */
var PromiseExprEvaluator = /** @class */ (function () {
    function PromiseExprEvaluator(exprEvaluator) {
        this.exprEvaluator = exprEvaluator;
    }
    PromiseExprEvaluator.prototype.evaluate = function (expr, context) {
        var _this = this;
        var innerContext = {};
        var callbackifyRow = function (row) {
            return {
                getPrimaryKey: function (callback) {
                    row.getPrimaryKey().then(function (value) { return callback(null, value); }, function (error) { return callback(error); });
                },
                getField: function (columnId, callback) {
                    row.getField(columnId).then(function (value) {
                        // If value is row, callbackify
                        if (value && value.getPrimaryKey) {
                            value = callbackifyRow(value);
                        }
                        else if (_.isArray(value) && value.length > 0 && value[0].getPrimaryKey) {
                            value = value.map(function (r) { return callbackifyRow(r); });
                        }
                        callback(null, value);
                    }, function (error) { return callback(error); });
                }
            };
        };
        if (context.row) {
            innerContext.row = callbackifyRow(context.row);
        }
        if (context.rows) {
            innerContext.rows = context.rows.map(function (r) { return callbackifyRow(r); });
        }
        return new Promise(function (resolve, reject) {
            _this.exprEvaluator.evaluate(expr, innerContext, function (error, value) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(value);
            });
        });
    };
    return PromiseExprEvaluator;
}());
exports.PromiseExprEvaluator = PromiseExprEvaluator;
