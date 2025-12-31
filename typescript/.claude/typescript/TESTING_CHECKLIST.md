# Radius SDK Testing - Quick Reference Checklist

## Critical Bugs to Fix NOW

- [ ] **Auth - Race Condition in PrivateKeySigner**
  - [ ] Replace `setTimeout(10)` with proper `vi.waitFor()`
  - [ ] Verify chainID is actually set before use in signTransaction
  - [ ] Test all edge cases with slow/failing client.chainID()

- [ ] **Auth - ClefSigner Connection Never Actually Verified**
  - [ ] Add real Clef connectivity test
  - [ ] Validate response format from `account_version`
  - [ ] Handle different Clef versions

- [ ] **ERC20 - ABI Validation Missing**
  - [ ] Verify ABI is passed to all readContract calls
  - [ ] Test with wrong ABI to ensure viem rejects it
  - [ ] Validate function selectors match ERC20 interface

- [ ] **Events - Error Handling Not Verified**
  - [ ] Test mixed valid/invalid logs in single batch
  - [ ] Verify onError is called (not just defined)
  - [ ] Test subscription behavior after errors
  - [ ] Test exception throwing in callbacks

- [ ] **Events - getLogs Chunking Edge Cases**
  - [ ] Test block boundary conditions
  - [ ] Verify no duplicate results from overlapping chunks
  - [ ] Handle "block range too wide" RPC errors
  - [ ] Test with chunkSize == range size

## Medium Priority - Best Practices

- [ ] Remove all `await new Promise(resolve => setTimeout(resolve, X))`
  - Use `vi.waitFor()` with proper assertions instead

- [ ] Replace `as any` with proper type definitions
  - [ ] erc20.test.ts line 29
  - [ ] client.test.ts line 108
  - [ ] transport.test.ts line 52

- [ ] Add Integration Tests
  - [ ] PrivateKeySigner + RadiusClient together
  - [ ] ERC20 with real viem PublicClient mock
  - [ ] Full transaction flow: sign → execute → wait

- [ ] Improve React Hook Tests
  - [ ] Add rerender tests (test reactivity)
  - [ ] Test multiple hook instances
  - [ ] Use real wagmi config (don't mock everything)
  - [ ] Verify dependency arrays

- [ ] Add Error Type Tests
  - [ ] Verify error types are preserved (not wrapped)
  - [ ] Test error messages are helpful
  - [ ] Test error recovery mechanisms

## Low Priority - Code Quality

- [ ] Standardize test naming: `test` vs `it` (pick one)
- [ ] Create test fixture builders to reduce setup duplication
- [ ] Add JSDoc comments explaining complex test logic
- [ ] Remove trivial tests (e.g., constant == constant)
- [ ] Add global afterEach cleanup for mocks
- [ ] Document expected behavior for each feature

## Testing Pattern Improvements

### Bad Pattern (Current)
```typescript
await new Promise(resolve => setTimeout(resolve, 10));
expect(value).toBe(expected);
```

### Good Pattern (Recommended)
```typescript
await vi.waitFor(() => {
  expect(value).toBe(expected);
}, { timeout: 1000 });
```

### Bad Pattern (Current)
```typescript
mockPublicClient = {
  readContract: vi.fn(),
} as any;
```

### Good Pattern (Recommended)
```typescript
const mockPublicClient: Partial<PublicClient> = {
  readContract: vi.fn<[ReadContractParameters], Promise<unknown>>(),
};
```

### Bad Pattern (Current)
```typescript
test('should call function', () => {
  component.method();
  expect(mockFn).toHaveBeenCalled();
});
```

### Good Pattern (Recommended)
```typescript
test('should call function with correct args', () => {
  component.method();
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      expectedField: expectedValue,
    })
  );
});
```

## Test Coverage Goals

| Component | Current | Target |
|-----------|---------|--------|
| Chains | ~100% | ✓ Maintain |
| Auth - Happy Path | ~80% | ✓ Maintain |
| Auth - Error Cases | ~20% | 70% |
| Auth - Integration | 0% | 50% |
| ERC20 - Happy Path | ~90% | ✓ Maintain |
| ERC20 - Contract Invariants | 0% | 60% |
| ERC20 - Integration | 0% | 40% |
| Events - Happy Path | ~85% | ✓ Maintain |
| Events - Error Cases | ~30% | 80% |
| Events - Edge Cases | ~10% | 60% |
| Client | ~70% | 85% |
| Transport | ~75% | 90% |
| React Hooks | ~60% | 80% |

## Files Needing Most Work

1. **auth.test.ts** - 8 race conditions to fix
2. **react-hooks.test.tsx** - Need real hook testing
3. **events.test.ts** - Error handling gaps
4. **erc20.test.ts** - Missing contract invariants

## Red Flags When Code Review

🚩 See `setTimeout` → Ask: Why not use `vi.waitFor`?
🚩 See `.mockReturnValue()` → Ask: Did you verify expected params?
🚩 See `as any` → Ask: Can we type this properly?
🚩 See only success paths → Ask: What errors can this throw?
🚩 See mocked wagmi/viem → Ask: Have we tested with real client?
🚩 See no error verification → Ask: Is onError actually called?

## Quick Win Improvements (Low Effort, High Impact)

1. Replace setTimeout in auth tests (1-2 hours)
2. Add error case for watchTransfer (30 minutes)
3. Add type safety to mocks (1 hour)
4. Add integration test template (2 hours)
5. Document test intent with comments (1 hour)

**Total: ~6 hours for high-impact improvements**
