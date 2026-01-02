import type { BytesLike } from './address';
export declare class Event {
    name: string;
    data: Record<string, unknown>;
    raw: BytesLike;
    constructor(name: string, data: Record<string, unknown>, raw: BytesLike);
}
//# sourceMappingURL=event.d.ts.map