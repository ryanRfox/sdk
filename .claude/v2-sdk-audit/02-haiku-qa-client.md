# Haiku QA: Core Client Audit

## Summary

The Radius SDK V2 core client (`typescript/src/client/`) demonstrates solid code quality with proper abstractions, comprehensive type safety, and good error handling. The implementation successfully leverages viem's native types and provides a clean API surface. However, several edge cases and potential issues were identified that warrant attention before production deployment.

**Overall Assessment**: Code is well-structured and maintainable with some minor improvements needed for robustness.

## Findings

### 1. Missing Error Handling for Chain ID Fallback
- **Severity**: Medium
- **File**: `client.ts:444`
- **Description**: The `getChainId()` method uses a fallback that may throw if the publicClient chain is undefined and the RPC call fails. The expression `publicClient.chain?.id ?? (await publicClient.getChainId())` assumes the fallback RPC call will always succeed, but provides no error context if it fails.
- **Suggested Fix**:
  ```typescript
  async getChainId(): Promise<bigint> {
    try {
      const chainId = publicClient.chain?.id ?? (await publicClient.getChainId());
      return BigInt(chainId);
    } catch (error) {
      throw new Error(`Failed to get chain ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  ```

### 2. Insufficient Input Validation in call() Method
- **Severity**: Medium
- **File**: `client.ts:472-509`
- **Description**: The `call()` method validates that ABI and address exist but doesn't validate that the method name exists in the ABI. If an invalid method name is provided, viem's `encodeFunctionData()` will throw a cryptic error without SDK-specific context.
- **Suggested Fix**: Validate the method exists in the ABI before encoding:
  ```typescript
  async call<T = unknown>(
    contract: ContractInstance,
    method: string,
    ...args: unknown[]
  ): Promise<T> {
    if (!contract.abi) throw new Error('Contract ABI is required');
    if (!contract.address) throw new Error('Contract address is required');

    // Validate method exists
    const methodExists = contract.abi.some(
      (item): item is any =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        item.type === 'function' &&
        'name' in item &&
        item.name === method
    );
    if (!methodExists) {
      throw new Error(`Method '${method}' not found in contract ABI`);
    }
    // ... rest of implementation
  }
  ```

### 3. Contract Deployment: Missing Constructor Argument Validation
- **Severity**: High
- **File**: `client.ts:575-620`
- **Description**: In `deployContract()`, if constructor arguments are provided but the ABI has no constructor, the args are silently ignored with no warning. Additionally, if the number of args doesn't match the constructor inputs, the error will come from viem with poor context. The code also lacks validation that constructor arguments match the ABI specification.
- **Suggested Fix**:
  ```typescript
  async deployContract(
    signer: LocalAccount,
    bytecode: Hex,
    abi: Abi,
    ...args: unknown[]
  ): Promise<{ address: ViemAddress; receipt: RadiusReceipt }> {
    const ctorItem = abi.find(
      (item): item is AbiConstructor =>
        typeof item === 'object' &&
        item !== null &&
        'type' in item &&
        item.type === 'constructor',
    );

    // Validate constructor args match ABI
    if (args.length > 0) {
      if (!ctorItem) {
        throw new Error('Constructor arguments provided but no constructor found in ABI');
      }
      if (args.length !== ctorItem.inputs.length) {
        throw new Error(
          `Constructor expects ${ctorItem.inputs.length} arguments but ${args.length} were provided`
        );
      }
    }
    // ... rest of implementation
  }
  ```

### 4. Race Condition in Transaction Signing
- **Severity**: High
- **File**: `client.ts:388-438`
- **Description**: The `signAndSendTransaction()` function retrieves the nonce at the start but then waits for gas estimation. If another transaction is sent between these calls, the nonce could become stale, causing transaction conflicts. This is particularly problematic when multiple transactions are sent rapidly from the same account.
- **Suggested Fix**: Consider implementing a nonce tracking mechanism or reordering operations to get nonce closer to signing:
  ```typescript
  async function signAndSendTransaction(
    signer: LocalAccount,
    tx: {
      to?: ViemAddress;
      data?: Hex;
      value?: bigint;
      gas?: bigint;
    },
  ): Promise<Hash> {
    // Estimate gas FIRST (doesn't depend on nonce)
    let gas: bigint;
    if (tx.gas !== undefined) {
      gas = tx.gas;
    } else {
      const estimate = await publicClient.estimateGas({
        account: signer.address,
        to: tx.to,
        data: tx.data,
        value: tx.value,
      });
      const margin = estimate / 5n;
      gas = estimate + margin;
      if (gas > MAX_GAS) {
        gas = MAX_GAS;
      }
    }

    // Get nonce LAST (immediately before signing)
    const nonce = await publicClient.getTransactionCount({
      address: signer.address,
      blockTag: 'pending',
    });

    // Sign and send...
  }
  ```

### 5. Type Safety: Insufficient ABI Constructor Type Guard
- **Severity**: Low
- **File**: `client.ts:585-591`
- **Description**: The type guard for AbiConstructor performs runtime checks but the type itself is only defined locally. The filtering logic is duplicated between `deployContract()` and the local type guard, making it difficult to maintain and prone to bugs if the logic diverges.
- **Suggested Fix**: Export the `AbiConstructor` type and create a reusable type guard utility:
  ```typescript
  export type AbiConstructor = {
    type: 'constructor';
    inputs: readonly AbiParameter[];
    stateMutability: 'nonpayable' | 'payable';
  };

  function isAbiConstructor(item: unknown): item is AbiConstructor {
    return (
      typeof item === 'object' &&
      item !== null &&
      'type' in item &&
      (item as any).type === 'constructor' &&
      'inputs' in item &&
      Array.isArray((item as any).inputs) &&
      'stateMutability' in item
    );
  }
  ```

### 6. Null Coalescing Without Type Narrowing
- **Severity**: Low
- **File**: `client.ts:375-376`
- **Description**: In `toRadiusReceipt()`, the code uses `receipt.to ?? null` and `receipt.contractAddress ?? null`. While this works, it's slightly redundant since viem already uses `null` for absent values. This pattern isn't harmful but adds minimal value.
- **Suggested Fix**: Simplify to direct assignment if the viem type is already `| null`:
  ```typescript
  function toRadiusReceipt(receipt: TransactionReceipt): RadiusReceipt {
    return {
      transactionHash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to, // Already null | Address from viem
      contractAddress: receipt.contractAddress, // Already null | Address from viem
      gasUsed: receipt.gasUsed,
      status: receipt.status,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      logs: receipt.logs,
    };
  }
  ```

### 7. Missing Validation for Contract Instance in execute() Method
- **Severity**: Medium
- **File**: `client.ts:511-536`
- **Description**: Similar to `call()`, the `execute()` method validates ABI and address but doesn't validate the method exists in the ABI. If an invalid method is provided, it will fail during encoding with poor error context.
- **Suggested Fix**: Apply the same method validation as recommended for `call()`.

### 8. Environment Variable Fallback Has Undocumented Behavior
- **Severity**: Low
- **File**: `client.ts:325-342`
- **Description**: The `getRpcUrl()` function checks for both `RADIUS_RPC_URL` and `RADIUS_ENDPOINT` environment variables but this dual-variable approach is not documented in the JSDoc comment for `createRadiusClient()`. Users may not know which environment variable to set.
- **Suggested Fix**: Update JSDoc to clarify the precedence:
  ```typescript
  /**
   * Creates a new RadiusClient instance.
   *
   * RPC URL Resolution (in order of precedence):
   * 1. Explicit `transport` in config
   * 2. `RADIUS_RPC_URL` environment variable
   * 3. `RADIUS_ENDPOINT` environment variable
   * 4. Chain configuration default
   *
   * @param config - Configuration options for the client
   * @returns A RadiusClient instance
   */
  ```

### 9. DeployContract Error Messages Could Be More Specific
- **Severity**: Low
- **File**: `client.ts:608-614`
- **Description**: The error messages for deployment failures are generic. Additional context like transaction hash or gas usage would help with debugging failed deployments.
- **Suggested Fix**:
  ```typescript
  if (!receipt.contractAddress) {
    throw new Error(
      `Contract deployment failed: no contract address in receipt (tx: ${receipt.transactionHash})`
    );
  }

  if (receipt.status !== 'success') {
    throw new Error(
      `Contract deployment failed: transaction reverted (tx: ${receipt.transactionHash}, gasUsed: ${receipt.gasUsed})`
    );
  }
  ```

### 10. Index.ts Re-exports Could Use More Explicit Documentation
- **Severity**: Low
- **File**: `index.ts:1-20`
- **Description**: The index.ts file re-exports types from viem without any introductory comment explaining which are from viem and which are SDK-specific. This could confuse users about the API surface.
- **Suggested Fix**: Add header comments:
  ```typescript
  /**
   * The client package provides the primary interface for interacting with the Radius platform.
   * Includes the createRadiusClient factory function and related types for connecting to and
   * communicating with Radius JSON-RPC endpoints.
   */

  // SDK-specific exports
  export {
    type ContractInstance,
    createRadiusClient,
    MAX_GAS,
    type RadiusClient,
    type RadiusClientConfig,
    type RadiusReceipt,
  } from './client';

  // Re-exported viem types for convenience
  export type { Abi, Address, Chain, Hash, Hex, TransactionReceipt, Transport } from './client';
  ```

## Recommendation

- **Escalate**: Yes
- **Rationale**:
  1. **High-severity issues identified**: The race condition in transaction signing (#4) and constructor argument validation (#3) are significant edge cases that could cause unexpected behavior in production.
  2. **Type safety improvements needed**: While the code uses TypeScript well, adding more granular input validation would prevent cryptic errors from viem bubbling up to users.
  3. **Maintainability concern**: Duplicate type guards and validation logic (#5) should be refactored into reusable utilities before the codebase grows.
  4. **Before release**: The issues marked as "High" severity should be addressed before shipping V2. The "Medium" severity issues improve robustness and should be prioritized. "Low" severity issues are polish-level improvements that enhance documentation and code clarity.

**Suggested Priority Order for Fixes**:
1. Fix race condition in `signAndSendTransaction()` (High)
2. Add constructor argument validation in `deployContract()` (High)
3. Add method existence validation in `call()` and `execute()` (Medium)
4. Improve error handling in `getChainId()` (Medium)
5. Create reusable ABI type guards (Low)
6. Improve error messages and documentation (Low)
