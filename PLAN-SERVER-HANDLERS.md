# PLAN: Radius SDK Server Handlers Implementation

> **Status:** IN PROGRESS - Returning to Phase 0 for proper QA
> **Created:** 14 January 2026
> **Updated:** 15 January 2026
> **Target Branch:** `feature/v2-viem-migration`
> **Estimated Phases:** 4

---

## Orchestrator Protocol

**The orchestrator (Claude) MUST:**
- Spawn subagents for ALL coding tasks
- Spawn subagents for ALL QA tasks (including running tests)
- Update tracking documents only
- Make commits only after subagent work completes

**The orchestrator MUST NOT:**
- Run tests or type checks directly
- Write or edit code files directly
- Skip QA steps or make ad-hoc fixes

**QA Requirements (ALL QA subagents must):**
1. Run `pnpm check:types` and report results
2. Run `pnpm test` and report results
3. Grep for any removed/legacy references
4. Only mark "PASS" if ALL checks succeed

---

## Overview

Build server-side handlers for the Radius V2 SDK following Tempo's patterns exactly. This enables gasless UX and backend transaction relay for Radius applications.

### Key Decisions Made

1. **Use viem's `LocalAccount` directly** - No custom RadiusSigner interface
2. **Remove ClefSigner** - Not needed, Radius is not Geth-specific
3. **Follow Tempo's JSON-RPC pattern** - For client-server communication
4. **WebAuthn keyManager** - Like Tempo, for credential storage
5. **Sign and submit mode** - Like Tempo (Option C deferred to future)

### Future TODOs (Out of Scope)

- [ ] Client-side utilities for calling handlers (like Tempo has)
- [ ] Option C: Sign-only mode (return signed tx to client)
- [ ] Rate limiting utilities
- [ ] Metrics/logging hooks

---

## File Structure

```
typescript/src/server/
├── Handler.ts              # Main handler implementations
├── Kv.ts                   # KV store abstraction
├── types.ts                # Server module types
├── errors.ts               # Server-specific errors
├── internal/
│   └── requestListener.ts  # Node.js HTTP adapter
└── index.ts                # Public exports
```

---

## Phase Tracking

### Legend
- `[ ]` Not started
- `[~]` In progress (assign agent ID when started)
- `[x]` Completed
- `[!]` Blocked

---

## Phase 0: SDK Cleanup (Sequential)

Remove RadiusSigner abstraction and ClefSigner before building server handlers.

| ID | Task | Status | Agent | Dependencies | Notes |
|----|------|--------|-------|--------------|-------|
| 0.1 | Remove `RadiusSigner` interface from `src/auth/types.ts` | [x] | Haiku | - | Committed ec49dcd |
| 0.2 | Remove `src/auth/clef/` directory entirely | [x] | Haiku | - | Committed ec49dcd |
| 0.3 | Update `PrivateKeySigner` to return viem `LocalAccount` | [x] | Haiku | 0.1 | Committed ec49dcd |
| 0.4 | Update `src/auth/index.ts` exports | [x] | Sonnet | 0.2, 0.3 | Committed ec49dcd |
| 0.5 | Update `src/index.ts` main exports | [x] | Sonnet | 0.4 | Committed ec49dcd |
| 0.6 | Update `src/client/client.ts` to use `LocalAccount` | [x] | Sonnet | 0.3 | Committed ec49dcd |
| 0.7 | Run tests and fix any failures | [x] | Sonnet | 0.6 | Committed ec49dcd |
| 0.8 | Run type check | [x] | Sonnet | 0.7 | Committed ec49dcd |
| **0.9** | **OPUS QA: Full verification** | [ ] | - | 0.8 | **NEW - Proper QA gate** |

**Phase 0 Completion Criteria:**
- All tests pass (`pnpm test` - verified by QA subagent)
- Type check passes (`pnpm check:types` - verified by QA subagent)
- No references to RadiusSigner or ClefSigner remain (grep verified)
- **Opus QA sign-off required before Phase 1**

---

## Phase 1: Core Infrastructure (Sequential)

Set up the server module structure and base utilities.

| ID | Task | Status | Agent | Dependencies | Notes |
|----|------|--------|-------|--------------|-------|
| 1.1 | Create `src/server/` directory | [x] | Orchestrator | Phase 0.9 | Directory exists |
| 1.2 | Implement `src/server/types.ts` | [x] | Haiku | 1.1 | **NEEDS QA** |
| 1.3 | Implement `src/server/errors.ts` | [x] | Haiku | 1.1 | **NEEDS QA** |
| 1.4 | Implement `src/server/internal/requestListener.ts` | [x] | Haiku | 1.2 | **NEEDS QA** |
| 1.5 | Implement `src/server/Kv.ts` | [x] | Haiku | 1.2 | **NEEDS QA** |
| 1.6 | Create `src/server/index.ts` stub | [ ] | - | 1.2-1.5 | Blocked on Phase 0.9 |
| **1.7** | **QA: Verify all Phase 1 files** | [ ] | - | 1.6 | **Run tests + type check** |

**Phase 1 Completion Criteria:**
- Directory structure exists
- Types compile without errors (`pnpm check:types` - verified by QA subagent)
- Kv.memory() works (verified by test)
- **QA subagent sign-off required before Phase 2**

