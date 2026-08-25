# Build toolchain pin — why `@angular/build` and `@angular/cli` are 21.2.13

```
"@angular/build": "21.2.13"   // exact, no caret
"@angular/cli":   "21.2.13"   // exact, no caret
```

Both are pinned **exactly**. Do not add `^`, `~`, a tag, an alias, or an
`overrides` entry, and do not raise the pin without re-proving a natural build
exit (`npm run test:build-exit`).

## The defect

Upstream: **[angular/angular-cli#33497](https://github.com/angular/angular-cli/issues/33497)** —
*"ng build hangs after a successful build on @angular/build 21.2.14–21.2.18
(regression from #33267)"*.

PR **#33267** changed one-shot (non-`--watch`) builds from `esbuild.build()` to
`esbuild.context()` + `.rebuild()`. That fixed a resource leak (#33201) but
introduced a context-teardown race in the non-watch path: the build completes,
writes every artifact, prints the summary and `Output location:` — and then the
process never exits, because the esbuild **service child process** is never
released.

The upstream report names 21.2.14–21.2.18 as affected, with **21.2.13 the last
working version**, and the reproducer needs only two or more components with
inline `styles:` blocks.

## What we observed locally

**Discrepancy worth knowing:** the upstream issue is **closed** and names
21.2.14–21.2.18, but we reproduced the hang on **21.2.21** — outside that stated
range. So either the upstream fix regressed after 21.2.18, or the range in the
report was simply what that reporter tested. We did not establish which. What we
did establish empirically, on this codebase and this machine, is narrow and
sufficient: **21.2.21 never exits, 21.2.13 exits 0 on its own.** Treat any
version above 21.2.13 as unproven here until `npm run test:build-exit` says
otherwise.

Reproduced on **21.2.21** under **both** Node 25.8.1 and Node 22.12.0, with and
without concurrent builds:

- The `ng build` process's **only** surviving handle was
  `{"type":"ChildProcess","spawnfile":".../@esbuild/darwin-arm64/bin/esbuild"}`.
- Across **2297** handle dumps from 5 build processes, `Timeout`/`Timer`
  occurrences were **0** — no application timer, listener, socket, or
  reconnect loop was ever involved.
- Killing **only** that esbuild child made the parent exit **0** within 1
  second (`{"tag":"exit:0","handleCount":0}`), which isolates it as the holder.
- Rollup's `once('beforeExit')` async-flush guard never tripped, so this is not
  an unresolved plugin promise.
- `esbuild` was at exactly the version `@angular/build` pins, with a single
  installed copy, so this was not version drift.

The artifact produced by the hanging build was complete and byte-identical to
the artifact produced by the pinned toolchain — the defect is purely process
teardown, never output correctness.

## Why a pin and not something else

| Rejected | Reason |
|---|---|
| Upgrade `@angular/build` | 21.2.21 was the newest 21.x release; there was nothing to move to |
| Override/pin `esbuild` | already at the exact version Angular pins, single copy |
| Fix application lifecycle code | zero application handles in 2297 dumps — nothing to fix |
| `patch-package` on `@angular/build` | vendored third-party patch in production tooling |
| `outputMode: static` / drop SSR | would delete the SSR the AI-readiness work depends on |
| Kill the child / watchdog / `\|\| true` / `process.exit(0)` | masks a stuck process instead of removing the defect, and would let a broken build ship |

The pin removes the regression itself and is an ordinary, reproducible
lockfile change.

## Lockfile consequences

Pinning to 21.2.13 also moves its own transitive tree back. All of it is
build-time only — **no application runtime dependency changes**, and
`@angular/core`, `@angular/ssr`, `@angular/compiler-cli` stay on 21.2.21:

- `@angular-devkit/{architect,core,schematics}`, `@schematics/angular` → the
  `.13` line (architect `0.2102.13`)
- `piscina` 5.2.0 → 5.1.4 (prerender worker pool)
- `pacote` 21.5.1 → 21.3.1, `undici` 7.29.0 → 7.24.4 (CLI package fetching)
- `@hono/node-server`, `@modelcontextprotocol/sdk` (Angular CLI's MCP server)
- `esbuild` **0.27.3** nested under `@angular/build` (the version that release
  pins). The hoisted `esbuild` 0.28.1 remains, but only for `vitest`'s Vite.

Peer compatibility was verified from npm metadata before the change:
`@angular/build@21.2.13` requires node `^20.19.0 || ^22.12.0 || >=24.0.0`
(we run **v22.12.0**), `@angular/core: ^21.0.0`, `@angular/ssr: ^21.2.13`,
`typescript >=5.9 <6.0` (we have 5.9.3). Full-tree `npm ls` exits 0 — no
`--force`, no `--legacy-peer-deps`.

## Guards

- `npm run test:build-toolchain` — declarations are exactly `21.2.13`, lockfile
  agrees, no range operator, every installed copy matches, this doc still
  explains why. Mutation-tested by `npm run test:build-toolchain:selftest`.
- `npm run test:build-exit` — runs the **real** production build and requires it
  to exit **0 naturally** within a generous bound, then asserts no `ng` or
  `esbuild` child survives. A timeout is a **test failure**: the watchdog
  terminates only its own child tree and exits non-zero. It never converts a
  timeout into success, and no deploy step may continue past it.

## When raising the pin

1. Bump both declarations to the candidate version and `npm install`.
2. Run `npm run test:build-exit`. If the build does not exit **on its own**,
   revert — regardless of whether the artifact looks complete. A complete
   artifact from a hung build is exactly this defect's signature.
3. Re-run `npm run test:build-toolchain` and update `PINNED` in
   `scripts/deploy/validate-build-toolchain.mjs` plus this document.
