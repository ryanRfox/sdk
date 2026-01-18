# Parallel Transaction Submission - RPC Level Analysis

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client as Client (viem)
    participant HTTP as HTTP Layer
    participant RPC as Radius RPC
    participant Seq as Sequencer

    Note over Client: Promise.all([tx0, tx1, tx2])

    rect rgb(200, 220, 255)
        Note over Client,HTTP: All 3 requests fired nearly simultaneously
        Client->>HTTP: POST eth_sendRawTransaction (nonce=N)
        Client->>HTTP: POST eth_sendRawTransaction (nonce=N+1)
        Client->>HTTP: POST eth_sendRawTransaction (nonce=N+2)
    end

    rect rgb(255, 220, 200)
        Note over HTTP,RPC: HTTP requests arrive at RPC ~same time
        HTTP->>RPC: Request 1 (nonce=N)
        HTTP->>RPC: Request 2 (nonce=N+1)
        HTTP->>RPC: Request 3 (nonce=N+2)
    end

    rect rgb(255, 200, 200)
        Note over RPC,Seq: Sequencer processes one at a time
        RPC->>Seq: Process nonce=N
        Seq-->>RPC: ✓ Accepted
        RPC->>Seq: Process nonce=N+1
        Seq-->>RPC: ✗ "Exec Failed" (concurrent rejection)
        RPC->>Seq: Process nonce=N+2
        Seq-->>RPC: ✗ "Exec Failed" (concurrent rejection)
    end

    rect rgb(200, 255, 200)
        Note over RPC,Client: Responses return to client
        RPC-->>HTTP: 200 OK (tx hash)
        RPC-->>HTTP: 200 OK (error: Exec Failed)
        RPC-->>HTTP: 200 OK (error: Exec Failed)
        HTTP-->>Client: Response 1: Success
        HTTP-->>Client: Response 2: Error
        HTTP-->>Client: Response 3: Error
    end
```

## HTTP Connection Details

```mermaid
flowchart TB
    subgraph Client ["Client Process"]
        V[viem walletClient]
        P["Promise.all()"]
        V --> P
    end

    subgraph HTTPLayer ["HTTP Layer (Node.js)"]
        direction TB
        CP[Connection Pool]
        R1[Request 1]
        R2[Request 2]
        R3[Request 3]
        CP --> R1
        CP --> R2
        CP --> R3
    end

    subgraph Network ["Network"]
        direction TB
        TCP["TCP Connection(s)
        (may be 1 or multiple)"]
    end

    subgraph RPC ["Radius RPC Server"]
        direction TB
        EP[HTTP Endpoint]
        Q[Request Queue]
        EP --> Q
    end

    subgraph Sequencer ["Sequencer"]
        direction TB
        TXP[Transaction Processor]
        ACC[Account Lock?]
        TXP --> ACC
    end

    P --> HTTPLayer
    HTTPLayer --> TCP
    TCP --> RPC
    Q --> Sequencer
```

## What We're Sending

Each HTTP request looks like:

```http
POST / HTTP/1.1
Host: rpc.testnet.radiustech.xyz
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_sendRawTransaction",
  "params": ["0x02f867...signed_tx_bytes..."]
}
```

## Key Observations

### At the Client Level
- `Promise.all()` fires all requests without waiting
- Each `sendTransaction` is a separate HTTP POST
- No client-side batching (JSON-RPC batch) - individual requests

### At the HTTP Level
- Node.js HTTP client uses connection pooling
- May reuse TCP connections (keep-alive)
- Requests are truly concurrent from client perspective

### At the RPC Level
- All requests arrive ~simultaneously
- RPC must decide ordering
- Sequencer appears to have per-account locking

### Hypothesis: Why Failures Occur

```mermaid
flowchart LR
    subgraph Arrival ["Requests Arrive"]
        R1[TX nonce=N]
        R2[TX nonce=N+1]
        R3[TX nonce=N+2]
    end

    subgraph Lock ["Account Processing"]
        L{Account Lock}
        P1[Process TX]
        L -->|Acquired by R1| P1
        L -->|Blocked| Reject1[Reject R2]
        L -->|Blocked| Reject2[Reject R3]
    end

    R1 --> L
    R2 --> L
    R3 --> L

    P1 --> Success[✓ Success]
    Reject1 --> Fail1[✗ Exec Failed]
    Reject2 --> Fail2[✗ Exec Failed]
```

The sequencer likely acquires a lock per account during transaction processing.
Any concurrent requests for the same account are rejected rather than queued.

## Alternative: JSON-RPC Batch Request

We could test if batching changes behavior:

```http
POST / HTTP/1.1
Content-Type: application/json

[
  {"jsonrpc":"2.0","id":1,"method":"eth_sendRawTransaction","params":["0x...tx1"]},
  {"jsonrpc":"2.0","id":2,"method":"eth_sendRawTransaction","params":["0x...tx2"]},
  {"jsonrpc":"2.0","id":3,"method":"eth_sendRawTransaction","params":["0x...tx3"]}
]
```

This sends all transactions in a single HTTP request. The RPC server would then
process them - potentially in order within the batch.
