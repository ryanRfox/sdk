# HANDOFF: Alpha Release Preparation

> **Branch:** `alpha-v2`
> **Goal:** Create a clean, release-ready alpha branch for V2 SDK
> **Package:** `@radiustechsystems/sdk@2.0.0-alpha.1`

---

## Context

The V2 SDK development is complete on `feat/v2-docs`. The codebase works but is cluttered with:
- Planning documents (PLAN-*.md, HANDOFF-*.md)
- Review reports (REVIEW-REPORT*.md)
- Implementation notes (SDK-DOCS-GEN.md, TEMPO-FEE-PAYER.md)
- Archived code (typescript/archive/)
- Development instructions (.claude/, CLAUDE.md files)

**Your job:** Create a clean `alpha-v2` branch that looks like a production SDK repo.

---

## Phase 1: Branch Setup & Cleanup

### 1.1 Create the alpha-v2 branch

```bash
git checkout feat/v2-docs
git checkout -b alpha-v2
```

### 1.2 Remove development/planning files

**Root directory - DELETE these:**
```
HANDOFF-*.md          # All handoff documents
REVIEW-REPORT*.md     # All review reports
PLAN-*.md             # All planning documents
TEMPO-FEE-PAYER.md    # Internal analysis
SDK-DOCS-GEN.md       # Implementation notes
cleanup.bat           # Temporary script
cleanup.sh            # Temporary script
CLAUDE.md             # Development instructions
.claude/              # Claude-specific directory
```

**TypeScript directory - DELETE these:**
```
typescript/CLAUDE.md           # Development instructions
typescript/.claude/            # Claude-specific directory
typescript/archive/            # Archived old code
```

### 1.3 Verification after cleanup

Root should only contain:
```
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
codecov.yml
.gitignore
.github/
contracts/
go/
python/
rust/
typescript/
```

TypeScript should only contain:
```
README.md
CHANGELOG.md
CONTRIBUTING.md
package.json
pnpm-lock.yaml
tsconfig*.json
typedoc.json
biome.json
vitest.config.ts
src/
docs/
test/
scripts/
```

---

## Phase 2: Version & Changelog

### 2.1 Bump version to alpha.1

```bash
cd typescript
# Update package.json version from 2.0.0-alpha.0 to 2.0.0-alpha.1
```

### 2.2 Update CHANGELOG.md

Create a proper V2 changelog entry:

```markdown
# Changelog

## [2.0.0-alpha.1] - 2026-01-15

### Breaking Changes
- Replaced `RadiusSigner` with viem's `LocalAccount`
- Removed `ClefSigner` and `createClefSigner`
- Removed `chainId` parameter from `createPrivateKeySigner`
- Package renamed from `@aspect-build/radius-sdk` to `@radiustechsystems/sdk`

### Added
- Full viem integration for EVM compatibility
- React hooks: `useRadiusBalance`, `useRadiusSend`, ERC-20 hooks
- Server handlers: `Handler.keyManager()`, `Handler.compose()`
- KV stores: `Kv.memory()`, `Kv.cloudflare()`
- wagmi connector: `privateKeyConnector()`
- Events module: `watchTransfer`, `watchApproval`, `getLogs`, etc.
- Subpath exports: `/chains`, `/react`, `/events`, `/server`, `/wagmi`
- Auto-generated API documentation with TypeDoc

### Changed
- Client methods now use viem types throughout
- Error hierarchy improved with structured errors
- Documentation auto-generated from JSDoc

### Removed
- `RadiusSigner` interface (use `LocalAccount` from viem)
- `ClefSigner` class
- `createClefSigner` function
- `feePayer` handler (not possible on standard EVM - see docs)
```

---

## Phase 3: Build Verification

### 3.1 Clean build

```bash
cd typescript
pnpm clean
pnpm build
```

### 3.2 Verify build outputs

```bash
# Should have these directories after build:
ls -la src/_esm/   # ESM output
ls -la src/_cjs/   # CJS output
ls -la src/_types/ # Type declarations
```

### 3.3 Run all checks

```bash
pnpm check:types   # TypeScript compilation
pnpm test          # All tests pass
pnpm docs:check    # Documentation valid
```

