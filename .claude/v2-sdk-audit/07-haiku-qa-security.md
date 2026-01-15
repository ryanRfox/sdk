# Haiku QA: Security Audit

## Summary

Comprehensive security audit of Radius SDK V2 codebase (typescript/src/). The audit reviewed 58 main source TypeScript files covering cryptography, authentication, server handlers, transport layers, and contract interactions. Overall security posture is solid with proper use of viem library for cryptographic operations, secure error handling, and reasonable input validation. However, several areas require attention regarding input validation, error information disclosure, and edge case handling.

**Key Findings**: 4 Medium-severity issues, 1 Low-severity issue

---

## Findings

### 1. Insufficient Input Validation in feePayer Handler
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:228-260`
- **Description**: The feePayer handler accepts JSON-RPC requests without validating the structure or content of body.params. The code assumes body.params is a non-empty array and directly accesses [0] as a Hex string without validation.
- **Attack Vector**:
  - Malicious client sends `{ method: 'eth_sendRawTransaction', params: [] }` causing undefined access
  - Malicious client sends `{ method: 'eth_sendRawTransaction', params: [null] }` or `{ method: 'eth_sendRawTransaction', params: [123] }`
  - Invalid transaction data could reach the blockchain node
- **Code Reference**:
  ```typescript
  const [serializedTx] = body.params as [Hex];  // No validation
  // Later passed directly to client.request()
  ```
- **Suggested Fix**:
  - Validate that body.params is a non-empty array
  - Validate that params[0] is a valid hex string matching the Hex type pattern
  - Add explicit type guards or use a validation library (zod, yup)
  - Throw InvalidRequestError if validation fails
  ```typescript
  if (!Array.isArray(body.params) || body.params.length === 0) {
    return Response.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32602, message: 'Invalid params: expected array with at least one element' }
    });
  }
  const serializedTx = body.params[0];
  if (typeof serializedTx !== 'string' || !serializedTx.startsWith('0x')) {
    return Response.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32602, message: 'Invalid params: first param must be a hex string' }
    });
  }
  ```

### 2. Missing Validation in keyManager POST Endpoint
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:157-175`
- **Description**: The keyManager POST endpoint /:id does not validate the credential ID parameter. Long or specially crafted IDs could cause issues with the KV store or allow injection-style attacks.
- **Attack Vector**:
  - Attacker sends POST with path traversal: `POST /:id` where id contains `../` or other special characters
  - Attacker sends POST with extremely long credential ID (millions of characters)
  - Attacker sends POST with control characters or unicode sequences that could confuse the KV store
  - Credential ID is used directly as KV key without sanitization: `credential:${id}`
- **Code Reference**:
  ```typescript
  const { id } = params;  // No validation
  await kv.set(`credential:${id}`, publicKey);  // Directly used as KV key
  ```
- **Suggested Fix**:
  - Implement credential ID validation (alphanumeric, length limits)
  - Reject IDs with path traversal patterns
  - Add maximum length enforcement
  ```typescript
  const { id } = params;
  if (!/^[a-zA-Z0-9_-]{1,255}$/.test(id)) {
    return Response.json(
      { error: 'Invalid credential ID format' },
      { status: 400 }
    );
  }
  await kv.set(`credential:${id}`, publicKey);
  ```

### 3. ABI Constructor Validation Missing in ABI.pack()
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/common/abi.ts:46-67`
- **Description**: The ABI.pack() method accepts a function name parameter without validation. An empty string triggers special constructor handling, but there's no validation that the provided method name exists in the ABI or matches the function signature.
- **Attack Vector**:
  - Caller passes invalid method name that doesn't exist in ABI
  - viem's encodeAbiParameters throws unhelpful error without validation
  - Code assumes constructor always exists when name === ''
  - No validation of args count or types before encoding
- **Code Reference**:
  ```typescript
  const encoded = encodeFunctionData({
    abi: this.abi,
    functionName: name,  // No validation that name exists in ABI
    args: args as readonly unknown[],  // No type checking
  });
  ```
- **Suggested Fix**:
  - Validate that function name exists in ABI before encoding
  - Validate argument count and types match ABI specification
  - Provide clear error messages for mismatches
  ```typescript
  pack(name: string, ...args: unknown[]): Uint8Array {
    if (name === '') {
      const ctorItem = this.abi.find((item) => item.type === 'constructor');
      if (!ctorItem || ctorItem.type !== 'constructor') {
        return new Uint8Array(0);
      }
      if (args.length !== (ctorItem.inputs?.length ?? 0)) {
        throw new Error(
          `Constructor expects ${ctorItem.inputs?.length ?? 0} arguments, got ${args.length}`
        );
      }
      const encoded = encodeAbiParameters(ctorItem.inputs, args as readonly unknown[]);
      return hexToBytes(encoded);
    }

    // Validate function exists in ABI
    const funcItem = this.abi.find(
      (item) => item.type === 'function' && item.name === name
    ) as any;
    if (!funcItem) {
      throw new Error(`Function ${name} not found in ABI`);
    }

    const encoded = encodeFunctionData({
      abi: this.abi,
      functionName: name,
      args: args as readonly unknown[],
    });
    return hexToBytes(encoded);
  }
  ```

### 4. Error Message Information Disclosure in feePayer
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:254-260`
- **Description**: The error handler in feePayer returns the full error message to the client, which could expose internal implementation details, stack traces, or sensitive information about the application's architecture.
- **Attack Vector**:
  - Attacker causes an error (e.g., network failure, invalid transaction)
  - Error message is returned verbatim to client
  - If viem or node internal errors occur, technical details leak
  - Information leak helps attacker understand system architecture
