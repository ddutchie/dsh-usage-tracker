/**
 * Hand-authored Typert Remote contribution for the `usage` namespace.
 *
 * DSH's `ctx.remote.<ns>` is normally populated by codegen artifacts imported
 * into the host's api-remotes bundle — which a third-party plugin can't join.
 * But `ctx.remote.$mount(contribution)` accepts a `TypertRemoteContribution`
 * ({ package, descriptors }) at runtime, and descriptors are plain objects. In
 * `src-json` codec mode (JSON-safe values, no generated schema) we can author
 * them by hand — no Typert compiler needed — mounting `usage` client-side so
 * the Settings panel can call `ctx.remote.usage.overview()/recent()/clear()`.
 */
/** The runtime contribution passed to `ctx.remote.$mount(...)`. */
export declare const usageRemoteContribution: {
    package: string;
    descriptors: {
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: "direct";
        };
        parameters: {
            name: string;
            wire: string;
            source: "json";
            codec: {
                mode: "src-json";
            };
        }[];
        result: {
            mode: "src-json";
        };
    }[];
};
//# sourceMappingURL=remote-contribution.d.ts.map