import { describe, it, expect } from "vitest";
import { initTurnState, applyEvent, finalizeEntry } from "../src/capture.js";

describe("capture fold", () => {
  it("folds a turn from chunks + message and estimates cost when none reported", () => {
    const s = initTurnState();
    expect(applyEvent(s, { type: "request/header", data: { config: { model: "claude-sonnet-4", provider: "anthropic", baseUrl: "https://api" } } })).toBe("continue");
    expect(applyEvent(s, { type: "assistant/chunk", data: { chunk: { type: "usage", usage: { inputTokens: 7000, outputTokens: 40, cache_read_input_tokens: 1000 } } } })).toBe("continue");
    expect(applyEvent(s, { type: "assistant/message", data: { message: { usage: { inputTokens: 7000, outputTokens: 62 }, source: { model: "claude-sonnet-4" } } } })).toBe("flush");

    const e = finalizeEntry(s, "sess-1", { meta: { source: "chat", projectId: "p1" } })!;
    expect(e).not.toBeNull();
    expect(e.model).toBe("claude-sonnet-4");
    expect(e.provider).toBe("anthropic");
    expect(e.promptTokens).toBe(7000);      // level (max)
    expect(e.completionTokens).toBe(102);    // 40 + 62 accumulated
    expect(e.cacheReadTokens).toBe(1000);
    expect(e.meta).toMatchObject({ source: "chat", projectId: "p1" });
    expect(e.costEstimated).toBe(true);      // no provider cost → estimated
    expect(typeof e.costUsd).toBe("number");
  });

  it("prefers provider-reported cost over the estimate", () => {
    const s = initTurnState();
    applyEvent(s, { type: "request/header", data: { config: { model: "gpt-4o" } } });
    applyEvent(s, { type: "assistant/message", data: { message: { usage: { inputTokens: 100, outputTokens: 10, cost: 0.99 } } } });
    const e = finalizeEntry(s, "s2", {})!;
    expect(e.costUsd).toBe(0.99);
    expect(e.costEstimated).toBe(false);
  });

  it("returns null when the turn carried no usage", () => {
    const s = initTurnState();
    applyEvent(s, { type: "request/header", data: { config: { model: "gpt-4o" } } });
    expect(finalizeEntry(s, "s3", {})).toBeNull();
  });

  it("prompt is a level (max), completion accumulates across chunks", () => {
    const s = initTurnState();
    applyEvent(s, { type: "assistant/chunk", data: { chunk: { type: "usage", usage: { inputTokens: 500, outputTokens: 10 } } } });
    applyEvent(s, { type: "assistant/chunk", data: { chunk: { type: "usage", usage: { inputTokens: 500, outputTokens: 20 } } } });
    applyEvent(s, { type: "assistant/message", data: { message: { usage: { inputTokens: 500, outputTokens: 5 } } } });
    const e = finalizeEntry(s, "s4", {})!;
    expect(e.promptTokens).toBe(500);
    expect(e.completionTokens).toBe(35); // 10 + 20 + 5
  });
});
