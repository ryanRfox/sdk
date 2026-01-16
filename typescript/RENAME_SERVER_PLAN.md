# Rename Plan: `/server` to `/webauthn`

This document outlines all files and configurations that need to change when renaming the `/server` module to `/webauthn` to better reflect its actual purpose (WebAuthn credential/key management).

---

## 1. Current package.json Export Configuration

```json
"./server": {
  "types": "./src/_types/server/index.d.ts",
  "import": "./src/_esm/server/index.js"
}
```

**Note:** The server export currently lacks a CJS (`default`) entry, unlike other subpath exports.

---

## 2. Source Files to Rename

All files in `src/server/` need to move to `src/webauthn/`:

| Current Path | New Path |
|-------------|----------|
| `src/server/index.ts` | `src/webauthn/index.ts` |
| `src/server/Handler.ts` | `src/webauthn/Handler.ts` |
| `src/server/Handler.test.ts` | `src/webauthn/Handler.test.ts` |
| `src/server/Kv.ts` | `src/webauthn/Kv.ts` |
| `src/server/types.ts` | `src/webauthn/types.ts` |
| `src/server/errors.ts` | `src/webauthn/errors.ts` |
| `src/server/internal/requestListener.ts` | `src/webauthn/internal/requestListener.ts` |

**Total: 7 files + 1 directory**

---

## 3. Build Output Directories (Auto-generated)

These directories are generated during build and will be recreated automatically after rename. They should be deleted by `pnpm clean` before rebuild:

### ESM Output (`src/_esm/server/`)
- `src/_esm/server/index.js`
- `src/_esm/server/index.js.map`
- `src/_esm/server/Handler.js`
- `src/_esm/server/Handler.js.map`
- `src/_esm/server/Handler.d.ts`
- `src/_esm/server/Handler.d.ts.map`
- `src/_esm/server/Kv.js`
- `src/_esm/server/Kv.js.map`
- `src/_esm/server/Kv.d.ts`
- `src/_esm/server/errors.js`
- `src/_esm/server/errors.js.map`
- `src/_esm/server/errors.d.ts`
- `src/_esm/server/errors.d.ts.map`
- `src/_esm/server/types.js`
- `src/_esm/server/types.js.map`
- `src/_esm/server/types.d.ts`
- `src/_esm/server/internal/requestListener.js`
- `src/_esm/server/internal/requestListener.js.map`
- `src/_esm/server/internal/requestListener.d.ts`
- `src/_esm/server/internal/requestListener.d.ts.map`

### Types Output (`src/_types/server/`)
- `src/_types/server/index.d.ts`
- `src/_types/server/index.d.ts.map`
- `src/_types/server/Handler.d.ts`
- `src/_types/server/Handler.d.ts.map`
- `src/_types/server/Kv.d.ts`
- `src/_types/server/Kv.d.ts.map`
- `src/_types/server/errors.d.ts`
- `src/_types/server/errors.d.ts.map`
- `src/_types/server/types.d.ts`
- `src/_types/server/types.d.ts.map`
- `src/_types/server/internal/requestListener.d.ts`
- `src/_types/server/internal/requestListener.d.ts.map`

### CJS Output (`src/_cjs/server/`)
- Currently does not exist (server module excluded from CJS build)

**Action:** Run `pnpm clean` before rebuilding.

---

## 4. Configuration Files to Update

### `package.json`

**Change export key and paths:**

```json
// FROM:
"./server": {
  "types": "./src/_types/server/index.d.ts",
  "import": "./src/_esm/server/index.js"
}

// TO:
"./webauthn": {
  "types": "./src/_types/webauthn/index.d.ts",
  "import": "./src/_esm/webauthn/index.js",
  "default": "./src/_cjs/webauthn/index.js"  // Add CJS support (P1-4)
}
```

### `tsconfig.cjs.json`

**Update exclusion path:**

```json
// FROM:
"exclude": [
  ...
  "src/server/**/*"
]

// TO:
"exclude": [
  ...
  "src/webauthn/**/*"
]
```

**Note:** If adding CJS support (P1-4), remove this exclusion entirely.

### `typedoc.json`

**Update entry point:**

```json
// FROM:
"entryPoints": [
  "src/index.ts",
  "src/server/index.ts",
  ...
]

// TO:
"entryPoints": [
  "src/index.ts",
  "src/webauthn/index.ts",
  ...
]
```

---

## 5. Source Code Updates

### `src/server/index.ts` (becomes `src/webauthn/index.ts`)

**Update module JSDoc comment:**

```typescript
// FROM:
/**
 * Server module for Radius SDK
 *
 * Provides request handlers for key management.
 *
 * @example
 * ```typescript
 * import { Kv } from '@radiustechsystems/sdk/server';
 *
 * const kv = Kv.memory();
 * ```
 */

// TO:
/**
 * WebAuthn module for Radius SDK
 *
 * Provides request handlers for WebAuthn credential/key management.
 *
 * @example
 * ```typescript
 * import { Kv } from '@radiustechsystems/sdk/webauthn';
 *
 * const kv = Kv.memory();
 * ```
 */
```

---

## 6. Documentation Files to Update

### Guide Files

| File | Changes Needed |
|------|----------------|
| `docs/guides/server.mdx` | Rename to `docs/guides/webauthn.mdx`, update all imports from `/server` to `/webauthn` |
| `docs/guides/migration-v1-v2.mdx` | Update import example (line 84) |
| `docs/guides/quick-start.mdx` | Update link text and path (line 61) |

