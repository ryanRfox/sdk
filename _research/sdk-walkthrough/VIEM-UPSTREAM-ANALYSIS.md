# Viem Upstream Integration Analysis

**Research Date**: January 2026
**Purpose**: Analyze viem's architecture to determine how Radius could become a first-class citizen in the viem ecosystem.

---

## 1. Viem Directory Structure Overview

### Top-Level `src/` Directories

Viem organizes its codebase into logical modules at the `src/` level:

| Directory | Purpose |
|-----------|---------|
| `accounts/` | Account management utilities (private keys, mnemonics, etc.) |
| `account-abstraction/` | ERC-4337 account abstraction implementations |
| `actions/` | Core blockchain interaction functions (read/write) |
| `chains/` | Chain definitions and configurations |
| `clients/` | Client implementations (Public, Wallet, Test clients) |
| `constants/` | Global constants and configuration values |
| `ens/` | Ethereum Name Service utilities |
| `errors/` | Error handling and custom error types |
| `experimental/` | Experimental/unstable features |
| `node/` | Node.js-specific utilities |
| `nonce/` | Nonce management utilities |
| `siwe/` | Sign-In with Ethereum implementation |
| `types/` | TypeScript type definitions |
| `utils/` | General utility functions |
| `window/` | Browser window utilities |

### Blockchain-Specific Directories

Viem has dedicated top-level directories for blockchains with **custom transaction types or unique behaviors**:

| Directory | Chain | Reason for Dedicated Module |
|-----------|-------|----------------------------|
| `celo/` | Celo | Custom fee handling, token-denominated gas |
| `zksync/` | zkSync Era | EIP-712 transactions, paymasters, custom accounts |
| `op-stack/` | Optimism ecosystem | L1/L2 bridging, deposit/withdrawal flows |
| `linea/` | Linea | Custom actions and types |
| `tempo/` | Tempo | Network-specific features |

**Key Insight**: Not every chain needs a dedicated directory. Simple EVM chains only need a chain definition in `src/chains/definitions/`. Dedicated modules are reserved for chains with:
- Custom transaction types
- Non-standard serialization
- Chain-specific actions (bridging, L2-specific operations)
- Custom account types
- Modified fee structures

---

## 2. How Chain-Specific Modules Work

### Pattern Analysis: zkSync (Complex Implementation)

zkSync represents the most comprehensive chain integration, making it the best reference for Radius.

#### Directory Structure
```
src/zksync/
├── accounts/           # Smart account implementations
├── actions/           # 32+ chain-specific actions
├── constants/         # zkSync-specific constants
├── decorators/        # Client extension patterns
├── errors/            # Custom error types
├── types/             # TypeScript definitions
├── utils/             # Helper functions
├── chainConfig.ts     # Core configuration export
├── chains.ts          # Chain re-exports
├── formatters.ts      # Data formatting
├── serializers.ts     # Transaction serialization
└── index.ts           # Public API exports
```

#### chainConfig.ts Pattern
```typescript
import { formatters } from './formatters.js'
import { serializers } from './serializers.js'
import { getEip712Domain } from './utils/getEip712Domain.js'

export const chainConfig = {
  blockTime: 1_000,
  formatters,
  serializers,
  custom: {
    getEip712Domain,
  },
} as const
```

#### Key Components

1. **Serializers** - Custom transaction serialization for EIP-712 transactions
   - Handles `0x71` transaction type prefix
   - Supports paymaster parameters
   - Manages factory dependencies

2. **Formatters** - Transform chain data to viem's internal format
   - Block formatting
   - Transaction formatting
   - Receipt formatting

3. **Decorators** - Extend viem clients with chain-specific methods
   ```typescript
   // publicL2.ts pattern
   export function publicActionsL2() {
     return (client: Client) => ({
       getL1ChainId: () => getL1ChainId(client),
       estimateFee: (args) => estimateFee(client, args),
       getBlockDetails: (args) => getBlockDetails(client, args),
       // ... 20+ methods
     })
   }
   ```

