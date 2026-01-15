/**
 * Represents a key-value store abstraction for the server handlers.
 *
 * This type provides a unified interface for different KV store implementations:
 * - `Kv.memory()` - In-memory store
 * - `Kv.cloudflare()` - Cloudflare Workers KV
 * - `Kv.redis()` - Redis store (future)
 * - `Kv.from()` - Wrap custom KV implementations
 */
export type Kv = {
  /** Retrieve a value from the store. */
  get: <value = unknown>(key: string) => Promise<value>
  /** Set a value in the store. */
  set: (key: string, value: unknown) => Promise<void>
  /** Delete a value from the store. */
  delete: (key: string) => Promise<void>
}

/**
 * Wraps a KV store implementing the Kv interface.
 *
 * This is an identity function useful for creating custom KV adapters
 * or ensuring type safety when working with different KV implementations.
 *
 * @template T - The KV store type
 * @param kv - The KV store instance
 * @returns The same KV store instance
 */
export function from<T extends Kv>(kv: T): T {
  return kv
}

/**
 * Creates an in-memory KV store backed by a JavaScript Map.
 *
 * Useful for development, testing, and applications that don't require
 * persistence. Data is stored in process memory and will be lost on restart.
 *
 * @returns An in-memory KV store instance
 */
export function memory(): Kv {
  const store = new Map<string, unknown>()
  return from({
    async delete(key) {
      store.delete(key)
    },
    async get(key) {
      return store.get(key) as any
    },
    async set(key, value) {
      store.set(key, value)
    },
  })
}

/**
 * Creates a Cloudflare Workers KV store adapter.
 *
 * Wraps a Cloudflare KV namespace binding to conform to the Kv interface.
 * The adapter maps Cloudflare's `put` method to the standard `set` method.
 *
 * @param kv - A Cloudflare KV namespace binding
 * @returns A KV store instance
 */
export function cloudflare(kv: cloudflare.Parameters): Kv {
  return from({
    delete: kv.delete.bind(kv),
    get: kv.get.bind(kv),
    set: kv.put.bind(kv),
  })
}

/**
 * Cloudflare KV namespace parameters type.
 *
 * Represents the interface of a Cloudflare Workers KV namespace binding.
 */
export declare namespace cloudflare {
  export type Parameters = {
    get: <value = unknown>(key: string) => Promise<value>
    put: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
  }
}
