# Radius SDK Audit Report

## Executive Summary

The SDK underwent aggressive cleanup and now follows viem/wagmi patterns reasonably well. However, 8 critical issues and several major issues were identified that should be addressed before release.

---

## 1. PATTERN FOLLOWING (Good)

These align well with viem/wagmi:

| Component | Assessment |
|-----------|------------|
| **Chain definitions** | Uses `defineChain()` correctly, proper structure |
| **Client factory** | `createRadiusClient()` follows viem's pattern |
| **Subpath exports** | Clean: `./chains`, `./react`, `./events`, `./wagmi`, `./webauthn` |
| **JSDoc coverage** | 92-95% coverage with examples |
| **WebSocket transport** | Thin wrapper over viem's `webSocket()` - correct approach |
| **ERC-20 React hooks** | Follow wagmi TanStack Query patterns |
| **TypedContract** | Simplified contract wrapper adds value |
| **Event decoding** | `decodeEventLogs`, `filterEventLogs` well-implemented |
| **getLogs pagination** | `getLogsAdaptive` handles Radius block range limits |

---

## 2. WEIRD/WRONG (Critical Issues)

### Issue #1: Transport Bypasses viem's Retry/Timeout Infrastructure
**Location:** `src/transport/interceptor.ts`

The custom transport uses `custom({ request })` which bypasses viem's:
- Retry logic with exponential backoff
- `Retry-After` header support
- Timeout enforcement
- Request deduplication

**Impact:** Network requests can hang forever. No configurable retry behavior.

---

### Issue #2: Request ID Collision Risk
**Location:** `src/transport/interceptor.ts:135`

```typescript
body = JSON.stringify({
  jsonrpc: '2.0',
  id: Date.now(),  // Millisecond precision = collisions under load
  method,
  params,
})
```

**Impact:** Multiple requests in same millisecond = ID collision = responses mapped to wrong requests.

---

### Issue #3: RadiusError Extends Error, Not viem's BaseError
**Location:** `src/errors/base.ts:48`

```typescript
export class RadiusError extends Error {  // Should be: extends BaseError
```

**Impact:**
- `error instanceof viem.BaseError` won't catch Radius errors
- viem ecosystem tools won't recognize Radius errors
- Breaks pattern compatibility with wagmi

---

### Issue #4: Double Callback in watchApprovalForAddress
**Location:** `src/events/watchApproval.ts:257-282`

When watching both owner and spender roles, creates TWO subscriptions that BOTH call the same `onApproval` callback. If an address is both owner and spender, callback fires twice.

```typescript
const unwatchOwner = watchApproval(client, {
  owner: params.watchAddress,
  onApproval: params.onApproval,  // Same callback
});
const unwatchSpender = watchApproval(client, {
  spender: params.watchAddress,
  onApproval: params.onApproval,  // Called twice!
});
```

---

### Issue #5: Identical Double Callback in watchTransferForAddress
**Location:** `src/events/watchTransfer.ts:237-262`

Same issue as #4 for transfer events.

---

### Issue #6: wagmi Connector onAccountsChanged is No-Op
**Location:** `src/wagmi/connector.ts:147`

```typescript
onAccountsChanged() {}  // Complete no-op!
```

**Impact:** Account switching doesn't work. User changes wallet account = no update.

---

### Issue #7: wagmi Connector getChainId Hardcoded
**Location:** `src/wagmi/connector.ts:128`

```typescript
async getChainId() {
  return config.chains[0]?.id ?? 0;  // Always returns first chain!
}
```

**Impact:** Chain switching broken. Always reports first configured chain.

---

### Issue #8: WebAuthn Error Classes Defined But Never Used
**Location:** `src/webauthn/errors.ts`

Five error classes exported (`ServerError`, `InvalidRequestError`, `ChallengeExpiredError`, `CredentialNotFoundError`, `MethodNotSupportedError`) but Handler.ts never throws them - it returns plain JSON error responses instead.

**Impact:** Dead code. Misleading API documentation.

---

## 3. NOVEL/ODD (Questionable Decisions)

| Pattern | Assessment |
|---------|------------|
| **RoundTripper abstraction** | Go pattern forced into JavaScript/viem ecosystem. Adds complexity without benefit. |
| **useRadiusBalance hook** | Thin wrapper over wagmi's `useBalance`. Adds no value - users could use wagmi directly. |
| **No WebAuthn challenge expiration** | Challenges stored indefinitely. Security concern. |
| **watchPendingTransactions** | Documented as "may not work" but exports function anyway with no error handling. |
| **TypedContract read param handling** | `Array.isArray(callArgs[0])` check is incomplete for loose args. |

