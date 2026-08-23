/**
 * Pure aggregation over captured usage records — no I/O, no DB. Runs the same
 * way whether records come from an in-memory sink, a host DB dump, or a wire
 * response. The host owns storage; this owns the rollup math.
 */
import type { UsageEntry, UsageTotals, UsageOverview, UsageFilter } from "./types.js";
/** Local-time day key `YYYY-MM-DD` for an epoch-ms timestamp. */
export declare function dayKey(at: number): string;
/** Apply a filter's time + meta constraints (not the grouping). */
export declare function filterEntries(entries: UsageEntry[], filter?: UsageFilter): UsageEntry[];
/** Sum a set of records into headline totals. */
export declare function sumTotals(entries: UsageEntry[], excludeEstimated?: boolean): UsageTotals;
/**
 * Compose the full overview for a filter: totals, the prior same-length window
 * (for deltas), a per-day series, per-model bars, and a grouped-by-dimension
 * rollup (default dimension: `meta.source`).
 */
export declare function queryUsageOverview(entries: UsageEntry[], filter?: UsageFilter): UsageOverview;
/** Most-recent-first slice of records (per-call history). */
export declare function queryRecent(entries: UsageEntry[], filter?: UsageFilter, limit?: number): UsageEntry[];
//# sourceMappingURL=query.d.ts.map