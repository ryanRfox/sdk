# Claude Instructions: Alpha Release Branch

> **Branch:** `alpha-v2`
> **Mission:** Clean up and prepare SDK for alpha release

---

## Your Role

You are preparing the Radius SDK V2 for alpha release. This branch should look like a **production SDK repository** - clean, professional, no development artifacts.

---

## First Task: Read the Handoff

```
HANDOFF-RELEASE-ALPHA.md
```

This contains the full plan. Follow it step by step.

---

## Quick Reference: What to Delete

### Root directory
```bash
rm -f HANDOFF-*.md REVIEW-REPORT*.md PLAN-*.md
rm -f TEMPO-FEE-PAYER.md SDK-DOCS-GEN.md
rm -f cleanup.bat cleanup.sh CLAUDE.md
rm -rf .claude/
```

### TypeScript directory
```bash
rm -f typescript/CLAUDE.md
rm -rf typescript/.claude/ typescript/archive/
```

---

## Quick Reference: What to Keep

```
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
.github/
.gitignore
codecov.yml
contracts/
go/
python/
rust/
typescript/
  ├── README.md
  ├── CHANGELOG.md
  ├── CONTRIBUTING.md
  ├── package.json
  ├── src/
  ├── test/
  ├── docs/
  └── scripts/
```

---

## Verification Commands

```bash
# After cleanup
cd typescript
pnpm install
pnpm check:types   # Must pass
pnpm test          # Must pass (215 tests)
pnpm build         # Must succeed
pnpm docs:check    # Must pass

# Verify package contents
npm pack --dry-run
```

---

## Version Update

Update `typescript/package.json`:
```json
"version": "2.0.0-alpha.1"
```

---

## Commit Message

```
chore: prepare alpha-v2 release branch

- Remove development/planning documents
- Update version to 2.0.0-alpha.1
- Update changelog with V2 changes
- Clean repository structure for release
```

---

## Do NOT

- Push to main or origin
- Publish to npm
- Delete actual source code
- Delete tests
- Delete documentation in docs/

---

## Success Criteria

1. Repo looks like a clean SDK (no planning artifacts)
2. All tests pass
3. Build succeeds
4. Types compile
5. Version is 2.0.0-alpha.1
6. CHANGELOG has V2 entry

---

*Follow HANDOFF-RELEASE-ALPHA.md for the complete plan.*
