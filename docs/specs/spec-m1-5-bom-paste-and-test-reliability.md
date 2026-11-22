---
title: "1.5 Paste BOM fidelity and test reliability"
description: "Keep an imported UTF-8 BOM through a paste, make the passphrase tests hold for every draw, and apply ASCII Banner results in request order"
date: "2026-11-22"
version: "0.2"
status: "active"
tags:
  - type: specification
  - domain: testing
  - tech: [react, vitest]
related_documents:
  - "[Specifications index](README.md)"
  - "[AGENTS.md: Executing a Work Spec](../../AGENTS.md)"
  - "[1.2 Text Transformer](spec-m1-2-text-transformer.md)"
---

# 1.5 Paste BOM fidelity and test reliability

v0.1 (Claude, 2026-11-22), written under Don's approval "Sounds good. Approved execute. Lets write up the specs for GPT to review." (Action Registry `rec0nqtVcX9OKS6OT`). GPT reviews before dispatch.

v0.2 (Claude, 2026-11-22) applies GPT's review ([worklog](/opt/agents/repos/work-logs/2026-11-22-opstoolbox-worklog-00-next-specs-review.md), R1) and the PR #18 reviews, approved by Don with the rest of the batch ("approved, execute", Action Registry `recqF2TzzUDjAc4su`). Gate 1.5.3 gains deterministic unmount tests and mutation M4: v0.1's ordering tests could pass with a guard that never notices unmount, which is the defect behind #15 (Codex on PR #18 found the same gap). Gate 1.5.1 gains B4 for a select-all paste. The forced-draw proof in 1.5.2 is labelled M2 (Kilo).

## Objective

When this spec closes, three defects are gone and each has a test that fails if it comes back. A paste into an imported file keeps that file's UTF-8 BOM, as typing already does. The passphrase tests pass for every possible draw, including the hyphenated `yo-yo` in the EFF short list (#14). ASCII Banner applies a generation result only when it belongs to the latest request of a mounted component, which removes both an out-of-order display race and the teardown rejection behind #15.

## Why this exists

- **BOM on paste.** Spec 1.2 requires an imported BOM to come back on download (gate 1.2.2). At `820bc6d`, `paste()` in `src/tools/TextTransformer.jsx` (line 111) builds the new source with `bom: false`, while typing keeps the BOM because `editedSource` spreads the current source. GPT reproduced the loss on production on 2026-11-15: importing `EF BB BF` + `abc\r\ndef\r\n`, pasting `XY` at offset 1 and downloading gives `61585962630d0a6465660d0a`, with no BOM ([release review](/opt/agents/repos/work-logs/2026-11-15-opstoolbox-worklog-00-release-handoff-review.md), finding O-01). Claude saw that line in the 1.2 review and passed over it.
- **#14.** Seven tests in `tests/lib/password.test.js` split a default-list passphrase on `-` and count or inspect the parts (lines 154, 159, 165, 336, 341, 349 and 354 at `820bc6d`). The EFF short list holds `yo-yo`, so each of them fails on roughly 0.3 to 0.6% of runs, a few percent per suite run. It failed CI on PR #13 and a local parity run during PR #16.
- **#15.** The ASCII Banner generation effect (`src/tools/AsciiBanner.jsx`, around line 36) has no cleanup. A result that settles after the component unmounts still calls `setOutput`; when the test file's jsdom has already been torn down, React's scheduler throws `ReferenceError: window is not defined`, Vitest reports an unhandled error, and `npm run test` exits 1 with every test passing. The same missing guard lets a slow, older request overwrite a newer one in the browser.

## Execution Environment

