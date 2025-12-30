import type { BytesLike } from './address';
/**
 * Event represents an EVM contract event emitted during transaction execution
 * Contains decoded event data and the raw event payload
 */
export declare class Event {
    /**
     * The name of the event
     */
    name: string;
    /**
     * The data of the event as key-value pairs
     */
    data: Record<string, unknown>;
    /**
     * The raw bytes of the event
     */
    raw: BytesLike;
    /**
     * Creates a new Event with the given name, data, and raw bytes
     * @param name The name of the event
     * @param data The decoded data of the event as key-value pairs
     * @param raw The raw bytes of the event
     */
    constructor(
    /**
     * The name of the event
     */
    name: string, 
    /**
     * The data of the event as key-value pairs
     */
    data: Record<string, unknown>, 
    /**
     * The raw bytes of the event
     */
    raw: BytesLike);
}
//# sourceMappingURL=event.d.ts.map