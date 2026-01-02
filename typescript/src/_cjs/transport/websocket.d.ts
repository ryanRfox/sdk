import { type Chain, type Transport } from 'viem';
export interface WebSocketTransportConfig {
    url?: string;
    reconnectAttempts?: number;
    reconnectDelay?: number;
    keepAlive?: number;
}
export declare function createWebSocketTransport(chain: Chain, config?: WebSocketTransportConfig): Transport;
//# sourceMappingURL=websocket.d.ts.map