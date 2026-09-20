<!--
---
title: "Scripts"
description: "Build-time scripts for ops-toolbox — prerender, OG card, and discoverability meta generation"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-06-25"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: architecture
  - tech: [vite, javascript, python]
related_documents:
  - "[Architecture Overview](../docs/architecture.md)"
  - "[Tool Registry](../src/lib/toolRegistry.js)"
---
-->

# Scripts

Build-time scripts for ops-toolbox. These run during `npm run build` (or as one-off asset generators) and add no server and no runtime network call — the 100% client-side claim stays literally true.

---

## 1. Contents

```
scripts/
├── prerender.mjs           # Per-route HTML + route-specific social/canonical meta
├── generate_og_card.py     # Composes the 1200x630 OG social card (public/og.png)
├── generate-meta.mjs       # Writes dist/sitemap.xml and dist/llms.txt from the registry
├── verify-deployment.mjs   # Records source revision and checks published file hashes
└── README.md               # This file
```

---

## 2. Files

| File | Description | Status |
|------|-------------|--------|
| [prerender.mjs](prerender.mjs) | Walks `toolRegistry` and writes one prerendered `index.html` per route (home, every tool, `/about`) with route-specific `<title>`, Open Graph, Twitter, and canonical meta canonical to `opstoolbox.dev`. Runs as the second stage of `npm run build`. | Active |
| [generate_og_card.py](generate_og_card.py) | Reproducible generator for the served social card. Its output ships as `public/og.png`; a repository copy lives at `assets/og-banner.png`. Run manually when the card changes. | Active |
| [generate-meta.mjs](generate-meta.mjs) | Walks `toolRegistry` and writes `dist/sitemap.xml` (one `<url>` per route, no `lastmod`/`changefreq`/`priority`) and `dist/llms.txt` (llmstxt.org format: registry-derived per-tool bullets + an About link + a GitHub repo link). Runs as the third stage of `npm run build`. | Active |
| [verify-deployment.mjs](verify-deployment.mjs) | CI records the source commit, run ID, and SHA-256 hashes in `dist/deployment.json`, then checks the manifest and every served file after deployment. Azure's private serving configuration is excluded. A stale build, missing asset, or SPA fallback response fails verification even if deployment reported success. | Active |

---

## 3. Build Order

`npm run build` chains:

```
vite build  →  node scripts/prerender.mjs  →  node scripts/generate-meta.mjs
```

Both `prerender.mjs` and `generate-meta.mjs` import `toolRegistry` from `src/lib/toolRegistry.js` and share the `ORIGIN = 'https://opstoolbox.dev'` constant, so route and URL output never drifts from the registry.

---

## 4. Related

| Document | Relationship |
|----------|--------------|
| [Parent](../README.md) | Repository root |
| [Architecture Overview](../docs/architecture.md) | Section 9 documents the full build pipeline |
| [`src/lib/toolRegistry.js`](../src/lib/toolRegistry.js) | Canonical metadata both registry-walking scripts consume |
