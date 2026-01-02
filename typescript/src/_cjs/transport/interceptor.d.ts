import { type Transport } from 'viem';
import type { Interceptor, Logf, RoundTripper } from './types';
export declare class InterceptingRoundTripper implements RoundTripper {
    private readonly interceptor?;
    private readonly logf?;
    private readonly proxied;
    constructor(interceptor?: Interceptor | undefined, logf?: Logf | undefined, proxied?: RoundTripper);
    roundTrip(request: Request): Promise<Response>;
    private parseRequestBody;
}
export interface InterceptingTransportOptions {
    url: string;
    interceptor?: Interceptor;
    logger?: Logf;
}
export declare function createInterceptingTransport(options: InterceptingTransportOptions): Transport;
//# sourceMappingURL=interceptor.d.ts.map