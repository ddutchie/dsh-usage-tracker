import { applyEvent, initTurnState, finalizeEntry } from "./capture.js";
const zeroTotals = () => ({
    promptTokens: 0, completionTokens: 0, reasoningTokens: 0,
    cacheReadTokens: 0, cacheCreationTokens: 0, costUsd: 0, requests: 0,
});
function initState() {
    return { totals: zeroTotals(), recent: [], turn: initTurnState() };
}
/** Pure fold: apply one session event, finalizing a record on step end. */
export function applySessionUsage(state, event) {
    const result = applyEvent(state.turn, event);
    if (result !== "flush")
        return state;
    const entry = finalizeEntry(state.turn, "session", {});
    const nextTurn = initTurnState();
    if (!entry)
        return { ...state, turn: nextTurn };
    const totals = {
        promptTokens: state.totals.promptTokens + entry.promptTokens,
        completionTokens: state.totals.completionTokens + entry.completionTokens,
        reasoningTokens: state.totals.reasoningTokens + entry.reasoningTokens,
        cacheReadTokens: state.totals.cacheReadTokens + entry.cacheReadTokens,
        cacheCreationTokens: state.totals.cacheCreationTokens + entry.cacheCreationTokens,
        costUsd: state.totals.costUsd + (entry.costUsd ?? 0),
        requests: state.totals.requests + 1,
    };
    const recent = [
        { at: entry.at, model: entry.model, promptTokens: entry.promptTokens, completionTokens: entry.completionTokens, cacheReadTokens: entry.cacheReadTokens, costUsd: entry.costUsd, costEstimated: entry.costEstimated },
        ...state.recent,
    ].slice(0, 50);
    return { totals, recent, turn: nextTurn };
}
/** A permissive schema shim (parse passthrough) so we need no zod dependency. */
const passthrough = () => ({ parse: (v) => v });
/**
 * The projection definition the tracker registers with `sessionProjections`.
 * Typed loosely (`any`) so the package carries no hard dependency on
 * `@deepseek-ai/dsh-session-projection`; the registry only calls `init/apply/
 * wire.view/*.parse` at runtime, which this satisfies structurally.
 */
export const sessionUsageProjectionDefinition = {
    key: "sessionUsage",
    stateVersion: 1,
    stateSchema: passthrough(),
    init: () => initState(),
    apply: applySessionUsage,
    wire: {
        viewSchema: passthrough(),
        view: (state) => ({ totals: state.totals, recent: state.recent }),
    },
};
//# sourceMappingURL=session-projection.js.map