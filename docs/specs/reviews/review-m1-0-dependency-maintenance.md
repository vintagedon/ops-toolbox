---
title: "Review — 1.0 Dependency maintenance"
description: "Repaired advisories and operator decisions for issue 11"
date: "2026-11-15"
status: "under-review"
tags:
  - type: reference
  - domain: security
related_documents:
  - "[Spec 1.0](../spec-m1-0-dependency-maintenance.md)"
  - "[Execution worklog](../../../work-logs/worklog-2026-11-15-dependency-maintenance.md)"
---

# Review — 1.0 Dependency maintenance

Local branch `task/1-0-dependency-maintenance`, issue #11. Claude reviews before
any push; Don decides the questions below. No workflow edits, image build,
publication or acceptance are implied. Actual host: `ml01a`.

## Advisory dispositions

`npm audit --json` under Node **v22.23.5** / npm **12.0.2** at baseline
`73bd13f`: **7 entries (0 critical, 1 high, 3 moderate, 3 low)**. After the three
upgrade families: **0 entries, all severities zero**, audit exit 0. Clean gate
commit checks and browser results are recorded in the worklog. These R identifiers
track the original inventory; **there are no residual R-items to accept**.

| ID | Package | Before → after | Baseline evidence | Disposition |
|---|---|---|---|---|
| R1 | vite (high) | 5.4.21 → 8.3.8 | GHSA-4w7w-66w2-5vf9 plus editor/dev-server advisories enumerated below | Repaired; no residual acceptance requested |
| R2 | esbuild (moderate) | 0.21.5 → absent | GHSA-67mh-4wv8-2f99; `npm ls vite esbuild --all` now shows Vite 8.3.8 only | Repaired through supported Vite upgrade |
| R3 | react-router-dom (moderate) | 6.30.6 → 7.18.5 | npm audit path via react-router | Repaired |
| R4 | react-router (moderate) | 6.30.6 → 7.18.5 | GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg | Repaired |
| R5 | mermaid (low) | 11.17.2 → 12.3.0 | npm audit path via KaTeX | Repaired |
| R6 | katex (low) | 0.16.47 → 0.18.10 | GHSA-238p-pmpm-9mq7; affected >=0.11.0 <0.18.2 | Repaired within Mermaid/ELK's ^0.18.0 dependency range |
| R7 | @mermaid-js/layout-elk (low) | 0.2.1 → 1.0.2 | npm audit path via Mermaid; peer now ^12.0.0 | Repaired |

Vite's baseline audit also names GHSA-v6wh-96g9-6wx3,
GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm,
GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22 and GHSA-fx2h-pf6j-xcff.
No override, resolution, forced audit repair or finding suppression was used.
Package/lockfile evidence is in `package.json:22`, `:35`, `:40`, `:50`, `:55`
and `package-lock.json` (matching node_modules package records).

Prior applicability assessments remain context rather than waivers: this app
ships static files, not the dev server; Router navigation comes from the registry,
with BrowserRouter and no SSR hydration (`src/App.jsx:10`, `:62`); no prerequisite
prototype-pollution path was established for the old KaTeX finding. All seven
packages are now repaired or removed regardless of applicability.

Qualification: React 18.3.1 and Tailwind 3.4.19 retained; Vitest 4.1.12 retained;
**554 tests / 64 files**, versus baseline **550 / 63** (four required strict
security cases added). `tests/lib/mermaidConfig.test.js:11` covers dark/light ×
Dagre/ELK. Scratch mutation to loose fails **4/4** with `expected 'loose' to be
'strict'`; original source restored byte-for-byte. Existing Markdown sanitization
cases pass unchanged. Browser proof covers 24 tools, home, about, not-found,
back/forward, diagram layouts/math, valid SVG/PNG downloads and malicious diagrams.
No application source or `vite.config.js` compatibility edit was necessary.

## D1 — Docker image verification

**UNAVAILABLE.** The dispatch states this account cannot use Docker on ml01a.
`Dockerfile` is **unchanged** (empty `git diff main -- Dockerfile`): Node 22 Alpine
build stage (line 9), npm 12.0.2 (line 13), `npm ci` (line 17), build (line 22),
nginx runtime (line 25). No Docker command was run and no image was built here.
Clean Node/npm results do not prove Alpine/native optional dependency behavior.

**Question (yes/no): verify the image elsewhere before the next release?**

## CI warning evidence boundary

The workflow below is
`.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml`.
Current file contents were verified locally. Warning annotations are the prior
production run **43672134033**, recorded in the authorized spec v0.4 at line 48.
This execution is restricted to package registries; GitHub/action manifests and
CI logs were **not fetched**. Therefore resolved action SHAs, complete declared
input lists, current upstream Node runtimes and live warning persistence are
**UNVERIFIED**, not freshly observed facts. A subsequent authorized workflow
change must verify those inputs before implementing these proposals. This is an
explicit evidence limitation against gate 1.0.5's live action-declaration request.

