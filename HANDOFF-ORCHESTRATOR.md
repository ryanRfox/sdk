# HANDOFF: Orchestrator for Server Handlers Implementation

> **Purpose:** Guide an orchestrator Claude to coordinate parallel subagents implementing Radius SDK server handlers
> **Created:** 14 January 2026
> **Plan Document:** `PLAN-SERVER-HANDLERS.md`

---

## Your Role

You are the **orchestrator**. Your job is to:
1. Read and understand the PLAN document
2. Spawn subagents to execute tasks
3. Track progress by updating the PLAN document
4. Handle blockers and coordinate dependencies
5. Ensure quality through proper sequencing

**You should NOT write code directly.** Delegate all implementation to subagents.

---

## How to Use the PLAN Document

### 1. Task Status Updates

When you assign a task to an agent, update the PLAN:

```markdown
| 2.2 | Implement `Handler.feePayer()` | [~] | agent-abc123 | 2.1 | **PARALLEL OK** |
```

When a task completes:

```markdown
| 2.2 | Implement `Handler.feePayer()` | [x] | agent-abc123 | 2.1 | **PARALLEL OK** |
```

### 2. Agent Assignment Log

Track all active agents in the log at the bottom of the PLAN:

```markdown
| agent-abc123 | 2.2 | 2026-01-14 10:30 | 2026-01-14 11:45 | feePayer done |
| agent-def456 | 2.3 | 2026-01-14 10:30 | - | In progress |
```

### 3. Blockers

If an agent reports a blocker, log it:

```markdown
| B001 | Missing ox dependency | agent-abc123 | Open | Need to run pnpm add ox |
```

---

## Spawning Subagents

### Task Tool Usage

Use the `Task` tool with `subagent_type` to spawn agents:

```
Task tool:
- subagent_type: "general-purpose" (for implementation tasks)
- subagent_type: "Bash" (for running commands)
- subagent_type: "Explore" (for researching code)
```

### Prompt Template for Implementation Tasks

When spawning an implementation agent, include:

```
## Context
You are implementing part of the Radius SDK server handlers.
Working directory: /Users/fox/Getting Started/radius-sdk
Branch: feature/v2-viem-migration

## Your Task
[Task ID]: [Task Description]

## Reference Files
- Read: [relevant files to understand]
- Write: [files to create/modify]

## Patterns to Follow
- Follow Tempo's implementation in /tmp/tempo-ts/src/server/
- Follow existing Radius SDK patterns for errors, types, exports
- Use viem's LocalAccount, not custom signer interfaces

## Acceptance Criteria
[Specific criteria from PLAN]

## Important
- Do NOT modify files outside your task scope
- Run `pnpm check:types` after changes
- Report any blockers immediately
```

### Prompt Template for Test Tasks

```
## Context
You are writing tests for the Radius SDK server handlers.
Working directory: /Users/fox/Getting Started/radius-sdk
Branch: feature/v2-viem-migration

## Your Task
[Task ID]: [Task Description]

## Test Patterns
- Use vitest (already configured)
- Follow existing test patterns in the repo
- Mock external dependencies (client, network calls)

## Files to Test
[List of implementation files]

## Run Tests With
pnpm test
```

---

## Execution Strategy

### Phase 0: Sequential (One Agent)

Phase 0 involves removing RadiusSigner and ClefSigner. Run this with a single agent to avoid conflicts:

```
Spawn ONE agent for all of Phase 0:
- Tasks 0.1 through 0.8
- Must complete before Phase 1
```

### Phase 1: Sequential (One Agent)

Phase 1 sets up infrastructure. Run with a single agent:

```
Spawn ONE agent for all of Phase 1:
- Tasks 1.1 through 1.6
- Must complete before Phase 2
```

### Phase 2: Parallel Opportunities

After task 2.1 completes, you can parallelize:

```
Sequential: 2.1 (Handler.from base)
     |
     v
Parallel: 2.2 (feePayer) + 2.3 (keyManager)
     |
     v
Sequential: 2.4 (compose) - needs both 2.2 and 2.3
     |
     v
Parallel: 2.5 (feePayer tests) + 2.6 (keyManager tests)
     |
     v
Sequential: 2.7 (compose tests)
```

