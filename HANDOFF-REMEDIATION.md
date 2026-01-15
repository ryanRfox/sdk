# HANDOFF: Server Handler Remediation

> **Purpose:** Guide a new Claude session to fix critical bugs in the Radius SDK server handlers
> **Created:** 15 January 2026
> **Priority:** CRITICAL - Block production until fixed
> **Review Document:** `REVIEW-REPORT.md`

---

## Context

The server handlers were implemented but contain two critical bugs that make them non-functional:

1. **feePayer doesn't sign transactions** - It just forwards them, defeating the purpose
2. **keyManager skips WebAuthn verification** - Security vulnerability

Your job is to fix these issues by studying Tempo's implementation and replicating the correct behavior.

---

## Critical Bug #1: feePayer Doesn't Sign

### Location
`typescript/src/server/Handler.ts` - function `feePayer()`

### Current (Broken) Behavior
```typescript
if (body.method === 'eth_sendRawTransaction') {
  const serializedTx = body.params[0];
  const result = await client.request({
    method: 'eth_sendRawTransaction',
    params: [serializedTx as Hex],  // Just forwarding! Never signing!
  });
}
```

### Required (Correct) Behavior
From Tempo (`/tmp/tempo-ts/src/server/Handler.ts:568-588`):

```typescript
if (request.method === 'eth_sendRawTransaction') {
  const serialized = request.params?.[0];
  const transaction = Transaction.deserialize(serialized);  // 1. Deserialize

  const serializedTransaction = await signTransaction(client, {
    ...transaction,
    account,
    feePayer: account,  // 2. Sign as fee payer
  });

  const result = await client.request({
    method: request.method,
    params: [serializedTransaction],  // 3. Send the NEW signed tx
  });
}
```

### Fix Requirements

1. **Add transaction deserialization**
   - Use viem's transaction utilities or the `ox` library's `Transaction.deserialize`
   - Tempo uses: `import { Transaction } from 'ox'`

2. **Sign with fee payer account**
   - Use viem's `signTransaction` from `viem/actions`
   - Pass `account` and `feePayer: account`

3. **Support all four RPC methods** (like Tempo):
   - `eth_signTransaction` - Sign and return (don't submit)
   - `eth_signRawTransaction` - Deserialize, sign, return
   - `eth_sendRawTransaction` - Deserialize, sign, submit
   - `eth_sendRawTransactionSync` - Same as above (Tempo variant)

4. **Use proper RPC request/response types**
   - Tempo uses `ox` library's `RpcRequest` and `RpcResponse`
   - Or implement equivalent JSON-RPC handling

### Reference Files
- `/tmp/tempo-ts/src/server/Handler.ts:514-615` - Tempo's feePayer implementation
- Look at Tempo's imports for `Transaction`, `RpcRequest`, `RpcResponse`

---

## Critical Bug #2: keyManager Skips WebAuthn Verification

### Location
`typescript/src/server/Handler.ts` - function `keyManager()`, POST handler

### Current (Broken) Behavior
```typescript
router.post(`${path}/:id`, async ({ params, request }) => {
  const { credential, publicKey } = body;
  if (!credential) return Response.json({ error: 'Missing credential' }, { status: 400 });
  if (!publicKey) return Response.json({ error: 'Missing publicKey' }, { status: 400 });

  // MISSING ALL VERIFICATION!

  await kv.set(`credential:${id}`, publicKey);  // Just store it!
});
```

### Required (Correct) Behavior
From Tempo (`/tmp/tempo-ts/src/server/Handler.ts:233-300`):

```typescript
router.post(`${path}/:id`, async ({ params, request }) => {
  const { credential, publicKey } = body;

  // 1. Decode clientDataJSON from Base64
  const clientDataJSON = JSON.parse(
    Base64.toString(credential.response.clientDataJSON)
  );

  // 2. Verify challenge exists
  const challenge = Base64.toHex(clientDataJSON.challenge);
  if (!(await kv.get(`challenge:${challenge}`))) {
    return Response.json({ error: 'Invalid or expired challenge' }, { status: 400 });
  }

  // 3. Verify type
  if (clientDataJSON.type !== 'webauthn.create') {
    return Response.json({ error: 'Invalid type' }, { status: 400 });
  }

  // 4. Verify origin (if rp configured)
  if (rp?.id && !rp.id.includes('localhost') &&
      clientDataJSON.origin !== `https://${rp.id}`) {
    return Response.json({ error: 'Invalid origin' }, { status: 400 });
  }

  // 5. Parse authenticatorData and check flags
  const authenticatorData = Base64.toBytes(credential.response.authenticatorData);
  const flags = authenticatorData[32];
  const userPresent = (flags & 0x01) !== 0;
  if (!userPresent) {
    return Response.json({ error: 'User not present' }, { status: 400 });
  }

  // 6. CRITICAL: Consume the challenge (prevent replay)
  await kv.delete(`challenge:${challenge}`);

  // 7. Now safe to store
  await kv.set(`credential:${id}`, publicKey);
});
```

### Fix Requirements

1. **Add Base64 utilities**
   - Tempo uses `ox` library's `Base64`
   - Or use native `atob()`/`btoa()` with proper encoding

2. **Parse and verify clientDataJSON**
   - Decode from Base64
   - Extract and verify challenge

3. **Verify challenge in KV**
   - Must exist
   - Must not have been used before

4. **Verify type is 'webauthn.create'**

5. **Verify origin matches relying party**
   - Skip for localhost
   - Otherwise must match `https://{rp.id}`

