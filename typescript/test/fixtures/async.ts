import { expect, vi } from 'vitest';

/**
 * Default timeout for async operations in tests (milliseconds)
 * @constant
 */
export const DEFAULT_TIMEOUT = 1000;

/**
 * Waits for a condition to be truthy, replacing setTimeout anti-patterns.
 *
 * This helper uses `vi.waitFor()` under the hood to properly handle async
 * state changes and polling in tests, which is more reliable than using
 * setTimeout or manual promise chains.
 *
 * @template T The return type of the condition function
 * @param condition A function that returns a value or promise. The wait completes when this returns a truthy value.
 * @param options Configuration options for the wait behavior
 * @param options.timeout Maximum time to wait in milliseconds (default: DEFAULT_TIMEOUT)
 * @param options.interval How often to check the condition in milliseconds (default: 50ms)
 * @returns A promise that resolves with the truthy value from the condition
 *
 * @example
 * // Instead of this anti-pattern:
 * // await new Promise(resolve => setTimeout(resolve, 1000));
 *
 * // Use this:
 * await waitForCondition(() => myState.isLoaded);
 *
 * @example
 * // With custom timeout and interval:
 * const result = await waitForCondition(
 *   () => {
 *     const value = store.getValue();
 *     return value > 10 ? value : null;
 *   },
 *   { timeout: 2000, interval: 100 }
 * );
 */
export async function waitForCondition<T>(
  condition: () => T | Promise<T>,
  options?: { timeout?: number; interval?: number }
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  const interval = options?.interval ?? 50;

  return vi.waitFor(
    async () => {
      const result = await condition();
      expect(result).toBeTruthy();
      return result;
    },
    { timeout, interval }
  );
}

/**
 * Waits for an async initialization check to succeed.
 *
 * This helper is specifically designed for testing async initialization patterns
 * where you need to verify that a system has been fully initialized before
 * proceeding with assertions. It replaces manual setTimeout-based waiting with
 * proper polling via `vi.waitFor()`.
 *
 * @param checkFn A function that returns true when initialization is complete
 * @param timeout Maximum time to wait in milliseconds (default: DEFAULT_TIMEOUT)
 * @returns A promise that resolves when checkFn returns true
 *
 * @example
 * // Instead of this:
 * // await new Promise(resolve => setTimeout(resolve, 500));
 *
 * // Use this:
 * let initialized = false;
 * setTimeout(() => { initialized = true; }, 100);
 * await waitForAsyncInit(() => initialized);
 *
 * @example
 * // With custom timeout:
 * await waitForAsyncInit(() => service.isReady, 5000);
 */
export async function waitForAsyncInit(
  checkFn: () => boolean,
  timeout?: number
): Promise<void> {
  const finalTimeout = timeout ?? DEFAULT_TIMEOUT;

  return vi.waitFor(
    () => {
      expect(checkFn()).toBe(true);
    },
    { timeout: finalTimeout }
  );
}

/**
 * Waits until a value-returning function returns the expected value.
 *
 * This helper is useful for testing state changes or data fetching where you
 * want to wait until a specific value appears. It uses `vi.waitFor()` internally
 * for reliable async testing without setTimeout anti-patterns.
 *
 * @template T The type of the value being checked
 * @param getValue A function that returns the current value
 * @param expectedValue The value to wait for
 * @param timeout Maximum time to wait in milliseconds (default: DEFAULT_TIMEOUT)
 * @returns A promise that resolves when getValue() returns expectedValue
 *
 * @example
 * // Wait for a state value to change:
 * const state = { count: 0 };
 * setTimeout(() => { state.count = 5; }, 200);
 * await waitForValue(() => state.count, 5);
 *
 * @example
 * // Wait for an async result:
 * const store = { data: null };
 * fetchData().then(data => { store.data = data; });
 * await waitForValue(() => store.data?.id, 123, 3000);
 */
export async function waitForValue<T>(
  getValue: () => T,
  expectedValue: T,
  timeout?: number
): Promise<void> {
  const finalTimeout = timeout ?? DEFAULT_TIMEOUT;

  return vi.waitFor(
    () => {
      expect(getValue()).toEqual(expectedValue);
    },
    { timeout: finalTimeout }
  );
}
