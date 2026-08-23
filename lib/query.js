const zeroTotals = () => ({
    promptTokens: 0,
    completionTokens: 0,
    reasoningTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    costUsd: 0,
    requests: 0,
});
/** Local-time day key `YYYY-MM-DD` for an epoch-ms timestamp. */
export function dayKey(at) {
    const d = new Date(at);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
/** Read a dimension value off a record ("model"/"provider"/"sessionId" or a meta key). */
function dimOf(e, groupBy) {
    if (groupBy === "model")
        return e.model || "unknown";
    if (groupBy === "provider")
        return e.provider || "unknown";
    if (groupBy === "sessionId")
        return e.sessionId || "unknown";
    const v = e.meta?.[groupBy];
    return v == null ? "unknown" : String(v);
}
function addInto(t, e, excludeEstimated) {
    t.promptTokens += e.promptTokens;
    t.completionTokens += e.completionTokens;
    t.reasoningTokens += e.reasoningTokens;
    t.cacheReadTokens += e.cacheReadTokens;
    t.cacheCreationTokens += e.cacheCreationTokens;
    if (typeof e.costUsd === "number" && !(excludeEstimated && e.costEstimated))
        t.costUsd += e.costUsd;
    t.requests += 1;
}
/** Apply a filter's time + meta constraints (not the grouping). */
export function filterEntries(entries, filter = {}) {
    const { from, to, metaEquals } = filter;
    return entries.filter((e) => {
        if (from != null && e.at < from)
            return false;
        if (to != null && e.at > to)
            return false;
        if (metaEquals) {
            for (const [k, v] of Object.entries(metaEquals)) {
                const mv = k === "model" ? e.model : k === "provider" ? e.provider : e.meta?.[k];
                if (String(mv) !== String(v))
                    return false;
            }
        }
        return true;
    });
}
/** Sum a set of records into headline totals. */
export function sumTotals(entries, excludeEstimated = false) {
    const t = zeroTotals();
    for (const e of entries)
        addInto(t, e, excludeEstimated);
    return t;
}
/**
 * Compose the full overview for a filter: totals, the prior same-length window
 * (for deltas), a per-day series, per-model bars, and a grouped-by-dimension
 * rollup (default dimension: `meta.source`).
 */
export function queryUsageOverview(entries, filter = {}) {
    const excludeEstimated = filter.excludeEstimated === true;
    const groupBy = filter.groupBy ?? "source";
    const inWindow = filterEntries(entries, filter);
    const totals = sumTotals(inWindow, excludeEstimated);
    // Prior window of equal length, immediately before [from, to].
    let previous = null;
    if (filter.from != null && filter.to != null) {
        const len = filter.to - filter.from;
        const prev = filterEntries(entries, { ...filter, from: filter.from - len, to: filter.from - 1 });
        previous = sumTotals(prev, excludeEstimated);
    }
    const dayMap = new Map();
    const modelMap = new Map();
    const dimMap = new Map();
    for (const e of inWindow) {
        const dk = dayKey(e.at);
        let d = dayMap.get(dk);
        if (!d) {
            d = { day: dk, ...zeroTotals() };
            dayMap.set(dk, d);
        }
        addInto(d, e, excludeEstimated);
        const mk = e.model || "unknown";
        let m = modelMap.get(mk);
        if (!m) {
            m = { model: mk, ...zeroTotals() };
            modelMap.set(mk, m);
        }
        addInto(m, e, excludeEstimated);
        const gk = dimOf(e, groupBy);
        let g = dimMap.get(gk);
        if (!g) {
            g = { key: gk, ...zeroTotals() };
            dimMap.set(gk, g);
        }
        addInto(g, e, excludeEstimated);
    }
    return {
        totals,
        previous,
        series: [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day)),
        byModel: [...modelMap.values()].sort((a, b) => b.costUsd - a.costUsd || b.promptTokens - a.promptTokens),
        byDimension: [...dimMap.values()].sort((a, b) => b.costUsd - a.costUsd || b.requests - a.requests),
    };
}
/** Most-recent-first slice of records (per-call history). */
export function queryRecent(entries, filter = {}, limit = 100) {
    return filterEntries(entries, filter)
        .slice()
        .sort((a, b) => b.at - a.at)
        .slice(0, Math.max(0, Math.min(limit, 500)));
}
//# sourceMappingURL=query.js.map