# Haiku QA: Error Handling Audit

## Summary

The Radius SDK V2 error handling system demonstrates a well-structured, TypeScript-first approach with comprehensive error hierarchy and type safety. The codebase defines 12 specialized error classes organized across 4 modules (base, account, contract, transaction) with proper inheritance from `RadiusError`. However, critical implementation gaps exist: **error classes are defined but not actually used in the client code**, which continues to throw generic `Error` objects instead. This is a significant discrepancy between the error system design and actual implementation.

## Findings

### 1. Error Classes Defined But Not Implemented in Client

- **Severity**: Critical
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/client/client.ts` (lines 337, 478, 481, 498, 518, 521, 609, 613)
- **Description**: The client throws generic `Error` objects despite having 12 purpose-built error classes available. The error classes (TransactionFailedError, InsufficientBalanceError, SignerNotFoundError, etc.) are exported from the SDK but never imported or used in client.ts. Example errors:
  - Line 337: `throw new Error(...)` - no specific error type
  - Line 478: `throw new Error('Contract ABI is required')` - should use MissingAbiError
  - Line 481: `throw new Error('Contract address is required')` - should use a ContractConfigError
  - Line 609-613: Contract deployment failures - should use ContractDeploymentError
- **Suggested Fix**: Import the error classes into client.ts and replace all `throw new Error()` statements with the appropriate typed error classes. For example:
  ```typescript
  import { MissingAbiError, ContractCallError } from '../errors';
  // Replace: throw new Error('Contract ABI is required');
  // With: throw new MissingAbiError();
  ```

### 2. Missing Error Class for Configuration/Validation Errors

- **Severity**: High
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/` (all modules)
- **Description**: Several error scenarios in client.ts don't map to defined error classes:
  - "Contract address is required" - No specific error class exists (not InvalidAddressError)
  - "No data returned from contract call" - No specific error class exists
  - Generic contract configuration validation errors lack proper categorization
- **Suggested Fix**: Add a new error class to contract.ts:
  ```typescript
  export class ContractConfigurationError extends RadiusError {
    override readonly name = 'ContractConfigurationError';
    constructor(message: string, options: RadiusErrorOptions = {}) {
      super(message, {
        shortMessage: 'Invalid contract configuration',
        ...options,
        docsPath: options.docsPath ?? '/docs/sdk/errors#contract-configuration',
      });
    }
  }
  ```

### 3. Missing Error Class for Call/Response Errors

- **Severity**: High
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/contract.ts` (line 10)
- **Description**: The "No data returned from contract call" error (client.ts:498) doesn't map to any error class. ContractCallError exists but is too generic for this specific response validation scenario.
- **Suggested Fix**: Add a new error class:
  ```typescript
  export class InvalidContractResponseError extends RadiusError {
    override readonly name = 'InvalidContractResponseError';
    constructor(message: string, options: RadiusErrorOptions = {}) {
      super(message, {
        shortMessage: 'Invalid contract response',
        ...options,
        docsPath: options.docsPath ?? '/docs/sdk/errors#invalid-contract-response',
      });
    }
  }
  ```

### 4. Inconsistent Short Messages in TransactionFailedError

- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/transaction.ts` (lines 22-43)
- **Description**: TransactionFailedError doesn't set a shortMessage in its constructor. All other error classes explicitly provide a shortMessage (e.g., "Insufficient balance", "Contract call failed"), but TransactionFailedError relies on the default message parameter. This creates inconsistency in the error interface.
- **Suggested Fix**: Add shortMessage explicitly:
  ```typescript
  constructor(message: string, options: RadiusErrorOptions & {...} = {}) {
    super(message, {
      shortMessage: 'Transaction failed',  // Add this line
      ...options,
      docsPath: options.docsPath ?? '/docs/sdk/errors#transaction-failed',
    });
  }
  ```

### 5. Incomplete Error Type Union Coverage

- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/index.ts` (lines 66-104)
- **Description**: Error type unions for action functions are defined but lack complete coverage:
  - `SendTransactionErrorType` includes SignerNotFoundError but doesn't include SigningError or InvalidPrivateKeyError
  - `DeployContractErrorType` doesn't include InvalidAddressError (relevant when validating constructor args)
  - No union type defined for account operations (SigningError, InvalidAddressError, etc.)
- **Suggested Fix**: Expand union types:
  ```typescript
  export type SendTransactionErrorType =
    | InsufficientBalanceError
    | TransactionFailedError
    | TransactionRevertedError
    | TransactionTimeoutError
    | SignerNotFoundError
    | SigningError  // Add this
    | GasEstimationError
    | NonceError;

  // Add new union type
  export type AccountOperationErrorType =
    | SignerNotFoundError
    | SigningError
    | InvalidPrivateKeyError
    | InvalidAddressError;
  ```

### 6. Missing Tests for Error Classes

- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/test/integration/client.integration.test.ts` (lines 254-267)
- **Description**: Error handling tests are minimal and generic. The "Error Handling" test suite only validates viem's built-in address validation, not the SDK's custom error classes. No tests verify that specific error classes are thrown in expected scenarios.
- **Suggested Fix**: Add comprehensive error handling tests:
  ```typescript
  describe('SDK Error Classes', () => {
    it('should throw MissingAbiError when ABI is missing', async () => {
      await expect(client.call({ address: '0x...', abi: undefined }))
        .rejects.toThrow(MissingAbiError);
    });

    it('should throw InsufficientBalanceError with metadata', async () => {
      const error = await expectError(() => client.sendAndWait(...));
      expect(error).toBeInstanceOf(InsufficientBalanceError);
      expect(error.balance).toBeDefined();
      expect(error.required).toBeDefined();
    });
  });
  ```

### 7. Incomplete Documentation Path Usage

- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/` (all error classes)
- **Description**: All error classes include `docsPath` fields with hardcoded documentation paths (e.g., `/docs/sdk/errors#signer-not-found`), but there's no evidence these documentation pages exist or are maintained. Without corresponding documentation, the docsPath feature provides minimal value.
- **Suggested Fix**: Verify and implement documentation pages at the specified paths, or consider making docsPath optional and only including it for critical errors.

### 8. Inconsistent Constructor Patterns

- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/` (all files)
- **Description**: Some error classes have default messages (SignerNotFoundError, InvalidPrivateKeyError) while others require explicit messages (ContractCallError, TransactionFailedError). This inconsistency makes the API less intuitive.
- **Suggested Fix**: Standardize the pattern. For errors with obvious defaults, provide them:
  ```typescript
  // Current inconsistency
  export class SignerNotFoundError extends RadiusError {
    constructor(message = 'Signer is required', options: RadiusErrorOptions = {}) // Has default

  export class ContractCallError extends RadiusError {
    constructor(message: string, options: ...) // Requires explicit message
  ```

### 9. Missing Error for Unsupported Operations

- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/errors/` (all modules)
- **Description**: The error hierarchy doesn't include a class for unsupported operations or feature flags. Common patterns like "method not supported" only exist in server/errors.ts (MethodNotSupportedError) but not in the client error hierarchy.
- **Suggested Fix**: Consider adding a generic error for operational constraint violations if such scenarios arise in client code.

## Recommendation

- **Escalate**: Yes
- **Rationale**:
  1. **Critical Issue**: Error classes are completely unused in the primary client implementation, representing wasted architecture. This is a high-visibility problem that directly undermines the SDK's error handling design.
  2. **Type Safety Gap**: Client code throws generic Error objects instead of typed errors, losing the benefit of TypeScript's type system and IDE auto-completion for error handling.
  3. **API Inconsistency**: Users following SDK examples (which show error type checking) will encounter generic Errors instead, creating confusion and support burden.
  4. **Quick Win**: Implementing the critical fix (using actual error classes in client.ts) is straightforward and provides immediate value.
  5. **Missing Coverage**: The 3-5 additional missing error classes (ContractConfigurationError, InvalidContractResponseError) should be added before the full implementation, ensuring complete coverage of all error scenarios.

**Priority Order for Fixes**:
1. Implement error class usage in client.ts (Critical)
2. Add missing error classes (High)
3. Fix TransactionFailedError shortMessage (Medium)
4. Expand error type unions (Medium)
5. Add comprehensive tests (Medium)
6. Document discrepancies and optimize patterns (Low)
