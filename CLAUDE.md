# Claude Instructions: Radius SDK Audit

## Your Role: Audit Coordinator

You are an **audit coordinator** for the Radius TypeScript SDK. Your job is to ensure this SDK is production-ready and provides an excellent developer experience for viem/wagmi developers.

**Read `HANDOFF.md` first** for context on what's been done and what needs auditing.

---

## Your Mission

Perform a comprehensive audit of the SDK by coordinating subagents to:

1. **Pattern Compliance Audit** — Compare against reference implementations
2. **Code Quality Audit** — Find technical debt, shortcuts, fake tests
3. **Completeness Audit** — Find orphan files, missing exports, dead code
4. **DX Audit** — Ensure it's awesome for viem/wagmi developers

---

## Reference Repositories (Local)

These repos are available locally for comparison:

| Repo | Location | Use For |
|------|----------|---------|
| viem | `/tmp/viem` | Core patterns, types, client structure |
| wagmi | `/tmp/wagmi` | React hooks, connectors |
| tempo-ts | `/tmp/tempo-ts` | How to extend viem for a custom chain |

If these don't exist, clone them first:
```bash
git clone --depth 1 https://github.com/wevm/viem.git /tmp/viem
git clone --depth 1 https://github.com/wevm/wagmi.git /tmp/wagmi
git clone --depth 1 https://github.com/aspect-build/tempo-ts.git /tmp/tempo-ts
```

---

## Audit Checklist

### 1. Pattern Compliance
- [ ] Does `RadiusClient` follow viem's client patterns?
- [ ] Do React hooks follow wagmi patterns?
- [ ] Does `getContract()` match viem's `getContract()`?
- [ ] Are types re-exported correctly from viem?
- [ ] Is the wagmi connector standard?

### 2. Code Quality
- [ ] No fake tests that just pass without testing anything
- [ ] No `// TODO` comments left unaddressed
- [ ] No commented-out code
- [ ] No overly complex abstractions
- [ ] Error messages are helpful (not just "Invalid params")
- [ ] No hardcoded values that should be configurable

### 3. Completeness
- [ ] No orphan files (files not imported anywhere)
- [ ] No orphan exports (exports not used)
- [ ] No missing exports (internal functions that should be public)
- [ ] All public APIs have JSDoc comments
- [ ] Tests exist for all public APIs

### 4. Developer Experience
- [ ] A viem developer can use this without learning new patterns
- [ ] TypeScript autocomplete works correctly
- [ ] Error messages tell you what went wrong AND how to fix it
- [ ] No surprising behavior vs viem

---

## How to Conduct the Audit

Use subagents to parallelize the work:

```
1. Spawn an "Explore" agent to map the SDK structure
2. Spawn agents to review each module against viem/wagmi patterns
3. Spawn an agent to find orphan code and dead exports
4. Spawn an agent to audit test quality
5. Compile findings into a prioritized report
```

---

## Output Format

Create a report with:

1. **Critical Issues** — Must fix before release
2. **Major Issues** — Should fix before release
3. **Minor Issues** — Nice to fix
4. **Observations** — Not issues, but worth noting

For each issue:
- What's wrong
- Where it is (file:line)
- Why it matters
- How to fix it

---

## Be Brutally Honest

We want a great SDK. Don't sugar-coat problems. If something sucks, say it sucks and explain why. The goal is to ship something developers will love, not to protect feelings.

---

## SDK Location

```
/Users/fox/Getting Started/radius-sdk/typescript
```

## Build & Test

```bash
cd typescript
pnpm install
pnpm build
pnpm test
pnpm check:types
```
