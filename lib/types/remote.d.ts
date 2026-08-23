/**
 * Remote-exposed durable usage store service. Extends `TypertRemoteService`
 * (namespace `usage`) so the Gateway routes its `@Remote` methods to the client
 * as `ctx.remote.usage.*`. It opens the durable domain, records every captured
 * entry into it (subscribing to the tracker's `usage/recorded` event), and
 * serves cross-session rollups the root Settings panel reads. This is the
 * host→client bridge a per-session projection cannot be.
 */
import { Service, type Context } from "@deepseek-ai/cordis";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import type { UsageEntry, UsageOverview } from "./types.js";
export interface UsageOverviewRequest {
    from?: number;
    to?: number;
    groupBy?: string;
    excludeEstimated?: boolean;
}
export interface UsageRecentRequest {
    limit?: number;
}
export declare class UsageStoreService extends TypertRemoteService {
    static readonly inject: string[];
    private sink?;
    constructor(ctx: Context);
    /** Open the durable domain and own its lifecycle. */
    protected [Service.init](): Promise<void>;
    /** Lifetime/cross-session overview (totals, prior-window delta, per-day, per-model, by-dimension). */
    overview(request?: UsageOverviewRequest): Promise<UsageOverview>;
    /** Most-recent records across all sessions (newest first). */
    recent(request?: UsageRecentRequest): Promise<UsageEntry[]>;
    /** Delete all stored usage. Returns the number of rows removed. */
    clear(): Promise<{
        cleared: number;
    }>;
}
/** Mount the durable store + Remote on a context. */
export declare function usageStorePlugin(ctx: Context): void;
//# sourceMappingURL=remote.d.ts.map