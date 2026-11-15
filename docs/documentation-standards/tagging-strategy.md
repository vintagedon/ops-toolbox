<!--
---
title: "Tagging Strategy"
description: "Controlled vocabulary for document classification in ops-toolbox"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-03-29"
version: "2.0"
tags:
  - type: guide
  - domain: documentation
related_documents:
  - "[Interior README Template](interior-readme-template.md)"
  - "[General KB Template](general-kb-template.md)"
  - "[Worklog README Template](worklog-readme-template.md)"
---
-->

# Tagging Strategy

## 1. Purpose

Controlled tag vocabulary for the ops-toolbox repository. Consistent tagging enables human navigation and RAG system retrieval.

---

## 2. Why Controlled Vocabulary

Uncontrolled tagging leads to synonyms fragmenting search, inconsistent granularity, and tag proliferation that reduces signal. A controlled vocabulary defines allowed values upfront, ensuring consistency across contributors and time.

---

## 3. Tag Categories

| Category | Question Answered | Required |
|----------|-------------------|----------|
| `type` | What kind of document is this? | Yes |
| `domain` | What subject area? | Yes |
| `status` | What's the lifecycle state? | Recommended |
| `tech` | What technologies involved? | When applicable |

---

## 4. Domain Tags

| Tag | Use For | Boundary |
|-----|---------|----------|
| `networking` | Subnet calculator, CIDR expander, MAC vendor lookup | Network-related tools |
| `security` | JWT decoder, password generator, SSH keygen, X.509, hashing, bcrypt | Security and cryptography tools |
| `data` | JSON/YAML, Base64, JSON diff, CSV to JSON, SQL formatter | Data conversion and formatting tools |
| `developer` | Mermaid, URL parser, UA decoder, chmod, cron, regex, UUID, epoch, markdown | Developer utility tools |
| `architecture` | SPA structure, routing, code splitting, tool registry, design tokens | Application architecture and patterns |
| `components` | Shared UI (CopyButton, ErrorBanner, ResultPanel, ToolLayout, SettingsFlyout) | Reusable React components |
| `hooks` | useClipboard, useDebouncedValue, useTheme, useDensity, useFontFamily | Custom React hooks |
| `design-system` | HSL tokens, semantic classes, dual-theme, density, typography | Visual design system and theming |
| `testing` | Vitest suites, pattern absence tests, test utilities | Test infrastructure and coverage |
| `documentation` | Templates, standards, meta-content about the repo itself | Docs about docs |

---

## 5. Type Tags

| Tag | Use For |
|-----|---------|
| `project-root` | Repository root README |
| `directory-readme` | Interior README for any directory |
| `worklog` | Work log entries and milestone documentation |
| `tool-reference` | Individual tool documentation |
| `guide` | Step-by-step procedures and how-to documents |
| `reference` | Lookup information: architecture, API, design tokens |
| `specification` | Feature specs (v2, v3, v3.1, v4) |

---

## 6. Status Tags

| Tag | Description |
|-----|-------------|
| `draft` | In development, not yet complete |
| `active` | Current, maintained |
| `under-review` | Review in progress |
| `deprecated` | Superseded, avoid for new work |
| `archived` | Historical reference only |

---

## 7. Tech Tags

| Tag | Technology |
|-----|-----------|
| `react` | React 18 components and hooks |
| `vite` | Vite 8 build tooling |
| `tailwind` | Tailwind CSS v3 styling |
| `vitest` | Vitest test framework |
| `javascript` | JavaScript source files |
| `css` | CSS custom properties and design tokens |
| `azure-swa` | Azure Static Web Apps deployment |
| `bash` | Shell scripts |

---

## 8. Implementation

### Standard Frontmatter

```yaml
<!--
---
title: "Document Title"
description: "What this document covers"
author: "VintageDon (https://github.com/vintagedon/)"
date: "YYYY-MM-DD"
version: "1.0"
status: "Active"
tags:
  - type: tool-reference
  - domain: security
  - tech: [react, javascript]
related_documents:
  - "[Related Doc](path/to/doc.md)"
---
-->
```

### Conventions

- Use lowercase, hyphenated values
- Tech tags use canonical names
- One value per line for readability, or array syntax for multi-value
- `related_documents` links use relative paths within the repo

---

## 9. Maintaining the Vocabulary

- This document is the authoritative source for allowed tag values
- Prefer broader tags over proliferating specific ones
- Check for existing coverage before adding new tags
- Backfill existing documents when adding new tags

---

## 10. References

| Resource | Description |
|----------|-------------|
| [Interior README Template](interior-readme-template.md) | Shows tag usage in directory READMEs |
| [General KB Template](general-kb-template.md) | Shows tag usage for standalone docs |
| [Worklog README Template](worklog-readme-template.md) | Shows tag usage for work log entries |
