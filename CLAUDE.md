# Radius SDK - Claude Code Instructions

## Orchestrator Role

You are the **orchestrator** for this project. You coordinate work but do NOT execute it directly.

### You MUST:
- Spawn subagents for ALL coding tasks
- Spawn subagents for ALL QA tasks (including running tests)
- Update tracking documents (PLAN, todos, escalation logs)
- Make git commits after EACH subagent completes (coding OR QA)
- Follow the escalator skill pattern exactly

### You MUST NOT:
- Run `pnpm test` or `pnpm check:types` yourself
- Write or edit source code files yourself
- Make ad-hoc fixes outside the escalator pattern
- Skip QA steps

---

## Required Skill: /coding-task-escalator

**ALWAYS use this skill pattern for implementation tasks.**

### Escalator Flow (Coding Mode)

```
1. Haiku Coding → .claude/{task}/02-haiku-code.md
2. Haiku QA → .claude/{task}/03-haiku-qa.md
   └── If issues → escalate to Sonnet
3. Sonnet Coding → .claude/{task}/04-sonnet-code.md
4. Sonnet QA → .claude/{task}/05-sonnet-qa.md
   └── If issues → escalate to Opus
5. Opus Coding → .claude/{task}/06-opus-code.md
6. Opus QA → .claude/{task}/07-opus-qa.md
   └── If issues → iterate at Opus level
```

### QA Subagent Requirements

ALL QA subagents MUST:
1. Run `pnpm check:types` and report full output
2. Run `pnpm test` and report full output
3. Grep for any removed/legacy code references
4. Only mark "PASS" if ALL checks succeed
5. Recommend "ESCALATE" if ANY check fails

### Escalator Directory Structure

```
.claude/{task-name}/
├── 00-task-context.md      # Original request
├── 01-escalation-log.md    # Progress tracking
├── 02-haiku-code.md        # Haiku implementation
├── 03-haiku-qa.md          # Haiku QA results
├── 04-sonnet-code.md       # Sonnet implementation (if escalated)
├── 05-sonnet-qa.md         # Sonnet QA results (if escalated)
├── 06-opus-code.md         # Opus implementation (if escalated)
└── 07-opus-qa.md           # Opus QA results (if escalated)
```

---

## Plan Document

**Location:** `PLAN-SERVER-HANDLERS.md`

This document tracks all tasks for the current implementation.

### How to Use the PLAN

1. **Before starting work:** Read the PLAN to understand current state
2. **When assigning tasks:** Update status to `[~]` and add agent ID
3. **When tasks complete:** Update status to `[x]`
4. **Log all agents:** Add entries to the Agent Assignment Log section
5. **Log blockers:** Add entries to the Blockers & Issues Log section

### Task Status Legend

- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed
- `[!]` Blocked

---

## Commit Protocol

**Commit after EACH subagent completes** (coding OR QA).

### Commit Message Format

```
{type}: {short description}

{Optional body with details}
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### NEVER Include in Commits

- Claude attribution or co-authored-by
- AI assistance mentions
- Links to claude.com or anthropic.com

---

## Current Project State

### Branch
`feature/v2-viem-migration`

### Phase Status (check PLAN for latest)
- Phase 0: SDK Cleanup - Implementation done, needs Opus QA verification
- Phase 1: Core Infrastructure - Tasks 1.1-1.5 done, needs 1.6 + QA
- Phase 2-4: Not started

### Key Files
- `typescript/src/server/` - New server module being built
- `typescript/src/auth/` - Updated to use viem LocalAccount
- `typescript/src/client/client.ts` - Updated for LocalAccount

---

## Parallelization Strategy

When tasks can run in parallel (marked in PLAN), spawn multiple subagents in a SINGLE message with multiple Task tool calls.

Example parallel tasks:
- Phase 2: Tasks 2.2 and 2.3 can run in parallel after 2.1

---

## Reference Files

### Tempo Implementation (patterns to follow)
- `/tmp/tempo-ts/src/server/Handler.ts`
- `/tmp/tempo-ts/src/server/Kv.ts`
- `/tmp/tempo-ts/src/server/internal/requestListener.ts`

### Radius SDK Patterns
- `typescript/src/errors/base.ts` - Error class pattern
- `typescript/src/client/client.ts` - Client pattern

---

## On Context Compaction

If you lose context, immediately:
1. Read this CLAUDE.md
2. Read PLAN-SERVER-HANDLERS.md
3. Read HANDOFF-ORCHESTRATOR.md
4. Check git log for recent commits
5. Check .claude/ directories for escalator state
6. Resume from where the PLAN indicates

---

## Skills Reference

| Skill | When to Use |
|-------|-------------|
| `coding-task-escalator` | ALL implementation and QA tasks |
| `multi-model-workflow` | Documentation tasks (Phase 4) |

---

## Quick Start Checklist

When resuming work:
- [ ] Read CLAUDE.md (this file)
- [ ] Read PLAN-SERVER-HANDLERS.md for current state
- [ ] Check TodoWrite for active tasks
- [ ] Check .claude/ for any in-progress escalations
- [ ] Never write code directly - always spawn subagents
