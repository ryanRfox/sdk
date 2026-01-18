# Handoff: Audit Fixes (Code Issues)

## Context

The Radius TypeScript SDK was audited against viem/wagmi patterns. This branch contains the fixes for code issues identified in the audit.

**Read `AUDIT-REPORT.md` for full details on each issue.**

---

## Your Task List

Fix the following issues in priority order:

### 1. Fix Server Guide Export Path
**Location:** `scripts/generate-guides.ts`
**Issue:** References `@radiustechsystems/sdk/server` but package.json exports `/webauthn`
**Fix:** Update the guide to use the correct import path

### 2. Document wagmi Connector as Dev-Only
**Location:** `src/wagmi/connector.ts`
**Issue:** Connector has limitations that make it unsuitable for production
**Fix:** Add prominent JSDoc warning that this is for development/testing only, not production wallets

### 3. Fix Request ID Collision
**Location:** `src/transport/interceptor.ts:135`
**Issue:** Uses `Date.now()` which can collide under load
**Fix:** Use a counter or UUID instead. Example:
```typescript
let requestId = 0;
// ...
id: ++requestId,
```

### 4. Fix Double Callback in watchApprovalForAddress
**Location:** `src/events/watchApproval.ts:257-282`
**Issue:** Creates two subscriptions that both call `onApproval`, causing duplicate callbacks
**Fix:** Deduplicate events before calling callback, or merge subscriptions

### 5. Fix Double Callback in watchTransferForAddress
**Location:** `src/events/watchTransfer.ts:237-262`
**Issue:** Same as #4 but for transfers
**Fix:** Same approach as #4

### 6. Fix wagmi Connector onAccountsChanged
**Location:** `src/wagmi/connector.ts:147`
**Issue:** `onAccountsChanged() {}` is a no-op
**Fix:** Implement proper account change handling:
```typescript
async onAccountsChanged(accounts: Address[]) {
  if (accounts.length === 0) {
    this.onDisconnect()
  } else {
    config.emitter.emit('change', {
      accounts: accounts.map(x => getAddress(x))
    })
  }
}
```

### 7. Fix wagmi Connector getChainId Hardcoding
**Location:** `src/wagmi/connector.ts:128`
**Issue:** Always returns `config.chains[0]?.id` instead of actual connected chain
**Fix:** Store the connected chainId and return it, or query from provider

### 8. Make RadiusError Extend viem's BaseError
**Location:** `src/errors/base.ts:48`
**Issue:** `RadiusError extends Error` breaks viem ecosystem compatibility
**Fix:** Import and extend `BaseError` from viem:
```typescript
import { BaseError } from 'viem'
export class RadiusError extends BaseError {
```
Note: This may require adjusting constructor signature to match BaseError's API

### 9. Fix TypedContract Read Parameter Handling
**Location:** `src/contracts/typedContract.ts:133-137`
**Issue:** `Array.isArray(callArgs[0])` doesn't handle loose args properly
**Fix:** Check if multiple args were passed:
```typescript
const args = callArgs.length === 1 && Array.isArray(callArgs[0])
  ? callArgs[0]
  : callArgs;
```

### 10. Remove or Integrate Unused WebAuthn Error Classes
**Location:** `src/webauthn/errors.ts` and `src/webauthn/Handler.ts`
**Issue:** Error classes defined but Handler.ts returns JSON errors instead of throwing
**Fix:** Either:
- Use the error classes in Handler.ts, OR
- Remove them from exports if they're not meant to be used

### 11. Add Challenge Expiration to WebAuthn
**Location:** `src/webauthn/Handler.ts`
**Issue:** Challenges stored indefinitely (security concern)
**Fix:**
- Store challenge with timestamp: `{ challenge, expiresAt: Date.now() + TTL }`
- Validate expiration before accepting challenge
- Default TTL: 5-10 minutes

### 12. Fix Transport to Use viem's http() with Interceptor Callbacks
**Location:** `src/transport/interceptor.ts`
**Issue:** Custom transport bypasses viem's retry/timeout infrastructure
**Fix:** Refactor to wrap viem's `http()` transport:
```typescript
import { http } from 'viem'

export function createInterceptingTransport(options) {
  return http(options.url, {
    onFetchRequest: options.logger ? logRequest : undefined,
    onFetchResponse: options.interceptor ? interceptResponse : undefined,
    retryCount: options.retryCount,
    retryDelay: options.retryDelay,
    timeout: options.timeout,
  })
}
```

---

## Reference Repositories

For pattern reference, these repos are available locally:

| Repo | Location | Use For |
|------|----------|---------|
| viem | `/tmp/viem` | Client patterns, BaseError, http transport |
| wagmi | `/tmp/wagmi` | Connector patterns, hook patterns |
| tempo-ts | `/tmp/tempo-ts` | How to extend viem for a custom chain |

---

## Build & Test

After each fix:
```bash
pnpm build
pnpm test
pnpm check:types
```

---

## Success Criteria

- All 12 issues fixed
- Build passes
- Tests pass
- Type checking passes
