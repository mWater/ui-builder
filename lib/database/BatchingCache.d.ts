/** Cache that batches multiple identical requests to avoid repeating the same
 * query over and over while the first request is in progress
 */
export declare class BatchingCache<R, V> {
    cache: {
        [key: string]: BatchingCacheEntry<R, V>;
    };
    process: (request: R) => Promise<V>;
    constructor(process: (request: R) => Promise<V>);
    get(request: R): Promise<V>;
}
interface BatchingCacheEntry<R, V> {
    request: R;
    status: "pending" | "complete";
    value?: V;
    promises: {
        resolve: (v: V) => void;
        reject: (error: any) => void;
    }[];
}
export {};
