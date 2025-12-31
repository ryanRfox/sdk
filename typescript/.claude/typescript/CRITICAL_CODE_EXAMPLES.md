# Critical Issues - Code Examples and Fixes

## Critical Issue #1: PrivateKeySigner Race Condition

**File:** `test/unit/auth.test.ts` (lines 91-105, 142-164, 386-401)

### The Problem

```typescript
test('should handle chainID retrieval failure gracefully', async () => {
  const failingClient: SignerClient = {
    chainID: vi.fn().mockRejectedValue(new Error('Network error')),
    httpClient: vi.fn(),
  };

  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);

  // ❌ PROBLEM: Arbitrary 10ms sleep - not guaranteed enough!
  await new Promise((resolve) => setTimeout(resolve, 10));

  expect(signer.chainID()).toBe(0);
});
```

### Why This Fails in CI

```typescript
// In slow CI environment:
// 1. Constructor starts async chainID() call
// 2. setTimeout(10) fires before chainID() completes
// 3. signer.chainID() still returns old value or is undefined
// 4. Test flakes randomly

// Result: "Expected 0, got 1337" or "Cannot read property 'chainID' of undefined"
```

### Correct Fix

```typescript
test('should handle chainID retrieval failure gracefully', async () => {
  const failingClient: SignerClient = {
    chainID: vi.fn().mockRejectedValue(new Error('Network error')),
    httpClient: vi.fn(),
  };

  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);

  // ✅ FIXED: Wait for actual condition, not arbitrary time
  await vi.waitFor(() => {
    // signer.chainID() has definitely been called by now
    expect(signer.chainID()).toBe(0);
  }, {
    timeout: 1000,
    interval: 50
  });
});

// Even Better: Make initialization explicit
// const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);
// await signer.ensureInitialized(); // Awaitable initialization
// expect(signer.chainID()).toBe(0);
```

### Production Impact

```typescript
// ACTUAL USAGE:
const signer = new PrivateKeySigner(privateKey, client);
const tx = new Transaction('0x', 21000n, 1n, 0, address);
const signedTx = await signer.signTransaction(tx);

// PROBLEM: If chainID isn't set yet, v value is wrong
// Result: Transaction sent with wrong chain ID
// Contract execution: FAILS SILENTLY or EXECUTED ON WRONG CHAIN
```

---

## Critical Issue #2: ClefSigner Connection Never Verified

**File:** `test/unit/auth.test.ts` (lines 475-497)

### The Problem

```typescript
test('should verify Clef connection', async () => {
  // ❌ Mock returns ANY value - doesn't validate Clef format
  mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

  const address = new Address(TEST_ADDRESS);
  const _signer = new ClefSigner(address, mockClient, CLEF_URL);

  await new Promise((resolve) => setTimeout(resolve, 10));

  expect(mockJsonRpcProvider.send).toHaveBeenCalledWith('account_version', []);
});
```

### Why This Fails in Production

```typescript
// ACTUAL CLEF RESPONSES:
// Success: { version: "1.0", ... }
// Failure: { error: { code: -32000, message: "..." } }
// Timeout: No response for 30 seconds

// Test passes with mock returning: 'Clef version 1.0' (plain string!)
// But real Clef might:
// - Return completely different format
// - Be unreachable (no timeout in mock)
// - Return error that's not handled
// - Return version that's incompatible

// Result: ClefSigner silently fails to connect
// User signs transaction: APPEARS TO WORK but really isn't
// Transaction gets: WRONG SIGNATURE or NO SIGNATURE
```

### Correct Fix

```typescript
test('should verify Clef connection', async () => {
  // ✅ Return realistic Clef response
  const clefVersion = { version: '1.11.0', commit: 'abc123', buildDate: '2025-12-30' };
  mockJsonRpcProvider.send.mockResolvedValueOnce(clefVersion);

  const address = new Address(TEST_ADDRESS);
  const signer = new ClefSigner(address, mockClient, CLEF_URL);

  await vi.waitFor(() => {
    // Verify connection was attempted
    expect(mockJsonRpcProvider.send).toHaveBeenCalledWith('account_version', []);
  }, { timeout: 1000 });

  // ✅ NEW: Verify response was validated
  expect(signer.isConnected()).toBe(true);
});

test('should handle Clef unreachable', async () => {
  // ✅ NEW: Test timeout scenario
  mockJsonRpcProvider.send.mockImplementationOnce(() =>
    new Promise((resolve) => setTimeout(resolve, 5000)) // Long delay
  );

  const address = new Address(TEST_ADDRESS);
  const signer = new ClefSigner(address, mockClient, CLEF_URL);

  // Should detect connection failure
  await expect(signer.ensureConnected()).rejects.toThrow('Clef unreachable');
});

test('should handle Clef error response', async () => {
  // ✅ NEW: Test Clef returning error
  mockJsonRpcProvider.send.mockRejectedValueOnce(
    new Error('Clef: account not found')
  );

  const address = new Address(TEST_ADDRESS);

  // Should throw, not silently fail
  expect(() => new ClefSigner(address, mockClient, CLEF_URL)).toThrow();
});
```

