/**
 * Event represents an EVM contract event emitted during transaction execution
 * Contains decoded event data and the raw event payload
 */
export class Event {
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
    name, 
    /**
     * The data of the event as key-value pairs
     */
    data, 
    /**
     * The raw bytes of the event
     */
    raw) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: data
        });
        Object.defineProperty(this, "raw", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: raw
        });
    }
}
//# sourceMappingURL=event.js.map