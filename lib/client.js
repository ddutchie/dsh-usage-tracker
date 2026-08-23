(function() {
  function factory(require, exports, module) {
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  UsagePanel: () => UsagePanel,
  activate: () => activate,
  apply: () => apply,
  default: () => index_default,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react2 = __toESM(require("react"), 1);

// src/client/UsagePanel.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
function fmtTokens(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}
function fmtUsd(n) {
  if (n == null) return "\u2014";
  if (n === 0) return "$0";
  if (n < 0.01) return "<$0.01";
  return "$" + n.toFixed(n < 1 ? 3 : 2);
}
function deltaPct(cur, prev) {
  if (prev == null || prev === 0) return null;
  return Math.round((cur - prev) / prev * 100);
}
var MODEL_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#22c55e", "#f59e0b"];
var UsagePanel = ({ overview, recent, title = "Usage" }) => {
  const C = {
    textPrimary: "var(--dsw-alias-label-primary, var(--text-primary, #e6e6e6))",
    textSecondary: "var(--dsw-alias-label-secondary, var(--text-secondary, #a1a1aa))",
    textTertiary: "var(--dsw-alias-label-tertiary, var(--text-tertiary, #71717a))",
    surface: "var(--dsw-alias-bg-base, var(--surface, #18181b))",
    surface2: "var(--dsw-alias-interactive-bg-hover-solid, var(--surface-2, rgba(128,128,128,0.08)))",
    border: "var(--dsw-alias-border-l, var(--border, rgba(128,128,128,0.2)))",
    accent: "var(--dsw-alias-state-business-primary, var(--accent, #6366f1))"
  };
  const t = overview?.totals;
  const prev = overview?.previous ?? null;
  const series = overview?.series ?? [];
  const maxDay = (0, import_react.useMemo)(() => Math.max(1, ...series.map((d) => d.costUsd || d.promptTokens + d.completionTokens)), [series]);
  const card = (label, value, delta) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1, minWidth: 110, padding: 12, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.7rem", color: C.textTertiary, textTransform: "uppercase", letterSpacing: 0.3 }, children: label }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "1.15rem", fontWeight: 600, color: C.textPrimary, marginTop: 4 }, children: value }),
    delta != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: "0.7rem", marginTop: 2, color: delta > 0 ? "#f59e0b" : "#22c55e" }, children: [
      delta > 0 ? "\u25B2" : "\u25BC",
      " ",
      Math.abs(delta),
      "% vs prior"
    ] })
  ] });
  const models = overview?.byModel ?? [];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontFamily: "inherit", color: C.textPrimary, fontSize: "0.8rem", padding: 20, maxWidth: 920 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, fontSize: "0.95rem", marginBottom: 12 }, children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }, children: [
      card("Input", fmtTokens(t?.promptTokens), deltaPct(t?.promptTokens ?? 0, prev?.promptTokens)),
      card("Output", fmtTokens(t?.completionTokens), deltaPct(t?.completionTokens ?? 0, prev?.completionTokens)),
      card("Cached", fmtTokens(t?.cacheReadTokens), deltaPct(t?.cacheReadTokens ?? 0, prev?.cacheReadTokens)),
      card("Cost", fmtUsd(t?.costUsd), deltaPct(t?.costUsd ?? 0, prev?.costUsd)),
      card("Requests", (t?.requests ?? 0).toLocaleString(), deltaPct(t?.requests ?? 0, prev?.requests))
    ] }),
    series.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "Daily" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", alignItems: "flex-end", gap: 3, height: 64 }, children: series.map((d) => {
        const v = d.costUsd || d.promptTokens + d.completionTokens;
        const h = Math.max(2, v / maxDay * 64);
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            title: `${d.day}: ${fmtUsd(d.costUsd)} \xB7 ${fmtTokens(d.promptTokens + d.completionTokens)} tok`,
            style: { flex: 1, height: h, background: C.accent, borderRadius: 2, opacity: 0.85 }
          },
          d.day
        );
      }) })
    ] }),
    models.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 16 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "By model" }),
      models.slice(0, 6).map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: 8, height: 8, borderRadius: 2, background: MODEL_COLORS[i % MODEL_COLORS.length], flexShrink: 0 } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.model }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.textTertiary }, children: fmtTokens(m.promptTokens + m.completionTokens) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 500, minWidth: 56, textAlign: "right" }, children: fmtUsd(m.costUsd) })
      ] }, m.model))
    ] }),
    recent && recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: "0.7rem", color: C.textTertiary, marginBottom: 6 }, children: "Recent" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", flexDirection: "column", gap: 2 }, children: recent.slice(0, 12).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, fontSize: "0.72rem", padding: "3px 0", borderBottom: `1px solid ${C.border}` }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: C.textTertiary, width: 62, flexShrink: 0 }, children: new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, color: C.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: r.model }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: C.textTertiary }, children: [
          fmtTokens(r.promptTokens),
          "\u2192",
          fmtTokens(r.completionTokens)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { minWidth: 52, textAlign: "right", color: r.costEstimated ? C.textTertiary : C.textPrimary }, children: [
          r.costEstimated ? "~" : "",
          fmtUsd(r.costUsd)
        ] })
      ] }, r.id)) })
    ] }),
    (!overview || (t?.requests ?? 0) === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: C.textTertiary, padding: "24px 0", textAlign: "center" }, children: "No usage recorded yet." })
  ] });
};

