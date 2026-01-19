# Release Planning Research

**Date:** 2026-01-18
**Scope:** V2 SDK npm publishing workflow

---

## Key Finding

Publishing V2 alpha to npm requires a PR to upstream followed by tag creation by a maintainer.

| Aspect | Status | Notes |
|--------|--------|-------|
| V1 user impact | Safe | Prerelease versions don't become `latest` |
| Publishing workflow | Ready | Triggers on `ts-v*.*.*` tags |
| V1 preservation | Yes | Preserved via `ts-v1.0.0` tag |

---

## Documentation

| File | Description |
|------|-------------|
| [V2-RELEASE-PLANNING.md](./V2-RELEASE-PLANNING.md) | Full release planning with workflow steps and checklist |

---

## Quick Reference

**To publish V2 alpha:**
1. Push fork to origin: `git push origin main`
2. Open PR: `ryanRfox/sdk:main` → `radiustechsystems/sdk:main`
3. After merge, maintainer tags: `git tag ts-v2.0.0-alpha.6 && git push origin ts-v2.0.0-alpha.6`
4. Verify: `npm view @radiustechsystems/sdk versions`

**Users install alpha with:**
```bash
npm install @radiustechsystems/sdk@2.0.0-alpha.6
```

---

## Related Research

- [SDK Audit](../sdk-audit/) - V2 architecture and API findings
- [Transaction Behavior](../transaction-behavior/) - Batch transaction research

---

## Impact on SDK

This research documents the path to public alpha testing:
1. Submit PR to upstream
2. Request ENG review and merge
3. Request tag creation for npm publish
4. Alpha available for community testing
