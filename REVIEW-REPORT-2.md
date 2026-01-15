# SDK V2 Critical Review Report

> **Date:** 15 January 2026
> **Reviewer:** Claude
> **Branch:** `feature/v2-viem-migration`
> **Scope:** Full SDK V2 assessment against original plan and best practices

---

## Executive Summary

The V2 SDK represents a **significant improvement** over V1 with proper viem integration, but has **critical documentation debt** and some implementation gaps that need addressing before release. The feePayer omission is **correctly justified** in TEMPO-FEE-PAYER.md.

**Overall Grade: B-**

| Category | Grade | Notes |
|----------|-------|-------|
| Core API | A- | Clean viem integration |
| Server Module | B+ | keyManager good, feePayer correctly omitted |
| Documentation | D | Stale, references removed code |
| Tests | B | Good keyManager coverage, gaps elsewhere |
| Type Safety | A | Proper TypeScript patterns |
| Developer Experience | C+ | Confusing naming, unclear migration path |

---

## What Was Done Right

### 1. Clean viem Integration (A)

The client now properly uses viem's `LocalAccount`:

```typescript
// client/client.ts:17-23 - Correct approach
import {
  type LocalAccount,
  type PublicClient,
  ...
} from 'viem';
```

**Good:**
- Uses `LocalAccount` instead of custom `RadiusSigner`
- Follows Tempo's pattern exactly
- Compatible with viem ecosystem

### 2. Server Module Structure (A-)

The Handler implementation follows Tempo's pattern correctly:

```typescript
// server/Handler.ts - Clean architecture
export function from(options: HandlerOptions = {}): Handler
export function keyManager(options: KeyManagerOptions): Handler
export function compose(handlers: Handler[], options: ComposeOptions = {}): Handler
```

**Good:**
- Proper use of `@remix-run/fetch-router`
- Both `.fetch()` and `.listener` patterns work
- Kv abstraction is clean with memory/cloudflare adapters

### 3. keyManager Security Implementation (A)

The WebAuthn implementation has **proper security controls**:

```typescript
// server/Handler.ts:220-264 - Security checks
// 1. Validates challenge exists in KV
// 2. Verifies type is 'webauthn.create'
// 3. Validates origin (if rp configured)
// 4. Checks User Present flag
// 5. CRITICAL: Consumes challenge to prevent replay
await kv.delete(`challenge:${challengeHex}`);
```

**Good test coverage:**
- `Handler.test.ts` covers replay attack prevention
- Tests invalid challenges, wrong types, missing UP flag

### 4. feePayer Omission Decision (A)

The TEMPO-FEE-PAYER.md document correctly explains why feePayer cannot work on standard EVM:

> "Standard EVM transactions have a single signature (`v, r, s`) that determines who authorized the transaction AND who pays gas. These are inseparable."

**Correct decision** - avoiding misleading developers with non-functional code.

### 5. Error Hierarchy (A-)

```typescript
// errors/base.ts - Well-structured
export class RadiusError extends Error {
  readonly shortMessage: string;
  readonly details?: string;
  readonly docsPath?: string;
  readonly cause?: Error | unknown;
  walk(fn?: (err: unknown) => boolean): Error | unknown | null;
}
```

**Good:** Follows viem's `BaseError` pattern for ecosystem compatibility.

---

## What Was Done Poorly

### 1. CRITICAL: Stale Documentation (Grade: D)

**The generated docs still reference removed code:**

`docs/sdk-typescript.mdx:608-691` references:
- `RadiusSigner` interface (removed)
- `ClefSigner` class (removed)
- `createClefSigner()` function (removed)
- `ClefSignerConfig` type (removed)

```markdown
// STALE - sdk-typescript.mdx
### ClefSigner

A signer that delegates signing to an external Clef instance...
```

**Impact:** Developers will try to use non-existent APIs.

**Fix Required:**
1. Remove all ClefSigner references
2. Update RadiusSigner → LocalAccount
3. Re-run `pnpm generate:docs`

