# dsh-usage-tracker — status & open issue

_Last updated: handoff for a fresh session._

## What works

- **Capture** (host): `UsageTrackerService` folds per-turn usage from the session
  event stream — verified against real session logs (correct model, tokens,
  cost). Event shapes it depends on (dsh `0.1.1-rc.2`):
  - `request/header` → model at **`data.header.config.{provider,model}`** (NOT `data.config`).
  - `assistant/message` → usage at **`data.usage`** (`{ inputTokens, outputTokens }`), model also at `data.message.source.model`.
  - `assistant/chunk` (`data.chunk.type === "usage"`) → per-step usage samples.
- **Per-session Usage tab** (`conversation.view`): renders live via the
  `sessionUsage` session projection (`useProjection`). **Confirmed working** in
  the harness — shows INPUT/OUTPUT/COST/REQUESTS + Daily + By-model + Recent.
- **Durable store** (host): `UsageStoreService` (a `TypertRemoteService`) opens a
  `storageDomain` domain (`usage_tracker`) and persists every `usage/recorded`
  turn to `~/.dsh/storages/usage_tracker.json`. **Confirmed persisting** (grows
  across restarts; had 6 records at handoff).
- **Remote round-trip**: the agent's **headless Playwright probe** showed the
  Settings panel calling `ctx.remote.usage.overview()` and receiving real
  aggregated data: `{ ok:true, value:{ totals:{ promptTokens:42824, requests:5, costUsd:0.208 … } } }`, and the panel rendered it.

## Open issue (OPEN)

**Settings → Usage panel renders empty (0 / "No usage recorded") in the user's
own `pnpm dsh web` run**, even though:
- the durable store has records on disk, and
- a headless Playwright probe of the same server rendered the data correctly.

This discrepancy (probe sees data, live browser doesn't) points at one of:
1. **Timing/caching** — the `$mount(usageRemoteContribution)` is async; the
   settings section is registered from a `.then()` child inject scope. If the
   user opens Settings before `$mount` resolves (or a cached module/rev is
   served), `props.usage` is absent and the panel shows empty. The probe waits
   ~3.5s after navigation; a real user may hit it in a different order.
2. **Stale bundle** — the browser may be serving a cached `client.js?rev=…`; a
   hard reload / new profile may differ from the freshly-reinstalled probe run.
3. **Profile/data difference** — the probe and the user may be on a different
   session/window state.

### Where it stands in code (all pushed to `main`)
- `src/client/index.tsx` — `apply()` `$mount`s the `usage` contribution, then on
  resolve registers the `settings.section` from `ctx.inject(["slots","remote.usage"])`.
  `UsageRemoteSection` calls `props.usage.overview()/recent()` and unwraps the
  `RemoteResult { ok, value }`.
- `src/client/remote-contribution.ts` — hand-authored `TypertRemoteContribution`
  (strict `z.any()` pass-through codecs; the CLIENT gateway requires strict).
- `src/remote.ts` — `@Remote('overview'|'recent'|'clear')`; SRC-mode requires
  **plain identifier params, no default values** (learned the hard way).

### Fixes already applied (the chain that got it working in the probe)
1. `ctx.remote.usage` doesn't exist for third-party plugins → `ctx.remote.$mount(contribution)` at runtime.
2. Self-mount deadlock → register settings from a child `ctx.inject(["slots","remote.usage"])` scope, not the plugin-root inject.
3. Client gateway requires **strict** codecs (not `src-json`) → permissive `z.any()` schemas.
4. Remote returns `RemoteResult { ok, value }` → unwrap `.value`.
5. SRC `@Remote` methods need plain identifier params (no `= {}` defaults).
6. `sessionUsage` projection was impure (mutated state) + could throw into the
   turn path → made pure + crash-safe (this also cleared a **false-alarm
   "messages not sending"** regression).

## Next steps to try (fresh session)

1. **Reproduce with the user's exact flow** — a real key + hard reload, open
   Settings first vs the conversation tab first; capture browser console for
   `[usage-tracker]` logs (re-add temporarily) to see if `props.usage` is defined
   and what `overview()` returns.
2. **Make the panel resilient to mount timing** — instead of registering the
   settings section only inside the `$mount().then()` callback, register it
   unconditionally and have `UsageRemoteSection` **await `ctx.remote.$mount` +
   poll/retry** `ctx.remote.usage` until available, or subscribe to a
   ready-signal. The current design can miss if Settings is opened pre-mount.
3. **Consider a simpler read path** — expose the durable overview through a
   second **session projection** (or a global observable) so the client reads it
   the same way the working per-session tab does, avoiding the Remote timing
   entirely for the common case.
4. **Verify the served `rev`** — confirm the browser isn't caching an old
   `client.js`; bump/rev or use a fresh `$DSH_HOME` profile.

## Test harness notes
- Install into a profile: `dsh plugin --profile web add github:ddutchie/dsh-usage-tracker`
- Roster row (in `$DSH_HOME/profiles/web/cordis.patch.yml`): `- insert: [{ id: usage-tracker, name: 'dsh-usage-tracker' }]`
- `~/.dsh/storages/usage_tracker.json` is the durable store — inspect it to confirm capture.
- The store only captures turns that happen **while mounted** (no backfill of old session logs).
