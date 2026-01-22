# Radius SDK V2 Audit

## Scope

**Audit target:** `typescript/` directory only

**Ignore:** `go/`, `python/`, `rust/`, `contracts/` - these are separate SDKs not part of this audit.

## Audit Mission

Audit the TypeScript SDK for Radius V2. This SDK extends viem for use with the Radius Network.

**Target audience:** Developers building smart contracts for deployment on Radius Network.

**Goal:** Prepare for V2 SDK release with confidence that code and repo are safe, well-organized, and following best practices.

## Audit Focus Areas

1. **Security** - Private key handling, transaction signing, signature verification, wallet interactions
2. **Type safety** - Proper use of viem's type system, generic constraints, TypeScript best practices
3. **API design** - Consistency with viem conventions, ergonomic developer experience
4. **Error handling** - Proper error propagation, custom error types, edge cases
5. **Gas considerations** - Inefficiencies in contract interactions or encoding
6. **Tests** - Each test must be valid, not take shortcuts, cheat, or auto-pass; they must test appropriately

## Audit Process

1. **Map codebase structure** - Understand the module organization in `typescript/src/`
2. **Audit each module systematically** - Review actions, chains, decorators, errors, events, transport
3. **Classify issues by severity:**
   - **Critical** - Security vulnerabilities, data loss risks
   - **High** - Significant bugs, type safety holes
   - **Medium** - API inconsistencies, missing edge cases
   - **Low** - Code style, minor improvements
4. **Propose fixes** - Concrete code changes for each issue

## Reference Materials

### Local viem Repository

The upstream viem source is available locally for pattern reference:

- `/tmp/viem/` - viem source code
- `/tmp/viem-ref/` - viem reference copy

Use these to verify SDK patterns match viem conventions:
- Wallet actions: `/tmp/viem/src/actions/wallet/`
- Public actions: `/tmp/viem/src/actions/public/`
- Error patterns: `/tmp/viem/src/errors/`
- Type patterns: `/tmp/viem/src/types/`
- Chain definitions: `/tmp/viem/src/chains/`

### SDK Entry Points

- Main export: `typescript/src/index.ts`
- Chain config: `typescript/src/chains/`
- Wallet decorator: `typescript/src/decorators/radius.ts`
- Batch transactions: `typescript/src/actions/sendTransactionBatch.ts`
- Error types: `typescript/src/errors/`

## Key V2 Architecture

The SDK uses viem's decorator pattern:

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';

// Public client for reads
const publicClient = createPublicClient({
  chain: radiusTestnet,
  transport: http(),
});

// Wallet client with Radius extensions for writes
const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey),
  chain: radiusTestnet,
  transport: http(),
}).extend(radiusWalletActions());

// Radius-specific: batch transactions
const hashes = await walletClient.sendTransactionBatch({
  transactions: [{ to, value }, { to, value }],
});
```

## Commands

```bash
cd typescript

# Install dependencies
pnpm install

# Run unit tests (no env vars needed)
pnpm test

# Run integration tests (requires PRIVATE_KEY)
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 pnpm test

# Type check
pnpm typecheck

# Build
pnpm build

# Generate API docs
pnpm generate:api
```

## Audit Output

Document findings in `_audit/` directory:
- `_audit/FINDINGS.md` - All issues with severity and proposed fixes
- `_audit/MODULE-REVIEWS.md` - Per-module detailed review notes
- `_audit/RECOMMENDATIONS.md` - Strategic recommendations for V2 release
