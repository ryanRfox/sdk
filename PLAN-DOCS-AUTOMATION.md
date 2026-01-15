# PLAN: Documentation Generation Automation

> **Status:** PROPOSAL
> **Created:** 15 January 2026
> **Problem:** Manual templates drift from actual SDK API

---

## Current State (The Problem)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CURRENT PROCESS (BROKEN)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SDK Source Code         Manual Templates           Generated Docs      │
│  ────────────────        ────────────────           ──────────────      │
│                                                                         │
│  src/client/client.ts    generate-docs.ts           docs/*.mdx          │
│  src/auth/*.ts      ──?──► (1800 lines of   ──────► (stale MDX)        │
│  src/server/*.ts          hardcoded MDX)                                │
│  src/react/*.ts                                                         │
│                          ↑                                              │
│                          │                                              │
│                     MANUAL SYNC                                         │
│                     (forgotten)                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why it breaks:**
1. Developer changes `src/auth/privatekey/signer.ts`
2. Nobody updates `scripts/generate-docs.ts`
3. `pnpm generate:docs` produces stale output
4. Docs site ingests wrong API docs
5. Devs cry

---

## Proposed Solution: Hybrid Extraction + Templates

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PROPOSED PROCESS (AUTOMATED)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SDK Source Code         Extraction Script          Generated Docs      │
│  ────────────────        ────────────────           ──────────────      │
│                                                                         │
│  src/**/*.ts             generate-docs.ts           docs/*.mdx          │
│      │                        │                          ↑              │
│      │                        │                          │              │
│      ▼                        ▼                          │              │
│  ┌────────┐            ┌─────────────┐            ┌─────────────┐      │
│  │ JSDoc  │───────────►│ TypeScript  │───────────►│   MDX       │      │
│  │Comments│            │ Compiler    │            │  Templates  │      │
│  │        │            │ API Extract │            │  (thin)     │      │
│  └────────┘            └─────────────┘            └─────────────┘      │
│                              │                                          │
│                              ▼                                          │
│                        ┌─────────────┐                                  │
│                        │ api.json    │ ◄── Single source of truth      │
│                        │ (extracted) │                                  │
│                        └─────────────┘                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Options

### Option A: TypeDoc (Recommended)

**What:** Industry-standard TypeScript documentation generator.

**How it works:**
1. Reads JSDoc comments from source
2. Parses TypeScript types
3. Generates HTML/JSON/Markdown

**Pros:**
- Zero manual sync needed
- Reads actual types from source
- Mature, well-maintained
- Supports custom themes/plugins

**Cons:**
- Output format may need transformation for your docs site
- Less control over narrative structure

**Implementation:**

```bash
# Install
pnpm add -D typedoc typedoc-plugin-markdown

# Configure (typedoc.json)
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "excludePrivate": true,
  "excludeInternal": true
}

# Generate
pnpm typedoc
```

**Effort:** 1-2 days

---

### Option B: API Extractor + Custom Transform

**What:** Microsoft's tool for API documentation and .d.ts rollup.

**How it works:**
1. Analyzes TypeScript declarations
2. Produces `api.json` with all public API surface
3. Custom script transforms JSON → MDX

**Pros:**
- Precise API surface extraction
- Used by large projects (Azure SDK, etc.)
- Catches API changes in CI

**Cons:**
- More setup complexity
- Requires custom MDX transformer

**Implementation:**

```bash
# Install
pnpm add -D @microsoft/api-extractor @microsoft/api-documenter

# Configure (api-extractor.json)
# Run extraction
pnpm api-extractor run

# Custom transform
node scripts/api-to-mdx.js
```

**Effort:** 3-5 days

---

### Option C: Hybrid (TypeDoc + Manual Guides)

**What:** Use TypeDoc for API reference, keep manual templates for guides.

**Structure:**

```
docs/
├── api/                    # Auto-generated by TypeDoc
│   ├── classes/
│   ├── interfaces/
│   ├── functions/
│   └── index.md
├── guides/                 # Manual (thin templates)
│   ├── quick-start.mdx
│   ├── migration-v1-v2.mdx
│   └── server-handlers.mdx
└── README.md
```

**Pros:**
- API docs always accurate
- Guides can have narrative structure
- Clear separation of concerns

**Cons:**
- Two systems to maintain
- Guides can still drift (but less critical)

**Effort:** 2-3 days

---

### Option D: Fix Current System (Not Recommended)

**What:** Keep manual templates but add validation.

**How:**
1. Parse source files for exports
2. Compare against template content
3. Fail CI if drift detected

**Pros:**
- Minimal change to current process
- Can implement quickly

**Cons:**
- Still requires manual updates
- Only catches problems, doesn't fix them
- Technical debt continues

**Effort:** 1 day (but ongoing maintenance cost)

---

## Recommendation: Option C (Hybrid)

**Rationale:**
1. API reference is where drift causes real problems
2. Guides benefit from human curation
3. TypeDoc is battle-tested
4. Can migrate incrementally

---

## Implementation Plan

### Phase 1: Setup TypeDoc (Day 1)

```bash
# 1. Install dependencies
pnpm add -D typedoc typedoc-plugin-markdown

# 2. Create config
cat > typedoc.json << 'EOF'
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": [
    "src/index.ts",
    "src/server/index.ts",
    "src/react/index.ts",
    "src/events/index.ts",
    "src/wagmi/index.ts",
    "src/chains/index.ts"
  ],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"],
  "outputFileStrategy": "modules",
  "excludePrivate": true,
  "excludeInternal": true,
  "excludeExternals": true,
  "readme": "none",
  "githubPages": false
}
EOF

# 3. Add script to package.json
# "generate:api": "typedoc"

# 4. Test
pnpm generate:api
```

### Phase 2: Improve JSDoc Coverage (Day 1-2)

Review and enhance JSDoc comments in source files:

```typescript
// Before (minimal)
export function createRadiusClient(config: RadiusClientConfig): RadiusClient

// After (rich)
/**
 * Creates a new RadiusClient instance configured for the Radius network.
 *
 * @param config - Configuration options for the client
 * @returns A RadiusClient instance for blockchain interactions
 *
 * @example
 * ```typescript
 * import { createRadiusClient } from '@radiustechsystems/sdk';
 * import { radiusTestnet } from '@radiustechsystems/sdk/chains';
 *
 * const client = createRadiusClient({
 *   chain: radiusTestnet,
 * });
 *
 * const balance = await client.getBalance('0x...');
 * ```
 *
 * @see {@link RadiusClientConfig} for configuration options
 * @see {@link RadiusClient} for available methods
 */
