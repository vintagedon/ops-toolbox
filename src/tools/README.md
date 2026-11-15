<!--
---
title: "Tools"
description: "React components for each Ops Toolbox utility"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: utilities
---
-->

# Tools

One React component per utility tool. Each component manages its own local state, imports pure logic from `src/lib/`, and uses shared primitives from `src/components/` and `src/hooks/`.

Tools are lazy-loaded via `React.lazy()` in `App.jsx` — only the visited tool's bundle is fetched.

---

## 1. Contents

| Component | Tool | Category |
|-----------|------|----------|
| `SubnetCalculator.jsx` | Subnet Calculator | Networking |
| `CidrExpander.jsx` | CIDR Expander | Networking |
| `JwtDecoder.jsx` | JWT Decoder | Security |
| `PasswordGenerator.jsx` | Password Generator | Security |
| `SshKeyGenerator.jsx` | SSH Keypair Generator | Security |
| `X509Parser.jsx` | X.509 Parser | Security |
| `FileHashCalculator.jsx` | File Hash Calculator | Security |
| `BcryptHashVerifier.jsx` | Bcrypt Verifier | Security |
| `JsonYamlConverter.jsx` | JSON ↔ YAML | Data |
| `Base64Codec.jsx` | Base64 Codec | Data |
| `JsonDiff.jsx` | JSON Diff | Data |
| `CsvToJson.jsx` | CSV to JSON | Data |
| `SqlFormatter.jsx` | SQL Formatter | Data |
| `TextTransformer.jsx` | Text Transformer | Data |
| `mermaid-renderer/` | Mermaid Renderer | Developer |
| `UrlParser.jsx` | URL Parser | Developer |
| `UserAgentDecoder.jsx` | User-Agent Decoder | Developer |
| `ChmodCalculator.jsx` | Chmod Calculator | Developer |
| `UrlQueryEncoder.jsx` | URL Encoder | Developer |
| `CronParser.jsx` | Cron Parser | Developer |
| `RegexTester.jsx` | Regex Tester | Developer |
| `AsciiBanner.jsx` | ASCII Banner | Developer |
| `UuidGenerator.jsx` | UUID Generator | Developer |
| `UnixEpochTool.jsx` | Unix Epoch | Developer |
| `MarkdownPreviewer.jsx` | Markdown Previewer | Developer |

---

## 2. Related

| Document | Relationship |
|----------|--------------|
| [Source Root](../README.md) | Parent directory |
| [Tool Registry](../lib/toolRegistry.js) | Canonical metadata for all tools |
| [Tool Reference](../../docs/apps/tool-reference.md) | Detailed per-tool documentation |
| [Shared Components](../components/README.md) | CopyButton, ErrorBanner, ResultPanel |
| [Hooks](../hooks/README.md) | useClipboard, useDebouncedValue |
