---
title: "Worklog — 1.0 Dependency maintenance"
description: "Local execution and validation of dependency upgrades for issue 11"
spec: "docs/specs/spec-m1-0-dependency-maintenance.md"
status: "partial"
started: "2026-11-15T13:29:12Z"
finished: "2026-11-15T13:47:00Z"
executor:
  model: "unreported"
  runtime: "codex-cli 0.163.0"
  duration: "1068 seconds to seal"
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

## Gate 1.0.3 — Router

Final gate 1.0.2 commit `eb94783` was validated from clean
`/tmp/ops10-gate2-final`: Node v22.23.5 / npm 12.0.2; `npm ci` 2.62 s;
550 tests / 63 files (6.30 s); build 1.05 s, 26 routes. `npm ls` shows only
Vite 8.3.8, no esbuild, and baseline deprecations remain absent. PASS.

`npm install 'react-router-dom@^7.18.5'` updates Router DOM and core to
7.18.5 under parity. No application or test compatibility edits were necessary:
BrowserRouter, lazy routes and NotFound remain unchanged. npm reports only the
three low Mermaid-family entries after this upgrade. Clean candidate commit `9376e9b` at `/tmp/ops10-gate3` passed with Node
**v22.23.5** / npm **12.0.2**: `npm ci` 2.35 s, **550 tests in 63 files**
(6.24 s), build 26 routes (1.03 s), Router DOM/core **7.18.5** only.
Audit: three low entries, zero moderate/high/critical.

Playwright **1.64.1** / Chromium **156.0.8078.4**, bundled revision **1248**,
against local production preview port 4173: **27 direct loads passed** (24 tool
paths, home, about, unknown path). Primary h1 text equals the pre-upgrade baseline
on every path; unknown path shows `404` and `Tool Not Found`. App links navigate
Subnet Calculator → directory → CIDR Range Expander; two browser Back operations
restore Subnet Calculator, and two Forward operations restore CIDR Range Expander.
**0 page exceptions; 0 aborted external requests.** No browser downloaded and no
Playwright dependency added to the repo.

