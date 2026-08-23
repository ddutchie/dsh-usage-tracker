/**
 * Durable storage-domain declaration for cross-session usage. The domain SPEC
 * needs `@deepseek-ai/dsh-storage-domain` (runtime), so it lives here, apart
 * from the storage-agnostic {@link DurableUsageSink} (in `./sink`) that the
 * tests exercise with a plain fake table.
 */
import { z } from "zod";
import type { UsageEntry } from "./types.js";
/** Zod schema for one persisted usage record (mirrors UsageEntry). */
export declare const usageEntrySchema: z.ZodType<UsageEntry>;
/** The durable domain: one append-only `records` table keyed by entry id. */
export declare const usageDomainSpec: {
    name: string;
    version: number;
    tables: {
        records: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, UsageEntry>;
    };
};
//# sourceMappingURL=store.d.ts.map