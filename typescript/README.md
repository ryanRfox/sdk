# Radius TypeScript SDK

The official TypeScript SDK for interacting with the [Radius platform](https://radiustech.xyz/). Built on viem for maximum compatibility with the Ethereum ecosystem.

## Features

- viem-based client for seamless EVM compatibility
- Account management with viem LocalAccount-based signing
- Smart contract deployment and interaction
- Rich error hierarchy for better debugging
- React hooks for frontend integration
- wagmi connector support
- Optional request logging and interceptors
- Server-side handlers for fee payment and key management

## Requirements

- Node.js >= 22
- Radius JSON-RPC endpoint: https://docs.radiustech.xyz/radius-testnet-access
- Ethereum private key: https://ethereum.org/en/developers/docs/accounts/#account-creation

## Installation

```bash
# Using npm
npm install @radiustechsystems/sdk

# Using pnpm
pnpm add @radiustechsystems/sdk

# Using yarn
yarn add @radiustechsystems/sdk
```

## Quick Start

### Connect to Radius

```typescript
import { createRadiusClient, createPrivateKeySigner, radiusTestnet } from '@radiustechsystems/sdk';

// Create client - uses RADIUS_RPC_URL env var if set
const client = createRadiusClient({ chain: radiusTestnet });

// Create signer from private key
const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as `0x${string}`,
  radiusTestnet.id
);

// Check balance
const balance = await client.getBalance(signer.address);
console.log('Balance:', balance, 'wei');
```

### Transfer Value

```typescript
import type { Address } from '@radiustechsystems/sdk';

const recipient: Address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
const amount = 1000000000000000000n; // 1 USD in wei

// Send and wait for receipt
const receipt = await client.sendAndWait(signer, recipient, amount);

console.log('Transaction hash:', receipt.transactionHash);
console.log('Status:', receipt.status); // 'success' or 'reverted'
console.log('Gas used:', receipt.gasUsed);
```

### Deploy a Smart Contract

```typescript
import { parseAbi } from 'viem';

const abi = parseAbi([
  'constructor(string name, string symbol)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
]);

const bytecode = '0x608060405234801561001057600080fd5b50...';

const { address, receipt } = await client.deployContract(
  signer,
  bytecode,
  abi,
  'My Token',
  'MTK'
);

console.log('Contract deployed at:', address);
```

### Interact with a Smart Contract

```typescript
// Read from contract
const name = await client.call<string>(
  { address: contractAddress, abi },
  'name'
);

// Write to contract
const receipt = await client.executeAndWait(
  { address: contractAddress, abi },
  signer,
  'transfer',
  recipientAddress,
  amount
);
```

## Server Handlers

Build backend services with the server module:

### Import Server Module

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';
```

### Fee Payer Service

Sponsor transactions on behalf of users:

```typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { Handler } from '@radiustechsystems/sdk/server';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.FEE_PAYER_KEY as `0x${string}`);
const client = createRadiusClient({ chain: radiusTestnet });

const handler = Handler.feePayer({
  account,
  client,
  onRequest: async (body) => {
    // Optional: validate/log requests
    console.log('Sponsoring tx:', body.params[0]);
  },
});

// Use with Node.js http server
import { createServer } from 'node:http';
createServer(handler.listener).listen(3000);
```

### Key Manager

Store and retrieve WebAuthn credentials:

```typescript
import { Handler, Kv } from '@radiustechsystems/sdk/server';

const handler = Handler.keyManager({
  kv: Kv.memory(), // Use Kv.cloudflare() in production
  rp: 'example.com',
});

// Endpoints:
// GET /challenge - Generate auth challenge
// GET /:id - Retrieve credential
// POST /:id - Store credential
```

### Compose Handlers

Combine multiple handlers under a single server:

```typescript
const app = Handler.compose([
  Handler.keyManager({ kv, path: '/keys' }),
  Handler.feePayer({ account, client, path: '/sponsor' }),
], { path: '/api' });

// Routes:
// /api/keys/challenge, /api/keys/:id
// /api/sponsor
```

## Error Handling

The SDK provides a rich error hierarchy for better debugging:

```typescript
import {
  RadiusError,
  InsufficientBalanceError,
  TransactionRevertedError,
} from '@radiustechsystems/sdk';

try {
  await client.sendAndWait(signer, to, amount);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.error('Need:', error.required, 'Have:', error.balance);
  } else if (error instanceof TransactionRevertedError) {
    console.error('Reverted:', error.revertReason);
  } else if (error instanceof RadiusError) {
    console.error('Error:', error.shortMessage);
    console.error('Details:', error.details);
  }
}
```

## Client Extension

Extend the client with custom actions:

```typescript
import { formatEther } from 'viem';

const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
  async getBalanceFormatted(address: Address) {
    const balance = await base.getBalance(address);
    return formatEther(balance);
  },
}));

const formatted = await client.getBalanceFormatted(signer.address);
```

## Chain Contracts

Access well-known contract addresses:

```typescript
import { radiusTestnet, RADIUS_TESTNET_CONTRACTS } from '@radiustechsystems/sdk';

// Via chain definition
const sbcAddress = radiusTestnet.contracts?.sbc?.address;

// Or constant
const sbcAddress2 = RADIUS_TESTNET_CONTRACTS.sbc;
```

## Environment Variables

The client reads RPC URL from environment:

| Variable | Description |
|----------|-------------|
| `RADIUS_RPC_URL` | Primary RPC endpoint |
| `RADIUS_ENDPOINT` | Fallback RPC endpoint |

## Documentation

To regenerate the API documentation:

```bash
pnpm generate:docs
```

See [`docs/GENERATION.md`](docs/GENERATION.md) for details.

Generated documentation files:
- `docs/sdk-typescript.mdx` - Main API reference
- `docs/sdk-typescript-events.mdx` - Events API
- `docs/sdk-typescript-react.mdx` - React hooks

## Resources

- [Website](https://radiustech.xyz/)
- [Testnet Access](https://docs.radiustech.xyz/radius-testnet-access)
- [GitHub Issues](https://github.com/radiustechsystems/sdks/issues)
- [Changelog](CHANGELOG.md)

## Contributing

Please see the [TypeScript SDK Contributing Guide](CONTRIBUTING.md) for detailed information about contributing to this
SDK. For repository-wide guidelines, see the [General Contributing Guide](../CONTRIBUTING.md).

## License

All Radius SDKs are released under the [MIT License](../LICENSE).
