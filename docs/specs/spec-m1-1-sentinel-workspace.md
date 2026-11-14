---
title: "1.1 Sentinel workspace"
description: "A scalable workspace shell, useful home page, and coherent accessible themes"
date: "2026-11-14"
status: "draft"
tags:
  - type: specification
  - domain: design-system
---

# 1.1 Sentinel workspace

## Outcome

Give Ops Toolbox a persistent tool navigator and a spacious work area. Home becomes
a useful starting point: search, category/capability filters, and grouped tool
entries with concise descriptions. Avoid a large decorative hero or a dashboard
of invented statistics. Existing URLs and all tools continue to work.

## Design and data contract

Use the merged Sentinel baseline `a5e64fd` from
`vintagedon/sentinel-website-framework` (resolve and record the full SHA at gate 1).
Read its design contract, implementation guide and shared tokens; carry attribution
and license with copied material. Do not import the unmerged schema explorer or
home widget grid. Keep React/Vite; use local React adapters where needed.

Registry data remains canonical for routes, navigation, search and capability
labels. Retain `processingMode: local|remote|hybrid`, `offlineCapable`, category and
status. Define local-only filtering as local processing AND no tool network
requirement; it must not imply that hiding remote tools blocks network requests.
Separate processing location from the ability to operate disconnected.

Desktop: left navigator plus main content, using about 90% of available content
width for large workspaces. Mobile: accessible collapsible navigation with focus
return, Escape handling and visible selected route. Search and category filters
combine with local-only; show a clear empty state and reset. Do not persist tool
inputs. Favorites and recent tools are deferred; avoid accounts and cross-device
state in this spec.

Refresh Light and Dark using Sentinel semantic roles. Retain High-Contrast Slate
and System, density and font controls. Keep `ops-theme-preference` and existing
values; map resolved values to Sentinel adapters without a flash or loss of saved
preferences. Existing `data-theme` continues to drive Ops styles; mirror the
resolved palette to `data-sentinel-theme` where an adapter needs it. Never add
`.dark`. Do not add Moss in this first gate unless separately selected.

## Gates and acceptance

1. **Data first.** Document the metadata contract and test composed filters and
   route parity. Use fixtures for future remote/hybrid tools; current tools remain
   local. No registry count or all-local test may silently block future editions.
2. **Theme adapter.** Implement semantic mapping, updated palettes and migration.
   Audit text at 4.5:1 and controls/focus at 3:1 for every selectable palette.
   Check system preference, reload, storage failure, reduced motion and bundled
   fonts. Preserve the accessibility baseline and visible keyboard focus.
3. **Shell and home.** Refactor `ToolLayout`, directory and shared navigation.
   Keyboard users can find/open a tool, skip navigation, use settings and return
   home. Preserve meaningful headings, per-tool lazy imports and error boundaries.
   Existing standalone URLs remain valid; no speculative mega-workspace rewrites.
4. **Qualification.** All tests/build plus all 24 tools and About/home. Test 320,
   768 and 1440 px, all themes, Mono/Comfortable, 200% zoom and navigation focus.
   No page overflow from ordinary controls; wide data tables may scroll inside a
   labelled region. Inspect rendered screens and record contrast/browser results.

Update architecture, tool reference and privacy wording only to describe shipped
behavior. Output: reviewed shell on main before specs 1.2/1.3 begin.
