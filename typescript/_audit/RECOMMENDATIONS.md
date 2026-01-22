# Strategic Recommendations for V2 Release

## Overview

This document provides strategic recommendations for the Radius SDK V2 release, organized by priority and effort.

---

## Priority 1: Must Fix Before Release

### 1.1 Add Batch Transaction Limits

**Issue:** H-2 - No maximum batch size
**Effort:** Low (30 min)
**Impact:** Prevents DoS on user systems and RPC endpoints

```typescript
// In sendTransactionBatch.ts
export const DEFAULT_MAX_BATCH_SIZE = 100;

export interface SendTransactionBatchParameters {
  // ... existing
  maxBatchSize?: number;
}

// In function body:
const maxSize = parameters.maxBatchSize ?? DEFAULT_MAX_BATCH_SIZE;
if (transactions.length > maxSize) {
  throw new RadiusError(
    `Batch size ${transactions.length} exceeds maximum of ${maxSize}`,
    {
      metaMessages: [
        'Split your transactions into smaller batches.',
        `Configure with maxBatchSize option if you need larger batches.`,
      ],
    }
  );
}
```

### 1.2 Document Transport Bypass

**Issue:** H-1 - sendTransactionBatch bypasses client transport
**Effort:** Low (15 min)
**Impact:** Sets correct expectations

Add to JSDoc:

```typescript
/**
 * @remarks
 * **Important:** This function uses a direct HTTP fetch() call rather than
 * the client's configured transport. This means:
 * - Custom transport interceptors will not be applied
 * - Transport-level retry logic will not be used
 * - This is necessary because viem's transport doesn't expose batch RPC support
 */
```

---

## Priority 2: Should Fix Before Release

### 2.1 Verify Multicall3 Block Number

**Issue:** M-1 - Suspicious blockCreated value
**Effort:** Very Low (5 min)
**Action:** Query Radius testnet to verify multicall3 deployment block

```bash
# Verify with RPC call
cast call 0xcA11bde05977b3631167028862bE2a173976CA11 \
  "getBlockNumber()" \
  --rpc-url https://rpc.testnet.radiustech.xyz
```

### 2.2 Clarify WebSocket Status

**Issue:** M-2 - WebSocket URLs missing/HTTP fallback
**Effort:** Low (15 min)
**Options:**

Option A - Remove WebSocket if not supported:
```typescript
// Remove createWebSocketTransport or mark as @experimental/@deprecated
```

Option B - Add clear documentation:
```typescript
/**
 * @experimental WebSocket transport for Radius.
 * Note: WebSocket endpoints may not be available on all Radius networks.
 * Falls back to converting HTTP URL to WebSocket URL.
 */
```

### 2.3 Rename getContract to Avoid Confusion

**Issue:** M-3 - Name conflict with viem's getContract
**Effort:** Low (30 min)
**Impact:** Prevents developer confusion

```typescript
// Rename from getContract to typedContract or createRadiusContract
export function typedContract<TAbi extends Abi>(
  client: PublicClient,
  params: GetContractParameters<TAbi>,
): TypedContract<TAbi> {
  // ... same implementation
}
```

### 2.4 Add Timeout to Batch Fetch

**Issue:** M-4 - No timeout on HTTP request
**Effort:** Low (15 min)

```typescript
const DEFAULT_BATCH_TIMEOUT = 30000; // 30 seconds

// In sendTransactionBatch:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), DEFAULT_BATCH_TIMEOUT);

try {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequest),
    signal: controller.signal,
  });
  // ... rest of handling
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    throw new RadiusError('Batch transaction request timed out', {
      cause: error,
    });
  }
  throw error;
} finally {
  clearTimeout(timeoutId);
}
```

---

## Priority 3: Nice to Have

### 3.1 Use Proper Error Types

**Issue:** L-1 - Inconsistent error types
**Effort:** Low (20 min)

Replace generic RadiusError with domain-specific errors:

```typescript
// Gas estimation failure
throw new GasEstimationError(/* ... */);

// Signing failure
throw new SigningError(/* ... */);
```

### 3.2 Add Events to Main Exports

**Issue:** L-4 - Events require subpath import
**Effort:** Very Low (5 min)

```typescript
// In src/index.ts, add:
export * from './events/index.js';
```

### 3.3 Bounded Event Deduplication

**Issue:** L-3 - Memory leak potential
**Effort:** Medium (1 hour)

