# Handoff: SDK Audit

## What Was Done

The SDK underwent an aggressive cleanup to remove non-standard patterns:

### Removed (Non-Standard)
- `ERC20` class — Use `client.getContract()` with viem's `erc20Abi`
- `Contract` class — Use `client.getContract()`
- `Account` class — Use viem's `LocalAccount` directly
- `ABI` class — Use viem's ABI utilities
- `Transaction`, `SignedTransaction` classes — Use viem types
- `createPrivateKeySigner` — Re-export viem's `privateKeyToAccount`
- `common/` module — Redundant wrappers around viem
- `crypto/` module — Redundant wrappers around viem
- `auth/` module — Just wrapped viem functions

### What Remains
```
typescript/src/
├── chains/          # Chain definitions (radiusTestnet, radiusMainnet)
├── client/          # RadiusClient with gasPrice: 0 handling
├── contracts/       # TypedContract helper for getContract()
├── errors/          # Error classes
├── events/          # Event watching utilities
├── react/           # React hooks (wagmi-based)
├── transport/       # Custom transport with interceptor
├── wagmi/           # Wagmi connector
├── webauthn/        # WebAuthn credential management
└── index.ts         # Main exports
```

---

## What Needs Auditing

### 1. Pattern Compliance

**Question:** Does the SDK feel native to viem/wagmi developers?

Check against:
- `/tmp/viem` — How does viem structure clients, contracts, types?
- `/tmp/wagmi` — How does wagmi structure hooks, connectors?
- `/tmp/tempo-ts` — How does Tempo extend viem for their chain?

### 2. Code Quality

**Question:** Is there technical debt hiding in the codebase?

Look for:
- Fake tests that just `expect(true).toBe(true)`
- Tests that mock everything and test nothing
- `// TODO` comments
- Commented-out code
- Overly complex abstractions
- Copy-pasted code

### 3. Orphan Code

**Question:** Is there dead code that should be removed?

Look for:
- Files not imported anywhere
- Exports not used anywhere
- Functions defined but never called
- Types defined but never used

### 4. Missing Pieces

**Question:** Is anything missing that should exist?

Check:
- Are all public APIs documented with JSDoc?
- Are there tests for all public APIs?
- Are error messages helpful?
- Is TypeScript autocomplete working correctly?

### 5. React Hooks

**Question:** Do the React hooks follow wagmi patterns?

The SDK has ERC20 hooks in `src/react/hooks/useERC20.ts`. Audit:
- Do they follow wagmi's hook patterns?
- Are they necessary, or should users just use wagmi directly?
- Do they add value or just add API surface?

### 6. WebAuthn Module

**Question:** Is this module production-ready?

Located at `src/webauthn/`. This handles WebAuthn credential storage. Audit:
- Is it well-tested?
- Is it documented?
- Does it follow best practices?

### 7. Wagmi Connector

**Question:** Is the connector standard?

Located at `src/wagmi/connector.ts`. Audit:
- Does it follow wagmi's connector patterns?
- Is it necessary, or can users use standard wagmi connectors?

---

## Known Issues to Investigate

1. **Error messages** — Some errors just say "Invalid params" with no context
2. **React hooks** — May be thin wrappers that add no value
3. **WebAuthn naming** — Module is called "webauthn" but exported as "server"
4. **Peer dependency warnings** — Users report warnings during install

---

## Success Criteria

After the audit, a viem/wagmi developer should be able to:

1. Install the SDK without warnings
2. Use familiar patterns (no new concepts to learn)
3. Get helpful error messages when something goes wrong
4. Have full TypeScript autocomplete
5. Trust that the SDK is well-tested and production-ready

---

## Reference

| Resource | Location |
|----------|----------|
| SDK source | `/Users/fox/Getting Started/radius-sdk/typescript` |
| viem source | `/tmp/viem` |
| wagmi source | `/tmp/wagmi` |
| tempo-ts source | `/tmp/tempo-ts` |
