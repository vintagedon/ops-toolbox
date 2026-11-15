---
title: "1.0 Dependency maintenance"
description: "Qualify the remaining major dependency upgrades before feature work, and put residual advisories and workflow warnings in front of the operator"
date: "2026-11-15"
version: "0.3"
status: "active"
tags:
  - type: specification
  - domain: security
related_documents:
  - "[Weekend specifications index](README.md)"
  - "[AGENTS.md: Executing a Work Spec](../../AGENTS.md)"
---

# 1.0 Dependency maintenance

**Task 1.0 (#N, opened at dispatch).** Gates 1.0.1 to 1.0.6. Ends at an operator decision recorded in `docs/specs/reviews/review-m1-0-dependency-maintenance.md`. Spec 1.2 dispatches after this unit's PR merges.

v0.1 (GPT, 2026-11-14) set scope and gates. v0.2 (Claude, 2026-11-15, triad review) adds the current audit snapshot, environment, scope lists, checkbox validations, the review surface and closeout. Scope is unchanged.

v0.3 (GPT, 2026-11-15, triad review) corrects the strict-mode proof. Both malicious
fixtures pass in loose mode on the locked Mermaid version: the app discards
`bindFunctions`, and Mermaid sanitizes the HTML label in both modes. Keep those
behavior checks, but prove the strict setting separately with a failing mutation.

## Objective

When this spec closes, every dependency advisory that has a compatible upstream repair is repaired, and every one that does not sits in the review document with its evidence and a yes/no question for the operator. All 24 tools and their routes behave as before. Clean installs pass on CI's Node 22 / npm 12.0.2 and in the Docker image. The three CI maintenance warnings are inventoried with a proposed workflow diff for the operator, and the workflow itself is unchanged.

## Why this exists

The November 14 closeout tracked the lockfile and applied every compatible fix. What remains is all major-version work. Live `npm audit` at `75ba911` on 2026-11-15 reports seven entries (3 low, 3 moderate, 1 high, 0 critical), and every fix crosses a major:

| Package | Severity | Path | Fix offered by npm |
|---|---|---|---|
| `vite` | high | direct | `vite` 8.3.8 (major) |
| `esbuild` | moderate | via vite | `vite` 8.3.8 (major) |
| `react-router-dom` | moderate | direct | 7.18.5 (major) |
| `react-router` | moderate | via react-router-dom | `react-router-dom` 7.18.5 (major) |
| `mermaid` | low | direct | 12.3.0 (major) |
| `katex` | low | via mermaid | `mermaid` 12.3.0 (major) |
| `@mermaid-js/layout-elk` | low | direct | 1.0.2 (major) |

Seven entries are not seven exploits. Vite/esbuild findings concern development servers; deployed sites serve static files. React Router's redirect finding needs attacker-controlled navigation destinations, and destinations here come from the static registry; its SSR deserialization finding excludes this `BrowserRouter` app. KaTeX's issue needs preexisting prototype pollution. These are applicability assessments, not a claim that the packages are patched, and they go to the operator as such.

Production run 43672134033 (2026-11-15, `75ba911`) carries three annotations: `actions/checkout@v3` and `actions/setup-node@v4` target the deprecated Node 20 runtime; inputs `skip_api_build` and `production_branch` are undeclared by the resolved `Azure/static-web-apps-deploy@v1`; `ubuntu-latest` migrates to Ubuntu 26. Removing `production_branch` could change which deployments count as production, so the workflow repair is a proposal for the operator, never an edit in this unit.

Prior findings here were observed at `main` = `75ba911`. Verify each before acting on it.

## Execution Environment

| Item | Value |
|---|---|
| Host | ml01a, primary checkout `/opt/agents/repos/ops-toolbox`. Clean tree on `main` is the precondition. |
| Attended | No. The run does not pause. The operator reviews the local branch and the review document before push. |
| Toolchain | ml01a's default is Node 24 / npm 11, which is not CI parity. Every install and test claim is proven in a `node:22-alpine` container with npm 12.0.2, from a clean checkout of the gate commit. |
| Browser checks | Python Playwright from `/opt/agents/venv`, Chromium only, against `npx vite preview` of the production build. The dev server stays local and is never served through the shared nginx site. |
| Network | Package registries for install and audit. No other external calls. |

## Scope

### Modify

- `package.json`, `package-lock.json`
- Source, tests and `vite.config.js` only where an upgrade requires a compatibility change; each such change is named in the worklog with the upgrade that forced it
- Stack references: `AGENTS.md` lines 12 and 16; `README.md` badges on lines 24 to 26 and the line-192 diagram; `docs/architecture.md` lines 54 and 233; `docs/documentation-standards/tagging-strategy.md` line 91
- `docs/specs/reviews/review-m1-0-dependency-maintenance.md` (new) and `docs/specs/reviews/README.md` (new interior README)
- This spec (status and amendments only), `work-logs/worklog-YYYY-MM-DD-dependency-maintenance.md`

### Reference

- `AGENTS.md`, `Dockerfile`, `.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml`, `staticwebapp.config.json`
- The four advisories linked under Sources, and the live audit at execution

### Do not touch

- `.github/workflows/`. AGENTS.md requires explicit approval; the proposed diff goes in the review document.
- `react`, `react-dom` (stay on 18) and `tailwindcss` (stays on 3). Changing either is a separate, reviewed requirement.
- `overrides` or `resolutions` that force a transitive package outside its parent's supported range, and `npm audit fix --force`. Both can silence the audit without a working repair.
- `Dockerfile`, unless a pinned Node or npm version must change; any such change is called out in the review document.
- Tool behavior and visuals. No redesign rides along with an upgrade.

## Deliverables

Gate discipline: each gate ends in one local commit referencing its number and a worklog checkpoint. A failed upgrade is rolled back with `git revert` of its gate commit, never by hand-editing the lockfile.

### Gate 1.0.1: Inventory and decisions

Refresh `npm audit --json`, compare it to the table above, and record differences. For Vite with `@vitejs/plugin-react` and Vitest, React Router, and Mermaid with `@mermaid-js/layout-elk`: record the target versions, their peer ranges against React 18 and each other, and the breaking changes that touch this code. Start the review document with the R-items below.

**Validation:**

- [ ] The worklog holds the before audit summary (counts by severity and the seven entries) and the target version table with peer-range evidence.
- [ ] Every target version satisfies `react@18` peer ranges, or the gate stops with an R-item instead of upgrading.

### Gate 1.0.2: Build tooling

Upgrade Vite and `@vitejs/plugin-react` together, and Vitest if the new Vite requires it, to a supported patched combination. Fix the existing Vite/oxc plugin deprecation warnings through compatibility, not suppression.

**Validation:**

- [ ] `npm ls vite esbuild --all` shows one patched Vite and no esbuild at or below 0.24.2.
- [ ] Container (Node 22, npm 12.0.2): `npm ci`, `npm run test` and `npm run build` pass; the test count equals the pre-upgrade count (550 at `75ba911`) or every difference is explained in the worklog.
- [ ] The build log contains none of the deprecation warnings recorded at gate 1.0.1.

### Gate 1.0.3: Router

Upgrade React Router to the patched major. Keep `BrowserRouter`, lazy routes and the not-found view.

**Validation:**

- [ ] `npm ls react-router react-router-dom` shows only patched versions.
- [ ] Playwright against the built preview: a direct load of every registered tool path and `/about` renders that page's `<h1>`; `/no-such-tool` renders the not-found view; browser back and forward between two tools restores each.
- [ ] Full test suite passes in the container.

### Gate 1.0.4: Mermaid stack

Upgrade `mermaid` and `@mermaid-js/layout-elk` together. Keep `securityLevel: 'strict'` and the existing Markdown/JSON sanitization.

**Validation:**

- [ ] `npm ls mermaid katex @mermaid-js/layout-elk` shows only patched versions.
- [ ] Playwright: the Mermaid Renderer renders one flowchart with the default layout and with ELK, renders a diagram containing KaTeX math, and exports SVG and PNG; each export opens as a valid file.
- [ ] A regression test asserts `getMermaidConfig` returns `securityLevel: 'strict'`
  for every supported theme/layout combination. In a scratch copy, changing that
  setting to `loose` fails the test; record the failure and restore the source.
- [ ] Render valid diagrams containing `click A call alert(1)` and a node label
  containing `<img src=x onerror=alert(1)>`; click node A in the callback case.
  Both produce no dialog and no `onerror` attribute in the rendered SVG. These are
  behavior checks, not proof of the strict setting: both also passed with loose
  mode during the review. Do not attach callbacks merely to make this test fail.
- [ ] `tests/lib/markdownUtils.test.js` sanitization cases still pass unchanged.

### Gate 1.0.5: Release proof and review surface

Prove the whole: fresh audit, container install, Docker image, every route, no unexpected external requests. Update the stack references in Modify. Complete the review document.

The review document carries one entry per item, each with an ID, a one-line statement, evidence (command output, advisory ID, file and line), and a closed question:

- **R-items**, one per residual advisory: package, severity, advisory, why no compatible repair exists, applicability evidence. Question: *accept this residual until upstream repairs it?*
- **W1 to W3**, one per CI warning: current action and version, declared inputs of the resolved action, what removing or changing each input would do to production versus preview deployments, and the proposed diff. Question: *approve this diff as a separate workflow change?*

**Validation:**

- [ ] Fresh `npm audit --json`: zero critical and zero high, and every remaining entry has an R-item. Zero entries is the target; any remainder is listed, never waived silently.
- [ ] `docker build` succeeds; the container serves home, one tool and a deep link with HTTP 200 and the expected `<title>`.
- [ ] Playwright, fresh context with every request outside the local server aborted and logged: every registered route loads, and the aborted-request log is empty.
- [ ] `grep -nE 'Vite 5|React Router v6' AGENTS.md README.md docs/architecture.md docs/documentation-standards/tagging-strategy.md` returns nothing.
- [ ] Each review entry has ID, statement, evidence and a yes/no question; W-entries contain a diff and no workflow file changed (`git diff main --stat -- .github/` is empty).

### Gate 1.0.6: Closeout

Follow "Executing a Work Spec" in `AGENTS.md`. Branch `task/1-0-dependency-maintenance` from current `main`. One worklog at `work-logs/worklog-YYYY-MM-DD-dependency-maintenance.md`, appended per gate and sealed. Push posture per AGENTS.md: commits stay local, and the executor does not push, open, mark ready or merge a pull request. The worklog carries the proposed PR body with `Closes #N` and a pointer to the review document.

**Validation:**

- [ ] `git log main..HEAD` shows one commit per gate (1.0.1 to 1.0.5) plus closeout, and no reverted gate is left unexplained.
- [ ] `git merge-base main HEAD` equals `main` at startup; nothing was pushed (`git ls-remote origin task/1-0-dependency-maintenance` is empty).
- [ ] The worklog records before and after audits, target versions, container `node -v`/`npm -v`, test counts per gate, and the PR body, and is sealed.

## Constraints

- **No audit silencing.** No `--force`, no out-of-range overrides, no blanket waivers. An unrepairable advisory is an R-item.
- **No workflow edits.** Proposals only; approval follows AGENTS.md.
- **One upgrade family per gate.** If one family fails, its gate is reverted and recorded, and the others proceed.
- **Every claim traces to evidence.** This spec's audit table is a prior finding to verify, not a fact to restate.

## What the executor may choose

Yours: exact patch versions within the patched majors, compatibility edits, test additions, the review document's prose.

Frozen: React 18, Tailwind 3, no workflow edits, no forced overrides, gate order, the review document's structure and questions.

## Sources

- [Vite source-map traversal](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)
- [Router navigation](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
- [Router hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg)
- [KaTeX options inheritance](https://github.com/advisories/GHSA-238p-pmpm-9mq7)
- [Production run 43672134033](https://github.com/vintagedon/ops-toolbox/actions/runs/43672134033)

Recheck all of these and the full live audit at execution.
