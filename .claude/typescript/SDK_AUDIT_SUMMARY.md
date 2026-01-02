# Radius v2 TypeScript SDK - Executive Summary

## Quick Facts

| Aspect | Details |
|--------|---------|
| **Version** | 2.0.0-alpha.0 |
| **Language** | TypeScript (strict mode) |
| **Target** | ES2022 |
| **Module Type** | ESM (with CJS fallback) |
| **Node Version** | >=22 |
| **Main Dependency** | viem ^2.0.0 |
| **No Dependencies** | ethers.js, web3.js (only viem) |
| **Package** | @radiustechsystems/sdk |
| **Total Source Files** | 49 TypeScript files |
| **Build Outputs** | ESM, CJS, Type declarations |

## Core API at a Glance

### Creating a Client
```typescript
import { createRadiusClient } from '@radiustechsystems/sdk';
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

const client = createRadiusClient({ chain: radiusTestnet });
```

### Creating a Signer
```typescript
// Private key (development)
import { createPrivateKeySigner } from '@radiustechsystems/sdk';
const signer = createPrivateKeySigner(privateKeyHex, chainId);

// Or Clef (production-ready)
import { createClefSigner } from '@radiustechsystems/sdk';
const signer = createClefSigner(address, chainId, clefUrl);
```

### Sending Transactions
```typescript
// Fire-and-forget
const hash = await client.send(signer, recipientAddress, amount);

// Wait for receipt
const receipt = await client.sendSync(signer, recipientAddress, amount);
```

### Calling Contracts
```typescript
// Read (no signer needed)
const balance = await client.call(contract, 'balanceOf', address);

// Write (requires signer)
const hash = await client.execute(contract, signer, 'transfer', to, amount);
const receipt = await client.executeSync(contract, signer, 'transfer', to, amount);
```

### ERC-20 Tokens
```typescript
import { createERC20 } from '@radiustechsystems/sdk';

const token = createERC20(tokenAddress, publicClient);
const balance = await token.balanceOf(ownerAddress);
const receipt = await token.transferSync(signer, recipient, amount);
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    RadiusClient (Main Entry)             │
│  - createRadiusClient(config) -> RadiusClient interface  │
└─────────────────────────────────────────────────────────┘
         ↓                                    ↓
    ┌────────────────────┐         ┌──────────────────────┐
    │   Signers          │         │  viem PublicClient   │
    │ - PrivateKeySigner │         │  - getBalance()      │
    │ - ClefSigner       │         │  - call()            │
    │ - RadiusSigner     │         │  - getCode()         │
    └────────────────────┘         └──────────────────────┘
         ↓                                    ↓
    ┌────────────────────┐         ┌──────────────────────┐
    │ Sign & Send Cycle  │         │ Read Operations      │
    │ 1. Get nonce       │         │ - Read contracts     │
    │ 2. Estimate gas    │         │ - Get balances       │
    │ 3. Sign tx         │         │ - Get nonces         │
    │ 4. Send raw tx     │         │ - Get code           │
    │ 5. Wait receipt    │         └──────────────────────┘
    └────────────────────┘
```

