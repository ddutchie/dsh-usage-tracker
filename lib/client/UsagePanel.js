import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
function fmtTokens(n) {
    if (!n)
        return "0";
    if (n >= 1_000_000)
        return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000)
        return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toLocaleString();
}
function fmtUsd(n) {
    if (n == null)
        return "—";
    if (n === 0)
        return "$0";
    if (n < 0.01)
        return "<$0.01";
    return "$" + n.toFixed(n < 1 ? 3 : 2);
}
function deltaPct(cur, prev) {
    if (prev == null || prev === 0)
        return null;
    return Math.round(((cur - prev) / prev) * 100);
}
const MODEL_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b"];
/**
 * A self-contained usage panel — inline styles + DSH/Cairn theme-token
 * fallbacks so it renders correctly in any host (no Tailwind assumed). Shows
 * headline totals with deltas, a per-day bar chart, per-model spend, and a
 * recent-calls table. All data is passed in (the host owns storage + queries).
 */
export const UsagePanel = ({ overview, recent, title = "Usage" }) => {
    const C = {
        textPrimary: "var(--dsw-alias-label-primary, var(--text-primary, #e6e6e6))",
        textSecondary: "var(--dsw-alias-label-secondary, var(--text-secondary, #a1a1aa))",
        textTertiary: "var(--dsw-alias-label-tertiary, var(--text-tertiary, #71717a))",
        surface: "var(--dsw-alias-bg-base, var(--surface, #18181b))",
        surface2: "var(--dsw-alias-interactive-bg-hover-solid, var(--surface-2, rgba(128,128,128,0.08)))",
        border: "var(--dsw-alias-border-l, var(--border, rgba(128,128,128,0.2)))",
        accent: "var(--dsw-alias-state-business-primary, var(--accent, #6366f1))",
    };
    const t = overview?.totals;
    const prev = overview?.previous ?? null;
    const series = overview?.series ?? [];
    const maxDay = useMemo(() => Math.max(1, ...series.map((d) => d.costUsd || d.promptTokens + d.completionTokens)), [series]);
    const card = (label, value, delta) => (_jsxs("div", { style: { flex: 1, minWidth: 110, padding: 12, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }, children: [_jsx("div", { style: { fontSize: "0.7rem", color: C.textTertiary, textTransform: "uppercase", letterSpacing: 0.3 }, children: label }), _jsx("div", { style: { fontSize: "1.15rem", fontWeight: 600, color: C.textPrimary, marginTop: 4 }, children: value }), delta != null && (_jsxs("div", { style: { fontSize: "0.7rem", marginTop: 2, color: delta > 0 ? "#f59e0b" : "#22c55e" }, children: [delta > 0 ? "▲" : "▼", " ", Math.abs(delta), "% vs prior"] }))] }));
    const models = overview?.byModel ?? [];
    return (_jsxs("div", { style: { fontFamily: "inherit", color: C.textPrimary, fontSize: "0.8rem", padding: 20, maxWidth: 920 }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: "0.95rem", marginBottom: 12 }, children: title }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }, children: [card("Input", fmtTokens(t?.promptTokens), deltaPct(t?.promptTokens ?? 0, prev?.promptTokens)), card("Output", fmtTokens(t?.completionTokens), deltaPct(t?.completionTokens ?? 0, prev?.completionTokens)), card("Cached", fmtTokens(t?.cacheReadTokens), deltaPct(t?.cacheReadTokens ?? 0, prev?.cacheReadTokens)), card("Cost", fmtUsd(t?.costUsd), deltaPct(t?.costUsd ?? 0, prev?.costUsd)), card("Requests", (t?.requests ?? 0).toLocaleString(), deltaPct(t?.requests ?? 0, prev?.requests))] }), series.length > 0 && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "Daily" }), _jsx("div", { style: { display: "flex", alignItems: "flex-end", gap: 3, height: 64 }, children: series.map((d) => {
                            const v = d.costUsd || d.promptTokens + d.completionTokens;
                            const h = Math.max(2, (v / maxDay) * 64);
                            return _jsx("div", { title: `${d.day}: ${fmtUsd(d.costUsd)} · ${fmtTokens(d.promptTokens + d.completionTokens)} tok`, style: { flex: 1, height: h, background: C.accent, borderRadius: 2, opacity: 0.85 } }, d.day);
                        }) })] })), models.length > 0 && (_jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "By model" }), models.slice(0, 6).map((m, i) => (_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [_jsx("span", { style: { width: 8, height: 8, borderRadius: 2, background: MODEL_COLORS[i % MODEL_COLORS.length], flexShrink: 0 } }), _jsx("span", { style: { flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.model }), _jsx("span", { style: { color: C.textTertiary }, children: fmtTokens(m.promptTokens + m.completionTokens) }), _jsx("span", { style: { fontWeight: 500, minWidth: 56, textAlign: "right" }, children: fmtUsd(m.costUsd) })] }, m.model)))] })), recent && recent.length > 0 && (_jsxs("div", { children: [_jsx("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "Recent" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: recent.slice(0, 12).map((r) => (_jsxs("div", { style: { display: "flex", gap: 8, fontSize: "0.72rem", padding: "3px 0", borderBottom: `1px solid ${C.border}` }, children: [_jsx("span", { style: { color: C.textTertiary, width: 62, flexShrink: 0 }, children: new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }), _jsx("span", { style: { flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.model }), _jsxs("span", { style: { color: C.textTertiary }, children: [fmtTokens(r.promptTokens), "\u2192", fmtTokens(r.completionTokens)] }), _jsxs("span", { style: { minWidth: 52, textAlign: "right", color: r.costEstimated ? C.textTertiary : C.textPrimary }, children: [r.costEstimated ? "~" : "", fmtUsd(r.costUsd)] })] }, r.id))) })] })), (!overview || (t?.requests ?? 0) === 0) && (_jsx("div", { style: { color: C.textTertiary, padding: "24px 0", textAlign: "center" }, children: "No usage recorded yet." }))] }));
};
//# sourceMappingURL=UsagePanel.js.map