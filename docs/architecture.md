<!--
---
title: "Architecture Overview"
description: "Technical architecture of the Ops Toolbox SPA"
author: "vintagedon"
date: "2026-06-25"
version: "1.1"
status: "Active"
tags:
  - type: reference
  - domain: shared
  - tech: [react, vite, tailwind, vitest]
  - audience: intermediate
related_documents:
  - "[Root README](../README.md)"
  - "[Tool Reference](apps/tool-reference.md)"
  - "[Tool Registry](../src/lib/toolRegistry.js)"
---
-->

# Architecture Overview

Technical architecture for the Ops Toolbox SPA. Covers the application structure, data flow, shared primitives, and testing strategy.

---

## 1. Purpose

Provide contributors and AI agents with a map of how the codebase fits together — where to find things, how tools are wired up, and what conventions to follow when adding or modifying tools.

---

## 2. Scope

- Application entry and routing
- Tool registry pattern
- Component and library separation
- Shared hooks and components
- Testing strategy and conventions

---

## 3. Audience

Contributors, maintainers, and AI coding assistants working on this repository. Assumes familiarity with React, Vite, and component-based architecture.

---

## 4. Application Structure

### Entry Flow

```
index.html → src/main.jsx → src/App.jsx → React Router v7
```

- **`main.jsx`** — Mounts `<App />` into the DOM with `StrictMode` and `BrowserRouter`
- **`App.jsx`** — Defines all routes using the tool registry. Each tool is `React.lazy()` loaded via a component map keyed by registry `id`
- **`ToolLayout.jsx`** — Shared layout wrapper with sticky header, "All Tools" nav link, and footer. Renders child routes via `<Outlet />`

### Routing

Routes are generated from `toolRegistry` entries:

```
/                     → DirectoryGrid (home page)
/<tool.path>          → React.lazy(() => import(tool component))
*                     → NotFound (404)
```

The catch-all `*` route renders inside `ToolLayout`, preserving the header/footer chrome on 404 pages.

---

## 5. Tool Registry

`src/lib/toolRegistry.js` is the **single source of truth** for all tool metadata. It's a data-only module (no React imports) so it can be consumed from anywhere: routing, directory grid, badges, tests, documentation.

### Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier, used as component map key |
| `name` | string | Display name |
| `description` | string | One-line description |
| `path` | string | URL path segment (no leading slash) |
| `category` | string | Grouping: Networking, Security, Data, Developer |
| `componentPath` | string | Relative import path from src/ |
| `processingMode` | string | `local`, `remote`, or `hybrid` |
| `offlineCapable` | boolean | Whether the tool works without network |
| `status` | string | `stable`, `beta`, or `experimental` |

### Query Helpers

- `getCategories()` — unique categories in display order
- `getToolsByCategory(category)` — filter by category
- `getToolByPath(path)` — find by URL path
- `getToolCount()` — total count
- `getRemoteTools()` — tools needing network
- `getToolsByStatus(status)` — filter by stability

---

## 6. Separation of Concerns

### `src/lib/` — Pure Functions

Business logic with zero React dependencies. Each module exports functions that transform inputs to outputs — no state, no DOM, no side effects. This enables:

- Fast unit tests (no DOM rendering)
- Reuse across components
- Clear API boundaries

Examples: `subnet.js` (CIDR math), `password.js` (crypto generation), `epochUtils.js` (date conversion).

### `src/tools/` — Tool Components

One React component per tool. Each tool:

- Manages its own local state
- Imports pure logic from `src/lib/`
- Uses shared hooks (`useClipboard`, `useDebouncedValue`)
- Uses shared components (`CopyButton`, `ErrorBanner`, `ResultPanel`)

### `src/components/` — Shared UI

Reusable components used across multiple tools:

| Component | Purpose |
|-----------|---------|
| `CopyButton` | One-click clipboard copy with "Copied!" feedback |
| `ErrorBanner` | Inline error display with optional dismiss |
| `ResultPanel` | Read-only output panel with optional copy |
| `ToolLayout` | App shell with header, nav, footer |
| `DirectoryGrid` | Home page with category-grouped tool cards |
| `NotFound` | 404 page with random tool suggestions |

### `src/hooks/` — Custom Hooks

| Hook | Purpose |
|------|---------|
| `useClipboard(resetMs)` | Async clipboard write with auto-reset boolean |
| `useDebouncedValue(value, delayMs)` | Debounce any value with configurable delay |

---

## 7. Shared Primitives Pattern

Tools previously had hand-rolled clipboard and debounce logic (each with `setTimeout` + state management). The v3.1 migration standardized these into shared primitives:

**Clipboard** — Two migration paths:
- **Path A (CopyButton):** Drop-in `<CopyButton text={value} />` when a standalone copy button fits
- **Path B (useClipboard):** `const { copy, copied } = useClipboard()` when the button needs custom styling or multiple copy targets exist

**Debounce** — Replace manual `debounceRef.current = setTimeout(...)` with `useDebouncedValue(input, delayMs)`. The hook returns the debounced value; a `useEffect` on the debounced value handles the computation.

---

## 8. Testing Strategy

### Framework

- **Vitest** — Test runner (globals mode, jsdom environment)
- **@testing-library/react** — Component testing
- **@testing-library/jest-dom** — DOM matchers

### Test Organization

```
tests/
├── lib/              # Pure function tests (fast, no DOM)
├── tools/            # Tool component tests
├── components/       # Shared component tests
├── hooks/            # Custom hook tests (renderHook)
└── migration/        # Pattern absence tests (no banned patterns)
```

### Conventions

- Pure logic tests: import function, assert output. No mocking needed.
- Component tests: render with `@testing-library/react`, query by role/text, simulate user events.
- Hook tests: `renderHook` with `act()` for state changes, `vi.useFakeTimers()` for timing.
- Pattern absence tests: scan source files with regex to ensure banned patterns (hand-rolled clipboard, manual debounce) don't recur.

### Running

```bash
npm run test          # Single run
npm run test:watch    # Watch mode
```

---

## 9. Build and Deploy

### Build Pipeline

The `npm run build` script is a three-stage chain:

```
vite build  →  scripts/prerender.mjs  →  scripts/generate-meta.mjs
```

1. **`vite build`** — React plugin with automatic JSX runtime; bundles the SPA and the variable UI fonts (Inter + JetBrains Mono via `@fontsource-variable`) into hashed assets under `dist/assets/`. Emits the SPA shell `dist/index.html` and copies `public/` (logo, favicon, `og.png`, `robots.txt`) to the dist root.
2. **`scripts/prerender.mjs`** — walks `toolRegistry` and writes one prerendered `index.html` per route (home, every tool, `/about`) with route-specific `<title>`, Open Graph, Twitter, and canonical meta canonical to `opstoolbox.dev`. No server, no runtime network call.
3. **`scripts/generate-meta.mjs`** — walks the same registry and writes `dist/sitemap.xml` (one `<url>` per route, no `lastmod`/`changefreq`/`priority`) and `dist/llms.txt` (llmstxt.org format: registry-derived per-tool bullets + an About link + a GitHub repo link).

### Fonts

Inter and JetBrains Mono are bundled, not fetched. They are imported in `src/main.jsx` and register as `'Inter Variable'` / `'JetBrains Mono Variable'`, which lead the `--font-family-sans` / `--font-family-mono` token stack. The build emits the woff2 files directly, so the unconditional client-side / air-gap claim survives a DevTools Network-tab check.

### Deployment

- **Primary:** Azure Static Web Apps via GitHub Actions (push to `main`)
- **Self-host:** Multi-stage Docker image that builds the SPA and serves the prerendered site from nginx (`docker compose up --build`)
- **Manual:** Upload `dist/` to any static host, or serve it from a local HTTP server for air-gapped use

### SPA Routing and Static-Asset Serving

Both serving tiers are configured so discoverability files and the social card are served as themselves rather than the SPA shell:

- **Azure:** `staticwebapp.config.json` lists per-route rewrites to the prerendered HTML, and `navigationFallback.exclude` carries `/*.txt`, `/*.xml`, `/*.png` (plus `*.svg`/`*.ico`) so the shell fallback never swallows `robots.txt`, `sitemap.xml`, or `og.png`.
- **nginx:** `docker/nginx.conf` serves prerendered route HTML first and falls back to the SPA shell for unknown paths; a static-file location matches `png|ico|svg|webmanifest|txt|webp|xml` and serves those directly with `try_files $uri =404`.

---

## 10. References

| Resource | Description |
|----------|-------------|
| [Tool Registry](../src/lib/toolRegistry.js) | Canonical tool metadata |
| [Tool Reference](apps/tool-reference.md) | Per-tool documentation |
| [React Router v7](https://reactrouter.com/) | Client-side routing |
| [Vitest](https://vitest.dev/) | Test framework |
| [Tailwind CSS v3](https://v3.tailwindcss.com/) | Utility-first CSS |

---

## 11. Document Info

| | |
|---|---|
| Author | vintagedon |
| Created | 2026-03-16 |
| Updated | 2026-06-25 |
| Version | 1.1 |
