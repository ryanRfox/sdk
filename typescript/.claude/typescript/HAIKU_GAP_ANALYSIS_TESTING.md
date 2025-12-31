# Radius SDK v2 Test Suite Gap Analysis
## Skeptical Q&A Assessment Report

**Date:** 2025-12-30
**Analyzer Role:** Skeptical Q&A Tester
**Scope:** TypeScript SDK test files covering v2 viem/wagmi migration
**Files Analyzed:**
- `/test/unit/chains.test.ts` (152 lines)
- `/test/unit/auth.test.ts` (1076 lines)
- `/test/unit/erc20.test.ts` (861 lines)
- `/test/unit/events.test.ts` (988 lines)
- `/test/unit/client.test.ts` (331 lines)
- `/test/unit/transport.test.ts` (495 lines)
- `/packages/core/test/unit/react-hooks.test.tsx` (1379 lines)

---

## Executive Summary

The Radius SDK test suite shows **moderate test coverage** with **serious gaps in critical areas**. While basic happy paths are tested, the test suite **masks real bugs through overly simple mocks** and **lacks integration-level verification**. Key findings:

- **Mock Realism:** Mocks are shallow and don't validate actual behavior
- **Edge Cases:** Minimal edge case coverage in async operations and error scenarios
- **Integration:** Tests pass in isolation but would fail in real usage (viem/wagmi integration gaps)
- **Async Anti-patterns:** Excessive use of `setTimeout` with magic numbers instead of proper async patterns
- **Type Safety:** TypeScript isn't leveraged effectively for preventing runtime errors
- **Error Boundaries:** Missing error handling verification in critical paths
- **No Contract Testing:** Events and state mutations aren't verified against expected invariants

**Risk Level:** MEDIUM-HIGH
Tests provide false confidence that code works when deployed.

---

## Critical Issues (Could Cause Real Bugs)

### 1. **Unrealistic Mock for ClefSigner Connection Verification**
**Location:** `auth.test.ts` lines 475-497
**Severity:** CRITICAL

```typescript
test('should verify Clef connection', async () => {
  mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');
  const address = new Address(TEST_ADDRESS);
  const _signer = new ClefSigner(address, mockClient, CLEF_URL);
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(mockJsonRpcProvider.send).toHaveBeenCalledWith('account_version', []);
});
```

**Problem:**
- The mock returns ANY value for `account_version` call
- Real Clef might return different response formats or error
- No validation that Clef actually requires this specific method
- Test doesn't verify the response is actually parsed/handled
- **The test passes if Clef is DOWN** because mock always succeeds

**Impact in Production:**
- ClefSigner could silently fail to connect to actual Clef
- User operations would fail later with cryptic errors
- No early detection of misconfiguration

**Tempo Comparison:**
Tempo tests use actual test environment with real contracts deployed.

### 2. **Async Initialization Race Condition in PrivateKeySigner**
**Location:** `auth.test.ts` lines 91-105, 142-164, 386-401
**Severity:** CRITICAL

```typescript
test('should handle chainID retrieval failure gracefully', async () => {
  const failingClient: SignerClient = {
    chainID: vi.fn().mockRejectedValue(new Error('Network error')),
    httpClient: vi.fn(),
  };

  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(signer.chainID()).toBe(0);
});
```

**Problems:**
1. Constructor calls `client.chainID()` asynchronously but doesn't await it
2. Tests rely on `setTimeout(resolve, 10)` - arbitrary magic number
3. Timing is non-deterministic - 10ms might not be enough in slow CI environments
4. No guarantee chainID is set before async operations use it
5. Error handling in constructor is silent

**Impact in Production:**
```typescript
const signer = new PrivateKeySigner(key, client);
const tx = await signer.signTransaction(tx); // Uses this.chainID - might be 0!
```
Transaction signed with wrong chain ID - contract execution fails silently.

**Better Pattern:**
```typescript
// Instead of:
await new Promise((resolve) => setTimeout(resolve, 10));

// Use:
await vi.waitFor(() => /* condition */, { timeout: 1000 });
// Or better: make chainID initialization sync or awaitable
```

