---
title: "1.2 Text Transformer"
description: "Ordered local text transformations with preview, reversible application, and a zero-click blank-line default"
date: "2026-11-15"
version: "0.2"
status: "review-ready"
tags:
  - type: specification
  - domain: data
related_documents:
  - "[Weekend specifications index](README.md)"
  - "[AGENTS.md: Executing a Work Spec](../../AGENTS.md)"
---

# 1.2 Text Transformer

**Task 1.2 (#N, opened at dispatch).** Gates 1.2.1 to 1.2.4. Runs from current `main` right after 1.0, on the current layout. Spec 1.1 restyles this tool along with every other tool; nothing here waits for it.

v0.1 (GPT, 2026-11-14) set the interaction model. v0.2 (Claude, 2026-11-15, triad review) adds the blank-character definition, verified fixtures, the zero-click default, frozen registry fields, scope and closeout. The interaction model is unchanged.

## Objective

When this spec closes, `/text-transformer` is tool 25: one local, offline-capable page for pasted text or one UTF-8 text file. An ordered operation strip sits above input and preview panes. The page opens with one operation, **Collapse blank lines**, already enabled, so pasting copied AI output and pressing Copy yields clean text with no other click. "Blank" covers the invisible characters that AI output carries (non-breaking spaces, zero-width characters, byte-order marks), not just spaces and tabs. The pure pipeline in `src/lib/textTransform.js` matches the fixture table below exactly. Every tool-count claim in the repository says 25, except the hero screenshot, its alt text and the social card, which spec 1.1 redoes.

## Why this exists

The operator asked for a blank line remover on 2026-11-04 because text copied out of AI chat interfaces arrives with long runs of blank lines. Many of those lines are not empty. They hold spaces, tabs, U+00A0, U+200B, U+FEFF and similar characters.

That is the silent failure this spec designs against. A remover that tests blank lines with `line.trim() === ''` or a bare `\s` looks correct on ordinary input, yet leaves exactly the lines the operator complained about: neither strips U+200B, U+200C, U+200D or U+2060. A splitter that only knows `\n` leaves a `\r` on every line of Windows text. A serializer that drops the final newline quietly changes files. Fixtures F1 to F12 and mutations M1 to M4 exist to catch each of these, and all were checked against a reference implementation on 2026-11-15.

Prior findings here (paths, line numbers, counts) were observed at `main` = `75ba911`. Verify each before acting on it. A claim that does not reproduce is a worklog finding, not something to force.

## Execution Environment

| Item | Value |
|---|---|
| Host | ml01a, primary checkout `/opt/agents/repos/ops-toolbox`. Clean tree on `main` is the precondition. |
| Attended | No. The run does not pause. The operator reviews the local branch before push. |
| Toolchain | Repository `npm` scripts. CI parity (Node 22, npm 12.0.2) is proven in a `node:22-alpine` container, as in the Dockerfile build stage; ml01a's default Node 24 / npm 11 is not parity. |
| Browser checks | Python Playwright from `/opt/agents/venv`, Chromium only, against `npm run build` output served by `npx vite preview`. |
| Existing code | None of the new files exist. |

## Scope

### Pre-existing (do not create)

- Registry, router, directory grid, shared primitives (`CopyButton`, `useClipboard`, `useDebouncedValue`, `ErrorBanner`), design tokens and themes.
- `tests/migration/shared-primitives-usage.test.js`, which scans `src/tools/` for hand-rolled clipboard and debounce.

### Modify

- `src/lib/textTransform.js` (new) and `tests/lib/textTransform.test.js` (new)
- `src/tools/TextTransformer.jsx` (new) and `tests/tools/TextTransformer.test.jsx` (new); helper components or a worker module beside it if needed
- `src/lib/toolRegistry.js`: one entry. `src/App.jsx`: one lazy import. `src/components/DirectoryGrid.jsx`: the lucide import list and `ICONS` map only
- `tests/lib/toolRegistry.test.js`: the four `24` occurrences (lines 14, 16, 110, 111) become `25`
- `scripts/generate-meta.mjs`: the count in `SUMMARY` only
- `README.md`: counts on lines 4, 19, 72, 84 and 225, `Tool 24` in the line-206 diagram, `### Data (5)` heading plus one row
- `AGENTS.md`: counts on lines 10, 45 and 146
- `docs/README.md` (lines 28, 59), `docs/apps/README.md` (lines 17, 25, 36): counts
- `docs/apps/tool-reference.md`: counts on lines 4 and 35, one entry at the end of section 6
- `src/lib/README.md`, `src/tools/README.md`: one inventory row each
- This spec (status and amendments only), `work-logs/worklog-YYYY-MM-DD-text-transformer.md`

### Reference

- `AGENTS.md` sections "Adding a Tool", "Key Constraints", "What NOT To Do"
- `src/tools/Base64Codec.jsx` with `src/lib/base64.js` as the nearest live text transform
- `docs/design/contrast-standard.md`

### Do not touch

- `assets/directory-hero.png`, the README line-43 alt text, `scripts/generate_og_card.py`, `public/og.png`. They still say 24 tools; spec 1.1 reshoots and regenerates them from the new home page.
- `src/components/ToolLayout.jsx` and the rest of `DirectoryGrid.jsx`. Spec 1.1 refactors both; edits here create its conflicts.
- Raw `text-black`/`bg-white` classes in existing tools. Spec 1.1 gate 2 clears them. The new files must not add any.
- `.github/workflows/`. AGENTS.md requires explicit approval; spec 1.0 owns workflow proposals.
- `package.json` and `package-lock.json`. No new dependency is needed; a worker uses the platform `Worker` API through Vite.
- The `@see` URLs in existing headers that still name the old org. New files use `https://github.com/vintagedon/ops-toolbox`.

## Frozen semantics

**Line model.** Parse text into lines, the terminator style and a terminal-newline flag. Split on `\r\n`, `\r` or `\n`, longest match first. A terminator at the very end ends the last line and does not start a new one, so `"a\n"` is one line with the flag set. If all terminators are one style, output uses that style; if they differ, output uses LF and the page shows an import notice. Output appends the terminator after the last line when the flag is set and at least one line remains. Zero remaining lines produce empty output. Pasted text reaches the page with LF line breaks, because browsers normalize textarea values; CRLF and CR cases are exercised through file import and the pure module.

**Blank.** A line is blank when it is empty or every character is in the blank set: every character JavaScript's `\s` matches, plus U+200B, U+200C, U+200D and U+2060. Trim uses the same set.

**Operations** (v0.1 list, semantics pinned where v0.1 left them open):

| Operation | Semantics |
|---|---|
| Collapse blank lines | Drop blank lines before the first and after the last non-blank line; each interior run of blank lines becomes one empty line (`""`), even when the input lines held whitespace. |
| Remove blank lines | Option *whitespace* (default) removes every blank line; option *empty only* removes only zero-length lines. |
| Trim lines | Remove leading and trailing blank-set characters from each line. Interior characters stay. |
| Normalize line endings | Set output style to LF, CRLF or CR. |
| Remove duplicate lines | Case-sensitive exact match; keep the first occurrence. |
| Sort lines | Unicode code-point order; reverse option. |
| Uppercase / lowercase | `toUpperCase` / `toLowerCase`, labelled as locale-independent. |
| Prefix / suffix | Literal text added to every line. |
| Find / replace | Literal, all matches, explicit case sensitivity. Empty search text is invalid. Case-insensitive replace leaves unmatched spans byte-identical. |

No regex or arbitrary code execution in this release.

**Default pipeline.** A fresh page load holds exactly one operation: Collapse blank lines, enabled.

### Fixtures

`<U+XXXX>` stands for that single code point; `\n`, `\r` and `\t` are the usual escapes. In tests, write each `<U+XXXX>` as its JavaScript escape. Every row is a required test in `tests/lib/textTransform.test.js`.

| # | Input | Collapse | Remove blank (whitespace) |
|---|---|---|---|
| F1 | `a\n\n\n\nb` | `a\n\nb` | `a\nb` |
| F2 | `a\n \t\n<U+00A0>\n<U+200B>\n<U+FEFF>\nb` | `a\n\nb` | `a\nb` |
| F3 | `\n\n a\n\nb  \n\n\n` | ` a\n\nb  \n` | ` a\nb  \n` |
| F4 | `a\r\n\r\n\r\nb\r\n` | `a\r\n\r\nb\r\n` | `a\r\nb\r\n` |
| F5 | `a\r\rb` | `a\r\rb` | `a\rb` |
| F6 | `a<U+200B>b\n\n\nc` | `a<U+200B>b\n\nc` | `a<U+200B>b\nc` |
| F7 | ` \n<U+200B>\n\t` | (empty) | (empty) |
| F8 | (empty) | (empty) | (empty) |
| F9 | `a\nb` | `a\nb` | `a\nb` |
| F10 | `a\n` | `a\n` | `a\n` |
| F11 | `a\n<U+3000><U+2060> \nb` | `a\n\nb` | `a\nb` |
| F12 | `a\r\n\nb\r` | `a\n\nb\n`, notice shown | `a\nb\n`, notice shown |

F3 keeps the leading space on ` a` and both trailing spaces on `b  `.

| # | Input | Pipeline | Output |
|---|---|---|---|
| E1 | F2 input | Remove blank (empty only) | F2 input, unchanged |
| E2 | F1 input | Remove blank (empty only) | `a\nb` |
| T1 | ` a \n\t<U+200B>b<U+00A0>` | Trim lines | `a\nb` |
| T2 | `x<U+200B>y ` | Trim lines | `x<U+200B>y` |
| P1 | `a\n\nb` | Prefix `> `, then Remove blank | `> a\n> \n> b` |
| P2 | `a\n\nb` | Remove blank, then Prefix `> ` | `> a\n> b` |

## Deliverables

Gate discipline: each gate ends in one local commit referencing its number (for example `feat(text): pure transform pipeline (1.2.1)`) and a worklog checkpoint. Data decisions first, architecture second.

### Gate 1.2.1: Pure pipeline

Build `src/lib/textTransform.js`: the line model, the operation descriptors above, and a pipeline that applies enabled operations in order, skips disabled ones, and allows repeated instances. Invalid operations (for example an empty find string) return a validation error and leave the input data untouched.

**Validation:**

- [ ] F1 to F12 pass for both columns, and E1, E2, T1, T2, P1, P2 pass.
- [ ] Idempotence: for every F input, applying Collapse to its own Collapse output returns the same text; likewise Remove blank.
- [ ] A disabled operation is inert: the F2 input with Collapse disabled returns the input unchanged. Two Prefix instances apply twice.
- [ ] Dedupe, sort (both directions), case, prefix/suffix and find/replace each have tests, including empty find rejected and case-insensitive replace preserving unmatched spans.
- [ ] Mutations, each in a scratch copy, reverted afterwards, failing tests recorded in the worklog:
  - M1: blank test becomes `line.trim() === ''`. F2, F7 and F11 fail.
  - M2: splitter splits on `\n` only. F4, F5 and F12 fail.
  - M3: Collapse keeps the first blank line's original text instead of `""`. F2 and F11 fail.
  - M4: parser drops the final terminator before splitting. F4, F10 and F12 fail.
- [ ] The module imports nothing from React and carries a JSDoc `@file` header.

### Gate 1.2.2: Workspace

Register the tool and build the page. Interaction is v0.1's: Input is the editable source; Preview evaluates enabled operations in visible order without mutating Input; add, remove, reorder (keyboard-operable buttons), disable and repeat operations. **Apply** replaces Input with Preview, stores the prior input for undo, and clears the applied operation list. **Undo Apply** restores input and list; keep at most ten snapshots. **Restore original** restores the last imported or pasted baseline, confirming first if edits would be lost; editing Input does not change the baseline. Counters show lines and characters before and after.

Files: accept up to 2 MiB, reject invalid UTF-8 and NUL-containing input with an explanation and the prior state intact. Strip one leading UTF-8 BOM on import and restore it on download. Download a new `.txt`; never overwrite. Copy and Download act on the current preview only and are disabled while preview is stale or invalid. Use `useDebouncedValue` and `CopyButton`/`useClipboard`. No content in `localStorage`. If measured preview work on the F2 text repeated to 2 MiB exceeds 100 ms on ml01a, move evaluation to a worker. Never truncate preview or output.

Use the full width of the current tool content area; panes stack below 768 px.

Registry fields, frozen:

| Field | Value |
|---|---|
| `id`, `path` | `text-transformer` |
| `name` | `Text Transformer` |
| `description` | `Clean up pasted text with ordered operations: collapse or remove blank lines, trim, dedupe, sort, change case, and find and replace.` |
| `category` | `Data` |
| `componentPath` | `./tools/TextTransformer` |
| `processingMode` | `local` |
| `offlineCapable` | `true` |
| `status` | `stable` |

Choose a `lucide-react` icon. `DirectoryGrid` silently falls back to `Network` for names missing from `ICONS`, so add it to the import list and the map.

**Validation:**

- [ ] Component test, zero-click path: render, set Input to the F2 input, wait for the debounce, and assert Preview equals `a\n\nb` with no other interaction; Copy then writes exactly `a\n\nb` to the clipboard.
- [ ] Component test: with an enabled operation edited so Preview is stale, Copy and Download are disabled.
- [ ] Component test: Apply then Undo Apply restores Input and the operation list exactly; eleven Applies leave ten undo steps.
- [ ] Component test: a 2 MiB + 1 byte file, an invalid UTF-8 file and a file containing NUL are each rejected, and Input is unchanged after each.
- [ ] Component test: importing the F4 input as a file with a leading BOM and downloading after Collapse produces BOM + `a\r\n\r\nb\r\n`.
- [ ] `tests/lib/toolRegistry.test.js` asserts 25 and passes; deleting the new entry in a scratch copy fails it.
- [ ] `grep -n` for the chosen icon in `src/components/DirectoryGrid.jsx` shows both the import and the map entry.
- [ ] `grep -rnE '\b(text|bg|border|ring)-(black|white)\b'` on the new files returns nothing.
- [ ] The preview timing measurement and the worker decision are recorded in the worklog.
- [ ] `npm run test` passes in full.

### Gate 1.2.3: Counts, docs and qualification

Update every count in Modify to 25 and add the inventory rows and tool-reference entry (format of the existing Data entries: Route, Source naming both files, Mode). Count edits change only the number.

**Validation:**

- [ ] `grep -rnE '\b24\b' README.md AGENTS.md docs/README.md docs/apps/README.md docs/apps/tool-reference.md scripts/generate-meta.mjs tests/lib/toolRegistry.test.js` returns only the README line-43 alt text and lines unrelated to tool count; each remaining hit is listed in the worklog with its reason.
- [ ] README's Data heading count equals the number of `category: 'Data'` registry entries (6).
- [ ] `grep -cP '\x{2014}'` on the new files and the new tool-reference entry returns 0.
- [ ] In a `node:22-alpine` container with npm 12.0.2, a clean checkout of the gate commit passes `npm ci`, `npm run test` and `npm run build`; `node -v` and `npm -v` output is in the worklog.
- [ ] `dist/text-transformer/index.html` exists, `dist/sitemap.xml` holds 27 `<loc>` entries including `https://opstoolbox.dev/text-transformer`, and `dist/llms.txt` contains the frozen description verbatim.
- [ ] Playwright, fresh context, every request outside the local preview server aborted and logged: home shows a Text Transformer card under Data whose icon is not the Network fallback; on `/text-transformer`, filling Input with the F2 input yields `a\n\nb` in Preview with no other action; file import, Apply, Undo Apply, Restore original, Copy and Download all work; the aborted-request log is empty.
- [ ] Playwright at 320 px: `document.documentElement.scrollWidth <= window.innerWidth`. Under Light, Dark and High-Contrast Slate: no console errors. Keyboard only: add, reorder, disable an operation, and reach Copy.

### Gate 1.2.4: Closeout

Follow "Executing a Work Spec" in `AGENTS.md`. Branch `task/1-2-text-transformer` from current `main`. One worklog at `work-logs/worklog-YYYY-MM-DD-text-transformer.md`, appended per gate and sealed. Push posture per AGENTS.md: commits stay local, the executor does not push, open, mark ready or merge a pull request. The worklog carries the proposed PR body with `Closes #N`.

**Validation:**

- [ ] `git log main..HEAD` shows only this spec's commits: one per gate (1.2.1, 1.2.2, 1.2.3) plus closeout.
- [ ] `git merge-base main HEAD` equals `main` at startup.
- [ ] Nothing was pushed: `git ls-remote origin task/1-2-text-transformer` returns nothing.
- [ ] The worklog records base commit, gate SHAs, mutation results, timing and worker decision, container versions, the remaining-`24` list and the PR body, and is sealed.

## Constraints

- **Do not use `trim()` or a bare `\s` test for blank lines or trimming.** Both miss zero-width characters, the reason this tool exists. M1 proves it.
- **Do not normalize text an operation does not touch.** No quote, dash or Unicode normalization; non-blank lines pass through byte for byte unless an enabled operation changes them.
- **No regex, no arbitrary code, no network.** Literal find/replace only in this release.
- **Do not make blank handling markdown-aware.** Fence awareness is an undecided design question.
- **Do not refactor hard-coded counts into derived values.** Change the numbers; the refactor is separate work.
- **Every claim traces to evidence.** This spec's observations are prior findings to verify.

## What the executor may choose

Yours: function and helper names, descriptor shape, component decomposition, layout within the content area, wording, the icon, download filename, test organization beyond the required cases, and whether to use a worker (measured).

Frozen: the line model, the blank set, every operation's semantics, the default pipeline, the fixtures, registry fields, file limits and rejection rules, paths in Modify, and every do-not-touch item.

## Execution order

1. 1.2.1 pure pipeline (everything depends on its semantics)
2. 1.2.2 workspace
3. 1.2.3 counts, docs, qualification (container and browser results are final only after 1.2.2)
4. 1.2.4 closeout

No batch renaming, multi-file editing, automatic saving or online processing in this release.
