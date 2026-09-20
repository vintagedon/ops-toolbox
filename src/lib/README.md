<!--
---
title: "Library"
description: "Pure utility functions for Ops Toolbox tools"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: utilities
---
-->

# Library

Pure utility functions with zero React dependencies. Each module exports functions that transform inputs to outputs — no state, no DOM, no side effects. This separation enables fast unit tests and clean reuse across tool components.

---

## 1. Contents

| Module | Purpose |
|--------|---------|
| `toolRegistry.js` | Canonical tool metadata and query helpers |
| `password.js` | Cryptographic password/passphrase generation (rejection sampling) |
| `secretBatch.js` | CSV serialization for generated secret batches |
| `subnet.js` | IPv4 CIDR math, subnet info, and interactive tree model |
| `epochUtils.js` | Unix epoch ↔ human date conversion with timezone support |
| `csvToJson.js` | CSV parsing wrapper (PapaParse) with delimiter detection |
| `url-parser.js` | URL component extraction via native URL API |
| `base64.js` | Base64 encode/decode with Unicode handling |
| `asciiBanner.js` | ASCII art generation via figlet |
| `bcryptUtils.js` | Bcrypt hash and verify (bcryptjs) |
| `chmod.js` | Unix permission conversion: octal ↔ symbolic ↔ bitmask |
| `cronUtils.js` | Cron expression parsing and human-readable description |
| `fileHash.js` | File hashing: MD5, SHA-1, SHA-256, SHA-512 |
| `jsonDiff.js` | JSON structural diff (jsondiffpatch) |
| `mac.js` | MAC address normalization and OUI extraction |
| `markdownUtils.js` | Markdown rendering with DOMPurify sanitization |
| `regexTester.js` | Regex matching with capture group extraction |
| `sqlFormat.js` | SQL formatting (sql-formatter) |
| `uuidUtils.js` | UUID v4 and v7 generation |
| `x509.js` | X.509 PEM certificate parsing (pkijs/asn1js) |
| `urlEncoder.js` | URL component encoding/decoding |
| `wordlist.js` | EFF short wordlist (1296 words) for passphrases |
| `wordlists.js` | Passphrase wordlist metadata and lazy-loading entrypoint |
| `wordlist-eff-long.js` | Canonical EFF long wordlist (7776 words) |
| `wordlist-diceware.js` | Canonical original Diceware/Reinhold list (7776 entries) |

---

## 2. Related

| Document | Relationship |
|----------|--------------|
| [Source Root](../README.md) | Parent directory |
| [Tests](../../tests/lib/) | Unit tests for these modules |
| [Tool Reference](../../docs/apps/tool-reference.md) | How tools use these functions |
