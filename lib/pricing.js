/**
 * A tiny default pricing table (USD per 1M tokens). Deliberately small — a host
 * with a live catalog (e.g. models.dev) should pass its own `pricing` fn to the
 * tracker. Keys are matched case-insensitively as substrings so "…/gpt-4o" hits
 * "gpt-4o". Values are best-effort public list prices for orientation only.
 */
export const DEFAULT_MODEL_PRICING = {
    "gpt-4o": { input: 2.5, output: 10, cacheRead: 1.25 },
    "gpt-4o-mini": { input: 0.15, output: 0.6, cacheRead: 0.075 },
    "o1": { input: 15, output: 60, cacheRead: 7.5 },
    "o3": { input: 2, output: 8, cacheRead: 0.5 },
    "claude-3-5-sonnet": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    "claude-sonnet-4": { input: 3, output: 15, cacheRead: 0.3, cacheWrite: 3.75 },
    "claude-opus-4": { input: 15, output: 75, cacheRead: 1.5, cacheWrite: 18.75 },
    "deepseek-chat": { input: 0.27, output: 1.1, cacheRead: 0.07 },
    "deepseek-reasoner": { input: 0.55, output: 2.19, cacheRead: 0.14 },
};
/** Resolve a pricing rate for a model from a table or a function. */
export function resolvePricing(model, pricing) {
    if (typeof pricing === "function")
        return pricing(model);
    const table = pricing ?? DEFAULT_MODEL_PRICING;
    if (table[model])
        return table[model];
    const lower = model.toLowerCase();
    for (const [key, rate] of Object.entries(table)) {
        if (lower.includes(key.toLowerCase()))
            return rate;
    }
    return undefined;
}
/**
 * Estimate USD cost from token counts and a pricing rate. Cache-aware: cached
 * reads are billed at `cacheRead` and subtracted from the input billed at the
 * full rate. Returns undefined when there is no usable rate.
 */
export function estimateCostUsd(model, promptTokens, completionTokens, cacheReadTokens, cacheCreationTokens, pricing) {
    const rate = resolvePricing(model, pricing);
    if (!rate || (rate.input == null && rate.output == null))
        return undefined;
    const M = 1_000_000;
    const uncachedInput = Math.max(0, promptTokens - cacheReadTokens);
    let cost = 0;
    if (rate.input != null)
        cost += (uncachedInput / M) * rate.input;
    if (rate.output != null)
        cost += (completionTokens / M) * rate.output;
    if (rate.cacheRead != null)
        cost += (cacheReadTokens / M) * rate.cacheRead;
    if (rate.cacheWrite != null)
        cost += (cacheCreationTokens / M) * rate.cacheWrite;
    return cost;
}
/** Extract a provider-reported USD cost from divergent response shapes. */
export function extractCost(raw) {
    if (raw == null || typeof raw !== "object")
        return undefined;
    const r = raw;
    if (typeof r.cost === "number")
        return r.cost;
    if (r.cost && typeof r.cost === "object" && typeof r.cost.request_cost_usd === "number")
        return r.cost.request_cost_usd;
    if (typeof r.request_cost_usd === "number")
        return r.request_cost_usd;
    if (r.usage && typeof r.usage === "object" && typeof r.usage.cost === "number")
        return r.usage.cost;
    return undefined;
}
/**
 * Normalize prompt-cache tokens across providers into
 * `{ cacheReadTokens, cacheCreationTokens }`. Handles Anthropic
 * (`cache_read_input_tokens`/`cache_creation_input_tokens`), DeepSeek
 * (`prompt_cache_hit_tokens`), and OpenAI (`prompt_tokens_details.cached_tokens`).
 */
export function extractCacheTokens(raw) {
    const out = { cacheReadTokens: 0, cacheCreationTokens: 0 };
    if (raw == null || typeof raw !== "object")
        return out;
    const u = raw;
    if (typeof u.cacheReadTokens === "number")
        out.cacheReadTokens = u.cacheReadTokens;
    else if (typeof u.cache_read_input_tokens === "number")
        out.cacheReadTokens = u.cache_read_input_tokens;
    else if (typeof u.prompt_cache_hit_tokens === "number")
        out.cacheReadTokens = u.prompt_cache_hit_tokens;
    else if (typeof u.cachedTokens === "number")
        out.cacheReadTokens = u.cachedTokens;
    else if (u.prompt_tokens_details && typeof u.prompt_tokens_details.cached_tokens === "number") {
        out.cacheReadTokens = u.prompt_tokens_details.cached_tokens;
    }
    if (typeof u.cacheCreationTokens === "number")
        out.cacheCreationTokens = u.cacheCreationTokens;
    else if (typeof u.cacheWriteTokens === "number")
        out.cacheCreationTokens = u.cacheWriteTokens;
    else if (typeof u.cache_creation_input_tokens === "number")
        out.cacheCreationTokens = u.cache_creation_input_tokens;
    return out;
}
//# sourceMappingURL=pricing.js.map