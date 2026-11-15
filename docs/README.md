<!--
---
title: "Documentation"
description: "Project documentation, standards, and reference materials"
author: "vintagedon"
date: "2026-03-16"
version: "1.2"
status: "Active"
tags:
  - type: directory-readme
  - domain: documentation
---
-->

# Documentation

Project documentation including tool reference, architecture overview, templates, and standards.

---

## 1. Contents

```
docs/
├── architecture.md                 # SPA architecture overview
├── specs/                          # Weekend release specifications (draft)
├── apps/                           # Tool documentation
│   ├── tool-reference.md           # Complete reference for all 25 tools
│   ├── mermaid-renderer.md         # Detailed Mermaid Renderer guide
│   └── README.md
├── documentation-standards/        # Template library and guidelines
│   ├── primary-readme-template.md
│   ├── interior-readme-template.md
│   ├── general-kb-template.md
│   ├── worklog-readme-template.md
│   ├── script-header-*.md
│   ├── tagging-strategy.md
│   └── README.md
└── README.md                       # This file
```

---

## 2. Subdirectories

| Directory | Description |
|-----------|-------------|
| [apps/](apps/README.md) | Tool reference documentation |
| [specs/](specs/README.md) | Sequenced release specifications and acceptance gates |
| [documentation-standards/](documentation-standards/README.md) | Template library for READMEs, KB articles, script headers, and tagging |

---

## 3. Key Documents

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | SPA structure, routing, registry, testing strategy |
| [Tool Reference](apps/tool-reference.md) | All 25 tools: routes, sources, libraries, descriptions |
| [Mermaid Renderer](apps/mermaid-renderer.md) | Detailed guide for the diagram renderer |

---

## 4. Related

| Document | Relationship |
|----------|--------------|
| [Repository Root](../README.md) | Parent directory |
| [AGENTS.md](../AGENTS.md) | AI agent instructions |
| [Source Code](../src/README.md) | Application source |
