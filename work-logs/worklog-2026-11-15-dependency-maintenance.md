---
title: "Worklog — 1.0 Dependency maintenance"
description: "Local execution and validation of dependency upgrades for issue 11"
spec: "docs/specs/spec-m1-0-dependency-maintenance.md"
status: "in-progress"
started: "2026-11-15T13:29:12Z"
finished: ""
executor:
  model: "unreported"
  runtime: "codex-cli 0.163.0"
  duration: "in progress"
git:
  repo: "/opt/agents/repos/ops-toolbox-task-1-0"
  branch: "task/1-0-dependency-maintenance"
  base: "73bd13fb1e03a44983a6d30ff287adaef2aa1e15"
  commit: "see gate commit history"
publication:
  status: "pending"
  ref: "local branch; Claude review before publication"
tags:
  - type: worklog
  - domain: security
---

# Worklog — 1.0 Dependency maintenance

## Authority and runtime

Don authorized spec 1.0 v0.4 only: “approved, execute,” 2026-11-15 07:51
America/New_York, Action Registry `rec6VLa3hwb0m0QD3`, tracking issue #11.
Input spec at `73bd13fb1e03a44983a6d30ff287adaef2aa1e15` has SHA-256
`6deecab37389057a0cdd4015d99bf85b23924697514731d2ae51ed1b61f1799c`,
verified before edits. Run `opstoolbox10-codex-20261115T132852Z-15d387`.
Actual `hostname`: `ml01a`; account `crainbramp`. Execution began at
`2026-11-15T08:29:12-05:00`. `codex --version` reported `codex-cli 0.163.0`.
The active tool interface does not expose an exact model identifier: runtime
model is **unreported**. Dispatch supplied `gpt-6.1-sol`, reasoning high; this
is provenance supplied by the operator, not independently observed model metadata.
Token usage and cost are unavailable. No model switch or additional agent ran.

Repository, workspace and machine AGENTS instructions, project execution contract,
full spec and spec index were read. Local `spec-startup` / `spec-closeout` and
Playwright skills were read. Shared Python resolves to `/opt/agents/venv/bin/python`;
`npx` exists. The central worklog template and registry schema were inspected,
but the explicit Modify list limits writes to this repo. No central registry
append or archive relocation is authorized. The in-repo spec stays in place.

The dispatcher-created branch was clean at startup. `git merge-base HEAD main`
and `git rev-parse HEAD` both returned the base above. The primary checkout is
untouched. Network is restricted to package registries, with loopback preview
traffic for browser proof. No GitHub calls, `gh`, remote queries or publication
are performed. The spec's `git ls-remote` check is superseded by this restriction;
local evidence and the launcher push prohibition establish this run's posture.
Docker D1 is UNAVAILABLE by dispatch; no Docker access is attempted.
Playwright uses the dispatch's Node package 1.64.1 outside the repo and the
existing read-only Chromium cache; no browser download.

## Gate 1.0.1 — Inventory and decisions

Checkpoint: 2026-11-15 08:31 EST. PASS, inventory and target decisions only.
No package changes in this gate.

Baseline clean detached worktree: `/tmp/ops10-baseline` at `73bd13f`.
All install/test/build claims use
`npx -y -p node@22 -p npm@12.0.2 -- <command>` in that worktree.
Observed `node -v`: **v22.23.5**; `npm -v`: **12.0.2**.
`npm ci` passed; `npm run test`: **550 tests, 63 files**, 6.46 s;
`npm run build` passed (26 prerendered routes).

`npm audit --json`: **7 package entries: 0 critical, 1 high, 3 moderate,
3 low, 0 info**, exactly matching the spec's entry/severity table. Exit 1 is
the expected advisory report, not a validation failure. Findings within Vite
include additional Windows editor and dev-server advisories beyond the four
headline Sources links; all are included below, rather than treating seven
package entries as seven distinct advisories.

| Package / locked version | Severity | Advisory / dependency path | Offered repair |
|---|---|---|---|
| vite 5.4.21 | high | GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-fx2h-pf6j-xcff; esbuild | 8.3.8 |
| esbuild 0.21.5 | moderate | GHSA-67mh-4wv8-2f99, via Vite | Vite 8.3.8 |
| react-router-dom 6.30.6 | moderate | react-router | 7.18.5 |
| react-router 6.30.6 | moderate | GHSA-wrjc-x8rr-h8h6; GHSA-337j-9hxr-rhxg | react-router-dom 7.18.5 |
| mermaid 11.17.2 | low | katex | 12.3.0 |
| katex 0.16.47 | low | GHSA-238p-pmpm-9mq7; affected >=0.11.0 <0.18.2 | Mermaid 12.3.0 |
| @mermaid-js/layout-elk 0.2.1 | low | mermaid → katex | 1.0.2 |

Version and peer evidence: `npm view <package>@<version> version engines
peerDependencies dependencies peerDependenciesMeta --json`, registry tarball
package.json/README and Router CHANGELOG; current Vitest metadata also checked
against the committed lockfile.

