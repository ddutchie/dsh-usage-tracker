# dsh-usage-tracker

English | [中文](README.zh.md)

Durable LLM **usage + cost tracking**, aggregation, and a usage panel for
[DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) and any
Cordis host.

It's the durable-history complement to
[`dsh-context-ring`](https://github.com/ddutchie/dsh-context-ring): where the
context ring answers *"what's in context right now"*, the usage tracker answers
*"what have we spent, over time, by model"*.

## What it does

- **Captures** per-turn usage from the session event stream (input/output/
  reasoning/cache tokens), normalizing the divergent provider shapes.
- **Resolves cost** three ways: provider-reported → estimated from a pricing
  table (with a `costEstimated` flag) → nothing.
- **Aggregates** into totals, prior-window deltas, a per-day series, per-model
  spend, and a grouped-by-dimension rollup — all pure, no DB required.
- **Renders** a self-contained `<UsagePanel>` (themes to DSH or a host via CSS
  tokens; no Tailwind assumed) and ships a DSH settings-section plugin.

## Entry points

| Import | What |
|---|---|
| `dsh-usage-tracker` | Cordis plugin (`apply`/`usageTrackerPlugin`) + `UsageTrackerService` + all core exports |
| `dsh-usage-tracker/query` | Pure aggregation (`queryUsageOverview`, `queryRecent`, `sumTotals`) |
| `dsh-usage-tracker/pricing` | Cost estimator + cache-token normalization |
| `dsh-usage-tracker/store` | Durable storage-domain spec + `DurableUsageSink` |
| `dsh-usage-tracker/remote` | `UsageStoreService` — `@Remote` cross-session store (`ctx.remote.usage.*`) |
| `dsh-usage-tracker/react` | Importable React components (`UsagePanel`) |
| `dsh-usage-tracker/client` | DSH web-shell plugin bundle (registers a Usage settings section) |
| `dsh-usage-tracker/types` | Type-only |

## Capture (host plugin)

```ts
import { usageTrackerPlugin } from "dsh-usage-tracker";

// In-memory (queryable via ctx.usageTracker.query()):
usageTrackerPlugin(ctx);

// Or with your own durable sink + a live pricing catalog + static dimensions:
usageTrackerPlugin(ctx, {
  sink: { record: (entry) => db.insertUsage(entry) },
  pricing: (model) => myCatalog.rate(model),
  meta: { workspaceId, source: "chat" },   // persisted verbatim on every record
});
```

Each finalized turn emits `ctx.emit("usage/recorded", session, entry)` and is
handed to the sink.

## Aggregate + render (any React host)

```tsx
import { queryUsageOverview, queryRecent } from "dsh-usage-tracker/query";
import { UsagePanel } from "dsh-usage-tracker/react";

const overview = queryUsageOverview(rows, { from, to, groupBy: "source" });
<UsagePanel overview={overview} recent={queryRecent(rows, {}, 12)} />;
```

The host owns storage; the tracker owns the fold, the cost math, the rollups, and
the panel. Provider **account balance** is intentionally *not* included — that's
account-specific and belongs to the host.

## Two surfaces in the DSH web shell

Mounting the package (host row) provides both:

- **Per-session "Usage" tab** (conversation view) — live, from the `sessionUsage`
  session projection via `useProjection`; zero extra wiring.
- **Cross-session "Usage" settings panel** — lifetime/30-day totals, per-model
  spend, and daily series from a **durable store**. Every captured turn is
  persisted to a `storageDomain` table (`UsageStoreService`, a
  `TypertRemoteService`), and the settings panel reads it over the Remote
  (`ctx.remote.usage.overview()` / `recent()` / `clear()`). Activation is gated
  on `storageDomain`; a host without it keeps the per-session tab working.

An embedding host with its own database can instead pass its own `sink` (skipping
the built-in store) and render `<UsagePanel>` from its own records.

## License

MIT
