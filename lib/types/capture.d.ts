/**
 * Pure per-turn usage fold — the capture math with no Cordis dependency, so it's
 * unit-testable and reusable. The {@link UsageTrackerService} is a thin wrapper
 * that drives this over the live session event stream.
 */
import type { UsageEntry, UsageTrackerConfig } from "./types.js";
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
export declare function initTurnState(): TurnState;
/** Fold one usage-bearing payload into the accumulator (prompt is a level; completion accumulates). */
export declare function foldUsage(s: TurnState, u: any): void;
/**
 * Apply one session event to the accumulator. Returns "flush" when the event
 * ends a step (a finalized assistant message) so the caller emits a record.
 */
export declare function applyEvent(s: TurnState, event: {
    type: string;
    data?: any;
}): "continue" | "flush";
/**
 * Finalize an accumulator into a normalized record, resolving cost
 * (provider-reported → estimated). Returns null when the turn carried no usage.
 */
export declare function finalizeEntry(s: TurnState, sessionId: string, config: UsageTrackerConfig): UsageEntry | null;
//# sourceMappingURL=capture.d.ts.map