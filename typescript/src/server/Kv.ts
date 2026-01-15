/**
 * A key-value store interface used by server handlers.
 *
 * This type provides a unified abstraction for different KV store implementations,
 * allowing handlers to work with various storage backends. Implementations include:
 * - `Kv.memory()` - In-memory JavaScript Map
 * - `Kv.cloudflare()` - Cloudflare Workers KV namespace
 * - Custom implementations via `Kv.from()`
 *
 * All operations are asynchronous and return Promises.
 */
export type Kv = {
  /**
   * Retrieve a value from the store.
   *
   * @template value - The type of the value to retrieve
   * @param key - The key to look up
   * @returns A Promise resolving to the stored value, or undefined if not found
   */
  get: <value = unknown>(key: string) => Promise<value>
  /**
   * Set a value in the store.
   *
   * @param key - The key to store the value under
   * @param value - The value to store (any type)
   * @returns A Promise that resolves when the value is stored
   */
  set: (key: string, value: unknown) => Promise<void>
  /**
   * Delete a value from the store.
   *
   * @param key - The key to delete
   * @returns A Promise that resolves when the key is deleted
   */
  delete: (key: string) => Promise<void>
}

/**
 * Wraps a KV store that already implements the Kv interface.
 *
 * This is an identity/type-assertion function useful for:
 * - Wrapping custom KV implementations to ensure type safety
 * - Creating type-safe adapters for third-party KV stores
 * - Explicitly marking a store as implementing the Kv interface
 *
 * The function simply returns its input after type validation.
 *
 * @template T - The KV store type (must extend Kv)
 * @param kv - The KV store instance implementing the Kv interface
 * @returns The same KV store instance, typed as T
 *
 * @example
 * ```typescript
 * import { Kv } from '@radiustechsystems/sdk/server';
 *
 * // Wrap a custom KV implementation
 * const myStore = Kv.from({
 *   get: async (key) => myBackend.retrieve(key),
 *   set: async (key, value) => myBackend.store(key, value),
 *   delete: async (key) => myBackend.remove(key),
 * });
 * ```
 */
export function from<T extends Kv>(kv: T): T {
  return kv
}

/**
 * Creates an in-memory KV store backed by a JavaScript Map.
 *
 * Useful for development, testing, and applications that don't require persistent storage.
 * All data is stored in the Node.js process memory and will be cleared on restart.
 *
 * Use this for:
 * - Local development and testing
 * - Temporary credential storage in short-lived processes
 * - Single-instance deployments without persistence requirements
 *
 * For production deployments requiring persistent storage, use `Kv.cloudflare()` or
 * implement a custom adapter with a persistent backend.
 *
 * @returns A new in-memory KV store instance
 *
 * @example
 * ```typescript
 * import { Handler, Kv } from '@radiustechsystems/sdk/server';
 *
 * const keyManager = Handler.keyManager({
 *   kv: Kv.memory(),
 *   path: '/api/credentials',
 * });
 * ```
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
 * Wraps a Cloudflare Workers KV namespace binding to conform to the standard Kv interface.
 * The adapter normalizes the Cloudflare API (which uses `put`) to the standard interface (which uses `set`).
 *
 * Use this in Cloudflare Workers environments where you have access to a KV namespace binding.
 *
 * @param kv - A Cloudflare KV namespace binding (typically passed via environment variables)
 * @returns A KV store instance that uses the Cloudflare KV namespace
 *
 * @example
 * ```typescript
 * // In a Cloudflare Worker:
 * import { Handler, Kv } from '@radiustechsystems/sdk/server';
 *
 * export default {
 *   fetch: async (request, env) => {
 *     const keyManager = Handler.keyManager({
 *       kv: Kv.cloudflare(env.RADIUS_KV),
 *       path: '/api/credentials',
 *     });
 *
 *     return keyManager.fetch(request);
 *   },
 * };
 * ```
 */
export function cloudflare(kv: cloudflare.Parameters): Kv {
  return from({
    delete: kv.delete.bind(kv),
    get: kv.get.bind(kv),
    set: kv.put.bind(kv),
  })
}

/**
 * Cloudflare Workers KV namespace interface.
 *
 * Represents the API of a Cloudflare Workers KV namespace binding, which is what you
 * receive when binding a KV namespace in your Cloudflare Worker environment.
 *
 * The `cloudflare()` adapter function converts this interface to the standard Kv interface
 * by mapping `put` to `set`.
 */
export declare namespace cloudflare {
  /**
   * The Cloudflare KV namespace binding interface.
   *
   * @template value - The type of values stored
   */
  export type Parameters = {
    /**
     * Retrieve a value from the KV store.
     * @template value - The type of the stored value
     */
    get: <value = unknown>(key: string) => Promise<value>
    /**
     * Store a value in the KV store.
     * Called `put` in the native Cloudflare API.
     */
    put: (key: string, value: any) => Promise<void>
    /**
     * Delete a value from the KV store.
     */
    delete: (key: string) => Promise<void>
  }
}
