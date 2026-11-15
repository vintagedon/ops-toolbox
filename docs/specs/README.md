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

| Order | Specification | Result |
|---|---|---|
| 1 | [1.0 Dependency maintenance](spec-m1-0-dependency-maintenance.md) | Qualify major upgrades left after compatible closeout fixes |
| 2 | [1.1 Sentinel workspace](spec-m1-1-sentinel-workspace.md) | Persistent navigation, useful front page, coherent themes and capability filters |
| 3 | [1.2 Text Transformer](spec-m1-2-text-transformer.md) | Ordered text operations with original/input/preview and safe file handling |
| 4 | [1.3 Cloud subnet planner](spec-m1-3-cloud-subnet-planner.md) | Local provider-aware IPv4 planning, visual map and reusable exports |
| 5 | [1.4 Release editions](spec-m1-4-release-editions.md) | One codebase, full and air-gapped artifacts, first connected DNS tool |

After approval, open one GitHub issue per dispatched spec, use
`task/1-<minor>-<slug>`, commit each gate, append its worklog, and open a PR with
`Closes #N`. Run from current main. These documents remain in-repo and iterate;
historical central specs remain untouched. Dispatch does not implicitly authorize
workflow changes, publication, or merges beyond the operator's stated scope.

The closeout worklog records the current branch repair and dependency exceptions.
Spec 1.0 precedes new functionality because outstanding upstream fixes cross major
versions. Specs 1.2 and 1.3 can run independently after 1.1 lands. Spec 1.4 packages
their final output. Preserve existing tool routes throughout; multifunction pages
are a direction for useful consolidation, not an instruction to rewrite all tools.

## Design decisions carried forward

- Retain React, pure computation modules, lazy tools, bundled fonts and semantic
  tokens. Consume Sentinel's merged foundations through a small React adapter.
- Refresh Light and Dark; retain High-Contrast Slate and System. Moss is an
  optional later palette, not a required visual identity.
- Local-only is a capability filter in the full edition. Air-gapped is a tested
  distribution with connected code omitted, not just a hidden menu item.
- Cloud planning means provider rules, sizes and reserved addresses. It needs no
  cloud login or live account import and belongs in both editions.
- DNS lookup is a proposed first connected tool, pending operator acceptance of
  the spec. No model service or paid API is included in this release.

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