| Item | Value |
|---|---|
| Host | ml01a, account crainbramp. Work in a worktree on `task/1-5-bom-paste-and-test-reliability`, branched from current `main`; the primary checkout `/opt/agents/repos/ops-toolbox` stays on `main`. |
| Attended | No. The run does not pause. Claude reviews the local branch before push. |
| Toolchain | CI parity (Node 22, npm 12.0.2) through `npx -y -p node@22 -p npm@12.0.2 -- <command>` in a clean checkout of the gate commit. ml01a's default Node 24 / npm 11 is not parity, and the account has no Docker access. |
| Browser checks | Python Playwright 1.64.0 from `/opt/agents/venv`, with `PLAYWRIGHT_BROWSERS_PATH=/opt/agents/data-storage-write/playwright-browsers` (read-only; Chromium 1248 matches it), against `npm run build` output served by `npx vite preview`. Do not download browsers. |
| Tracking | One issue, opened at dispatch (#N below). The PR also closes #14 and #15. |

## Scope

### Modify

- `src/tools/TextTransformer.jsx`: the `paste()` function only
- `tests/tools/TextTransformer.test.jsx`
- `tests/lib/password.test.js`
- `src/tools/AsciiBanner.jsx`: the generation effect only
- `tests/tools/AsciiBanner.test.jsx`
- This spec (status and amendments only), `work-logs/worklog-YYYY-MM-DD-bom-paste-and-test-reliability.md`

### Reference

- `src/lib/password.js` and the three wordlists in `src/lib/`
- `src/lib/asciiBanner.js`
- [Spec 1.2](spec-m1-2-text-transformer.md): the gate 1.2.2 file rules and the v0.4 edit-style rule
- GPT's O-01 reproduction script: `/opt/agents/repos/work-logs/evidence/2026-11-15-opstoolbox-release-handoff-review/ops-text-download-review.py`

### Do not touch

- `src/lib/password.js` and every wordlist. Entropy figures depend on the list sizes, and the lists are the published ones. That a hyphenated word reads ambiguously in a `-`-separated passphrase is a product question this spec records and does not answer.
- `src/lib/textTransform.js` and the rest of `TextTransformer.jsx`. Spec 1.2's semantics stand.
- `src/lib/asciiBanner.js` and the figlet fonts.
- `package.json`, `package-lock.json`, `vite.config.js` and any Vitest configuration.
- `.github/workflows/`. Spec 1.6 owns workflow changes, which need Don's explicit approval.
- Everything spec 1.1 owns: `ToolLayout.jsx`, `DirectoryGrid.jsx`, the hero image, the OG card.

## Deliverables

Gate discipline: each gate ends in one local commit referencing its number and a worklog checkpoint. Gates 1.5.1 to 1.5.3 are independent; 1.5.4 runs last.

### Gate 1.5.1: Paste keeps the BOM

A paste keeps the current source's BOM state, as typing does. Only a file import sets or clears it. The paste still resets the baseline and the undo stack, as 1.2 specifies.

**Validation:**

- [ ] Component test B1: import a file whose bytes are `EF BB BF` + `abc\r\ndef\r\n`, place the caret at offset 1, paste `XY`, wait for the debounce, Download. The bytes are `efbbbf61585962630d0a6465660d0a` (hex).
- [ ] Component test B2: the same file without the BOM and the same paste give `61585962630d0a6465660d0a`. A paste never adds a BOM.
- [ ] Component test B3: after B1's paste, type `z` at the end, choose Restore original and confirm. The download starts with `efbbbf` and equals the pasted baseline.
- [ ] Component test B4: import the B1 file, select all of Input and paste `fresh`; the download is `efbbbf` followed by `fresh`. A select-all paste replaces the text, not the file's BOM.
- [ ] Mutation M1: put `bom: false` back in `paste()` in a scratch copy; B1 fails. Restore byte for byte.
- [ ] The existing BOM + F4 import and download test passes unchanged.
- [ ] `git diff main -- src/tools/TextTransformer.jsx` changes lines inside `paste()` only.

### Gate 1.5.2: Passphrase tests hold for every draw (#14)

Every test that parses a generated passphrase holds for every word in the list it draws from. Product code and wordlists do not change.

**Validation:**

- [ ] A committed test stubs `window.crypto.getRandomValues` so every draw selects `yo-yo`'s index in `EFF_SHORT_WORDLIST`, with and without `capitalize`, and the rewritten assertions pass under it.
- [ ] Mutation M2: the same stub applied to the `main` versions of the seven tests, in a scratch copy, makes at least one of them fail. The worklog names which. This proves the stub reproduces #14.
- [ ] The worklog lists each changed test and how it now parses the passphrase; none splits or counts a default-list passphrase in a way a word containing the separator can break.
- [ ] `git diff main --stat -- src/lib/` is empty.
- [ ] Supporting soak, not a substitute for the forced draw: `tests/lib/password.test.js` runs 100 consecutive times under the Node 22 toolchain, and every run exits 0.

### Gate 1.5.3: Banner results apply in request order (#15)

ASCII Banner applies a result, success or failure, only when it belongs to the latest request of a mounted component.

**Validation:**

- [ ] Component test A1, with `generateBanner` mocked to return promises the test settles: request R1 (text `one`), then R2 (text `two`); settle R2, then R1. The output shows R2's result.
- [ ] Component test A2: R2 resolves, then R1 rejects. The output still shows R2's result; the stale rejection does not clear it.
- [ ] Component tests U1 and U2: start a request, unmount the component while that latest request is still pending, then resolve it (U1) or reject it (U2). Each test fails if the settled result reaches component state after unmount, and passes with the guard.
- [ ] Mutation M3: remove the guard in a scratch copy; A1, A2, U1 and U2 fail. Restore byte for byte.
- [ ] Mutation M4: replace the guard, in a scratch copy, with one that tracks request order but ignores unmount (for example, a request counter that advances only when a request starts). A1 and A2 still pass; U1 and U2 fail. This proves the unmount tests cover what the ordering tests cannot. Restore byte for byte.
- [ ] The seven existing AsciiBanner tests pass unchanged.
- [ ] Supporting soak: `tests/tools/AsciiBanner.test.jsx` runs 50 consecutive times and the full suite 5 consecutive times under the Node 22 toolchain; every run exits 0 and Vitest reports no unhandled errors.

### Gate 1.5.4: Qualification and closeout

Follow "Executing a Work Spec" in `AGENTS.md`. Push posture: commits stay local, and the executor does not push, open, mark ready or merge a pull request.

**Validation:**

- [ ] In a clean checkout of the final commit under Node 22 / npm 12.0.2, `npm ci`, `npm run test` and `npm run build` pass; `node -v` and `npm -v` are in the worklog.
- [ ] Playwright, fresh context, every request outside the local preview server aborted and logged: on `/text-transformer`, import the B1 file, paste `XY` at offset 1 through the real clipboard and download; the bytes are `efbbbf61585962630d0a6465660d0a`. On `/ascii-banner`, type `Ops`; the output shows a non-empty banner. No console or page errors; the aborted-request log is empty.
- [ ] `git log main..HEAD` shows one commit per gate (1.5.1 to 1.5.3) plus closeout; nothing was pushed (`git ls-remote origin task/1-5-bom-paste-and-test-reliability` is empty).
- [ ] The worklog records base commit, gate SHAs, mutation results, soak counts, toolchain versions and the proposed PR body carrying `Closes #N`, `Closes #14` and `Closes #15`, and is sealed.

## Constraints

- **No retries, no suppression.** Test retries, `dangerouslyIgnoreUnhandledErrors`, global rejection handlers and skipped tests hide a failure instead of removing it.
- **No weakened assertions.** Replacing an exact count with "at least" turns a test into a detector. Parse the passphrase correctly instead.
- **Randomness stubs live in tests.** Product code gains no seed or injection point for this.
- **No new UI.** The BOM stays invisible file metadata, as in 1.2.

## What the executor may choose

Test organization, stub helpers, how U1 and U2 detect a state update after unmount (for example, a test-only wrapper around the component's state setter), how tests parse a passphrase (assertions on the generated words, an anchored pattern built from the list, or another exact method), the guard mechanism (a flag, a request counter or an `AbortController`), and worklog wording.

Frozen: the BOM rule, the expected bytes, the do-not-touch list, the no-retry and no-suppression rules, and the validations.

## Execution order

1. 1.5.1, 1.5.2 and 1.5.3, in any order
2. 1.5.4 qualification and closeout

The PR merges after Claude's review, CI, and the Kilo and Codex reviews. Spec 1.1 does not depend on this spec.
