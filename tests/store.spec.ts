import { describe, it, expect } from "vitest";
import { DurableUsageSink } from "../src/sink.js";
import type { UsageEntry } from "../src/types.js";

/** In-memory fake of the storage-domain KvTable the sink depends on. */
function fakeTable() {
  const m = new Map<string, UsageEntry>();
  return {
    get: (k: string) => m.get(k),
    put: async (k: string, v: UsageEntry) => { m.set(k, v); },
    delete: async (k: string) => m.delete(k),
    entries: () => m.entries(),
    keys: () => m.keys(),
    _map: m,
  };
}

function entry(over: Partial<UsageEntry> = {}): UsageEntry {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    at: over.at ?? Date.now(),
    sessionId: over.sessionId ?? "s1",
    model: over.model ?? "gpt-4o",
    promptTokens: over.promptTokens ?? 100,
    completionTokens: over.completionTokens ?? 10,
    reasoningTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0,
    costUsd: over.costUsd ?? 0.01, costEstimated: over.costEstimated ?? false,
    meta: over.meta,
  };
}

describe("DurableUsageSink", () => {
  it("persists records and aggregates across sessions", async () => {
    const t = fakeTable();
    const sink = new DurableUsageSink(t as any);
    await sink.record(entry({ sessionId: "a", model: "gpt-4o", costUsd: 1 }));
    await sink.record(entry({ sessionId: "b", model: "gpt-4o", costUsd: 2 }));
    await sink.record(entry({ sessionId: "b", model: "deepseek-chat", costUsd: 5 }));

    expect(sink.all()).toHaveLength(3);
    const ov = sink.overview({ groupBy: "sessionId" });
    expect(ov.totals.requests).toBe(3);
    expect(ov.totals.costUsd).toBe(8);
    expect(ov.byModel[0].model).toBe("deepseek-chat"); // highest cost
    // grouped by session
    expect(ov.byDimension.find((d) => d.key === "b")!.requests).toBe(2);
  });

  it("recent is newest-first", async () => {
    const t = fakeTable();
    const sink = new DurableUsageSink(t as any);
    await sink.record(entry({ at: 1 }));
    await sink.record(entry({ at: 3 }));
    await sink.record(entry({ at: 2 }));
    expect(sink.recent().map((r) => r.at)).toEqual([3, 2, 1]);
  });

  it("clear removes all rows", async () => {
    const t = fakeTable();
    const sink = new DurableUsageSink(t as any);
    await sink.record(entry());
    await sink.record(entry());
    expect(await sink.clear()).toBe(2);
    expect(sink.all()).toHaveLength(0);
  });
});
