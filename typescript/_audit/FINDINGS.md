# Radius SDK V2 Audit Findings

**Audit Date:** 2026-01-21
**Reaudit Date:** 2026-01-21
**Scope:** `typescript/src/` directory
**Version:** 2.0.0-alpha.9

## Executive Summary

The Radius TypeScript SDK V2 is a well-structured viem extension that follows established patterns. The codebase demonstrates good type safety, proper error handling, and comprehensive test coverage.

**Issue Count by Severity (Post-Fix):**
- Critical: 0
- High: 0 (1 fixed, 1 documented)
- Medium: 1 (4 fixed, 1 not-an-issue)
- Low: 3 (3 fixed)

## Fixed Issues Summary

| ID | Severity | Issue | Status |
|----|----------|-------|--------|
| H-2 | High | No batch size limit | **FIXED** - Default 100, configurable |
| M-4 | Medium | No timeout on batch fetch | **FIXED** - Default 30s, configurable |
| M-5 | Medium | @ts-nocheck in test | **FIXED** - Proper types used |
| L-1 | Low | Generic error for gas estimation | **FIXED** - Uses GasEstimationError |
| L-2 | Low | Missing testnet: false | **FIXED** - Added to mainnet config |
| L-3 | Low | Unbounded event dedup cache | **FIXED** - Max 10k entries with pruning |
| M-1 | Medium | Suspicious multicall3 blockCreated | **NOT AN ISSUE** - Radius uses timestamps |
| H-1 | High | Transport bypass in batch | **DOCUMENTED** - JSDoc @remarks added |
| M-3 | Medium | getContract naming conflict | **FIXED** - Removed, use viem's getContract |

---

## Critical Issues

None identified.

---

## High Severity Issues

### H-1: `sendTransactionBatch` Bypasses Client Transport

**Status:** DOCUMENTED - JSDoc @remarks section added explaining this behavior.

**Location:** `src/actions/sendTransactionBatch.ts:179-183`

**Description:** The `sendTransactionBatch` function uses `fetch()` directly instead of the client's configured transport. This means:
1. Any transport middleware/interceptors won't apply to batch requests
2. Custom transport configurations (logging, retry logic, authentication) are bypassed
3. The `InterceptingTransport` from the transport module won't work with batch operations

**Code:**
```typescript
const response = await fetch(rpcUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(batchRequest),
});
```

**Impact:** Users expecting consistent behavior across all RPC calls will have batch transactions behave differently.

**Recommendation:** Either:
1. Use the client's transport for batch requests (may require viem transport internals)
2. Document this limitation clearly
3. Add optional transport configuration to `sendTransactionBatch`

---

### H-2: No Maximum Batch Size Limit

**Location:** `src/actions/sendTransactionBatch.ts:82-86`

**Description:** There's no upper limit on the number of transactions in a batch. Very large batches could cause:
1. Memory issues when signing many transactions
2. HTTP request timeouts
3. RPC endpoint rejection (many endpoints limit batch size)
4. Gas estimation becoming unreliable

**Current Validation:**
```typescript
if (transactions.length === 0) {
  throw new RadiusError('sendTransactionBatch requires at least one transaction', ...);
}
// No upper limit check
```

**Recommendation:** Add a reasonable maximum batch size (e.g., 100 transactions) with a configurable option:

```typescript
const MAX_BATCH_SIZE = 100;

if (transactions.length > MAX_BATCH_SIZE) {
  throw new RadiusError(`Batch size exceeds maximum of ${MAX_BATCH_SIZE} transactions`, {
    metaMessages: ['Split your transactions into smaller batches.'],
  });
}
```

---

## Medium Severity Issues

### M-1: Suspicious `blockCreated` Value for Multicall3

**Location:** `src/chains/radiusTestnet.ts:40`

**Description:** The `blockCreated` value for multicall3 on testnet is `1768594222351`, which appears to be a Unix timestamp (approximately year 2026) rather than a block number.

**Code:**
```typescript
contracts: {
  multicall3: {
    address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    blockCreated: 1768594222351,  // This looks like a timestamp, not a block number
  },
},
```

