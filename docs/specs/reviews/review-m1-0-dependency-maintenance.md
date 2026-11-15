---
title: "Review — 1.0 Dependency maintenance"
description: "Advisory dispositions and operator decisions for issue 11"
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

Local execution of authorized v0.4, issue #11. Claude reviews the local branch
before any push; Don decides the questions below. No workflow edit or publication
is authorized by this document.

## Advisory inventory (gate 1.0.1)

Fresh Node v22.23.5 / npm 12.0.2 `npm audit --json` at `73bd13f` reports seven
entries (0 critical, 1 high, 3 moderate, 3 low). These provisional R-items are
tracked individually until the upgrades and final audit establish disposition.

| ID | Package | Severity | Evidence / intended repair | Current question |
|---|---|---|---|---|
| R1 | vite | high | GHSA-4w7w-66w2-5vf9 and editor/dev-server findings enumerated in worklog; upgrade 8.3.8 | Pending repair; accept residual only if repair cannot qualify? |
| R2 | esbuild | moderate | GHSA-67mh-4wv8-2f99; via Vite 5; remove old build dependency through Vite upgrade | Pending repair; accept residual only if repair cannot qualify? |
| R3 | react-router-dom | moderate | Via react-router; upgrade 7.18.5 | Pending repair; accept residual only if repair cannot qualify? |
| R4 | react-router | moderate | GHSA-wrjc-x8rr-h8h6 / GHSA-337j-9hxr-rhxg; upgrade via DOM package | Pending repair; accept residual only if repair cannot qualify? |
| R5 | mermaid | low | Via KaTeX; upgrade 12.3.0 | Pending repair; accept residual only if repair cannot qualify? |
| R6 | katex | low | GHSA-238p-pmpm-9mq7; <0.18.2 affected; Mermaid 12 permits patched version | Pending repair; accept residual only if repair cannot qualify? |
| R7 | @mermaid-js/layout-elk | low | Via Mermaid/KaTeX; upgrade 1.0.2 | Pending repair; accept residual only if repair cannot qualify? |

## D1 — Docker image verification

**UNAVAILABLE.** The dispatch states the run account cannot use Docker on ml01a.
`Dockerfile` is unchanged: Node 22 Alpine build, npm 12.0.2, `npm ci` and build,
nginx runtime (`Dockerfile:9`, `:13`, `:17`, `:22`, `:25`). No image build is
claimed. Clean Node/npm proof does not qualify the Alpine/native-binary image.

**Question (yes/no): verify the image elsewhere before the next release?**

## W1 — Deprecated action runtimes

Pending final proposal. Current workflow uses `actions/checkout@v3` (line 24)
and `actions/setup-node@v4` (line 28). The spec records Node 20 deprecation
annotations from production run 43672134033; no live CI fetch is permitted.

**Question (yes/no): approve the final W1 diff as a separate workflow change?**

## W2 — Azure action inputs

Pending final proposal. Spec v0.4 records undeclared `skip_api_build` and
`production_branch` inputs on resolved `Azure/static-web-apps-deploy@v1`.
The local workflow passes both (lines 56–57); removing production_branch may
affect production versus preview classification. Resolved upstream action source
cannot be freshly inspected under this run's registry-only network restriction.

**Question (yes/no): approve the final W2 diff as a separate workflow change?**

## W3 — Runner image migration

Pending final proposal. Both jobs use `ubuntu-latest` (lines 16 and 72).
Spec v0.4 records the Ubuntu 26 migration warning from run 43672134033.

**Question (yes/no): approve the final W3 diff as a separate workflow change?**
