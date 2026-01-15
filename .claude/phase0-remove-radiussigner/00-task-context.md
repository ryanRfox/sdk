# Task Context: Remove RadiusSigner Interface

## Plan Reference
- **Plan ID**: 0.1
- **Phase**: 0 (SDK Cleanup)
- **Dependencies**: None

## Original Request
Remove the `RadiusSigner` interface from `src/auth/types.ts`. The SDK is migrating to use viem's `LocalAccount` directly instead of a custom signer abstraction.

## Files to Modify
- `typescript/src/auth/types.ts` - Remove `RadiusSigner` interface and `ClefSignerConfig` type

## What to Keep
- Keep viem type imports
- Keep `PrivateKeySignerConfig` interface (will be updated in task 0.3)

## Acceptance Criteria
- `RadiusSigner` interface removed
- `ClefSignerConfig` interface removed
- File still compiles (may have downstream errors, that's OK)
- No other changes to the file
