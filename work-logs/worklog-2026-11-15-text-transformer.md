---
title: "1.2 Text Transformer execution"
description: "Local gate evidence and review handoff for issue 12"
date: "2026-11-15"
status: "in-progress"
tags:
  - type: worklog
  - domain: data
---

# Text Transformer execution

Authorization: Don, "approved, execute", 2026-11-15 07:51 America/New_York,
Action Registry `rec6VLa3hwb0m0QD3`; issue #12. Only spec 1.2 is dispatched.
Run: `opstoolbox12-codex-20261115T150247Z-ca7d66`.

Startup: clean worktree `/opt/agents/repos/ops-toolbox-task-1-2`, branch
`task/1-2-text-transformer`. Base and merge-base with `main`:
`069a9e70aa1b231b6497f04b61f47549f4b1471b`. The primary checkout is clean on
`main`; no changes are made there. Approved spec v0.3 SHA-256:
`27cc679808df97a71a776d2ae25265ecc983bce2f0212e6d48c90341832f7ae0` (verified).
Read the full spec, repository and parent AGENTS, specs index, host/project
instructions, lifecycle guidance and applicable source/design references.
Repository-mode scope and explicit dispatch supersede central lifecycle
publication, archive and registry writes. No credentials, auth files or gh used.

Runtime facts: hostname `ml01a`, account `crainbramp`. Execution began during
15:02 UTC; first explicit clock receipt `2026-11-15T15:05:38Z`.
The runtime does not expose a trustworthy executor model identifier to this
session: `unreported`. The dispatch's requested model is not a runtime receipt.
Toolchain observed through `npx -y -p node@22 -p npm@12.0.2 --`: Node
`v22.23.5`, npm `12.0.2`. No model change or other agents.

## Gate 1.2.1

Data decisions: explicit blank set (`\s` plus U+200B/U+200C/U+200D/U+2060),
longest-first terminators, separate terminal-newline flag, mixed input serialized
with LF. Sort compares numeric Unicode code points. Literal replacement escapes
metacharacters, uses a function replacement to preserve dollar text, and keeps
unmatched spans intact. Validation runs before any operation so errors return
the unchanged source.

Architecture: pure `src/lib/textTransform.js` supplies descriptors, parser,
serializer and ordered pipeline. No React import. Operations can repeat and
be disabled; no input arrays are mutated.

Validation: `npm run test -- tests/lib/textTransform.test.js` via the pinned
npx toolchain: 57/57 pass, 568 ms total (tests 7 ms). F1-F12 both columns,
idempotence, E1/E2/T1/T2/P1/P2, disabled F2, repeated prefixes, remaining
operations, empty-find atomic failure and literal replacements are covered.

Each mutation ran in its own `/tmp` scratch copy with unchanged tests; copies
were removed and repository source stayed intact. All exited 1:

- M1 `line.trim() === ''`: F2, F7, F11 fail in both columns; extra-invisible test fails (7 tests).
- M2 LF-only split: F4 both columns/idempotence, F5 Remove, F12 both columns/idempotence fail (7 tests).
- M3 retain original blank text: F2 Collapse, F11 Collapse and extra-invisible test fail (3 tests).
- M4 remove final terminator before parse: F4/F10/F12 both columns fail, plus F3 idempotence and five pipeline contracts (12 tests).

Clean committed-checkout parity receipt follows at the next checkpoint, before
starting gate 1.2.2 implementation. Commits remain local.

Gate 1.2.1 commit: `dc38bfe674` (full SHA available via `git rev-parse dc38bfe`).
A detached, clean `/tmp/opstoolbox12-gate1` checkout of that commit ran
`npx -y -p node@22 -p npm@12.0.2 -- sh -c 'node -v && npm -v && npm ci --no-audit --no-fund && npm run test && npm run build'`:
Node `v22.23.5`, npm `12.0.2`; install passed; 65 files / 611 tests passed
in 6.34 s; build passed (Vite 1.06 s), 26 routes and sitemap entries.
Existing large-chunk warnings were reported; no dependency or config changes.

## Gate 1.2.2

Data decisions: snapshots retain exact source, BOM and operation instances;
Apply clears the list; Undo restores it, capped at ten. An accepted import or
paste sets the baseline; typing leaves it intact. Restore confirms before
replacing changed Input, retains the current operation list and clears undo.
UTF-8 decoding is fatal, explicitly preserves BOM during decode, then strips
exactly one leading BOM for restoration on download. Invalid files leave the
prior data, baseline, operations and undo untouched.

Architecture: `TextTransformer.jsx` uses `useDebouncedValue` and `CopyButton`.
Source and operation identity immediately invalidate output controls during the
300 ms debounce. Read-only Preview preserves the entire result; the panes use
the full content width and stack below 768 px. FileReader supports local bytes;
Blob download creates `transformed.txt`. No content storage or network code.
The registry entry matches every frozen field; `ListFilter` is imported and
mapped on DirectoryGrid lines 16 and 24. Only those lists were changed there.

Measured in Chromium `156.0.8078.4`, Python Playwright `1.64.0`, ml01a, against
built gate-1 output served by pinned `npx vite preview`. F2 repetitions plus
ASCII padding total exactly 2,097,152 UTF-8 bytes. Five pipeline evaluations:
55.3, 39.7, 45.6, 41.6, 39.0 ms. Maximum 55.3 ms < 100 ms: no worker needed.
An earlier Node timing probe accidentally measured 2,097,154 bytes (73.18-99.34
ms); it is not the acceptance measurement. Preview/output are never truncated.

Validation: ten component tests cover zero-click F2/Copy, stale operation edits,
Apply/Undo exact list, eleven Applies yielding ten snapshots, all three rejected
file types, BOM + F4 exact download bytes, exact 2 MiB acceptance, restore/cancel,
mixed-ending notice, invalid-operation disabling/removal. Component plus registry
run: 31/31 pass (8.47 s). Full suite: 66 files / 621 tests pass (10.30 s).
Registry deletion in a separate scratch copy exits 1: array length and
`getToolCount` expectations both fail; scratch removed. New files have no raw
black/white classes or em dashes; `git diff --check` passes.

Gate-2 committed-checkout parity receipt follows before gate-3 implementation.
No out-of-scope changes proposed at this checkpoint. No operator questions.
