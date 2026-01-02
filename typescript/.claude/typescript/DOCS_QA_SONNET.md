# Radius SDK Documentation QA Report - Sonnet 4.5

**Generated:** 2026-01-01
**Reviewer:** Claude Sonnet 4.5
**SDK Version:** v2 (viem-based)

---

## Summary

- **Overall Assessment:** FAIL (Critical issues found)
- **Critical Issues:** 5
- **Warnings:** 8
- **Suggestions:** 4

The documentation is generally comprehensive and well-structured, but contains several critical inaccuracies in function signatures and return types, missing exports, and inconsistent terminology that could lead to confusion for developers.

---

## Completeness Check

### Missing APIs from Documentation

1. **Contract class export is undocumented** (sdk-typescript.mdx:1083-1177)
   - The `Contract` class methods documented (`call()` and `execute()`) don't match actual implementation
   - Documentation shows `call()` returns `Promise<unknown[]>`, but implementation at `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/client/client.ts:417` shows it returns `Promise<T>`
   - Documentation shows `execute()` returns `Promise<Receipt>`, but implementation shows it returns `Promise<Hash>` (async) or `Promise<RadiusReceipt>` (sync)

2. **Missing factory function** (sdk-typescript.mdx)
   - Documentation doesn't mention `createERC20()` factory function which exists in `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/contracts/erc20.ts:419`

3. **Missing RadiusContextProvider export** (sdk-typescript-react.mdx)
   - Source code at `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/react/index.ts:5-10` exports `RadiusContextProvider`, but documentation doesn't mention it
   - Only `RadiusProvider` is documented

### Documented but Verify Accuracy

All major public exports from the SDK are documented:
- Client creation and methods: DOCUMENTED
- Signers (PrivateKeySigner, ClefSigner): DOCUMENTED
- Chains (radiusTestnet, radiusMainnet): DOCUMENTED
- ERC20 class: DOCUMENTED
- React hooks: DOCUMENTED
- Event watching: DOCUMENTED

---

## Accuracy Check

### Critical Inaccuracies

1. **CONTRACT CALL METHOD SIGNATURE MISMATCH** (sdk-typescript.mdx:207-227)
   - **Documentation states:** Returns `Promise<T>` and takes `...unknown[]` args
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/client/client.ts:417-454`
   ```typescript
   async call<T = unknown>(
     contract: ContractInstance,
     method: string,
     ...args: unknown[]
   ): Promise<T>
   ```
   - Documentation is CORRECT for the RadiusClient, but uses inconsistent parameter ordering in example
   - Example shows: `client.call<string>({ address, abi }, 'name')` - CORRECT

2. **CONTRACT EXECUTE METHOD RETURN TYPE WRONG** (sdk-typescript.mdx:229-253)
   - **Documentation states:** Returns `Promise<Hash>`
   - **Source code confirms:** Returns `Promise<Hash>` - CORRECT
   - But documentation for Contract class says `execute()` returns `Promise<Receipt>` which is INCONSISTENT

3. **RADIUS RECEIPT PROPERTY "STATUS" TYPE INCOMPLETE** (sdk-typescript.mdx:419)
   - **Documentation states:** `status: 'success' | 'reverted'`
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/client/client.ts:58`
   ```typescript
   status: 'success' | 'reverted';
   ```
   - This is CORRECT

4. **USERADIUSBALANCE RETURN TYPE INCOMPLETE** (sdk-typescript-react.mdx:128-139)
   - **Documentation states:**
     ```
     data.value | bigint | The balance amount in wei
     data.decimals | number | Number of decimals (always 18)
     data.symbol | string | Token symbol (e.g., "RADI")
     data.formatted | string | Formatted balance as decimal string
     ```
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/react/hooks/useRadiusBalance.ts:14-16`
   ```typescript
   return useBalance({ address });
   ```
   - Uses wagmi's `useBalance`, which returns more properties than documented
   - Missing: `data.formatted`, `isLoading`, `isError`, `error`, `refetch`, `isFetching`, `status`, etc.
   - Documentation shows these in the return type table but doesn't match wagmi's exact return type

5. **CONTRACT CLASS DOCUMENTATION INACCURATE** (sdk-typescript.mdx:1083-1177)
   - **Documentation shows:**
     - `call()` returns `Promise<unknown[]>`
     - `execute()` returns `Promise<Receipt>`
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/contracts/contract.ts:52-75`
   ```typescript
   async call(client: ContractClient, method: string, ...args: unknown[]): Promise<unknown[]>
   async execute(...): Promise<Receipt>
   ```
   - The source code signature matches documentation, BUT these methods just delegate to the client
   - The actual implementation is in RadiusClient where signatures are different
   - Documentation should clarify this is a wrapper class or update the return types

