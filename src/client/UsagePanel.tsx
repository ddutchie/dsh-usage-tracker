import React, { useMemo } from "react";
import type { UsageOverview, UsageTotals, UsageEntry } from "../types.js";

export interface UsagePanelProps {
  /** The composed overview (from queryUsageOverview on the host's records). */
  overview?: UsageOverview;
  /** Recent per-call rows (newest first). */
  recent?: UsageEntry[];
  /** Optional title. */
  title?: string;
}

function fmtTokens(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}
function fmtUsd(n?: number): string {
  if (n == null) return "—";
  if (n === 0) return "$0";
  if (n < 0.01) return "<$0.01";
  return "$" + n.toFixed(n < 1 ? 3 : 2);
}
function deltaPct(cur: number, prev?: number | null): number | null {
  if (prev == null || prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

const MODEL_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b"];

/**
 * A self-contained usage panel — inline styles + DSH/Cairn theme-token
 * fallbacks so it renders correctly in any host (no Tailwind assumed). Shows
 * headline totals with deltas, a per-day bar chart, per-model spend, and a
 * recent-calls table. All data is passed in (the host owns storage + queries).
 */
export const UsagePanel: React.FC<UsagePanelProps> = ({ overview, recent, title = "Usage" }) => {
  const C = {
    textPrimary: "var(--dsw-alias-label-primary, var(--text-primary, #e6e6e6))",
    textSecondary: "var(--dsw-alias-label-secondary, var(--text-secondary, #a1a1aa))",
    textTertiary: "var(--dsw-alias-label-tertiary, var(--text-tertiary, #71717a))",
    surface: "var(--dsw-alias-bg-base, var(--surface, #18181b))",
    surface2: "var(--dsw-alias-interactive-bg-hover-solid, var(--surface-2, rgba(128,128,128,0.08)))",
    border: "var(--dsw-alias-border-l, var(--border, rgba(128,128,128,0.2)))",
    accent: "var(--dsw-alias-state-business-primary, var(--accent, #6366f1))",
  };

  const t: UsageTotals | undefined = overview?.totals;
  const prev = overview?.previous ?? null;

  const series = overview?.series ?? [];
  const maxDay = useMemo(() => Math.max(1, ...series.map((d) => d.costUsd || d.promptTokens + d.completionTokens)), [series]);

  const card = (label: string, value: string, delta: number | null): React.ReactNode => (
    <div style={{ flex: 1, minWidth: 110, padding: 12, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: "0.7rem", color: C.textTertiary, textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: "1.15rem", fontWeight: 600, color: C.textPrimary, marginTop: 4 }}>{value}</div>
      {delta != null && (
        <div style={{ fontSize: "0.7rem", marginTop: 2, color: delta > 0 ? "#f59e0b" : "#22c55e" }}>
          {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}% vs prior
        </div>
      )}
    </div>
  );

  const models = overview?.byModel ?? [];

  return (
    <div style={{ fontFamily: "inherit", color: C.textPrimary, fontSize: "0.8rem", padding: 20, maxWidth: 920 }}>
      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 12 }}>{title}</div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {card("Input", fmtTokens(t?.promptTokens), deltaPct(t?.promptTokens ?? 0, prev?.promptTokens))}
        {card("Output", fmtTokens(t?.completionTokens), deltaPct(t?.completionTokens ?? 0, prev?.completionTokens))}
        {card("Cached", fmtTokens(t?.cacheReadTokens), deltaPct(t?.cacheReadTokens ?? 0, prev?.cacheReadTokens))}
        {card("Cost", fmtUsd(t?.costUsd), deltaPct(t?.costUsd ?? 0, prev?.costUsd))}
        {card("Requests", (t?.requests ?? 0).toLocaleString(), deltaPct(t?.requests ?? 0, prev?.requests))}
      </div>

      {/* Daily bar chart (cost-weighted) */}
      {series.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }}>Daily</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64 }}>
            {series.map((d) => {
              const v = d.costUsd || d.promptTokens + d.completionTokens;
              const h = Math.max(2, (v / maxDay) * 64);
              return <div key={d.day} title={`${d.day}: ${fmtUsd(d.costUsd)} · ${fmtTokens(d.promptTokens + d.completionTokens)} tok`}
                style={{ flex: 1, height: h, background: C.accent, borderRadius: 2, opacity: 0.85 }} />;
            })}
          </div>
        </div>
      )}

      {/* By model */}
      {models.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }}>By model</div>
          {models.slice(0, 6).map((m, i) => (
            <div key={m.model} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: MODEL_COLORS[i % MODEL_COLORS.length], flexShrink: 0 }} />
              <span style={{ flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.model}</span>
              <span style={{ color: C.textTertiary }}>{fmtTokens(m.promptTokens + m.completionTokens)}</span>
              <span style={{ fontWeight: 500, minWidth: 56, textAlign: "right" }}>{fmtUsd(m.costUsd)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent calls */}
      {recent && recent.length > 0 && (
        <div>
          <div style={{ fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }}>Recent</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recent.slice(0, 12).map((r) => (
              <div key={r.id} style={{ display: "flex", gap: 8, fontSize: "0.72rem", padding: "3px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.textTertiary, width: 62, flexShrink: 0 }}>{new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span style={{ flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.model}</span>
                <span style={{ color: C.textTertiary }}>{fmtTokens(r.promptTokens)}→{fmtTokens(r.completionTokens)}</span>
                <span style={{ minWidth: 52, textAlign: "right", color: r.costEstimated ? C.textTertiary : C.textPrimary }}>
                  {r.costEstimated ? "~" : ""}{fmtUsd(r.costUsd)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!overview || (t?.requests ?? 0) === 0) && (
        <div style={{ color: C.textTertiary, padding: "24px 0", textAlign: "center" }}>No usage recorded yet.</div>
      )}
    </div>
  );
};
