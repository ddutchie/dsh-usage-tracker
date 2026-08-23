import { describe, it, expect } from "vitest";
import { estimateCostUsd, extractCost, extractCacheTokens, resolvePricing } from "../src/pricing.js";
import { queryUsageOverview, queryRecent, sumTotals, dayKey } from "../src/query.js";
import type { UsageEntry } from "../src/types.js";

function entry(over: Partial<UsageEntry> = {}): UsageEntry {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    at: over.at ?? Date.now(),
    sessionId: over.sessionId ?? "s1",
    model: over.model ?? "gpt-4o",
    promptTokens: over.promptTokens ?? 0,
    completionTokens: over.completionTokens ?? 0,
    reasoningTokens: over.reasoningTokens ?? 0,
    cacheReadTokens: over.cacheReadTokens ?? 0,
    cacheCreationTokens: over.cacheCreationTokens ?? 0,
    costUsd: over.costUsd,
    costEstimated: over.costEstimated ?? false,
    provider: over.provider,
    meta: over.meta,
  };
}

describe("pricing", () => {
  it("resolves by substring match", () => {
    expect(resolvePricing("openai/gpt-4o-mini")).toBeDefined();
    expect(resolvePricing("totally-unknown-model")).toBeUndefined();
  });

  it("estimates cache-aware cost", () => {
    // 1M input (200k cached), 500k output on gpt-4o (2.5 / 10 / cacheRead 1.25)
    const cost = estimateCostUsd("gpt-4o", 1_000_000, 500_000, 200_000, 0);
    // uncached 800k*2.5 + 500k*10 + 200k*1.25 (per 1M) = 2.0 + 5.0 + 0.25 = 7.25
    expect(cost).toBeCloseTo(7.25, 5);
  });

  it("extracts provider cost from divergent shapes", () => {
    expect(extractCost({ cost: 0.42 })).toBe(0.42);
    expect(extractCost({ cost: { request_cost_usd: 0.1 } })).toBe(0.1);
    expect(extractCost({ usage: { cost: 0.05 } })).toBe(0.05);
    expect(extractCost({ nothing: 1 })).toBeUndefined();
  });

  it("normalizes cache tokens across providers", () => {
    expect(extractCacheTokens({ cache_read_input_tokens: 100, cache_creation_input_tokens: 20 }))
      .toEqual({ cacheReadTokens: 100, cacheCreationTokens: 20 });
    expect(extractCacheTokens({ prompt_cache_hit_tokens: 50 }).cacheReadTokens).toBe(50);
    expect(extractCacheTokens({ prompt_tokens_details: { cached_tokens: 30 } }).cacheReadTokens).toBe(30);
  });
});

describe("aggregation", () => {
  it("sums totals and excludes estimated cost on toggle", () => {
    const rows = [
      entry({ promptTokens: 100, completionTokens: 10, costUsd: 1, costEstimated: false }),
      entry({ promptTokens: 200, completionTokens: 20, costUsd: 2, costEstimated: true }),
    ];
    expect(sumTotals(rows).costUsd).toBe(3);
    expect(sumTotals(rows, true).costUsd).toBe(1); // estimated excluded
    expect(sumTotals(rows).promptTokens).toBe(300); // tokens always counted
    expect(sumTotals(rows).requests).toBe(2);
  });

  it("groups by model and by a meta dimension", () => {
    const rows = [
      entry({ model: "gpt-4o", costUsd: 1, meta: { source: "chat" } }),
      entry({ model: "gpt-4o", costUsd: 2, meta: { source: "chat" } }),
      entry({ model: "deepseek-chat", costUsd: 5, meta: { source: "coding" } }),
    ];
    const ov = queryUsageOverview(rows, { groupBy: "source" });
    expect(ov.byModel[0].model).toBe("deepseek-chat"); // sorted by cost desc (5 > 3)
    expect(ov.byModel.find((m) => m.model === "gpt-4o")!.costUsd).toBe(3);
    expect(ov.byDimension.find((d) => d.key === "coding")!.requests).toBe(1);
    expect(ov.byDimension.find((d) => d.key === "chat")!.requests).toBe(2);
  });

  it("computes a prior window for deltas", () => {
    const now = 10_000_000;
    const rows = [
      entry({ at: now, costUsd: 5 }),                 // in window
      entry({ at: now - 2_000, costUsd: 3 }),         // in prior window
    ];
    const ov = queryUsageOverview(rows, { from: now - 1_000, to: now });
    expect(ov.totals.costUsd).toBe(5);
    expect(ov.previous?.costUsd).toBe(3);
  });

  it("buckets per local day", () => {
    const rows = [entry({ at: Date.parse("2026-01-02T10:00:00") })];
    const ov = queryUsageOverview(rows);
    expect(ov.series[0].day).toBe(dayKey(rows[0].at));
  });

  it("recent is newest-first and capped", () => {
    const rows = [entry({ at: 1 }), entry({ at: 3 }), entry({ at: 2 })];
    expect(queryRecent(rows).map((r) => r.at)).toEqual([3, 2, 1]);
  });
});