export function createRadiusClient(config: RadiusClientConfig): RadiusClient
```

**Priority files:**
1. `src/client/client.ts` - Main entry point
2. `src/server/Handler.ts` - Server handlers
3. `src/server/Kv.ts` - KV store
4. `src/auth/privatekey/signer.ts` - Account creation

### Phase 3: Create Thin Guide Templates (Day 2)

```typescript
// scripts/generate-guides.ts
import { writeFileSync } from 'node:fs';

const QUICK_START = `---
title: Quick Start
---

# Quick Start

{/* This guide is manually maintained for narrative flow */}

## Installation

\`\`\`bash
pnpm add @radiustechsystems/sdk viem
\`\`\`

## Basic Usage

See [API Reference](/docs/api) for complete documentation.

... (minimal, links to auto-generated API docs)
`;

// Write guides
writeFileSync('docs/guides/quick-start.mdx', QUICK_START);
```

### Phase 4: Update Build Pipeline (Day 2)

```json
// package.json scripts
{
  "scripts": {
    "generate:api": "typedoc",
    "generate:guides": "tsx scripts/generate-guides.ts",
    "generate:docs": "pnpm generate:api && pnpm generate:guides",
    "docs:check": "tsx scripts/validate-docs.ts"
  }
}
```

### Phase 5: CI Validation (Day 3)

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

## Migration from Current System

### Step 1: Archive Old Templates

```bash
mkdir -p archive
mv scripts/generate-docs.ts archive/generate-docs-v1.ts
mv docs/*.mdx archive/
```

### Step 2: Enhance JSDoc in Source

Update source files with comprehensive JSDoc (see Phase 2).

### Step 3: Generate New Docs

```bash
pnpm generate:docs
```

### Step 4: Review and Adjust

- Check TypeDoc output format
- Adjust typedoc.json if needed
- Update docs site ingestion if format changed

### Step 5: Update Docs Site Integration

Communicate format changes to docs team:

```markdown
## SDK Docs Format Change

**Old:** Single MDX files with everything
- `sdk-typescript.mdx` (1500 lines)
- `sdk-typescript-events.mdx`
- `sdk-typescript-react.mdx`

**New:** Modular structure
- `docs/api/` - Auto-generated API reference (TypeDoc)
- `docs/guides/` - Manual guides (thin)
```

---

## Output Structure (After Migration)

```
docs/
├── api/                           # TypeDoc output
│   ├── README.md                  # Module overview
│   ├── functions/
│   │   ├── createRadiusClient.md
│   │   ├── createPrivateKeySigner.md  # ← Note: name may change
│   │   └── ...
│   ├── interfaces/
│   │   ├── RadiusClient.md
│   │   ├── RadiusClientConfig.md
│   │   └── ...
│   ├── classes/
│   │   └── RadiusError.md
│   ├── modules/
│   │   ├── server.md              # Handler, Kv
│   │   ├── react.md               # hooks
│   │   ├── events.md
│   │   └── wagmi.md
│   └── index.md
├── guides/
│   ├── quick-start.mdx
│   ├── migration-v1-v2.mdx
│   ├── server-handlers.mdx
│   └── fee-sponsorship.mdx        # Explains why feePayer doesn't exist
└── GENERATION.md                  # Updated process docs
```

---

## Full Pipeline After Implementation

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE DOCS PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Developer changes SDK                                               │
│     └── Updates src/client/client.ts                                    │
│                                                                         │
│  2. JSDoc comments are source of truth                                  │
│     └── /** @param config - Configuration options */                    │
│                                                                         │
│  3. PR triggers CI                                                      │
│     └── pnpm generate:docs                                              │
│     └── git diff --exit-code docs/  (fails if changed)                  │
│                                                                         │
│  4. Developer commits generated docs                                    │
│     └── git add docs/ && git commit                                     │
│                                                                         │
│  5. PR merged to main                                                   │
│                                                                         │
│  6. Docs site pulls SDK repo                                            │
│     └── Ingests docs/api/ and docs/guides/                              │
│                                                                         │
│  7. Devs cheer 🎉                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Effort Estimate

| Task | Time | Dependency |
|------|------|------------|
| Install/configure TypeDoc | 2 hours | - |
| Enhance JSDoc in source files | 4-6 hours | - |
| Create guide templates | 2 hours | - |
| Update build scripts | 1 hour | TypeDoc |
| Add CI validation | 1 hour | Build scripts |
| Test end-to-end | 2 hours | All above |
| Coordinate with docs team | 1 hour | - |

**Total: 2-3 days**

---

## Decision Required

**Question for you:**

1. **Option C (Hybrid TypeDoc + Manual Guides)** - Recommended
2. **Option A (TypeDoc only)** - Simpler, less control
3. **Option B (API Extractor)** - More complex, more control
4. **Option D (Fix current system)** - Quick but technical debt

Which approach do you want to pursue?

---

## Quick Win (Immediate)

If you need docs fixed NOW before the automation work:

```bash
# Quick fix: Manually update the templates
# 1. Open scripts/generate-docs.ts
# 2. Find/replace:
#    - "RadiusSigner" → "LocalAccount"
#    - Remove ClefSigner section entirely
#    - Fix createPrivateKeySigner signature
# 3. Run pnpm generate:docs
# 4. Commit

# This buys time while automation is built
```

---

*End of Plan Document*
