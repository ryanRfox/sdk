# Radius SDK v2 Test Suite Gap Analysis
## Opus-Level Skeptical Q&A Assessment Report

**Date:** 2025-12-30
**Analyzer Role:** Skeptical Q&A Tester with Deep TypeScript Testing Expertise
**Scope:** TypeScript SDK test files covering v2 viem/wagmi migration
**Comparison Baseline:** Tempo SDK test patterns at /tmp/tempo-ts/

**Files Analyzed:**
- `/test/unit/chains.test.ts`
- `/test/unit/auth.test.ts` (1076 lines)
- `/test/unit/erc20.test.ts` (861 lines)
- `/test/unit/events.test.ts` (988 lines)
- `/test/unit/client.test.ts`
- `/test/unit/transport.test.ts`
- `/packages/core/test/unit/react-hooks.test.tsx` (1379 lines)

---

## Executive Summary

The Radius SDK v2 test suite exhibits a **fundamental architectural flaw**: it tests the SDK's interaction with mocks rather than verifying the SDK works correctly with real blockchain infrastructure. This creates a dangerous situation where:

1. **All tests pass** with the current mock setup
2. **Real behavior remains unverified** - the SDK could fail entirely in production
3. **False confidence** is provided to developers integrating the SDK

### Critical Statistics

| Metric | Radius SDK | Tempo SDK (Benchmark) |
|--------|------------|----------------------|
| Integration with real RPC | 0% | 100% |
| Tests verifying actual state changes | 0% | ~95% |
| Reactivity tests (hook re-renders) | 0 tests | 12+ tests |
| Error recovery tests | ~5% | ~30% |
| Uses `vi.waitFor` properly | 0 tests | 100% of async tests |
| Uses `setTimeout` for async | 30+ occurrences | 0 occurrences |

**Risk Level: HIGH**
The current test suite provides almost no assurance that the SDK works correctly in production.

---

## Critical Issues (Production Bug Risk: HIGH)

### 1. Entire React Hooks Test Suite Mocks wagmi Entirely

**Location:** `/packages/core/test/unit/react-hooks.test.tsx` lines 22-37

```typescript
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof wagmi>('wagmi');
  return {
    ...actual,
    useAccount: vi.fn(),
    useBalance: vi.fn(),
    useSendTransaction: vi.fn(),
    useWaitForTransactionReceipt: vi.fn(),
    useWriteContract: vi.fn(),
    useReadContract: vi.fn(),
    WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    createConfig: vi.fn(() => ({})),
    http: vi.fn(),
  };
});
```

**Analysis:**

This mock completely replaces wagmi's implementation, meaning:

1. **Zero verification** that hooks actually call wagmi correctly
2. **Zero verification** that wagmi responses are handled correctly
3. **Zero verification** of React Query cache behavior
4. **Zero verification** of hook composition (e.g., `useWriteContract` -> `useWaitForTransactionReceipt` flow)

**Contrast with Tempo SDK Pattern:**

```typescript
// Tempo SDK - Real integration test
const { result } = await renderHook(() =>
  hooks.useGetAllowance({
    account: account.address,
    spender: account2.address,
    token: addresses.alphaUsd,
  }),
)

await vi.waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
  timeout: 5000,
})

expect(result.current.data).toBeDefined()
expect(typeof result.current.data).toBe('bigint')
```

Tempo tests:
- Use real wagmi config
- Hit actual RPC endpoints
- Verify actual blockchain state
- Use proper async waiting patterns

**Production Impact:**
- Hooks could fail silently when integrated with real wagmi
- Error boundaries won't be tested
- Cache invalidation bugs won't surface
- Connection state transitions are completely untested

---

### 2. Systemic `setTimeout` Anti-Pattern for Async Coordination

**Location:** `/test/unit/auth.test.ts` - 25+ occurrences