## Module Breakdown

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| **client/** | Main client implementation | `RadiusClient`, `createRadiusClient` |
| **auth/** | Signing implementations | `PrivateKeySigner`, `ClefSigner` |
| **chains/** | Chain configurations | `radiusTestnet`, `radiusMainnet` |
| **common/** | Core data types | `Address`, `Transaction`, `Receipt` |
| **contracts/** | Contract utilities | `Contract`, `ERC20`, `ERC20_ABI` |
| **crypto/** | Cryptographic functions | `keccak256`, `sign`, `pubkeyToAddress` |
| **accounts/** | Account abstraction | `Account` class |
| **transport/** | Custom viem transport | `createInterceptingTransport` |
| **events/** | Log/event querying | `getLogs`, `getLogsAdaptive`, watch functions |
| **react/** | React integration | `RadiusProvider`, hooks |
| **wagmi/** | Wagmi connector | `privateKeyConnector` |

## Type System Summary

**Custom Types:**
- `Address` - Typed wrapper for 20-byte addresses
- `Transaction` - Unsigned transaction representation
- `SignedTransaction` - RLP-encoded signed transaction
- `Receipt` - Transaction receipt with gas/logs
- `RadiusReceipt` - Alternative receipt format
- `RadiusSigner` - Signer interface

**viem Types (Re-exported):**
- `Hex`, `Hash`, `Abi`, `Chain`, `Transport`, `TransactionReceipt`

**Branded Types:**
- `0x${string}` for hex values
- Ensures type safety at compile time

## Transaction Flow

```
┌──────────────────────────────────────────────┐
│ 1. User calls: client.send(signer, to, val) │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 2. Get pending nonce from blockchain         │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 3. Estimate gas (apply 20% margin, cap)      │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 4. Sign transaction with signer              │
│    (includes chainId for EIP-155)            │
└──────────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────────┐
│ 5. Send raw transaction to RPC               │
│    → Returns immediately with hash           │
└──────────────────────────────────────────────┘
              ↓ (only for Sync variants)
┌──────────────────────────────────────────────┐
│ 6. Poll for receipt (waitForTransactionReceipt)
│    → Returns when included in block          │
└──────────────────────────────────────────────┘
```

## Error Handling

- **Explicit errors** - All methods can throw with clear messages
- **Type safety** - Wrong types caught at compile time
- **Validation** - ABI, address, and parameter validation
- **Context** - Error messages include helpful details

Example:
```typescript
try {
  const receipt = await client.sendSync(signer, to, value);
} catch (error) {
  if (error instanceof Error) {
    console.error(`Transaction failed: ${error.message}`);
  }
}
```

## Code Quality Metrics

| Metric | Status |
|--------|--------|
| TypeScript Strict Mode | ✓ Enabled |
| No implicit any | ✓ Forbidden |
| All functions documented | ✓ JSDoc present |
| Examples in docs | ✓ Present |
| Error handling | ✓ Explicit |
| Test coverage | ✓ Integration tests |
| No external crypto | ✓ Uses viem |
| Tree-shakeable | ✓ ESM exports |

## Key Design Decisions

1. **viem-based** - Modern, lightweight, TypeScript-first
2. **Zero gas price** - Radius-specific (encoded in client)
3. **Pluggable signers** - PrivateKey or Clef
4. **Automatic gas estimation** - 20% margin + MAX_GAS cap
5. **Pagination helpers** - For Radius's block range limits
6. **React hooks available** - Via optional `/react` export
7. **No breaking changes from v1** (mostly) - Account class still available
8. **Interceptable transport** - For debugging/monitoring

## Export Patterns

```typescript
// Main export
import { createRadiusClient } from '@radiustechsystems/sdk';

// Chain definitions
import { radiusTestnet } from '@radiustechsystems/sdk/chains';

// Events/logs
import { getLogs } from '@radiustechsystems/sdk/events';

// React
import { RadiusProvider, useRadiusBalance } from '@radiustechsystems/sdk/react';

// Wagmi
import { privateKeyConnector } from '@radiustechsystems/sdk/wagmi';
```

## Common Usage Patterns

### Read-Only
```typescript
const client = createRadiusClient({ chain: radiusTestnet });
const balance = await client.getBalance(address);
const code = await client.getCode(contractAddress);
```

### Send Native Currency
```typescript
const signer = createPrivateKeySigner(key, chainId);
const receipt = await client.sendSync(signer, recipient, 1000000000000000000n);
```

### Contract Interaction
```typescript
const receipt = await client.executeSync(
  contract,
  signer,
  'transfer',
  recipient,
  amount
);
```

### Token Operations
```typescript
const token = createERC20(tokenAddress, client.publicClient);
const balance = await token.balanceOf(owner);
await token.transferSync(signer, recipient, amount);
```

### React Integration
```typescript
function MyApp() {
  return (
    <RadiusProvider>
      <MyComponent />
    </RadiusProvider>
  );
}

function MyComponent() {
  const { data: balance } = useRadiusBalance(address);
  return <div>Balance: {balance}</div>;
}
```

## Security Considerations

| Aspect | Approach |
|--------|----------|
| Private Keys | PrivateKeySigner keeps in memory (dev only) |
| Production Keys | Use ClefSigner for secure key management |
| Signing | Delegates to viem's account utilities |
| Cryptography | Uses viem's implementations (no custom crypto) |
| Gas Limits | Capped at MAX_GAS to prevent runaway costs |
| Chain ID | Included in signed transactions (EIP-155) |

## Performance Characteristics

- **Gas estimation:** Adds ~20ms per transaction (1 RPC call)
- **Receipt polling:** ~200-500ms per transaction on Radius
- **Contract calls:** ~100-300ms (1 RPC call)
- **ERC-20 metadata:** Cached (name, symbol, decimals)
- **Log pagination:** ~1s per 1000-block chunk

## Dependencies Summary

**Required:**
- viem ^2.0.0 (included as peerDependency)
- typescript ^5.0.0

**Optional:**
- wagmi ^3.0.0 (for React features)
- @tanstack/react-query ^5.0.0 (for async state)
- react ^18.0.0 (for React integration)

**No direct dependency on:**
- ethers.js
- web3.js
- Any custom crypto library

## File Locations

**Main Source:**
```
src/
├── index.ts                  # Main entry point
├── client/client.ts          # RadiusClient implementation
├── auth/                     # Signer implementations
├── chains/radius.ts          # Chain definitions
├── contracts/erc20.ts        # ERC-20 support
├── common/                   # Core types
├── crypto/utils.ts           # Crypto utilities
├── events/getLogs.ts         # Event pagination
├── react/provider.tsx        # React provider
└── wagmi/connector.ts        # Wagmi integration
```

**Configuration:**
```
tsconfig.json               # TypeScript config
biome.json                  # Code quality config
package.json                # Dependencies
vitest.config.ts            # Test runner
```

**Tests:**
```
test/
├── integration/             # Integration tests
└── unit/                    # Unit tests
```

## Key Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_GAS` | 1319413953330n | Maximum gas per transaction |
| Radius Testnet ID | 1223953 | Chain identifier |
| Radius Mainnet ID | 1223954 (TBD) | Placeholder |
| Gas Price | 0n | Radius uses zero gas price |

## Next Steps for Users

1. **Install:** `npm install @radiustechsystems/sdk viem`
2. **Create client:** `const client = createRadiusClient({chain})`
3. **Create signer:** `const signer = createPrivateKeySigner(key, chainId)`
4. **Send transactions:** `await client.sendSync(signer, to, value)`
5. **Read state:** `const balance = await client.getBalance(address)`

---

**Full detailed audit available in:** `SDK_AUDIT.md`