### 3.4 Verify package contents

```bash
npm pack --dry-run
# Should show only: src/_cjs, src/_esm, src/_types
# Should NOT include: src/*.ts, test/, docs/, scripts/
```

---

## Phase 4: Local Testing Setup

### 4.1 Create link for local development

```bash
cd typescript
pnpm link --global
```

### 4.2 Document linking for consumers

Add to README or create DEVELOPMENT.md:

```markdown
## Local Development

To use the SDK locally before npm publish:

### Link the SDK
```bash
cd path/to/radius-sdk/typescript
pnpm build
pnpm link --global
```

### Use in your project
```bash
cd your-project
pnpm link --global @radiustechsystems/sdk
```

### Unlink when done
```bash
pnpm unlink --global @radiustechsystems/sdk
```
```

---

## Phase 5: Examples (Optional but Recommended)

### 5.1 Create examples directory

```
typescript/examples/
├── basic-transfer/
│   ├── package.json
│   └── index.ts
├── react-app/
│   └── (create-react-app or vite template)
└── server-handler/
    ├── package.json
    └── index.ts
```

### 5.2 Basic transfer example

```typescript
// examples/basic-transfer/index.ts
import { createRadiusClient, createPrivateKeySigner } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

async function main() {
  const client = createRadiusClient({ chain: radiusTestnet });
  const account = createPrivateKeySigner(process.env.PRIVATE_KEY as `0x${string}`);

  console.log('Address:', account.address);
  console.log('Balance:', await client.getBalance(account.address));
}

main().catch(console.error);
```

---

## Phase 6: CI/CD (If not exists)

### 6.1 GitHub Actions workflow

Create `.github/workflows/typescript.yml`:

```yaml
name: TypeScript SDK

on:
  push:
    paths: ['typescript/**']
  pull_request:
    paths: ['typescript/**']

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: typescript
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
          cache-dependency-path: typescript/pnpm-lock.yaml
      - run: pnpm install
      - run: pnpm check:types
      - run: pnpm test
      - run: pnpm build
```

---

## Phase 7: Final Commit

### 7.1 Commit the cleanup

```bash
git add -A
git commit -m "chore: prepare alpha-v2 release branch

- Remove development/planning documents
- Update version to 2.0.0-alpha.1
- Update changelog with V2 changes
- Clean repository structure for release"
```

### 7.2 DO NOT push to main

This branch is for local testing. When ready for release:
1. Create PR from `alpha-v2` to `main`
2. Review all changes
3. Merge and tag release

---

## Verification Checklist

Before declaring alpha ready:

- [ ] All HANDOFF/PLAN/REVIEW files removed
- [ ] No .claude directories
- [ ] No archive directories
- [ ] Version is 2.0.0-alpha.1
- [ ] CHANGELOG.md updated
- [ ] `pnpm build` succeeds
- [ ] `pnpm check:types` passes
- [ ] `pnpm test` passes (215 tests)
- [ ] `pnpm docs:check` passes
- [ ] `npm pack --dry-run` shows only build outputs
- [ ] `pnpm link --global` works
- [ ] README points to docs.radiustech.xyz

---

## For the Testing Claude

After this branch is ready, a separate Claude session will:
1. Link to this SDK locally
2. Build a test application against it
3. Verify all exports work
4. Test React hooks
5. Test server handlers
6. Report any issues

---

## Files Reference

### Keep (production files)
```
README.md, LICENSE, CONTRIBUTING.md, CODE_OF_CONDUCT.md
.github/, .gitignore, codecov.yml
typescript/README.md, CHANGELOG.md, CONTRIBUTING.md
typescript/package.json, tsconfig*.json, typedoc.json
typescript/src/, test/, docs/, scripts/
```

### Delete (development files)
```
HANDOFF-*.md, REVIEW-REPORT*.md, PLAN-*.md
TEMPO-FEE-PAYER.md, SDK-DOCS-GEN.md
cleanup.bat, cleanup.sh
CLAUDE.md, .claude/
typescript/CLAUDE.md, typescript/.claude/, typescript/archive/
```

---

*This handoff prepares the SDK for local alpha testing. Do not publish to npm until full QA is complete.*