---

## Critical Issue #3: ERC20 ABI Validation Missing

**File:** `test/unit/erc20.test.ts` (lines 24-50, 72-86)

### The Problem

```typescript
beforeEach(() => {
  mockPublicClient = {
    readContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
  } as any;  // ❌ "as any" means no type checking!
});

test('should fetch token name from contract', async () => {
  const expectedName = 'Wrapped Ether';
  vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

  const name = await erc20.name();

  // ❌ Doesn't verify ABI was passed!
  expect(mockPublicClient.readContract).toHaveBeenCalledWith(
    expect.objectContaining({
      address: tokenAddress,
      functionName: 'name',
      // Missing: abi, args, etc.
    })
  );
});
```

### Why This Fails in Production

```typescript
// Test mock accepts readContract with ANY parameters
// Real viem validateReadContractParameters will reject:

// Missing ABI
// { address: tokenAddress, functionName: 'name' }
// ❌ Error: "Missing ABI parameter"

// Wrong ABI
// { address: tokenAddress, functionName: 'name', abi: ERC721_ABI }
// ❌ Error: "Function 'name' not found in ABI"

// Test passes, production fails with cryptic viem errors
```

### Correct Fix

```typescript
test('should fetch token name from contract', async () => {
  const expectedName = 'Wrapped Ether';
  vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

  const name = await erc20.name();

  // ✅ VERIFY all required parameters
  expect(mockPublicClient.readContract).toHaveBeenCalledWith(
    expect.objectContaining({
      address: tokenAddress,
      functionName: 'name',
      abi: ERC20_ABI,  // ✅ NEW: Verify ABI
      args: [],        // ✅ NEW: Verify function has no args
    })
  );
});

test('should use correct ERC20 function selectors', async () => {
  // ✅ NEW: Verify actual function signatures
  expect(mockPublicClient.readContract).toHaveBeenCalledWith(
    expect.objectContaining({
      abi: expect.arrayContaining([
        expect.objectContaining({
          name: 'name',
          type: 'function',
          stateMutability: 'view',
        }),
      ]),
    })
  );
});

test('should fail with wrong ABI', async () => {
  // ✅ NEW: Actually test ABI validation
  const wrongAbi = [{
    name: 'notAFunction',
    type: 'event',
  }];

  const erc20Invalid = new ERC20(tokenAddress, {
    ...mockPublicClient,
    readContract: vi.fn(),
  });

  // Should somehow validate or reject wrong ABI
  // (depends on implementation)
});
```

---

## Critical Issue #4: Event Error Handling Not Verified

**File:** `test/unit/events.test.ts` (lines 285-323, 325-355)

### The Problem

```typescript
test('should decode transfer events and invoke callback', () => {
  const onTransfer = vi.fn();
  const onError = vi.fn();

  let capturedOnLogs;
  mockPublicClient.watchContractEvent.mockImplementation((params) => {
    capturedOnLogs = params.onLogs;
    return vi.fn();
  });

  watchTransfer(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    onTransfer,
    onError,
  });

  const mockLog = { /* valid log */ };
  if (capturedOnLogs) {
    capturedOnLogs([mockLog]);
  }

  // ✅ Tests onTransfer was called
  expect(onTransfer).toHaveBeenCalled();

  // ❌ But NEVER tests onError!
  // onError mock is set up but never verified to be called
});
```

### Why This Fails in Production

```typescript
watchTransfer(publicClient, {
  address: tokenAddress,
  onTransfer: (events) => {
    console.log(`Received ${events.length} transfers`);
  },
  onError: (error) => {
    console.error('Transfer watch error:', error);
  },
});

// When RPC returns malformed log:
// { topics: [], data: '0xinvalid' }

// EXPECTED: onError is called with error message
// ACTUAL: ??? Unknown - never tested

// Possibilities:
// 1. onError is called (good)
// 2. Error is thrown and subscription dies (bad)
// 3. Error is silently ignored (bad)
// 4. Both onError and onTransfer are called (bad)

// TEST DOESN'T VERIFY
```