```typescript
// Create a bounded Set wrapper
class BoundedSet<T> {
  private readonly maxSize: number;
  private readonly set = new Set<T>();

  constructor(maxSize = 10000) {
    this.maxSize = maxSize;
  }

  has(value: T): boolean {
    return this.set.has(value);
  }

  add(value: T): void {
    if (this.set.size >= this.maxSize) {
      // Remove oldest entries (first added)
      const iterator = this.set.values();
      for (let i = 0; i < this.maxSize / 2; i++) {
        this.set.delete(iterator.next().value);
      }
    }
    this.set.add(value);
  }
}
```

---

## Architecture Recommendations

### Consider: Expose Batch RPC Helper

The SDK's batch transaction implementation has a well-designed JSON-RPC batching mechanism. Consider exposing it for general use:

```typescript
export interface BatchRpcRequest {
  method: string;
  params: unknown[];
}

export async function batchRpcCall(
  rpcUrl: string,
  requests: BatchRpcRequest[],
  options?: { timeout?: number }
): Promise<unknown[]> {
  // ... extracted from sendTransactionBatch
}
```

### Consider: Add Retry Logic to Batch

Currently only transport interceptor has retry logic. Batch transactions would benefit from the same:

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    return await sendBatch(/* ... */);
  } catch (error) {
    if (attempt === MAX_RETRIES - 1) throw error;
    if (!isRetryableError(error)) throw error;
    await sleep(RETRY_DELAY * Math.pow(2, attempt));
  }
}
```

---

## Documentation Recommendations

### Add Migration Guide for V1 Users

If there's a V1 SDK, document migration path:

```markdown
# Migrating from V1 to V2

## Key Differences
1. V2 uses viem instead of ethers.js
2. Client creation follows viem patterns
3. Batch transactions use `sendTransactionBatch`

## Code Migration Examples
// V1
const sdk = new RadiusSDK(privateKey);
await sdk.transfer(to, amount);

// V2
const walletClient = createWalletClient({...}).extend(radiusWalletActions());
await walletClient.sendTransaction({ to, value: amount });
```

### Add Troubleshooting Guide

Common issues and solutions:

```markdown
# Troubleshooting

## "Client must have a chain configured"
Ensure you pass chain to createPublicClient/createWalletClient.

## Batch transactions failing
- Check batch size (max 100 by default)
- Verify RPC endpoint supports batching
- Check individual transaction errors in BatchTransactionError.results

## Gas estimation returns MAX_GAS
This is expected on Radius - blocks return gasLimit: 0.
```

---

## Testing Recommendations

### Fix Silent Test Skips

```typescript
// Instead of:
if (balance < 1n) {
  console.log('Skipping...');
  return;
}

// Use:
const { skipOnLowBalance } = await checkTestRequirements();
it.skipIf(skipOnLowBalance)('should send transaction', async () => {
  // ... test
});
```

### Add CI Environment Detection

```typescript
const isCI = process.env.CI === 'true';

if (balance < 1n) {
  if (isCI) {
    throw new Error('CI environment requires funded test account');
  }
  console.warn('Skipping transaction test: insufficient balance');
  return;
}
```

---

## Release Checklist

### Pre-Release

- [ ] Fix H-1 documentation
- [ ] Fix H-2 batch limits
- [ ] Verify M-1 multicall3 block
- [ ] Clarify M-2 WebSocket status
- [ ] Consider M-3 getContract rename
- [ ] Add M-4 timeout to batch
- [ ] Run full test suite with funded account
- [ ] Update CHANGELOG.md
- [ ] Review package.json dependencies

### Post-Release Monitoring

- [ ] Monitor npm download errors
- [ ] Track GitHub issues for API confusion
- [ ] Collect feedback on batch transaction usage
- [ ] Consider WebSocket support demand

---

## Summary

The SDK is well-designed and follows viem patterns correctly. The identified issues are relatively minor and can be addressed with focused effort:

| Priority | Items | Total Effort |
|----------|-------|--------------|
| P1: Must Fix | 2 | ~45 min |
| P2: Should Fix | 4 | ~75 min |
| P3: Nice to Have | 3 | ~85 min |

**Recommended Timeline:**
- Day 1: Fix P1 issues, verify multicall3 block
- Day 2: Fix remaining P2 issues
- Day 3: Address P3 if time permits, final testing
- Day 4: Release
