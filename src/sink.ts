/**
 * Durable usage sink over a storage-domain-style `records` table. Kept free of
 * any `@deepseek-ai/dsh-storage-domain` import so it's unit-testable with a
 * plain fake table (the domain SPEC lives in `store.ts`, which does import it).
 */
import type { UsageEntry, UsageSink, UsageFilter, UsageOverview } from "./types.js";
import { queryUsageOverview, queryRecent } from "./query.js";

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
export class DurableUsageSink implements UsageSink {
  constructor(private readonly table: RecordsTable) {}

  record(entry: UsageEntry): void | Promise<void> {
    return this.table.put(entry.id, entry);
  }

  /** All persisted records (unordered). */
  all(): UsageEntry[] {
    return [...this.table.entries()].map(([, v]) => v);
  }

  overview(filter?: UsageFilter): UsageOverview {
    return queryUsageOverview(this.all(), filter);
  }

  recent(filter?: UsageFilter, limit?: number): UsageEntry[] {
    return queryRecent(this.all(), filter, limit);
  }

  async clear(): Promise<number> {
    let n = 0;
    for (const key of [...this.table.keys()]) {
      if (await this.table.delete(key)) n++;
    }
    return n;
  }
}
