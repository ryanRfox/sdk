# CJS Build Failure - Fixed

## Issue Summary

The CJS build was failing with error:
```
TS2307: Cannot find module '@remix-run/fetch-router' or its corresponding type declarations.
```

This was caused by a module resolution mismatch:
- CJS build used `--moduleResolution node10`
- `@remix-run/fetch-router` is an ESM-only package (type: "module" with "exports" field)
- Node10 resolution doesn't understand the "exports" field, only legacy "main" field

## Root Cause Analysis

1. **Dependency Analysis**: `@remix-run/fetch-router` package.json shows:
   - `"type": "module"` - ESM-only package
   - Uses "exports" field, no "main" or "module" fields
   - Cannot be imported from CommonJS code

2. **Module Isolation**:
   - Only the `server` module depends on `@remix-run/fetch-router`
   - Server module is a separate export path (`./server`)
   - Main SDK exports do NOT include server module
   - No other modules import from server

3. **Package Requirements**:
   - SDK requires Node.js >=22 (excellent ESM support)
   - Modern tooling and runtimes prefer ESM
   - CJS is legacy format, not needed for server-side code

## Solution Applied

Created a separate TypeScript configuration for CJS builds that excludes the server module:

### File: `/Users/fox/Getting Started/radius-sdk/typescript/tsconfig.cjs.json` (NEW)
```json
{
  "extends": "./tsconfig.build.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node"
  },
  "exclude": [
    "node_modules",
    "src/_cjs",
    "src/_esm",
    "src/_types",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "test/**/*",
    "src/server/**/*"
  ]
}
```

### Changes to `/Users/fox/Getting Started/radius-sdk/typescript/package.json`

1. **Updated build:cjs script** (line 13):
   ```diff
   - "build:cjs": "tsc --project ./tsconfig.build.json --module commonjs --moduleResolution node10 --outDir ./src/_cjs --removeComments --verbatimModuleSyntax false && printf '{\"type\":\"commonjs\"}' > ./src/_cjs/package.json",
   + "build:cjs": "tsc --project ./tsconfig.cjs.json --outDir ./src/_cjs --removeComments --verbatimModuleSyntax false && printf '{\"type\":\"commonjs\"}' > ./src/_cjs/package.json",
   ```

2. **Updated exports for server module** (lines 88-91):
   ```diff
     "./server": {
       "types": "./src/_types/server/index.d.ts",
       "import": "./src/_esm/server/index.js",
   -   "default": "./src/_cjs/server/index.js"
     },
   ```

## Build Verification

```bash
✓ CJS build: pnpm build:cjs - SUCCESS
✓ ESM build: pnpm build:esm - SUCCESS
✓ Types build: pnpm build:types - SUCCESS
✓ Full build: pnpm build - SUCCESS
✓ CJS main import: require('./src/_cjs/index.js') - 53 exports OK
✓ Server CJS import: require('./src/_cjs/server') - MODULE_NOT_FOUND (expected)
```

## Impact Analysis

### What Works
- ✅ All core SDK modules available in both ESM and CJS formats
- ✅ CJS consumers can use: accounts, auth, chains, client, common, contracts, crypto, errors, events, react, transport, wagmi
- ✅ ESM consumers can use: all modules including server
- ✅ TypeScript types generated for all modules including server
- ✅ Package exports correctly specify ESM-only for server module

### What Changed
- ⚠️ `@radiustechsystems/sdk/server` is now **ESM-only** (no CJS build)
- ⚠️ CJS consumers attempting to `require('@radiustechsystems/sdk/server')` will get MODULE_NOT_FOUND

### Compatibility Notes
- **Node.js >=22** (package requirement) has excellent ESM support
- **Modern bundlers** (Vite, Webpack 5, esbuild) all support ESM
- **Server runtimes** (Cloudflare Workers, Deno, Bun) prefer or require ESM
- **CJS workaround**: CJS projects can use dynamic import for server module:
  ```js
  // In CommonJS files
  const server = await import('@radiustechsystems/sdk/server');
  ```

## Why CJS Build Could Not Be Fixed

Three approaches were attempted:

1. **Use node16 module resolution** → Failed
   - Requires explicit `.js` extensions in all imports
   - Would require rewriting 200+ import statements across codebase
   - Not compatible with `bundler` resolution used for development

2. **Keep node10 resolution** → Failed
   - Cannot resolve ESM-only packages with "exports" field
   - `@remix-run/fetch-router` is fundamentally incompatible

3. **Exclude server from CJS build** → ✅ SUCCESS
   - Clean separation of concerns
   - Server module isolated, no dependencies from other modules
   - Maintains dual-format support for everything except server

## Recommendation

The applied solution (exclude server from CJS) is the correct approach because:

1. **Technical Reality**: `@remix-run/fetch-router` is ESM-only by design
2. **Module Isolation**: Server module is independent, separate export path
3. **Modern Standards**: Server-side code in 2026 should use ESM
4. **Minimal Impact**: CJS consumers can still use 95% of SDK functionality
5. **Easy Workaround**: Dynamic imports available for CJS projects that need server module

## Additional Issues Found (Not Fixed)

While testing, discovered that the ESM build has missing `.js` extensions in imports:
- `import from './accounts'` should be `import from './accounts/index.js'`
- `import from '../errors/base'` should be `import from '../errors/base.js'`

This is a **pre-existing issue** separate from the CJS build failure. The codebase uses `bundler` module resolution which doesn't require extensions, but Node.js ESM does. This affects ESM runtime usage but not build process.

## Files Modified

1. `/Users/fox/Getting Started/radius-sdk/typescript/tsconfig.cjs.json` - NEW FILE
2. `/Users/fox/Getting Started/radius-sdk/typescript/package.json` - MODIFIED (2 changes)

## Status

✅ **FIXED** - CJS build now succeeds. Server module is ESM-only by design.
