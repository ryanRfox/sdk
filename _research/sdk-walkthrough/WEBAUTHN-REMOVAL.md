# WebAuthn Module Removal Decision

**Date:** 2026-01-19
**Decision:** Remove webauthn module from Radius V2 SDK
**Status:** Approved for implementation

---

## Background

The SDK includes a `webauthn/` module that provides:
- Server-side passkey credential management
- Challenge generation and verification
- KV store abstraction (memory, Cloudflare)
- HTTP request handlers

This module has **no relation to viem or blockchain operations**.

---

## Reasons for Removal

### 1. Out of Scope

The Radius SDK's purpose is blockchain interaction via viem. WebAuthn is:
- Server-side authentication infrastructure
- Not blockchain-related
- Not viem-related

### 2. Unknown Use Case

When asked about the purpose, no clear product requirement was identified:
- Not tied to a specific Radius product
- No documentation explaining when to use it
- Unclear target audience

### 3. Maintenance Burden

Keeping webauthn in the SDK means:
- Maintaining code unrelated to core purpose
- Security responsibility for auth infrastructure
- Confusion about SDK scope

### 4. Competitor Reference

The code contains a reference to a competitor's blockchain:
```typescript
// typescript/src/webauthn/internal/requestListener.ts:1
// Adapted from Tempo (https://github.com/tempo-ts/tempo)
```

This should not be in Radius documentation or code.

---

## Files to Remove

```
typescript/src/webauthn/
├── Handler.ts
├── Handler.test.ts
├── Kv.ts
├── errors.ts
├── types.ts
├── index.ts
└── internal/
    └── requestListener.ts

typescript/src/_esm/webauthn/     (generated)
typescript/src/_types/webauthn/   (generated)

typescript/docs/api/webauthn/
├── README.md
└── namespaces/
    ├── Handler.md
    └── Kv/
        ├── README.md
        └── namespaces/
            └── cloudflare.md
```

---

## Code Changes Required

### 1. Remove Directory

```bash
rm -rf typescript/src/webauthn
rm -rf typescript/docs/api/webauthn
```

### 2. Update package.json

Remove the webauthn export:

```diff
  "exports": {
    ".": { ... },
    "./chains": { ... },
    "./events": { ... },
-   "./webauthn": {
-     "types": "./src/_types/webauthn/index.d.ts",
-     "import": "./src/_esm/webauthn/index.js",
-     "default": "./src/_esm/webauthn/index.js"
-   }
  },
```

### 3. Remove Dependency

```diff
  "dependencies": {
-   "@remix-run/fetch-router": "0.14.0"
  }
```

### 4. Update Documentation

- Remove webauthn from API docs
- Remove server.mdx guide
- Update migration guide if webauthn is mentioned

---

## Impact Assessment

### Breaking Change?

Yes, but minimal impact expected:
- No known users of webauthn module
- Module was undocumented for its purpose
- Easy workaround: copy code if needed

### Migration Path

If anyone is using webauthn:
1. Copy the webauthn folder to their project
2. Install `@remix-run/fetch-router` directly
3. No code changes needed (just import path)

---

## Future Consideration

If Radius needs server-side passkey management in the future:
1. Create a separate package: `@radiustechsystems/webauthn`
2. Design with clear product requirements
3. Remove competitor references
4. Document the use case

---

## Approval

- [x] Decision made: Remove webauthn from V2 SDK
- [ ] Implementation: Remove files
- [ ] Build verification: Ensure build passes
- [ ] Test verification: Ensure tests pass
- [ ] Documentation update

---

## Notes

The requestListener.ts file actually credits `mjackson/remix-the-web` as the original source (line 2), not Tempo. However, line 1 says "Adapted from Tempo" which creates confusion about the provenance.

Either way, this code doesn't belong in a blockchain SDK.
