<!--
---
title: "Tool Reference"
description: "Complete reference for all 25 Ops Toolbox utilities"
author: "vintagedon"
date: "2026-03-16"
version: "1.0"
status: "Active"
tags:
  - type: reference
  - domain: utilities
  - tech: [react, vite]
  - audience: all
related_documents:
  - "[Root README](../../README.md)"
  - "[Architecture](../architecture.md)"
  - "[Tool Registry Source](../../src/lib/toolRegistry.js)"
---
-->

# Tool Reference

Complete reference for all utilities in Ops Toolbox. Each tool runs as a route in the SPA, lazy-loaded on first visit. The canonical source of truth for tool metadata is `src/lib/toolRegistry.js`.

---

## 1. Purpose

Quick lookup for what each tool does, how it works, and what libraries power it. Useful for contributors adding tools, users evaluating capabilities, and AI agents understanding the codebase.

---

## 2. Scope

Covers all 25 tools across 4 categories: Networking, Security, Data, and Developer. For each tool: what it does, processing mode, key library dependencies, and notable implementation details.

---

## 3. Audience

Users, contributors, and AI coding assistants working in this repository.

---

## 4. Networking Tools

### Subnet Calculator

| | |
|---|---|
| **Route** | `/subnet-calculator` |
| **Source** | `src/tools/SubnetCalculator.jsx` + `src/lib/subnet.js` |
| **Mode** | Local |
| **Description** | IPv4 CIDR arithmetic with interactive subnet tree. Enter a CIDR block to see network address, broadcast, host range, subnet mask, and wildcard mask. The tree view supports splitting and joining subnets interactively. |

### CIDR Expander

| | |
|---|---|
| **Route** | `/cidr-expander` |
| **Source** | `src/tools/CidrExpander.jsx` + `src/lib/subnet.js` |
| **Mode** | Local |
| **Description** | Expand a CIDR block into its full IP range. Shows summary (network, broadcast, first/last host, total IPs) and enumerates individual addresses for blocks up to /22 (1024 IPs). Larger blocks show summary only. |

---

## 5. Security Tools

### JWT Decoder

| | |
|---|---|
| **Route** | `/jwt-decoder` |
| **Source** | `src/tools/JwtDecoder.jsx` |
| **Library** | `jwt-decode` |
| **Mode** | Local |
| **Description** | Paste a JWT to inspect header and payload claims. Decodes without verification (no secret needed). Shows expiration status and formatted JSON for both sections. |

### Password Generator

| | |
|---|---|
| **Route** | `/password-generator` |
| **Source** | `src/tools/PasswordGenerator.jsx` + `src/lib/password.js` + `src/lib/wordlists.js` + `src/lib/secretBatch.js` |
| **Mode** | Local |
| **Description** | Two modes: random passwords (8–128 chars, configurable character pools) and passphrases. Uses Web Crypto API with **rejection sampling** to eliminate modulo bias. Displays entropy in bits with strength indicator. |
| **Word lists** | Three selectable lists, loaded lazily: EFF Short 2.0 (1,296 words, bundled), EFF Long (7,776 words), and Original Diceware (7,776 entries). Passphrase entropy is `wordCount × log2(list size)`, computed from each list's true size. |
| **Separator policy** | Separators: hyphen, dot, underscore, space, and none. A separator is offered for a list and capitalization setting only when every offered output still maps back to exactly one word sequence (a Sardinas–Patterson unique-decodability test over the rendered list), so the displayed word entropy is the entropy of what was generated. Withdrawn combinations: the dot and none separators on Original Diceware without capitalization, and the none separator on Original Diceware with capitalization; all other list combinations keep all five separators. Withdrawn options are disabled in the selector with a one-line reason ("different word sequences could produce identical output"); if the current selection is withdrawn, it resolves to the first available separator and shows the same reason. |
| **Numeric padding** | Optional 1–12 appended digits (0 means off). The input clamps any typed value into 1–12, and the generator refuses an out-of-range count with an error before generating. Each digit adds `log2(10)` ≈ 3.3 bits of entropy; a word from a 1,296-entry list adds about 10.3 bits and a word from a 7,776-entry list about 12.9 bits, so compare the chosen digit count against those per-word values when deciding how much padding to add. |
| **Batch generation** | Generation count of 1–50; each value is generated independently and duplicates are rejected. Batches render as a table with per-row copy, plus Copy All (newline-joined) and Download CSV (value and entropy columns). Downloaded CSVs are unencrypted secrets on disk — store or delete them carefully. Exports are withheld while a word list loads, so every exported value was generated from the settings currently on screen. |

### SSH Keypair Generator

| | |
|---|---|
| **Route** | `/ssh-keygen` |
| **Source** | `src/tools/SshKeyGenerator.jsx` |
| **Library** | `node-forge` |
| **Mode** | Local |
| **Status** | Beta |
| **Description** | Generate 2048 or 4096-bit RSA keypairs in the browser. Outputs PEM private key and OpenSSH public key. Key generation happens entirely client-side. 4096-bit may take 10–30 seconds. |