4. **Actions** - Individual chain operations
   - Bridge: `deposit`, `withdraw`, `claimFailedDeposit`, `finalizeWithdrawal`
   - Fees: `estimateFee`, `estimateGasL1ToL2`, `getGasPerPubdata`
   - Queries: `getBlockDetails`, `getTransactionDetails`, `getL1BatchDetails`
   - Accounts: `deployContract`, `sendEip712Transaction`

5. **Types** - TypeScript definitions for:
   - `ZksyncTransactionSerializable`
   - `ZksyncEip712Meta`
   - `PaymasterParams`
   - Custom block/transaction types

### Pattern Analysis: Celo (Simpler Implementation)

Celo shows a simpler pattern without subdirectories:

```
src/celo/
├── chainConfig.ts     # Configuration
├── fees.ts            # Custom fee calculation
├── formatters.ts      # Data formatting
├── parsers.ts         # Data parsing
├── serializers.ts     # Transaction serialization
├── types.ts           # Type definitions
├── utils.ts           # Utilities
├── getTransaction.ts  # Single action
├── sendTransaction.ts # Single action
└── index.ts           # Exports
```

**Key Difference**: Celo has custom fee handling (token-denominated gas) but simpler L2 interactions, so it doesn't need the full actions/decorators structure.

### Pattern Analysis: OP-Stack (Ecosystem Pattern)

OP-Stack provides a shared base for multiple chains:

```
src/op-stack/
├── actions/           # L1/L2 bridging actions
├── decorators/        # Client extensions
├── errors/
├── types/
├── utils/
├── abis.ts            # Contract ABIs
├── chainConfig.ts
├── chains.ts
├── contracts.ts       # Contract addresses
├── formatters.ts
├── parsers.ts
└── serializers.ts
```

Chain definitions then reference this shared config:
```typescript
// src/chains/definitions/optimism.ts
import { chainConfig } from '../../op-stack/chainConfig.js'

export const optimism = defineChain({
  ...chainConfig,
  id: 10,
  name: 'OP Mainnet',
  // chain-specific overrides
})
```

---

## 3. What Radius Would Need to Contribute Upstream

### Minimum Requirements (Chain Definition Only)

If Radius is a standard EVM chain, it only needs:

1. **Chain definition file** in `src/chains/definitions/radius.ts`:
```typescript
import { defineChain } from '../../utils/chain/defineChain.js'

export const radius = defineChain({
  id: RADIUS_CHAIN_ID,
  name: 'Radius',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radius.network'],
      webSocket: ['wss://rpc.radius.network/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.radius.network',
    },
  },
  contracts: {
    multicall3: {
      address: '0x...',
    },
  },
})
```

2. **Export from index** in `src/chains/index.ts`

3. **Changeset** describing the addition

### Full Integration (Dedicated Module)

If Radius has unique features (encrypted transactions, custom sequencer interactions, etc.), it would need:

```
src/radius/
├── index.ts              # Public API exports
├── package.json          # Sub-package config
├── chainConfig.ts        # Configuration object
├── chains.ts             # Chain re-exports
├── types.ts              # TypeScript definitions
│
├── serializers.ts        # If custom transaction types
├── formatters.ts         # If custom data formats
├── parsers.ts            # If custom parsing needed
│
├── actions/              # Radius-specific operations
│   ├── sendEncryptedTransaction.ts
│   ├── getDecryptedTransaction.ts
│   ├── estimateEncryptionFee.ts
│   └── ... (with tests)
│
├── decorators/           # Client extensions
│   ├── publicActions.ts
│   └── walletActions.ts
│
├── utils/                # Helper functions
│   ├── encryptTransaction.ts
│   └── decryptTransaction.ts
│
└── types/                # Complex type definitions
    ├── transaction.ts
    └── encryption.ts
```

### Contribution Prerequisites

From viem's CONTRIBUTING.md:

