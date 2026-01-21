# Multicall3 Analysis for Radius SDK

**Research Date**: January 2026
**Purpose**: Analyze Multicall3 status in Radius SDK and viem compatibility requirements

---

## 1. Current State of Multicall3 in Radius SDK

### Chain Definitions Review

The Radius SDK defines two chains in `/typescript/src/chains/`:

**`radius.ts` (Mainnet - Chain ID 723)**:
```typescript
export const radius = defineChain({
  id: 723,
  name: 'Radius',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.radiustech.xyz',
    },
  },
});
```

**`radiusTestnet.ts` (Testnet - Chain ID 1223953)**:
```typescript
export const radiusTestnet = defineChain({
  id: 1223953,
  name: 'Radius Testnet',
  // ... similar structure
  testnet: true,
});
```

### Key Finding: No Multicall3 Configuration

**Neither chain definition includes a `contracts` property with Multicall3 address.**

The TypeScript type definitions (`.d.ts` files) show the `multicall3` field exists as optional:
```typescript
multicall3?: import("viem").ChainContract | undefined;
```

However, it is not populated in the actual chain definitions.

### Deployment Status Unknown

- Multicall3 is NOT listed in the official [mds1/multicall3 deployments.json](https://github.com/mds1/multicall3/blob/main/deployments.json) for either:
  - Chain ID 723 (Radius Mainnet)
  - Chain ID 1223953 (Radius Testnet)

**Action Required**: Verify whether Multicall3 is deployed on Radius networks at the canonical address.

---

## 2. How Viem Expects Multicall3 to be Configured

### Chain Definition Pattern

Viem expects Multicall3 in the `contracts` object of chain definitions:

```typescript
import { defineChain } from 'viem'

export const exampleChain = defineChain({
  id: 7777777,
  name: 'Example',
  nativeCurrency: { /* ... */ },
  rpcUrls: { /* ... */ },
  blockExplorers: { /* ... */ },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5882, // Optional: block when contract was deployed
    },
  },
})
```

### Canonical Multicall3 Address

The standard Multicall3 address across 250+ chains is:
```
0xcA11bde05977b3631167028862bE2a173976CA11
```

This address is deterministically derived and should be used if Multicall3 is deployed via the standard pre-signed transaction method.

### How Viem Uses Multicall3

#### Automatic Batching with `publicClient.multicall()`

```typescript
const results = await publicClient.multicall({
  contracts: [
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'totalSupply',
    },
    {
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: wagmiAbi,
      functionName: 'ownerOf',
      args: [69420n]
    },
  ]
})
// Returns array of results from single RPC call
```

#### Manual Address Override

If Multicall3 is deployed at a non-standard address:
```typescript
const results = await publicClient.multicall({
  contracts: [...],
  multicallAddress: '0x...' // Custom address override
})
```

#### Benefits of Multicall3

1. **Reduced RPC Calls**: Batch multiple contract reads into one request
2. **Block Consistency**: All results guaranteed from same block
3. **Cost Reduction**: Fewer RPC requests means lower costs on paid providers
4. **Performance**: Significantly faster than sequential calls

---

## 3. Changes Required for Full Viem Compatibility

### Scenario A: Multicall3 Already Deployed on Radius

If Multicall3 exists at the canonical address, update chain definitions:

```typescript
// radius.ts
export const radius = defineChain({
  id: 723,
  name: 'Radius',
  nativeCurrency: {
    decimals: 18,
    name: 'USD',
    symbol: 'USD',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.radiustech.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Radius Explorer',
      url: 'https://explorer.radiustech.xyz',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: BLOCK_NUMBER_HERE, // Fill in actual block
    },
  },
});
```

### Scenario B: Multicall3 Not Yet Deployed

**Deployment Options:**

1. **Pre-signed Transaction Method**
   - Use the pre-signed transaction from [mds1/multicall3](https://github.com/mds1/multicall3)
   - Requires exactly 872,776 gas
   - Works if chain has standard EVM gas metering

2. **Genesis/Predeploy Method**
   - Place Multicall3 bytecode at genesis block
   - Used by OP-Stack chains (Multicall3 is a preinstall)
   - Guarantees canonical address

3. **Manual Deployment**
   - Deploy from any account
   - Will result in different address than canonical
   - Less ideal but functional with `multicallAddress` override

**Recommendation**: Use pre-signed transaction to get canonical address for ecosystem compatibility.

### Test Updates Required

Add tests to verify Multicall3 configuration:

```typescript
// radius.test.ts additions
describe('Multicall3 Support', () => {
  it('radius should have multicall3 contract defined', () => {
    expect(radius.contracts?.multicall3).toBeDefined();
    expect(radius.contracts?.multicall3?.address).toBe(
      '0xcA11bde05977b3631167028862bE2a173976CA11'
    );
  });

  it('radiusTestnet should have multicall3 contract defined', () => {
    expect(radiusTestnet.contracts?.multicall3).toBeDefined();
  });
});
```

---

## 4. Other Well-Known Contracts to Consider

### Viem's Standard Contract Types

Viem recognizes four well-known contracts in chain definitions:

| Contract | Purpose | Required for Viem Compatibility |
|----------|---------|--------------------------------|
| `multicall3` | Batch contract calls | **High** - Required for `publicClient.multicall()` |
| `ensRegistry` | ENS name registry | Low - Only for ENS support |
| `ensUniversalResolver` | ENS resolution | Low - Only for ENS support |
| `erc6492Verifier` | ERC-6492 signature verification | Low - Specialized use |

### OP-Stack Contracts (If Applicable)

If Radius is an OP-Stack chain, these contracts may be relevant:

| Contract | Address | Purpose |
|----------|---------|---------|
| `gasPriceOracle` | `0x420000000000000000000000000000000000000F` | L2 gas pricing |
| `l1Block` | `0x4200000000000000000000000000000000000015` | L1 block data |
| `l2CrossDomainMessenger` | `0x4200000000000000000000000000000000000007` | Cross-chain messaging |
| `l2StandardBridge` | `0x4200000000000000000000000000000000000010` | Token bridging |
| `l2ToL1MessagePasser` | `0x4200000000000000000000000000000000000016` | L2->L1 messages |
| `l2Erc721Bridge` | `0x4200000000000000000000000000000000000014` | NFT bridging |

### Other Common Utility Contracts

| Contract | Purpose | Recommendation |
|----------|---------|----------------|
| **WETH** | Wrapped native token | Document if deployed, but not in chain config |
| **Create2Deployer** | Deterministic deployment | Useful for developers |
| **Permit2** | Token approval standard | Popular in DeFi |
| **4337 EntryPoint** | Account abstraction | If AA is supported |

### ENS Considerations

Radius likely does NOT need ENS contracts because:
- ENS is Ethereum-specific
- Radius uses USD as native currency (not ETH ecosystem)
- Custom naming service would need separate implementation

---

## 5. Documentation Recommendations

### SDK Documentation Additions

1. **Chain Configuration Reference**
   - Document all contracts in chain definitions
   - Explain what each contract enables

2. **Multicall Usage Guide**
   ```markdown
   ## Batching Contract Calls

   Radius supports Multicall3 for efficient batched reads:

   ```typescript
   import { createPublicClient, http } from 'viem'
   import { radius } from '@aspect-build/radius-sdk/chains'

   const client = createPublicClient({
     chain: radius,
     transport: http(),
   })

   const results = await client.multicall({
     contracts: [
       { address, abi, functionName: 'balanceOf', args: [user] },
       { address, abi, functionName: 'totalSupply' },
     ]
   })
   ```
   ```

3. **Contract Addresses Page**
   - Create a reference page listing all deployed utility contracts
   - Include deployment block numbers
   - Link to block explorer verification

### README Updates

Add to SDK README:
```markdown
## Supported Features

- [x] Chain definitions for Radius Mainnet and Testnet
- [x] Multicall3 support for batched contract reads
- [ ] ENS (not applicable - Radius-specific naming TBD)
```

---

## 6. Implementation Checklist

### Immediate Actions

- [ ] **Verify Multicall3 Deployment**: Check if Multicall3 exists at `0xcA11bde05977b3631167028862bE2a173976CA11` on both networks
- [ ] **Deploy if Missing**: Use pre-signed transaction method for canonical address
- [ ] **Update Chain Definitions**: Add `contracts.multicall3` to both `radius.ts` and `radiusTestnet.ts`
- [ ] **Add Tests**: Verify Multicall3 configuration in test suite
- [ ] **Document**: Add Multicall3 usage documentation

### Verification Script

To check if Multicall3 is deployed:
```typescript
import { createPublicClient, http } from 'viem'
import { radius, radiusTestnet } from './chains'

async function checkMulticall3() {
  const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

  for (const chain of [radius, radiusTestnet]) {
    const client = createPublicClient({ chain, transport: http() })
    const code = await client.getCode({ address: MULTICALL3_ADDRESS })
    console.log(`${chain.name}: ${code && code !== '0x' ? 'DEPLOYED' : 'NOT DEPLOYED'}`)
  }
}
```

### Submit to Official Multicall3 Registry

After deployment, submit PR to [mds1/multicall3](https://github.com/mds1/multicall3):
- Add Radius to `deployments.json`
- Include block explorer link

---

## 7. References

### Multicall3 Resources
- [Multicall3 Repository](https://github.com/mds1/multicall3)
- [Multicall3 Deployments](https://www.multicall3.com/deployments)
- [Canonical Address](https://etherscan.io/address/0xca11bde05977b3631167028862be2a173976ca11)

### Viem Documentation
- [Chain Definition](https://viem.sh/docs/chains/introduction)
- [Multicall Action](https://viem.sh/docs/contract/multicall)

### Related SDK Files
- `/typescript/src/chains/radius.ts`
- `/typescript/src/chains/radiusTestnet.ts`
- `/typescript/src/chains/radius.test.ts`

---

## Summary

**Current State**: Radius SDK chain definitions lack Multicall3 configuration, limiting viem compatibility.

**Required Actions**:
1. Verify/deploy Multicall3 at canonical address
2. Update chain definitions with `contracts.multicall3`
3. Add documentation for batched contract calls

**Priority**: High - Multicall3 is essential for efficient dApp development and full viem compatibility.
