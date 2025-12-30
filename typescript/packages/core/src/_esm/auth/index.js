/**
 * The auth package provides interfaces and implementations for signing transactions and messages.
 * It includes multiple signer implementations for different security requirements and key management strategies.
 *
 * @example
 * ```typescript
 * import {
 *   RadiusSigner,
 *   PrivateKeySigner,
 *   ClefSigner,
 *   createPrivateKeySigner,
 *   createClefSigner,
 * } from '@aspect/radius-sdk';
 *
 * // Create a private key signer
 * const privateKeySigner = createPrivateKeySigner(
 *   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
 *   1 // mainnet
 * );
 *
 * // Create a Clef signer
 * const clefSigner = createClefSigner(
 *   '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
 *   1, // mainnet
 *   'http://localhost:8550'
 * );
 * ```
 */
// Export ClefSigner
export { ClefSigner, createClefSigner } from './clef/signer';
// Export PrivateKeySigner
export { createPrivateKeySigner, PrivateKeySigner } from './privatekey/signer';
//# sourceMappingURL=index.js.map
