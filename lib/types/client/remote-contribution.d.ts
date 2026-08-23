/**
 * Hand-authored Typert Remote contribution for the `usage` namespace.
 *
 * DSH's `ctx.remote.<ns>` is normally populated by codegen artifacts imported
 * into the host's api-remotes bundle — which a third-party plugin can't join.
 * But `ctx.remote.$mount(contribution)` accepts a `TypertRemoteContribution`
 * ({ package, descriptors }) at runtime, and descriptors are plain objects, so
 * we author them by hand — no Typert compiler needed — mounting `usage`
 * client-side so the Settings panel can call `ctx.remote.usage.*`.
 *
 * The CLIENT gateway requires STRICT codecs (a zod schema with `.parse`) for
 * params and results (src-json is host-only), so we supply permissive
 * pass-through schemas: validation is not our safety boundary here (the host
 * already validates), we just need a `.parse` the client accepts.
 */
import { z } from "zod";
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
                mode: "strict";
                typeSymbol: string;
                schema: z.ZodAny;
            };
        }[];
        result: {
            mode: "strict";
            typeSymbol: string;
            schema: z.ZodAny;
        };
    }[];
};
//# sourceMappingURL=remote-contribution.d.ts.map