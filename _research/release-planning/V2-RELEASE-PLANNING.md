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

## Understanding the Release Model

### Key Insight: Tags Preserve Releases, Not Branch HEADs

```
Git History (simplified):

... → [V1 code] → [docs fixes] → [more docs] → ... → [V2 code]
         ↑                                              ↑
    ts-v1.0.0 tag                               ts-v2.0.0-alpha.6 tag
         │                                              │
         ↓                                              ↓
    npm 1.0.0                                   npm 2.0.0-alpha.6
    (already published)                         (will be published)
```

**Current reality (verified):**

| What | Value |
|------|-------|
| `upstream/main` HEAD | `9031d9a` (docs improvements, already past V1) |
| `ts-v1.0.0` tag points to | `479612e` (ancestor of main) |
| npm published versions | `["1.0.0"]` |
| npm `latest` dist-tag | `1.0.0` |

### Tags Are Permanent Snapshots

- A git tag is a **pointer to a specific commit** — it never moves
- `ts-v1.0.0` will **always** point to commit `479612e`
- Even after V2 is merged, you can checkout V1: `git checkout ts-v1.0.0`

### npm Packages Are Immutable

- Once `@radiustechsystems/sdk@1.0.0` is published, it cannot be changed
- The package was built from the `ts-v1.0.0` tag commit
- Pushing V2 to git doesn't affect the already-published npm package

### What "Preserving V1" Actually Means

| Scenario | How It's Handled |
|----------|------------------|
| User runs `npm install @radiustechsystems/sdk` | Gets 1.0.0 (unchanged) |
| User has V1 in package.json | Keeps getting 1.0.0 |
| Need to read V1 source code | `git checkout ts-v1.0.0` |
| Need to publish V1.0.1 hotfix | See "V1 Maintenance" below |

### V1 Maintenance (If Ever Needed)

```bash
# Create maintenance branch from V1 tag
git checkout -b v1-maintenance ts-v1.0.0

# Make hotfix, then tag and push
git tag ts-v1.0.1
git push upstream ts-v1.0.1  # Triggers publish of 1.0.1
```

This is standard practice — you don't need a `v1` branch until you need it.

---

## Repository Organization Best Practices

### Two Approaches Compared

| Approach | Structure | Used By | Best For |
|----------|-----------|---------|----------|
| **Branch-based** | `/typescript` (V2 at HEAD, V1 via tags/branches) | wagmi, viem, React, Vue, Jest | Single npm packages |
| **Directory-based** | `/typescript/v1`, `/typescript/v2` | REST APIs, documentation sites | APIs serving multiple versions simultaneously |

### Why Branch-Based is Right for This SDK

1. **Single npm package** — `@radiustechsystems/sdk` is one package. Directory-based would require either:
   - Different package names (`@radiustechsystems/sdk-v1`, `@radiustechsystems/sdk-v2`)
   - Complex publish scripts to build from different directories

2. **Industry standard** — Major projects use this approach:
   - wagmi developed V2 on an "rc branch", now V2 is on `main`
   - wagmi v1 docs live at a subdomain, code on `v1.x` branch
   - MCP TypeScript SDK keeps v1 fixes on `v1.x` branch

3. **npm handles versions, not directories** — npm users install by version (`@1.0.0`, `@2.0.0-alpha.6`), not by directory path

4. **Simpler maintenance** — One `package.json`, one build config, one test suite at HEAD

### When Directory-Based Makes Sense

- **REST APIs**: Serve `/api/v1/users` and `/api/v2/users` simultaneously
- **Documentation sites**: Show v1 and v2 docs side-by-side
- **Monorepos with multiple packages**: `packages/sdk-v1`, `packages/sdk-v2` as separate npm packages

None of these apply to this SDK.

---

## The RC Branch Approach

### Key Insight: npm Doesn't See Git Branches

When users run `npm install @radiustechsystems/sdk@2.0.0-alpha.6`, npm fetches from the **npm registry**, not from git. npm has no knowledge of `main`, `v2-alpha`, or any other branch.

### How Publishing Actually Works

```
Git repo                              npm registry
─────────                             ────────────

main branch:    [V1 code]
                    ↑
                ts-v1.0.0 tag ──────→ @radiustechsystems/sdk@1.0.0

v2-alpha branch:   [V2 code]
                    ↑
                ts-v2.0.0-alpha.6 ──→ @radiustechsystems/sdk@2.0.0-alpha.6
                tag
```

**The tag triggers the publish, not the branch.**

### The Workflow Doesn't Care About Branches

From `.github/workflows/typescript-publish.yml`:

```yaml
on:
  push:
    tags:
      - 'ts-v*.*.*'
```

