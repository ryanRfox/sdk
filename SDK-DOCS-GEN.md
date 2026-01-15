# SDK Documentation Automation Implementation

> **Date:** 15 January 2026
> **Branch:** `feat/v2-docs`
> **Status:** Complete

---

## Problem Statement

The Radius SDK V2 had a broken documentation system:

- **1800 lines of hardcoded MDX templates** in `scripts/generate-docs.ts`
- Templates referenced **removed code** (RadiusSigner, ClefSigner)
- API signatures were **out of sync** with actual implementation
- No automated way to detect documentation drift

## Solution Implemented

Replaced the manual template system with **automated documentation generation**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW DOCUMENTATION PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Source Files          TypeDoc              docs/api/            │
│  (JSDoc comments)  ───────────────────►  (auto-generated)       │
│                                                                  │
│  scripts/              tsx                  docs/guides/         │
│  generate-guides.ts ──────────────────►  (thin templates)       │
│                                                                  │
│  scripts/              tsx                  validation           │
│  validate-docs.ts  ──────────────────►  (catches drift)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files Created

### 1. `typescript/typedoc.json`

TypeDoc configuration for generating API reference documentation from JSDoc comments.

**Entry points:**
- `src/index.ts` - Main SDK exports
- `src/server/index.ts` - Server handlers (Handler, Kv)
- `src/react/index.ts` - React hooks
- `src/events/index.ts` - Event utilities
- `src/wagmi/index.ts` - wagmi integration
- `src/chains/index.ts` - Chain definitions

**Output:** Markdown files in `docs/api/`

### 2. `typescript/scripts/generate-guides.ts`

Generates thin guide templates that provide narrative documentation while linking to the auto-generated API reference.

**Guides generated:**
- `quick-start.mdx` - Getting started guide
- `react.mdx` - React integration
- `server.mdx` - Server handlers guide
- `events.mdx` - Events and subscriptions
- `wagmi.mdx` - wagmi integration
- `migration-v1-v2.mdx` - V1 to V2 migration guide

### 3. `typescript/scripts/validate-docs.ts`

Validation script that checks for common documentation issues:

- References to removed code (RadiusSigner, ClefSigner, createClefSigner)
- References to old package name (@aspect-build/radius-sdk)
- Outdated API signatures (chainId parameter)
- Missing required files

**Smart exceptions:** Migration guides are excluded from stale pattern checks since they intentionally reference old APIs.

### 4. `typescript/docs/GENERATION.md`

Process documentation explaining how the new system works.

---

## Files Modified

### `typescript/package.json`

Added new scripts:

```json
{
  "scripts": {
    "generate:api": "typedoc",
    "generate:guides": "npx tsx scripts/generate-guides.ts",
    "generate:docs": "pnpm generate:api && pnpm generate:guides",
    "docs:check": "npx tsx scripts/validate-docs.ts"
  }
}
```

Added dev dependencies:
- `typedoc@0.28.16`
- `typedoc-plugin-markdown@4.9.0`

---

## Files Archived

### `typescript/archive/generate-docs-v1.ts`

The original 1800-line template-based generator was archived (not deleted) for reference.

---

## Generated Output Structure

```
typescript/docs/
├── api/                           # TypeDoc output (auto-generated)
│   ├── README.md                  # Package overview
│   ├── index.md                   # Main exports (~60k tokens)
│   ├── chains.md                  # Chain definitions
│   ├── events.md                  # Event utilities
│   ├── react.md                   # React hooks
│   ├── wagmi.md                   # wagmi integration
│   └── server/                    # Server module
│       ├── README.md
│       └── namespaces/
│           ├── Handler.md         # Handler.from, keyManager, compose
│           └── Kv/
│               ├── README.md      # Kv.memory, Kv.cloudflare
│               └── namespaces/
│                   └── cloudflare.md
├── guides/                        # Thin templates (manually maintained)
│   ├── quick-start.mdx
│   ├── react.mdx
│   ├── server.mdx
│   ├── events.mdx
│   ├── wagmi.mdx
│   └── migration-v1-v2.mdx
└── GENERATION.md                  # Process documentation
```

---

## Usage

### Generate All Documentation

```bash
cd typescript
pnpm generate:docs
```

### Generate Only API Reference

```bash
pnpm generate:api
```

### Generate Only Guides

```bash
pnpm generate:guides
```

### Validate Documentation

```bash
pnpm docs:check
```

---

## CI Integration

Add to CI workflow to catch documentation drift:

```yaml
# .github/workflows/docs.yml
name: Documentation
on: [push, pull_request]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm generate:docs
      - name: Check for changes
        run: |
          git diff --exit-code docs/ || {
            echo "Documentation out of sync. Run 'pnpm generate:docs' and commit."
            exit 1
          }
```

---

## Verification Results

```bash
pnpm check:types   # ✓ Passes
pnpm test          # ✓ 215 tests pass (27 skipped)
pnpm generate:docs # ✓ Generates 16 doc files
pnpm docs:check    # ✓ All checks pass
```

---

## Benefits Over Previous System

| Aspect | Old System | New System |
|--------|------------|------------|
| API accuracy | Manual sync required | Auto-extracted from JSDoc |
| Maintenance | 1800 lines of templates | Thin guides + auto-generation |
| Drift detection | None | Validation script |
| CI integration | None | Ready for CI |
| Update process | Edit templates manually | Update JSDoc, regenerate |

---

## How to Add Documentation

### For New Exports

Add JSDoc comments to your source file:

```typescript
/**
 * Brief description of the function.
 *
 * @param config - Description of the parameter
 * @returns Description of the return value
 *
 * @example
 * ```typescript
 * const result = myFunction({ key: 'value' });
 * ```
 */
export function myFunction(config: Config): Result {
  // implementation
}
```

Then regenerate: `pnpm generate:docs`

### For New Guides

1. Edit `scripts/generate-guides.ts`
2. Add a new guide constant
3. Add it to the `guides` array
4. Run `pnpm generate:guides`

---

## External Docs Site Integration

The external docs site should ingest:
- `docs/api/` - Auto-generated API reference (Markdown)
- `docs/guides/` - Narrative guides (MDX)

**Format:** Standard Markdown with TypeDoc conventions. Compatible with most documentation platforms (Docusaurus, VitePress, Nextra, etc.).

---

*Implementation complete. Documentation will now stay in sync with the actual API.*