### 3. **ERC20 Mock Doesn't Validate Contract ABI/Interface**
**Location:** `erc20.test.ts` lines 24-50, 72-86
**Severity:** HIGH

```typescript
mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
} as any;  // <-- "as any" bypasses type safety!

// Later:
erc20 = new ERC20(tokenAddress, mockPublicClient);

test('should fetch token name from contract', async () => {
  const expectedName = 'Wrapped Ether';
  vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

  const name = await erc20.name();
  expect(mockPublicClient.readContract).toHaveBeenCalledWith(
    expect.objectContaining({
      address: tokenAddress,
      functionName: 'name',
    })
  );
});
```

**Problems:**
1. Mock doesn't validate that ABI was passed correctly
2. `expect.objectContaining` doesn't check if `abi` field exists
3. Real viem requires valid ABI; test doesn't verify this
4. Mock returns any type; no validation of actual ERC20 interface
5. No verification that correct function selector is used

**Impact in Production:**
```typescript
// Real code might pass wrong ABI or miss required fields
const erc20 = new ERC20(tokenAddress, realPublicClient);
await erc20.name(); // Could fail if viem validation catches what test didn't
```

**What's Missing:**
- ABI validation tests
- Function selector verification
- Type mismatch detection

### 4. **No Error Propagation Verification in watchTransfer/watchApproval**
**Location:** `events.test.ts` lines 285-323, 325-355
**Severity:** HIGH

```typescript
test('should decode transfer events and invoke callback', () => {
  const onTransfer = vi.fn();
  const onError = vi.fn();

  let capturedOnLogs: ((logs: any[]) => void) | undefined;
  mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
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

  expect(onTransfer).toHaveBeenCalled();
});
```

**Problems:**
1. Test doesn't verify WHEN onError is called vs onTransfer
2. No test for mixed batch: [valid_log, invalid_log, valid_log]
3. Error handling logic is never triggered - onError mock is set but never verified to be called with actual error
4. Doesn't test if event subscription survives errors (does it unsubscribe?)
5. No test for exception throwing inside onTransfer callback

**Impact in Production:**
```typescript
watchTransfer(publicClient, {
  address: tokenAddress,
  onTransfer: (events) => {
    // If this throws, does subscription die?
    throw new Error('Processing failed');
  },
  onError: (error) => console.log(error)
});
// Real behavior unknown - could silently stop watching
```

**Missing Tests:**
- Error recovery
- Exception handling in callbacks
- Subscription lifecycle on errors
- Batch processing with errors

### 5. **getLogs Chunking Algorithm Not Validated with Real Block Ranges**
**Location:** `events.test.ts` lines 688-823
**Severity:** MEDIUM-HIGH

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

  expect(mockPublicClient.getLogs).toHaveBeenCalledTimes(2);
});
```

**Problems:**
1. Mock always returns success; no test for RPC "block range too wide" error
2. Mock doesn't validate that block chunks don't overlap
3. No verification that toBlock is inclusive (test doesn't check boundary)
4. Doesn't test case: chunkSize == (toBlock - fromBlock)
5. No verification of edge case: logs returned out of order

**Impact in Production:**
```typescript
// What if real RPC returns:
// Chunk 1: blocks 1000-1049 (50 blocks requested)
// Chunk 2: blocks 1040-1089 (overlap!)
// Result: Duplicate events processed
```

**Not Tested:**
- Duplicate handling
- Block range arithmetic edge cases
- RPC timeout during chunking
- Gas estimation errors during chunked calls

---

## Medium Issues (Best Practice Violations)

### 1. **Excessive setTimeout for Async Coordination**
**Location:** `auth.test.ts` lines 91-105, 142-164, 169-181, 224-243, 417-427
**Impact:** Flaky tests in CI environments

Instead of:
```typescript
await new Promise((resolve) => setTimeout(resolve, 10));
expect(signer.chainID()).toBe(TEST_CHAIN_ID);
```

Should be:
```typescript
await vi.waitFor(() => {
  expect(signer.chainID()).toBe(TEST_CHAIN_ID);
}, { timeout: 1000 });
```

This pattern appears 8+ times in auth tests. Each is a ticking time bomb.

### 2. **Mock Validation Too Permissive**
**Location:** `erc20.test.ts`, `client.test.ts`, `events.test.ts`
**Impact:** Won't catch API contract violations

```typescript
// Problem:
expect(mockPublicClient.readContract).toHaveBeenCalledWith(
  expect.objectContaining({
    address: tokenAddress,
    functionName: 'name',
  })
);