// src/query.ts
var zeroTotals = () => ({
  promptTokens: 0,
  completionTokens: 0,
  reasoningTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  costUsd: 0,
  requests: 0
});
function dayKey(at) {
  const d = new Date(at);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function dimOf(e, groupBy) {
  if (groupBy === "model") return e.model || "unknown";
  if (groupBy === "provider") return e.provider || "unknown";
  if (groupBy === "sessionId") return e.sessionId || "unknown";
  const v = e.meta?.[groupBy];
  return v == null ? "unknown" : String(v);
}
function addInto(t, e, excludeEstimated) {
  t.promptTokens += e.promptTokens;
  t.completionTokens += e.completionTokens;
  t.reasoningTokens += e.reasoningTokens;
  t.cacheReadTokens += e.cacheReadTokens;
  t.cacheCreationTokens += e.cacheCreationTokens;
  if (typeof e.costUsd === "number" && !(excludeEstimated && e.costEstimated)) t.costUsd += e.costUsd;
  t.requests += 1;
}
function filterEntries(entries, filter = {}) {
  const { from, to, metaEquals } = filter;
  return entries.filter((e) => {
    if (from != null && e.at < from) return false;
    if (to != null && e.at > to) return false;
    if (metaEquals) {
      for (const [k, v] of Object.entries(metaEquals)) {
        const mv = k === "model" ? e.model : k === "provider" ? e.provider : e.meta?.[k];
        if (String(mv) !== String(v)) return false;
      }
    }
    return true;
  });
}
function sumTotals(entries, excludeEstimated = false) {
  const t = zeroTotals();
  for (const e of entries) addInto(t, e, excludeEstimated);
  return t;
}
function queryUsageOverview(entries, filter = {}) {
  const excludeEstimated = filter.excludeEstimated === true;
  const groupBy = filter.groupBy ?? "source";
  const inWindow = filterEntries(entries, filter);
  const totals = sumTotals(inWindow, excludeEstimated);
  let previous = null;
  if (filter.from != null && filter.to != null) {
    const len = filter.to - filter.from;
    const prev = filterEntries(entries, { ...filter, from: filter.from - len, to: filter.from - 1 });
    previous = sumTotals(prev, excludeEstimated);
  }
  const dayMap = /* @__PURE__ */ new Map();
  const modelMap = /* @__PURE__ */ new Map();
  const dimMap = /* @__PURE__ */ new Map();
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
    byDimension: [...dimMap.values()].sort((a, b) => b.costUsd - a.costUsd || b.requests - a.requests)
  };
}
function queryRecent(entries, filter = {}, limit = 100) {
  return filterEntries(entries, filter).slice().sort((a, b) => b.at - a.at).slice(0, Math.max(0, Math.min(limit, 500)));
}