1. **Chain ID**: Must be unique and registered in ethereum-lists/chains
2. **Public RPC**: Credible, reliable public endpoint required
3. **Block Explorer**: Recommended for full integration
4. **Multicall3**: Must be deployed and verified
5. **Documentation**: Clear API documentation for chain-specific features
6. **Tests**: Comprehensive test coverage (see zkSync's ~32 test files)
7. **Changesets**: Proper versioning documentation

---

## 4. Pros and Cons: Upstream vs Separate SDK

### Option A: Become Part of Viem

**Pros:**
- Instant adoption by viem's large user base
- Maintenance burden shared with viem team
- Automatic updates when viem evolves
- Higher trust and credibility
- Works seamlessly with wagmi/rainbowkit ecosystem
- Better discoverability
- Type safety improvements from viem's infrastructure
- Access to viem's testing infrastructure

**Cons:**
- Must follow viem's conventions and patterns
- PR review process adds friction for updates
- Less control over release timing
- Chain-specific docs may be less prominent
- Breaking changes must align with viem's semver
- Complex features may be simplified for broader audience
- Dependency on viem's maintenance priorities

### Option B: Maintain Separate SDK

**Pros:**
- Full control over API design and release schedule
- Can implement Radius-specific patterns freely
- Faster iteration without external review
- Custom documentation and examples
- Can extend viem without forking
- Freedom to make breaking changes
- Direct support channel with users

**Cons:**
- Users must learn another SDK
- Maintenance burden entirely on Radius team
- Must track viem updates manually
- Lower discoverability
- Type compatibility issues with viem ecosystem
- Duplicated effort for common functionality
- Smaller community for bug reports/contributions

### Option C: Hybrid Approach (Recommended)

**Approach:**
1. **Contribute chain definition to viem** - Basic `radius` chain in `src/chains/definitions/`
2. **Maintain `@aspect-build/radius-sdk`** - Extended functionality as separate package
3. **Use viem as peer dependency** - Full interoperability

**Benefits:**
- Users can use basic Radius with just viem
- Advanced users get full SDK features
- Radius team controls SDK release cycle
- Chain gets viem ecosystem exposure
- SDK can extend viem's Radius support

---

## 5. Recommended Approach for Radius

### Phase 1: Basic Chain Definition (Immediate)

1. **Register Radius chain ID** with ethereum-lists/chains
2. **Deploy Multicall3** on Radius mainnet/testnet
3. **Submit PR to viem** with basic chain definition:
   ```typescript
   // src/chains/definitions/radius.ts
   export const radius = defineChain({
     id: RADIUS_CHAIN_ID,
     name: 'Radius',
     // ... basic config
   })
   ```

### Phase 2: Evaluate Full Integration Need

Determine if Radius needs a dedicated `src/radius/` module based on:

| Feature | Needs Dedicated Module? |
|---------|------------------------|
| Standard EVM transactions | No |
| Custom transaction types (encrypted) | Yes |
| Custom fee structure | Yes |
| L1/L2 bridging | Yes |
| Sequencer interactions | Yes |
| Standard RPC methods | No |
| Custom RPC methods | Yes |

### Phase 3: Full Integration (If Needed)

If Radius has unique features requiring custom handling:

1. **Create `src/radius/` module** following zkSync pattern
2. **Implement required components**:
   - `chainConfig.ts` - Core configuration
   - `serializers.ts` - If custom transaction types
   - `formatters.ts` - If custom response formats
   - `actions/` - Chain-specific operations
   - `decorators/` - Client extensions
   - `types/` - TypeScript definitions

3. **Comprehensive testing**:
   - Unit tests for all functions
   - Type tests for TypeScript definitions
   - Integration tests with actual Radius node

4. **Documentation**:
   - API reference
   - Usage examples
   - Migration guide from separate SDK

### Phase 4: Maintain Separate SDK as Complement

Even with full viem integration, maintain `@aspect-build/radius-sdk` for:

1. **Bleeding-edge features** not yet in viem
2. **Radius-specific tooling** (CLI, generators, etc.)
3. **Higher-level abstractions** beyond viem's scope
4. **Pre-release testing** before viem PRs

---

## 6. Technical Implementation Details

### Transaction Serialization (If Custom Types)

If Radius uses custom transaction types (e.g., encrypted transactions), follow zkSync's pattern:

```typescript
// src/radius/serializers.ts
export function serializeTransaction(
  transaction: RadiusTransactionSerializable,
  signature?: Signature
) {
  if (isEncryptedTransaction(transaction)) {
    return serializeEncryptedTransaction(transaction, signature)
  }
  return serializeTransactionBase(transaction, signature)
}

function serializeEncryptedTransaction(
  transaction: RadiusEncryptedTransaction,
  signature?: Signature
) {
  // Custom serialization with encryption envelope
  const fields = [
    toHex(transaction.chainId),
    transaction.nonce ? toHex(transaction.nonce) : '0x',
    // ... other fields
    transaction.encryptedPayload,
    transaction.encryptionProof,
  ]
  return concatHex(['0xXX', toRlp(fields)]) // Custom type prefix
}
```

### Client Decorators

```typescript
// src/radius/decorators/walletActions.ts
export function walletActionsRadius() {
  return (client: Client): WalletActionsRadius => ({
    sendEncryptedTransaction: (args) =>
      sendEncryptedTransaction(client, args),
    prepareEncryptedTransaction: (args) =>
      prepareEncryptedTransaction(client, args),
  })
}

// Usage
const client = createWalletClient({ chain: radius, transport: http() })
  .extend(walletActionsRadius())

await client.sendEncryptedTransaction({
  to: '0x...',
  value: parseEther('1'),
  encryption: { /* Radius encryption params */ }
})
```

### Type Definitions

```typescript
// src/radius/types/transaction.ts
export type RadiusTransactionSerializable =
  | TransactionSerializableBase
  | RadiusEncryptedTransaction

export type RadiusEncryptedTransaction = {
  type: 'encrypted'
  chainId: number
  nonce: number
  to: Address
  value: bigint
  data: Hex
  encryptedPayload: Hex
  encryptionProof: Hex
  // ... other fields
}
```

---

## 7. Checklist for Viem Contribution

### Pre-submission
- [ ] Chain ID registered in ethereum-lists/chains
- [ ] Public RPC endpoint operational
- [ ] Block explorer deployed and functional
- [ ] Multicall3 contract deployed and verified
- [ ] All tests passing locally
- [ ] Documentation written

### Chain Definition PR
- [ ] Chain file created in `src/chains/definitions/radius.ts`
- [ ] Export added to `src/chains/index.ts`
- [ ] Changeset created with `pnpm changeset`
- [ ] PR title uses imperative mood: "Add Radius chain"

### Full Module PR (If Applicable)
- [ ] `src/radius/` directory structure complete
- [ ] `chainConfig.ts` with formatters/serializers
- [ ] Actions implemented with tests
- [ ] Decorators implemented with tests
- [ ] Types exported from `index.ts`
- [ ] Type tests for all public types
- [ ] Integration tests with actual node
- [ ] Documentation in PR description

---

## 8. References

### Viem Repository
- Main: https://github.com/wevm/viem
- Contributing: https://github.com/wevm/viem/blob/main/.github/CONTRIBUTING.md
- Chain definitions: https://github.com/wevm/viem/tree/main/src/chains/definitions

### Reference Implementations
- zkSync (complex): https://github.com/wevm/viem/tree/main/src/zksync
- Celo (medium): https://github.com/wevm/viem/tree/main/src/celo
- OP-Stack (ecosystem): https://github.com/wevm/viem/tree/main/src/op-stack
- Linea (simple): https://github.com/wevm/viem/tree/main/src/linea

### Ethereum Chain Registry
- https://github.com/ethereum-lists/chains

---

## Summary

Viem provides a clear, well-documented pattern for chain integration. The recommended approach for Radius is:

1. **Immediate**: Submit basic chain definition to viem
2. **Evaluate**: Determine if custom transaction types require dedicated module
3. **Hybrid**: Maintain separate SDK for advanced features while contributing core support upstream

This maximizes ecosystem compatibility while preserving flexibility for Radius-specific innovations.
