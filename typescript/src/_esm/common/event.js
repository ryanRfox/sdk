/**
 * Event represents an EVM contract event emitted during transaction execution
 * Contains decoded event data and the raw event payload
 */
export class Event {
    name;
    data;
    raw;
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
        this.name = name;
        this.data = data;
        this.raw = raw;
    }
}
//# sourceMappingURL=event.js.map