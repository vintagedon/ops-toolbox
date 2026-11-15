---
title: "1.1 Sentinel workspace"
description: "A scalable workspace shell, useful home page, and coherent accessible themes"
date: "2026-11-14"
version: "0.3"
status: "draft"
tags:
  - type: specification
  - domain: design-system
---

# 1.1 Sentinel workspace

v0.1 (GPT, 2026-11-14). v0.2 (Claude, 2026-11-15, triad review): raw palette
clearing in gate 2, hero image and social card in scope, runs after spec 1.2.
v0.3 (Claude, 2026-11-15, `recwmHfFnLprerWSF`): theme menu Light, Ember, Sea and
System with Sea as the default; Slate and plain Dark leave the menu; the Sentinel
pin moves to the merge of Sentinel spec 09, which adds Ember and Sea. Not yet
dispatchable: it waits on Sentinel spec 09 and still needs the scope, validation
and closeout sections that specs 1.0 and 1.2 carry.

## Outcome

Give Ops Toolbox a persistent tool navigator and a spacious work area. Home becomes
a useful starting point: search, category/capability filters, and grouped tool
entries with concise descriptions. Avoid a large decorative hero or a dashboard
of invented statistics. Existing URLs and all tools continue to work.

## Design and data contract

Use the Sentinel baseline at the merge commit of Sentinel spec 09 (Ember and Sea
palettes) on `vintagedon/sentinel-website-framework` `main`, and record its full
SHA at dispatch. Its parent baseline is `a5e64fd4ab61a16fbacf414dd9a2740d8bddca2a`
(the merge of PR #6 on 2026-11-10). This spec does not dispatch until spec 09
merges. At dispatch, record any other Sentinel commits merged after spec 09; do not adopt them.
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

**Theme menu (decided 2026-11-15, `recwmHfFnLprerWSF`).** Light, Ember, Sea and
System, with Sea as the default. Light uses Sentinel's Light; Ember and Sea use the
palettes Sentinel spec 09 adds, with values taken from Sentinel's tokens, not
copied. System resolves an OS dark preference to Ember and a light preference to
Light. High-Contrast Slate and plain Dark leave the menu, and Moss stays out of it.
Keep density and font controls. Keep `ops-theme-preference` and migrate stored
values explicitly, without a flash: `dark` and `slate` become `ember`; `light` and
`system` stay; anything else falls back to the default. `data-theme` keeps driving
Ops styles with the values `light`, `ember` and `sea`; mirror the resolved palette
to `data-sentinel-theme`. Never add `.dark`.

**Accessibility guarantee.** AGENTS.md names High-Contrast Slate "the
accessibility guarantee". With Slate gone, the guarantee becomes: every palette in
the menu meets WCAG 2.2 AA on its rendered pairs (Sentinel contract section 11), and
the app stays operable under the operating system's forced-colors mode. Update
AGENTS.md (the Stack line and the `data-theme` constraint, lines 12 and 56 at
`75ba911`; the Tailwind `slate-*` prohibition and the archived-spec history keep
their wording) and `docs/design/contrast-standard.md` to say so.

## Gates and acceptance

1. **Data first.** Document the metadata contract and test composed filters and
   route parity. Use fixtures for future remote/hybrid tools; current tools remain
   local. No registry count or all-local test may silently block future editions.
2. **Theme adapter.** Implement semantic mapping, updated palettes and migration.
   Audit text at 4.5:1 and controls/focus at 3:1 for every selectable palette.
   Check system preference, reload, storage failure, reduced motion and bundled
   fonts. Preserve the accessibility baseline and visible keyboard focus.
   Replace raw palette classes with semantic tokens first: at `75ba911`, 20 files
   in `src/` use `text-black` or `bg-white` (38 uses), which no palette reaches.
   `grep -rnwE '(text|bg|border|ring)-(black|white)' src` returns nothing.
   Stored `dark` and `slate` load as Ember with no flash on first paint. Under
   emulated `forced-colors: active`, focus rings, control boundaries and status
   shapes stay visible on home and three representative tools.
3. **Shell and home.** Refactor `ToolLayout`, directory and shared navigation.
   Keyboard users can find/open a tool, skip navigation, use settings and return
   home. Preserve meaningful headings, per-tool lazy imports and error boundaries.
   Existing standalone URLs remain valid; no speculative mega-workspace rewrites.
4. **Qualification.** All tests/build plus every registered tool (25 after spec 1.2) and About/home. Test 320,
   768 and 1440 px, all themes, Mono/Comfortable, 200% zoom and navigation focus.
   No page overflow from ordinary controls; wide data tables may scroll inside a
   labelled region. Inspect rendered screens and record contrast/browser results.

Update architecture, tool reference and privacy wording only to describe shipped
behavior. Reshoot `assets/directory-hero.png` from the shipped home page and update
its README alt text; update the count in `scripts/generate_og_card.py` and
regenerate `public/og.png`. Both say 24 tools today. Output: reviewed shell on main
before spec 1.3 begins. Spec 1.2 runs first, on the current shell, by operator
decision of 2026-11-15; this spec restyles it with the other tools.
