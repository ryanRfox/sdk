/**
 * sendTransactionBatch action - sends multiple transactions in a single JSON-RPC batch request.
 *
 * Radius does not queue future-nonce transactions like Ethereum. This action ensures
 * all transactions arrive in nonce order by using JSON-RPC batching.
 */
import type { Account, Address, Chain, Client, Hash, Hex, Transport } from 'viem';
import { MAX_GAS } from '../chains/chainConfig.js';
import {
	BatchTransactionError,
	type BatchTransactionResult,
	GasEstimationError,
	RadiusError,
} from '../errors/index.js';

/** Default maximum number of transactions in a single batch */
export const DEFAULT_MAX_BATCH_SIZE = 100;

/** Default timeout for batch fetch requests in milliseconds (30 seconds) */
export const DEFAULT_BATCH_TIMEOUT = 30000;

/**
 * Transaction request for batch submission.
 */
export interface SendTransactionBatchParameters {
	/** Array of transactions to send in the batch */
	transactions: Array<{
		/** The recipient address */
		to: Address;
		/** The amount to send in wei (default: 0n) */
		value?: bigint;
		/** The transaction data (for contract calls) */
		data?: Hex;
		/** Gas limit (if not provided, will be estimated) */
		gas?: bigint;
	}>;
	/** Maximum number of transactions allowed in the batch (default: 100) */
	maxBatchSize?: number;
	/** Timeout in milliseconds for the batch fetch request (default: 30000) */
	timeout?: number;
}

/**
 * Return type for sendTransactionBatch action.
 */
export type SendTransactionBatchReturnType = Hash[];

/**
 * Send multiple transactions in a single JSON-RPC batch request.
 * Transactions are automatically assigned sequential nonces and sent atomically.
 *
 * @param client - The viem client (must have an account attached)
 * @param params - The batch transaction parameters
 * @param params.transactions - Array of transaction objects to send
 * @param params.maxBatchSize - Maximum batch size (default: 100)
 * @param params.timeout - Fetch timeout in milliseconds (default: 30000)
 * @returns Array of transaction hashes in the same order as input
 * @throws {BatchTransactionError} If any transaction in the batch fails
 * @throws {GasEstimationError} If gas estimation fails for any transaction
 * @throws {RadiusError} If input validation fails, HTTP request fails, or request times out
 *
 * @remarks
 * **Transport Note:** This function uses a direct `fetch()` call rather than
 * the client's configured transport. Custom transport interceptors, retry logic,
 * or middleware will not be applied to batch requests. This is necessary because
 * viem's transport layer does not expose batch JSON-RPC capabilities.
 *
 * @example
 * ```typescript
 * import { createWalletClient, http } from 'viem';
 * import { privateKeyToAccount } from 'viem/accounts';
 * import { radiusTestnet, radiusWalletActions } from '@radiustechsystems/sdk';
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x...'),
 *   chain: radiusTestnet,
 *   transport: http(),
 * }).extend(radiusWalletActions());
 *
 * const hashes = await client.sendTransactionBatch({
 *   transactions: [
 *     { to: '0x...', value: 1000000000000000000n },
 *     { to: '0x...', data: '0x...' },
 *   ],
 * });
 * ```
 */
export async function sendTransactionBatch<
	chain extends Chain | undefined,
	account extends Account | undefined,