This triggers on **any tag push** matching the pattern, regardless of which branch the tagged commit is on.

### Two Development Approaches

#### Option A: V2 Development on `main`

```
main:  [V1] → [docs] → [V2 alpha.1] → [V2 alpha.2] → ... → [V2 alpha.6]
         ↑                                                       ↑
    ts-v1.0.0                                            ts-v2.0.0-alpha.6
```

- V1 preserved via tag
- V2 development happens on main
- Simpler: one active branch

#### Option B: V2 Development on RC Branch (wagmi style)

```
main:     [V1] → [docs fixes] → [V1 hotfix if needed]
             ↑                        ↑
        ts-v1.0.0                ts-v1.0.1

v2-alpha:    [V2 alpha.1] → [V2 alpha.2] → ... → [V2 stable]
               ↑              ↑                    ↑
        ts-v2.0.0-alpha.1  alpha.2           ts-v2.0.0
                                                   │
                                    (merge to main when stable)
```

- `main` stays on V1 until V2 is stable
- V2 development on separate branch
- More complex but keeps main "stable"

### Which to Choose?

| Factor | Option A (main) | Option B (rc branch) |
|--------|-----------------|----------------------|
| V1 hotfix urgency | Need to branch from tag | Already on main |
| Development simplicity | Simpler | More branches |
| "Stable main" philosophy | V2 alpha on main | Only stable on main |
| wagmi/viem approach | ❌ | ✅ |

---

## Recommended Approach: V2-Alpha Branch

Keep `main` on V1 until V2 is production-ready. Develop V2 on a separate branch.

### Branch Structure

```
upstream/main:        [V1 code] → [V1 hotfixes if needed]
                          ↑              ↑
                     ts-v1.0.0      ts-v1.0.1

upstream/v2-alpha:    [V2 alpha.1] → [alpha.2] → ... → [stable]
                           ↑                              ↑
                    ts-v2.0.0-alpha.1              ts-v2.0.0
                                                        │
                                        (merge to main when stable)
```

### PR Workflow

```bash
# Push your fork
git push origin main

# Create PR targeting new branch (not main!)
# From: ryanRfox/sdk:main
# To:   radiustechsystems/sdk:v2-alpha  (ENG creates this branch)
```

### Publishing Flow

1. PR merged to `upstream/v2-alpha`
2. Maintainer tags: `git tag ts-v2.0.0-alpha.6`
3. Maintainer pushes tag: `git push upstream ts-v2.0.0-alpha.6`
4. Workflow triggers → npm publish
5. Users install: `npm install @radiustechsystems/sdk@2.0.0-alpha.6`

### When V2 Goes Stable

1. Tag final release: `ts-v2.0.0`
2. Merge `v2-alpha` → `main`
3. Delete `v2-alpha` branch
4. `latest` npm dist-tag updates to 2.0.0

### Benefits

- `main` stays "stable V1" during alpha testing
- V1 hotfixes go directly to `main`
- Clear separation between stable and experimental
- Standard wagmi/viem pattern

---

## Talking Points for ENG Team

1. **"How does this approach work?"**
   - Create `v2-alpha` branch on upstream for V2 development
   - `main` stays on V1 until V2 is production-ready
   - Tags on `v2-alpha` trigger npm publish (workflow doesn't care about branches)
   - When V2 is stable, merge `v2-alpha` → `main`

2. **"How do users get V1 vs V2?"**
   - `npm install @radiustechsystems/sdk` → 1.0.0 (latest stable)
   - `npm install @radiustechsystems/sdk@2.0.0-alpha.6` → explicit alpha
   - npm dist-tags control this automatically for prereleases

3. **"What if we need a V1 hotfix during alpha?"**
   - V1 hotfixes go directly to `main` (it's still on V1!)
   - Tag as `ts-v1.0.1`, push to trigger publish
   - No special branching needed

4. **"Is this how other projects do it?"**
   - Yes. wagmi developed V2 on an "rc branch" before merging to main
   - viem, React, Vue use similar patterns
   - Standard for major version transitions

5. **"What do you need from ENG?"**
   - Create `v2-alpha` branch on upstream
   - Review and merge PR to that branch
   - Create/push tag `ts-v2.0.0-alpha.6` after merge

---

## Sources

- [wagmi v2 Discussion](https://github.com/wevm/wagmi/discussions/3068)
- [wagmi v1 Migration Guide](https://1.x.wagmi.sh/react/migration-guide)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Immutable TypeScript SDK V2](https://docs.immutable.com/blog/2025-02-20-typescript-sdk-v2-release/)
- [Monorepo Versioning Best Practices](https://amarchenko.dev/blog/2023-09-26-versioning/)

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