`git diff main --stat -- .github/` is empty. The following diffs exist only here.
Each is a separate operator decision; none alters an existing deployment today.

## W1 — Action runtime deprecation

**Statement:** replace the recorded Node 20 action runtimes with reviewed Node 24
releases. Current `actions/checkout@v3` (workflow line 21) and
`actions/setup-node@v4` (line 25) match the spec's annotation inventory. Candidate
v5 tags below require upstream `action.yml`/release review and resolved-SHA pinning
in the separate change; they are not claimed to be the latest tags or verified
here. Application Node remains **22**, npm **12.0.2**.

```diff
--- a/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
+++ b/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
@@
-      - uses: actions/checkout@v3
+      - uses: actions/checkout@v5
@@
-      - uses: actions/setup-node@v4
+      - uses: actions/setup-node@v5
```

Keep checkout's `submodules: true` / `lfs: false` and setup-node's
`node-version: '22'`. Trigger branches, production/preview classification and
Azure upload/close inputs stay as they are. Requalify permissions and action
runtime support after pinning the reviewed releases.

**Question (yes/no): approve this W1 diff as a separate workflow change, after
verifying upstream runtimes, supported inputs and release SHAs?**

## W2 — Azure undeclared inputs and deployment classification

**Statement:** remove the two inputs recorded as undeclared only after proving
production and preview classification. Current action is
`Azure/static-web-apps-deploy@v1` at upload line 41 and PR-close line 68.

Declared-input evidence available under this run's constraints: spec v0.4 line 48
reports `skip_api_build` and `production_branch` **not declared by the action
resolved in run 43672134033**. The resolved SHA and full declaration are absent
from this repo; they remain unverified. Locally supplied upload inputs (lines
43–50) are `azure_static_web_apps_api_token`, `action`, `app_location`,
`api_location`, `output_location`, `skip_app_build`, `skip_api_build`,
`production_branch`; close supplies the token and `action: close` (lines 70–71).
This lists actual usage, not a fabricated upstream declaration.

```diff
--- a/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
+++ b/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
@@
           skip_app_build: true
-          skip_api_build: true
-          production_branch: "main"
```

Removing `skip_api_build` would stop passing an undeclared input, but
`api_location: ""` must still yield **no API build/deploy** in both main and PR
runs. Removing `production_branch` may change how the action/client classifies
deployments even if it is undeclared at the action boundary: the action's Docker
client may inspect environment variables. Do not infer that an undeclared input
is unused. Repository triggers alone do not prove the Azure production-branch
setting. Before applying this proposal, verify the resolved action declaration
and client behavior, confirm main remains production, a PR remains a preview,
and PR-close deletes only that preview. Retain `skip_app_build: true` and
`app_location: "dist"` so the verified artifact is uploaded.

**Question (yes/no): approve this W2 diff as a separate workflow change after
those production/preview/API checks pass?**

## W3 — ubuntu-latest migration

**Statement:** pin both jobs to Ubuntu 24.04 while qualifying the Ubuntu 26 runner
separately. Current `ubuntu-latest` occurs at workflow lines **15 and 61**; the
spec records its Ubuntu 26 migration annotation. This is a conservative proposal,
not a claim of a tested runner image. No hosted runner was used during this run.

```diff
--- a/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
+++ b/.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml
@@
-    runs-on: ubuntu-latest
+    runs-on: ubuntu-24.04
@@
-    runs-on: ubuntu-latest
+    runs-on: ubuntu-24.04
```

No input or production/preview branch selection changes. The upload job and
preview-close job would run on a fixed supported image candidate; confirm hosted
image availability and Docker-action support in the separate workflow review.

**Question (yes/no): approve this W3 diff as a separate workflow change?**

## Proposed out-of-scope follow-ups

- **O1 — Existing Mermaid shared-primitive debt:** the renderer already has manual
  debounce (`src/tools/mermaid-renderer/MermaidRenderer.jsx:173`) and clipboard
  reset (`:191`, `:194`), plus hard-coded canvas colors (`:235`). A separate UI
  maintenance change could adopt shared hooks/tokens. These predate the upgrade;
  no migration or redesign was required for compatibility, so source is preserved.
- **O2 — Redundant ELK registration:** ELK 1.0.2's registry README says Mermaid 12
  normal builds bundle/register ELK; registering the separate package is harmless
  but duplicates layout code. Removing the dependency/registration is a separate
  optimization, because this spec explicitly upgrades the pair and preserves UI.
- **O3 — Orientation wording:** `AGENTS.md` still says no specs are executing and
  retains the historical runtime description. The dispatch permits only its stack
  lines 12 and 16; those are the only AGENTS changes. Updating active-work/runtime
  wording and the spec index needs separate scope.

These follow-ups are proposals only, not additional dispatched work.
