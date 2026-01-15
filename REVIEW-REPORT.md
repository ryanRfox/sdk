# SDK V2 Review Report

> **Reviewer:** Original Planning Claude (Opus)
> **Date:** 15 January 2026
> **Scope:** Full audit of Radius V2 SDK implementation against PLAN-SERVER-HANDLERS.md expectations

---

## Executive Summary

**Overall Assessment: NEEDS REMEDIATION BEFORE PRODUCTION**

The implementation completed all planned phases but contains **two critical functional bugs** that make the server handlers non-functional for their intended purpose. The feePayer handler doesn't actually pay fees, and the keyManager handler has security vulnerabilities due to skipped WebAuthn verification.

| Category | Status |
|----------|--------|
| Phase 0: SDK Cleanup | ✅ PASS |
| Phase 1: Infrastructure | ✅ PASS |
| Phase 2: Handler Implementation | ❌ **CRITICAL BUGS** |
| Phase 3: Integration | ✅ PASS |
| Phase 4: Documentation | ⚠️ Minor issues |
| QA Checks | ✅ Tests pass, types pass |

---

## Critical Issues (Must Fix)

### CRITICAL-001: feePayer Does Not Sign as Fee Payer

**Severity:** CRITICAL - Core functionality broken
**Location:** `src/server/Handler.ts:279-309`

**Expected Behavior (from Tempo):**
1. Receive transaction from client (unsigned or partially signed)
2. **Deserialize** the transaction
3. **Sign with fee payer account** using `signTransaction(client, { ...transaction, account, feePayer: account })`
4. Submit the newly signed transaction

**Actual Behavior:**
1. Receive raw transaction
2. **Forward directly to network without any signing**
3. The `account` parameter is never used for signing

**Evidence:**
```typescript
// Radius implementation (BROKEN)
if (body.method === 'eth_sendRawTransaction') {
  const serializedTx = body.params[0];
  const result = await client.request({
    method: 'eth_sendRawTransaction',
    params: [serializedTx as Hex],  // Just forwarding! Not signing!
  });
}
```

```typescript
// Tempo implementation (CORRECT)
if (request.method === 'eth_sendRawTransaction') {
  const serialized = request.params?.[0];
  const transaction = Transaction.deserialize(serialized);  // Deserialize
  const serializedTransaction = await signTransaction(client, {
    ...transaction,
    account,
    feePayer: account,  // Sign as fee payer
  });
  const result = await client.request({
    method: request.method,
    params: [serializedTransaction],  // Send the NEWLY signed tx
  });
}
```

**Impact:** The handler is useless. It provides no fee sponsorship. Users still pay their own fees.

