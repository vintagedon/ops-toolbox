# AGENTS.md

Entry point for AI coding agents working on this repository.

## Project Identity

**Domain:** IT Operations / Web Utilities
**Repository:** https://github.com/radioastronomyio/ops-toolbox
**Live:** https://opstoolbox.dev/
**Purpose:** A collection of 24 client-side utility web tools for IT operations and platform engineering. All processing happens in the browser; no backends, no data transmission. Hosted on Azure Static Web Apps.

**Stack:** React 18, Vite 5, React Router v6, Tailwind CSS v3, Vitest, theming via `data-theme` (Light, Dark, High-Contrast Slate, System)

## Architecture

Single-page application with React Router v6. Tools are lazy-loaded via `React.lazy()` + `Suspense`.

- **`src/lib/toolRegistry.js`** — Canonical tool registry (data-only, no React). All routing, directory grid, badges, and search derive from this.
- **`src/lib/`** — Pure utility functions (no React dependencies). Business logic lives here.
- **`src/tools/`** — One React component per tool. UI layer only.
- **`src/components/`** — Shared UI: `CopyButton`, `ErrorBanner`, `ResultPanel`, `ToolLayout`, `DirectoryGrid`, `NotFound`, `SettingsFlyout` (non-modal flyout for theme/density/font settings).
- **`src/hooks/`** — `useClipboard` (clipboard with auto-reset), `useDebouncedValue` (debounce any value), `useTheme` (light/dark/system preference), `useDensity` (compact/default/comfortable layout density), `useFontFamily` (system/inter/mono font switching).
- **`src/styles/design-tokens.css`** — HSL-based CSS custom properties for all semantic color, typography, and motion tokens. Imported before Tailwind directives in `src/index.css`.
- **`src/App.jsx`** — Router with lazy imports mapped to registry IDs.

### Adding a Tool

1. Add entry to `src/lib/toolRegistry.js`
2. Create component in `src/tools/`
3. Add lazy import in `src/App.jsx` keyed to the registry `id`
4. Extract pure logic to `src/lib/` where applicable
5. Write tests, run `npm run test`

## Testing Strategy

- **Framework:** Vitest + @testing-library/react + jsdom
- **Pure logic** in `src/lib/` tested in `tests/lib/` (fast, no DOM)
- **React components** tested in `tests/tools/`, `tests/components/`, `tests/hooks/`
- **Pattern absence tests** in `tests/migration/` ensure banned patterns (hand-rolled clipboard, manual debounce) don't recur
- **Run:** `npm run test` (single run, 474 tests across 56 files) or `npm run test:watch`

## Documentation

- **`docs/architecture.md`** — SPA architecture overview
- **`docs/apps/tool-reference.md`** — Complete reference for all 24 tools
- **`docs/design/contrast-standard.md`** — WCAG AA contrast rule every palette is audited against
- **`docs/design/typography-roles.md`** — UI/mono type roles, the type scale, and the micro-label convention
- **`docs/documentation-standards/`** — Template library for READMEs, KB articles, script headers
- All source files have JSDoc `@file` headers per `docs/documentation-standards/script-header-javascript.md`

## Key Constraints

- **100% client-side.** No API calls. No backends; no data transmission.
- **Privacy-first.** Data never leaves the browser.
- **Lazy loading.** Each tool route uses `React.lazy()` + `Suspense`.
- **Theme via `data-theme`.** Themes are driven by a `data-theme` attribute on `<html>` (not the `.dark` class), supporting the declared list: Light, Dark, and High-Contrast Slate (the accessibility guarantee), plus System. Selectable via the `useTheme` hook; the SettingsFlyout theme control is a menu driven by that declared list. Preference persists to `localStorage` key `ops-theme-preference`. Every palette must satisfy `docs/design/contrast-standard.md` (WCAG AA by construction).
- **Accessibility floor.** `src/styles/accessibility.css` is the named global baseline: visible `:focus-visible` rings, `prefers-reduced-motion` suppression routed through the motion tokens, `overflow-wrap` for long tokens, and `safe-area-inset` padding.
- **Testable architecture:** Extract computation into `src/lib/` pure functions.
- **Shared primitives:** Use `useClipboard`/`useDebouncedValue`/`CopyButton`/`ErrorBanner`; never hand-roll clipboard or debounce.
- **Rejection sampling:** `src/lib/password.js` uses rejection sampling for unbiased crypto RNG.
- **No external font CDN.** Inter and JetBrains Mono are bundled via `@fontsource-variable` (imported in `src/main.jsx`); the variable families register as `'Inter Variable'` / `'JetBrains Mono Variable'` and lead the font tokens in `design-tokens.css`. The air-gap claim covers typography.
- **Semantic tokens only.** All colors use CSS custom property tokens via Tailwind semantic classes (`bg-surface-1`, `text-accent`, `text-status-error`, etc.). The default Tailwind color palette is intentionally disabled.

## What NOT To Do

- Do not create a backend or API functions
- Do not add analytics, telemetry, or third-party scripts
- Do not hand-roll clipboard copy (`setTimeout(() => setCopied(false), ...)`) — use `useClipboard` or `CopyButton`
- Do not hand-roll debounce (`debounceRef.current = setTimeout(...)`) — use `useDebouncedValue`
- Do not use Tailwind v4 (use v3 with PostCSS)
- Do not modify `.github/workflows/` without explicit approval
- Do not use raw Tailwind palette colors (`slate-*`, `sky-*`, `blue-*`, `red-*`, `green-*`, etc.) — use semantic tokens exclusively
- Do not hand-roll theme switching — use `useTheme` hook
- Do not reintroduce the `.dark` class — themes are driven by the `data-theme` attribute on `<html>`
- Do not add `transition-all` to `<body>` or `<html>` for theme switching — theme toggle must be instant
- Do not use `backdrop-filter` / `backdrop-blur` anywhere except the sticky header
- Do not load fonts from an external CDN (Google Fonts) — fonts are bundled via `@fontsource-variable`; the air-gap claim must survive a DevTools Network-tab check

