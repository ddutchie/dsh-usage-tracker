import React from "react";
import type { UsageOverview, UsageEntry } from "../types.js";
export interface UsagePanelProps {
    /** The composed overview (from queryUsageOverview on the host's records). */
    overview?: UsageOverview;
    /** Recent per-call rows (newest first). */
    recent?: UsageEntry[];
    /** Optional title. */
    title?: string;
}
/**
 * A self-contained usage panel — inline styles + DSH/Cairn theme-token
 * fallbacks so it renders correctly in any host (no Tailwind assumed). Shows
 * headline totals with deltas, a per-day bar chart, per-model spend, and a
 * recent-calls table. All data is passed in (the host owns storage + queries).
 */
export declare const UsagePanel: React.FC<UsagePanelProps>;
//# sourceMappingURL=UsagePanel.d.ts.map