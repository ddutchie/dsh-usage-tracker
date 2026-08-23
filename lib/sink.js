import { queryUsageOverview, queryRecent } from "./query.js";
/**
 * A durable {@link UsageSink}: records are written append-only (keyed by entry
 * id); reads enumerate the table for cross-session aggregation.
 */
export class DurableUsageSink {
    table;
    constructor(table) {
        this.table = table;
    }
    record(entry) {
        return this.table.put(entry.id, entry);
    }
    /** All persisted records (unordered). */
    all() {
        return [...this.table.entries()].map(([, v]) => v);
    }
    overview(filter) {
        return queryUsageOverview(this.all(), filter);
    }
    recent(filter, limit) {
        return queryRecent(this.all(), filter, limit);
    }
    async clear() {
        let n = 0;
        for (const key of [...this.table.keys()]) {
            if (await this.table.delete(key))
                n++;
        }
        return n;
    }
}
//# sourceMappingURL=sink.js.map