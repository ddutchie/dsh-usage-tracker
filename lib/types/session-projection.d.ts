/**
 * Optional per-session usage projection — the zero-wiring bridge that makes the
 * usage panel work in the DSH web shell. When the host provides
 * `sessionProjections` (DSH does), the tracker registers this unit; the client
 * panel then reads the current session's usage via `useProjection("sessionUsage")`,
 * exactly like the token-meter units. It folds the SAME per-turn samples the
 * capture service does, but as a durable session-log projection (survives resume).
 *
 * This is per-session only. Cross-session lifetime history is the durable-sink
 * path (a host DB); a projection is per-session by construction.
 */
import type { SessionEvent } from "@deepseek-ai/dsh-session";
import { type TurnState } from "./capture.js";
import type { UsageTotals } from "./types.js";
/** Accumulated per-session usage the client renders. */
export interface SessionUsageView {
    totals: UsageTotals;
    /** Most recent turns (newest first, capped). */
    recent: Array<{
        at: number;
        model: string;
        promptTokens: number;
        completionTokens: number;
        cacheReadTokens: number;
        costUsd?: number;
        costEstimated: boolean;
    }>;
}
interface SessionUsageState {
    totals: UsageTotals;
    recent: SessionUsageView["recent"];
    turn: TurnState;
}
/** Pure fold: apply one session event, finalizing a record on step end. */
export declare function applySessionUsage(state: SessionUsageState, event: SessionEvent): SessionUsageState;
/**
 * The projection definition the tracker registers with `sessionProjections`.
 * Typed loosely (`any`) so the package carries no hard dependency on
 * `@deepseek-ai/dsh-session-projection`; the registry only calls `init/apply/
 * wire.view/*.parse` at runtime, which this satisfies structurally.
 */
export declare const sessionUsageProjectionDefinition: any;
export {};
//# sourceMappingURL=session-projection.d.ts.map