- **Code Reference**:
  ```typescript
  catch (error) {
    return Response.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: (error as Error).message },  // Full error exposed
    });
  }
  ```
- **Suggested Fix**:
  - Log full error server-side
  - Return generic error message to client
  - Use error codes instead of raw messages
  ```typescript
  catch (error) {
    console.error('feePayer handler error:', error);
    const message = error instanceof Error ? error.message : String(error);

    return Response.json({
      jsonrpc: '2.0',
      id: body?.id ?? null,
      error: {
        code: -32603,
        message: 'Internal server error: transaction processing failed'
      },
    });
  }
  ```

### 5. Console.error Leaks Error Information to Logs
- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/internal/requestListener.ts:83-94`
- **Description**: Error handler uses console.error to log errors, which may output sensitive information to stdout/stderr. In containerized environments or cloud platforms, logs are often stored and indexed, creating a potential information disclosure vector.
- **Attack Vector**:
  - Errors containing sensitive data are logged to console
  - Log aggregation systems (CloudWatch, DataDog, ELK) index the logs
  - Authorized users with log access can see error details
  - Stack traces may reveal internal paths or dependencies
- **Code Reference**:
  ```typescript
  function defaultErrorHandler(error: unknown): Response {
    console.error(error)  // Logs full error to stdout
    return internalServerError()
  }
  ```
- **Suggested Fix**:
  - Implement structured logging with error filtering
  - Redact sensitive information from logs
  - Use environment-appropriate logging levels
  - Consider implementing a logging interface that can be plugged into different systems
  ```typescript
  function defaultErrorHandler(error: unknown, logger?: (msg: string, err?: unknown) => void): Response {
    const logger_fn = logger ?? console.error;
    if (error instanceof Error && error.message.includes('private') || error.message.includes('secret')) {
      logger_fn('Authentication/authorization error occurred');
    } else {
      logger_fn('Request processing error', error instanceof Error ? { message: error.message } : error);
    }
    return internalServerError()
  }
  ```

---

## Additional Security Observations (Best Practices)

### Positive Findings

1. **Proper Cryptographic Usage**: The SDK correctly delegates cryptographic operations to viem library, avoiding custom crypto implementations.
   - Location: `/Users/fox/Getting Started/radius-sdk/typescript/src/crypto/utils.ts`
   - Uses viem's `privateKeyToAccount()`, `keccak256()`, and signing operations

2. **Secure Random Generation**: Challenge generation uses crypto.getRandomValues()
   - Location: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:132-134`
   - Proper use of cryptographically secure random for WebAuthn challenges

3. **Type Safety**: Extensive use of TypeScript types for address, Hex, and other security-critical types
   - Prevents many common errors like mixing string and Hex types

4. **No Hardcoded Secrets**: No hardcoded API keys, passwords, or private keys found in the codebase

5. **Proper Error Hierarchy**: Custom error classes extend from base RadiusError with structured information
   - Allows for proper error handling and logging without exposing sensitive details

### Items to Monitor

1. **Private Key Handling in Applications**: While the SDK properly handles private keys via viem's LocalAccount, applications using createPrivateKeySigner() must ensure they:
   - Never log the private key
   - Never transmit it over unencrypted channels
   - Store it securely (recommend using environment variables or secure vaults)

2. **RPC Endpoint Security**: Applications should ensure:
   - RPC endpoints use HTTPS (not HTTP)
   - Appropriate rate limiting and authentication is in place
   - RPC endpoints are not exposed to untrusted clients

3. **KV Store Security**: The keyManager depends on KV store security:
   - Ensure Kv.cloudflare() is configured with proper access controls
   - Credentials stored in KV should be treated as sensitive
   - Consider encrypting public keys in KV store for additional protection

---

## Recommendation

- **Escalate**: Yes
- **Rationale**:
  - 4 Medium-severity issues require fixes before production deployment
  - Input validation gaps could allow malformed requests to reach blockchain nodes
  - Error information disclosure could leak system details
  - Issues are straightforward to fix with proper validation patterns
  - No critical vulnerabilities found, but medium issues impact reliability and information security
  - Recommend implementing fixes before V2 release

---

## Audit Methodology

- **Scope**: Full typescript/src/ directory (58 main source files)
- **Coverage**: Input validation, cryptography, error handling, data exposure, CORS/headers, authentication, authorization
- **Tools**: Pattern matching for security-sensitive operations (console.log, throw, error, JSON.parse, privateKey, etc.)
- **Standards**: OWASP Top 10, CWE Common Weakness Enumeration, Ethereum/blockchain security best practices

---

## Files Reviewed

Core security-relevant files:
- `/typescript/src/server/Handler.ts` - Request handling, fee payer, key manager
- `/typescript/src/server/internal/requestListener.ts` - HTTP request processing
- `/typescript/src/auth/privatekey/signer.ts` - Private key handling
- `/typescript/src/crypto/utils.ts` - Cryptographic operations
- `/typescript/src/common/abi.ts` - ABI parsing and encoding
- `/typescript/src/transport/interceptor.ts` - Transport layer
- `/typescript/src/accounts/account.ts` - Account management
- `/typescript/src/server/errors.ts` - Error definitions
- `/typescript/src/errors/base.ts` - Base error class
