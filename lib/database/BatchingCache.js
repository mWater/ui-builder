"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchingCache = void 0;
const canonical_json_1 = __importDefault(require("canonical-json"));
/** Cache that batches multiple identical requests to avoid repeating the same
 * query over and over while the first request is in progress
 */
class BatchingCache {
    constructor(process) {
        this.cache = {};
        this.process = process;
    }
    get(request) {
        // Check if known
        const key = (0, canonical_json_1.default)(request);
        const existing = this.cache[key];
        if (existing) {
            if (existing.status == "complete") {
                return Promise.resolve(existing.value);
            }
            // Is pending, add to promises
            return new Promise((resolve, reject) => {
                existing.promises.push({ resolve, reject });
            });
        }
        // Create promise
        return new Promise((resolve, reject) => {
            const entry = {
                promises: [{ resolve, reject }],
                status: "pending",
                request: request
            };
            // Add to cache
            this.cache[key] = entry;
            // Perform actual process
            this.process(request)
                .then((value) => {
                // Mark completed
                entry.status = "complete";
                entry.value = value;
                // Resolve all promises
                for (const promise of entry.promises) {
                    promise.resolve(value);
                }
            })
                .catch((err) => {
                // Remove from cache
                delete this.cache[key];
                // Reject all promises
                for (const promise of entry.promises) {
                    promise.reject(err);
                }
            });
        });
    }
}
exports.BatchingCache = BatchingCache;