// Should be:
expect(mockPublicClient.readContract).toHaveBeenCalledWith(
  expect.objectContaining({
    address: tokenAddress,
    functionName: 'name',
    abi: expect.any(Array), // <-- Missing!
  })
);
```

### 3. **No Integration Testing Between Signers and Clients**
**Location:** `auth.test.ts`, `client.test.ts`
**Impact:** Signers pass tests but fail with actual RadiusClient

Missing tests:
- Create RadiusClient with PrivateKeySigner
- Sign transaction and execute via client
- Verify chain ID from signer matches client chain

### 4. **React Hooks Tests Heavily Mocked, No Real Hook Behavior**
**Location:** `react-hooks.test.tsx` lines 23-37
**Impact:** Hooks might break with actual wagmi

```typescript
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof wagmi>('wagmi');
  return {
    ...actual,
    useAccount: vi.fn(),
    useBalance: vi.fn(),
    // ... mocking entire wagmi!
  };
});
```

**Problems:**
- Tests don't use real wagmi hooks
- Hook composition with wagmi (useWriteContract → useWaitForTransactionReceipt) never tested
- QueryClient integration is mocked, not real
- Re-render behavior not tested with real React Query
- Dependency arrays in useEffect never validated

**What's Not Tested:**
- Racing conditions in hook updates
- Real React Query cache behavior
- Actual wagmi wallet connection lifecycle
- Multiple hook instances sharing state

### 5. **Type Safety Bypassed with "as any"**
**Location:** `erc20.test.ts` line 29, `client.test.ts` line 108, `transport.test.ts` line 52
**Impact:** False sense of type security

```typescript
mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
} as any;  // <-- This defeats TypeScript!
```

Should properly type mocks:
```typescript
const mockPublicClient = {
  readContract: vi.fn<[params: ReadContractParameters], Promise<any>>(),
  waitForTransactionReceipt: vi.fn<[params: { hash: Hash }], Promise<TransactionReceipt>>(),
} as unknown as PublicClient;
```

### 6. **No Contract Invariant Testing**
**Location:** `erc20.test.ts`
**Impact:** Total supply or balance mutations not verified

Missing tests like:
```typescript
test('transfer should maintain total supply', async () => {
  const initialSupply = await erc20.totalSupply();
  await erc20.transfer(signer, recipient, 100n);
  const finalSupply = await erc20.totalSupply();
  expect(finalSupply).toBe(initialSupply); // Invariant!
});
```

### 7. **No Error Type Verification**
**Location:** `erc20.test.ts` lines 807-834
**Impact:** Won't catch wrong error types thrown

```typescript
test('should propagate readContract errors', async () => {
  const error = new Error('Contract call failed');
  vi.mocked(mockPublicClient.readContract).mockRejectedValueOnce(error);

  await expect(erc20.name()).rejects.toThrow('Contract call failed');
  // Should verify error is not wrapped/transformed
});
```

### 8. **Transport Tests Don't Verify RPC Request Format**
**Location:** `transport.test.ts` lines 393-425
**Impact:** Interceptor might not receive correct JSON-RPC format

```typescript
test('should parse request body correctly', async () => {
  const requestBody = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBalance',
    params: ['0x...', 'latest'],
  });

  // Test verifies response is defined, not that format is correct!
  const response = await roundTripper.roundTrip(request);
  expect(response).toBeDefined();
  // Should verify: interceptor received exact JSON-RPC format
});
```

---

## Minor Issues (Style/Cleanup)

### 1. **Inconsistent Test Naming**
- `test('should...')` vs `it('should...')` (test vs it)
- Mixed in same file: `chains.test.ts` uses `test`, `react-hooks.test.tsx` uses `it`

### 2. **No Test Fixtures/Builders**
Lots of repetitive mock setup:
```typescript
// Repeated in many tests:
const mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
} as any;
```

Should use factory:
```typescript
function createMockPublicClient(overrides = {}) {
  return {
    readContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    ...overrides,
  } as any;
}
```

### 3. **Missing Test Documentation**
Complex tests lack comments explaining what they verify:
```typescript
test('should reduce chunk size on block range too wide error', async () => {
  // What's the expected behavior? When should chunk size reduce?
  // What's the reduction strategy (50%, 25%)?
  // No comments explaining the test intent.
});
```

### 4. **Unused Test Variables**
```typescript
test('should verify Clef connection', async () => {
  mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');
  const address = new Address(TEST_ADDRESS);
  const _signer = new ClefSigner(address, mockClient, CLEF_URL); // Underscore = unused
  // _signer is not used in the test, only side effects tested
});
```

### 5. **Constants Defined But Not Validated**
```typescript
const DEFAULT_POLLING_INTERVAL_MS = 1000;

