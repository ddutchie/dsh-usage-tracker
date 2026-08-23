# dsh-usage-tracker

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

## License

MIT
