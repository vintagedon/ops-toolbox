---
title: "Main closeout and weekend preparation"
description: "Pending passphrase release review, reproducible builds and next-release specs"
date: "2026-11-14"
status: "in-progress"
tags:
  - type: worklog
  - domain: documentation
---

# Main closeout and weekend preparation

## Authority and scope

On November 14 the operator authorized closeouts, reviews and necessary preparation
to return Ops Toolbox to clean main for weekend work. He separately approved the
workflow cleanup: locked `npm ci`, 30-minute build/deploy timeout and 10-minute
preview-cleanup timeout. Automatic approval initially rejected the workflow edit
until that explicit answer arrived; no bypass was attempted.

Execution host: ML01a. Executor: Codex (GPT-6 family; exact runtime model identifier
and token usage unavailable). Starting checkout: `feat/passphrase-depth`,
`bec8a5af174fd82610c46e1662da676f6feab2e8`; main base
`9d177424bfc9e5cd32e071ed2990fa51de6059c1`. Isolated managed worktree branch:
`codex/main-closeout`. No unrelated source files or historical worklogs were changed.
This is operator-directed closeout, not a rerun of an archived specification.

## Changes

- Track `package-lock.json`, remove its ignore rule, and apply compatible security
  updates without changing the declared dependency ranges or application stack.
- Match Docker's npm 12.0.2 to CI. Container npm 10.9.9 failed on optional esbuild
  peer resolution; the same locked build with npm 12.0.2 succeeded. Document the
  required installer and use `npm ci` in CI.
- Constrain the passphrase wordlist selector to the available width. Before the
  fix, 320 px + Mono + Comfortable produced a 392 px page; the constraint gives
  320 px without hiding content or changing the settings flyout.
- Count numeric-padding entropy for zero-word direct helper calls. Regression
  first failed with 0 instead of 16 bits for five random digits, then passed.
- Remove stale README test counts, correct primary execution host, and index the
  five proposed weekend specs. Feature code for those specs is not implemented.

## Verification before publication

- Fresh `npm ci`: 406 packages installed; baseline 536 tests in 63 files passed.
- After fixes: **537 tests in 63 files passed**, `npm run build` passed and emitted
  26 prerendered routes. Existing large diagram-chunk warning remains nonblocking.
  Vitest's nested Vite/plugin combination reports esbuild/oxc deprecation warnings;
  spec 1.0 owns toolchain alignment rather than suppressing the warnings.
- Production browser check: **26 routes returned 200**, **36 password layouts**
  (320/375/768/1280 px × three densities × three wordlists, Mono font) had no
  horizontal page overflow. No page exceptions or external requests were observed.
- Docker clean build passed with Node 22 and npm 12.0.2. Image manifest:
  `sha256:f934ff97ebcc7ec7b9952b505b213bd6bd847655c66e460c69ebbc12693e6da1`.
  This image predates documentation-only edits; application sources match.
- Independent read-only review of main-to-PR7 found no additional blockers and
  passed 104 focused tests. It also checked decodability against 686 small code sets
  and actual wordlist uniqueness. Source review does not prove live deployment.

## Dependency disposition

Audit before compatible repairs: **22 affected package entries** (1 critical,
9 high, 10 moderate, 2 low). After: **7** (0 critical, 1 high, 3 moderate, 3 low).
DOMPurify is locked at 3.4.18, figlet 1.12.0, js-yaml 4.3.2 and node-forge 1.4.3.
The remaining Vite/esbuild, React Router and Mermaid/KaTeX advisories and their
application conditions are recorded in
[spec 1.0](../docs/specs/spec-m1-0-dependency-maintenance.md). Production serves
static assets; it does not expose Vite's development server. Router destinations
are static registry paths; this app does not use SSR hydration. No prerequisite
prototype-pollution path was established for the KaTeX advisory. These findings
remain visible and require maintenance; this is not a zero-vulnerability claim.

## Existing PR review dispositions

| Review topic | Disposition |
|---|---|
| Settings flyout width | Fixed in existing commits; selector overflow fixed in this closeout |
| Stale copy/export and visible single result during wordlist loading | Existing request IDs, disabled exports and hidden results verified by tests/review |
| Password tool reference | Existing reference describes wordlists, padding and batches |
| Workflow authorization | Historical September repair worklog records operator authority; November cleanup explicitly approved in chat |
| Nonexistent active specifications | Existing false declarations removed; current draft specs now exist and are indexed accurately |
| Documentation metadata | Required frontmatter added in prior commits; documents inspected |
| Ambiguous separators and entropy | Existing decodability policy verified against lists/capitalization combinations |
| Padding bounds | UI and pure helper enforce 0–12 (0 disables); regression tests pass |
| Missing dependency lock and job timeouts | Addressed in this closeout |
| Empty private character pool | Suggestion declined: helper is private, password caller rejects empty pool, padding uses a fixed nonempty numeric pool; no reachable empty-pool call |
| Zero-word padding entropy | Fixed and covered by a failing-then-passing regression |
| Async wait and stale rejection tests | Correct throwing wait and separate pending-promise rejection already present; tests/review pass |

The four deployment implementation paths on PR8 were byte-identical to PR7 before
closeout: workflow, verifier, verifier tests, scripts README. PR7 now additionally
locks installation and bounds workflow execution. PR8 can be closed as superseded
after PR7 lands; its historical worklog is preserved.

## Weekend handoff

[Spec index](../docs/specs/README.md): dependency maintenance → Sentinel workspace
→ Text Transformer and cloud subnet planner → full/airgap editions. DNS lookup is
a proposed first connected utility. Cloud planning is local provider-rule planning,
not account import. Draft review and dispatch remain explicit future steps.

## Publication checkpoint

Local validation is complete; final review, preview CI, merge and production
verification are recorded in the PR timeline and closeout receipt when executed.
Do not infer publication success from this pre-publication record.