Probe-only corrections before the baseline capture: Markdown sample content adds
another h1, so assert the primary heading; CIDR's actual heading is `CIDR Range
Expander`; directory links resolve relative paths, so match their href suffix.
These were scratch harness assumptions, not app failures or compatibility edits.
The checkpoint is amended into this gate commit and the final commit is rechecked
from a clean worktree before gate 1.0.4.

## Gate 1.0.4 — Mermaid stack

Final gate 1.0.3 commit `54c83cc` passed from clean `/tmp/ops10-gate3-final`:
Node v22.23.5 / npm 12.0.2; `npm ci` 2.34 s; 550 tests / 63 files (6.25 s),
build 1.11 s / 26 routes. Final-commit browser run again passed all 27 direct
loads and history traversal with 0 exceptions / 0 external requests. PASS.

Upgrade: `npm install 'mermaid@^12.3.0' '@mermaid-js/layout-elk@^1.0.2'`.
Add `tests/lib/mermaidConfig.test.js` as the security qualification explicitly
required by this gate: each of dark/light × dagre/elk must stay strict (4 cases).
Existing Markdown sanitization tests and JSON handling are unchanged. No application compatibility edit was required.

Clean candidate `557966b`, `/tmp/ops10-gate4`, Node **v22.23.5** / npm
**12.0.2**: `npm ci` 2.43 s; **554 tests in 64 files** (6.32 s), exactly
baseline 550 plus the four required strict-mode cases; build 1.13 s / 26 routes.
`npm ls mermaid katex @mermaid-js/layout-elk --all` shows **12.3.0 / 0.18.10 /
1.0.2**, all deduped, no affected versions. `npm audit --json` exits 0:
**0 critical, 0 high, 0 moderate, 0 low, 0 info, total 0**.

Production preview browser (Playwright 1.64.1 / Chromium 156.0.8078.4) passed:
Dagre flowchart and ELK flowchart (2 nodes each), KaTeX flowchart (`.katex`
exists), SVG export **11,918 bytes** (valid XML, image decodes **300×53**), PNG
export **8,968 bytes** (PNG signature, image decodes **720×128**). PNG visually
inspected: Alpha → Beta labels, boxes and arrow visible.

Valid callback fixture: `flowchart LR\n A[Safe] --> B[Target]\n click A call
alert(1)` rendered two nodes; clicked Safe/A. Valid HTML fixture: `flowchart LR\n
A["<img src=x onerror=alert(1)>"] --> B[Target]` rendered two nodes. **No dialogs,
no onerror attribute, no page exceptions or external requests**. The app still
ignores bindFunctions; these are behavior checks, not proof of strict mode.

Mutation in the scratch checkout only: replace `securityLevel: 'strict'` with
`'loose'`; run `npm run test -- tests/lib/mermaidConfig.test.js`. Expected exit
**1**, **4 failed / 4**, each `expected 'loose' to be 'strict'` at test line 13.
Finally restored original config bytes, then `npm run test --
tests/lib/mermaidConfig.test.js tests/lib/markdownUtils.test.js`: **18 tests in
2 files passed** (0.560 s). Scratch `git status` is clean after restoration;
`git diff main -- tests/lib/markdownUtils.test.js src` is empty. Existing Markdown
and JSON sanitization is untouched.

The checkpoint is amended into the same gate commit, then its final commit is
validated in a fresh clean checkout before release proof.

## Gate 1.0.5 — Release proof and review surface

Final Mermaid gate `d3894ab`, clean `/tmp/ops10-gate4-final`, Node v22.23.5 /
npm 12.0.2: `npm ci` 2.45 s; **554 tests / 64 files** (6.38 s), build 1.15 s,
26 prerendered routes; audit **0 entries**. Fresh-context route/history and full
Mermaid browser checks repeated against that exact commit: 27 paths, six diagram
checks, valid SVG/PNG files, no exceptions/dialogs/onerror/external requests. PASS.

Update only the authorized stack references to Vite 8 / React Router v7:
AGENTS lines 12/16, README Vite badge and routing diagram, architecture routing
references and tagging strategy Vite description. React/Tailwind/Vitest badges
stay accurate without edits. Complete review: R1–R7 repaired; no residuals;
D1 UNAVAILABLE, Dockerfile unchanged; W1–W3 proposed diffs only, with closed
questions, source-line evidence and production/preview implications. O1–O3
record proposed out-of-scope work. No workflow, global config or primary-checkout
mutation. No source edit was required by any upgrade.

Evidence limitation: registry-only networking prevents live CI/action.yml reads.
The W-items cite the authorized spec's observed run 43672134033 and freshly
verified local workflow lines, explicitly marking resolved SHAs/full declared
inputs and current warning persistence UNVERIFIED. They require separate review;
no guessed declaration or live-CI acceptance is claimed. The gate's full upstream
action-declaration validation is unavailable within this dispatch. Similarly,
D1 is not a passed image build. Neither limitation authorizes broader access.

Clean release candidate `596cf51` at `/tmp/ops10-gate5`: Node **v22.23.5** /
npm **12.0.2**, `npm ci` 2.54 s; **554 tests / 64 files** (6.75 s), build
1.18 s / 26 prerendered routes; fresh `npm audit --json` exits **0**, all severity
counts and total **0**. Playwright fresh context against built preview: all **27
paths** and history restore pass; requests outside `http://127.0.0.1:4177` are
aborted and logged, **aborted-request log empty**, **0 page exceptions**.