>(
	client: Client<Transport, chain, account>,
	params: SendTransactionBatchParameters,
): Promise<SendTransactionBatchReturnType> {
	const {
		transactions,
		maxBatchSize = DEFAULT_MAX_BATCH_SIZE,
		timeout = DEFAULT_BATCH_TIMEOUT,
	} = params;

	// Validate input
	if (!Array.isArray(transactions)) {
		throw new RadiusError('sendTransactionBatch expects an array of transactions', {
			metaMessages: [
				'Example: client.sendTransactionBatch({ transactions: [{ to: "0x...", value: 1n }] })',
			],
			details: `Received: ${typeof transactions}`,
		});
	}

	if (transactions.length === 0) {
		throw new RadiusError('sendTransactionBatch requires at least one transaction', {
			metaMessages: ['Pass an array with at least one transaction request.'],
		});
	}

	if (transactions.length > maxBatchSize) {
		throw new RadiusError(
			`Batch size ${transactions.length} exceeds maximum allowed size of ${maxBatchSize}`,
			{
				metaMessages: [
					`Split your transactions into smaller batches of ${maxBatchSize} or fewer.`,
					'You can also increase the limit by passing maxBatchSize option.',
				],
				details: `Received ${transactions.length} transactions, max is ${maxBatchSize}`,
			},
		);
	}

	// Ensure we have an account
	const account = client.account;
	if (!account) {
		throw new RadiusError('sendTransactionBatch requires an account', {
			metaMessages: [
				'Create a wallet client with an account:',
				'createWalletClient({ account: privateKeyToAccount("0x..."), ... })',
			],
		});
	}

	// Get the chain ID
	const chainId = client.chain?.id;
	if (!chainId) {
		throw new RadiusError('sendTransactionBatch requires a chain', {
			metaMessages: ['Create a wallet client with a chain: createWalletClient({ chain, ... })'],
		});
	}

	// Get RPC URL from transport
	const rpcUrl = getRpcUrl(client);

	// Get current nonce once
	const startNonce = await client.request({
		method: 'eth_getTransactionCount',
		params: [account.address, 'pending'],
	});
	const nonce = Number(startNonce);

	// Estimate gas for each transaction (in parallel for efficiency)
	const gasEstimates = await Promise.all(
		transactions.map(async (tx, i) => {
			if (tx.gas !== undefined) {
				return tx.gas;
			}
			try {
				const estimate = await client.request({
					method: 'eth_estimateGas',
					params: [
						{
							from: account.address,
							to: tx.to,
							data: tx.data,
							value: tx.value ? (`0x${tx.value.toString(16)}` as Hex) : undefined,
						},
					],
				});
				// Apply 20% safety margin
				const estimatedGas = BigInt(estimate);
				const margin = estimatedGas / 5n;
				let gas = estimatedGas + margin;
				// Cap at MAX_GAS
				if (gas > MAX_GAS) {
					gas = MAX_GAS;
				}
				return gas;
			} catch (error) {
				throw new GasEstimationError(`Gas estimation failed for transaction at index ${i}`, {
					to: tx.to,
					data: tx.data,
					cause: error instanceof Error ? error : undefined,
					metaMessages: [
						'The transaction may revert on-chain.',
						'Check that the recipient address is valid and the contract call is correct.',
					],
				});
			}
		}),
	);

	// Ensure the account has signTransaction
	if (!account.signTransaction) {
		throw new RadiusError('Account does not support signTransaction', {
			metaMessages: ['Use an account that supports signing, like privateKeyToAccount()'],
		});
	}

	// Sign all transactions with sequential nonces
	const signedTxs = await Promise.all(
		transactions.map(async (tx, i) => {
			// Use the account's signTransaction method
			const signedTx = await account.signTransaction?.({
				to: tx.to,
				data: tx.data,
				value: tx.value ?? 0n,
				nonce: nonce + i,
				gas: gasEstimates[i],
				gasPrice: 0n, // Radius uses zero gas price
				chainId,
			});
			return signedTx;
		}),
	);

	// Build JSON-RPC batch request
	const batchRequest = signedTxs.map((raw, i) => ({
		jsonrpc: '2.0' as const,
		id: i,
		method: 'eth_sendRawTransaction',
		params: [raw],
	}));

	// Send single HTTP POST request with timeout
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	let response: Response;
	try {
		response = await fetch(rpcUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(batchRequest),
			signal: controller.signal,
		});
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === 'AbortError') {
			throw new RadiusError(`Batch request timed out after ${timeout}ms`, {
				metaMessages: [
					'The RPC endpoint did not respond in time.',
					'You can increase the timeout by passing the timeout option.',
				],
				details: `Timeout: ${timeout}ms`,
			});
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
	}

	if (!response.ok) {
		throw new RadiusError(`Batch request failed with status ${response.status}`, {
			details: await response.text(),
		});
	}

	const batchResponse = (await response.json()) as Array<{
		id: number;
		result?: Hash;
		error?: { code: number; message: string; data?: string };
	}>;

	// Parse responses and match by id to preserve order
	const results: BatchTransactionResult[] = [];
	const hashes: Hash[] = [];
	let hasError = false;

	// Sort responses by id to ensure order matches input
	const sortedResponses = [...batchResponse].sort((a, b) => a.id - b.id);

	for (let i = 0; i < transactions.length; i++) {
		const res = sortedResponses[i];
		if (res?.result) {
			results.push({ index: i, hash: res.result });
			hashes.push(res.result);
		} else {
			const errorMsg = res?.error?.data || res?.error?.message || 'Unknown error';
			results.push({ index: i, error: errorMsg });
			hasError = true;
		}
	}

	// If any transaction failed, throw with details
	if (hasError) {
		const failedCount = results.filter((r) => r.error).length;
		throw new BatchTransactionError(
			`${failedCount} of ${transactions.length} transactions failed`,
			results,
		);
	}

	return hashes;
}

/**
 * Extract RPC URL from client transport.
 */
function getRpcUrl<chain extends Chain | undefined, account extends Account | undefined>(
	client: Client<Transport, chain, account>,
): string {
	// Try to get URL from chain config first
	const chainUrl = client.chain?.rpcUrls?.default?.http?.[0];
	if (chainUrl) {
		return chainUrl;
	}

	// Check environment variables (Node.js only)
	if (typeof process !== 'undefined' && process.env) {
		const envUrl = process.env.RADIUS_RPC_URL || process.env.RADIUS_ENDPOINT;
		if (envUrl) {
			return envUrl;
		}
	}

	throw new RadiusError('Unable to determine RPC URL', {
		metaMessages: [
			'Ensure your client has a chain configured with rpcUrls',
			'Or set RADIUS_RPC_URL environment variable',
		],
	});
}