| Family | Target | Relevant compatibility evidence |
|---|---|---|
| Vite | 8.3.8 | Node ^20.19.0 or >=22.12.0; no React peer. Optional esbuild ^0.27.0 or ^0.28.0. Existing nested Vitest Vite is already 8.3.8. |
| @vitejs/plugin-react | 6.3.0 | Vite ^8.0.0; Node ^20.19.0 or >=22.12.0; no React peer constraint. Published README says Fast Refresh needs React >=16.9. React Compiler peers optional and compiler not enabled. |
| Vitest | retain locked 4.1.12 / declared ^4.1.0 | Vite dependency and peer ^6.0.0 or ^7.0.0 or ^8.0.0; jsdom *; Node ^20 or ^22 or >=24; no React peer. No upgrade required. |
| react-router-dom + react-router | 7.18.5 | Both declare React >=18; DOM package also React DOM >=18; core's React DOM peer optional. Node >=20. |
| Mermaid | 12.3.0 | Node >=22.12.0; no React peer; KaTeX ^0.18.0 permits patched >=0.18.2. |
| @mermaid-js/layout-elk | 1.0.2 | Mermaid ^12.0.0; Node >=22.12.0; no React peer; KaTeX ^0.18.0. |

React 18.3.1 and Tailwind 3 remain frozen. Every selected target permits React 18.
No forced overrides, resolutions or audit-force command is used.

Code-specific breaking-change assessment:

- Vite 8 uses Rolldown/Oxc instead of Rollup/esbuild. The current config uses only
  `react()`, `base` and Vitest options; no custom Rollup, Babel or esbuild options.
  Plugin 6's default automatic JSX path supports this React 18 app. Aligning the
  plugin removes its deprecated options without log suppression. Retain Vitest.
- Router 7 retains declarative BrowserRouter/Routes/Route/Link exports through
  react-router-dom. Node minimum rises; React 18 remains supported. This app uses
  static paths, no loaders/actions, SSR hydration, relative nested splats or
  unstable framework features. Keep lazy components and the catch-all route;
  validate direct loads and history in the browser rather than infer compatibility.
- Mermaid 12 bundles ELK and makes it the upstream default. The app explicitly
  selects `elk` or `dagre`, so preserve its choice and strict mode. ELK 1's
  published README says its existing `registerLayoutLoaders` API is retained;
  re-registering on the normal build is harmless but duplicates layout code.
  Keep the dependency pair per gate scope and qualify both layout choices, math,
  SVG/PNG exports and malicious diagrams. No source change is assumed until proven.

Baseline test log reproduces these three warnings (build has only the existing
large-chunk advisory): `esbuild` specified by `vite:react-babel` is deprecated in
favor of `oxc`; `optimizeDeps.esbuildOptions` is deprecated in favor of
`optimizeDeps.rolldownOptions`; both esbuild and oxc options set, esbuild ignored.

The review surface begins with provisional R1–R7, D1 and W1–W3. Advisory entries
will be closed as repaired or converted to residual acceptance questions based
on the final audit. Workflow annotation evidence is the committed spec's prior
record, not a fresh CI fetch; registry-only network prevents inspecting the
resolved Azure action. This limitation will remain explicit in W2.

Supplementary raw logs/registry metadata are at `/tmp/ops10-evidence` on ml01a
(local, disposable scratch); all decision evidence and counts are included here.

## Operator interactions

No questions were put to the operator during execution. The dispatch is the
authorization; review and acceptance remain with Claude and Don.

## Gate 1.0.2 — Build tooling

Gate 1.0.1 final commit `9de1dfc` was independently checked in a clean detached
worktree `/tmp/ops10-gate1`: Node v22.23.5, npm 12.0.2, `npm ci`, 550 tests
in 63 files (6.76 s), build (15.02 s), audit seven entries as above. PASS.

Upgrade command under the parity toolchain:
`npm install --save-dev 'vite@^8.3.8' '@vitejs/plugin-react@^6.3.0'`.
Only package manifest/lockfile change; no source/config compatibility edits were
required by the supported default plugin API. Vitest remains 4.1.12. npm's
post-install audit reports five entries (3 low, 2 moderate), with no high/critical.
Clean candidate commit `f8a659e` validation at `/tmp/ops10-gate2` passed:
Node **v22.23.5**, npm **12.0.2**, clean `git status`, `npm ci` (2.34 s),
`npm ls vite esbuild --all` (Vite **8.3.8** deduped across plugin and Vitest;
**no esbuild installed**), **550 tests in 63 files** (6.32 s Vitest duration),
build (1.03 s Vite duration), 26 prerendered routes. All three baseline
esbuild/oxc warnings are absent from both test and build logs. The existing
large-chunk warning remains visible. Audit: 5 entries, 0 high/critical.
This checkpoint is amended into the same gate commit; its final commit is then
rechecked in a fresh clean worktree before Router work begins.
