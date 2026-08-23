/**
 * dsh-usage-tracker — durable LLM usage + cost capture as a Cordis plugin.
 *
 * Subscribes to the session event stream and folds each turn's usage from the
 * `assistant/chunk` (type "usage") samples and the finalizing `assistant/message`,
 * then resolves cost (provider-reported → estimated) and cache tokens into one
 * normalized {@link UsageEntry}, which it hands to a pluggable {@link UsageSink}.
 * A host with its own store passes its own sink; otherwise an in-memory sink
 * keeps the session's records queryable via {@link UsageTrackerService.query}.
 *
 * This is the durable-aggregation half that complements dsh-context-ring's live
 * per-turn ring: context-ring answers "what's in context now", usage-tracker
 * answers "what have we spent, over time, by model".
 */
import { Service, type Context } from "@deepseek-ai/cordis";
import type { Session } from "@deepseek-ai/dsh-session";
import type { UsageEntry, UsageTrackerConfig, UsageFilter, UsageOverview } from "./types.js";
export * from "./types.js";
export * from "./pricing.js";
export * from "./query.js";
export * from "./capture.js";
export * from "./session-projection.js";
declare module "@deepseek-ai/cordis" {
    interface Context {
        usageTracker: UsageTrackerService;
    }
    interface Events {
        "usage/recorded": (session: Session, entry: UsageEntry) => void;
    }
}
export declare class UsageTrackerService extends Service {
    static readonly provide = "usageTracker";
    private readonly sink;
    private readonly memory?;
    private readonly config;
    private readonly ctxRef;
    /** Live per-session turn accumulator, flushed on step boundary / turn end. */
    private readonly turns;
    constructor(ctx: Context, config?: UsageTrackerConfig);
    private stateFor;
    private onEvent;
    /** Finalize the current turn accumulator into a record and reset it. */
    private flush;
    /** Records held by the in-memory sink (empty when a host sink is used). */
    getEntries(): UsageEntry[];
    /** Convenience: overview over the in-memory records (host sinks query their own store). */
    query(filter?: UsageFilter): UsageOverview;
    /** Convenience: recent records from the in-memory sink. */
    recent(filter?: UsageFilter, limit?: number): UsageEntry[];
}
/** Mount the tracker on a context. */
export declare function usageTrackerPlugin(ctx: Context, config?: UsageTrackerConfig): void;
/**
 * Host plugin body — the cordis entry point the Loader mounts. Mounting the
 * package provides `usageTracker` and (for a client build) lets the loader
 * discover this package's `dsh.client` panel. Named exports remain importable
 * for direct use.
 * @param ctx - the Cordis context the Loader mounts this plugin onto.
 * @param config - optional tracker config (sink, pricing, static meta).
 */
export declare function apply(ctx: Context, config?: UsageTrackerConfig): void;
//# sourceMappingURL=index.d.ts.map