---

## Phase 2: Handler Implementation (Parallelizable)

Implement the core handler functions. Tasks 2.2 and 2.3 can run in parallel.

| ID | Task | Status | Agent | Dependencies | Notes |
|----|------|--------|-------|--------------|-------|
| 2.1 | Implement `Handler.from()` base factory | [ ] | - | Phase 1 | Creates router with middleware |
| 2.2 | Implement `Handler.feePayer()` | [ ] | - | 2.1 | **PARALLEL OK** - Main handler |
| 2.3 | Implement `Handler.keyManager()` | [ ] | - | 2.1 | **PARALLEL OK** - WebAuthn handler |
| 2.4 | Implement `Handler.compose()` | [ ] | - | 2.2, 2.3 | Combine handlers |
| 2.5 | Write unit tests for feePayer | [ ] | - | 2.2 | Mock client/signer |
| 2.6 | Write unit tests for keyManager | [ ] | - | 2.3 | Test KV operations |
| 2.7 | Write unit tests for compose | [ ] | - | 2.4 | Test routing |

**Parallel Execution Note:**
- After 2.1 completes, tasks 2.2 and 2.3 can be assigned to separate agents
- Task 2.4 must wait for both 2.2 and 2.3

**Phase 2 Completion Criteria:**
- All handlers implemented
- All unit tests pass (`pnpm test` - verified by QA subagent)
- Type check passes (`pnpm check:types` - verified by QA subagent)
- Handlers work with Express (`.listener`)
- **QA subagent sign-off required before Phase 3**

---

## Phase 3: Integration & Exports (Sequential)

Wire everything together and update SDK exports.

| ID | Task | Status | Agent | Dependencies | Notes |
|----|------|--------|-------|--------------|-------|
| 3.1 | Update `package.json` exports for `/server` | [ ] | - | Phase 2 | Add subpath export |
| 3.2 | Add `@remix-run/fetch-router` dependency | [ ] | - | - | Check version compatibility |
| 3.3 | Add `ox` dependency (for RPC types) | [ ] | - | - | Used by Tempo |
| 3.4 | Finalize `src/server/index.ts` exports | [ ] | - | 3.1 | Export Handler, Kv |
| 3.5 | Write integration test with mock server | [ ] | - | 3.4 | Test full flow |
| 3.6 | Run full test suite | [ ] | - | 3.5 | `pnpm test` |
| 3.7 | Run type check | [ ] | - | 3.6 | `pnpm check:types` |

**Phase 3 Completion Criteria:**
- `import { Handler, Kv } from '@radiustechsystems/sdk/server'` works
- Integration test passes
- All existing tests still pass

---

## Phase 4: Documentation (Sequential)

| ID | Task | Status | Agent | Dependencies | Notes |
|----|------|--------|-------|--------------|-------|
| 4.1 | Add JSDoc to all public APIs | [ ] | - | Phase 3 | Follow viem style |
| 4.2 | Update SDK README with server handler section | [ ] | - | 4.1 | Usage examples |
| 4.3 | Create `docs/server-handlers.md` guide | [ ] | - | 4.1 | Detailed documentation |
| 4.4 | Document future TODO: client-side utilities | [ ] | - | 4.3 | In docs |
| 4.5 | Final review and cleanup | [ ] | - | 4.4 | Remove any debug code |

**Phase 4 Completion Criteria:**
- All public APIs have JSDoc
- README updated
- Documentation complete

---

## Reference Files

### Tempo Implementation (in /tmp/tempo-ts/)
- `/tmp/tempo-ts/src/server/Handler.ts` - Main implementation to follow
- `/tmp/tempo-ts/src/server/Kv.ts` - KV store pattern
- `/tmp/tempo-ts/src/server/internal/requestListener.ts` - Node.js adapter

### Radius SDK (current branch)
- `typescript/src/client/client.ts` - RadiusClient to use with handlers
- `typescript/src/errors/base.ts` - Error pattern to follow
- `typescript/src/auth/privatekey/signer.ts` - Will be updated in Phase 0

---

## Success Criteria

When complete, this code should work:

```typescript
// server.ts
import express from 'express'
import { privateKeyToAccount } from 'viem/accounts'
import { Handler, Kv } from '@radiustechsystems/sdk/server'
import { createRadiusClient } from '@radiustechsystems/sdk'
import { radiusTestnet } from '@radiustechsystems/sdk/chains'

const app = express()

const client = createRadiusClient({ chain: radiusTestnet })
const account = privateKeyToAccount(process.env.SPONSOR_KEY as `0x${string}`)

const handler = Handler.compose([
  Handler.feePayer({ account, client }),
  Handler.keyManager({ kv: Kv.memory() }),
])

app.use('/api/radius', handler.listener)
app.listen(3000)
```

---

## Agent Assignment Log

Track which agents are working on which tasks:

| Agent ID | Assigned Tasks | Started | Completed | Notes |
|----------|---------------|---------|-----------|-------|
| - | - | - | - | - |

---

## Blockers & Issues Log

| ID | Issue | Reported By | Status | Resolution |
|----|-------|-------------|--------|------------|
| - | - | - | - | - |

---

*End of Plan Document*
