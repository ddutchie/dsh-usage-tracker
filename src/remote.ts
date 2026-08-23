/**
 * Remote-exposed durable usage store service. Extends `TypertRemoteService`
 * (namespace `usage`) so the Gateway routes its `@Remote` methods to the client
 * as `ctx.remote.usage.*`. It opens the durable domain, records every captured
 * entry into it (subscribing to the tracker's `usage/recorded` event), and
 * serves cross-session rollups the root Settings panel reads. This is the
 * host→client bridge a per-session projection cannot be.
 */
import { Service, type Context } from "@deepseek-ai/cordis";
import { TypertRemoteService, Remote } from "@deepseek-ai/dsh-typert-protocol";
import { usageDomainSpec } from "./store.js";
import { DurableUsageSink } from "./sink.js";
import type { UsageEntry, UsageOverview, UsageFilter } from "./types.js";

export interface UsageOverviewRequest {
  from?: number;
  to?: number;
  groupBy?: string;
  excludeEstimated?: boolean;
}
export interface UsageRecentRequest {
  limit?: number;
}

export class UsageStoreService extends TypertRemoteService {
  static readonly inject = ["storageDomain"];

  private sink?: DurableUsageSink;

  constructor(ctx: Context) {
    super(ctx, "usage");

    // Persist every captured turn (the tracker emits usage/recorded).
    ctx.on("usage/recorded", (_session: unknown, entry: UsageEntry) => {
      void this.sink?.record(entry);
    });
  }

  /** Open the durable domain and own its lifecycle. */
  protected async [Service.init](): Promise<void> {
    const domain = await (this.ctx as any).storageDomain.open(usageDomainSpec);
    this.sink = new DurableUsageSink(domain.table("records"));
    this.ctx.effect(() => async () => { await domain.close(); }, "usage-tracker.domainClose");
  }

  /** Lifetime/cross-session overview (totals, prior-window delta, per-day, per-model, by-dimension). */
  @Remote("overview")
  async overview(request: UsageOverviewRequest = {}): Promise<UsageOverview> {
    const filter: UsageFilter = {
      from: request.from,
      to: request.to,
      groupBy: request.groupBy ?? "source",
      excludeEstimated: request.excludeEstimated,
    };
    // eslint-disable-next-line no-console
    console.log(`[usage-tracker] overview() HIT: all=${this.sink?.all().length ?? 0}`);
    return this.sink ? this.sink.overview(filter) : emptyOverview();
  }

  /** Most-recent records across all sessions (newest first). */
  @Remote("recent")
  async recent(request: UsageRecentRequest = {}): Promise<UsageEntry[]> {
    return this.sink ? this.sink.recent({}, request.limit ?? 50) : [];
  }

  /** Delete all stored usage. Returns the number of rows removed. */
  @Remote("clear")
  async clear(): Promise<{ cleared: number }> {
    return { cleared: this.sink ? await this.sink.clear() : 0 };
  }
}

function emptyOverview(): UsageOverview {
  return {
    totals: { promptTokens: 0, completionTokens: 0, reasoningTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0, costUsd: 0, requests: 0 },
    previous: null, series: [], byModel: [], byDimension: [],
  };
}

/** Mount the durable store + Remote on a context. */
export function usageStorePlugin(ctx: Context): void {
  ctx.plugin(UsageStoreService);
}
