#!/usr/bin/env npx tsx
/**
 * Radius SDK Documentation Generator
 *
 * This script generates MDX documentation files from the SDK source code.
 * Run with: pnpm generate:docs
 *
 * Generated files:
 * - docs/sdk-typescript.mdx - Main SDK reference
 * - docs/sdk-typescript-events.mdx - Events API reference
 * - docs/sdk-typescript-react.mdx - React hooks reference
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DOCS_DIR = join(import.meta.dirname, '..', 'docs');

// ============================================================================
// SDK TypeScript Main Documentation
// ============================================================================

const SDK_TYPESCRIPT_MDX = `---
title: Radius SDK for TypeScript
description: Complete API reference for the Radius TypeScript SDK - viem-based SDK for interacting with the Radius platform
---

# Radius SDK for TypeScript

A viem-based SDK for interacting with the Radius platform. This SDK provides a comprehensive set of tools for connecting to Radius, managing accounts, signing transactions, and interacting with smart contracts.

## Installation

Install the SDK using your preferred package manager:

\`\`\`bash
pnpm add @radiustechsystems/sdk
\`\`\`

\`\`\`bash
npm install @radiustechsystems/sdk
\`\`\`

\`\`\`bash
yarn add @radiustechsystems/sdk
\`\`\`

## Quick Start

Get started with a basic example that creates a client, connects to Radius Testnet, and queries a balance:

\`\`\`typescript
import { createRadiusClient, createPrivateKeySigner, radiusTestnet } from '@radiustechsystems/sdk';
import { http } from 'viem';

// Create a Radius client
const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});

// Create a signer for transactions
const signer = createPrivateKeySigner(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  radiusTestnet.id
);

// Get balance
const balance = await client.getBalance(signer.address);
console.log('Balance:', balance);

// Send a transaction and wait for receipt
const receipt = await client.sendAndWait(
  signer,
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  1000000000000000000n // 1 USD in wei
);
console.log('Transaction hash:', receipt.transactionHash);
console.log('Status:', receipt.status); // 'success' or 'reverted'
\`\`\`

## Client

The RadiusClient is the main entry point for interacting with the Radius platform.

### createRadiusClient()

Creates a new RadiusClient instance configured for the Radius network.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| config | \`RadiusClientConfig\` | Configuration object for the client |

**Returns:** \`RadiusClient\`

**Example:**

\`\`\`typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { http } from 'viem';

// Basic usage
const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});

// With custom transport (requires webSocket import from viem)
import { webSocket } from 'viem';

const clientWithWs = createRadiusClient({
  chain: radiusTestnet,
  transport: webSocket('wss://rpc.testnet.radiustech.xyz'),
});

// With logging
const clientWithLogging = createRadiusClient({
  chain: radiusTestnet,
  logger: console.log,
});

// With custom interceptor
const clientWithInterceptor = createRadiusClient({
  chain: radiusTestnet,
  interceptor: async (reqBody, response) => {
    console.log('Request:', reqBody);
    console.log('Response:', response);
    return response;
  },
});
\`\`\`

### RadiusClientConfig

Configuration options for creating a RadiusClient.

**Properties:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| chain | \`Chain\` | Yes | The chain configuration (use \`radiusTestnet\` or \`radiusMainnet\`) |
| transport | \`Transport\` | No | Viem transport (defaults to HTTP based on chain config or environment variable) |
| interceptor | \`Interceptor\` | No | Optional response interceptor for modifying/monitoring JSON-RPC responses |
| logger | \`Logf\` | No | Optional logger function for debugging |

### Environment Variables

The client automatically reads RPC URL from environment variables:

| Variable | Description |
|----------|-------------|
| \`RADIUS_RPC_URL\` | Primary RPC endpoint URL |
| \`RADIUS_ENDPOINT\` | Fallback RPC endpoint URL |

**Priority order:**
1. \`config.transport\` (if provided)
2. \`RADIUS_RPC_URL\` environment variable
3. \`RADIUS_ENDPOINT\` environment variable
4. \`chain.rpcUrls.default.http[0]\`

### RadiusClient Methods

#### getChainId()

Get the chain ID of the connected network.

**Returns:** \`Promise<bigint>\`

\`\`\`typescript
const chainId = await client.getChainId();
console.log('Chain ID:', chainId);
\`\`\`

#### getBalance()

Get the balance of an address in wei.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | The address to check |

**Returns:** \`Promise<bigint>\` - Balance in wei

\`\`\`typescript
const balance = await client.getBalance('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
console.log('Balance:', balance.toString(), 'wei');
\`\`\`

#### getCode()

Get the bytecode deployed at a contract address.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | The contract address |

**Returns:** \`Promise<Hex>\` - The bytecode as a hex string, or '0x' if no code

\`\`\`typescript
const code = await client.getCode('0x5FbDB2315678afecb367f032d93F642f64180aa3');
console.log('Contract code:', code);
\`\`\`

#### getNonce()

Get the pending nonce for an address.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | The address to check |

**Returns:** \`Promise<number>\` - The next nonce to use

\`\`\`typescript
const nonce = await client.getNonce('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
console.log('Next nonce:', nonce);
\`\`\`

#### estimateGas()

Estimate gas for a transaction with a 20% safety margin, capped at MAX_GAS.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| tx | \`TransactionRequest\` | The transaction parameters |

**Returns:** \`Promise<bigint>\` - Estimated gas with safety margin

\`\`\`typescript
const gas = await client.estimateGas({
  to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  value: 1000000000000000000n,
});
console.log('Estimated gas:', gas.toString());
\`\`\`

#### call()

Call a read-only contract method without creating a transaction.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| contract | \`ContractInstance\` | The contract instance with ABI and address |
| method | \`string\` | The method name to call |
| args | \`...unknown[]\` | Arguments to pass to the method |

**Returns:** \`Promise<T>\` - The decoded return value(s)

\`\`\`typescript
const name = await client.call<string>(
  { address: tokenAddress, abi: ERC20_ABI },
  'name'
);
console.log('Token name:', name);
\`\`\`

#### execute()

Execute a state-changing contract method. Returns immediately after the transaction is sent.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| contract | \`ContractInstance\` | The contract instance with ABI and address |
| signer | \`RadiusSigner\` | The signer to sign the transaction |
| method | \`string\` | The method name to execute |
| args | \`...unknown[]\` | Arguments to pass to the method |

**Returns:** \`Promise<Hash>\` - The transaction hash

\`\`\`typescript
const hash = await client.execute(
  { address: tokenAddress, abi: ERC20_ABI },
  signer,
  'transfer',
  recipientAddress,
  1000000000000000000n
);
console.log('Transaction hash:', hash);
\`\`\`

#### executeAndWait()

Execute a state-changing contract method and wait for the receipt.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| contract | \`ContractInstance\` | The contract instance with ABI and address |
| signer | \`RadiusSigner\` | The signer to sign the transaction |
| method | \`string\` | The method name to execute |
| args | \`...unknown[]\` | Arguments to pass to the method |

**Returns:** \`Promise<RadiusReceipt>\` - The transaction receipt

\`\`\`typescript
const receipt = await client.executeAndWait(
  { address: tokenAddress, abi: ERC20_ABI },
  signer,
  'transfer',
  recipientAddress,
  1000000000000000000n
);
console.log('Transaction confirmed:', receipt.transactionHash);
console.log('Status:', receipt.status); // 'success' or 'reverted'
console.log('Gas used:', receipt.gasUsed.toString());
\`\`\`

#### send()

Send native currency to an address. Returns immediately after the transaction is sent.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| signer | \`RadiusSigner\` | The signer to sign the transaction |
| to | \`Address\` | The recipient address |
| value | \`bigint\` | The amount to send in wei |

**Returns:** \`Promise<Hash>\` - The transaction hash

\`\`\`typescript
const hash = await client.send(
  signer,
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  1000000000000000000n
);
console.log('Transaction hash:', hash);
\`\`\`

#### sendAndWait()

Send native currency to an address and wait for the receipt.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| signer | \`RadiusSigner\` | The signer to sign the transaction |
| to | \`Address\` | The recipient address |
| value | \`bigint\` | The amount to send in wei |

**Returns:** \`Promise<RadiusReceipt>\` - The transaction receipt

\`\`\`typescript
const receipt = await client.sendAndWait(
  signer,
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  1000000000000000000n
);
console.log('Transaction confirmed:', receipt.transactionHash);
console.log('Status:', receipt.status); // 'success' or 'reverted'
\`\`\`

#### deployContract()

Deploy a smart contract to the Radius network.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| signer | \`RadiusSigner\` | The signer to sign the deployment transaction |
| bytecode | \`Hex\` | The contract bytecode |
| abi | \`Abi\` | The contract ABI |
| args | \`...unknown[]\` | Constructor arguments (if any) |

**Returns:** \`Promise<{ address: Address; receipt: RadiusReceipt }>\` - The deployed contract address and receipt

\`\`\`typescript
import { parseAbi } from 'viem';

const abi = parseAbi([
  'constructor(string memory name, string memory symbol)',
  'function name() view returns (string)',
]);

const { address, receipt } = await client.deployContract(
  signer,
  '0x608060405234801561001057600080fd5b50...', // bytecode
  abi,
  'My Token',
  'MTK'
);
console.log('Contract deployed at:', address);
console.log('Deployment gas used:', receipt.gasUsed.toString());
\`\`\`

#### sendRawTransaction()

Send a raw signed transaction.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| signedTx | \`Hex\` | The signed transaction as a hex string |

**Returns:** \`Promise<Hash>\` - The transaction hash

\`\`\`typescript
const signedTx = await signer.signTransaction({
  to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  value: 1000000000000000000n,
  nonce: 0,
  gas: 21000n,
  gasPrice: 0n,
  chainId: radiusTestnet.id,
});

const hash = await client.sendRawTransaction(signedTx);
console.log('Transaction hash:', hash);
\`\`\`

#### waitForReceipt()

Wait for a transaction receipt.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| hash | \`Hash\` | The transaction hash to wait for |

**Returns:** \`Promise<RadiusReceipt>\` - The transaction receipt

\`\`\`typescript
const receipt = await client.waitForReceipt('0x1234...');
console.log('Transaction confirmed:', receipt.status);
\`\`\`

#### extend()

Add custom actions to the client using the extension pattern.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| extender | \`(client: RadiusClient) => T\` | Function that receives the base client and returns custom actions |

**Returns:** \`RadiusClient & T\` - Extended client with custom actions

\`\`\`typescript
import { createRadiusClient, radiusTestnet, type Address } from '@radiustechsystems/sdk';
import { formatEther } from 'viem';

const client = createRadiusClient({ chain: radiusTestnet }).extend((base) => ({
  async getBalanceFormatted(address: Address): Promise<string> {
    const balance = await base.getBalance(address);
    return formatEther(balance);
  },

  async transferAll(signer: RadiusSigner, to: Address): Promise<RadiusReceipt> {
    const balance = await base.getBalance(signer.address);
    const gas = 21000n;
    const value = balance - gas;
    return base.sendAndWait(signer, to, value);
  },
}));

// Use custom actions
const formatted = await client.getBalanceFormatted('0x...');
const receipt = await client.transferAll(signer, recipientAddress);
\`\`\`

### RadiusReceipt

Receipt returned from transaction execution.

**Properties:**

| Name | Type | Description |
|------|------|-------------|
| transactionHash | \`Hash\` | The transaction hash |
| from | \`Address\` | The sender address |
| to | \`Address \\| null\` | The recipient address (null for contract creation) |
| contractAddress | \`Address \\| null\` | The created contract address (if any) |
| gasUsed | \`bigint\` | The amount of gas used |
| status | \`'success' \\| 'reverted'\` | The transaction status |
| blockNumber | \`bigint\` | The block number the transaction was included in |
| blockHash | \`Hash\` | The block hash |
| logs | \`TransactionReceipt['logs']\` | Transaction logs |

## Chains

The SDK includes pre-configured chain definitions for Radius networks.

### radiusTestnet

Radius Testnet chain configuration.

**Properties:**
- **Chain ID:** 1223953 (0x12ad11)
- **RPC URL:** https://rpc.testnet.radiustech.xyz
- **Explorer:** https://explorer.testnet.radiustech.xyz
- **Native Currency:** USD (18 decimals)

**Example:**

\`\`\`typescript
import { radiusTestnet } from '@radiustechsystems/sdk';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});

console.log('Chain ID:', radiusTestnet.id);
console.log('RPC URL:', radiusTestnet.rpcUrls.default.http[0]);
\`\`\`

### radiusMainnet

Radius Mainnet chain configuration.

**Note:** Mainnet configuration uses placeholder values. These will be updated when mainnet launches.

**Properties:**
- **Chain ID:** 1223954 (placeholder)
- **RPC URL:** https://rpc.radiustech.xyz (placeholder)
- **Explorer:** https://explorer.radiustech.xyz (placeholder)
- **Native Currency:** USD (18 decimals)

**Example:**

\`\`\`typescript
import { radiusMainnet } from '@radiustechsystems/sdk';

const client = createRadiusClient({
  chain: radiusMainnet,
  transport: http(),
});
\`\`\`

## Chain Contracts

Well-known contract addresses are available on chain definitions and as constants.

### RADIUS_TESTNET_CONTRACTS

\`\`\`typescript
import { radiusTestnet, RADIUS_TESTNET_CONTRACTS } from '@radiustechsystems/sdk';

// Access via chain definition
const sbcAddress = radiusTestnet.contracts?.sbc?.address;
// '0xF966020a30946A64B39E2e243049036367590858'

// Or use constant directly
const sbcAddress2 = RADIUS_TESTNET_CONTRACTS.sbc;
// '0xF966020a30946A64B39E2e243049036367590858'
\`\`\`

### Contract Addresses

#### Radius Testnet

| Contract | Address | Description |
|----------|---------|-------------|
| SBC Token | \`0xF966020a30946A64B39E2e243049036367590858\` | Fee token used for gas payments on Radius |

### Using the SBC Token

The SBC token is an ERC20 token used for fee payments on the Radius network. Here's how to interact with it:

\`\`\`typescript
import { createRadiusClient, createERC20, radiusTestnet, RADIUS_TESTNET_CONTRACTS } from '@radiustechsystems/sdk';
import { http } from 'viem';

// Create client
const client = createRadiusClient({
  chain: radiusTestnet,
  transport: http(),
});

// Create ERC20 instance for SBC token
const sbcToken = createERC20(RADIUS_TESTNET_CONTRACTS.sbc, client.publicClient);

// Get token metadata
const name = await sbcToken.name();       // Token name
const symbol = await sbcToken.symbol();   // Token symbol
const decimals = await sbcToken.decimals(); // Token decimals

console.log(\`\${name} (\${symbol}) - \${decimals} decimals\`);

// Check balance
const balance = await sbcToken.balanceOf('0xYourAddressHere');
console.log(\`Balance: \${balance}\`);
\`\`\`

## Signers

Signers are used to cryptographically sign transactions and messages. The SDK provides two signer implementations.

### PrivateKeySigner

A signer implementation that uses an ECDSA private key for signing operations.

**Warning:** This signer keeps the private key in memory. For production systems with high security requirements, consider using a hardware security module, key management service, or the ClefSigner.

#### createPrivateKeySigner()

Factory function to create a PrivateKeySigner instance.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| privateKey | \`Hex\` | The private key as a hex string (must include 0x prefix) |
| chainId | \`number\` | The chain ID used for transaction signing |

**Returns:** \`PrivateKeySigner\`

**Example:**

\`\`\`typescript
import { createPrivateKeySigner, radiusTestnet } from '@radiustechsystems/sdk';

const signer = createPrivateKeySigner(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  radiusTestnet.id
);

console.log('Address:', signer.address);
\`\`\`

#### RadiusSigner Interface

All signers implement the RadiusSigner interface:

\`\`\`typescript
interface RadiusSigner {
  readonly address: Address;
  readonly chainId: number;
  signTransaction(tx: TransactionRequest): Promise<Hex>;
  signMessage(message: string | Uint8Array): Promise<Hex>;
}
\`\`\`

### ClefSigner

A signer that delegates signing to an external Clef instance for enhanced security.

#### createClefSigner()

Factory function to create a ClefSigner instance.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| config | \`ClefSignerConfig\` | Configuration for the Clef connection |

**ClefSignerConfig:**

| Name | Type | Description |
|------|------|-------------|
| clefEndpoint | \`string\` | The Clef IPC or HTTP endpoint |
| address | \`Address\` | The address to use for signing |
| chainId | \`number\` | The chain ID used for transaction signing |

**Example:**

\`\`\`typescript
import { createClefSigner, radiusTestnet } from '@radiustechsystems/sdk';

const signer = createClefSigner({
  clefEndpoint: '/path/to/clef.ipc',
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  chainId: radiusTestnet.id,
});

// Use like any other signer
const receipt = await client.sendAndWait(signer, recipient, amount);
\`\`\`

## Address Utilities

The SDK provides utility functions for working with addresses. Note that \`Address\` is a type alias (not a class) matching viem's pattern.

### Types

\`\`\`typescript
// Address is a type alias for viem's Address type
type Address = \`0x\${string}\`;
\`\`\`

### Utility Functions

#### addressToBytes()

Convert an address to a Uint8Array.

\`\`\`typescript
import { addressToBytes, type Address } from '@radiustechsystems/sdk';

const addr: Address = '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1';
const bytes = addressToBytes(addr);
console.log('Address bytes:', bytes); // Uint8Array(20)
\`\`\`

#### isAddressEqual()

Check if two addresses are equal (case-insensitive).

\`\`\`typescript
import { isAddressEqual, type Address } from '@radiustechsystems/sdk';

const addr1: Address = '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1';
const addr2: Address = '0x742d35cc6634c0532925a3b844bc9e7595f7e9f1';

console.log(isAddressEqual(addr1, addr2)); // true
\`\`\`

#### toChecksumAddress()

Get the checksummed version of an address.

\`\`\`typescript
import { toChecksumAddress, type Address } from '@radiustechsystems/sdk';

const addr: Address = '0x742d35cc6634c0532925a3b844bc9e7595f7e9f1';
const checksummed = toChecksumAddress(addr);
console.log(checksummed); // '0x742d35Cc6634C0532925a3b844Bc9e7595f7E9F1'
\`\`\`

### Constants

#### ZERO_ADDRESS

The zero address constant.

\`\`\`typescript
import { ZERO_ADDRESS } from '@radiustechsystems/sdk';

console.log(ZERO_ADDRESS); // '0x0000000000000000000000000000000000000000'
\`\`\`

## Error Handling

The SDK provides a rich error hierarchy for better error handling and debugging. All errors extend \`RadiusError\`.

### RadiusError

Base error class with rich context.

\`\`\`typescript
class RadiusError extends Error {
  readonly shortMessage: string;
  readonly details?: string;
  readonly docsPath?: string;
  readonly cause?: Error | unknown;
  readonly meta?: Record<string, unknown>;

  walk(fn?: (err: unknown) => boolean): Error | unknown | null;
}
\`\`\`

### Error Types

#### Transaction Errors

| Error | Description |
|-------|-------------|
| \`TransactionFailedError\` | Transaction failed to execute |
| \`TransactionRevertedError\` | Transaction was reverted |
| \`TransactionTimeoutError\` | Transaction confirmation timed out |
| \`GasEstimationError\` | Gas estimation failed |
| \`NonceError\` | Invalid or conflicting nonce |

#### Account Errors

| Error | Description |
|-------|-------------|
| \`InsufficientBalanceError\` | Insufficient balance for transaction |
| \`SignerNotFoundError\` | No signer available |
| \`SigningError\` | Transaction signing failed |
| \`InvalidPrivateKeyError\` | Invalid private key format |
| \`InvalidAddressError\` | Invalid address format |

#### Contract Errors

| Error | Description |
|-------|-------------|
| \`ContractCallError\` | Contract call failed |
| \`ContractDeploymentError\` | Contract deployment failed |
| \`MissingAbiError\` | ABI not provided |
| \`AbiError\` | ABI encoding/decoding error |

### Error Type Exports

Per-action error types for type-safe catch blocks:

\`\`\`typescript
import type {
  SendTransactionErrorType,
  CallContractErrorType,
  ExecuteContractErrorType,
  DeployContractErrorType,
  SigningErrorType,
} from '@radiustechsystems/sdk';
\`\`\`

### Error Handling Example

\`\`\`typescript
import {
  RadiusError,
  TransactionFailedError,
  TransactionRevertedError,
  InsufficientBalanceError,
  SignerNotFoundError,
  GasEstimationError,
  ContractCallError,
} from '@radiustechsystems/sdk';

try {
  const receipt = await client.sendAndWait(signer, recipient, amount);
  console.log('Success:', receipt.transactionHash);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    console.error('Insufficient funds');
    console.error('Have:', error.balance);
    console.error('Need:', error.required);
  } else if (error instanceof TransactionRevertedError) {
    console.error('Transaction reverted');
    console.error('Reason:', error.revertReason);
    console.error('Hash:', error.transactionHash);
  } else if (error instanceof TransactionFailedError) {
    console.error('Transaction failed:', error.transactionHash);
  } else if (error instanceof GasEstimationError) {
    console.error('Gas estimation failed:', error.shortMessage);
  } else if (error instanceof RadiusError) {
    // Catch-all for SDK errors
    console.error('SDK Error:', error.shortMessage);
    console.error('Details:', error.details);
    console.error('Docs:', error.docsPath);

    // Walk the error chain to find root cause
    const rootCause = error.walk();
    if (rootCause) {
      console.error('Root cause:', rootCause);
    }
  } else {
    throw error; // Re-throw unknown errors
  }
}
\`\`\`

## Contracts

The SDK provides utilities for working with smart contracts.

### createERC20()

Create an ERC20 contract instance for token interactions.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | The token contract address |
| publicClient | \`PublicClient\` | The viem public client |

**Example:**

\`\`\`typescript
import { createRadiusClient, createERC20, radiusTestnet } from '@radiustechsystems/sdk';

const client = createRadiusClient({ chain: radiusTestnet });
const token = createERC20('0x...tokenAddress', client.publicClient);

// Read methods
const name = await token.name();
const symbol = await token.symbol();
const decimals = await token.decimals();
const totalSupply = await token.totalSupply();
const balance = await token.balanceOf('0x...address');
const allowance = await token.allowance('0x...owner', '0x...spender');
\`\`\`

### ERC20 Instance Methods

| Method | Returns | Description |
|--------|---------|-------------|
| \`name()\` | \`Promise<string>\` | Token name |
| \`symbol()\` | \`Promise<string>\` | Token symbol |
| \`decimals()\` | \`Promise<number>\` | Token decimals |
| \`totalSupply()\` | \`Promise<bigint>\` | Total supply |
| \`balanceOf(address)\` | \`Promise<bigint>\` | Balance of address |
| \`allowance(owner, spender)\` | \`Promise<bigint>\` | Allowance amount |

## Constants

### MAX_GAS

Maximum gas limit for transactions. Used to cap gas estimates.

\`\`\`typescript
import { MAX_GAS } from '@radiustechsystems/sdk';

console.log('Max gas:', MAX_GAS); // 1319413953330n
\`\`\`

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions.

### Re-exported viem Types

For convenience, the SDK re-exports commonly used viem types:

\`\`\`typescript
import type {
  Abi,
  Address,
  Chain,
  Hash,
  Hex,
  TransactionReceipt,
  Transport,
} from '@radiustechsystems/sdk';
\`\`\`

### SDK-specific Types

\`\`\`typescript
import type {
  RadiusClient,
  RadiusClientConfig,
  RadiusReceipt,
  RadiusSigner,
  ContractInstance,
  PrivateKeySigner,
  ClefSigner,
  ClefSignerConfig,
  PrivateKeySignerConfig,
} from '@radiustechsystems/sdk';
\`\`\`

## Migration from v1

If you're upgrading from v1 of the SDK, here are the key changes:

### Address Type

\`\`\`typescript
// v1 - Class-based
import { Address } from '@radiustechsystems/sdk';
const addr = new Address('0x...');
const hex = addr.hex();
const bytes = addr.bytes();
const equal = addr.equals(otherAddr);

// v2 - Type alias with utility functions
import { type Address, addressToBytes, isAddressEqual, ZERO_ADDRESS } from '@radiustechsystems/sdk';
const addr: Address = '0x...';
const bytes = addressToBytes(addr);
const equal = isAddressEqual(addr, otherAddr);
\`\`\`

### Receipt Status

\`\`\`typescript
// v1 - Number
if (receipt.status === 1) { /* success */ }