## Executing a Work Spec

Specs for this repository live in-repo at `docs/specs/` and execute in repo mode.

| Element | Convention |
|---------|-----------|
| Spec | `docs/specs/spec-m<major>-<minor>-<slug>.md` |
| Tracking | One GitHub issue per task. The issue is a stable pointer; the spec is what iterates |
| Branch | `task/<major>-<minor>-<slug>` |
| Gates | One commit per gate, each referencing its gate number (for example `fix(build): track package-lock.json (1.0.2)`) |
| Worklog | `work-logs/worklog-YYYY-MM-DD-<slug>.md`, appended at each gate, sealed at close |
| Review surface | `docs/specs/reviews/review-m<major>-<minor>-<slug>.md`, where the spec ends at an operator decision |
| Close | One pull request carrying `Closes #N`, CI green |

Data decisions first, architecture second, in both commits and the worklog.

**Push posture.** This is a public repository. Gates commit locally and the operator reviews before push. The executor does not push `main`, does not mark a pull request ready, and does not merge.

**Platform-mode work** targeting shared infrastructure or the project wiki stays in the agents-root queue and follows the `spec-startup` and `spec-closeout` skills. A GitHub wiki has no issues and no pull requests, so it cannot run in repo mode.

### Active specs

- `docs/specs/spec-m1-0-release-hardening.md` (Task 1.0): lockfile and clean-clone Docker build, browser smoke suite, CSP asserted by value, licensing, identity and version reconciliation
- `docs/specs/spec-m1-1-tool-documentation.md` (Task 1.1): per-tool reference docs against a template, registry-driven completeness gate, docs index, self-hosting guide

### Archived specs

Earlier specifications live at the agents root (`/opt/agents/repos/spec/2026-MM/`) and are reference documents for completed work:

- `2026-06/2026-06-21-opstoolbox-spec-01-sentinel-pattern-maturation.md` — `data-theme` mechanism, High-Contrast Slate, accessibility baseline, StatusBadge, typography discipline
- `2026-06/2026-06-24-opstoolbox-spec-01-launch-ux.md` — MAC removal, scannable directory, social cards, `/about`, scaffolding
- `2026-06/2026-06-24-opstoolbox-spec-02-oss-readiness.md` — markdownify README, self-host Docker image with SPA-aware nginx, OG social card
- `2026-06/2026-06-25-opstoolbox-spec-05-fonts-and-discoverability.md` — bundled `@fontsource-variable` fonts, build-time `sitemap.xml`/`llms.txt`/`robots.txt`, docs sweep
- Earlier work (original tool implementations, v3 architecture fixes, primitives migration, v4 design system) predates the agents-root spec archive.

## Execution Environment

**Primary execution:** ML01 (`/opt/agents/repos/ops-toolbox/`)
**Agent runtime:** OpenCode (global config at `~/.config/opencode/opencode.json`)
**Session management:** aoe (Agent of Empires)
**Strategic work:** Claude.ai Projects
**Agentic coding:** Claude Code, OpenCode

## Repository Structure

```
ops-toolbox/
├── .github/
│   └── workflows/                  # Azure Static Web Apps CI/CD
├── assets/                         # Repository images (logo source copy)
├── docs/
│   ├── apps/                       # Tool reference documentation
│   ├── design/                     # Contrast standard, typography roles
│   ├── documentation-standards/    # Templates, tagging strategy
│   └── specs/                      # In-repo work specs and review surfaces
├── internal-files/                 # Working documents (contents gitignored)
├── plans/                          # Development planning
├── public/                         # Build-served static assets (logo, favicon, og card, robots.txt)
├── scripts/                        # Build scripts (per-route prerender, OG card, sitemap/llms meta generator)
├── shared/                         # Cross-project utilities
├── src/
│   ├── components/                 # Shared UI components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Pure utility functions (no React)
│   ├── pages/                      # Non-tool pages (About)
│   ├── styles/                     # Design tokens + accessibility baseline CSS
│   └── tools/                      # One React component per tool (24 tools)
├── staging/                        # Staged work (contents gitignored)
├── tests/                          # Vitest test suites
├── work-logs/                      # Repo-local development history
├── AGENTS.md                       # This file
├── CLAUDE.md                       # Pointer to AGENTS.md
├── index.html                      # SPA entry point + per-route social-card meta
├── package.json
├── vite.config.js
├── tailwind.config.js
├── staticwebapp.config.json        # Azure SWA routing config
├── LICENSE                         # MIT
└── README.md
```

## Conventions

- **Documentation:** Use templates from `docs/documentation-standards/`
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, `test:`)
- **JSDoc:** All source files have `@file` headers
- **Frontmatter:** YAML frontmatter with tags from `docs/documentation-standards/tagging-strategy.md`
- **Interior READMEs:** Every directory has one

## Related Repositories

| Repository | Relationship |
|-----------|-------------|
| `proxmox-astronomy-lab` | Infrastructure context |
| `project-template-repository` | Base scaffolding patterns |
