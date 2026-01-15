# Task Context: Remove ClefSigner

## Plan Reference
- **Plan ID**: 0.2
- **Phase**: 0 (SDK Cleanup)
- **Dependencies**: None

## Original Request
Remove the `src/auth/clef/` directory entirely. ClefSigner is not needed - Radius is not Geth-specific and the SDK is migrating to use viem's LocalAccount directly.

## Files to Delete
- `typescript/src/auth/clef/signer.ts`
- `typescript/src/auth/clef/index.ts`
- `typescript/src/auth/clef/` directory

## Acceptance Criteria
- Entire `clef/` directory removed
- No ClefSigner code remains in the auth module
