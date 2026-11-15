---
title: "Weekend release specifications"
description: "Reviewable scope and execution order for the next Ops Toolbox release"
date: "2026-11-14"
status: "draft"
tags:
  - type: directory-readme
  - domain: architecture
---

# Weekend release specifications

These are proposed, bounded work specifications. Preparation is authorized;
feature implementation has not started. The operator selected a workspace with
persistent navigation, multifunction pages, Sentinel styling, a Text Transformer,
cloud subnet planning, and separate full and air-gapped releases. Details below
are proposed defaults for review. Spec numbers identify work, not a product version.

| Order | Specification | Result | State |
|---|---|---|---|
| 1 | [1.0 Dependency maintenance](spec-m1-0-dependency-maintenance.md) | Qualify major upgrades left after compatible closeout fixes | v0.3, reviewed; strict-mode proof corrected |
| 2 | [1.2 Text Transformer](spec-m1-2-text-transformer.md) | Ordered text operations with original/input/preview and safe file handling | v0.2, reviewed |
| 3 | [1.1 Sentinel workspace](spec-m1-1-sentinel-workspace.md) | Persistent navigation, useful front page, coherent themes and capability filters | v0.3 draft; waits on Sentinel spec 09 (Ember and Sea) |
| 4 | [1.3 Cloud subnet planner](spec-m1-3-cloud-subnet-planner.md) | Local provider-aware IPv4 planning, visual map and reusable exports | v0.1 draft |
| 5 | [1.4 Release editions](spec-m1-4-release-editions.md) | One codebase, full and air-gapped artifacts, first connected DNS tool | v0.2 draft; editions and DNS Lookup decided; needs hardening |

Triad review (Claude, 2026-11-15) hardened 1.0 and 1.2 for dispatch after GPT
review and carried its findings into 1.1. The November 4 central blank line
remover spec was retired in favor of 1.2.

After approval, open one GitHub issue per dispatched spec, use
`task/1-<minor>-<slug>`, commit each gate, append its worklog, and, after operator
review of the local branch, open a PR with `Closes #N`. Run from current main. These documents remain in-repo and iterate;
historical central specs remain untouched. Dispatch does not implicitly authorize
workflow changes, publication, or merges beyond the operator's stated scope.

The closeout worklog records the current branch repair and dependency exceptions.
Spec 1.0 precedes new functionality because outstanding upstream fixes cross major
versions. Spec 1.2 runs next, on the current shell (operator decision, 2026-11-15);
spec 1.1 then restyles it with every other tool, once Sentinel spec 09 has added
the Ember and Sea palettes it ships. Spec 1.3 follows 1.1 because it
adopts Sentinel patterns from 1.1's pinned baseline. Spec 1.4 packages their final
output. Full and air-gapped editions are decided (operator, 2026-11-14, restated
2026-11-15); DNS Lookup ships first (operator, 2026-11-15 05:07). Preserve existing tool routes throughout; multifunction pages
are a direction for useful consolidation, not an instruction to rewrite all tools.

## Design decisions carried forward

- Retain React, pure computation modules, lazy tools, bundled fonts and semantic
  tokens. Consume Sentinel's merged foundations through a small React adapter.
- Theme menu: Light, Ember, Sea and System, with Sea as the default (decided
  2026-11-15). Ember and Sea come from Sentinel spec 09. High-Contrast Slate and
  plain Dark leave the menu; Moss stays out of it.
- Local-only is a capability filter in the full edition. Air-gapped is a tested
  distribution with connected code omitted, not just a hidden menu item.
- Cloud planning means provider rules, sizes and reserved addresses. It needs no
  cloud login or live account import and belongs in both editions.
- DNS Lookup is the first connected tool (operator, 2026-11-15 05:07). No model
  service or paid API is included in this release.

## References and later candidates

[Sentinel](https://sentinel.donfather.site/) supplies the design contract;
[theme guidance](https://sentinel.donfather.site/foundations/themes-colors/) informs
palette work. [CodeBeautify](https://codebeautify.org/) is a selective feature
reference, not a catalog to reproduce. Prefer Text, Structured Data, and Network
workspaces over dozens of one-action pages.

Later candidates: JSON/JSONL validation and conversion, CSV/TSV transformations,
token estimates with an explicitly named tokenizer, context-budget calculations,
and prompt/message inspection. Do not promise exact model billing from a generic
character estimate. These candidates are not acceptance requirements for 1.0–1.4.
