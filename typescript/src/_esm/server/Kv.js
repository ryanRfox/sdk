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
export function from(kv) {
    return kv;
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
export function memory() {
    const store = new Map();
    return from({
        async delete(key) {
            store.delete(key);
        },
        async get(key) {
            return store.get(key);
        },
        async set(key, value) {
            store.set(key, value);
        },
    });
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
export function cloudflare(kv) {
    return from({
        delete: kv.delete.bind(kv),
        get: kv.get.bind(kv),
        set: kv.put.bind(kv),
    });
}
//# sourceMappingURL=Kv.js.map