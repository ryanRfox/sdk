import type { Address } from './address';
import type { Event } from './event';
import type { Hash } from 'viem';

/**
 * Transaction status as returned by viem
 */
export type TransactionStatus = 'success' | 'reverted';

/**
 * Receipt represents the result of a successfully mined transaction.
 * Contains information about the transaction execution including gas usage,
 * emitted events, and contract creation if applicable.
 *
 * @deprecated Use RadiusReceipt from '@radiustechsystems/sdk/client' instead.
 * This type is kept for backwards compatibility but will be removed in v3.
 */
export interface Receipt {
	/** The sender address */
	from: Address;
	/** The recipient address (or null for contract creation) */
	to: Address | null;
	/** The created contract address (if any) */
	contractAddress: Address | null;
	/** The transaction hash */
	txHash: Hash;
	/** The amount of gas used */
	gasUsed: bigint;
	/** The transaction status - 'success' or 'reverted' */
	status: TransactionStatus;
	/** The transaction logs/events */
	logs: Event[];
	/** The amount of native currency (USD) transferred */
	value?: bigint;
}

/**
 * Creates a Receipt object.
 *
 * @deprecated Use RadiusReceipt from '@radiustechsystems/sdk/client' instead.
 */
export function createReceipt(
	from: Address,
	to: Address | null,
	contractAddress: Address | null,
	txHash: Hash,
	gasUsed: bigint,
	status: TransactionStatus,
	logs: Event[] = [],
	value?: bigint,
): Receipt {
	return {
		from,
		to,
		contractAddress,
		txHash,
		gasUsed,
		status,
		logs,
		value,
	};
}