---

## 4. NOVEL/COOL (Good Innovations)

| Innovation | Value |
|------------|-------|
| **gasPrice: 0 handling** | Smart Radius-specific optimization |
| **getLogsAdaptive** | Excellent handling of Radius block range limits with progress callbacks |
| **Rich error metaMessages** | Good DX: "You passed a string. Use `client.getBalance({ address })` instead" |
| **TypedContract `wait` option** | Built-in receipt handling simplifies common pattern |
| **Handler.compose()** | Clean handler multiplexing for server routes |
| **Kv abstraction** | `Kv.memory()` for dev, `Kv.cloudflare()` for prod - nice pattern |

---

## 5. DOCS SITE AUTO-GENERATION

**Status: READY**

| Component | Status |
|-----------|--------|
| TypeDoc config | `typedoc.json` properly configured for markdown |
| API docs generation | `pnpm generate:docs` works |
| Guide generation | `scripts/generate-guides.ts` creates 6 MDX files |
| Stale reference validation | `scripts/validate-docs.ts` checks for removed APIs |
| JSDoc coverage | 92-95% with examples |

**One inconsistency found:** `generate-guides.ts` references `@radiustechsystems/sdk/server` but package.json exports `/webauthn`. The server guide should be updated to use `/webauthn`.

---

## 6. TEST QUALITY

| Assessment | Details |
|------------|---------|
| **Integration tests** | Solid coverage of client against testnet |
| **Unit tests** | Some mock everything and test nothing |
| **Event watch tests** | No tests for watch functions |
| **Error case tests** | Missing error path coverage |
| **TypedContract tests** | Only test happy path, not edge cases |

---

## 7. PRIORITY FIXES

### Critical (Must Fix Before Release)
1. Fix request ID collision (use UUID or counter)
2. Fix double callback in `watchApprovalForAddress`
3. Fix double callback in `watchTransferForAddress`
4. Fix wagmi connector `onAccountsChanged`
5. Fix wagmi connector `getChainId` hardcoding

### Major (Should Fix Before Release)
6. Make `RadiusError` extend viem's `BaseError`
7. Fix TypedContract read parameter handling
8. Remove or integrate unused WebAuthn error classes
9. Add challenge expiration to WebAuthn
10. Fix transport to use viem's http() with interceptor callbacks

### Minor (Nice to Fix)
11. Fix server guide to reference `/webauthn` not `/server`
12. Add tests for event watch functions
13. Document wagmi connector as dev-only (not production)
14. Add error case tests

---

## 8. DETAILED FINDINGS BY MODULE

### 8.1 Transport Module (`src/transport/`)

**Files:** `interceptor.ts`, `websocket.ts`, `types.ts`

**Summary:** The interceptor transport is architecturally misaligned with viem. It reimplements JSON-RPC handling instead of wrapping viem's `http()` transport.

**Good:**
- `websocket.ts` is a proper thin wrapper over viem's `webSocket()` - use this as the pattern model

**Bad:**
- `interceptor.ts` creates a custom `RoundTripper` abstraction (Go pattern, not viem)
- Manually builds JSON-RPC requests instead of using viem's infrastructure
- No timeout support (requests can hang forever)
- `Date.now()` for request IDs can collide
- Error handling throws generic `Error`, not typed viem errors

**Recommendation:** Refactor to wrap viem's `http()` transport with `onFetchRequest`/`onFetchResponse` callbacks for logging/interception.

---

### 8.2 Errors Module (`src/errors/`)

**Files:** `base.ts`, `account.ts`, `contract.ts`, `transaction.ts`

**Summary:** Well-structured error hierarchy with good `metaMessages` support, but doesn't extend viem's `BaseError`.

**Good:**
- Rich error context with `metaMessages`, `details`, `docsPath`
- `walk()` method for error chain traversal
- Specific error classes for different failure modes

**Bad:**
- `RadiusError extends Error` instead of `extends BaseError` from viem
- No `version` info in errors (viem includes `viem@X.Y.Z`)
- Hardcoded `docsPath` instead of viem's `docsSlug` pattern
- No `*Type` exports for better TypeScript narrowing

**Recommendation:** Extend viem's `BaseError` for ecosystem compatibility.

---

### 8.3 Events Module (`src/events/`)

**Files:** `getLogs.ts`, `watchApproval.ts`, `watchTransfer.ts`, `watchBlock.ts`, `watchLogs.ts`, `decodeEventLogs.ts`

**Summary:** Good utilities for Radius-specific needs, but watch functions have bugs.

