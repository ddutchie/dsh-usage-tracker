import React from "react";
import type { UsageEntry } from "../types.js";
export * from "./UsagePanel.js";
/**
 * Client services this browser plugin reads off the client `ctx`. It registers
 * a Usage settings section; `slots` provides the section slot (declared by
 * `@deepseek-ai/dsh-client-ui-settings`, carried as the `dsh.client.inject`
 * load-order edge).
 */
export declare const inject: string[];
/**
 * Client plugin body. Registers the per-session Usage panel as a conversation
 * view tab. (Cross-session/lifetime usage belongs in a root Settings panel, but
 * that needs a durable sink + Remote — see README; for now this is per-session.)
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
};
export default _default;
//# sourceMappingURL=index.d.ts.map