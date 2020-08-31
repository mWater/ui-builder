"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchingCache = void 0;
var canonical_json_1 = __importDefault(require("canonical-json"));
/** Cache that batches multiple identical requests to avoid repeating the same
 * query over and over while the first request is in progress
 */
var BatchingCache = /** @class */ (function () {
    function BatchingCache(process) {
        this.cache = {};
        this.process = process;
    }
    BatchingCache.prototype.get = function (request) {
        var _this = this;
        // Check if known
        var key = canonical_json_1.default(request);
        var existing = this.cache[key];
        if (existing) {
            if (existing.status == "complete") {
                return Promise.resolve(existing.value);
            }
            // Is pending, add to promises
            return new Promise(function (resolve, reject) {
                existing.promises.push({ resolve: resolve, reject: reject });
            });
        }
        // Create promise
        return new Promise(function (resolve, reject) {
            var entry = {
                promises: [{ resolve: resolve, reject: reject }],
                status: "pending",
                request: request
            };
            // Add to cache
            _this.cache[key] = entry;
            // Perform actual process
            _this.process(request).then(function (value) {
                // Mark completed
                entry.status = "complete";
                entry.value = value;
                // Resolve all promises
                for (var _i = 0, _a = entry.promises; _i < _a.length; _i++) {
                    var promise = _a[_i];
                    promise.resolve(value);
                }
            }).catch(function (err) {
                // Remove from cache
                delete _this.cache[key];
                // Reject all promises
                for (var _i = 0, _a = entry.promises; _i < _a.length; _i++) {
                    var promise = _a[_i];
                    promise.reject(err);
                }
            });
        });
    };
    return BatchingCache;
}());
exports.BatchingCache = BatchingCache;
