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

/** src-json codec: JSON in, JSON out, no structural schema. */
const srcJson = { mode: "src-json" as const };

/** One direct method with a single JSON `request` arg and a JSON result. */
function method(pkg: string, ns: string, name: string, hasArg: boolean) {
  return {
    id: `${pkg}#${ns}/${name}`,
    service: ns,
    namespace: ns,
    method: name,
    invocation: { kind: "direct" as const },
    parameters: hasArg
      ? [{ name: "request", wire: "request", source: "json" as const, codec: srcJson }]
      : [],
    result: srcJson,
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