**Required Fix:**
1. Add transaction deserialization (use viem's Transaction utilities or ox library)
2. Sign the transaction with the fee payer account
3. Support `eth_signTransaction` and `eth_signRawTransaction` methods like Tempo

---

### CRITICAL-002: keyManager Skips WebAuthn Challenge Verification

**Severity:** CRITICAL - Security vulnerability
**Location:** `src/server/Handler.ts:164-200`

**Expected Behavior (from Tempo):**
1. Decode `clientDataJSON` from Base64
2. **Verify challenge** exists in KV and hasn't expired
3. Verify `type === 'webauthn.create'`
4. Verify `origin` matches relying party
5. Parse `authenticatorData` and verify flags
6. Check User Present (UP) flag
7. **Delete/consume the challenge** (prevents replay)
8. Store the public key

**Actual Behavior:**
1. Check credential and publicKey exist
2. **Store public key immediately** - NO VERIFICATION

**Evidence:**
```typescript
// Radius implementation (INSECURE)
router.post(`${path}/:id`, async ({ params, request }) => {
  // ... validation of ID format ...
  const { credential, publicKey } = body;
  if (!credential) return Response.json({ error: 'Missing credential' }, { status: 400 });
  if (!publicKey) return Response.json({ error: 'Missing publicKey' }, { status: 400 });

  // MISSING: Challenge verification
  // MISSING: clientDataJSON parsing
  // MISSING: Type verification
  // MISSING: Origin verification
  // MISSING: authenticatorData parsing
  // MISSING: User Present flag check
  // MISSING: Challenge consumption (deletion)

  await kv.set(`credential:${id}`, publicKey);  // Just store it!
  return new Response(null, { status: 204 });
});
```

**Impact:**
- Anyone can register arbitrary credentials without proving possession
- Challenge replay attacks possible
- No verification that the client actually performed WebAuthn ceremony
- Credentials could be registered for domains they don't belong to

**Required Fix:**
1. Add `ox` dependency for Base64 utilities (or use native atob/btoa)
2. Parse and verify clientDataJSON
3. Verify challenge exists and delete after use
4. Verify type and origin
5. Parse authenticatorData and check flags

---

## Medium Issues

### MEDIUM-001: README Has Incorrect API Example

**Location:** `README.md:46-49`

**Issue:** Shows `createPrivateKeySigner` with two parameters, but the function only accepts one:

```typescript
// README shows (WRONG):
const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as `0x${string}`,
  radiusTestnet.id  // <-- This parameter doesn't exist!
);

// Actual API:
const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as `0x${string}`
);
```

**Impact:** Developers following the README will get TypeScript errors.

---

### MEDIUM-002: Missing Methods in feePayer

**Location:** `src/server/Handler.ts`

**Issue:** Tempo supports these methods, Radius only supports `eth_sendRawTransaction`:

| Method | Tempo | Radius |
|--------|-------|--------|
| `eth_signTransaction` | ✅ | ❌ |
| `eth_signRawTransaction` | ✅ | ❌ |
| `eth_sendRawTransaction` | ✅ | ✅ (broken) |
| `eth_sendRawTransactionSync` | ✅ | ❌ |

**Impact:** Reduced functionality. Clients expecting these methods will fail.

---

### MEDIUM-003: Test Coverage Doesn't Verify WebAuthn Flow

**Location:** `src/server/Handler.test.ts:125-148`

**Issue:** The test for storing credentials doesn't use a real challenge:
```typescript
it('should store and retrieve credential', async () => {
  const storeRequest = new Request('http://localhost/test-cred', {
    method: 'POST',
    body: JSON.stringify({
      credential: { response: { clientDataJSON: 'test' } },  // Not a real challenge!
      publicKey: '0x1234',
    }),
  });
  // This passes because verification is skipped
});
```

**Impact:** Tests pass but don't catch the security vulnerability.

---

## Minor Issues

### MINOR-001: Missing `ox` Dependency

**Issue:** Tempo uses the `ox` library for RPC types and Base64 utilities. Radius implements without it but would benefit from using it for consistency.

### MINOR-002: Console.error in Handler

**Location:** `src/server/Handler.ts:318`

```typescript
console.error('feePayer handler error:', error);
```

**Issue:** Should use a configurable logger instead of hardcoded console.error.

### MINOR-003: No Challenge Expiration

**Issue:** Challenges are stored but never expire. In a production system, old challenges should be cleaned up.

---

## What Was Done Right

### ✅ Phase 0: SDK Cleanup - EXCELLENT

- RadiusSigner interface completely removed
- ClefSigner directory removed
- `createPrivateKeySigner` now returns viem's `LocalAccount` directly
- All client code updated to use `LocalAccount`
- No legacy references found (`grep` clean)

### ✅ Phase 1: Infrastructure - GOOD

- Directory structure matches plan
- `types.ts` has comprehensive type definitions with good JSDoc
- `errors.ts` extends RadiusError properly
- `Kv.ts` matches Tempo's pattern exactly
- `requestListener.ts` properly ported

### ✅ Phase 3: Integration - GOOD

- Package.json exports configured correctly
- `/server` subpath works
- Dependencies added (`@remix-run/fetch-router`)

### ✅ Phase 4: Documentation - MOSTLY GOOD

- JSDoc on all public APIs
- `docs/server-handlers.md` comprehensive guide created
- README updated with server handlers section
- Future TODOs documented

### ✅ QA Metrics

- Type check: PASS
- Tests: 218 passed, 27 skipped
- No RadiusSigner/ClefSigner references

---

## Remediation Plan

### Priority 1: Fix CRITICAL-001 (feePayer signing)

1. Add transaction deserialization using viem's utilities
2. Implement actual fee payer signing logic
3. Support all four RPC methods Tempo supports
4. Add tests that verify signing actually occurs

### Priority 2: Fix CRITICAL-002 (keyManager security)

1. Add proper WebAuthn challenge verification
2. Implement challenge consumption (delete after use)
3. Add origin and type verification
4. Parse authenticatorData and verify flags
5. Add tests that verify the full WebAuthn flow

### Priority 3: Fix MEDIUM-001 (README)

1. Update README example to show correct API

### Priority 4: Add comprehensive tests

1. Test feePayer actually signs transactions
2. Test keyManager rejects invalid challenges
3. Test keyManager rejects replayed challenges

---

## Conclusion

The SDK made significant progress and the structural work is solid. However, **the two critical bugs render the server handlers non-functional for production use**. The feePayer doesn't pay fees, and the keyManager has security vulnerabilities.

**Recommendation:** Do NOT proceed to the next development phase until CRITICAL-001 and CRITICAL-002 are resolved and verified.

---

*End of Review Report*
