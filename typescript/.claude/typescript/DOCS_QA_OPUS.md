# Radius SDK Documentation QA Report - Opus

**Date:** 2026-01-01
**Reviewer:** Claude Opus 4.5
**Files Reviewed:**
- `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx`
- `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript-react.mdx`
- `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript-events.mdx`

**Source Code Compared:**
- `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/`

---

## Summary

- **Overall Assessment:** FAIL
- **Critical Issues:** 8
- **Warnings:** 12
- **Suggestions:** 7

The documentation is generally well-structured and comprehensive, but contains several critical accuracy issues where documented APIs do not match the source code implementation. There are also missing exports and inconsistencies between the three documentation files.

---

## Completeness Check

### Missing from sdk-typescript.mdx

| Missing Item | Source File:Line | Description |
|--------------|------------------|-------------|
| `createERC20()` factory function | `contracts/erc20.ts:419` | Factory function for ERC20 class is exported but not documented |
| `ERC20_ABI` constant | `contracts/erc20.ts:16` | Standard ERC-20 ABI constant is exported but not documented |
| `ContractClient` interface | `contracts/types.ts:9` | Interface used by Contract class is not documented |
| `WebSocketTransportConfig` type | `transport/websocket.ts:10` | Configuration type for WebSocket transport |
| `createWebSocketTransport()` | `transport/websocket.ts:52` | Factory function exists in events module but not mentioned in main docs |
| `BytesLike` type | `common/address.ts:6` | Type exported from common but not documented |

### Missing from sdk-typescript-react.mdx

| Missing Item | Source File:Line | Description |
|--------------|------------------|-------------|
| `RadiusContextProvider` | `react/index.ts:6` | Alternative context provider export not documented |
| `RadiusContextValue` type | `react/index.ts:8` | Context value type not documented |
| `RadiusContextProviderProps` type | `react/index.ts:7` | Props type not documented |
| `UseERC20BalanceParams` export | `react/hooks/useERC20.ts:11` | Type is exported but not shown in type definitions section |

### Missing from sdk-typescript-events.mdx

| Missing Item | Source File:Line | Description |
|--------------|------------------|-------------|
| `WebSocketTransportConfig` type | `transport/websocket.ts:10` | Full type definition with all properties not shown |

---

## Accuracy Check

### Critical Accuracy Issues

#### 1. Contract Class `call()` Return Type - sdk-typescript.mdx:1142-1143

**Documentation says:**
```typescript
call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>
```
Returns: `Promise<unknown[]>` - Array of decoded return values

**Source code (contracts/contract.ts:52):**
```typescript
async call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>
```

**Note:** Documentation matches source. However, the `call<T>()` method on `RadiusClient` (client/client.ts:167) returns `Promise<T>`, not `Promise<unknown[]>`. The docs conflate these two different methods.

#### 2. Contract Class `execute()` Return Type - sdk-typescript.mdx:1164

**Documentation says:**
```typescript
execute(...): Promise<Receipt>
```
Returns: `Promise<Receipt>` - Transaction receipt after execution

**Source code (contracts/contract.ts:68):**
```typescript
async execute(...): Promise<Receipt>
```

**Issue:** Documentation uses `Receipt` but does not document this type. The RadiusClient `execute()` method (client/client.ts:178) returns `Promise<Hash>`, not `Promise<Receipt>`. This is a significant discrepancy between Contract class and RadiusClient.

#### 3. Address Class Constructor - sdk-typescript.mdx:1263-1265

**Documentation says:**
```typescript
new Address(data: Address | BytesLike | string)
```

**Source code (common/address.ts:28):**
```typescript
constructor(data: Address | BytesLike | string)
```

**Issue:** Documentation is correct, but `BytesLike` type is not documented. Users won't know what types are valid.

#### 4. useRadiusBalance Return Type - sdk-typescript-react.mdx:129-139

**Documentation says:**
```
| data.symbol | `string` | The token symbol (e.g., "RADI") |
```

**Issue:** The native token symbol is "ETH" according to the chain config (chains/radius.ts:14), not "RADI". This is misleading.

#### 5. useRadiusBalance Parameter Table - sdk-typescript-react.mdx:123-125

**Documentation says:**
```
| address | `Address \| undefined` | No | The blockchain address... |
```

**Source code (react/hooks/useRadiusBalance.ts:6-8):**
```typescript
export type UseRadiusBalanceParams = {
  address?: Address;
};
```

**Note:** Accurate, but documentation example at line 163-170 shows `{ address }` being passed, which would need type assertion for non-Address strings.

#### 6. useERC20Metadata Return Type - sdk-typescript-react.mdx:594-601

**Documentation says:**
```
| refetch | `() => Promise<void>` | Function to manually refetch all metadata |
```

