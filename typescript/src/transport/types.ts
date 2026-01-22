/**
 * A logger function interface that matches the console.log function signature
 * Used for logging JSON-RPC requests and responses
 * @param message The log message to display
 * @param data Optional structured data to include in the log
 */
export type Logger = (message: string, data?: Record<string, unknown>) => void;

/**
 * An interceptor function for modifying JSON-RPC HTTP requests and responses
 * This allows for custom handling, validation, or manipulation of RPC calls
 * @param reqBody The stringified JSON-RPC request body
 * @param response The HTTP response from the JSON-RPC server
 * @returns A potentially modified response or the original response
 */
export type Interceptor = (reqBody: string, response: Response) => Promise<Response>;

/**
 * An interface for making HTTP requests and receiving responses
 * Handles the actual HTTP round-trip for JSON-RPC requests
 */
export interface RequestHandler {
	/**
	 * Sends an HTTP request and returns the response
	 * @param request The HTTP request to send
	 * @returns A Promise that resolves to the HTTP response
	 * @throws Error if the request fails
	 */
	handle(request: Request): Promise<Response>;
}