// v2 - String
if (receipt.status === 'success') { /* success */ }
\`\`\`

### Method Renames

\`\`\`typescript
// v1 (deprecated but still works)
const receipt = await client.sendSync(signer, to, value);
const receipt = await client.executeSync(contract, signer, method, ...args);

// v2 (recommended)
const receipt = await client.sendAndWait(signer, to, value);
const receipt = await client.executeAndWait(contract, signer, method, ...args);
\`\`\`

## Best Practices

### Error Handling

Always wrap SDK calls in try-catch blocks and handle specific error types:

\`\`\`typescript
try {
  const receipt = await client.sendAndWait(signer, to, amount);
} catch (error) {
  if (error instanceof InsufficientBalanceError) {
    // Handle insufficient funds
  } else if (error instanceof TransactionRevertedError) {
    // Handle revert
  } else if (error instanceof RadiusError) {
    // Handle other SDK errors
  }
}
\`\`\`

### Environment Variables

Use environment variables for sensitive configuration:

\`\`\`bash
export RADIUS_RPC_URL=https://rpc.testnet.radiustech.xyz
export RADIUS_PRIVATE_KEY=0x...
\`\`\`

\`\`\`typescript
const client = createRadiusClient({ chain: radiusTestnet });
// Automatically uses RADIUS_RPC_URL

const signer = createPrivateKeySigner(
  process.env.RADIUS_PRIVATE_KEY as \`0x\${string}\`,
  radiusTestnet.id
);
\`\`\`

### Gas Estimation

The SDK automatically estimates gas with a 20% safety margin. For predictable gas usage:

\`\`\`typescript
const gas = await client.estimateGas({
  to: recipient,
  value: amount,
});
console.log('Estimated gas:', gas);
\`\`\`
`;