### API Reference (Auto-generated)

| Directory | Action |
|-----------|--------|
| `docs/api/server/` | Will be regenerated as `docs/api/webauthn/` after rebuild |
| `docs/api/server/README.md` | Auto-regenerated |
| `docs/api/server/namespaces/` | Auto-regenerated |

**Note:** Run `pnpm generate:docs` after rebuild.

### Other Documentation

| File | Changes Needed |
|------|----------------|
| `docs/GENERATION.md` | Update reference on line 72 |
| `docs/api/index.md` | References to server module |
| `docs/api/README.md` | References to server module |
| `docs/api/react.md` | May reference server module |

---

## 7. Scripts to Update

### `scripts/generate-guides.ts`

**Multiple updates needed:**

1. **Line 89:** Update link text
   ```typescript
   // FROM:
   - [Server Handlers](/docs/guides/server) - Building backend services
   // TO:
   - [WebAuthn Handlers](/docs/guides/webauthn) - WebAuthn key management
   ```

2. **Lines 183-278:** Update entire `SERVER_GUIDE` constant
   - Change title from "Server Handlers" to "WebAuthn Handlers"
   - Update all `@radiustechsystems/sdk/server` imports to `@radiustechsystems/sdk/webauthn`
   - Update API reference link

3. **Line 627:** Update guide filename
   ```typescript
   // FROM:
   { name: 'server.mdx', content: SERVER_GUIDE },
   // TO:
   { name: 'webauthn.mdx', content: SERVER_GUIDE },
   ```

---

## 8. README.md Updates

### Main README (`typescript/README.md`)

**Lines to update:**

1. **Line 61:** Update feature description
   ```markdown
   // FROM:
   - **Server Handlers** — WebAuthn key management, composable handlers
   // TO:
   - **WebAuthn Handlers** — WebAuthn key management, composable handlers
   ```

2. **Line 72:** Update import example
   ```typescript
   // FROM:
   import { Handler, Kv } from '@radiustechsystems/sdk/server';
   // TO:
   import { Handler, Kv } from '@radiustechsystems/sdk/webauthn';
   ```

3. **Line 84:** Update documentation link
   ```markdown
   // FROM:
   - [Server Handlers](https://docs.radiustech.xyz/sdk/typescript/server)
   // TO:
   - [WebAuthn Handlers](https://docs.radiustech.xyz/sdk/typescript/webauthn)
   ```

---

## 9. External References (Outside SDK)

These files reference `@radiustechsystems/sdk/server` and will need updating in downstream projects:

### In `/Users/fox/Getting Started/radius-first-contact/`

| File | Description |
|------|-------------|
| `src/06-server.ts` | Example script using server module |
| `reports/phase8-server-handlers.md` | Evaluation report |
| `planning/radius-sdk-strategy.md` | Strategy document |
| `planning/CONTEXT.md` | Context document |
| `planning/HANDOFF-SDK-ENGINEERING.md` | Engineering handoff |

### In `/Users/fox/Getting Started/radius-sdk/`

| File | Description |
|------|-------------|
| `HANDOFF.md` | Contains multiple references to `/server` path |

---

## 10. Implementation Checklist

### Phase 1: Source Rename ✅ COMPLETE
- [x] Create `src/webauthn/` directory
- [x] Move all files from `src/server/` to `src/webauthn/`
- [x] Update JSDoc in `src/webauthn/index.ts`
- [x] Delete empty `src/server/` directory

### Phase 2: Configuration Updates ✅ COMPLETE
- [x] Update `package.json` exports (change `./server` to `./webauthn`)
- [x] Update `tsconfig.cjs.json` exclusion (keep exclusion — CJS build has ESM-only dependency issues)
- [x] Update `typedoc.json` entry point

### Phase 3: Documentation Updates
- [ ] Rename `docs/guides/server.mdx` to `docs/guides/webauthn.mdx`
- [ ] Update all import paths in guide files
- [ ] Update `docs/GENERATION.md`
- [ ] Update `README.md`
- [ ] Update `scripts/generate-guides.ts`

### Phase 4: Build & Verify ✅ COMPLETE
- [x] Run `pnpm clean`
- [x] Run `pnpm build`
- [x] Run `pnpm test` (215 pass, 27 skipped)
- [ ] Run `pnpm generate:docs`
- [x] Verify new export works: `import { Handler } from '@radiustechsystems/sdk/webauthn'`

### Phase 5: Update Related Files
- [ ] Update `HANDOFF.md` references
- [ ] Update evaluation project examples (radius-first-contact)

---

## 11. Backward Compatibility Considerations

**Option A: Clean break (recommended for alpha)**
- Remove `/server` export entirely
- Document breaking change in migration guide

**Option B: Deprecation path**
- Keep both `/server` and `/webauthn` exports temporarily
- Add deprecation notice to `/server` export
- Remove in next major version

Since this is V2-alpha (not yet published to npm), Option A is recommended.

---

## Summary

| Category | Count |
|----------|-------|
| Source files to move | 7 |
| Config files to update | 3 |
| Documentation files to update | ~10 |
| Script files to update | 1 |
| README files to update | 1 |
| External project files affected | 6 |

**Total estimated changes: ~28 files**
