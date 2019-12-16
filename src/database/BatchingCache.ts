import canonical from 'canonical-json'

/** Cache that batches multiple identical requests to avoid repeating the same
 * query over and over while the first request is in progress
 */
export class BatchingCache<R, V> {
  cache: { [key: string] : BatchingCacheEntry<R, V> }
  process: (request: R) => Promise<V>

  constructor(process: (request: R) => Promise<V>) {
    this.cache = {}
    this.process = process
  }

  get(request: R): Promise<V> {
    // Check if known
    const key = canonical(request)
    const existing = this.cache[key]

    if (existing) {
      if (existing.status == "complete") {
        return Promise.resolve(existing.value!)
      }
      // Is pending, add to promises
      return new Promise((resolve, reject) => {
        existing.promises.push({ resolve, reject })
      })
    }

    // Create promise
    return new Promise((resolve, reject) => {
      const entry: BatchingCacheEntry<R, V> = {
        promises: [{ resolve, reject }],
        status: "pending",
        request: request
      }

      // Add to cache
      this.cache[key] = entry

      // Perform actual process
      this.process(request).then((value) => {
        // Mark completed
        entry.status = "complete"
        entry.value = value

        // Resolve all promises
        for (const promise of entry.promises) {
          promise.resolve(value)
        }
      }).catch((err) => {
        // Remove from cache
        delete this.cache[key]

        // Reject all promises
        for (const promise of entry.promises) {
          promise.reject(err)
        }
      })
    })
  }
}

interface BatchingCacheEntry<R, V> {
  request: R
  status: "pending" | "complete"
  value?: V
  promises: { resolve: (v: V) => void, reject: (error: any) => void }[]
}