**Impact:** Could affect viem's multicall optimization that only uses multicall3 for blocks after `blockCreated`.

**Recommendation:** Verify this is the correct block number where multicall3 was deployed on Radius testnet.

---

### M-2: Missing WebSocket URLs in Chain Configurations

**Location:** `src/chains/radius.ts`, `src/chains/radiusTestnet.ts`

**Description:** Neither chain configuration includes WebSocket URLs. The `createWebSocketTransport` function in `transport/websocket.ts` falls back to converting HTTP URLs to WebSocket URLs, which may not be correct.

**Code in websocket.ts:**
```typescript
// Fallback: convert HTTP URL to WebSocket URL
const httpUrl = chain.rpcUrls.default.http[0];
wsUrl = httpUrl.replace(/^http/, 'ws');  // https://rpc... -> wss://rpc...
```

**Impact:** WebSocket connections may fail if the WebSocket endpoint has a different path.

**Recommendation:** Either:
1. Add WebSocket URLs to chain configs when available
2. Update documentation to clearly state WebSocket is not supported
3. Remove/deprecate WebSocket transport until officially supported

---

### M-3: `getContract` Function Name Conflict with viem

**Status:** FIXED - Removed `src/contracts/` entirely. Use viem's native `getContract()` with `walletClient` for Radius.

**Location:** ~~`src/contracts/typedContract.ts:127`~~ (removed)

**Description:** The SDK exports a `getContract` function that has a different signature than viem's `getContract`. This could cause confusion:

**SDK getContract:**
```typescript
getContract(client, { address, abi })  // client is first param
```

**viem getContract:**
```typescript
getContract({ address, abi, client })  // client is inside params object
```

**Impact:** Developers familiar with viem may use the wrong pattern.

**Recommendation:** Either:
1. Rename to `createTypedContract` or similar to avoid confusion
2. Match viem's signature exactly
3. Export only as `typedContract` (current workaround from index)

---

### M-4: No Timeout on Batch Transaction Fetch

**Location:** `src/actions/sendTransactionBatch.ts:179`

**Description:** The `fetch()` call in `sendTransactionBatch` has no timeout configuration, unlike the `InterceptingTransport` which uses AbortController with a 10-second default.

**Impact:** Batch requests could hang indefinitely on slow or unresponsive RPCs.

**Recommendation:** Add timeout handling:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequest),
    signal: controller.signal,
  });
  // ...
} finally {
  clearTimeout(timeoutId);
}
```

---

### M-5: Test File Uses `@ts-nocheck` Broadly

**Location:** `test/unit/contractAliases.test.ts:1`

**Description:** The test file uses `@ts-nocheck` as a blanket disable for TypeScript checking. While the comment explains it's due to mock types, this could hide real type issues.

**Recommendation:** Use more targeted `// @ts-expect-error` comments only where needed, or create proper mock types.

---

## Low Severity Issues

### L-1: Inconsistent Error Types for Gas Estimation

**Location:** `src/actions/sendTransactionBatch.ts:118-143`

**Description:** Gas estimation errors in `sendTransactionBatch` throw generic `RadiusError` instead of the dedicated `GasEstimationError` from the errors module.

**Recommendation:** Use `GasEstimationError` for gas estimation failures to enable proper error handling:

```typescript
import { GasEstimationError } from '../errors/index.js';

// In gas estimation catch block
throw new GasEstimationError('Gas estimation failed', {
  to: tx.to,
  data: tx.data,
  cause: error,
});
```

---

### L-2: Mainnet Chain Missing `testnet: false`

**Location:** `src/chains/radius.ts`

**Description:** The mainnet chain config doesn't explicitly set `testnet: false`, unlike the testnet config which sets `testnet: true`.

**Impact:** Minor - viem defaults to `false`, but being explicit is clearer.

**Recommendation:** Add `testnet: false` to the mainnet config for consistency.

---

### L-3: Memory Leak Potential in Event Deduplication

**Location:** `src/events/watchApproval.ts:260`, `src/events/watchTransfer.ts:240`

