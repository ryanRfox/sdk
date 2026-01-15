# HANDOFF: Documentation Automation Implementation

> **Branch:** `feat/v2-docs`
> **Created:** 15 January 2026
> **Previous Work:** Research and planning by prior Claude session
> **Goal:** Implement automated documentation generation for Radius SDK V2

---

## Context

The Radius SDK V2 has **broken documentation** because the current system uses manual templates that drifted from the actual API. Your job is to implement **automated documentation generation**.

### Key Documents to Read First

1. `PLAN-DOCS-AUTOMATION.md` - Full plan with options (Option C recommended)
2. `REVIEW-REPORT-2.md` - Critical review showing what's broken
3. `TEMPO-FEE-PAYER.md` - Why feePayer was correctly omitted

### Current Problem

```
scripts/generate-docs.ts = 1800 lines of HARDCODED MDX templates
                           ↓
                    Nobody updates them
                           ↓
                    docs/*.mdx are STALE
```

---

## Your Mission

### Phase 1: Research (Do This First)

1. **Check Tempo's documentation approach:**
   ```bash
   # Tempo repo is at /tmp/tempo-ts
   ls /tmp/tempo-ts/docs/
   cat /tmp/tempo-ts/package.json | grep -i doc
   # Look for typedoc, api-extractor, or similar
   ```

2. **Check viem's documentation approach:**
   ```bash
   # viem repo is at /tmp/viem
   ls /tmp/viem/site/
   cat /tmp/viem/package.json | grep -i doc
   ```

3. **Research TypeDoc for SDK documentation:**
   - Can it generate MDX output?
   - Does `typedoc-plugin-markdown` meet our needs?
   - How do we handle subpath exports (`/server`, `/react`, etc.)?

4. **Consider if a /skill would help:**
   - Could a `docs-generator` skill automate this?
   - What would trigger it? (PR merge? Manual invocation?)

### Phase 2: Implementation

Based on research, implement the chosen approach. The recommended approach is:

1. **Install TypeDoc** with markdown plugin
2. **Enhance JSDoc comments** in source files
3. **Create thin guide templates** for narrative content
4. **Add CI validation** to catch drift
5. **Update docs site integration**

### Phase 3: Validation

1. Generated docs should match actual API
2. No references to removed code (RadiusSigner, ClefSigner)
3. Examples should compile and run
4. CI should catch future drift

---

## Files That Need Work

### Source files needing better JSDoc:
- `typescript/src/client/client.ts` - Main client
- `typescript/src/server/Handler.ts` - Server handlers
- `typescript/src/server/Kv.ts` - KV store
- `typescript/src/auth/privatekey/signer.ts` - Account creation
- `typescript/src/react/hooks/*.ts` - React hooks
- `typescript/src/events/*.ts` - Event watchers

### Files to create:
- `typescript/typedoc.json` - TypeDoc configuration
- `typescript/scripts/generate-guides.ts` - Thin guide generator
- `typescript/scripts/validate-docs.ts` - CI validation script

### Files to remove/archive:
- `typescript/scripts/generate-docs.ts` - Current broken system

---

## Success Criteria

When done:

```bash
# This should work
pnpm generate:docs

# And produce accurate docs in
docs/api/          # Auto-generated API reference
docs/guides/       # Manual guides (thin)

# CI should catch drift
git diff --exit-code docs/  # Fails if docs need regeneration
```

---

## Questions to Answer During Research

1. Does Tempo use automated doc generation? If so, how?
2. Does viem use automated doc generation? If so, how?
3. Can TypeDoc handle our subpath export structure?
4. Should we create a `/skill` for doc generation?
5. What format does the external docs site expect?

---

## Communication

The user mentioned an external docs site that ingests SDK docs. You may need to:
1. Understand what format they expect
2. Coordinate any format changes
3. Update `docs/GENERATION.md` with new process

---

*End of Handoff*
