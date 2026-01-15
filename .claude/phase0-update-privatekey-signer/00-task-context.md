# Task Context: Update PrivateKeySigner to Return LocalAccount

## Plan Reference
- **Plan ID**: 0.3
- **Phase**: 0 (SDK Cleanup)
- **Dependencies**: 0.1 (RadiusSigner removed)

## Original Request
Update `PrivateKeySigner` to return viem's `LocalAccount` directly instead of implementing a custom `RadiusSigner` interface.

## Current State
- `PrivateKeySigner` class implements `RadiusSigner` interface
- Internally uses `privateKeyToAccount()` from viem but wraps it
- We want to simplify: just return the viem account directly

## Files to Modify
- `typescript/src/auth/privatekey/signer.ts`

## What to Do
1. Remove the `RadiusSigner` import and `implements RadiusSigner`
2. Change `createPrivateKeySigner()` to simply return `privateKeyToAccount(privateKey)`
3. The function should return `LocalAccount` type from viem
4. Remove or deprecate the `PrivateKeySigner` class (users should use viem directly)
5. Update JSDoc to reflect new behavior

## Expected Result
```typescript
import { privateKeyToAccount } from 'viem/accounts';
import type { LocalAccount, Hex } from 'viem';

export function createPrivateKeySigner(privateKey: Hex): LocalAccount {
  return privateKeyToAccount(privateKey);
}
```

Note: The chainId parameter is no longer needed because viem's LocalAccount handles signing without requiring chainId upfront.

## Acceptance Criteria
- Function returns viem `LocalAccount` directly
- No more `RadiusSigner` references
- File compiles (may break downstream, that's expected)