**Description:** The `seenEvents` Set used for deduplication grows unboundedly over the lifetime of the subscription. For long-running applications, this could cause memory issues.

```typescript
const seenEvents = new Set<string>();
// Events are added but never removed
seenEvents.add(key);
```

**Recommendation:** Implement a bounded cache or use a time-based eviction strategy:

```typescript
const MAX_SEEN_EVENTS = 10000;
if (seenEvents.size > MAX_SEEN_EVENTS) {
  const iterator = seenEvents.values();
  for (let i = 0; i < MAX_SEEN_EVENTS / 2; i++) {
    seenEvents.delete(iterator.next().value);
  }
}
```

---

### L-4: Missing Re-export of Events Module in Main Index

**Location:** `src/index.ts`

**Description:** The main index doesn't re-export the events module, only the transport module. Users need to use the subpath export for events.

**Current:**
```typescript
// Transport
export * from './transport/index.js';
// Missing: export * from './events/index.js';
```

**Recommendation:** Either:
1. Add events to main exports
2. Document the subpath import requirement prominently

---

### L-5: `typedContract` Export Naming Inconsistency

**Location:** `src/contracts/typedContract.ts`, `src/index.ts`

**Description:** The file exports `getContract` but the module is called `typedContract`. The main index uses `export * from './contracts/index.js'` which exports `getContract`.

**Recommendation:** Clarify the naming - either:
1. Rename the function to `typedContract`
2. Rename the file to `getContract.ts`

---

### L-6: Integration Tests Skip on Low Balance Without Warning

**Location:** `test/integration/client.integration.test.ts:174`

**Description:** Integration tests silently skip transaction tests when balance is low:

```typescript
if (balance < 1n) {
  console.log('Skipping transaction test: insufficient balance');
  return;  // Test passes without actually testing
}
```

**Impact:** CI/CD could report green tests when transactions aren't actually tested.

**Recommendation:** Use `it.skip()` or fail the test with a clear message in CI environments.

---

## Positive Observations

### Security
- **No private key exposure:** Keys are never logged or exposed in errors
- **Proper use of viem accounts:** Uses `privateKeyToAccount` correctly
- **Good input validation:** Validates addresses, arrays, and required parameters

### Type Safety
- **Strong TypeScript usage:** Generic constraints properly applied
- **Viem type compatibility:** Extends viem types correctly
- **Good use of `as const`:** ABIs typed correctly

### API Design
- **Follows viem patterns:** Decorator pattern matches viem's zkSync/optimism extensions
- **Good error hierarchy:** Extends viem's `BaseError` for ecosystem compatibility
- **Clear module separation:** Actions, decorators, errors, events well organized

### Testing
- **Good unit test coverage:** Core utilities well tested
- **Integration tests exist:** Real network validation
- **Mock patterns correct:** Tests properly isolate units

### Documentation
- **JSDoc comments:** All public APIs documented
- **Examples in comments:** Usage patterns clear
- **Error doc links:** Errors reference documentation paths

---

## Recommendations for V2 Release

### Must Fix (High Severity)
1. Add batch size limit to `sendTransactionBatch`
2. Document or fix transport bypass in batch transactions

### Should Fix (Medium Severity)
3. Verify multicall3 `blockCreated` value
4. Clarify WebSocket support status
5. Resolve `getContract` naming confusion
6. Add timeout to batch fetch

### Nice to Have (Low Severity)
7. Use proper error types consistently
8. Add `testnet: false` to mainnet config
9. Implement bounded event deduplication cache
10. Consider adding events to main exports

---

## Files Reviewed

- `src/index.ts`
- `src/chains/*.ts` (3 files)
- `src/actions/*.ts` (2 files)
- `src/decorators/*.ts` (2 files)
- `src/errors/*.ts` (4 files)
- `src/transport/*.ts` (4 files)
- `src/events/*.ts` (10 files including tests)
- `src/contracts/*.ts` (2 files)
- `test/unit/*.ts` (3 files)
- `test/integration/*.ts` (3 files)

**Total Lines Reviewed:** ~5,660 source + ~1,900 test lines