### X.509 Parser

| | |
|---|---|
| **Route** | `/x509-parser` |
| **Source** | `src/tools/X509Parser.jsx` + `src/lib/x509.js` |
| **Library** | `pkijs`, `asn1js` |
| **Mode** | Local |
| **Description** | Paste a PEM certificate to extract subject, issuer, serial number, validity dates, public key info, and X.509v3 extensions. Parses the ASN.1 structure client-side. |

### File Hash Calculator

| | |
|---|---|
| **Route** | `/file-hash-calculator` |
| **Source** | `src/tools/FileHashCalculator.jsx` + `src/lib/fileHash.js` |
| **Mode** | Local |
| **Description** | Drop or select a file to compute MD5, SHA-1, SHA-256, and SHA-512 digests. Uses the Web Crypto API for SHA algorithms and js-md5 for MD5. Processes files in-browser with no upload. |

### Bcrypt Verifier

| | |
|---|---|
| **Route** | `/bcrypt-hash-verifier` |
| **Source** | `src/tools/BcryptHashVerifier.jsx` + `src/lib/bcryptUtils.js` |
| **Library** | `bcryptjs` |
| **Mode** | Local |
| **Description** | Two operations: hash a plaintext string with configurable cost factor (4–16), or verify a password against an existing bcrypt hash. All computation is client-side. |

---

## 6. Data Tools

### JSON ↔ YAML

| | |
|---|---|
| **Route** | `/json-yaml` |
| **Source** | `src/tools/JsonYamlConverter.jsx` |
| **Library** | `js-yaml` |
| **Mode** | Local |
| **Description** | Paste JSON or YAML in either pane for bidirectional conversion. Real-time linting with error feedback. Supports nested structures and preserves formatting. |

### Base64 Codec

| | |
|---|---|
| **Route** | `/base64` |
| **Source** | `src/tools/Base64Codec.jsx` + `src/lib/base64.js` |
| **Mode** | Local |
| **Description** | Encode and decode Base64 strings. Handles UTF-8 text and binary data via TextEncoder/TextDecoder. Supports file input for binary encoding. |

### JSON Diff

| | |
|---|---|
| **Route** | `/json-diff` |
| **Source** | `src/tools/JsonDiff.jsx` + `src/lib/jsonDiff.js` |
| **Library** | `jsondiffpatch` |
| **Mode** | Local |
| **Description** | Paste two JSON documents to see a structural diff. Color-coded additions (green), deletions (red), and modifications (yellow). Uses jsondiffpatch for deep object comparison. |

### CSV to JSON

| | |
|---|---|
| **Route** | `/csv-to-json` |
| **Source** | `src/tools/CsvToJson.jsx` + `src/lib/csvToJson.js` |
| **Library** | `papaparse` |
| **Mode** | Local |
| **Description** | Paste CSV or upload a file (up to 5MB). Auto-detects delimiter (comma, semicolon, tab, pipe). Options for header row, dynamic typing, and empty line handling. Output as formatted JSON with download option. |

### SQL Formatter

| | |
|---|---|
| **Route** | `/sql-formatter` |
| **Source** | `src/tools/SqlFormatter.jsx` + `src/lib/sqlFormat.js` |
| **Library** | `sql-formatter` |
| **Mode** | Local |
| **Description** | Paste SQL to pretty-print with proper indentation. Supports multiple dialects: PostgreSQL, MySQL, T-SQL, SQLite, BigQuery, and more. Configurable indent width and uppercase keywords. |


### Text Transformer

| | |
|---|---|
| **Route** | `/text-transformer` |
| **Source** | `src/tools/TextTransformer.jsx` + `src/lib/textTransform.js` |
| **Mode** | Local |
| **Description** | Ordered text transformations with a live preview. Collapse blank lines is enabled on load, including invisible Unicode whitespace. Add, repeat, reorder or disable operations; remove blanks, trim, normalize line endings, dedupe, sort by Unicode code point, change case or find and replace literal text. Apply replaces Input and clears operations; Undo Apply restores both (ten snapshots). Restore original returns to the last imported or pasted baseline after confirmation if edits would be lost. Import one UTF-8 file up to 2 MiB; invalid UTF-8 and NUL bytes are rejected. Copy and Download use only the current valid preview. Download preserves a leading file BOM and the final newline; mixed imported line endings produce an LF notice. All work stays in the browser, with no content persisted. |

---

## 7. Developer Tools

### Mermaid Renderer

| | |
|---|---|
| **Route** | `/mermaid-renderer` |
| **Source** | `src/tools/mermaid-renderer/MermaidRenderer.jsx` + `Editor.jsx` |
| **Library** | `mermaid`, `@mermaid-js/layout-elk`, CodeMirror 6 |
| **Mode** | Local |
| **Description** | Paste mermaid syntax to render diagrams with the ELK layout engine. Produces clean hierarchical layouts with orthogonal edge routing — matches mermaid.live "automatic" mode quality. Export as SVG (copy/download) or PNG (2x resolution). CodeMirror editor with syntax highlighting. See [detailed docs](mermaid-renderer.md). |

