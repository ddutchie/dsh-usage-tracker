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
    try {
        return foldSessionUsageEvent(state, event);
    }
    catch {
        // A projection MUST never break the turn it observes — on any unexpected
        // event shape, keep the prior state (same reference = zero downstream work).
        return state;
    }
}
/** The actual pure fold (wrapped by applySessionUsage's safety net). */
function foldSessionUsageEvent(state, event) {
    // MUST be pure (the projection contract): never mutate `state`; return the
    // SAME reference when the event doesn't change anything. Clone the turn
    // accumulator before folding into it.
    const nextTurn = { ...state.turn };
    const result = applyEvent(nextTurn, event);
    if (result !== "flush") {
        // Only the turn accumulator may have advanced; if nothing changed, keep the
        // same state reference (zero downstream work per the contract).
        if (turnEqual(nextTurn, state.turn))
            return state;
        return { totals: state.totals, recent: state.recent, turn: nextTurn };
    }
    const entry = finalizeEntry(nextTurn, "session", {});
    const freshTurn = initTurnState();
    if (!entry)
        return { totals: state.totals, recent: state.recent, turn: freshTurn };
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
    return { totals, recent, turn: freshTurn };
}
/** Shallow-equal two turn accumulators (all fields are primitives). */
function turnEqual(a, b) {
    return a.promptTokens === b.promptTokens
        && a.completionTokens === b.completionTokens
        && a.reasoningTokens === b.reasoningTokens
        && a.cacheReadTokens === b.cacheReadTokens
        && a.cacheCreationTokens === b.cacheCreationTokens
        && a.costUsd === b.costUsd
        && a.model === b.model
        && a.provider === b.provider
        && a.baseUrl === b.baseUrl
        && a.finishReason === b.finishReason;
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