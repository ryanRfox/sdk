# Claude Instructions for Docs Automation

## Your Task

You are implementing **automated documentation generation** for the Radius SDK V2. The current manual template system is broken and needs replacement.

## First Steps

1. **Read the handoff document:**
   ```
   /Users/fox/Getting Started/radius-sdk/HANDOFF-DOCS.md
   ```

2. **Read the automation plan:**
   ```
   /Users/fox/Getting Started/radius-sdk/PLAN-DOCS-AUTOMATION.md
   ```

3. **Read the review report (understand what's broken):**
   ```
   /Users/fox/Getting Started/radius-sdk/REVIEW-REPORT-2.md
   ```

## Research Phase

Before implementing, research how others solve this:

### Check Tempo SDK
```bash
# Already cloned at /tmp/tempo-ts
ls -la /tmp/tempo-ts/
cat /tmp/tempo-ts/package.json
# Look for: typedoc, api-extractor, tsdoc, or similar
# Check their docs/ folder structure
```

### Check viem
```bash
# Already cloned at /tmp/viem
ls -la /tmp/viem/
cat /tmp/viem/package.json
# Look for documentation tooling
```

### Check wagmi
```bash
# Already cloned at /tmp/wagmi
ls -la /tmp/wagmi/
cat /tmp/wagmi/package.json
```

### Web Research
- Search for "TypeDoc MDX generation 2025"
- Search for "TypeScript SDK documentation best practices"
- Look at how major SDKs (Stripe, Twilio, AWS) generate docs

## Implementation Guidelines

### Recommended Approach (Option C from plan)

1. **TypeDoc for API reference** - Auto-generated from JSDoc
2. **Thin manual templates for guides** - Human-curated narrative

### Key Constraints

- Output must be consumable by external docs site
- Must handle subpath exports (`/server`, `/react`, `/events`, `/wagmi`, `/chains`)
- Must include code examples that actually work
- CI must catch documentation drift

### Consider Creating a Skill

If appropriate, create a `/docs-gen` skill that:
- Runs TypeDoc
- Validates output
- Reports what changed

Use the `anthropic-skill-creator` skill if you decide to build one.

## Branch Info

- **Branch:** `feat/v2-docs`
- **Base:** `feature/v2-viem-migration`
- **SDK location:** `/Users/fox/Getting Started/radius-sdk/typescript/`

## Do Not

- Do NOT modify SDK source code (except adding JSDoc comments)
- Do NOT change the API surface
- Do NOT commit broken documentation
- Do NOT include Claude attribution in git commits

## Success Looks Like

```bash
cd /Users/fox/Getting\ Started/radius-sdk/typescript

# Generate docs automatically
pnpm generate:docs

# Docs are accurate and match actual API
# No references to RadiusSigner, ClefSigner, or other removed code
# Examples compile and could run

# CI catches drift
pnpm docs:check  # Fails if docs need regeneration
```

## Questions? Ask the User

If unclear about:
- What format the external docs site expects
- Whether to prioritize certain modules
- Trade-offs between approaches

Ask before proceeding.