**Good:**
- `getLogsAdaptive` excellently handles Radius block range limits
- `decodeEventLogs` / `filterEventLogs` are useful conveniences
- Progress callbacks for long-running queries

**Critical Bugs:**
- `watchApprovalForAddress` and `watchTransferForAddress` fire callbacks twice when watching both roles
- `watchPendingTransactions` documented as broken but still exported

**Bad:**
- `watchLogs` / `watchRawLogs` are just pass-throughs to viem with no added value
- Fragile error message string matching in `getLogsAdaptive`

**Recommendation:** Fix the double-callback bugs. Consider removing the thin pass-through wrappers.

---

### 8.4 wagmi Connector (`src/wagmi/`)

**Files:** `connector.ts`

**Summary:** This is a dev/test utility, not a production connector. Multiple pattern violations.

**Critical Issues:**
- `onAccountsChanged()` is a no-op - accounts can't change at runtime
- `getChainId()` hardcoded to first chain - chain switching broken
- `getProvider()` signature wrong (accepts params, should be parameterless)
- `as never` type cast indicates type system issues

**Good:**
- Uses `createConnector` factory correctly
- Core methods present (connect, disconnect, getAccounts)

**Recommendation:** Either fix for production use or explicitly document as dev-only and don't include in main exports.

---

### 8.5 WebAuthn Module (`src/webauthn/`)

**Files:** `Handler.ts`, `Kv.ts`, `errors.ts`, `types.ts`

**Summary:** Well-structured server-side credential management, but error classes are dead code.

**Good:**
- Challenge consumption prevents replay attacks
- Proper WebAuthn flag validation
- Clean `Handler.compose()` pattern
- `Kv.memory()` / `Kv.cloudflare()` abstraction

**Bad:**
- 5 error classes defined but never used - Handler returns JSON errors instead
- No challenge expiration (security concern)
- Origin validation doesn't handle subdomains
- Public key format not validated

**Recommendation:** Either throw the error classes or remove them. Add challenge TTL.

---

### 8.6 Contracts Module (`src/contracts/`)

**Files:** `typedContract.ts`

**Summary:** Useful Radius-specific wrapper, but has a parameter handling bug.

**Good:**
- Simplifies contract interactions vs raw viem
- `wait` option for automatic receipt handling
- Clean `read` / `write` namespace pattern

**Bug:**
- Read method parameter handling: `Array.isArray(callArgs[0])` check doesn't properly handle loose args vs array args

**Missing:**
- No `estimateGas` namespace
- No event support on contract instance

**Recommendation:** Fix the parameter handling. Consider adding gas estimation.

---

### 8.7 React Module (`src/react/`)

**Files:** `hooks/useRadiusBalance.ts`, `hooks/useRadiusSend.ts`, `hooks/useERC20.ts`, `provider.tsx`, `context.tsx`

**Summary:** ERC-20 hooks are good, but some hooks add no value over wagmi.

**Good:**
- ERC-20 hooks (`useERC20Balance`, `useERC20Transfer`, etc.) follow wagmi patterns
- Proper TanStack Query integration

**Questionable:**
- `useRadiusBalance` is just a thin wrapper over wagmi's `useBalance` - why not use wagmi directly?

**Recommendation:** Consider removing redundant wrappers or documenting why they exist.

---

### 8.8 Chains Module (`src/chains/`)

**Files:** `radius.ts`

**Summary:** Correct implementation.

**Good:**
- Uses `defineChain()` correctly
- Proper chain structure with `radiusTestnet` and `radiusMainnet`
- Correct RPC URLs and chain IDs

---

## 9. FILES THAT SHOULD BE REVIEWED

| File | Concern |
|------|---------|
| `src/transport/interceptor.ts` | Major architectural issue |
| `src/events/watchApproval.ts:257-282` | Double callback bug |
| `src/events/watchTransfer.ts:237-262` | Double callback bug |
| `src/wagmi/connector.ts` | Multiple pattern violations |
| `src/webauthn/errors.ts` | Dead code |
| `src/errors/base.ts` | Should extend viem BaseError |
| `src/contracts/typedContract.ts:133-137` | Parameter handling bug |
| `scripts/generate-guides.ts` | References wrong export path |

---

## 10. CONCLUSION

The Radius SDK has a solid foundation and follows viem/wagmi patterns in most areas. The main concerns are:

1. **Transport architecture** needs rethinking to use viem's infrastructure
2. **Event watch functions** have callback bugs that will confuse users
3. **wagmi connector** is not production-ready
4. **Error base class** should extend viem for ecosystem compatibility

With the critical fixes addressed, this SDK would provide a good developer experience for viem/wagmi developers working with Radius.
