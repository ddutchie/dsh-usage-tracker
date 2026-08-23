var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
/**
 * Remote-exposed durable usage store service. Extends `TypertRemoteService`
 * (namespace `usage`) so the Gateway routes its `@Remote` methods to the client
 * as `ctx.remote.usage.*`. It opens the durable domain, records every captured
 * entry into it (subscribing to the tracker's `usage/recorded` event), and
 * serves cross-session rollups the root Settings panel reads. This is the
 * host→client bridge a per-session projection cannot be.
 */
import { Service } from "@deepseek-ai/cordis";
import { TypertRemoteService, Remote } from "@deepseek-ai/dsh-typert-protocol";
import { usageDomainSpec } from "./store.js";
import { DurableUsageSink } from "./sink.js";
let UsageStoreService = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _overview_decorators;
    let _recent_decorators;
    let _clear_decorators;
    return class UsageStoreService extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _overview_decorators = [Remote("overview")];
            _recent_decorators = [Remote("recent")];
            _clear_decorators = [Remote("clear")];
            __esDecorate(this, null, _overview_decorators, { kind: "method", name: "overview", static: false, private: false, access: { has: obj => "overview" in obj, get: obj => obj.overview }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _recent_decorators, { kind: "method", name: "recent", static: false, private: false, access: { has: obj => "recent" in obj, get: obj => obj.recent }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clear_decorators, { kind: "method", name: "clear", static: false, private: false, access: { has: obj => "clear" in obj, get: obj => obj.clear }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ["storageDomain"];
        sink = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx) {
            super(ctx, "usage");
            // Persist every captured turn (the tracker emits usage/recorded).
            ctx.on("usage/recorded", (_session, entry) => {
                void this.sink?.record(entry);
            });
        }
        /** Open the durable domain and own its lifecycle. */
        async [Service.init]() {
            const domain = await this.ctx.storageDomain.open(usageDomainSpec);
            this.sink = new DurableUsageSink(domain.table("records"));
            this.ctx.effect(() => async () => { await domain.close(); }, "usage-tracker.domainClose");
        }
        /** Lifetime/cross-session overview (totals, prior-window delta, per-day, per-model, by-dimension). */
        async overview(request) {
            const req = request ?? {};
            const filter = {
                from: req.from,
                to: req.to,
                groupBy: req.groupBy ?? "source",
                excludeEstimated: req.excludeEstimated,
            };
            return this.sink ? this.sink.overview(filter) : emptyOverview();
        }
        /** Most-recent records across all sessions (newest first). */
        async recent(request) {
            const limit = request && typeof request.limit === "number" ? request.limit : 50;
            return this.sink ? this.sink.recent({}, limit) : [];
        }
        /** Delete all stored usage. Returns the number of rows removed. */
        async clear() {
            return { cleared: this.sink ? await this.sink.clear() : 0 };
        }
    };
})();
export { UsageStoreService };
function emptyOverview() {
    return {
        totals: { promptTokens: 0, completionTokens: 0, reasoningTokens: 0, cacheReadTokens: 0, cacheCreationTokens: 0, costUsd: 0, requests: 0 },
        previous: null, series: [], byModel: [], byDimension: [],
    };
}
/** Mount the durable store + Remote on a context. */
export function usageStorePlugin(ctx) {
    ctx.plugin(UsageStoreService);
}
//# sourceMappingURL=remote.js.map