### Correct Fix

```typescript
test('should call onError for malformed logs', async () => {
  const onTransfer = vi.fn();
  const onError = vi.fn();

  let capturedOnLogs;
  mockPublicClient.watchContractEvent.mockImplementation((params) => {
    capturedOnLogs = params.onLogs;
    return vi.fn();
  });

  watchTransfer(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    onTransfer,
    onError,
  });

  // ✅ NEW: Trigger with malformed log
  const invalidLog = {
    address: MOCK_TOKEN_ADDRESS,
    topics: ['0x' + 'invalid'],
    data: '0xinvalid',
  };

  if (capturedOnLogs) {
    capturedOnLogs([invalidLog]);
  }

  // ✅ NEW: Verify onError was called
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringMatching(/decode|parse|invalid/i),
    })
  );

  // ✅ NEW: Verify onTransfer was NOT called
  expect(onTransfer).not.toHaveBeenCalled();
});

test('should handle mixed valid and invalid logs', async () => {
  // ✅ NEW: Batch with both valid and invalid
  const onTransfer = vi.fn();
  const onError = vi.fn();

  let capturedOnLogs;
  mockPublicClient.watchContractEvent.mockImplementation((params) => {
    capturedOnLogs = params.onLogs;
    return vi.fn();
  });

  watchTransfer(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    onTransfer,
    onError,
  });

  const validLog = { /* valid Transfer event */ };
  const invalidLog = { /* invalid log */ };
  const validLog2 = { /* valid Transfer event */ };

  if (capturedOnLogs) {
    capturedOnLogs([validLog, invalidLog, validLog2]);
  }

  // ✅ Verify both callbacks were triggered
  expect(onTransfer).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ from: MOCK_FROM_ADDRESS }),
      expect.objectContaining({ from: MOCK_TO_ADDRESS }),
    ])
  );
  expect(onError).toHaveBeenCalledWith(expect.any(Error));
});

test('should survive error and continue watching', async () => {
  // ✅ NEW: After error, next valid log should work
  const onTransfer = vi.fn();
  const onError = vi.fn();

  let capturedOnLogs;
  mockPublicClient.watchContractEvent.mockImplementation((params) => {
    capturedOnLogs = params.onLogs;
    return vi.fn(); // Unwatch function
  });

  watchTransfer(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    onTransfer,
    onError,
  });

  // First: Invalid log
  if (capturedOnLogs) {
    capturedOnLogs([{ /* invalid */ }]);
  }
  expect(onError).toHaveBeenCalled();
  onError.mockClear();

  // Second: Valid log (should still work)
  if (capturedOnLogs) {
    capturedOnLogs([{ /* valid */ }]);
  }
  expect(onTransfer).toHaveBeenCalled();

  // ✅ Verify subscription didn't die after first error
});
```

---

## Critical Issue #5: getLogs Chunking Not Tested for Edge Cases

**File:** `test/unit/events.test.ts` (lines 688-823)

### The Problem

```typescript
test('should fetch logs with multiple chunks', async () => {
  const mockLogs1 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1000n }];
  const mockLogs2 = [{ address: MOCK_TOKEN_ADDRESS, blockNumber: 1050n }];

  mockPublicClient.getLogs
    .mockResolvedValueOnce(mockLogs1)
    .mockResolvedValueOnce(mockLogs2);

  const result = await getLogs(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 1000n,
    toBlock: 1100n,
    chunkSize: 50,
  });

  // ✅ Verifies correct number of calls
  expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(2);

  // ❌ But NEVER tests:
  // - No duplicate detection
  // - Block boundaries not verified
  // - RPC "too wide" error never handled
  // - Partial final chunk not tested
});
```

### Why This Fails in Production

```typescript
// EDGE CASE 1: Block boundary issue
// Request: fromBlock: 1000n, toBlock: 1100n, chunkSize: 50
// Expected chunks:
//   1. 1000-1049 (50 blocks)
//   2. 1050-1099 (50 blocks)
//   3. 1100-1100 (1 block)
//
// If implementation does: toBlock - fromBlock != chunkSize
// Might miss block 1100 entirely!

// EDGE CASE 2: RPC "block range too wide"
const result = await getLogs(publicClient, {
  address: tokenAddress,
  fromBlock: 0n,        // Genesis
  toBlock: 10000000n,   // Current
  chunkSize: 100000,    // Too large!
});
// RPC returns: "block range is too wide"
// Test never triggers this, so error handling unknown

// EDGE CASE 3: Duplicate logs from overlapping chunks
// Chunk 1 returns: logs from blocks 1000-1049
// Chunk 2 returns: logs from blocks 1040-1089 (overlap!)
// Result: Logs from 1040-1049 appear twice
// Test mocks don't return duplicates, so not tested

// EDGE CASE 4: Empty result
const result = await getLogs(publicClient, {
  fromBlock: 1000n,
  toBlock: 1010n,
  chunkSize: 5,
});
// If no events happened, returns [] correctly
// But what if chunking calculation breaks on empty chunks?

// EDGE CASE 5: Single block request
const result = await getLogs(publicClient, {
  fromBlock: 5000n,
  toBlock: 5000n,  // Same block
  chunkSize: 100,
});
// Should work but might not if division is wrong
```

