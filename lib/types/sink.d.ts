/**
 * Durable usage sink over a storage-domain-style `records` table. Kept free of
 * any `@deepseek-ai/dsh-storage-domain` import so it's unit-testable with a
 * plain fake table (the domain SPEC lives in `store.ts`, which does import it).
 */
import type { UsageEntry, UsageSink, UsageFilter, UsageOverview } from "./types.js";
/** Minimal shape of the storage-domain `records` table the sink drives. */
export interface RecordsTable {
    get(key: string): UsageEntry | undefined;
    put(key: string, value: UsageEntry): Promise<void>;
    delete(key: string): Promise<boolean>;
    entries(): IterableIterator<[string, UsageEntry]>;
    keys(): IterableIterator<string>;
}
/**
 * A durable {@link UsageSink}: records are written append-only (keyed by entry
 * id); reads enumerate the table for cross-session aggregation.
 */
export declare class DurableUsageSink implements UsageSink {
    private readonly table;
    constructor(table: RecordsTable);
    record(entry: UsageEntry): void | Promise<void>;
    /** All persisted records (unordered). */
    all(): UsageEntry[];
    overview(filter?: UsageFilter): UsageOverview;
    recent(filter?: UsageFilter, limit?: number): UsageEntry[];
    clear(): Promise<number>;
}
//# sourceMappingURL=sink.d.ts.map