6. **Parse authenticatorData**
   - Check User Present (UP) flag at byte 32, bit 0

7. **CRITICAL: Delete challenge after use**
   - `await kv.delete(\`challenge:${challenge}\`)`
   - This prevents replay attacks

### Reference Files
- `/tmp/tempo-ts/src/server/Handler.ts:233-300` - Tempo's POST handler

---

## Medium Priority Fixes

### Fix README API Example

**Location:** `typescript/README.md:46-49`

**Current (Wrong):**
```typescript
const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as `0x${string}`,
  radiusTestnet.id  // This parameter doesn't exist!
);
```

**Correct:**
```typescript
const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as `0x${string}`
);
```

---

## Dependencies to Add

You may need to add the `ox` library for Tempo-compatible utilities:

```bash
pnpm add ox
```

This provides:
- `Transaction.deserialize()` - For deserializing raw transactions
- `RpcRequest` / `RpcResponse` - For JSON-RPC handling
- `Base64` - For WebAuthn data encoding

Alternatively, you can implement these with viem's utilities and native JS.

---

## Task Breakdown

### Task R1: Fix feePayer Handler
**Priority:** CRITICAL
**Estimated Complexity:** Medium

1. Add necessary imports (ox or viem transaction utilities)
2. Implement `eth_signTransaction` method
3. Implement `eth_signRawTransaction` method
4. Fix `eth_sendRawTransaction` to actually sign
5. Optionally add `eth_sendRawTransactionSync`
6. Write tests that verify signing occurs

### Task R2: Fix keyManager POST Handler
**Priority:** CRITICAL
**Estimated Complexity:** Medium

1. Add Base64 utilities (ox or native)
2. Implement clientDataJSON parsing
3. Add challenge verification
4. Add type verification
5. Add origin verification
6. Add authenticatorData parsing and flag check
7. Add challenge consumption (delete)
8. Write tests that verify the full WebAuthn flow

### Task R3: Fix README
**Priority:** MEDIUM
**Estimated Complexity:** Low

1. Update the createPrivateKeySigner example

### Task R4: Add Comprehensive Tests
**Priority:** HIGH
**Estimated Complexity:** Medium

1. Test that feePayer actually produces different output (signed tx)
2. Test that keyManager rejects requests with invalid challenges
3. Test that keyManager rejects replayed challenges
4. Test that keyManager rejects wrong type/origin

---

## Verification Checklist

Before marking remediation complete:

- [ ] `pnpm check:types` passes
- [ ] `pnpm test` passes
- [ ] feePayer test verifies transaction is actually signed
- [ ] keyManager test verifies challenge is required
- [ ] keyManager test verifies challenge can't be reused
- [ ] README example compiles correctly
- [ ] Manual review confirms Tempo patterns are followed

---

## Tempo Reference Quick Links

All in `/tmp/tempo-ts/src/server/`:

| Feature | File | Lines |
|---------|------|-------|
| feePayer signing | Handler.ts | 514-615 |
| keyManager POST | Handler.ts | 233-300 |
| Base64 utilities | Uses `ox` library | - |
| RPC types | Uses `ox` library | - |

---

## Success Criteria

The remediation is complete when:

1. **feePayer actually signs transactions**
   - A test proves the output differs from input
   - The `account` parameter is actually used

2. **keyManager verifies WebAuthn properly**
   - Challenges are validated
   - Challenges are consumed (can't reuse)
   - Type and origin are checked
   - User Present flag is verified

3. **All tests pass**

4. **README is accurate**

---

## Git Workflow

Work on the existing branch: `feature/v2-viem-migration`

Commit after each fix:
- `fix(server): implement actual fee payer signing in Handler.feePayer`
- `fix(server): add WebAuthn verification to Handler.keyManager`
- `fix(docs): correct createPrivateKeySigner example in README`
- `test(server): add comprehensive handler security tests`

---

*End of Handoff Document*