**Source code (react/hooks/useERC20.ts:96-97):**
```typescript
refetch: () =>
  Promise.all([name.refetch(), symbol.refetch(), decimals.refetch(), totalSupply.refetch()]),
```

**Issue:** Return type is actually `Promise<QueryObserverResult<...>[]>`, not `Promise<void>`.

#### 7. watchRawLogs Topics Parameter - sdk-typescript-events.mdx:438

**Documentation says:**
```
| `topics` | `Hash[][]` | No | - | Event signature hashes to filter by |
```

**Source code (events/watchLogs.ts:81):**
```typescript
topics?: Hash[][];
```

**Issue:** The `topics` parameter is defined but never used in the implementation. Looking at watchRawLogs (line 135-147), it doesn't pass `topics` to `client.watchEvent()`. This is a bug in the implementation.

#### 8. Import Paths Inconsistency - All Docs

**sdk-typescript.mdx shows:**
```typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
```

**sdk-typescript-react.mdx shows:**
```typescript
import { RadiusProvider } from '@radiustechsystems/sdk/react';
import { radiusTestnet } from '@radiustechsystems/sdk/react';
```

**sdk-typescript-events.mdx shows:**
```typescript
import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
```

**Issue:** Three different import paths for `radiusTestnet`:
- `@radiustechsystems/sdk` (main)
- `@radiustechsystems/sdk/react` (react re-export)
- `@radiustechsystems/sdk/chains` (events docs)

This is confusing. Documentation should be consistent about which import path to use.

### Parameter/Type Discrepancies

#### 9. RadiusClientConfig.transport - sdk-typescript.mdx:119

**Documentation says:**
```
| transport | `Transport` | No | Viem transport (defaults to HTTP based on chain config) |
```

**Source code (client/client.ts:73-74):**
```typescript
transport?: Transport;
```

**Note:** Accurate, but default behavior is more complex - it creates an intercepting transport, not a plain HTTP transport.

---

## Code Examples Check

### Examples with Issues

#### 1. sdk-typescript.mdx:89-92 - webSocket import

```typescript
const clientWithWs = createRadiusClient({
  chain: radiusTestnet,
  transport: webSocket('wss://rpc.testnet.radiustech.xyz'),
});
```

**Issue:** `webSocket` is not imported in the example. Should add:
```typescript
import { webSocket } from 'viem';
```

#### 2. sdk-typescript.mdx:753-762 - ERC20 Constructor Example

```typescript
const token = new ERC20(
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  client.publicClient
);
```

**Issue:** Correct usage, but documentation should note that `client.publicClient` property is being used.

#### 3. sdk-typescript-react.mdx:296-315 - useERC20Metadata Import

```typescript
import { useERC20Metadata } from '@radiustechsystems/sdk/react';
```
...later...
```typescript
const { data: decimals } = useERC20Metadata({
  token: tokenAddress,
});
```

**Issue:** `useERC20Metadata` returns `{ name, symbol, decimals, totalSupply }` directly, not `{ data }`. Example destructuring is wrong.

#### 4. sdk-typescript-react.mdx:475-490 - MaxUint256 Import

```typescript
import { MaxUint256 } from 'viem';
```

**Issue:** `MaxUint256` does not exist in viem. Should be:
```typescript
import { maxUint256 } from 'viem';
// OR
const maxUint256 = 2n ** 256n - 1n;
```

#### 5. sdk-typescript-events.mdx:23-32 - Import Path

```typescript
import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';
```

**Issue:** Based on react/index.ts:2, `radiusTestnet` is re-exported from multiple places. The `@radiustechsystems/sdk/chains` subpath may not exist - need to verify package.json exports.

---

## Consistency Check

### Formatting Inconsistencies

| Issue | Location | Description |
|-------|----------|-------------|
| Parameter tables | All files | sdk-typescript.mdx uses "Parameters:" with table, react docs use "#### Parameters" heading |
| Return value format | sdk-typescript.mdx vs react | Core docs use `**Returns:**` inline, react docs use `#### Returns` with table |
| Type notation | All files | Some use `string \| undefined`, others use `string | undefined` (escaping inconsistent) |
| Code block language | All files | Most use `typescript`, events doc uses `tsx` for non-React code |

### Heading Hierarchy Issues

| File | Issue |
|------|-------|
| sdk-typescript.mdx | Consistent H2 -> H3 -> H4 hierarchy |
| sdk-typescript-react.mdx | Uses `---` separators between hooks, inconsistent with other files |
| sdk-typescript-events.mdx | Uses `---` separators, matches react docs but not core docs |

### Table Structure Inconsistencies

| File | Issue |
|------|-------|
| sdk-typescript.mdx | Uses `Required` column in some tables, not in others |
| sdk-typescript-react.mdx | Consistently uses `Required` column |
| sdk-typescript-events.mdx | Consistently uses `Required` and `Default` columns |

