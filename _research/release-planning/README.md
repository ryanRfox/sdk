# Release Planning Research

**Date:** 2026-01-18 (updated 2026-01-22)
**Scope:** V2 SDK npm publishing workflow and release model

---

## Key Findings

### Release Model

Publishing V2 alpha to npm requires a PR to upstream followed by tag creation by a maintainer.

| Aspect | Status | Notes |
|--------|--------|-------|
| V1 user impact | Safe | Prerelease versions don't become `latest` |
| Publishing workflow | Ready | Triggers on `ts-v*.*.*` tags |
| V1 preservation | Yes | Preserved via `ts-v1.0.0` tag (immutable) |

**Tags preserve releases, not branch HEADs.** The `ts-v1.0.0` tag will always point to commit `479612e`, regardless of what happens to `main`. npm packages are also immutable once published.

### Repository Organization

**Branch-based versioning** (not directory-based) is the correct approach for this SDK:

| Approach | When to Use |
|----------|-------------|
| Branch-based (`/typescript` with V2 at HEAD) | Single npm packages (this SDK) |
| Directory-based (`/typescript/v1`, `/typescript/v2`) | REST APIs, docs sites |

This follows industry standards used by wagmi, viem, React, and Vue.

### Recommended Approach: V2-Alpha Branch

```
upstream/main:      [V1 code] → [V1 hotfixes if needed]
upstream/v2-alpha:  [V2 code] → ... → [merge to main when stable]
```

- `main` stays on V1 until V2 is production-ready
- V2 development on `v2-alpha` branch
- Tags on either branch trigger npm publish (workflow is branch-agnostic)

---

## Documentation

| File | Description |
|------|-------------|
| [V2-RELEASE-PLANNING.md](./V2-RELEASE-PLANNING.md) | Full release planning with workflow steps and checklist |

---

## Quick Reference

**Recommended workflow (V2-Alpha Branch approach):**
1. ENG creates `v2-alpha` branch on upstream
2. Push fork to origin: `git push origin main`
3. Open PR: `ryanRfox/sdk:main` → `radiustechsystems/sdk:v2-alpha`
4. After merge, maintainer tags: `git tag ts-v2.0.0-alpha.6 && git push upstream ts-v2.0.0-alpha.6`
5. Verify: `npm view @radiustechsystems/sdk versions`

**Users install alpha with:**
```bash
npm install @radiustechsystems/sdk@2.0.0-alpha.6
```

**V1 maintenance (if ever needed):**
```bash
git checkout -b v1-maintenance ts-v1.0.0
# Make hotfix
git tag ts-v1.0.1
git push upstream ts-v1.0.1
```

---

## Related Research

- [SDK Audit](../sdk-audit/) - V2 architecture and API findings
- [Transaction Behavior](../transaction-behavior/) - Batch transaction research

---

## Impact on SDK

This research documents the path to public alpha testing:
1. Request ENG create `v2-alpha` branch on upstream
2. Submit PR to `v2-alpha` branch (not `main`)
3. Request ENG review and merge
4. Request tag creation `ts-v2.0.0-alpha.6` for npm publish
5. Alpha available for community testing

**When V2 is stable:**
1. Tag final release `ts-v2.0.0`
2. Merge `v2-alpha` → `main`
3. Delete `v2-alpha` branch
4. npm `latest` dist-tag updates to 2.0.0