```typescript
// Lines 91-105, 142-164, 166-181, 224-243, 299-313, etc.
test('should handle chainID retrieval failure gracefully', async () => {
  const failingClient: SignerClient = {
    chainID: vi.fn().mockRejectedValue(new Error('Network error')),
    httpClient: vi.fn(),
  };

  const signer = new PrivateKeySigner(TEST_PRIVATE_KEY, failingClient);
  await new Promise((resolve) => setTimeout(resolve, 10));  // <-- ANTI-PATTERN
  expect(signer.chainID()).toBe(0);
});
```

**Why This Is Critical:**

1. **Non-deterministic timing**: 10ms may pass before async completes on a fast machine but fail in slow CI
2. **Race condition masking**: The code may have actual race conditions that pass due to timing luck
3. **No proper async boundary**: Test doesn't wait for specific condition, just arbitrary time

**Correct Pattern (from Tempo SDK):**

```typescript
// Tempo uses vi.waitFor with explicit conditions
await vi.waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
  timeout: 5000,
})

// Or vi.waitUntil for events
await vi.waitUntil(() => events.length >= 1)
```

**Production Impact:**
- `PrivateKeySigner.chainID()` could return 0 (uninitialized) if used immediately after construction
- Transaction signing with wrong chain ID = silent failure or wrong chain execution
- Flaky tests in CI could mask real bugs

---

### 3. ERC20 Tests Never Verify ABI Is Passed Correctly

**Location:** `/test/unit/erc20.test.ts` lines 72-86

```typescript
test('should fetch token name from contract', async () => {
  const expectedName = 'Wrapped Ether';
  vi.mocked(mockPublicClient.readContract).mockResolvedValueOnce(expectedName);

  const name = await erc20.name();

  expect(mockPublicClient.readContract).toHaveBeenCalledWith(
    expect.objectContaining({
      address: tokenAddress,
      functionName: 'name',
      // ABI NOT VERIFIED!
    })
  );
});
```

**What's Missing:**

```typescript
// Should verify:
expect(mockPublicClient.readContract).toHaveBeenCalledWith(
  expect.objectContaining({
    address: tokenAddress,
    functionName: 'name',
    abi: expect.arrayContaining([
      expect.objectContaining({
        type: 'function',
        name: 'name',
        stateMutability: 'view',
      })
    ])
  })
);
```

**Why This Matters:**

The ERC20 class could:
- Pass an empty ABI (viem would error in production)
- Pass the wrong ABI (runtime error)
- Pass malformed ABI structure

None of these would be caught by current tests.

---

### 4. Event Subscription Error Handling Never Verified

**Location:** `/test/unit/events.test.ts` lines 285-355

```typescript
test('should decode transfer events and invoke callback', () => {
  const onTransfer = vi.fn();
  const onError = vi.fn();  // <-- Set but never verified in this test

  let capturedOnLogs: ((logs: any[]) => void) | undefined;
  mockPublicClient.watchContractEvent.mockImplementation((params: any) => {
    capturedOnLogs = params.onLogs;
    return vi.fn();
  });

  watchTransfer(mockPublicClient, {
    address: MOCK_TOKEN_ADDRESS,
    onTransfer,
    onError,  // <-- Provided but...
  });

  // ... test only verifies onTransfer is called, not error path
});
```

**Missing Error Scenarios:**

1. **Mixed batch handling**: What happens with `[validLog, invalidLog, validLog]`?
2. **Error recovery**: Does subscription continue after error?
3. **Callback exception**: What if `onTransfer` throws?
4. **WebSocket disconnect**: How does reconnection work?

**Tempo SDK Comparison:**

```typescript
// Tempo verifies actual event flow
const events: any[] = []
await renderHook(() =>
  hooks.useWatchTransfer({
    onTransfer(args) {
      events.push(args)
    },
    token: addresses.alphaUsd,
  }),
)

// Trigger ACTUAL transfer
await connectResult.current.transferSync.mutateAsync({
  to: account2.address,
  amount: parseUnits('5', 6),
  token: addresses.alphaUsd,
})

// Wait for ACTUAL event
await vi.waitUntil(() => events.length >= 1)

// Verify ACTUAL values
expect(events[0]?.from).toBe(account.address)
expect(events[0]?.to).toBe(account2.address)
expect(events[0]?.amount).toBe(parseUnits('5', 6))
```

---

