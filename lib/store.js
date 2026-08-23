/**
 * Durable storage-domain declaration for cross-session usage. The domain SPEC
 * needs `@deepseek-ai/dsh-storage-domain` (runtime), so it lives here, apart
 * from the storage-agnostic {@link DurableUsageSink} (in `./sink`) that the
 * tests exercise with a plain fake table.
 */
import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
/** Zod schema for one persisted usage record (mirrors UsageEntry). */
export const usageEntrySchema = z.object({
    id: z.string(),
    at: z.number(),
    sessionId: z.string(),
    provider: z.string().optional(),
    model: z.string(),
    baseUrl: z.string().optional(),
    promptTokens: z.number(),
    completionTokens: z.number(),
    reasoningTokens: z.number(),
    cacheReadTokens: z.number(),
    cacheCreationTokens: z.number(),
    costUsd: z.number().optional(),
    costEstimated: z.boolean(),
    finishReason: z.string().optional(),
    meta: z.record(z.string(), z.union([z.string(), z.number(), z.null()]).optional()).optional(),
});
/** The durable domain: one append-only `records` table keyed by entry id. */
export const usageDomainSpec = defineDomain({
    name: "usage_tracker",
    version: 1,
    tables: {
        records: domainTable(usageEntrySchema),
    },
});
//# sourceMappingURL=store.js.map