test('should use DEFAULT_POLLING_INTERVAL_MS value of 1000', () => {
  expect(DEFAULT_POLLING_INTERVAL_MS).toBe(1000);  // Trivial test!
});
```

This test adds no value - it's just checking a constant equals itself.

### 6. **No Setup/Teardown for Test Cleanup**
```typescript
// transport.test.ts has no global.fetch cleanup
test('should handle request without body', async () => {
  global.fetch = vi.fn(() => /* ... */);
  // Later tests might have leftover mocks
});

// Should use:
afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## Comparison with Tempo SDK Patterns

### Tempo's Strengths (Not in Radius Tests)

1. **Real RPC Integration**
   ```typescript
   // Tempo: Uses actual deployed contracts
   const { result } = await renderHook(() =>
     hooks.useGetAllowance({
       account: account.address,
       spender: account2.address,
       token: addresses.alphaUsd,
     }),
   );

   await vi.waitFor(() => expect(result.current.isSuccess).toBeTruthy())
   ```

   vs Radius: All vitest mocks, no real integration

2. **Reactivity Testing**
   ```typescript
   // Tempo tests changing variables and re-renders
   let accountAddress: Address | undefined;
   const { result, rerender } = await renderHook(() =>
     hooks.useGetAllowance({ account: accountAddress, ... }),
   );
   accountAddress = account.address;
   rerender();
   // Verifies hook responds to dependency changes
   ```

   vs Radius: No rerender testing in react-hooks

3. **Enabled/Disabled State Verification**
   ```typescript
   expect(result.current.isEnabled).toBe(false);  // When account undefined
   expect(result.current.isEnabled).toBe(true);   // When set
   ```

   vs Radius: No query enabled/disabled state testing

4. **Actual Transaction Verification**
   ```typescript
   // Tempo: Actually creates policy, verifies state changed
   const result = await policy.createSync(config, { type: 'whitelist' });
   expect(result.receipt).toBeDefined();
   const data = await policy.getData(config, { policyId: result.policyId });
   expect(data.type).toBe('whitelist');
   ```

   vs Radius: Mocks return values, never verify actual state

### Tempo's Weaknesses (Also in Radius)

1. Both use `.js` imports in test configs (not `.ts`)
2. Both rely heavily on test environment setup rather than unit testing
3. Both lack explicit error type testing

---

## Detailed Recommendations

### Priority 1: Fix Critical Race Conditions
```typescript
// BEFORE (auth.test.ts):
test('should return chain ID from client', async () => {
  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);
  await new Promise((resolve) => setTimeout(resolve, 10));
  expect(signer.chainID()).toBe(TEST_CHAIN_ID);
});

// AFTER:
test('should return chain ID from client', async () => {
  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

  // Option A: Use proper async coordination
  await vi.waitFor(() => {
    expect(signer.chainID()).toBe(TEST_CHAIN_ID);
  }, { timeout: 1000 });

  // Option B: Better: Make constructor initialization awaitable
  // await signer.initializeChainId()
});
```