`rg -n 'Vite 5|React Router v6'` over all four scoped documents exits **1** (no
matches), as does the spec's equivalent grep check. `git diff main --stat --
.github/ Dockerfile` is empty. AGENTS diff changes exactly original lines **12
and 16**. `git diff --check` passes. No existing repository file was deleted.

Manifest SHA-256 `7881c303904769dba739f378051f7bcd7a896f94465772161f5216b3a8e420d2`;
lock SHA-256 `f394f501400fe521828d69ef9a46c102dcdb539271ef3f2fb1003cb328efa897`;
unchanged Markdown test SHA-256
`8e412b33a422fe0c91e9783bd4ade541dc4460cdf8c8f228e7f105d19c8b8323`.
This checkpoint is amended into the same gate commit; the final gate commit is
checked in another clean worktree before closeout. Local release checks PASS;
Docker and upstream workflow-metadata checks remain explicitly UNAVAILABLE.


## Gate 1.0.6 — Closeout and sealed handoff

Final release gate commit **`a47d695`** was tested from clean
`/tmp/ops10-gate5-final`, Node **v22.23.5** / npm **12.0.2**: `npm ci` **2.56 s**;
**554 tests / 64 files** (**6.74 s**), build **1.23 s**, **26 prerendered routes**;
fresh audit **0** in every severity (exit 0). The exact final gate commit's fresh
browser context passes **27 paths** and back/forward, **0 page exceptions** and
**0 external requests**. All request origins other than the loopback preview are
aborted/logged; that log is empty. No further package or source edits follow.

### Gate validation disposition

| Gate | Local result | Final gate commit / evidence |
|---|---|---|
| 1.0.1 | PASS | `9de1dfc`: inventory, peer ranges, baseline 550 / 63, audit 7 |
| 1.0.2 | PASS | `eb94783`: clean install, 550 / 63, patched single Vite, no esbuild, baseline deprecations absent |
| 1.0.3 | PASS | `54c83cc`: 550 / 63; 27 direct paths, back/forward, patched Router |
| 1.0.4 | PASS | `d3894ab`: 554 / 64; strict mutation 4 failures, restoration and unchanged Markdown cases pass; layout/math/exports/security fixtures pass |
| 1.0.5 | Local release checks PASS; evidence limits explicit | `a47d695`: 554 / 64, audit 0, 27 paths with no external requests; Docker D1 and upstream action declarations UNAVAILABLE |
| 1.0.6 | Local closeout sealed for review | This gate's commit; six reachable gate commits, proposed PR below, no publication |

Status is **partial**, sealed: all bounded dependency repairs and local runtime
checks succeeded, but the full upstream action-declaration proof cannot be met
under the explicit network restriction. Docker is separately unavailable by
spec design. No acceptance is inferred from successful process exits. This is
the clean local handoff boundary: Claude reviews this branch before anything is
pushed; Don decides D1 and W1–W3. The spec status is under-review, not accepted.
No failed upgrade or reverted gate exists. Intermediate candidate checkpoints
were amended locally only to add evidence; final gate commits were each rerun
from clean worktrees and are the five hashes listed above.

Before closeout, `git log main..HEAD` showed exactly those five gate commits;
this closeout adds the sixth. `git merge-base main HEAD` and local main remain
**`73bd13fb1e03a44983a6d30ff287adaef2aa1e15`**. No remote query was made: the
spec's `git ls-remote` validation is **NOT RUN** under registry-only networking.
No push was attempted, no GitHub action was taken, and the primary checkout was
not switched or edited. The launcher also disables push; no bypass was attempted.

Scope check: only the eleven allowed deliverable paths (including the spec status
and execution amendment); no repository file deletions; AGENTS only lines 12/16;
CLAUDE/REVIEW variants, workflow, Dockerfile, source, Vite config and other specs
unchanged. No auth/token stores or secret environment values were read. No global
configuration change, additional agent, model switch or browser download occurred.
No central lifecycle write is included because the dispatch's Modify list takes
precedence. No recycle/move/collision operation was needed.

### Route evidence (baseline and final headings match)

| Direct path | Primary h1 |
|---|---|
| `/` | Client-Side Developer Utilities |
| `/subnet-calculator` | Subnet Calculator |
| `/cidr-expander` | CIDR Range Expander |
| `/jwt-decoder` | JWT Decoder |
| `/password-generator` | Password Generator |
| `/ssh-keygen` | SSH Keypair Generator |
| `/x509-parser` | X.509 Certificate Parser |
| `/file-hash-calculator` | File Hash Calculator |
| `/bcrypt-hash-verifier` | Bcrypt Hash Verifier |
| `/json-yaml` | JSON ↔ YAML Converter |
| `/base64` | Base64 Codec |
| `/json-diff` | JSON Diff |
| `/csv-to-json` | CSV to JSON |
| `/sql-formatter` | SQL Formatter |
| `/mermaid-renderer` | Mermaid Renderer |
| `/url-parser` | URL Parser |
| `/useragent-decoder` | User-Agent Decoder |
| `/chmod-calculator` | Chmod Calculator |
| `/url-encoder` | URL Query Encoder |
| `/cron-parser` | Cron Parser |
| `/regex-tester` | Regex Tester |
| `/ascii-banner` | ASCII Banner |
| `/uuid-generator` | UUID Generator |
| `/epoch-time` | Unix Epoch Tool |
| `/markdown-previewer` | Markdown Previewer |
| `/about` | About Ops Toolbox |
| `/no-such-tool` | 404 |

Each direct response was HTTP 200, including the SPA fallback for the unknown
path; its rendered result is the 404 view. History proof uses the app's own links
through the directory between Subnet Calculator and CIDR Range Expander, then
Back twice / Forward twice and heading checks after restoration.

### Reproduction and evidence retention

For each gate, use a disposable detached worktree at its commit, record versions,
and run the following with Node 22 / npm 12.0.2. Remove the scratch worktree with
`git worktree remove --force <scratch>` afterwards (only run-owned scratch).

```sh
git worktree add --detach /tmp/ops10-recheck <gate-commit>
cd /tmp/ops10-recheck
npx -y -p node@22 -p npm@12.0.2 -- node -v
npx -y -p node@22 -p npm@12.0.2 -- npm -v
npx -y -p node@22 -p npm@12.0.2 -- npm ci
npx -y -p node@22 -p npm@12.0.2 -- npm ls vite esbuild react-router react-router-dom mermaid katex @mermaid-js/layout-elk --all
npx -y -p node@22 -p npm@12.0.2 -- npm run test
npx -y -p node@22 -p npm@12.0.2 -- npm run build
npx -y -p node@22 -p npm@12.0.2 -- npm audit --json
```

Browser checks use `npm run preview -- --host 127.0.0.1 --port <local-port>
--strictPort` under that same toolchain. Scratch Playwright is `/tmp/pw-1-0`,
version 1.64.1; `PLAYWRIGHT_BROWSERS_PATH=/opt/agents/data-storage-write/playwright-browsers`.
The route harness imports each clean checkout's canonical registry, compares h1s
to baseline, rejects nonlocal requests and checks actual browser history. Mermaid
harness uses manual editor mode, waits for new SVG IDs after each render, decodes
both downloaded files, and checks dialog/onerror behavior. Mutation edits only
the scratch config in a try/finally and restores byte-exact source.

Commands, outputs, browser harnesses, exported images and supplementary JSON live
in `/tmp/ops10-evidence` and `/tmp/pw-1-0` (**ml01a-local, disposable scratch**),
not durable repository evidence. All relevant versions, hashes, counts, headings,
fixtures, mutation failure and verdicts are recorded inline here. Scratch preview
processes are stopped and run-owned Git worktrees removed at handoff; raw logs
may remain temporarily for the reviewer. No dependency was added for browser QA.

### Proposed pull request (not published)

Title: `fix: qualify dependency upgrades and record release review`

```markdown
Repair the remaining seven advisory package entries by upgrading Vite/React
plugin, React Router, and Mermaid/ELK together within their supported ranges.
Keep React 18, Tailwind 3, BrowserRouter, lazy tool routes, and application source
unchanged. Add strict Mermaid regression cases for all supported settings.

Validation: clean gate-commit installs on Node v22.23.5 / npm 12.0.2; 554 tests
in 64 files; production build with 26 prerendered routes; audit zero in every
severity. Playwright 1.64.1 covers 24 tools, home/about/not-found, browser history,
Dagre/ELK/math, valid SVG/PNG exports and malicious fixtures with no dialogs or
onerror attributes. Loose-mode mutation fails all four security cases.

Review: docs/specs/reviews/review-m1-0-dependency-maintenance.md.
Docker D1 is UNAVAILABLE, not passed; workflow proposals W1–W3 are documentation
only. Live upstream action declarations remain unverified under the run's
registry-only network restriction. No workflow or Dockerfile changed.

Closes #11
```

No PR was opened or updated; hosted CI was not run. No further spec is dispatched.
The next action is Claude's local-branch review and Don's operator decisions.

**SEALED 2026-11-15T13:47:00Z** — 1068 seconds from observed start to seal; actual host `ml01a`. Runtime exact model identifier unreported; CLI `codex-cli 0.163.0`. Final commit is the unique local commit with gate `(1.0.6)` in its subject; its SHA is reported at handoff to avoid self-referential content.
