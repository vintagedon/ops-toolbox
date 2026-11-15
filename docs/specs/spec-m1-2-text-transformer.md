---
title: "1.2 Text Transformer"
description: "Ordered local text transformations with preview and reversible application"
date: "2026-11-14"
status: "draft"
tags:
  - type: specification
  - domain: data
---

# 1.2 Text Transformer

## Outcome and interaction

Add one local, offline-capable workspace for pasted text or one UTF-8 text file.
Put an ordered transformation strip above input and preview panes, using roughly
90% of the main work area; stack panes on small screens. Blank-line removal must
be immediately discoverable. This follows the operator's PowerRename-like shape.

Input is the current editable source. Preview evaluates enabled operations in
visible order without mutating input. Add, remove, reorder and disable operations;
allow repeat instances. **Apply** replaces input with preview, stores the prior
input for undo, and clears the applied operation list so it cannot silently run
twice. **Undo Apply** restores both the input and operation list. Keep at most ten
apply snapshots. **Restore original** restores the last imported/pasted baseline
after confirmation if it would discard edits. Editing input does not change that
baseline. Clear/remove never uploads or persists text.

Initial operations: remove empty lines (empty-only or whitespace-only), collapse
consecutive blank lines, trim leading/trailing whitespace per line, normalize line
endings, remove duplicate lines, sort lines, uppercase/lowercase, add prefix/suffix,
and literal find/replace (all matches, explicit case sensitivity). No arbitrary
JavaScript or regex execution in this release. Literal matching of empty search
text is invalid. Expose case-sensitive exact-line deduplication, retaining first
occurrence; sort is deterministic Unicode code-point order with reverse option.
Define case folding as JavaScript's locale-independent case conversion, and label
it clearly. Case-insensitive replacement must preserve unmodified original spans.

## File and output contract

Accept files up to 2 MiB; reject invalid UTF-8 and NUL-containing binary input with
an explanation. Strip one UTF-8 BOM on import and preserve its presence on export
unless explicitly changed. Track CRLF/LF/CR and terminal newline; operations that
do not change line boundaries preserve them, while mixed endings normalize to LF
with an explicit import notice. Blank-line operations operate on actual lines,
not a phantom line created solely by a terminal newline. Never overwrite files:
download a new `.txt` file. Preview counters show lines and characters before/after.
Copy and download act on current preview only; disable them while preview is stale
or invalid. Use shared clipboard and debounce hooks. No localStorage for content.

## Gates and acceptance

1. **Pure pipeline.** Add `src/lib/textTransform.js`, operation descriptors and
   tests. Verify order matters, disabled steps are inert, duplicate operation
   instances work, and blank lines, Unicode, mixed endings and final newline have
   explicit fixtures. Preserve original data on all validation failures.
2. **Workspace.** Register a lazy `/text-transformer` route and implement controls,
   keyboard reorder buttons, source/preview, dirty/error states, apply/undo/restore,
   file import, copy and download. Large inputs must not lock the page: use a worker
   if measured preview work exceeds 100 ms on the execution host. Do not silently
   truncate preview or output; any preview virtualization must keep full export.
3. **Qualification.** Full tests/build; real paste/file/preview/apply/undo/download
   round trips, 2 MiB limit, rejected files, keyboard-only use, all themes and 320 px.
   Disconnect network before a fresh visit to the packaged local site; every action
   still works. Update tool reference and registry metadata.

No batch file renaming, multi-file editing, automatic saving or online processing.