// src/client/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var inject = ["slots"];
var UsageSection = (props) => {
  const hostEntries = props.useUsage ? props.useUsage() : props.entries;
  if (hostEntries && hostEntries.length > 0) {
    const now = Date.now();
    const from = now - 30 * 24 * 60 * 60 * 1e3;
    const overview2 = queryUsageOverview(hostEntries, { from, to: now, groupBy: "source" });
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UsagePanel, { overview: overview2, recent: queryRecent(hostEntries, {}, 12), title: "LLM Usage (30 days)" });
  }
  const su = props.useProjection?.("sessionUsage");
  const sessionEntries = (su?.recent ?? []).map((r, i) => ({
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
    meta: { source: "session" }
  }));
  const agg = queryUsageOverview(sessionEntries, { groupBy: "model" });
  const overview = su ? { totals: su.totals, previous: null, series: agg.series, byModel: agg.byModel, byDimension: agg.byDimension } : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UsagePanel, { overview, recent: sessionEntries.slice(0, 12), title: "LLM Usage (this session)" });
};
var UsageRemoteSection = (props) => {
  const [overview, setOverview] = import_react2.default.useState(void 0);
  const [recent, setRecent] = import_react2.default.useState([]);
  import_react2.default.useEffect(() => {
    let alive = true;
    const now = Date.now();
    const from = now - 30 * 24 * 60 * 60 * 1e3;
    (async () => {
      try {
        const ov = await props.usage?.overview({ from, to: now, groupBy: "model" });
        const rc = await props.usage?.recent({ limit: 12 });
        if (alive) {
          setOverview(ov);
          setRecent(rc ?? []);
        }
      } catch {
      }
    })();
    return () => {
      alive = false;
    };
  }, [props.usage]);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(UsagePanel, { overview, recent, title: "LLM Usage (all sessions \xB7 30 days)" });
};
function apply(ctx) {
  if (ctx?.slots?.inject) {
    ctx.slots.inject("conversation.view", () => ctx.slots.register({
      name: "conversation.view",
      id: "usage",
      order: 30,
      label: () => "Usage"
    }, UsageSection));
    ctx.slots.inject("settings.section", () => ctx.slots.register({
      name: "settings.section",
      id: "usage",
      order: 20,
      label: () => "Usage",
      inject: () => ({ usage: ctx.remote?.usage })
    }, UsageRemoteSection));
    return;
  }
  if (ctx?.slots?.register) {
    ctx.slots.register({ name: "conversation.view", id: "usage", order: 30, label: () => "Usage" }, UsageSection);
    return;
  }
  if (typeof ctx?.registerUsagePanel === "function") {
    ctx.registerUsagePanel("usage", UsageSection);
  }
}
function activate(ui) {
  apply(ui);
}
var index_default = { inject, apply, activate, UsagePanel, UsageSection, UsageRemoteSection };

    return module.exports;
  }

  // 1. DSH web client module loader:
  if (typeof window !== "undefined" && window.__ModuleLoader__ && typeof window.__ModuleLoader__.load === "function") {
    window.__ModuleLoader__.load({
      id: "dsh-usage-tracker",
      factory: function(require) {
        var mod = { exports: {} };
        factory(require, mod.exports, mod);
        return mod.exports;
      }
    });
  }

  // 2. CommonJS (Cairn / Node):
  if (typeof module !== "undefined" && module.exports) {
    factory(typeof require === "function" ? require : function() {}, module.exports, module);
  }
})();
