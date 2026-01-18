# Claude Instructions: Test Quality Fixes

## Your Role

You are fixing test quality issues identified in the Radius SDK audit. Your goal is to ensure tests actually test real behavior and cover important code paths.

**Read `HANDOFF.md` for your task list.**
**Read `typescript/AUDIT-REPORT.md` for audit context.**

---

## Reference Repositories

These repos are cloned locally for test pattern reference:

| Repo | Location | Reference For |
|------|----------|---------------|
| viem | `/tmp/viem` | Test patterns, how they test transports/clients |
| wagmi | `/tmp/wagmi` | Connector test patterns, hook testing |

---

## Test Framework

The SDK uses **Vitest**. Key patterns:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocking
vi.mock('./module', () => ({
  someFunction: vi.fn(),
}));

// Spying
const spy = vi.spyOn(object, 'method');

// Async tests
it('should handle async', async () => {
  await expect(asyncFn()).resolves.toBe(value);
  await expect(asyncFn()).rejects.toThrow('error');
});
```

---

## What Makes a Good Test

### Good: Tests Real Behavior
```typescript
it('should decode transfer events', async () => {
  const logs = [{ topics: [...], data: '0x...' }];
  const decoded = decodeEventLogs({ abi: erc20Abi, logs });
  expect(decoded[0].eventName).toBe('Transfer');
  expect(decoded[0].args.from).toBe('0x...');
});
```

### Bad: Tests Nothing
```typescript
it('should call decode', async () => {
  const mockDecode = vi.fn().mockReturnValue([]);
  // Only verifies mock was called, not actual behavior
  expect(mockDecode).toHaveBeenCalled();
});
```

---

## Priority Order

1. **Fix tests that validate broken behavior** (wagmi connector)
2. **Add tests for watch functions** (events module)
3. **Add error path tests** (client, contracts, webauthn)
4. **Add edge case tests** (TypedContract parameters)

---

## Files to Focus On

| File | Issues |
|------|--------|
| `typescript/src/wagmi/connector.test.ts` | Tests validate no-op as correct |
| `typescript/test/unit/typedContract.test.ts` | Only happy path |
| `typescript/src/webauthn/Handler.test.ts` | Missing error cases |
| `typescript/src/events/` | No watch function tests |
| `typescript/src/client/client.ts` | Validation not tested |

---

## Commands

```bash
cd typescript

# Run all tests
pnpm test

# Run specific file
pnpm test -- src/wagmi/connector.test.ts

# Run with pattern
pnpm test -- --grep "error"

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

---

## Important Notes

1. **Don't break existing passing tests** unless they test wrong behavior
2. **Keep tests focused** - one concept per test
3. **Use descriptive names** - test name should explain what's tested
4. **Check reference repos** for test patterns

---

## SDK Location

```
/Users/fox/Getting Started/radius-sdk/typescript
```
