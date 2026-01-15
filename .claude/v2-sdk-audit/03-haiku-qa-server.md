# Haiku QA: Server Module Audit

## Summary

The Radius SDK V2 server module demonstrates solid foundational architecture with proper separation of concerns, good TypeScript type coverage, and comprehensive error handling infrastructure. The module provides three main entry points (Handler.from, Handler.keyManager, Handler.feePayer, and Handler.compose) for managing HTTP requests and WebAuthn credentials. However, several issues ranging from low to high severity were identified, particularly around input validation, error handling consistency, unsafe type casting, and edge case handling.

## Findings

### 1. Unsafe Type Casting in Handler.ts feePayer
- **Severity**: High
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:234`
- **Description**: The feePayer handler extracts the serialized transaction from params without validation. The destructuring `const [serializedTx] = body.params as [Hex];` assumes params is an array with at least one element and that it's a valid Hex string. If params is undefined, empty, or contains invalid data, this will silently fail or pass malformed data to the client request.
- **Suggested Fix**: Add explicit validation before destructuring:
  ```typescript
  if (!Array.isArray(body.params) || body.params.length === 0) {
    return Response.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32602, message: 'Invalid params: expected [serializedTx]' }
    });
  }
  const [serializedTx] = body.params as [Hex];
  if (typeof serializedTx !== 'string' || !serializedTx.startsWith('0x')) {
    return Response.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32602, message: 'Invalid params: serializedTx must be a hex string' }
    });
  }
  ```

### 2. Unsafe Type Casting in requestListener.ts
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/internal/requestListener.ts:208, 220, 224`
- **Description**: Multiple unsafe type casts using `as any` on response.headers iteration (line 208) and res.writeHead call (line 220). These bypass TypeScript's type safety and could lead to runtime errors if the response object structure doesn't match expectations.
- **Suggested Fix**: Replace `as any` casts with proper type definitions:
  - Line 208: Define a proper Headers interface instead of casting
  - Line 220: Use explicit type assertion with proper type guard
  - Line 224: Consider creating a typed wrapper instead of casting

### 3. Missing Request Body Validation in keyManager POST
- **Severity**: High
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:159-169`
- **Description**: The keyManager POST endpoint parses JSON without error handling and doesn't validate the structure comprehensively. If request.json() throws (malformed JSON), it will propagate unhandled. The credential validation only checks if the field exists but doesn't validate its internal structure (e.g., response.clientDataJSON could be any type).
- **Suggested Fix**: Wrap JSON parsing in try-catch and add structural validation:
  ```typescript
  router.post(`${path}/:id`, async ({ params, request }) => {
    const { id } = params;
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'Malformed JSON' }, { status: 400 });
    }

    const { credential, publicKey } = body as any;

    if (!credential || typeof credential !== 'object') {
      return Response.json({ error: 'Invalid credential object' }, { status: 400 });
    }
    if (!publicKey || typeof publicKey !== 'string') {
      return Response.json({ error: 'Invalid publicKey' }, { status: 400 });
    }
    // ... rest of handler
  ```

### 4. Missing Body Parsing Error Handling in feePayer
- **Severity**: High
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:230`
- **Description**: The feePayer handler calls `await req.json()` without error handling. If the request body is malformed JSON or not JSON at all, this will throw an uncaught error that gets caught by the outer try-catch (line 254), but the error message may not be user-friendly and exposes internal error details.
- **Suggested Fix**: Add specific error handling for JSON parsing:
  ```typescript
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: Invalid JSON' }
    });
  }
  ```

### 5. Type Safety Issue: `any` Return Type in Kv.memory()
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Kv.ts:101`
- **Description**: The in-memory KV store returns `store.get(key) as any` without type safety. This means the generic type parameter `<value>` is ignored at runtime. While this works, it undermines the type safety that the generic signature promises.
- **Suggested Fix**: Remove the `as any` cast and let TypeScript properly type the return:
  ```typescript
  async get(key) {
    return store.get(key) as value | undefined
  }
  ```
  However, note that the store doesn't properly preserve types, so consider this a design issue rather than just a casting issue.

### 6. Inconsistent Error Response Format
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts`
- **Description**: The keyManager handler returns plain text error messages (e.g., line 150: `new Response('Credential not found', { status: 404 })`) while feePayer returns JSON-RPC error objects. This inconsistency could confuse clients expecting a unified API.
- **Suggested Fix**: Standardize error responses. For keyManager, return JSON errors consistent with REST conventions:
  ```typescript
  if (!publicKey) {
    return Response.json(
      { error: 'Credential not found' },
      { status: 404 }
    );
  }
  ```