**Parallel Spawn Example:**

```
// In a single message, spawn both agents:
Task 1: subagent_type="general-purpose", prompt="Implement Handler.feePayer()..."
Task 2: subagent_type="general-purpose", prompt="Implement Handler.keyManager()..."
```

### Phase 3 & 4: Sequential

These phases have file dependencies that make parallelization risky. Run sequentially.

---

## Quality Gates

Before moving to the next phase, verify:

### After Phase 0
```bash
pnpm check:types  # Must pass
pnpm test         # Must pass
grep -r "RadiusSigner" typescript/src/  # Should find nothing
grep -r "ClefSigner" typescript/src/    # Should find nothing
```

### After Phase 1
```bash
pnpm check:types  # Must pass
ls typescript/src/server/  # Should show expected files
```

### After Phase 2
```bash
pnpm test         # All tests pass including new ones
pnpm check:types  # Must pass
```

### After Phase 3
```bash
# Test the import works
node -e "import('@radiustechsystems/sdk/server').then(m => console.log(Object.keys(m)))"
pnpm test         # Full suite
```

---

## Handling Common Issues

### Issue: Type Errors After Changes

```
Resolution:
1. Run `pnpm check:types` to see full errors
2. Spawn Explore agent to understand the type issue
3. Spawn general-purpose agent to fix specific files
```

### Issue: Test Failures

```
Resolution:
1. Run `pnpm test` to see which tests fail
2. Check if failure is in new code or existing code
3. If existing code: likely a breaking change, review Phase 0 changes
4. If new code: spawn agent to fix the specific test
```

### Issue: Dependency Missing

```
Resolution:
1. Log in Blockers section
2. Spawn Bash agent: `cd /Users/fox/Getting\ Started/radius-sdk/typescript && pnpm add [package]`
3. Update PLAN to mark blocker resolved
```

### Issue: Agent Returns Incomplete Work

```
Resolution:
1. Note incompleteness in Agent Assignment Log
2. Either:
   a. Resume the same agent with clarification
   b. Spawn new agent with more specific instructions
```

---

## Communication Protocol

### Reporting to User

After each phase completes, report:

```
## Phase [N] Complete

### Tasks Completed
- [x] Task descriptions...

### Tests
- All passing / X failures

### Next Phase
Ready to begin Phase [N+1]

### Any Issues?
[List blockers or concerns]
```

### When Blocked

If you cannot proceed:

```
## Blocked: [Brief description]

### Details
[What went wrong]

### Options
1. [Option A]
2. [Option B]

### Recommendation
[Your suggestion]

Awaiting user decision.
```

---

## Reference Locations

| Resource | Path |
|----------|------|
| PLAN Document | `/Users/fox/Getting Started/radius-sdk/PLAN-SERVER-HANDLERS.md` |
| Tempo Reference | `/tmp/tempo-ts/src/server/` |
| Radius SDK | `/Users/fox/Getting Started/radius-sdk/typescript/` |
| viem Reference | `/tmp/viem/src/` |

---

## Quick Start

1. **Read the PLAN document first**
   ```
   Read: /Users/fox/Getting Started/radius-sdk/PLAN-SERVER-HANDLERS.md
   ```

2. **Verify you're on the correct branch**
   ```
   Bash: cd /Users/fox/Getting\ Started/radius-sdk && git branch
   # Should show: feature/v2-viem-migration
   ```

3. **Begin Phase 0**
   - Spawn a general-purpose agent for tasks 0.1-0.8
   - Update PLAN as tasks complete
   - Run quality gate checks

4. **Continue through phases**
   - Follow dependency order
   - Parallelize where noted
   - Update PLAN continuously

---

## Git Commit Guidelines

**IMPORTANT:** Do NOT include Claude attribution in commits. Commit messages should be factual descriptions only.

Suggested commit points:
- After Phase 0: `refactor: remove RadiusSigner, use viem LocalAccount directly`
- After Phase 1: `feat(server): add server module infrastructure`
- After Phase 2: `feat(server): implement Handler.feePayer and Handler.keyManager`
- After Phase 3: `feat(server): add /server subpath export`
- After Phase 4: `docs: add server handler documentation`

---

*End of Handoff Document*