### 2. Confusing API Naming (Grade: C)

`createPrivateKeySigner` is misleading because it returns a `LocalAccount`, not a "Signer":

```typescript
// auth/privatekey/signer.ts
export function createPrivateKeySigner(privateKey: Hex): LocalAccount {
  return privateKeyToAccount(privateKey);
}
```

**Problems:**
- Name says "Signer" but returns `LocalAccount`
- V2 removed the Signer concept but kept the name
- Will confuse developers migrating from V1

**Recommendation:** Rename to `createAccount` or just tell users to use viem's `privateKeyToAccount` directly:

```typescript
// Better approach - just re-export viem
export { privateKeyToAccount as createAccount } from 'viem/accounts';
```

### 3. Missing Server Export in Main Index (Grade: C)

The main `index.ts` doesn't export or mention the server module:

```typescript
// src/index.ts - Server module not referenced
// ... exports everything except server
```

While `/server` has a subpath export in package.json, there's no guidance in the main module about it. Developers may not discover it.

**Recommendation:** Add a doc comment pointing to `/server` subpath.

### 4. React Hooks Documentation Mismatch (Grade: D)

`docs/sdk-typescript-react.mdx` documents hooks that don't exist in the actual implementation:

| Documented Hook | Actual Status |
|-----------------|---------------|
| `useRadiusClient()` | Not implemented |
| `useBalance()` | Uses `useRadiusBalance` (different name) |
| `useSendTransaction()` | Uses `useRadiusSend` (different name) |
| `useWaitForReceipt()` | Not implemented |
| `useContractRead()` | Not implemented |
| `useContractWrite()` | Not implemented |

**Actual hooks in `src/react/hooks/`:**
- `useRadiusBalance.ts`
- `useRadiusSend.ts`
- `useERC20.ts`

**Impact:** Developers will copy examples that don't work.

### 5. Events Module Documentation Mismatch (Grade: D)

`docs/sdk-typescript-events.mdx` documents:
- `createEventWatcher()` - Not implemented
- `parseEventLogs()` - Not implemented

**Actual events in `src/events/`:**
- `getLogs.ts`
- `watchBlock.ts`
- `watchLogs.ts`
- `watchTransfer.ts`
- `watchApproval.ts`

**Completely different API than documented.**

### 6. Missing Integration Tests (Grade: C+)

The test coverage has gaps:

