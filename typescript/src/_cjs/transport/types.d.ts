export type Logf = (message: string, data?: Record<string, unknown>) => void;
export type Interceptor = (reqBody: string, response: Response) => Promise<Response>;
export interface RoundTripper {
    roundTrip(request: Request): Promise<Response>;
}
//# sourceMappingURL=types.d.ts.map