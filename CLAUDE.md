# Radius SDK - Remediation Instructions

> **Current Mission:** Fix critical bugs in server handlers before production
> **Priority:** CRITICAL
> **Documents:** `REVIEW-REPORT.md`, `HANDOFF-REMEDIATION.md`

---

## STOP - Read This First

**There are TWO CRITICAL BUGS that must be fixed before any other work:**

1. **feePayer doesn't sign transactions** - It just forwards them unchanged
2. **keyManager skips WebAuthn verification** - Major security vulnerability

Read `HANDOFF-REMEDIATION.md` for detailed fix instructions.

---

## Your Role: Remediation Engineer

You are fixing bugs, not building new features. Your workflow:

1. **Study the bug** - Understand what's wrong
2. **Study Tempo's implementation** - The correct pattern is in `/tmp/tempo-ts/`
3. **Implement the fix** - Match Tempo's behavior
4. **Write tests that prove the fix** - Tests must catch the original bug
5. **Verify** - Run `pnpm check:types` and `pnpm test`

---

## Critical Bug Locations

### Bug #1: feePayer (CRITICAL)

**File:** `typescript/src/server/Handler.ts`
**Function:** `feePayer()`
**Problem:** Never signs transactions with the fee payer account

**Reference:** `/tmp/tempo-ts/src/server/Handler.ts:514-615`

The fix requires:
- Deserialize incoming transactions
- Sign with the `account` parameter
- Support methods: `eth_signTransaction`, `eth_signRawTransaction`, `eth_sendRawTransaction`

### Bug #2: keyManager POST (CRITICAL)

**File:** `typescript/src/server/Handler.ts`
**Function:** `keyManager()`, the POST route handler
**Problem:** Stores credentials without verifying WebAuthn challenge

**Reference:** `/tmp/tempo-ts/src/server/Handler.ts:233-300`

The fix requires:
- Parse clientDataJSON from Base64
- Verify challenge exists in KV
- Verify type is 'webauthn.create'
- Verify origin matches relying party
- Check User Present flag in authenticatorData
- **Delete challenge after use** (prevents replay)

### Bug #3: README (MEDIUM)

**File:** `typescript/README.md:46-49`
**Problem:** Shows wrong API (2 params instead of 1)

---

## Task Checklist

Use TodoWrite to track these:

```
[ ] R1: Fix feePayer to actually sign transactions
[ ] R2: Fix keyManager to verify WebAuthn challenges
[ ] R3: Fix README API example
[ ] R4: Add tests proving the fixes work
[ ] R5: Final QA verification
```

---

## QA Requirements

**Every fix must include:**

1. `pnpm check:types` - Must pass
2. `pnpm test` - Must pass
3. **New tests that would have caught the bug**

For feePayer:
- Test that output differs from input (proves signing happened)
- Test all supported RPC methods

For keyManager:
- Test that missing challenge returns error
- Test that reused challenge returns error
- Test that wrong type returns error
- Test that missing User Present flag returns error

---

## Reference Files

### Tempo Implementation (CORRECT patterns)
```
/tmp/tempo-ts/src/server/Handler.ts   - Main handlers (study lines 233-300, 514-615)
/tmp/tempo-ts/src/server/Kv.ts        - KV store
```

### Radius Implementation (HAS BUGS)
```
typescript/src/server/Handler.ts      - Fix this file
typescript/src/server/Handler.test.ts - Add tests here
```

### Review Documents
```
REVIEW-REPORT.md       - Detailed bug analysis
HANDOFF-REMEDIATION.md - Fix instructions
```

---

## Dependencies

You may need to add the `ox` library:

```bash
pnpm add ox
```

This provides:
- `Transaction.deserialize()` - Deserialize raw transactions
- `Base64` - Encode/decode WebAuthn data
- `RpcRequest` / `RpcResponse` - JSON-RPC types

Or implement equivalent functionality with viem/native JS.

---

## Tempo Repository

If `/tmp/tempo-ts/` doesn't exist, clone it:

```bash
cd /tmp && git clone --depth 1 https://github.com/tempoxyz/tempo-ts.git tempo-ts
```

---

## Git Workflow

**Branch:** `feat/server-handler-remediation`

**Commit after each fix:**
```
fix(server): implement actual fee payer signing in Handler.feePayer
fix(server): add WebAuthn verification to Handler.keyManager
fix(docs): correct createPrivateKeySigner example in README
test(server): add comprehensive handler security tests
```

**NEVER include in commits:**
- Claude attribution
- AI assistance mentions
- Co-authored-by lines

---

## Verification Before Done

Run this checklist before declaring remediation complete:

```bash
# 1. Types pass
pnpm check:types

# 2. Tests pass
pnpm test

# 3. No legacy issues
grep -r "RadiusSigner\|ClefSigner" typescript/src/

# 4. Manual verification
# - feePayer test shows signing occurs
# - keyManager test shows challenge verification
```

---

## If You Need Context

1. Read `HANDOFF-REMEDIATION.md` - Full fix instructions
2. Read `REVIEW-REPORT.md` - Bug analysis and evidence
3. Read `/tmp/tempo-ts/src/server/Handler.ts` - Correct implementation
4. Check git log for recent changes: `git log --oneline -20`

---

## Success Criteria

Remediation is complete when:

1. **feePayer actually signs** - Test proves output differs from input
2. **keyManager verifies challenges** - Test proves invalid challenges rejected
3. **keyManager prevents replay** - Test proves reused challenges rejected
4. **All tests pass** - `pnpm test` green
5. **Types pass** - `pnpm check:types` clean
6. **README accurate** - Example compiles correctly

---

## Do NOT

- Add new features (scope creep)
- Refactor unrelated code
- Change APIs beyond what's needed for the fix
- Skip writing tests
- Mark complete without QA verification

---

## Escalator Pattern (If Using Subagents)

If you prefer to use the escalator pattern with subagents:

1. Start with Haiku for initial implementation
2. QA with Haiku
3. Escalate to Sonnet if issues
4. Escalate to Opus if still issues

Worker templates are in `.claude/agents/coder.md` and `.claude/agents/qa.md`.

But for this focused remediation, direct implementation may be faster.

---

*Focus on fixing bugs. Match Tempo's implementation. Prove the fix with tests.*
