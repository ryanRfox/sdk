# V2 Alpha Release Planning

**Date:** 2026-01-18
**Scope:** Publishing `@radiustechsystems/sdk` v2.0.0-alpha.6 to npm
**Status:** Awaiting PR submission to upstream

---

## Current State

| Aspect | Value |
|--------|-------|
| Local version | `2.0.0-alpha.6` |
| Package name | `@radiustechsystems/sdk` |
| Fork (origin) | `https://github.com/ryanRfox/sdk.git` |
| Upstream | `https://github.com/radiustechsystems/sdk` |
| Existing tags | `ts-v1.0.0`, `go-v1.0.0` |
| Publish trigger | Tags matching `ts-v*.*.*` |

---

## How Publishing Works

The GitHub Actions workflow at `.github/workflows/typescript-publish.yml` triggers on tag pushes:

1. Tag format: `ts-v2.0.0-alpha.6`
2. Workflow extracts version from tag
3. Updates `package.json` version using `jq`
4. Runs linter and tests
5. Builds production bundle
6. Publishes to npm with `--provenance --access public`

**Trigger condition:**
```yaml
on:
  push:
    tags:
      - 'ts-v*.*.*'
```

---

## NPM Dist-Tags Behavior

Since `2.0.0-alpha.6` is a prerelease version, npm handles it correctly:

| Command | What User Gets |
|---------|----------------|
| `npm install @radiustechsystems/sdk` | 1.0.0 (latest stable) |
| `npm install @radiustechsystems/sdk@2.0.0-alpha.6` | Exact alpha version |

**Key insight:** The publish workflow uses `npm publish` without specifying a dist-tag. By npm convention:
- Prerelease versions (x.x.x-alpha.x, x.x.x-beta.x) do **not** become `latest`
- V1 users are protected — they continue receiving stable V1

---

## Release Workflow (PR-Based)

### Step 1: Ensure Fork is Current

```bash
git push origin main
```

### Step 2: Create Pull Request

Open PR from fork to upstream:
- **From:** `ryanRfox/sdk:main`
- **To:** `radiustechsystems/sdk:main`

**Suggested PR title:** `feat: V2 SDK alpha release`

**PR description should include:**
- Summary of V2 changes (reference CHANGELOG)
- Breaking changes from V1
- Note that this is for alpha/public testing
- Request for tag creation after merge: `ts-v2.0.0-alpha.6`

### Step 3: After PR Merge

A maintainer with push access creates the release tag:

```bash
git tag ts-v2.0.0-alpha.6
git push origin ts-v2.0.0-alpha.6
```

This triggers the publish workflow on GitHub Actions.

### Step 4: Verify Publication

```bash
npm view @radiustechsystems/sdk versions
npm view @radiustechsystems/sdk dist-tags
```

---

## Key Considerations

### V1 Preservation

| Concern | Resolution |
|---------|------------|
| V1 users affected? | No — npm won't serve alpha by default |
| V1 code preserved? | Yes — via `ts-v1.0.0` tag |
| Future V1 hotfixes? | Create `v1` branch from `ts-v1.0.0` tag |

### Breaking Changes

V2 is a major breaking change. The CHANGELOG documents:
- Simplified API surface
- Removal of legacy exports
- Changed import paths
- viem as required peer dependency

### Alpha Testing

Users can test alpha via:
```bash
npm install @radiustechsystems/sdk@2.0.0-alpha.6
```

Or with package.json:
```json
{
  "dependencies": {
    "@radiustechsystems/sdk": "2.0.0-alpha.6"
  }
}
```

---

## Pre-PR Checklist

- [ ] All tests pass locally (`pnpm test`)
- [ ] Linter passes (`pnpm lint`)
- [ ] CHANGELOG updated through alpha.6
- [ ] Documentation reflects V2 API
- [ ] No sensitive data in commits
- [ ] Fork main pushed to origin

---

## Linear Task

When ready to submit PR, create a Linear task:
- **Title:** Review V2 SDK Alpha PR for npm publish
- **Description:** Review PR from ryanRfox/sdk:main to radiustechsystems/sdk:main for V2 alpha release
- **Action needed:** After merge, create and push tag `ts-v2.0.0-alpha.6`

---

## Related Files

| File | Purpose |
|------|---------|
| `.github/workflows/typescript-publish.yml` | npm publish workflow |
| `typescript/package.json` | Package config, version |
| `typescript/CHANGELOG.md` | Version history |