### 7. No Null Check on Socket Properties
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/internal/requestListener.ts:71-73`
- **Description**: The client address is extracted from req.socket properties with non-null assertions:
  ```typescript
  const client = {
    address: req.socket.remoteAddress!,
    family: req.socket.remoteFamily! as ClientAddress['family'],
    port: req.socket.remotePort!,
  }
  ```
  These properties could be undefined in certain scenarios (e.g., when request is fabricated or in testing), which could cause runtime errors.
- **Suggested Fix**: Add proper null checks and provide defaults:
  ```typescript
  const client = {
    address: req.socket.remoteAddress || 'unknown',
    family: (req.socket.remoteFamily || 'IPv4') as ClientAddress['family'],
    port: req.socket.remotePort || 0,
  }
  ```

### 8. Missing Challenge Expiration Validation
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:131-141`
- **Description**: The keyManager challenge endpoint creates challenges with no TTL mechanism. The endpoint stores challenges as `'1'` (line 136) with no expiration metadata. The `ChallengeExpiredError` class exists but is never thrown in the actual implementation - challenges never expire in the current code.
- **Suggested Fix**: Implement challenge expiration:
  ```typescript
  const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
  await kv.set(`challenge:${challenge}`, JSON.stringify({ expiresAt }));

  // On verification (would need to be added):
  const stored = await kv.get<{expiresAt: number}>(`challenge:${challenge}`);
  if (!stored || stored.expiresAt < Date.now()) {
    throw new ChallengeExpiredError();
  }
  ```

### 9. Unused Import in Handler.ts
- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:8`
- **Description**: The import `signTransaction` from 'viem/actions' is imported but never used in the file. This adds to the bundle size unnecessarily.
- **Suggested Fix**: Remove the unused import:
  ```typescript
  // Remove: import { signTransaction } from 'viem/actions';
  ```

### 10. Missing Type Definition for body.method
- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:233, 252`
- **Description**: The feePayer handler accesses `body.method` and `body.params` without type checking their existence. If these fields are missing from the request, the code will proceed with undefined values.
- **Suggested Fix**: Add validation at the top of the request handler:
  ```typescript
  if (typeof body.method !== 'string') {
    return Response.json({
      jsonrpc: '2.0',
      id: body.id ?? null,
      error: { code: -32600, message: 'Invalid Request: missing method' }
    });
  }
  ```

### 11. No Rate Limiting or DOS Prevention
- **Severity**: Medium
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Handler.ts:131-141`
- **Description**: The challenge generation endpoint creates unlimited challenges without any rate limiting, accounting, or quotas. An attacker could spam challenge generation to consume memory in the KV store.
- **Suggested Fix**: Implement basic rate limiting or quotas. This might require additional configuration parameters:
  ```typescript
  // Add to KeyManagerOptions
  maxChallengesPerMinute?: number = 10;

  // Track challenges per IP in rate limiting
  ```

### 12. Incomplete Handler Type Definition
- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/types.ts:27-35`
- **Description**: The `Handler` type is defined as `Router & { listener: ... }` but the listener function parameters are typed as `any` (line 34). This defeats the purpose of strong typing.
- **Suggested Fix**: Properly type the listener function:
  ```typescript
  export type Handler = Router & {
    listener: (
      req: IncomingMessage | Http2ServerRequest,
      res: ServerResponse | Http2ServerResponse
    ) => void
  }
  ```

### 13. Cloudflare KV Binding Type Mismatch
- **Severity**: Low
- **File**: `/Users/fox/Getting Started/radius-sdk/typescript/src/server/Kv.ts:137-142`
- **Description**: The Cloudflare KV adapter uses `.put()` method (line 141) but the binding parameter type is `cloudflare.Parameters` which defines the put method signature. However, there's no validation that the passed binding actually has this method.
- **Suggested Fix**: Add runtime validation:
  ```typescript
  export function cloudflare(kv: cloudflare.Parameters): Kv {
    if (!kv || typeof kv.put !== 'function') {
      throw new Error('Invalid Cloudflare KV binding');
    }
    return from({...})
  }
  ```

## Recommendation

**Escalate**: Yes

**Rationale**: This module requires escalation because:

1. **High-severity input validation gaps** in both keyManager (JSON parsing, object structure validation) and feePayer (params validation) handlers could allow malformed requests to propagate unchecked
2. **Unsafe type casting** (`as any`) in critical paths bypasses TypeScript's type safety guarantees
3. **Inconsistent error handling** across different handlers creates a poor API contract
4. **Missing functionality** (challenge expiration) that's defined in the error types but not implemented
5. **DOS vulnerability** due to unbounded challenge generation without rate limiting

These issues are not critical bugs but represent significant gaps in robustness, security, and API consistency that would benefit from senior developer review and remediation before production deployment.

### Priority Fixes
1. Add comprehensive request body validation in keyManager and feePayer handlers
2. Remove `as any` casts or replace with proper type definitions
3. Implement challenge expiration with TTL validation
4. Standardize error response formats across all handlers
5. Add rate limiting or challenge quotas

