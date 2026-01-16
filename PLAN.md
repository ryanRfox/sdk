# SDK V2-Alpha API Alignment Plan

**Date:** January 2026
**Goal:** Eliminate non-standard API patterns before V2 release (zero users = zero breaking changes)
**Philosophy:** Don't patch hacks — remove them and do it right the first time.

---

## P0: Must Fix (Breaking Changes) ✅ ALL COMPLETE

These are direct API deviations from viem that will confuse every viem developer.

### P0-1: Error Messages with Hints ✅ COMPLETE

**Problem:** Errors say "Invalid params" with no context.

**Solution:**
- Add `metaMessages` array to `RadiusError` (matches viem's `BaseError` pattern)
- Add parameter validation to methods that detects common mistakes
- Throw helpful errors like: `getBalance expects { address }, got string. Use client.getBalance({ address }) instead.`

**Files:**
- `typescript/src/errors/base.ts` — Add metaMessages support
- `typescript/src/client/client.ts` — Add validation to methods

---

### P0-2: getBalance — Match Viem Signature ✅ COMPLETE

**Current (wrong):**
```typescript
getBalance(address: Address): Promise<bigint>
```

**Target (viem-compatible):**
```typescript
getBalance(params: { address: Address; blockTag?: BlockTag; blockNumber?: bigint }): Promise<bigint>
```

**File:** `typescript/src/client/client.ts`

---

### P0-3: getCode — Match Viem Signature ✅ COMPLETE

**Current (wrong):**
```typescript
getCode(address: Address): Promise<Hex>
```

**Target (viem-compatible):**
```typescript
getCode(params: { address: Address; blockTag?: BlockTag; blockNumber?: bigint }): Promise<Hex | undefined>
```

**Note:** Also change return type from `'0x'` to `undefined` for no code (matches viem).

**File:** `typescript/src/client/client.ts`

---

### P0-4: getNonce → getTransactionCount ✅ COMPLETE

**Current (wrong):**
```typescript
getNonce(address: Address): Promise<number>
```

**Target (viem-compatible):**
```typescript
getTransactionCount(params: { address: Address; blockTag?: BlockTag; blockNumber?: bigint }): Promise<number>
```

**File:** `typescript/src/client/client.ts`

---

### P0-5: sendRawTransaction — Match Viem Signature ✅ COMPLETE

**Current (wrong):**
```typescript
sendRawTransaction(signedTx: Hex): Promise<Hash>
```

**Target (viem-compatible):**
```typescript
sendRawTransaction(params: { serializedTransaction: Hex }): Promise<Hash>
```

**File:** `typescript/src/client/client.ts`

---

### P0-6: waitForReceipt → waitForTransactionReceipt ✅ COMPLETE

**Current (wrong):**
```typescript
waitForReceipt(hash: Hash): Promise<RadiusReceipt>
```

**Target (viem-compatible):**
```typescript
waitForTransactionReceipt(params: { hash: Hash }): Promise<RadiusReceipt>
```

**File:** `typescript/src/client/client.ts`

---

## P1: Add Viem-Compatible Aliases

These provide familiar entry points for viem developers while keeping Radius conveniences.

### P1-1: Add readContract (wraps call) ✅ COMPLETE

```typescript
readContract<TAbi extends Abi>({
  address: Address;
  abi: TAbi;
  functionName: string;
  args?: unknown[];
}): Promise<unknown>
```

Internally delegates to existing `call()` method.

**File:** `typescript/src/client/client.ts`

---

### P1-2: Add writeContract (wraps execute) ✅ COMPLETE

```typescript
writeContract<TAbi extends Abi>({
  address: Address;
  abi: TAbi;
  functionName: string;
  args?: unknown[];
  account: LocalAccount;
}): Promise<Hash>
```

Internally delegates to existing `execute()` method.

**File:** `typescript/src/client/client.ts`

---

### P1-3: Typed Contract Helper ✅ COMPLETE

```typescript
getContract<TAbi extends Abi>({ address, abi }): {
  read: { [method]: (args) => Promise<ReturnType> };
  write: { [method]: ({ args, signer }) => Promise<Receipt | Hash> };
}
```

Provides autocomplete for contract methods. Implemented in `typescript/src/contracts/typedContract.ts`.

**File:** `typescript/src/contracts/typedContract.ts`

---

### P1-4: Event Decoding Utility ✅ COMPLETE

```typescript
decodeEventLogs({ abi, logs, strict? }): DecodedEventLog[]
filterEventLogs({ abi, logs, eventName }): DecodedEventLog[]
```

Convenience wrappers around viem's `decodeEventLog`:
- `decodeEventLogs` - Decodes all logs, with strict/non-strict modes
- `filterEventLogs` - Filters and decodes logs for a specific event type

**File:** `typescript/src/events/decodeEventLogs.ts`

---

## Cleanup: Remove Technical Debt

### C1: Remove Deprecated Methods ✅ COMPLETE

Remove from interface and implementation:
- `executeSync` (replaced by `executeAndWait`)
- `sendSync` (replaced by `sendAndWait`)

**File:** `typescript/src/client/client.ts`

---

### C2: Rename /server → /webauthn ✅ COMPLETE

**Problem:** "server" implies general server utilities; it's actually WebAuthn credential management.

**Changes:**
- Rename `typescript/src/server/` → `typescript/src/webauthn/`
- Update `package.json` exports: `"./server"` → `"./webauthn"`
- Update internal imports
- ~~Keep `"./server"` as deprecated alias pointing to `"./webauthn"`~~ (removed entirely for alpha)

**Files:**
- `typescript/package.json`
- `typescript/src/webauthn/*` (renamed from `src/server/*`)

---

### C3: Add CJS Export for WebAuthn Module ⏸️ DEFERRED

**Problem:** Server module is ESM-only, breaks CommonJS projects.

**Solution:** Add CJS build output for webauthn module.

**Status:** Deferred — `@remix-run/fetch-router` has ESM-only issues with `moduleResolution: node`

**File:** `typescript/package.json`

---

## Keep As-Is: Deliberate Improvements

These are intentional improvements over viem, not deviations:

| Feature | Why Keep |
|---------|----------|
| `sendAndWait()`, `executeAndWait()` | Convenient combined operations |
| `deployContract` returns `{ address, receipt }` | Better than parsing receipt |
| `RadiusReceipt.status: 'success' \| 'reverted'` | Readable vs viem's `1 \| 0` |
| `call()`, `execute()` simplified API | Keep as Radius conveniences alongside viem aliases |

---

## Implementation Order

### Phase 1: Parallel (No File Conflicts) ✅ COMPLETE
- [x] **Agent A:** Update `errors/base.ts` — add metaMessages support
- [x] **Agent B:** Prepare webauthn rename — identify all affected files, draft package.json changes

### Phase 2: Sequential (All touch client.ts) ✅ COMPLETE
- [x] P0-2 through P0-6: Update method signatures in client.ts
- [x] Add parameter validation with helpful errors
- [x] Remove deprecated methods (executeSync, sendSync)
- [x] **P1-3:** Add typed contract helper with `getContract()` method

### Phase 3: Final ✅ COMPLETE
- [x] Execute webauthn rename (`/server` → `/webauthn`)
- [ ] Add CJS export for webauthn (deferred — @remix-run/fetch-router has ESM-only issues)
- [x] Build and test (215 tests pass, ESM + CJS builds succeed)
- [x] Update any affected imports in integration tests

### Phase 4: P1 Features ✅ ALL COMPLETE
- [x] **P1-1:** Add readContract alias (wraps call)
- [x] **P1-2:** Add writeContract alias (wraps execute)
- [x] **P1-3:** Typed Contract Helper — `client.getContract({ address, abi })` with read/write namespaces
- [x] **P1-4:** Event decoding utility — `decodeEventLogs()` and `filterEventLogs()`

---

## Verification

After implementation, test against evaluation project:
```bash
cd /Users/fox/Getting\ Started/radius-first-contact
npx tsx src/01-connect.ts
npx tsx src/02-send.ts
# ... etc
```

All scripts should work with updated API (will need minor updates for new signatures).
