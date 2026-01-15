# Changelog

All notable changes to the Radius TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-alpha.1] - 2026-01-15

### Breaking Changes
- Replaced `RadiusSigner` with viem's `LocalAccount`
- Removed `ClefSigner` and `createClefSigner`
- Removed `chainId` parameter from `createPrivateKeySigner`
- Package renamed from `@aspect-build/radius-sdk` to `@radiustechsystems/sdk`

### Added
- Full viem integration for EVM compatibility
- React hooks: `useRadiusBalance`, `useRadiusSend`, ERC-20 hooks
- Server handlers: `Handler.keyManager()`, `Handler.compose()`
- KV stores: `Kv.memory()`, `Kv.cloudflare()`
- wagmi connector: `privateKeyConnector()`
- Events module: `watchTransfer`, `watchApproval`, `getLogs`, etc.
- Subpath exports: `/chains`, `/react`, `/events`, `/server`, `/wagmi`
- Auto-generated API documentation with TypeDoc

### Changed
- Client methods now use viem types throughout
- Error hierarchy improved with structured errors
- Documentation auto-generated from JSDoc

### Removed
- `RadiusSigner` interface (use `LocalAccount` from viem)
- `ClefSigner` class
- `createClefSigner` function
- `feePayer` handler (not possible on standard EVM - see docs)

## [1.0.0]

### Added
- Initial SDK implementation
- Radius client creation
- Account management
- Contract deployment and interaction
