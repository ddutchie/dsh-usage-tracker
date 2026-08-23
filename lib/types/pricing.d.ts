/**
 * Cost resolution: the reusable, non-trivial core of usage tracking. Providers
 * report cost and cache tokens in wildly different shapes (or not at all); this
 * module normalizes both, and estimates cost from a pricing table when the
 * provider is silent.
 */
import type { ModelPricingRate } from "./types.js";
/**
 * A tiny default pricing table (USD per 1M tokens). Deliberately small — a host
 * with a live catalog (e.g. models.dev) should pass its own `pricing` fn to the
 * tracker. Keys are matched case-insensitively as substrings so "…/gpt-4o" hits
 * "gpt-4o". Values are best-effort public list prices for orientation only.
 */
export declare const DEFAULT_MODEL_PRICING: Record<string, ModelPricingRate>;
/** Resolve a pricing rate for a model from a table or a function. */
export declare function resolvePricing(model: string, pricing?: Record<string, ModelPricingRate> | ((model: string) => ModelPricingRate | undefined)): ModelPricingRate | undefined;
/**
 * Estimate USD cost from token counts and a pricing rate. Cache-aware: cached
 * reads are billed at `cacheRead` and subtracted from the input billed at the
 * full rate. Returns undefined when there is no usable rate.
 */
export declare function estimateCostUsd(model: string, promptTokens: number, completionTokens: number, cacheReadTokens: number, cacheCreationTokens: number, pricing?: Record<string, ModelPricingRate> | ((model: string) => ModelPricingRate | undefined)): number | undefined;
/** Extract a provider-reported USD cost from divergent response shapes. */
export declare function extractCost(raw: unknown): number | undefined;
/**
 * Normalize prompt-cache tokens across providers into
 * `{ cacheReadTokens, cacheCreationTokens }`. Handles Anthropic
 * (`cache_read_input_tokens`/`cache_creation_input_tokens`), DeepSeek
 * (`prompt_cache_hit_tokens`), and OpenAI (`prompt_tokens_details.cached_tokens`).
 */
export declare function extractCacheTokens(raw: unknown): {
    cacheReadTokens: number;
    cacheCreationTokens: number;
};
//# sourceMappingURL=pricing.d.ts.map