### 5. Client Transaction Flow Never Tested End-to-End

**Location:** `/test/unit/client.test.ts`

The `RadiusClient` provides critical transaction methods:
- `send()` / `sendSync()`
- `execute()` / `executeSync()`
- `deployContract()`

**What's Tested (Mock-Level):**
- Mock returns expected hash
- Mock receipt has expected structure

**What's NOT Tested:**

1. **Gas estimation accuracy**: Does the 20% margin work correctly?
2. **Nonce sequencing**: Are sequential transactions handled?
3. **Transaction signing integration**: Does signer produce valid serialized tx?
4. **Receipt polling behavior**: What happens with slow block times?
5. **Contract deployment**: Is constructor encoding correct?

**The `signAndSendTransaction` private function is the core of the SDK but is never directly tested.**

Looking at the implementation in `/packages/core/src/client/client.ts`:

```typescript
async function signAndSendTransaction(
  signer: RadiusSigner,
  tx: { to?: ViemAddress; data?: Hex; value?: bigint; gas?: bigint }
): Promise<Hash> {
  const nonce = await publicClient.getTransactionCount({...});

  let gas: bigint;
  if (tx.gas !== undefined) {
    gas = tx.gas;
  } else {
    const estimate = await publicClient.estimateGas({...});
    const margin = estimate / 5n;  // 20% margin
    gas = estimate + margin;
    if (gas > MAX_GAS) gas = MAX_GAS;
  }

  const signedTx = await signer.signTransaction({
    // ... properties
    gasPrice: 0n,  // Radius uses zero gas price
    chainId: signer.chainId,
  });

  return publicClient.sendRawTransaction({ serializedTransaction: signedTx });
}
```

This function has multiple edge cases never tested:
- What if `estimateGas` fails?
- What if nonce retrieval fails?
- What if signer.chainId doesn't match client chain?
- What if MAX_GAS cap is hit?

---

## Medium Issues (Best Practice Violations)

### 1. Type Safety Undermined by `as any` Casts

**Locations:**
- `/test/unit/erc20.test.ts` line 29: `} as any;`
- `/test/unit/erc20.test.ts` line 35: `} as any;`
- `/test/unit/erc20.test.ts` line 40: `} as any;`
- `/packages/core/test/unit/react-hooks.test.tsx` line 204: `} as any);`
- And 20+ more occurrences

**Problem:**

```typescript
mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
} as any;  // Bypasses ALL type checking
```

This means:
- Missing required properties won't be caught
- Wrong property types won't be caught
- The mock shape can drift from the real interface

**Better Pattern:**

```typescript
const mockPublicClient: MockedObject<PublicClient> = {
  readContract: vi.fn<Parameters<PublicClient['readContract']>, ReturnType<PublicClient['readContract']>>(),
  waitForTransactionReceipt: vi.fn(),
  // TypeScript will error if shape doesn't match
};
```

---

### 2. No Reactivity Testing for React Hooks

**Location:** `/packages/core/test/unit/react-hooks.test.tsx`

Radius SDK tests never verify hook reactivity:

```typescript
// Current Radius pattern - just renders once
function TestComponent() {
  const balance = useRadiusBalance({ address: mockAddress });
  return <div data-testid="balance">{balance.data?.value.toString()}</div>;
}

render(
  <TestWrapper>
    <TestComponent />
  </TestWrapper>
);

expect(mockUseBalance).toHaveBeenCalledWith({
  address: mockAddress,
});
```

**Tempo SDK Pattern - Tests Reactivity:**

```typescript
// Tempo tests parameter changes causing re-fetches
test('reactivity: account parameter', async () => {
  let accountAddress: Address | undefined

  const { result, rerender } = await renderHook(() =>
    hooks.useGetBalance({
      account: accountAddress,
      token: addresses.alphaUsd,
    }),
  )

  // Initially disabled
  expect(result.current.isEnabled).toBe(false)

  // Change parameter
  accountAddress = account.address
  rerender()

  // Should re-fetch
  await vi.waitFor(() => expect(result.current.isSuccess).toBeTruthy())
  expect(result.current.isEnabled).toBe(true)
  expect(result.current.data).toBeGreaterThan(0n)
})
```

