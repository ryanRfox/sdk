# Task Context: Update Auth and Main Exports

## Plan Reference
- **Plan IDs**: 0.4, 0.5
- **Phase**: 0 (SDK Cleanup)
- **Dependencies**: 0.2 (ClefSigner removed), 0.3 (PrivateKeySigner simplified)

## Original Request
Update the export files to remove references to deleted code and reflect the new simplified API.

## Files to Modify

### 1. `typescript/src/auth/index.ts`
Current broken exports:
- Line 31: `export { ClefSigner, createClefSigner } from './clef/signer'` - DELETED
- Line 34: `export { createPrivateKeySigner, PrivateKeySigner }` - PrivateKeySigner class no longer exists
- Lines 36-40: exports `ClefSignerConfig`, `RadiusSigner` - DELETED from types.ts

**New exports should be:**
```typescript
/**
 * The auth package provides utilities for creating signing accounts.
 * Uses viem's LocalAccount for all signing operations.
 */

// Export the factory function
export { createPrivateKeySigner } from './privatekey/signer';

// Re-export LocalAccount type from viem for convenience
export type { LocalAccount } from 'viem';
```

### 2. `typescript/src/index.ts`
Current broken exports (lines 23-31):
```typescript
export {
  ClefSigner,           // DELETED
  type ClefSignerConfig, // DELETED
  createClefSigner,      // DELETED
  createPrivateKeySigner,
  PrivateKeySigner,      // CLASS REMOVED
  type PrivateKeySignerConfig, // Can keep or remove
  type RadiusSigner,     // DELETED
} from './auth';
```

**New exports should be:**
```typescript
// Auth / Signers
export { createPrivateKeySigner } from './auth';
export type { LocalAccount } from 'viem';
```

## Acceptance Criteria
- No references to ClefSigner, createClefSigner, ClefSignerConfig
- No references to PrivateKeySigner class
- No references to RadiusSigner
- createPrivateKeySigner is exported
- LocalAccount type is re-exported for user convenience
- Both files have valid TypeScript syntax
