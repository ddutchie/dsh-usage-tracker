/**
 * Pure per-turn usage fold — the capture math with no Cordis dependency, so it's
 * unit-testable and reusable. The {@link UsageTrackerService} is a thin wrapper
 * that drives this over the live session event stream.
 */
import type { UsageEntry, UsageTrackerConfig } from "./types.js";
import { estimateCostUsd, extractCost, extractCacheTokens } from "./pricing.js";

/** Per-session fold accumulator for the current turn/step. */
export interface TurnState {
  promptTokens: number;
  completionTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd?: number;
  costFromProvider: boolean;
  model: string;
  provider?: string;
  baseUrl?: string;
  finishReason?: string;
}

export function initTurnState(): TurnState {
  return {
    promptTokens: 0, completionTokens: 0, reasoningTokens: 0,
    cacheReadTokens: 0, cacheCreationTokens: 0,
    costFromProvider: false, model: "unknown",
  };
}

/** Fold one usage-bearing payload into the accumulator (prompt is a level; completion accumulates). */
export function foldUsage(s: TurnState, u: any): void {
  const input = typeof u?.inputTokens === "number" ? u.inputTokens
    : typeof u?.promptTokens === "number" ? u.promptTokens : undefined;
  if (typeof input === "number" && input > 0) s.promptTokens = Math.max(s.promptTokens, input);
  const output = typeof u?.outputTokens === "number" ? u.outputTokens
    : typeof u?.completionTokens === "number" ? u.completionTokens : undefined;
  if (typeof output === "number") s.completionTokens += output;
  if (typeof u?.reasoningTokens === "number") s.reasoningTokens += u.reasoningTokens;

  const cache = extractCacheTokens(u);
  s.cacheReadTokens = Math.max(s.cacheReadTokens, cache.cacheReadTokens);
  s.cacheCreationTokens = Math.max(s.cacheCreationTokens, cache.cacheCreationTokens);

  const reported = extractCost(u);
  if (typeof reported === "number") {
    s.costUsd = (s.costUsd ?? 0) + reported;
    s.costFromProvider = true;
  }
}

/**
 * Apply one session event to the accumulator. Returns "flush" when the event
 * ends a step (a finalized assistant message) so the caller emits a record.
 */
export function applyEvent(s: TurnState, event: { type: string; data?: any }): "continue" | "flush" {
  const { type, data } = event;
  if (type === "request/header") {
    const cfg = data?.config;
    if (cfg?.model) s.model = cfg.model;
    if (cfg?.provider) s.provider = cfg.provider;
    if (cfg?.baseUrl) s.baseUrl = cfg.baseUrl;
    return "continue";
  }
  if (type === "assistant/chunk" && data?.chunk?.type === "usage" && data.chunk.usage) {
    foldUsage(s, data.chunk.usage);
    return "continue";
  }
  if (type === "assistant/message") {
    const msg = data?.message;
    if (msg?.source?.model) s.model = msg.source.model;
    if (msg?.source?.provider) s.provider = msg.source.provider;
    const u = msg?.usage ?? data?.usage;
    if (u) foldUsage(s, u);
    if (typeof data?.finishReason === "string") s.finishReason = data.finishReason;
    else if (typeof msg?.finishReason === "string") s.finishReason = msg.finishReason;
    return "flush";
  }
  return "continue";
}

let seq = 0;
function makeId(): string {
  seq = (seq + 1) % 1e6;
  return `u_${Date.now().toString(36)}_${seq.toString(36)}`;
}

/**
 * Finalize an accumulator into a normalized record, resolving cost
 * (provider-reported → estimated). Returns null when the turn carried no usage.
 */
export function finalizeEntry(s: TurnState, sessionId: string, config: UsageTrackerConfig): UsageEntry | null {
  if (s.promptTokens <= 0 && s.completionTokens <= 0) return null;
  let costUsd = s.costUsd;
  let costEstimated = false;
  if (costUsd == null) {
    const est = estimateCostUsd(s.model, s.promptTokens, s.completionTokens, s.cacheReadTokens, s.cacheCreationTokens, config.pricing);
    if (typeof est === "number") { costUsd = est; costEstimated = true; }
  }
  return {
    id: makeId(),
    at: Date.now(),
    sessionId,
    provider: s.provider,
    model: s.model,
    baseUrl: s.baseUrl,
    promptTokens: Math.max(0, Math.round(s.promptTokens)),
    completionTokens: Math.max(0, Math.round(s.completionTokens)),
    reasoningTokens: Math.max(0, Math.round(s.reasoningTokens)),
    cacheReadTokens: Math.max(0, Math.round(s.cacheReadTokens)),
    cacheCreationTokens: Math.max(0, Math.round(s.cacheCreationTokens)),
    costUsd,
    costEstimated,
    finishReason: s.finishReason,
    meta: config.meta ? { ...config.meta } : undefined,
  };
}
