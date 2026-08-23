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

/** Strict codec with a permissive pass-through schema (client requires `.parse`). */
function strict(typeSymbol: string) {
  return { mode: "strict" as const, typeSymbol, schema: z.any() };
}

/** One direct method with a single JSON `request` arg (optional) and a JSON result. */
function method(pkg: string, ns: string, name: string, hasArg: boolean) {
  return {
    id: `${pkg}#${ns}/${name}`,
    service: ns,
    namespace: ns,
    method: name,
    invocation: { kind: "direct" as const },
    parameters: hasArg
      ? [{ name: "request", wire: "request", source: "json" as const, codec: strict(`${pkg}#${name}Request`) }]
      : [],
    result: strict(`${pkg}#${name}Result`),
  };
}

const PACKAGE = "dsh-usage-tracker";
const NS = "usage";

/** The runtime contribution passed to `ctx.remote.$mount(...)`. */
export const usageRemoteContribution = {
  package: PACKAGE,
  descriptors: [
    method(PACKAGE, NS, "overview", true),
    method(PACKAGE, NS, "recent", true),
    method(PACKAGE, NS, "clear", false),
  ],
};
