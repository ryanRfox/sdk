# SDK V2 Audit Findings

**Date:** 2026-01-18
**Auditor:** Claude Code
**SDK Version:** 2.0.0-alpha.5

---

## Executive Summary

The Radius V2 SDK is well-architected and follows most viem/Tempo patterns correctly. Several issues need addressing before production release.

---

## Issues to Fix

### 1. Go-Inspired Naming (Priority: Low)

**Location:** `transport/types.ts`

**Current:**
```typescript
export type RoundTripper = ...
export type Logf = ...
```

**Problem:** `RoundTripper` is a Go pattern (`http.RoundTripper`). `Logf` is from Go's `log.Printf`. These are unusual in TypeScript.

**Fix:** Rename to TypeScript idioms:
- `RoundTripper` → `HttpClient` or `RequestHandler`
- `Logf` → `Logger` or `LogFunction`

---

### 2. Documentation Path Mismatch (Priority: Medium)

**Location:** `webauthn/Handler.ts:109`

**Current documentation:**
```typescript
* import { Handler, Kv } from '@radiustechsystems/sdk/server';
```

**Actual export:**
```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';
```

**Fix:** Update all JSDoc examples to use `/webauthn` instead of `/server`.

---

### 3. WebAuthn Stricter Than Tempo (Priority: Medium)

**Location:** `webauthn/Handler.ts`

Radius WebAuthn has additional validation that Tempo doesn't:
- Credential ID format validation: `/^[a-zA-Z0-9_-]{1,255}$/`
- JSON parsing error handling
- Challenge TTL configuration
- Explicit challenge expiration checking

**Decision:** Remove extra validation to match Tempo's API for compatibility.

**Rationale:** SDK users expect Tempo-compatible behavior. Extra validation can be added later as opt-in.

---

### 4. Dual Contract APIs (Priority: Low)

**Location:** `client/client.ts`

The client exposes both patterns:

```typescript
// Old pattern (positional args)
await client.call(contract, 'balanceOf', address);
await client.execute(contract, signer, 'transfer', to, amount);

// viem pattern (object args)
await client.readContract({ address, abi, functionName, args });
await client.writeContract({ address, abi, functionName, args, account });
```

**Problem:** Two ways to do the same thing is confusing.

**Fix:** Deprecate `call()`/`execute()` in favor of `readContract()`/`writeContract()`:
```typescript
/** @deprecated Use readContract() instead */
call<T>(contract, method, ...args): Promise<T>
```

---

### 5. viem in devDependencies (Priority: High)

**Location:** `package.json:41`

```json
"devDependencies": {
  "viem": "^2.43.3",
```

**Problem:** viem is imported at runtime but listed as devDependency. Users must install it separately, but error won't be clear.

**Fix:** Either:
1. Move to `dependencies`
2. Or add to `peerDependencies` with clear error message

**Recommended:** Keep as peer dependency (like Tempo does) but ensure it's documented prominently.

---

### 6. Missing `http` Re-export (Priority: Low)

**Location:** `index.ts`

**Problem:** Users must import `http` from viem separately:
```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { http } from 'viem'; // Must import separately
```

**Fix:** Re-export `http` from main entry point:
```typescript
export { http } from 'viem';
```

---

## Issues NOT to Fix (Intentional Design)

### gasPrice: 0n

**Location:** `client/client.ts:678`

```typescript
gasPrice: 0n, // Radius uses zero gas price
```

**Status:** Correct for Radius. Keep as-is but add documentation.

**Rationale:** Radius has zero gas fees. This is intentional.

---

### Batch Transactions Bypass Transport

**Location:** `client/client.ts:980`

**Status:** Acceptable. Document the limitation.

**Rationale:** Batch transactions require atomicity. Using raw `fetch()` ensures all transactions arrive in a single HTTP request. This is by design per the transaction-behavior research.

---

### MAX_GAS Constant

**Location:** `client/client.ts:157`

```typescript
export const MAX_GAS = 1319413953330n;
```

**Status:** Document origin but keep as-is.

**Recommendation:** Add comment explaining where this number comes from.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `transport/types.ts` | Rename `Logf`→`Logger`, `RoundTripper`→`RequestHandler` |
| `webauthn/Handler.ts` | Remove extra validation, update JSDoc paths |
| `client/client.ts` | Add deprecation notices to `call()`/`execute()` |
| `package.json` | Move viem to peerDependencies (if not already) |
| `index.ts` | Add `http` re-export |

---

## References

- [SDK Architecture](./SDK-ARCHITECTURE.md) - Full directory breakdown
- [WAGMI Analysis](./WAGMI-ANALYSIS.md) - React/WAGMI integration decision
- [Transaction Behavior](../transaction-behavior/) - Batch transaction research