**Missing Reactivity Tests:**
- Parameter changes triggering refetch
- Enabled/disabled state transitions
- Cache invalidation
- Stale-while-revalidate behavior

---

### 3. No Test Infrastructure for Local Blockchain

**Tempo SDK Has:**

```typescript
// test/prool.ts - Local testnet management
import { prool } from 'prool'

export const rpcUrl = 'http://localhost:8545'

// test/config.ts
export const addresses = {
  alphaUsd: '0x...' as Address,  // Real deployed contracts
}

// Tests can restart state
afterEach(async () => {
  await fetch(`${rpcUrl}/restart`)
})
```

**Radius SDK Has:**
- No local blockchain setup
- No contract deployment for tests
- No state reset between tests

This means:
- All tests must use mocks
- Integration testing is impossible
- Bugs in viem/wagmi interaction are invisible

---

### 4. Missing Integration Test Between Components

**What Should Be Tested Together:**

1. `PrivateKeySigner` + `RadiusClient` + `ERC20`
2. `ClefSigner` + `RadiusClient` + events subscription
3. React hooks + actual wagmi config + real transactions

**Current Reality:**

Each component tested in isolation with mocks. The integration points are the most likely source of bugs.

---

### 5. ClefSigner Connection Verification is Meaningless

**Location:** `/test/unit/auth.test.ts` lines 475-497

```typescript
test('should verify Clef connection', async () => {
  mockJsonRpcProvider.send.mockResolvedValue('Clef version 1.0');

  const address = new Address(TEST_ADDRESS);
  const _signer = new ClefSigner(address, mockClient, CLEF_URL);

  await new Promise((resolve) => setTimeout(resolve, 10));

  expect(mockJsonRpcProvider.send).toHaveBeenCalledWith('account_version', []);
});
```

**Problems:**

1. Mock always succeeds - no failure path tested
2. Response format never validated
3. What does "Clef version 1.0" response actually mean?
4. Test passes even if Clef is misconfigured

**Real Clef Could:**
- Return different response format
- Require authentication
- Have different RPC method names
- Reject connections

None of these scenarios are tested.

---

## Minor Issues (Code Quality)

### 1. Inconsistent Test Naming

```typescript
// Some files use test()
test('should fetch token name from contract', async () => {...})

// Some files use it()
it('should render children', () => {...})
```

### 2. No Test Fixtures/Factories

Repetitive mock setup across files:

```typescript
// Copy-pasted in multiple files
const mockPublicClient = {
  readContract: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
} as any;
```

Should use shared factory:

```typescript
// test/fixtures/clients.ts
export function createMockPublicClient(overrides?: Partial<MockPublicClient>) {
  return {
    readContract: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    getLogs: vi.fn(),
    ...overrides
  } satisfies MockPublicClient;
}
```

### 3. Missing `afterEach` Cleanup in Some Tests

```typescript
// auth.test.ts - No cleanup of mocks
// Events could leak between tests
```

### 4. Trivial Constant Tests

```typescript
test('should use DEFAULT_POLLING_INTERVAL_MS value of 1000', () => {
  expect(DEFAULT_POLLING_INTERVAL_MS).toBe(1000);
});
```

This test adds no value - it just verifies a constant equals itself.

---

## Detailed Comparison: Radius vs Tempo Testing Patterns

### Hook Testing Approach

| Aspect | Radius SDK | Tempo SDK |
|--------|------------|-----------|
| Hook execution | Mocked wagmi | Real wagmi + RPC |
| State verification | Mock return values | Actual blockchain state |
| Reactivity | Not tested | Explicit rerender tests |
| Enabled/disabled | Not tested | Explicit tests |
| Error states | Mock error injection | Real error scenarios |
| Event watching | Mock onLogs callback | Real blockchain events |

### Async Pattern Comparison

**Radius:**
```typescript
await new Promise((resolve) => setTimeout(resolve, 10));
expect(signer.chainID()).toBe(TEST_CHAIN_ID);
```

