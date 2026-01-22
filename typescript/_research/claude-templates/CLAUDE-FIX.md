# Radius SDK - Fix Session Template

Copy this file to `/Users/[username]/.claude/CLAUDE.md` before starting a fix session.

---

## Session Type: Implementing Audit Fixes

You are implementing fixes for issues identified in a Radius SDK audit. Follow the structured process below to ensure all fixes are properly verified and documented.

## Codebase Context

**Repository:** Radius SDK (V2 Architecture)
**Location:** `typescript/` directory
**Purpose:** TypeScript SDK for Radius Protocol (passkey-based transaction signing)

### V2 Module Structure (Current)

```
typescript/src/
├── chains/       # Chain configurations (arbitrum.ts exports arbitrum chain)
├── client/       # createRadiusWalletClient - main SDK entry point
│   ├── createRadiusWalletClient.ts
│   ├── decorators.ts    # Client action decorators
│   └── types.ts         # RadiusWalletClient type definitions
├── contracts/    # Contract interaction utilities
│   ├── getContract.ts   # Get typed contract instance from client
│   └── abi/             # ABI definitions (EntryPoint, SessionKey, etc.)
├── errors/       # Custom error types (RadiusError, SignatureTimeoutError, etc.)
├── events/       # SignatureReady event watching
│   ├── watchSignatureReady.ts  # Main event watcher
│   ├── eventCache.ts           # Caching layer for events
│   └── types.ts
├── react/        # React Query integration
│   ├── RadiusProvider.tsx
│   ├── useRadiusClient.ts
│   ├── useWaitForSignature.ts
│   ├── useSignatureStatus.ts
│   └── context.ts
├── transport/    # Custom viem transport
│   └── radiusTransport.ts      # JSON-RPC wrapper with Radius extensions
├── wagmi/        # Wagmi connector
│   └── radiusConnector.ts
├── webauthn/     # Passkey credential management
│   ├── createCredential.ts
│   ├── getCredential.ts
│   └── types.ts
└── index.ts      # Public API exports
```

### V2 API Patterns (Use These)

```typescript
// Client creation
import { createRadiusWalletClient, radiusTransport, arbitrum } from '@aspect-build/radius-sdk'

const client = createRadiusWalletClient({
  transport: radiusTransport({ url: RADIUS_RPC_URL }),
  chain: arbitrum,
})

// Contract interaction (viem-style)
const balance = await client.readContract({
  address: contractAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [address],
})

const hash = await client.writeContract({
  address: contractAddress,
  abi: erc20Abi,
  functionName: 'transfer',
  args: [recipient, amount],
})

// Event watching
import { watchSignatureReady } from '@aspect-build/radius-sdk'

const unwatch = watchSignatureReady(client, {
  txHash: hash,
  onReady: (signature) => console.log('Ready:', signature),
})

// React hooks
import { useRadiusClient, useWaitForSignature } from '@aspect-build/radius-sdk/react'

const client = useRadiusClient()
const { data, isLoading } = useWaitForSignature({ txHash })
```

### Removed/Deprecated Patterns (Do NOT Use)

- `typedContract()` - Removed, use `client.readContract()`/`client.writeContract()`
- Direct transport bypass for reads - Always use client methods
- Old `createClient()` pattern - Use `createRadiusWalletClient()`

## Commands Reference

```bash
# Type checking (CORRECT command)
pnpm check:types

# Linting with auto-fix
pnpm lint:fix

# Formatting (Biome)
pnpm format

# Full check with fixes
pnpm check

# Run tests
pnpm test

# Build
pnpm build

# Generate documentation
pnpm generate:docs

# Validate documentation
pnpm docs:check
```

## Fix Process

### Phase 1: Setup

1. **Read the audit findings document**
   ```bash
   cat typescript/_research/audit-findings-YYYY-MM-DD.md
   ```

2. **Create fix branch from main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/audit-findings-YYYY-MM-DD
   ```

3. **Verify clean starting state**
   ```bash
   pnpm install
   pnpm build
   pnpm check:types
   pnpm test
   ```

### Phase 2: Implement Fixes

**Order: CRITICAL → HIGH → MEDIUM → LOW**

For each finding:

1. Read the issue description and recommended fix
2. Locate the file and line number
3. Implement the fix
4. Run type check: `pnpm check:types`
5. Run tests: `pnpm test`
6. Document what was changed

### Phase 3: Code Style & Formatting

After all functional fixes:

1. **Fix naming conventions**
   - Use `error` not `err` for error variables
   - Use descriptive variable names

2. **Apply Biome formatting**
   ```bash
   pnpm check
   ```

3. **Verify no lint errors**
   ```bash
   pnpm lint
   ```

### Phase 4: Documentation

1. **Regenerate API docs**
   ```bash
   pnpm generate:docs
   ```

2. **Validate documentation**
   ```bash
   pnpm docs:check
   ```

3. **Manual review** - Check that guides use V2 API patterns

### Phase 5: Verification Checklist

Run ALL of these before considering fixes complete:

- [ ] `pnpm check:types` - No type errors
- [ ] `pnpm lint` - No lint errors
- [ ] `pnpm test` - All tests pass
- [ ] `pnpm build` - Build succeeds
- [ ] `pnpm docs:check` - Documentation valid

### Phase 6: Integration Test (with Anvil)

If changes affect transaction signing or contract interaction:

```bash
# Start local Anvil node (separate terminal)
anvil

# Run integration tests against Anvil
# Use Anvil's default test private key for testing:
# 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Phase 7: Version & Commit

1. **Bump version if needed** (for breaking changes or significant fixes)
   ```bash
   # Edit package.json version field
   # Current: alpha versions (e.g., 0.1.0-alpha.X)
   ```

2. **Create commit**
   ```bash
   git add -A
   git commit -m "fix: [description of fixes]"
   ```

3. **Create PR to main**
   ```bash
   git push -u origin fix/audit-findings-YYYY-MM-DD
   gh pr create --title "fix: audit findings YYYY-MM-DD" --body "..."
   ```

### Phase 8: Post-Merge Cleanup

After PR is merged to main:

1. **Update audit document** on `research/findings` branch with fix status
2. **Do NOT merge** audit artifacts to main branch
3. **Delete** fix branch after merge

## Error Naming Convention

```typescript
// WRONG
} catch (err) {
  console.error(err)
}

// CORRECT
} catch (error) {
  console.error(error)
}

// CORRECT (when you need the error typed)
} catch (error) {
  if (error instanceof RadiusError) {
    // handle
  }
}
```

## Fix Documentation Format

Track your fixes in a session log:

```markdown
## Fix Session Log - [DATE]

### C-1: [Title]
- **Status:** Fixed
- **Files changed:** `path/to/file.ts`
- **Changes:** [Brief description]
- **Verification:** Types pass, tests pass

### H-1: [Title]
- **Status:** Fixed
- **Files changed:** `path/to/file.ts`, `path/to/other.ts`
- **Changes:** [Brief description]
- **Verification:** Types pass, tests pass
```

## Common Pitfalls

1. **Don't forget Biome formatting** - Run `pnpm check` before committing
2. **Don't skip docs regeneration** - API changes need `pnpm generate:docs`
3. **Don't merge audit docs to main** - Keep on `research/findings` branch
4. **Don't use old patterns** - Always use V2 API (createRadiusWalletClient, etc.)
5. **Don't forget version bump** - Breaking changes need version increment
