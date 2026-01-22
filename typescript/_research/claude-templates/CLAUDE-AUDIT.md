# Radius SDK - Audit Session Template

Copy this file to `/Users/[username]/.claude/CLAUDE.md` before starting an audit session.

---

## Session Type: Security & Code Quality Audit

You are conducting a comprehensive audit of the Radius SDK TypeScript codebase. Your goal is to identify issues, document them with clear severity and fix recommendations, and produce actionable findings.

## Codebase Context

**Repository:** Radius SDK (V2 Architecture)
**Location:** `typescript/` directory
**Purpose:** TypeScript SDK for Radius Protocol (passkey-based transaction signing)

### V2 Module Structure

```
typescript/src/
├── chains/       # Chain configurations (Arbitrum, etc.)
├── client/       # createRadiusWalletClient (main entry point)
├── contracts/    # getContract helper, ABI definitions
├── errors/       # Custom error types
├── events/       # SignatureReady event watching with caching
├── react/        # React Query hooks (useWaitForSignature, etc.)
├── transport/    # radiusTransport (JSON-RPC wrapper)
├── wagmi/        # Wagmi connector integration
├── webauthn/     # Passkey credential management
└── index.ts      # Public API exports
```

### Key V2 API Patterns

- **Client creation:** `createRadiusWalletClient({ transport, chain, ... })`
- **Transport:** `radiusTransport({ url, apiKey })`
- **Contract interaction:** `client.readContract()` / `client.writeContract()` (viem-style)
- **Event watching:** `watchSignatureReady(client, { txHash, onReady })`
- **React hooks:** `useRadiusClient()`, `useWaitForSignature()`, `useSignatureStatus()`

## Audit Focus Areas

### 1. Security Issues
- Credential handling and storage
- Private key/secret exposure risks
- Input validation and sanitization
- XSS, injection, and OWASP top 10 vulnerabilities
- Race conditions in async operations

### 2. Type Safety
- TypeScript strict mode compliance
- Generic type parameter correctness
- Union type exhaustiveness
- Proper error typing

### 3. API Correctness
- Method signatures match documentation
- Return types are accurate
- Error handling is consistent
- Breaking change risks identified

### 4. Code Quality
- Dead code removal
- Consistent error naming (`error` not `err`)
- Proper async/await usage
- Memory leak prevention (cleanup functions, subscriptions)

### 5. Documentation Validation (CRITICAL)
- All code examples in `docs/guides/` must use V2 API
- No references to removed APIs (e.g., `typedContract`, old client patterns)
- Import paths must be accurate
- Examples must be runnable

### 6. Test Coverage
- Critical paths have tests
- Edge cases covered
- Mock data is realistic

## Commands Reference

```bash
# Type checking
pnpm check:types

# Linting (Biome)
pnpm lint

# Run tests
pnpm test

# Build
pnpm build

# Validate documentation
pnpm docs:check

# Generate documentation
pnpm generate:docs
```

## Severity Classification

**Use ONLY these severity levels. No ambiguous statuses like "FOR DISCUSSION".**

| Severity | Criteria | Example |
|----------|----------|---------|
| **CRITICAL** | Security vulnerability, data loss risk, or production blocker | Credentials in logs, unvalidated user input |
| **HIGH** | Functional bug affecting users, type errors in build | Wrong return type, missing error handling |
| **MEDIUM** | Code quality issue, inconsistent patterns, documentation errors | Dead code, naming inconsistency, wrong examples |
| **LOW** | Minor improvements, style preferences | Comment typos, optional refactoring |

Every finding MUST have:
1. Clear severity (CRITICAL/HIGH/MEDIUM/LOW)
2. Specific file and line number
3. Description of the issue
4. Recommended fix
5. Code snippet showing the problem

## Output Format

Create audit findings in `typescript/_research/audit-findings-YYYY-MM-DD.md`:

```markdown
# Radius SDK Audit Findings - [DATE]

## Summary
- Critical: X
- High: X
- Medium: X
- Low: X

## Critical Issues

### C-1: [Title]
**File:** `path/to/file.ts:123`
**Issue:** [Description]
**Risk:** [Impact if not fixed]
**Fix:** [Specific recommendation]
```

## Branch Hygiene Rules

1. **Audit artifacts stay on `research/findings` branch** - never merge to main
2. Create audit branch: `git checkout -b research/findings` (if doesn't exist)
3. All audit documents go in `typescript/_research/`
4. After fixes are complete and merged to main, audit docs remain on research branch as historical record

## Pre-Audit Checklist

Before starting, verify:

- [ ] Working directory is clean (`git status`)
- [ ] On correct branch (`research/findings` for audit)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Build passes (`pnpm build`)
- [ ] Type check passes (`pnpm check:types`)
- [ ] Tests pass (`pnpm test`)

## Post-Audit Checklist

- [ ] All findings have actionable severity (no "FOR DISCUSSION")
- [ ] Documentation examples validated against V2 API
- [ ] Code style issues noted (naming conventions, formatting)
- [ ] Audit document committed to `research/findings` branch
- [ ] Summary provided with fix priority recommendations
