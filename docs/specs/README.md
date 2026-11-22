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
| 1 | [1.0 Dependency maintenance](spec-m1-0-dependency-maintenance.md) | Qualify major upgrades left after compatible closeout fixes | Merged ([#13](https://github.com/vintagedon/ops-toolbox/pull/13), `069a9e7`); D1 and W1 to W3 in its [review document](reviews/review-m1-0-dependency-maintenance.md) await the operator |
| 2 | [1.2 Text Transformer](spec-m1-2-text-transformer.md) | Ordered text operations with original/input/preview and safe file handling | Merged ([#16](https://github.com/vintagedon/ops-toolbox/pull/16), `6262e00`) at spec v0.6 |
| 3 | [1.5 Paste BOM fidelity and test reliability](spec-m1-5-bom-paste-and-test-reliability.md) | Imported BOM survives a paste; passphrase and ASCII Banner tests stop flaking (#14, #15) | v0.2, approved for dispatch (`recqF2TzzUDjAc4su`) |
| 4 | [1.6 CI workflow](spec-m1-6-ci-workflow.md) | Pinned actions and runner, plus a Docker image that is built, run and smoke-tested in CI (closes D1) | v0.1, GPT review; workflow change approved by Don (`recqF2TzzUDjAc4su`) |
| 5 | [1.1 Sentinel workspace](spec-m1-1-sentinel-workspace.md) | Persistent navigation, useful front page, coherent themes and capability filters | v0.4 draft: console layout, command-line search and category pages; waits on Sentinel spec 09 and its amendment 09a |
| 6 | [1.4 Release editions](spec-m1-4-release-editions.md) | One codebase, full and air-gapped artifacts, first connected DNS tool | v0.3 draft: qualifies the tools present at its start; DNS Lookup and editions decided; needs hardening |
| 7 | [1.3 Cloud subnet planner](spec-m1-3-cloud-subnet-planner.md) | Local provider-aware IPv4 planning, visual map and reusable exports | v0.2 draft: gate 5 adds the planner to both editions |

Order (proposed by Claude, agreed by Don 2026-11-22, batch approval `recqF2TzzUDjAc4su`):
1.0 and 1.2 have shipped. 1.5 runs next. 1.6 (CI workflow) runs after GPT reviews it.
1.1 waits until Sentinel spec 09 and its amendment 09a merge, because it pins that
merge. 1.4 runs before 1.3: it qualifies the tools shipped at its starting commit,
and 1.3 then adds the cloud planner to both editions and qualifies it there. This
order supersedes the 2026-11-15 sequencing described below.

Triad review (Claude, 2026-11-15) hardened 1.0 and 1.2 for dispatch after GPT
review and carried its findings into 1.1. The November 4 central blank line
remover spec was retired in favor of 1.2.

After approval, open one GitHub issue per dispatched spec, use
`task/1-<minor>-<slug>`, commit each gate, append its worklog, and, after operator
review of the local branch, open a PR with `Closes #N`. Run from current main. These documents remain in-repo and iterate;
historical central specs remain untouched. Dispatch does not implicitly authorize
workflow changes, publication, or merges beyond the operator's stated scope.

The closeout worklog records the current branch repair and dependency exceptions.
Spec 1.0 preceded new functionality because outstanding upstream fixes crossed major
versions, and spec 1.2 shipped on the current shell (operator decision, 2026-11-15)
for spec 1.1 to restyle with every other tool. Full and air-gapped editions are decided (operator, 2026-11-14, restated
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