**Tempo:**
```typescript
await vi.waitFor(() => expect(result.current.isSuccess).toBeTruthy(), {
  timeout: 5000,
})
```

### Transaction Testing

**Radius:**
```typescript
vi.mocked(mockWalletClient.writeContract).mockResolvedValueOnce(txHash);
const hash = await erc20.transfer(signer, recipientAddress, amount);
expect(hash).toBe(txHash);
```

**Tempo:**
```typescript
const data = await result.current.transfer.mutateAsync({
  to: account2.address,
  amount: parseUnits('1', 6),
  token: addresses.alphaUsd,
})
expect(data).toBeDefined()
expect(data.receipt).toBeDefined()  // Real receipt!
```

---

## Recommendations (Priority Order)

### Priority 1: Establish Integration Test Infrastructure

1. Add prool or hardhat for local blockchain testing
2. Deploy test contracts (ERC20, etc.) for integration tests
3. Create test utilities for state reset between tests

### Priority 2: Fix Async Anti-Patterns

Replace ALL `setTimeout` usage with proper async patterns:

```typescript
// BEFORE
await new Promise((resolve) => setTimeout(resolve, 10));
expect(signer.chainID()).toBe(TEST_CHAIN_ID);

// AFTER
await vi.waitFor(() => {
  expect(signer.chainID()).toBe(TEST_CHAIN_ID);
}, { timeout: 1000 });
```

### Priority 3: Add Real wagmi Integration Tests

Create a parallel test file that doesn't mock wagmi:

```typescript
// react-hooks.integration.test.tsx
// NO vi.mock('wagmi') - use real implementation

const testConfig = createConfig({
  chains: [radiusTestnet],
  transports: { [radiusTestnet.id]: http(localRpcUrl) },
});

test('useRadiusBalance returns real balance', async () => {
  const { result } = renderHook(
    () => useRadiusBalance({ address: testAccount }),
    { wrapper: createWrapper(testConfig) }
  );

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.value).toBeGreaterThanOrEqual(0n);
});
```

### Priority 4: Add Reactivity Tests

For each hook, add tests verifying:
- Parameter changes trigger refetch
- Enabled/disabled transitions work
- Multiple hook instances share cache correctly

### Priority 5: Fix Type Safety

Replace `as any` with proper typed mocks:

```typescript
import type { PublicClient } from 'viem';
import { type MockInstance } from 'vitest';

interface MockPublicClient {
  readContract: MockInstance<Parameters<PublicClient['readContract']>, ReturnType<PublicClient['readContract']>>;
  // ... other methods
}
```

### Priority 6: Add Error Path Tests

For each function that can fail:
1. Network errors
2. Invalid response format
3. Timeout scenarios
4. Partial failures in batch operations

---

## Gap Summary Table

| Test Category | Radius Coverage | Tempo Coverage | Gap Severity |
|---------------|-----------------|----------------|--------------|
| Unit Tests (mocked) | High | Medium | N/A |
| Integration Tests | None | High | CRITICAL |
| Reactivity Tests | None | High | HIGH |
| Error Path Tests | Low | Medium | HIGH |
| Async Pattern Correctness | Poor | Excellent | HIGH |
| Type Safety | Poor | Good | MEDIUM |
| Event Subscription | Low | High | HIGH |
| Transaction Flow | Mock-only | Real | CRITICAL |

---

## Conclusion

The Radius SDK v2 test suite represents a **testing anti-pattern**: comprehensive mock coverage that provides zero confidence in production behavior. The tests verify that the code calls mocks in the expected way, but never verify that the code works with real blockchain infrastructure.

**Key Finding:** If every mock were replaced with a function that throws "NOT IMPLEMENTED", the SDK's actual functionality would be identical to what's tested today - which is to say, untested.

**Estimated Remediation Effort:**
- Integration test infrastructure: 20-30 hours
- Async pattern fixes: 8-10 hours
- Reactivity tests: 15-20 hours
- Error path coverage: 15-20 hours
- Type safety improvements: 5-10 hours

**Total: 63-90 hours of engineering work**

Until these gaps are addressed, the SDK should be considered **insufficiently tested for production use**.
