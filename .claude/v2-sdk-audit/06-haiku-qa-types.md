# Haiku QA: Types & Exports Audit

## Summary
The Radius SDK v2 types and exports are substantially well-organized with proper viem integration. However, there are **3 critical issues** preventing successful builds for CommonJS targets: TypeScript module resolution configuration mismatch in CJS builds and loose typing in server module. The ESM and type declaration builds complete successfully, but the CJS build fails, blocking package distribution.

## Findings

### 1. Critical Build Failure: Module Resolution Mismatch in CJS Build
- **Severity**: Critical
- **File**: `typescript/tsconfig.json:5` + `typescript/package.json:11-13`
- **Description**:
  The base `tsconfig.json` uses `"moduleResolution": "bundler"` (line 5), which is appropriate for ESM/types. However, the CJS build script explicitly sets `--moduleResolution node10` (line 13 of package.json), but tsconfig inheritance still applies the bundler setting for `@remix-run/fetch-router` resolution. This causes module resolution to fail when building CJS with node10 module resolution.

  The build fails with:
  ```
  error TS2307: Cannot find module '@remix-run/fetch-router' or its corresponding type declarations.
  There are types at '/Users/fox/Getting Started/radius-sdk/typescript/node_modules/@remix-run/fetch-router/dist/index.d.ts',
  but this result could not be resolved under your current 'moduleResolution' setting. Consider updating to 'node16', 'nodenext', or 'bundler'.
  ```

- **Suggested Fix**:
  1. Change CJS build command in `package.json` (line 13) from `--moduleResolution node10` to `--moduleResolution bundler`
  2. Or create a separate `tsconfig.cjs.json` that extends the base config and explicitly sets the moduleResolution for CJS builds
  3. The bundler moduleResolution is backward compatible and handles both CommonJS and ESM correctly

---

### 2. High: Loose Types in Server Handler Interface
- **Severity**: High
- **File**: `typescript/src/server/types.ts:34` and `typescript/src/server/Handler.ts:64,81`
- **Description**:
  The `Handler` type definition uses implicit `any` types for request/response parameters:
  ```typescript
  listener: (req: any, res: any) => void  // Line 34
  ```

  Additionally, middleware function parameters are implicitly typed as `any` in Handler.ts:
  ```typescript
  return async (_, next) => {  // Line 64 - both _ and next implicitly any
  return async (context) => {  // Line 81 - context implicitly any
  ```

  This violates TypeScript strict mode (`strict: true` in tsconfig.json:6) and indicates incomplete type definitions for framework compatibility.

- **Suggested Fix**:
  1. Define request/response interface: `export type RequestHandler = (req: Request, res: Response) => void` (using standard Fetch API types)
  2. Or use generic types: `listener: (req: unknown, res: unknown) => void` if supporting multiple frameworks
  3. Add explicit type annotations to middleware parameters:
     ```typescript
     return async (_: unknown, next: () => Promise<Response>) => {
     return async (context: unknown) => {
     ```

---

### 3. High: Implicit `any` Types in Parameter Destructuring
- **Severity**: High
- **File**: `typescript/src/server/Handler.ts:145,157,228,305`
- **Description**:
  Multiple parameter destructuring patterns use implicit `any` in strictNullChecks mode:
  ```typescript
  Line 145: ({ params }: any) =>  // Binding element 'params' implicitly has 'any' type
  Line 157: ({ params, request }: any) =>
  Line 228: ({ req }: any) =>
  Line 305: (context: any) =>  // Also applies here
  ```

  These fail TypeScript strict type checking when compiling to CommonJS.

- **Suggested Fix**:
  Define clear request/response types for Route handlers and use them in destructuring:
  ```typescript
  interface RouteParams {
    params: Record<string, string>;
    request: Request;
    req: unknown;
  }
  return async ({ params }: RouteParams) => { ... }
  ```

---

### 4. Medium: Incomplete Type Safety in Kv Store
- **Severity**: Medium
- **File**: `typescript/src/server/Kv.ts:101`
- **Description**:
  The in-memory KV store implementation uses `as any` type assertion:
  ```typescript
  async get(key) {
    return store.get(key) as any  // Line 101
  }
  ```

  While the interface uses proper generics `<value = unknown>`, the implementation bypasses type safety with a cast. The Cloudflare KV adapter also accepts `value: any` (line 170).

- **Suggested Fix**:
  ```typescript
  // Instead of:
  return store.get(key) as any

  // Use:
  return store.get(key) as unknown  // Or return the generic value properly
  ```

---

### 5. Medium: Account Options Export Missing
- **Severity**: Medium
- **File**: `typescript/src/index.ts:20`
- **Description**:
  The main index.ts exports `./accounts` with wildcard (line 20), but the accounts module doesn't explicitly export the helper functions `withPrivateKey` and `withAccount` from options.ts. While they are technically exported via the wildcard in `accounts/index.ts`, they're not documented in the main SDK exports and may be overlooked by users.

  The accounts/index.ts exports:
  ```typescript
  export * from './options';  // Contains withPrivateKey, withAccount
  ```

  But main index.ts doesn't document these helpers.