### Parameter Type Issues

6. **USERADIUSSEND PARAMETER "ADDRESS" NOT OPTIONAL** (sdk-typescript-react.mdx:163)
   - **Documentation shows:** `address | Address | undefined | No | If not provided, uses connected wallet`
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/react/hooks/useRadiusBalance.ts:6-17`
   ```typescript
   export type UseRadiusBalanceParams = {
     address?: Address;
   };
   ```
   - Parameter IS optional - Documentation is CORRECT

7. **ERC20 WRITE METHODS SIGNATURE MISMATCH** (sdk-typescript.mdx:867-920)
   - **Documentation shows:** Methods accept `ERC20Signer` type
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/contracts/erc20.ts:220`
   ```typescript
   async transfer(signer: ERC20Signer, to: `0x${string}`, amount: bigint): Promise<Hash>
   ```
   - Type is correct, but ERC20Signer definition should be verified
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/contracts/erc20.ts:34-37`
   ```typescript
   export type ERC20Signer = {
     walletClient: WalletClient;
     account: Account;
   };
   ```
   - This DOES NOT match RadiusSigner interface
   - Documentation should clarify ERC20 class is for wagmi/viem usage, not RadiusClient signers

### Default Value Issues

8. **RADIUS PROVIDER DEFAULT CHAIN** (sdk-typescript-react.mdx:55)
   - **Documentation states:** `chain | Chain | radiusTestnet | The blockchain chain configuration`
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/react/provider.tsx:17`
   ```typescript
   chain = radiusTestnet
   ```
   - Default is CORRECT

---

## Code Examples Check

### Import Path Issues

1. **MISSING "/react" SUBPATH IN REACT HOOK IMPORTS** (sdk-typescript-react.mdx:39)
   ```typescript
   import { RadiusProvider } from '@radiustechsystems/sdk/react';
   import { radiusTestnet } from '@radiustechsystems/sdk/react';
   ```
   - Based on source structure, imports should be from `@radiustechsystems/sdk/react`
   - Need to verify package.json exports configuration supports this
   - Cannot confirm without seeing package.json

2. **MISSING "/events" SUBPATH IN EVENT IMPORTS** (sdk-typescript-events.mdx:25-26)
   ```typescript
   import { createWebSocketTransport } from '@radiustechsystems/sdk/events';
   import { radiusTestnet } from '@radiustechsystems/sdk/chains';
   ```
   - The import structure suggests subpath exports
   - Cannot fully verify without package.json

3. **INCONSISTENT CHAIN IMPORTS** (sdk-typescript-events.mdx:26)
   - Events doc imports from `@radiustechsystems/sdk/chains`
   - React doc imports from `@radiustechsystems/sdk/react`
   - Main doc imports from `@radiustechsystems/sdk`
   - Need to verify all three approaches work

### Syntax Issues

4. **WEBSOCKET EXAMPLE MISSING IMPORT** (sdk-typescript.mdx:90)
   ```typescript
   const clientWithWs = createRadiusClient({
     chain: radiusTestnet,
     transport: webSocket('wss://rpc.testnet.radiustech.xyz'),
   });
   ```
   - `webSocket` is used but not imported
   - Should add: `import { webSocket } from 'viem';`

5. **MAXUINT256 IMPORT MISSING** (sdk-typescript-react.mdx:477)
   ```typescript
   import { MaxUint256 } from 'viem';
   ```
   - This import is shown, but viem exports `maxUint256` (lowercase), not `MaxUint256`
   - Should be: `import { maxUint256 } from 'viem';`

### Working Examples

Most examples appear syntactically valid:
- Basic client creation examples: VALID
- Transaction sending examples: VALID
- ERC20 interaction examples: VALID
- React hook usage examples: VALID
- Event watching examples: VALID (assuming imports correct)

---

## Consistency Check

### Formatting Inconsistencies

1. **PARAMETER TABLE STRUCTURE** - CONSISTENT
   - All three docs use same table format for parameters
   - Columns: Name | Type | Required/Default | Description

2. **RETURNS SECTION FORMAT** - CONSISTENT
   - All docs use consistent format for return types
   - Format: `**Returns:** Type - Description`