### Priority 2: Add Integration Tests
```typescript
// New test file: test/unit/integration.test.ts
describe('Integration: PrivateKeySigner with RadiusClient', () => {
  test('should sign and verify transaction chain ID matches client', async () => {
    const client = createRadiusClient({ chain: radiusTestnet });
    const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, mockClient);

    const tx = new Transaction('0x', 21000n, 1n, 0, new Address(TEST_ADDRESS));
    const signedTx = await signer.signTransaction(tx);

    // Verify chain ID from signer matches client
    const chainId = await client.getChainId();
    expect(signedTx.v).toMatch(/^(0x)?[0-9a-f]+$/); // Should use client chain
  });
});
```

### Priority 3: Real Hook Testing
```typescript
// Instead of mocking everything:
// test/unit/react-hooks.real.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useRadiusBalance } from '@radiustechsystems/sdk/react';
import { createConfig } from 'wagmi';
import { http } from 'viem';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

describe('useRadiusBalance (Real Wagmi)', () => {
  it('should fetch real balance with mock RPC', async () => {
    const mockRpc = http('https://mock-rpc.example.com');
    const config = createConfig({
      chains: [radiusTestnet],
      transports: { [radiusTestnet.id]: mockRpc },
    });

    // Now test with real wagmi, not mocked
    const { result } = renderHook(
      () => useRadiusBalance({ address: TEST_ADDRESS }),
      { wrapper: (props) => <RadiusProvider config={config}>{props.children}</RadiusProvider> }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### Priority 4: Error Case Coverage
```typescript
describe('Error Handling', () => {
  test('watchTransfer should call onError for malformed logs', async () => {
    const onError = vi.fn();

    let capturedOnLogs;
    mockPublicClient.watchContractEvent.mockImplementation((params) => {
      capturedOnLogs = params.onLogs;
      return vi.fn();
    });

    watchTransfer(mockPublicClient, {
      address: MOCK_TOKEN_ADDRESS,
      onTransfer: vi.fn(),
      onError,
    });

    // Trigger with invalid log
    capturedOnLogs([{ topics: [], data: '0xinvalid' }]);

    // VERIFY error was called
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('decode'),
      })
    );
  });

  test('watchTransfer should continue watching after error', async () => {
    // After error, next valid log should work
  });
});
```

### Priority 5: Type Safety
```typescript
// Replace "as any" with proper typing:
// Before:
mockPublicClient = {
  readContract: vi.fn(),
} as any;

// After:
const mockPublicClient: Partial<PublicClient> = {
  readContract: vi.fn<[ReadContractParameters], Promise<unknown>>(),
};
```

---

## Gap Summary Table

| Area | Radius SDK | Tempo SDK | Risk |
|------|-----------|----------|------|
| Mock Realism | ❌ Very shallow | ✅ Real contracts | HIGH |
| Integration Tests | ❌ None | ✅ Full flow | HIGH |
| Async Patterns | ❌ setTimeout hacks | ✅ Proper waitFor | HIGH |
| Type Safety | ⚠️ "as any" used | ✅ Properly typed | MEDIUM |
| Error Cases | ❌ Minimal | ✅ Comprehensive | MEDIUM |
| React Testing | ⚠️ All mocked | ✅ Real hooks | MEDIUM |
| Contract Invariants | ❌ Never verified | ⚠️ Partially tested | MEDIUM |
| Documentation | ❌ Missing | ⚠️ Minimal | LOW |

---

## Conclusion

The Radius SDK test suite provides **false confidence**. Tests pass because mocks are simple, but real code would likely fail with:
1. Clef connection failures (silent failure)
2. Race conditions in signer initialization (timing-dependent)
3. React hook state synchronization issues (mocked away)
4. Event subscription errors (never propagated)
5. ERC20 contract integration failures (ABI validation skipped)

**Recommendation:** Migrate from mock-heavy unit tests to integration tests that verify the SDK works with actual viem/wagmi clients. Use patterns from Tempo SDK that test real behavior.

**Estimated Work:** 40-60 hours to implement proper integration testing and fix identified issues.