- **Suggested Fix**:
  Add explicit re-exports to main index.ts for clarity:
  ```typescript
  export { Account } from './accounts';
  export { withPrivateKey, withAccount } from './accounts';
  ```

---

### 6. Low: Duplicate LocalAccount Re-export
- **Severity**: Low
- **File**: `typescript/src/index.ts:24`
- **Description**:
  `LocalAccount` is re-exported twice in the main index.ts:
  - Line 24: `export type { LocalAccount } from 'viem';`
  - Also implicitly exported via `export * from './auth'` (line 20), which re-exports it from auth/index.ts

  While not harmful, this is redundant and makes the API surface less clean.

- **Suggested Fix**:
  Remove the explicit re-export on line 24 since it comes through the accounts wildcard export already, or document why it's intentionally duplicated.

---

### 7. Low: Missing React & Wagmi Exports from Main Index
- **Severity**: Low
- **File**: `typescript/src/index.ts` (lines 1-51)
- **Description**:
  The main SDK index.ts does not re-export react or wagmi integration types/functions. Users must import them via subpaths (`@radiustechsystems/sdk/react`, `@radiustechsystems/sdk/wagmi`). This is actually good API design for keeping the main export lightweight, but it's worth noting that these are separate bundles not available from the main entry point.

  Package.json correctly defines these as subpath exports (lines 73-97), and the types are generated. This is **not a problem** - just documenting the design.

- **Status**: Expected design, no fix needed.

---

### 8. Type Safety: Viem Types Are Properly Re-exported
- **Severity**: None (Positive Finding)
- **File**: `typescript/src/index.ts:10-18`
- **Description**:
  The SDK properly re-exports common viem types for convenience:
  ```typescript
  export type {
    Abi,
    Address,
    Chain,
    Hash,
    Hex,
    TransactionReceipt,
    Transport,
  } from 'viem';
  ```

  This provides good developer experience and maintains type alignment with viem v2.43.3.

- **Status**: Well-implemented.

---

### 9. Type Completeness: API Exports Are Comprehensive
- **Severity**: None (Positive Finding)
- **File**: `typescript/src/index.ts` (comprehensive review)
- **Description**:
  All major public APIs are properly exported:
  - ✓ Accounts module with Account class and options
  - ✓ Auth module with createPrivateKeySigner
  - ✓ Chains with radiusMainnet, radiusTestnet configs
  - ✓ Client with createRadiusClient and related types
  - ✓ Common utilities (ABI, address, hash, etc.)
  - ✓ Contracts module
  - ✓ Crypto utilities
  - ✓ Error types with proper error unions
  - ✓ Transport (WebSocket, interceptors)
  - ✓ Subpath exports: ./react, ./chains, ./events, ./server, ./wagmi

- **Status**: API surface is clean and complete.

---

### 10. Build Artifacts: Type Declarations Successfully Generated
- **Severity**: None (Positive Finding)
- **File**: `typescript/src/_types/` (verified)
- **Description**:
  All type declaration files (`.d.ts`) are successfully generated:
  - ✓ Main index.d.ts with all exports
  - ✓ Server subpath types in `_types/server/`
  - ✓ React subpath types in `_types/react/`
  - ✓ Wagmi subpath types in `_types/wagmi/`
  - ✓ All module-level type definitions present
  - ✓ Source maps generated for debugging

  The ESM build also completes successfully with all files present in `src/_esm/server/`.

- **Status**: Type generation working correctly.

---

## Severity Breakdown

| Level | Count | Issues |
|-------|-------|--------|
| Critical | 1 | Module resolution config mismatch preventing CJS builds |
| High | 3 | Loose types in server Handler (any types) |
| Medium | 2 | Unsafe type assertions in Kv, missing exports documentation |
| Low | 2 | Duplicate exports, minor redundancy |
| None | 3 | Positive findings |

---

## Recommendation

**Escalate: YES**

### Rationale
The **Critical** build failure (issue #1) must be fixed before the package can be distributed to npm. The current build fails on the CJS target with TypeScript configuration errors. This is a blocking issue.

The **High** severity issues (#2, #3) are related - they're all about loose typing in the server module Handler, which violates the strict TypeScript configuration and will cause failures when CJS build is fixed.

### Action Priority
1. **IMMEDIATE**: Fix module resolution in CJS build (Issue #1) - blocks distribution
2. **BEFORE RELEASE**: Fix all implicit `any` types in server Handler (Issues #2, #3) - required for strict mode compliance
3. **OPTIONAL**: Clean up duplicate exports (Issues #5, #6) - improves API clarity
4. **VERIFY**: Ensure all type definitions work correctly after fixes

### Commands to Verify Fix
```bash
# Test type checking
npm run check:types

# Test full build
npm run build

# Verify CommonJS output
ls src/_cjs/server/index.js  # Should exist after fix
```