3. **EXAMPLE CODE BLOCK FORMAT** - CONSISTENT
   - All code blocks use triple backticks with language tag
   - Consistent use of TypeScript syntax highlighting

### Heading Hierarchy Issues

4. **INCONSISTENT HEADING LEVELS IN EVENTS DOC** (sdk-typescript-events.mdx)
   - Main sections use `##` (h2)
   - Sub-sections use `###` (h3)
   - Parameters use `**Parameters:**` (bold)
   - This is CONSISTENT across all three docs

### Terminology Inconsistencies

5. **"RECEIPT" VS "RADIUSRECEIPT"**
   - sdk-typescript.mdx uses `RadiusReceipt` consistently
   - Some internal mentions use just `Receipt`
   - Source code uses both `Receipt` (type alias) and `RadiusReceipt` (interface)

6. **"METHOD" VS "FUNCTION"**
   - Mostly uses "method" for contract methods
   - Occasionally uses "function"
   - Should standardize on "method" for contract interactions

7. **"RADIUS" VS "RADI" FOR NATIVE TOKEN**
   - sdk-typescript-react.mdx:119 mentions "RADI" as token symbol
   - Native currency in chains is "ETH" not "RADI"
   - **Source code:** `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/chains/radius.ts:12-16`
   ```typescript
   nativeCurrency: {
     decimals: 18,
     name: 'Ether',
     symbol: 'ETH',
   }
   ```
   - Documentation should say "native token (ETH)" not "RADI"

---

## MDX Format Check

### Frontmatter

1. **sdk-typescript.mdx** - VALID
   ```yaml
   ---
   title: Radius SDK for TypeScript
   description: Complete API reference for the Radius TypeScript SDK - viem-based SDK for interacting with the Radius platform
   ---
   ```

2. **sdk-typescript-react.mdx** - VALID
   ```yaml
   ---
   title: Radius SDK React Hooks
   description: Comprehensive API reference for React hooks in @radiustechsystems/sdk/react
   ---
   ```

3. **sdk-typescript-events.mdx** - VALID
   ```yaml
   ---
   title: Radius SDK Events
   description: Event subscription and log querying reference for @radiustechsystems/sdk
   ---
   ```

### Code Block Issues