// ============================================================================
// SDK TypeScript Events Documentation
// ============================================================================

const SDK_TYPESCRIPT_EVENTS_MDX = `---
title: Radius SDK Events API
description: Event handling and subscription API for the Radius TypeScript SDK
---

# Radius SDK Events API

The Events API provides utilities for subscribing to and handling blockchain events in the Radius network.

## Installation

The events module is included in the main SDK package:

\`\`\`bash
pnpm add @radiustechsystems/sdk
\`\`\`

## Import

\`\`\`typescript
import { createEventWatcher, parseEventLogs } from '@radiustechsystems/sdk/events';
\`\`\`

## Event Watching

### createEventWatcher()

Create an event watcher to subscribe to contract events.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| client | \`RadiusClient\` | The Radius client instance |
| contract | \`ContractInstance\` | Contract with ABI and address |
| eventName | \`string\` | Name of the event to watch |
| callback | \`(log: EventLog) => void\` | Callback for each event |
| options | \`WatchOptions\` | Optional configuration |

**WatchOptions:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| fromBlock | \`bigint\` | latest | Starting block number |
| pollingInterval | \`number\` | 4000 | Polling interval in ms |

**Example:**

\`\`\`typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { createEventWatcher } from '@radiustechsystems/sdk/events';

const client = createRadiusClient({ chain: radiusTestnet });

const ERC20_ABI = [
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
  },
] as const;

const unwatch = createEventWatcher(
  client,
  { address: tokenAddress, abi: ERC20_ABI },
  'Transfer',
  (log) => {
    console.log('Transfer event:');
    console.log('  From:', log.args.from);
    console.log('  To:', log.args.to);
    console.log('  Value:', log.args.value);
  },
  { pollingInterval: 2000 }
);

// Stop watching when done
unwatch();
\`\`\`

### parseEventLogs()

Parse raw logs into typed event objects.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| logs | \`Log[]\` | Raw transaction logs |
| abi | \`Abi\` | Contract ABI for decoding |

**Returns:** \`ParsedLog[]\` - Decoded event logs

**Example:**

\`\`\`typescript
import { parseEventLogs } from '@radiustechsystems/sdk/events';

const receipt = await client.sendAndWait(signer, to, value);
const parsedLogs = parseEventLogs(receipt.logs, ERC20_ABI);

for (const log of parsedLogs) {
  if (log.eventName === 'Transfer') {
    console.log('Transfer:', log.args);
  }
}
\`\`\`

## Event Types

### EventLog

Decoded event log with typed arguments.

\`\`\`typescript
interface EventLog<TArgs = unknown> {
  eventName: string;
  args: TArgs;
  address: Address;
  blockNumber: bigint;
  transactionHash: Hash;
  logIndex: number;
}
\`\`\`

### TransferEvent

Standard ERC20 Transfer event.

\`\`\`typescript
interface TransferEvent {
  from: Address;
  to: Address;
  value: bigint;
}
\`\`\`

### ApprovalEvent

Standard ERC20 Approval event.

\`\`\`typescript
interface ApprovalEvent {
  owner: Address;
  spender: Address;
  value: bigint;
}
\`\`\`

## Filtering Events

### By Block Range

\`\`\`typescript
const logs = await client.publicClient.getLogs({
  address: tokenAddress,
  event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
  fromBlock: 1000000n,
  toBlock: 1001000n,
});
\`\`\`

### By Topics

\`\`\`typescript
import { encodeEventTopics } from 'viem';

const topics = encodeEventTopics({
  abi: ERC20_ABI,
  eventName: 'Transfer',
  args: {
    from: senderAddress, // Filter by sender
  },
});

const logs = await client.publicClient.getLogs({
  address: tokenAddress,
  topics,
  fromBlock: 1000000n,
  toBlock: 'latest',
});
\`\`\`

## WebSocket Subscriptions

For real-time event subscriptions, use a WebSocket transport:

\`\`\`typescript
import { createRadiusClient, radiusTestnet } from '@radiustechsystems/sdk';
import { webSocket } from 'viem';

const client = createRadiusClient({
  chain: radiusTestnet,
  transport: webSocket('wss://rpc.testnet.radiustech.xyz'),
});

// Watch for new blocks
const unwatch = client.publicClient.watchBlocks({
  onBlock: (block) => {
    console.log('New block:', block.number);
  },
});

// Watch for pending transactions
const unwatchPending = client.publicClient.watchPendingTransactions({
  onTransactions: (hashes) => {
    console.log('Pending transactions:', hashes);
  },
});
\`\`\`

## Event Decoding

### Using viem's decodeEventLog

\`\`\`typescript
import { decodeEventLog } from 'viem';

const decoded = decodeEventLog({
  abi: ERC20_ABI,
  data: log.data,
  topics: log.topics,
});

console.log('Event:', decoded.eventName);
console.log('Args:', decoded.args);
\`\`\`

### Handling Unknown Events

\`\`\`typescript
try {
  const decoded = decodeEventLog({
    abi: contractAbi,
    data: log.data,
    topics: log.topics,
  });
  handleKnownEvent(decoded);
} catch (error) {
  // Unknown event - log topics for debugging
  console.log('Unknown event, topics:', log.topics);
}
\`\`\`

## Best Practices

### Memory Management

Always clean up event watchers when they're no longer needed:

\`\`\`typescript
// Store unwatch function
const unwatch = createEventWatcher(client, contract, 'Transfer', callback);

// Clean up on component unmount or when done
unwatch();
\`\`\`

### Error Handling

\`\`\`typescript
const unwatch = createEventWatcher(
  client,
  contract,
  'Transfer',
  (log) => {
    try {
      processTransfer(log);
    } catch (error) {
      console.error('Error processing event:', error);
    }
  }
);
\`\`\`

### Rate Limiting

For high-frequency events, consider batching:

\`\`\`typescript
let pendingLogs: EventLog[] = [];
let flushTimeout: NodeJS.Timeout;

const unwatch = createEventWatcher(
  client,
  contract,
  'Transfer',
  (log) => {
    pendingLogs.push(log);
    clearTimeout(flushTimeout);
    flushTimeout = setTimeout(() => {
      processBatch(pendingLogs);
      pendingLogs = [];
    }, 1000);
  }
);
\`\`\`
`;

