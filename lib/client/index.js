import { jsx as _jsx } from "react/jsx-runtime";
import { UsagePanel } from "./UsagePanel.js";
import { queryUsageOverview, queryRecent } from "../query.js";
export * from "./UsagePanel.js";
/**
 * Client services this browser plugin reads off the client `ctx`. It registers
 * a Usage settings section; `slots` provides the section slot (declared by
 * `@deepseek-ai/dsh-client-ui-settings`, carried as the `dsh.client.inject`
 * load-order edge).
 */
export const inject = ["slots"];
/**
 * A settings-section component that renders captured usage. Data source order:
 *  1. `props.useProjection("sessionUsage")` — the DSH per-session projection the
 *     host plugin registers (works in the DSH web shell with zero wiring).
 *  2. `props.useUsage()` / `props.entries` — a host that hands the tracker's
 *     cross-session records straight in (e.g. an embedding host with its own DB).
 */
const UsageSection = (props) => {
    // Prefer the durable cross-session records if a host provides them.
    const hostEntries = props.useUsage ? props.useUsage() : props.entries;
    if (hostEntries && hostEntries.length > 0) {
        const now = Date.now();
        const from = now - 30 * 24 * 60 * 60 * 1000;
        const overview = queryUsageOverview(hostEntries, { from, to: now, groupBy: "source" });
        return _jsx(UsagePanel, { overview: overview, recent: queryRecent(hostEntries, {}, 12), title: "LLM Usage (30 days)" });
    }
    // Otherwise read the current session's usage: via useProjection (session
    // scope, e.g. the conversation.view tab) or via a getUsageView inject face
    // (root scope, e.g. the settings section reading ctx.sessions).
    const su = props.useProjection?.("sessionUsage") ?? props.getUsageView?.();
    const overview = su
        ? { totals: su.totals, previous: null, series: [], byModel: [], byDimension: [] }
        : undefined;
    const recent = (su?.recent ?? []).map((r, i) => ({
        id: `${r.at}_${i}`,
        at: r.at,
        sessionId: "session",
        model: r.model,
        promptTokens: r.promptTokens,
        completionTokens: r.completionTokens,
        reasoningTokens: 0,
        cacheReadTokens: r.cacheReadTokens,
        cacheCreationTokens: 0,
        costUsd: r.costUsd,
        costEstimated: r.costEstimated,
    }));
    return _jsx(UsagePanel, { overview: overview, recent: recent, title: "LLM Usage (this session)" });
};
/**
 * Client plugin body. Registers the Usage panel into the settings section slot.
 * Mutually-exclusive host paths (DSH slots vs a plain host `ui`) mirror the
 * dsh-context-ring widget, so no undeclared property is read off a Cordis proxy.
 * @param ctx - the client context (DSH) or a host UI facade.
 */
export function apply(ctx) {
    if (ctx?.slots?.inject) {
        // 1. A session-scoped conversation.view tab ("Usage") — this scope gets the
        //    session kit (`useProjection`), reading the live sessionUsage projection.
        ctx.slots.inject("conversation.view", () => ctx.slots.register({
            name: "conversation.view",
            id: "usage",
            order: 30,
            label: () => "Usage",
        }, UsageSection));
        // 2. A root-scoped settings.section ("Usage") — settings sections don't get
        //    useProjection, so an inject face reads the CURRENT session's usage
        //    projection off ctx.sessions and hands it in as getUsageView().
        ctx.slots.inject("settings.section", () => ctx.slots.register({
            name: "settings.section",
            id: "usage",
            order: 20,
            label: () => "Usage",
            inject: () => ({
                getUsageView: () => {
                    try {
                        const list = ctx.sessions?.list?.getSnapshot?.();
                        const currentId = list?.current ?? list?.selectedId ?? list?.currentId;
                        if (!currentId)
                            return undefined;
                        const session = ctx.sessions?.binding?.(currentId)?.session;
                        return session?.projections?.faceOf?.("sessionUsage")?.getSnapshot?.();
                    }
                    catch {
                        return undefined;
                    }
                },
            }),
        }, UsageSection));
        return;
    }
    if (ctx?.slots?.register) {
        ctx.slots.register({ name: "conversation.view", id: "usage", order: 30, label: () => "Usage" }, UsageSection);
        return;
    }
    // A plain host UI facade (e.g. an embedding app that renders the panel itself).
    if (typeof ctx?.registerUsagePanel === "function") {
        ctx.registerUsagePanel("usage", UsageSection);
    }
}
export function activate(ui) {
    apply(ui);
}
export default { inject, apply, activate, UsagePanel, UsageSection };
//# sourceMappingURL=index.js.map