### Correct Fix

```typescript
test('should handle block boundary correctly', async () => {
  // ✅ NEW: Test exact boundary calculation
  const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
  mockPublicClient.getLogs.mockResolvedValue(mockLogs);

  const result = await getLogs(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 1000n,
    toBlock: 1100n,
    chunkSize: 50,
  });

  // Verify correct number of chunks needed
  // (1100 - 1000 + 1) / 50 = 101 / 50 = 2.02 -> 3 chunks
  expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(3);

  // Verify last chunk includes final block
  const lastCall = mockPublicClient.getLogs.mock.calls[2][0];
  expect(lastCall.toBlock).toBe(1100n);
});

test('should handle RPC "block range too wide" error', async () => {
  // ✅ NEW: Test adaptive chunking
  let callCount = 0;
  mockPublicClient.getLogs.mockImplementation(async (params) => {
    callCount++;
    if (callCount === 1) {
      // First attempt fails - range too wide
      throw new Error('block range is too wide');
    }
    // Retry with smaller chunk succeeds
    return [{ address: MOCK_TOKEN_ADDRESS }];
  });

  const result = await getLogsAdaptive(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 0n,
    toBlock: 100000n,
    initialChunkSize: 100000,
    minChunkSize: 1000,
  });

  // Should have retried with smaller chunk
  expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(2);
});

test('should eliminate duplicate logs from overlapping chunks', async () => {
  // ✅ NEW: Test overlap handling
  const logs1 = [
    { blockNumber: 1000n, transactionIndex: 0 },
    { blockNumber: 1001n, transactionIndex: 0 },
    { blockNumber: 1049n, transactionIndex: 0 }, // Boundary
  ];
  const logs2 = [
    { blockNumber: 1040n, transactionIndex: 0 }, // Overlap starts
    { blockNumber: 1049n, transactionIndex: 0 }, // Duplicate!
    { blockNumber: 1050n, transactionIndex: 0 },
  ];

  mockPublicClient.getLogs
    .mockResolvedValueOnce(logs1)
    .mockResolvedValueOnce(logs2);

  const result = await getLogs(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 1000n,
    toBlock: 1050n,
    chunkSize: 50,
  });

  // Should deduplicate based on blockNumber + transactionIndex
  expect(result.length).toBe(logs1.length + logs2.length - 1); // 1 duplicate removed
});

test('should handle single-block range', async () => {
  // ✅ NEW: Edge case - toBlock == fromBlock
  const mockLogs = [{ address: MOCK_TOKEN_ADDRESS }];
  mockPublicClient.getLogs.mockResolvedValue(mockLogs);

  const result = await getLogs(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 5000n,
    toBlock: 5000n,  // Same block
    chunkSize: 100,
  });

  expect(mockPublicClient.getLogs).toHaveBeenCalledWith(
    expect.objectContaining({
      fromBlock: 5000n,
      toBlock: 5000n,
    })
  );
  expect(result).toEqual(mockLogs);
});

test('should return empty result when no logs', async () => {
  // ✅ NEW: Empty result case
  mockPublicClient.getLogs.mockResolvedValue([]);

  const result = await getLogs(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    fromBlock: 1000n,
    toBlock: 1100n,
    chunkSize: 50,
  });

  expect(result).toEqual([]);
});
```

---

## Summary

These 5 critical issues represent the biggest gaps in test coverage. Each has real-world impact where tests pass but production code fails:

1. **Race conditions** cause flaky/timing-dependent failures
2. **Unrealistic mocks** hide integration errors
3. **Missing validation** allows wrong parameters through
4. **Incomplete error handling** leaves observable behavior unknown
5. **Untested edge cases** cause failures with real data

**Fix Priority:** 1 > 2 > 3 > 4 > 5
**Estimated Effort:** 8-12 hours total
**Risk if not fixed:** Medium-High - Silent failures in production
