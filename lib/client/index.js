import { jsx as _jsx } from "react/jsx-runtime";
import { UsagePanel } from "./UsagePanel.js";
import { queryUsageOverview, queryRecent } from "../query.js";
export * from "./UsagePanel.js";
/**
 * Client services this browser plugin reads off the client `ctx`. It registers
 * a Usage settings section; `settings` provides the section slot. (The settings
 * slot itself is owned by `@deepseek-ai/dsh-client-ui-settings`, carried as the
 * `dsh.client.inject` load-order edge.)
 */
export const inject = ["slots"];
/**
 * A settings-section component that reads captured usage. A DSH host exposes the
 * tracker's records to the client through `props.useUsage()` (a host bridge) or
 * `props.entries`; we compute the overview here and render the shared panel.
 */
const UsageSection = (props) => {
    const entries = props.useUsage ? props.useUsage() : (props.entries ?? []);
    const now = Date.now();
    const from = now - 30 * 24 * 60 * 60 * 1000; // last 30 days
    const overview = queryUsageOverview(entries, { from, to: now, groupBy: "source" });
    const recent = queryRecent(entries, {}, 12);
    return _jsx(UsagePanel, { overview: overview, recent: recent, title: "LLM Usage (30 days)" });
};
/**
 * Client plugin body. Registers the Usage panel into the settings section slot.
 * Mutually-exclusive host paths (DSH slots vs a plain host `ui`) mirror the
 * dsh-context-ring widget, so no undeclared property is read off a Cordis proxy.
 * @param ctx - the client context (DSH) or a host UI facade.
 */
export function apply(ctx) {
    if (ctx?.slots?.register) {
        ctx.slots.register({ name: "settings.section", id: "usage", order: 20 }, UsageSection);
        return;
    }
    if (typeof ctx?.registerSettingsSection === "function") {
        ctx.registerSettingsSection("usage", UsageSection, 20);
    }
}
export function activate(ui) {
    apply(ui);
}
export default { inject, apply, activate, UsagePanel, UsageSection };
//# sourceMappingURL=index.js.map