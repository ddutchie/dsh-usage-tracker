/**
 * Shared usage-tracking data shapes. The whole plugin is built around one
 * normalized record — {@link UsageEntry} — captured per LLM request, and the
 * rollups computed from a set of them.
 */
/** A model-pricing rate (USD per 1M tokens), used to estimate cost when the provider reports none. */
export interface ModelPricingRate {
    input: number | null;
    output: number | null;
    cacheRead?: number | null;
    cacheWrite?: number | null;
}
/**
 * One normalized usage record — the unit captured per LLM request/round and
 * handed to a {@link UsageSink}. Token fields are always non-negative integers.
 * `meta` carries host-specific dimensions (projectId, workspaceId, source, …)
 * the tracker persists but does not interpret.
 */
export interface UsageEntry {
    /** Unique id for this record (host may override; a uuid by default). */
    id: string;
    /** Epoch milliseconds when the turn completed. */
    at: number;
    /** Session this usage belongs to (empty string for one-shot/no-session calls). */
    sessionId: string;
    /** Provider route id (e.g. "cairn", "deepseek", "openrouter"), if known. */
    provider?: string;
    /** Model id as reported by the request/response. */
    model: string;
    /** Provider base URL, if known (helps disambiguate models across gateways). */
    baseUrl?: string;
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
    /** Resolved USD cost for the turn (provider-reported or estimated). */
    costUsd?: number;
    /** True when costUsd came from the pricing estimator, not the provider. */
    costEstimated: boolean;
    /** Provider finish reason, if reported. */
    finishReason?: string;
    /** Host-specific dimensions (projectId, workspaceId, source, …). Persisted verbatim. */
    meta?: Record<string, string | number | null | undefined>;
}
/** A destination for captured records. A host may supply its own (e.g. its existing DB). */
export interface UsageSink {
    record(entry: UsageEntry): void | Promise<void>;
}
/** Config for the capture service. */
export interface UsageTrackerConfig {
    /**
     * Where captured records go. Omit to use the in-memory sink (queryable via
     * the service; not durable). A host with its own store passes an adapter.
     */
    sink?: UsageSink;
    /**
     * Cost estimator fallback. Given a model + token counts, return a USD cost
     * when the provider reported none. Omit to use the bundled pricing table.
     */
    pricing?: Record<string, ModelPricingRate> | ((model: string) => ModelPricingRate | undefined);
    /** Extra static dimensions merged into every record's `meta` (e.g. a workspace id). */
    meta?: Record<string, string | number | null | undefined>;
}
/** Headline sums over a window. */
export interface UsageTotals {
    promptTokens: number;
    completionTokens: number;
    reasoningTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
    costUsd: number;
    requests: number;
}
/** Per-day rollup (local-time day key `YYYY-MM-DD`). */
export interface UsageDayBucket extends UsageTotals {
    day: string;
}
/** Per-model rollup. */
export interface UsageModelBucket extends UsageTotals {
    model: string;
}
/** Per-arbitrary-dimension rollup (e.g. source, project). */
export interface UsageDimensionBucket extends UsageTotals {
    key: string;
}
/** The composed overview a panel renders. */
export interface UsageOverview {
    totals: UsageTotals;
    /** Same-length window immediately prior, for delta chips (null when unavailable). */
    previous: UsageTotals | null;
    series: UsageDayBucket[];
    byModel: UsageModelBucket[];
    /** Grouped by a chosen meta dimension (default: "source"). */
    byDimension: UsageDimensionBucket[];
}
/** Filter for querying the log. */
export interface UsageFilter {
    from?: number;
    to?: number;
    /** Restrict to records whose meta[key] === value. */
    metaEquals?: Record<string, string | number>;
    /** Dimension (a meta key, or "model"/"provider") to group `byDimension` on. Default "source". */
    groupBy?: string;
    /** When true, cost sums exclude estimated costs (tokens/requests always counted). */
    excludeEstimated?: boolean;
}
//# sourceMappingURL=types.d.ts.map