# Task Context: Update Client to Use LocalAccount

## Plan Reference
- **Plan ID**: 0.6
- **Phase**: 0 (SDK Cleanup)
- **Dependencies**: 0.3

## Original Request
Update `client.ts` to use viem's `LocalAccount` type instead of the custom `RadiusSigner` interface.

## Files to Modify
- `typescript/src/client/client.ts`

## What to Do
1. Remove `import type { RadiusSigner } from '../auth';` (line 33)
2. Add `import type { LocalAccount } from 'viem';` to the existing viem imports
3. Replace all `RadiusSigner` type references with `LocalAccount`:
   - Interface method signatures (execute, executeAndWait, send, sendAndWait, deployContract, etc.)
   - Internal function parameters (signAndSendTransaction)
4. Update the signAndSendTransaction function to work with LocalAccount:
   - LocalAccount has `.address` property (same as before)
   - LocalAccount has `.signTransaction()` method that returns signed tx
   - Note: chainId should come from the client's chain config, not the signer

## Key Difference
- `RadiusSigner` had `chainId` property
- `LocalAccount` does not have `chainId` - it should come from `publicClient.chain.id`

Update `signAndSendTransaction` to use `config.chain.id` for the chainId instead of `signer.chainId`.

## Acceptance Criteria
- No `RadiusSigner` imports or references
- All signer parameters typed as `LocalAccount`
- signAndSendTransaction uses chain config for chainId
- File compiles
