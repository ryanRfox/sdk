# Linear Tickets Draft

## Ticket 1: Configure npm OIDC Trusted Publishing

**Title:** Configure npm OIDC Trusted Publishing for SDK releases

**Priority:** High (blocks V2 SDK alpha release)

**Labels:** infrastructure, security, npm

**Description:**

### Summary
npm revoked all classic tokens on December 9, 2025. Our `NPM_TOKEN` secret no longer works. We need to configure OIDC trusted publishing for secure, tokenless npm releases.

### Background
- [npm classic tokens revoked announcement](https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/)
- [npm OIDC trusted publishing GA](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)

### Tasks

#### 1. Create GitHub Environment
- Go to: https://github.com/radiustechsystems/sdk/settings/environments
- Create environment: `npm-publish`
- Optional: Add protection rules (require reviewers for production releases)

#### 2. Configure npm Trusted Publisher
- Go to: https://www.npmjs.com/package/@radiustechsystems/sdk/access
- Under "Trusted Publisher", click "Add trusted publisher"
- Select "GitHub Actions"
- Configure:
  - **Organization/User:** `radiustechsystems`
  - **Repository:** `sdk`
  - **Workflow filename:** `typescript-publish.yml`
  - **Environment:** `npm-publish`

#### 3. Merge Workflow Changes
The workflow has been updated in `v2-alpha` branch:
- Added `environment: npm-publish`
- Removed `NODE_AUTH_TOKEN` (OIDC handles auth)
- Added comments explaining the setup

#### 4. Delete Old Secret (cleanup)
- Go to: https://github.com/radiustechsystems/sdk/settings/secrets/actions
- Delete `NPM_TOKEN` secret (no longer needed)

### Verification
After setup, re-push the `ts-v2.0.0-alpha.10` tag to trigger publish:
```bash
git push upstream :refs/tags/ts-v2.0.0-alpha.10
git push upstream ts-v2.0.0-alpha.10
```

### Benefits of OIDC
- No tokens to manage or rotate
- Cryptographic trust via GitHub's OIDC provider
- Automatic provenance attestations
- More secure than long-lived tokens

---

## Ticket 2: V2 SDK Alpha Release Review

**Title:** Review V2 SDK Alpha Release (ts-v2.0.0-alpha.10)

**Priority:** Normal

**Labels:** sdk, typescript, review

**Blocked by:** Ticket 1 (OIDC setup)

**Description:**

### Summary
V2 SDK alpha is ready for release to npm as `@radiustechsystems/sdk@2.0.0-alpha.10`.

### What's New in V2
- **Complete rewrite** using viem decorator pattern
- `radiusWalletActions()` decorator for Radius-specific features
- `sendTransactionBatch()` for atomic batch transactions
- Event watching utilities (`watchTransfer`, `watchApproval`, `watchBlock`)
- viem ^2.30.0 required as peer dependency
- Full TypeScript support with proper types

### Breaking Changes from V1
- `RadiusClient` removed - use viem clients + decorators instead
- Import paths changed to `@radiustechsystems/sdk`
- React/WAGMI exports removed (use viem/wagmi directly)

### Code Location
- **Branch:** `upstream/v2-alpha`
- **Tag:** `ts-v2.0.0-alpha.10`
- **Commit:** Single squashed commit with all V2 changes

### Testing
Once OIDC is configured and npm publish succeeds:
```bash
npm install @radiustechsystems/sdk@2.0.0-alpha.10
```

### Links
- npm (after publish): https://www.npmjs.com/package/@radiustechsystems/sdk/v/2.0.0-alpha.10
- Branch: https://github.com/radiustechsystems/sdk/tree/v2-alpha
- Migration guide: `typescript/docs/guides/migration-v1-v2.mdx`
- Quick start: `typescript/docs/guides/quick-start.mdx`

### Review Request
- Review V2 API design and patterns
- Provide feedback on documentation
- Test installation and basic usage
- Identify any blockers for beta/stable release