| Module | Test File | Coverage |
|--------|-----------|----------|
| server/Handler | Yes | Good |
| server/Kv | No | Missing |
| client/client | No | Missing |
| auth/privatekey | Yes | Basic |
| wagmi/connector | Yes | Basic |
| react/hooks | No | Missing |
| events/* | No | Missing |

**keyManager tests are excellent** (replay attack, security flags, etc.) but other modules lack similar rigor.

---

## What Was Omitted Without Justification

### 1. No Redis Kv Adapter

The PLAN-SERVER-HANDLERS.md mentioned:
> `redis()` factories

Only `memory()` and `cloudflare()` exist:

```typescript
// Kv.ts - Missing redis
export function memory(): Kv
export function cloudflare(kv: cloudflare.Parameters): Kv
// No redis()
```

**Impact:** Limits server deployment options.

### 2. No `onRequest` Hook for keyManager

Tempo's handlers support validation callbacks:

```typescript
// Tempo pattern
Handler.feePayer({
  onRequest?: async (request) => { /* validation */ }
})
```

The keyManager in Radius has no equivalent hook for custom validation logic (rate limiting, allowlisting, etc.).

### 3. No Server Error Exports Used

`server/errors.ts` defines errors that aren't used:

```typescript
// Defined but unused in Handler.ts
export class ChallengeExpiredError extends ServerError
export class CredentialNotFoundError extends ServerError
export class MethodNotSupportedError extends ServerError
```

The Handler returns plain `Response.json({ error: '...' })` instead of throwing these structured errors.

### 4. Missing Client-Side Handler Utilities

The PLAN noted:
> **Future TODOs (Out of Scope):** Client-side utilities for calling handlers

This should be documented somewhere visible so developers know it's planned.

---

## Incorrect Implementations

### 1. Package.json Server Export Missing CJS

```json
// package.json:88-91
"./server": {
  "types": "./src/_types/server/index.d.ts",
  "import": "./src/_esm/server/index.js"
  // Missing: "default": "./src/_cjs/server/index.js"
}
```

The server module is **ESM-only** while other subpaths support both ESM and CJS. This may break Node.js users who aren't using ESM.

### 2. PrivateKeySigner chainId Parameter Removed

V1 had:
```typescript
createPrivateKeySigner(privateKey, chainId)
```

V2 has:
```typescript
createPrivateKeySigner(privateKey)  // No chainId!
```

The chainId is now inferred from `config.chain.id` in the client, but this breaks the documented examples in the generated docs which still show:

```typescript
// BROKEN - sdk-typescript.mdx:636-639
const signer = createPrivateKeySigner(
  '0xac0974...',
  radiusTestnet.id  // <-- This parameter doesn't exist anymore!
);
```

---

## Documentation Generation Status

### Current State

```
typescript/docs/
├── GENERATION.md        ✓ Process documented
├── sdk-typescript.mdx   ✗ STALE - references removed code
├── sdk-typescript-events.mdx   ✗ STALE - wrong API
├── sdk-typescript-react.mdx    ✗ STALE - wrong hook names
└── server-handlers.md   ? Unknown status
```

### Generation Script

The script at `scripts/generate-docs.ts` is a **template-based generator** (~1800 lines). It embeds MDX content as template strings.

**Problem:** The templates weren't updated when the API changed.

### Recommended Fix Process

1. **Update templates** in `scripts/generate-docs.ts`:
   - Remove RadiusSigner/ClefSigner sections
   - Update createPrivateKeySigner signature
   - Fix React hook names
   - Fix Events API to match actual implementation

2. **Regenerate**:
   ```bash
   cd typescript
   pnpm generate:docs
   ```

3. **Verify**:
   ```bash
   grep -r "ClefSigner\|RadiusSigner" docs/*.mdx
   # Should return nothing
   ```

### Integration with Docs Site

Per `GENERATION.md`:
> The Docs team ingests these files during their build process.

**Current state:** If the docs site pulls these files now, it will publish incorrect documentation.

**Action Required:** Block docs site sync until templates are fixed.

---

## Recommendations

### Critical (Block Release)

1. **Fix generated documentation** - Remove all references to deleted code
2. **Rename `createPrivateKeySigner`** - Or document that it returns `LocalAccount`
3. **Add CJS export for `/server`** - Or document ESM-only requirement

### High Priority

4. **Align React hook names** - Either rename hooks or fix docs
5. **Align Events API** - Either implement documented API or fix docs
6. **Add integration tests** - Especially for client with LocalAccount

### Medium Priority

7. **Add Redis Kv adapter** - Common deployment target
8. **Use server error classes** - Structured errors instead of plain strings
9. **Add `onRequest` hook** - For custom validation in keyManager

### Low Priority (Document for Future)

10. **Client-side handler utilities** - Document as future work
11. **Sign-only mode (Option C)** - Document as future consideration
12. **EIP-2771/4337 alternatives** - Document since feePayer isn't possible

---

## Summary Scorecard

| Area | Status | Action |
|------|--------|--------|
| Core SDK | Good | Minor naming fix |
| Server Module | Good | Add Redis, use error classes |
| Main Docs | **BROKEN** | Regenerate immediately |
| React Docs | **BROKEN** | Fix or align API |
| Events Docs | **BROKEN** | Fix or align API |
| Test Coverage | Partial | Add client/hooks/events tests |
| Package Exports | Bug | Add CJS for server |

**Overall: The SDK is functionally sound but the documentation is dangerously out of sync. Do not release until docs are fixed.**

---

*End of Review Report*