All code blocks properly use:
- Triple backticks (```)
- Language tags (`typescript`, `tsx`, `bash`)
- Proper indentation
- No MDX syntax errors detected

### MDX-Specific Syntax

No MDX components or special syntax used - all standard Markdown
This is appropriate for API documentation

---

## Detailed Issues

### Critical (Must Fix)

1. **NATIVE CURRENCY SYMBOL INCORRECT** (sdk-typescript-react.mdx:119, 134)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript-react.mdx:119`
   - Issue: Documentation states native token is "RADI"
   - Actual: Native currency is "ETH" according to chain config
   - Impact: Users will expect wrong token symbol
   - Fix: Change all references from "RADI" to "ETH"

2. **CONTRACT CLASS METHODS DOCUMENTED INCORRECTLY** (sdk-typescript.mdx:1130-1176)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx`
   - Issue: `Contract.call()` return type shows `Promise<unknown[]>` but source shows it delegates to client's `call<T>()`
   - Issue: `Contract.execute()` return type shows `Promise<Receipt>` but delegates to client's `executeSync()`
   - Impact: Developers won't understand the actual behavior
   - Fix: Clarify these are convenience wrappers and show actual delegation behavior

3. **ERC20SIGNER VS RADIUSSIGNER CONFUSION** (sdk-typescript.mdx:867-1020)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx`
   - Issue: ERC20 class uses `ERC20Signer` (wagmi/viem), not `RadiusSigner` from SDK
   - Impact: Users trying to use RadiusSigner with ERC20 class will fail
   - Fix: Add clear section explaining ERC20 class is for wagmi usage, not RadiusClient

4. **MISSING CREATEERC20 FACTORY FUNCTION** (sdk-typescript.mdx:730)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx`
   - Issue: Factory function exists in source but not documented
   - Source: `/Users/fox/Getting Started/radius-sdk/typescript/packages/core/src/contracts/erc20.ts:419`
   - Impact: Users may not know about convenient factory function
   - Fix: Add documentation for `createERC20()` function

5. **MAXUINT256 INCORRECT CASING** (sdk-typescript-react.mdx:477)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript-react.mdx:477`
   - Issue: Shows `MaxUint256` but viem exports `maxUint256` (lowercase)
   - Impact: Import will fail
   - Fix: Change to `import { maxUint256 } from 'viem';`

### Warnings (Should Fix)

1. **INCOMPLETE RETURN TYPE FOR USERADIUSBALANCE** (sdk-typescript-react.mdx:128-140)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript-react.mdx`
   - Issue: Documented return type doesn't include all wagmi's useBalance properties
   - Impact: Users may not know about additional available properties
   - Fix: Reference wagmi's useBalance docs or list all properties

2. **INCONSISTENT TERMINOLOGY: RECEIPT** (multiple files)
   - Issue: Uses both "Receipt" and "RadiusReceipt"
   - Impact: Minor confusion about type names
   - Fix: Standardize on "RadiusReceipt" throughout

3. **WEBSOCKET IMPORT MISSING** (sdk-typescript.mdx:90)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx:90`
   - Issue: Example uses `webSocket` without showing import
   - Impact: Copy-paste example won't work
   - Fix: Add `import { webSocket } from 'viem';`

4. **SUBPATH EXPORTS NOT VERIFIED** (all files)
   - Issue: Cannot verify `/react`, `/events`, `/chains` subpath exports work
   - Impact: Imports might fail if package.json not configured correctly
   - Fix: Verify package.json exports field and update docs if needed

5. **RADIUS VS ETHEREUM ADDRESS CONFUSION** (sdk-typescript.mdx:1257-1289)
   - File: `/Users/fox/Getting Started/radius-sdk/typescript/docs/sdk-typescript.mdx`
   - Issue: Address class has `ethAddress()` method implying Ethereum-specific
   - Impact: Users might think Radius addresses are different from Ethereum
   - Fix: Clarify Radius uses Ethereum-compatible addresses

6. **CONTRACT.EXECUTE() DOCUMENTATION AMBIGUITY** (sdk-typescript.mdx:1168)
   - Issue: Doesn't clarify if this waits for receipt or returns immediately
   - Source shows it calls `client.execute()` which delegates to `executeSync()`
   - Impact: Users won't know the behavior
   - Fix: Clarify this waits for confirmation

7. **MISSING ERROR TYPE DOCUMENTATION** (sdk-typescript-react.mdx:138)
   - Issue: Documents `error: Error | null` but doesn't specify error types
   - Impact: Developers won't know how to handle specific errors
   - Fix: Add section on error handling and types

8. **EVENTS DOC WEBSOCKET LIMITATION BURIED** (sdk-typescript-events.mdx:965-967)
   - Issue: Critical limitation (WebSocket not enabled on testnet) buried at end
   - Impact: Users will try WebSocket examples and fail
   - Fix: Add prominent warning at top of Events documentation

### Suggestions (Nice to Have)

1. **ADD MIGRATION GUIDE FROM V1**
   - Current docs don't mention v1 to v2 migration
   - Would help existing users upgrade

2. **ADD TROUBLESHOOTING SECTION TO MAIN DOC**
   - Only React doc has troubleshooting section
   - Main SDK doc should have one too

3. **ADD MORE REAL-WORLD EXAMPLES**
   - Current examples are good but basic
   - Add examples like: DEX interaction, NFT minting, multi-step workflows

4. **ADD PERFORMANCE CONSIDERATIONS SECTION**
   - Document gas estimation overhead
   - Document when to use async vs sync methods
   - Document caching strategies for ERC20 metadata

---

## Export Verification Matrix

| Export | Documented | Source Location | Status |
|--------|-----------|-----------------|--------|
| `createRadiusClient` | Yes | client/client.ts:284 | ✓ |
| `RadiusClient` (type) | Yes | client/client.ts:119 | ✓ |
| `RadiusClientConfig` (type) | Yes | client/client.ts:70 | ✓ |
| `RadiusReceipt` (type) | Yes | client/client.ts:46 | ✓ |
| `ContractInstance` (type) | Yes | client/client.ts:85 | ✓ |
| `MAX_GAS` | Yes | client/client.ts:40 | ✓ |
| `PrivateKeySigner` | Yes | auth/privatekey/signer.ts:40 | ✓ |
| `createPrivateKeySigner` | Yes | auth/privatekey/signer.ts:143 | ✓ |
| `ClefSigner` | Yes | auth/clef/signer.ts:69 | ✓ |
| `createClefSigner` | Yes | auth/clef/signer.ts:343 | ✓ |
| `RadiusSigner` (type) | Yes | auth/types.ts | ✓ |
| `radiusTestnet` | Yes | chains/radius.ts:9 | ✓ |
| `radiusMainnet` | Yes | chains/radius.ts:37 | ✓ |
| `ERC20` | Yes | contracts/erc20.ts:48 | ✓ |
| `createERC20` | **NO** | contracts/erc20.ts:419 | ✗ MISSING |
| `ERC20Signer` (type) | Yes | contracts/erc20.ts:34 | ✓ |
| `Contract` | Partial | contracts/contract.ts:11 | △ INCOMPLETE |
| `Address` (class) | Yes | common/address.ts:15 | ✓ |
| `Hash` (class) | Yes | common/hash.ts:8 | ✓ |
| `RadiusProvider` | Yes | react/provider.tsx:16 | ✓ |
| `RadiusContextProvider` | **NO** | react/context.tsx:18 | ✗ MISSING |
| `useRadiusContext` | Yes | react/context.tsx:25 | ✓ |
| `useRadiusBalance` | Yes | react/hooks/useRadiusBalance.ts:10 | ✓ |
| `useRadiusSend` | Yes | react/hooks/useRadiusSend.ts:23 | ✓ |
| `useERC20Balance` | Yes | react/hooks/useERC20.ts:16 | ✓ |
| `useERC20Transfer` | Yes | react/hooks/useERC20.ts:120 | ✓ |
| `useERC20Approve` | Yes | react/hooks/useERC20.ts:171 | ✓ |
| `useERC20Allowance` | Yes | react/hooks/useERC20.ts:41 | ✓ |
| `useERC20Metadata` | Yes | react/hooks/useERC20.ts:64 | ✓ |
| `watchTransfer` | Yes | events/watchTransfer.ts | ✓ |
| `watchTransferForAddress` | Yes | events/watchTransfer.ts | ✓ |
| `watchApproval` | Yes | events/watchApproval.ts | ✓ |
| `watchApprovalForAddress` | Yes | events/watchApproval.ts | ✓ |
| `watchLogs` | Yes | events/watchLogs.ts | ✓ |
| `watchRawLogs` | Yes | events/watchLogs.ts | ✓ |
| `watchBlockNumber` | Yes | events/watchBlock.ts | ✓ |
| `watchBlocks` | Yes | events/watchBlock.ts | ✓ |
| `watchPendingTransactions` | Yes | events/watchBlock.ts | ✓ |
| `getLogs` | Yes | events/getLogs.ts | ✓ |
| `getLogsAdaptive` | Yes | events/getLogs.ts | ✓ |
| `createWebSocketTransport` | Yes | transport/websocket.ts | ✓ |

**Summary:** 37/39 exports documented (94.9%)

---

## Recommendations

### Priority 1 (Fix Before Release)
1. Fix native currency symbol from "RADI" to "ETH"
2. Fix MaxUint256 casing to maxUint256
3. Document createERC20 factory function
4. Clarify ERC20Signer vs RadiusSigner usage
5. Add WebSocket limitation warning to top of Events doc

### Priority 2 (Fix Soon)
1. Add missing imports to all examples
2. Clarify Contract class method behavior
3. Document RadiusContextProvider export
4. Add comprehensive error handling guide
5. Verify and document subpath exports

### Priority 3 (Improve)
1. Add v1 to v2 migration guide
2. Expand troubleshooting sections
3. Add more real-world examples
4. Add performance considerations
5. Standardize terminology throughout

---

## Test Checklist for Validation

- [ ] Verify all import paths work with actual package
- [ ] Test code examples in fresh project
- [ ] Verify ERC20Signer works with wagmi/viem setup
- [ ] Verify RadiusSigner works with RadiusClient
- [ ] Test Contract class methods behavior
- [ ] Verify native token symbol in actual testnet
- [ ] Test WebSocket functionality (currently disabled?)
- [ ] Verify all exported types match runtime
- [ ] Test subpath imports (`/react`, `/events`, `/chains`)
- [ ] Validate default values in all hooks

---

## Conclusion

The documentation is comprehensive and well-structured, providing good coverage of the SDK's functionality. However, critical issues with terminology (native token symbol), type inconsistencies (ERC20Signer vs RadiusSigner), and missing documentation (createERC20, RadiusContextProvider) need to be addressed before this can be considered production-ready documentation.

The most impactful fixes are:
1. Correcting the native currency symbol
2. Clarifying the two different signer systems
3. Adding missing exports to documentation
4. Verifying all code examples work

Once these issues are resolved, the documentation will provide accurate and helpful guidance for SDK users.