### URL Parser

| | |
|---|---|
| **Route** | `/url-parser` |
| **Source** | `src/tools/UrlParser.jsx` + `src/lib/url-parser.js` |
| **Mode** | Local |
| **Description** | Paste a URL to see its components: protocol, hostname, port, path, query string, hash, origin. Query parameters displayed as key-value table. Uses the native `URL` API. |

### User-Agent Decoder

| | |
|---|---|
| **Route** | `/useragent-decoder` |
| **Source** | `src/tools/UserAgentDecoder.jsx` |
| **Library** | `ua-parser-js` |
| **Mode** | Local |
| **Description** | Parse User-Agent strings into browser (name, version, major), engine, OS, device (type, vendor, model), and CPU architecture. Auto-populates with your current browser's UA on load. |

### Chmod Calculator

| | |
|---|---|
| **Route** | `/chmod-calculator` |
| **Source** | `src/tools/ChmodCalculator.jsx` + `src/lib/chmod.js` |
| **Mode** | Local |
| **Description** | Bidirectional Unix permission converter. Edit octal (e.g., `755`), symbolic (e.g., `rwxr-xr-x`), or interactive checkbox grid — all three stay in sync. Shows the `chmod` command to run. |

### URL Encoder

| | |
|---|---|
| **Route** | `/url-encoder` |
| **Source** | `src/tools/UrlQueryEncoder.jsx` + `src/lib/urlEncoder.js` |
| **Mode** | Local |
| **Description** | Encode/decode URL components using `encodeURIComponent`/`decodeURIComponent`. Also supports full URL parsing and query string building from key-value pairs. |

### Cron Parser

| | |
|---|---|
| **Route** | `/cron-parser` |
| **Source** | `src/tools/CronParser.jsx` + `src/lib/cronUtils.js` |
| **Library** | `cronstrue` |
| **Mode** | Local |
| **Description** | Enter a cron expression (5 or 6 fields) to see a human-readable description and preview the next scheduled run times. Uses cronstrue for natural language translation. |

### Regex Tester

| | |
|---|---|
| **Route** | `/regex-tester` |
| **Source** | `src/tools/RegexTester.jsx` + `src/lib/regexTester.js` |
| **Mode** | Local |
| **Description** | Enter a regex pattern and test string to see all matches highlighted with capture groups. Supports flags (g, i, m, s, u). Shows match index, full match, and named/numbered groups. |

### ASCII Banner

| | |
|---|---|
| **Route** | `/ascii-banner` |
| **Source** | `src/tools/AsciiBanner.jsx` + `src/lib/asciiBanner.js` |
| **Library** | `figlet` |
| **Mode** | Local |
| **Description** | Type text to generate terminal-style ASCII art banners. Multiple figlet fonts available. Configurable output width and horizontal layout. |

### UUID Generator

| | |
|---|---|
| **Route** | `/uuid-generator` |
| **Source** | `src/tools/UuidGenerator.jsx` + `src/lib/uuidUtils.js` |
| **Library** | `uuid` |
| **Mode** | Local |
| **Description** | Generate cryptographically secure UUIDs. Supports v4 (random) and v7 (timestamp-ordered). Configurable quantity (1–100), uppercase option, and bulk copy. |

### Unix Epoch

| | |
|---|---|
| **Route** | `/epoch-time` |
| **Source** | `src/tools/UnixEpochTool.jsx` + `src/lib/epochUtils.js` |
| **Mode** | Local |
| **Description** | Bidirectional epoch converter with live counter. Epoch → human: auto-detects seconds vs milliseconds, shows in multiple timezones (UTC, local, NYC, London, Tokyo), ISO 8601, and relative time. Human → epoch: supports datetime picker and ISO/natural date input. |

### Markdown Previewer

| | |
|---|---|
| **Route** | `/markdown-previewer` |
| **Source** | `src/tools/MarkdownPreviewer.jsx` + `src/lib/markdownUtils.js` |
| **Library** | `marked`, `dompurify` |
| **Mode** | Local |
| **Description** | Live Markdown editor with GFM support. Rendered HTML is sanitized through DOMPurify to prevent XSS. Toggle GFM and line breaks. Copy source markdown or rendered HTML. |

---

## 8. Adding a New Tool

1. Add an entry to `src/lib/toolRegistry.js` with all required fields
2. Create the component in `src/tools/YourTool.jsx`
3. Add a lazy import mapping in `src/App.jsx` keyed to the registry `id`
4. Extract pure logic to `src/lib/yourLogic.js` where applicable
5. Write tests in `tests/lib/` and/or `tests/tools/`
6. Run `npm run test` to verify

See `toolRegistry.js` for the full schema: `id`, `name`, `description`, `path`, `category`, `componentPath`, `processingMode`, `offlineCapable`, `status`.

---

## 9. Document Info

| | |
|---|---|
| Author | vintagedon |
| Created | 2026-03-16 |
| Updated | 2026-09-26 |
| Version | 1.0 |