// ============================================================================
// SDK TypeScript React Documentation
// ============================================================================

const SDK_TYPESCRIPT_REACT_MDX = `---
title: Radius SDK React Hooks
description: React hooks and components for the Radius TypeScript SDK
---

# Radius SDK React Hooks

The React module provides hooks and components for integrating Radius into React applications.

## Installation

\`\`\`bash
pnpm add @radiustechsystems/sdk @tanstack/react-query viem wagmi
\`\`\`

## Setup

### Provider Setup

Wrap your application with the necessary providers:

\`\`\`typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [radiusTestnet],
  transports: {
    [radiusTestnet.id]: http(),
  },
});

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
\`\`\`

## Hooks

### useRadiusClient()

Get a configured RadiusClient instance.

\`\`\`typescript
import { useRadiusClient } from '@radiustechsystems/sdk/react';

function MyComponent() {
  const client = useRadiusClient();

  const checkBalance = async () => {
    const balance = await client.getBalance(address);
    console.log('Balance:', balance);
  };

  return <button onClick={checkBalance}>Check Balance</button>;
}
\`\`\`

### useBalance()

Get the balance of an address with automatic updates.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | The address to check |
| options | \`UseBalanceOptions\` | Optional configuration |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| data | \`bigint \\| undefined\` | The balance in wei |
| isLoading | \`boolean\` | Loading state |
| error | \`Error \\| null\` | Error if any |
| refetch | \`() => void\` | Refetch balance |

**Example:**

\`\`\`typescript
import { useBalance } from '@radiustechsystems/sdk/react';

function BalanceDisplay({ address }: { address: Address }) {
  const { data: balance, isLoading, error } = useBalance(address);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Balance: {balance?.toString()} wei</div>;
}
\`\`\`

### useSendTransaction()

Send a transaction with React state management.

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| sendTransaction | \`(params) => void\` | Send transaction function |
| sendTransactionAsync | \`(params) => Promise<Hash>\` | Async version |
| data | \`Hash \\| undefined\` | Transaction hash |
| isLoading | \`boolean\` | Loading state |
| isSuccess | \`boolean\` | Success state |
| error | \`Error \\| null\` | Error if any |

**Example:**

\`\`\`typescript
import { useSendTransaction } from '@radiustechsystems/sdk/react';
import { parseEther } from 'viem';

function SendForm() {
  const { sendTransaction, isLoading, isSuccess, error } = useSendTransaction();

  const handleSend = () => {
    sendTransaction({
      to: '0x...',
      value: parseEther('1'),
    });
  };

  return (
    <div>
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send 1 USD'}
      </button>
      {isSuccess && <p>Transaction sent!</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
\`\`\`

### useWaitForReceipt()

Wait for a transaction receipt.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| hash | \`Hash \\| undefined\` | Transaction hash to wait for |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| data | \`RadiusReceipt \\| undefined\` | The receipt |
| isLoading | \`boolean\` | Waiting for confirmation |
| isSuccess | \`boolean\` | Transaction confirmed |
| error | \`Error \\| null\` | Error if any |

**Example:**

\`\`\`typescript
import { useSendTransaction, useWaitForReceipt } from '@radiustechsystems/sdk/react';

function TransactionFlow() {
  const { sendTransaction, data: hash } = useSendTransaction();
  const { data: receipt, isLoading: isConfirming } = useWaitForReceipt(hash);

  return (
    <div>
      <button onClick={() => sendTransaction({ to: '0x...', value: 1n })}>
        Send
      </button>

      {hash && <p>Hash: {hash}</p>}
      {isConfirming && <p>Confirming...</p>}
      {receipt && (
        <p>
          Confirmed! Status: {receipt.status}
          Gas used: {receipt.gasUsed.toString()}
        </p>
      )}
    </div>
  );
}
\`\`\`

### useContractRead()

Read data from a contract.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| address | \`Address\` | Contract address |
| abi | \`Abi\` | Contract ABI |
| functionName | \`string\` | Function to call |
| args | \`unknown[]\` | Function arguments |

**Example:**

\`\`\`typescript
import { useContractRead } from '@radiustechsystems/sdk/react';

const ERC20_ABI = [...] as const;

function TokenName({ address }: { address: Address }) {
  const { data: name, isLoading } = useContractRead({
    address,
    abi: ERC20_ABI,
    functionName: 'name',
  });

  if (isLoading) return <span>Loading...</span>;
  return <span>{name}</span>;
}
\`\`\`

### useContractWrite()

Write to a contract.

**Example:**

\`\`\`typescript
import { useContractWrite, useWaitForReceipt } from '@radiustechsystems/sdk/react';

function ApproveButton({ tokenAddress, spender, amount }) {
  const { write, data: hash, isLoading } = useContractWrite({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'approve',
  });

  const { isLoading: isConfirming, isSuccess } = useWaitForReceipt(hash);

  return (
    <button
      onClick={() => write({ args: [spender, amount] })}
      disabled={isLoading || isConfirming}
    >
      {isLoading ? 'Signing...' : isConfirming ? 'Confirming...' : 'Approve'}
    </button>
  );
}
\`\`\`

### useAccount()

Get the connected account information.

**Example:**

\`\`\`typescript
import { useAccount } from '@radiustechsystems/sdk/react';

function AccountInfo() {
  const { address, isConnected, isConnecting } = useAccount();

  if (isConnecting) return <div>Connecting...</div>;
  if (!isConnected) return <div>Not connected</div>;

  return <div>Connected: {address}</div>;
}
\`\`\`

### useConnect()

Connect to a wallet.

**Example:**

\`\`\`typescript
import { useConnect } from '@radiustechsystems/sdk/react';

function ConnectButton() {
  const { connect, connectors, isLoading, error } = useConnect();

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isLoading}
        >
          {connector.name}
        </button>
      ))}
      {error && <p>{error.message}</p>}
    </div>
  );
}
\`\`\`

### useDisconnect()

Disconnect the current wallet.

**Example:**

\`\`\`typescript
import { useDisconnect } from '@radiustechsystems/sdk/react';

function DisconnectButton() {
  const { disconnect } = useDisconnect();

  return <button onClick={() => disconnect()}>Disconnect</button>;
}
\`\`\`

## wagmi Connector

### radiusConnector

Custom wagmi connector for Radius wallets.

\`\`\`typescript
import { createConfig } from 'wagmi';
import { radiusConnector } from '@radiustechsystems/sdk/wagmi';
import { radiusTestnet } from '@radiustechsystems/sdk';

const config = createConfig({
  chains: [radiusTestnet],
  connectors: [
    radiusConnector({
      // Connector options
    }),
  ],
  transports: {
    [radiusTestnet.id]: http(),
  },
});
\`\`\`

## Error Handling in React

### Using Error Boundaries

\`\`\`typescript
import { RadiusError } from '@radiustechsystems/sdk';

class RadiusErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      if (error instanceof RadiusError) {
        return (
          <div className="error">
            <h2>SDK Error</h2>
            <p>{error.shortMessage}</p>
            {error.details && <p>{error.details}</p>}
          </div>
        );
      }
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
\`\`\`

### Hook-level Error Handling

\`\`\`typescript
function TransferForm() {
  const { sendTransaction, error } = useSendTransaction();

  useEffect(() => {
    if (error instanceof InsufficientBalanceError) {
      toast.error(\`Insufficient funds. Have: \${error.balance}, Need: \${error.required}\`);
    } else if (error instanceof TransactionRevertedError) {
      toast.error(\`Transaction reverted: \${error.revertReason}\`);
    } else if (error) {
      toast.error(error.message);
    }
  }, [error]);

  // ...
}
\`\`\`

## Best Practices

### Query Key Management

\`\`\`typescript
// Use consistent query keys for caching
const balanceQueryKey = ['balance', address] as const;

const { data } = useQuery({
  queryKey: balanceQueryKey,
  queryFn: () => client.getBalance(address),
});
\`\`\`

### Optimistic Updates

\`\`\`typescript
function TransferButton({ amount }) {
  const queryClient = useQueryClient();
  const { sendTransactionAsync } = useSendTransaction();

  const handleTransfer = async () => {
    // Optimistically update balance
    queryClient.setQueryData(['balance', address], (old) => old - amount);

    try {
      await sendTransactionAsync({ to, value: amount });
    } catch (error) {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['balance', address] });
      throw error;
    }
  };
}
\`\`\`

### Polling Configuration

\`\`\`typescript
const { data: balance } = useBalance(address, {
  // Poll every 10 seconds
  refetchInterval: 10000,
  // Only poll when window is focused
  refetchIntervalInBackground: false,
});
\`\`\`
`;

// ============================================================================
// Write files
// ============================================================================

console.log('Generating documentation...\n');

writeFileSync(join(DOCS_DIR, 'sdk-typescript.mdx'), SDK_TYPESCRIPT_MDX);
console.log('  sdk-typescript.mdx');

writeFileSync(join(DOCS_DIR, 'sdk-typescript-events.mdx'), SDK_TYPESCRIPT_EVENTS_MDX);
console.log('  sdk-typescript-events.mdx');

writeFileSync(join(DOCS_DIR, 'sdk-typescript-react.mdx'), SDK_TYPESCRIPT_REACT_MDX);
console.log('  sdk-typescript-react.mdx');

console.log('\nDocumentation generated successfully!');
console.log(`Output directory: ${DOCS_DIR}`);
