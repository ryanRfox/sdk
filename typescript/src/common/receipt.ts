import type { Address } from './address';
import type { Event } from './event';
import type { Hash } from './hash';
import type { BigNumberish } from './transaction';

/**
 * Receipt represents the result of a successfully mined transaction
 * Contains information about the transaction execution including gas usage,
 * emitted events, and contract creation if applicable
 */
export class Receipt {
	/**
	 * Creates a new receipt
	 * @param from The sender address
	 * @param to The recipient address
	 * @param contractAddress The created contract address (if any)
	 * @param txHash The transaction hash
	 * @param gasUsed The amount of gas used
	 * @param status The transaction status (1 for success, 0 for failure)
	 * @param logs The transaction logs/events
	 * @param value The amount of native currency (USD) transferred
	 */
	constructor(
		public from: Address,
		public to: Address,
		public contractAddress: Address,
		public txHash: Hash,
		public gasUsed: BigNumberish,
		public status: number,
		public logs: Event[] = [],
		public value?: BigNumberish,
	) {}
}