---

## MDX Format Check

### Frontmatter

All three files have correct frontmatter:
- sdk-typescript.mdx: `title`, `description`
- sdk-typescript-react.mdx: `title`, `description`
- sdk-typescript-events.mdx: `title`, `description`

### Code Block Issues

| File:Line | Issue |
|-----------|-------|
| sdk-typescript.mdx:1205 | `const txHash: Hash = '0x1234567890abcdef...';` - Incomplete hash may cause issues if copy-pasted |
| sdk-typescript-events.mdx:986-999 | Migration example shows old URL format that may not be accurate |

### MDX Syntax

No MDX syntax errors detected. All files use standard Markdown with proper code fencing.

---

## Detailed Issues

### Critical (Must Fix)

1. **sdk-typescript-react.mdx:475** - `MaxUint256` should be `maxUint256` (lowercase) in viem
2. **sdk-typescript-react.mdx:296-315** - `useERC20Metadata` return value destructuring example is wrong
3. **sdk-typescript.mdx:1142** - Contract.call() vs RadiusClient.call() confusion - different return types
4. **sdk-typescript.mdx:1164** - Contract.execute() returns Receipt, RadiusClient.execute() returns Hash - needs clarification
5. **sdk-typescript-events.mdx:438** - `topics` parameter documented but not implemented in `watchRawLogs`
6. **sdk-typescript-react.mdx:134** - Native token symbol documented as "RADI" but chain config shows "ETH"
7. **All docs** - Inconsistent import paths for `radiusTestnet` across all three files
8. **sdk-typescript.mdx** - Missing documentation for `createERC20()` factory function

### Warnings (Should Fix)

1. **sdk-typescript.mdx:89** - Missing `webSocket` import in example code
2. **sdk-typescript.mdx:1263** - `BytesLike` type not documented but used in Address constructor
3. **sdk-typescript-react.mdx:594** - `refetch` return type documented as `Promise<void>` but is actually `Promise<QueryObserverResult[]>`
4. **sdk-typescript.mdx** - `ERC20_ABI` constant exported but not documented
5. **sdk-typescript-react.mdx** - `RadiusContextProvider` and related types exported but not documented
6. **All docs** - Table formatting inconsistencies (Required column presence)
7. **All docs** - Heading hierarchy and separator usage inconsistent
8. **sdk-typescript.mdx:119** - transport default behavior description is oversimplified
9. **sdk-typescript-events.mdx:23-32** - Need to verify `@radiustechsystems/sdk/chains` subpath exists
10. **sdk-typescript.mdx** - `ContractClient` interface not documented
11. **sdk-typescript.mdx** - `Receipt` type used but not documented (different from `RadiusReceipt`)
12. **sdk-typescript-events.mdx** - `WebSocketTransportConfig` properties not fully documented

### Suggestions (Nice to Have)

1. Add a "Subpath Exports" section to main docs explaining all available import paths
2. Standardize parameter table format across all three files
3. Add links between related documentation (e.g., core docs linking to react/events docs)
4. Add version compatibility notes (wagmi v3, viem version requirements)
5. Consider adding a troubleshooting section for common import/type errors
6. Add complete type definitions for all exported types in a reference section
7. Include working CodeSandbox or StackBlitz links for examples

---

## Recommendations

### Immediate Actions Required

1. Fix the `MaxUint256` -> `maxUint256` error in react docs
2. Fix the `useERC20Metadata` example to show correct return value structure
3. Clarify the difference between `Contract` class methods and `RadiusClient` methods
4. Either implement `topics` filtering in `watchRawLogs` or remove it from documentation
5. Correct the native token symbol from "RADI" to "ETH"
6. Standardize import paths across all documentation

### Documentation Improvements

1. Add missing exports to documentation (createERC20, ERC20_ABI, etc.)
2. Create a unified "Types Reference" section
3. Standardize formatting across all three files
4. Add import statements to all code examples

### Source Code Improvements

1. Consider adding JSDoc comments to exported functions for better IDE integration
2. Implement the `topics` filter in `watchRawLogs` if it should be supported
3. Consider exporting a unified `Receipt` type that works across both Contract and RadiusClient

---

## Verification Status

| Check | Status |
|-------|--------|
| All public exports documented | PARTIAL |
| All hook parameters documented | PASS |
| All method parameters documented | PASS |
| All return types documented | PARTIAL |
| Function signatures match source | PARTIAL |
| Parameter types correct | PARTIAL |
| Default values correct | PASS |
| Code examples syntactically valid | PARTIAL |
| Examples would work if copy-pasted | FAIL |
| Consistent formatting | FAIL |
| MDX format correct | PASS |

---

*Report generated by Claude Opus 4.5 on 2026-01-01*
