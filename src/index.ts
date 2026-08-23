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
import type { Session, SessionEvent } from "@deepseek-ai/dsh-session";
import type { UsageEntry, UsageSink, UsageTrackerConfig, UsageFilter, UsageOverview } from "./types.js";
import { type TurnState, initTurnState, applyEvent, finalizeEntry } from "./capture.js";
import { queryUsageOverview, queryRecent } from "./query.js";

export * from "./types.js";
export * from "./pricing.js";
export * from "./query.js";
export * from "./capture.js";

declare module "@deepseek-ai/cordis" {
  interface Context {
    usageTracker: UsageTrackerService;
  }
  interface Events {
    "usage/recorded": (session: Session, entry: UsageEntry) => void;
  }
}

/** In-memory sink — the default when a host provides none. Not durable. */
class MemorySink implements UsageSink {
  readonly entries: UsageEntry[] = [];
  record(entry: UsageEntry): void {
    this.entries.push(entry);
  }
}

export class UsageTrackerService extends Service {
  static readonly provide = "usageTracker";

  private readonly sink: UsageSink;
  private readonly memory?: MemorySink;
  private readonly config: UsageTrackerConfig;
  private readonly ctxRef: Context;
  /** Live per-session turn accumulator, flushed on step boundary / turn end. */
  private readonly turns = new Map<string, TurnState>();

  constructor(ctx: Context, config: UsageTrackerConfig = {}) {
    super(ctx, "usageTracker");
    this.config = config;
    this.ctxRef = ctx;
    if (config.sink) {
      this.sink = config.sink;
    } else {
      this.memory = new MemorySink();
      this.sink = this.memory;
    }

    ctx.on("session/event", (session: Session, event: SessionEvent) => {
      this.onEvent(session, event);
    });
  }

  private stateFor(id: string): TurnState {
    let s = this.turns.get(id);
    if (!s) { s = initTurnState(); this.turns.set(id, s); }
    return s;
  }

  private onEvent(session: Session, event: SessionEvent): void {
    const id = String(session.id);
    const s = this.stateFor(id);
    const result = applyEvent(s, event as { type: string; data?: any });
    if (result === "flush") this.flush(session, id);
  }

  /** Finalize the current turn accumulator into a record and reset it. */
  private flush(session: Session, id: string): void {
    const s = this.turns.get(id);
    this.turns.delete(id);
    if (!s) return;
    const entry = finalizeEntry(s, id, this.config);
    if (!entry) return;

    try {
      const r = this.sink.record(entry);
      if (r && typeof (r as Promise<void>).catch === "function") (r as Promise<void>).catch(() => {});
    } catch {
      /* recording must never break a turn */
    }
    this.ctxRef.emit("usage/recorded", session, entry);
  }

  /** Records held by the in-memory sink (empty when a host sink is used). */
  getEntries(): UsageEntry[] {
    return this.memory ? this.memory.entries.slice() : [];
  }

  /** Convenience: overview over the in-memory records (host sinks query their own store). */
  query(filter?: UsageFilter): UsageOverview {
    return queryUsageOverview(this.getEntries(), filter);
  }

  /** Convenience: recent records from the in-memory sink. */
  recent(filter?: UsageFilter, limit?: number): UsageEntry[] {
    return queryRecent(this.getEntries(), filter, limit);
  }
}

/** Mount the tracker on a context. */
export function usageTrackerPlugin(ctx: Context, config: UsageTrackerConfig = {}): void {
  ctx.plugin(UsageTrackerService, config);
}

/**
 * Host plugin body — the cordis entry point the Loader mounts. Mounting the
 * package provides `usageTracker` and (for a client build) lets the loader
 * discover this package's `dsh.client` panel. Named exports remain importable
 * for direct use.
 * @param ctx - the Cordis context the Loader mounts this plugin onto.
 * @param config - optional tracker config (sink, pricing, static meta).
 */
export function apply(ctx: Context, config: UsageTrackerConfig = {}): void {
  usageTrackerPlugin(ctx, config);
}
