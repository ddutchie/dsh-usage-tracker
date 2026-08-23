import React from "react";
import type { UsageEntry, UsageOverview } from "../types.js";
export * from "./UsagePanel.js";
/**
 * Client services this browser plugin reads off the client `ctx`:
 *  - `slots` for the conversation.view tab + settings.section registrations;
 *  - `remote` for the cross-session store RPC (`ctx.remote.usage.*`).
 */
export declare const inject: string[];
/**
 * Client plugin body. Registers TWO surfaces:
 *  - a session-scoped conversation.view "Usage" tab (live per-session, via the
 *    sessionUsage projection);
 *  - a root settings.section "Usage" panel (cross-session/lifetime, via the
 *    durable store over ctx.remote.usage.*).
 * @param ctx - the client context (DSH) or a host UI facade.
 */
export declare function apply(ctx: any): void;
export declare function activate(ui: any): void;
declare const _default: {
    inject: string[];
    apply: typeof apply;
    activate: typeof activate;
    UsagePanel: React.FC<import("./UsagePanel.js").UsagePanelProps>;
    UsageSection: React.FC<{
        entries?: UsageEntry[];
        useUsage?: () => UsageEntry[];
        useProjection?: (key: string) => unknown;
    }>;
    UsageRemoteSection: React.FC<{
        usage?: {
            overview: (req?: {
                from?: number;
                to?: number;
                groupBy?: string;
            }) => Promise<UsageOverview>;
            recent: (req?: {
                limit?: number;
            }) => Promise<UsageEntry[]>;
        };
    }>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map