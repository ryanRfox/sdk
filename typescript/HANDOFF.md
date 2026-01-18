# Handoff: Audit Fixes (Test Quality)

## Context

The Radius TypeScript SDK was audited. This branch focuses on fixing test quality issues identified in the audit.

**Read `AUDIT-REPORT.md` for full audit details.**

---

## Your Task: Fix Tests That Suck

The audit identified several categories of test problems:

### 1. Tests That Mock Everything and Test Nothing

Some tests mock all dependencies so thoroughly that they don't actually test real behavior.

**Look for:**
- Tests where every external call is mocked
- Tests that only verify mocks were called, not actual behavior
- Tests that pass regardless of implementation

**Fix by:**
- Adding integration tests that hit real code paths
- Reducing mocking to only external boundaries
- Testing actual behavior, not just call verification

---

### 2. Missing Test Coverage for Watch Functions

**Location:** `src/events/watchApproval.ts`, `src/events/watchTransfer.ts`, `src/events/watchBlock.ts`

**Issue:** No tests exist for the watch functions.

**Need tests for:**
- `watchApproval` / `watchApprovalForAddress`
- `watchTransfer` / `watchTransferForAddress`
- `watchBlockNumber` / `watchBlocks`
- Edge case: what happens when errors occur in callbacks

---

### 3. Missing Error Path Tests

Many functions have error handling that's never tested.

**Look for:**
- `catch` blocks that aren't exercised by tests
- Validation logic that's not tested with invalid input
- Error classes that are never instantiated in tests

**Files to check:**
- `src/client/client.ts` - validation errors
- `src/contracts/typedContract.ts` - ABI encoding errors
- `src/transport/interceptor.ts` - network errors
- `src/webauthn/Handler.ts` - validation errors

---

### 4. TypedContract Tests Only Cover Happy Path

**Location:** `test/unit/typedContract.test.ts`

**Missing tests:**
- What happens with missing ABI?
- What happens with missing address?
- What happens with malformed arguments?
- What happens with tuple/struct parameters?
- Loose args vs array args handling

---

### 5. wagmi Connector Tests Validate Wrong Behavior

**Location:** `src/wagmi/connector.test.ts`

**Issue:** Tests explicitly validate that `onAccountsChanged` is a no-op:
```typescript
it('should be a no-op function', () => {
  expect(() => connectorImpl.onAccountsChanged?.([])).not.toThrow();
});
```

This test validates broken behavior. Once the code is fixed (in the other branch), this test needs to be updated to verify proper account change handling.

---

### 6. WebAuthn Handler Tests Missing Error Cases

**Location:** `src/webauthn/Handler.test.ts`

**Missing tests:**
- Invalid credential ID format
- Invalid publicKey format
- Malformed JSON bodies
- Missing authenticatorData
- Origin mismatch (non-localhost)
- Challenge expiration (once implemented)

---

## Test Quality Guidelines

Good tests should:

1. **Test real behavior** - Not just mock verification
2. **Cover error paths** - Not just happy paths
3. **Be independent** - Not rely on other tests
4. **Be deterministic** - Same result every run
5. **Be readable** - Clear what's being tested

---

## Reference Repositories

For test pattern reference:

| Repo | Location | Reference For |
|------|----------|---------------|
| viem | `/tmp/viem` | Test patterns, integration tests |
| wagmi | `/tmp/wagmi` | Connector test patterns |

---

## Commands

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- src/wagmi/connector.test.ts

# Run tests matching pattern
pnpm test -- --grep "watchApproval"

# Run with coverage
pnpm test -- --coverage
```

---

## Success Criteria

- All existing tests still pass
- New tests added for watch functions
- Error paths have test coverage
- No tests that just validate broken behavior
- Test coverage improved for identified gaps
