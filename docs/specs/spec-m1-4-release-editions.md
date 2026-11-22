---
title: "1.4 Full and air-gapped releases"
description: "One source tree with explicit connected capabilities and offline distributions"
date: "2026-11-14"
version: "0.3"
status: "draft"
tags:
  - type: specification
  - domain: architecture
---

# 1.4 Full and air-gapped releases

v0.3 (Claude, 2026-11-22, batch approval `recqF2TzzUDjAc4su`): 1.4 now runs before 1.3. It qualifies the tools registered at its starting commit; the cloud subnet planner joins both editions through spec 1.3, which qualifies it there. Full hardening happens before dispatch.

## Outcome

Produce two independently verified builds from one source commit and lockfile.
The full edition contains local tools plus a DNS Lookup workspace (accepted by the
operator 2026-11-15 05:07 as the first connected tool). The
air-gapped edition contains only tools with local processing and offline support,
as registered at this spec's starting commit. The cloud subnet planner joins both
editions later, through spec 1.3. A local-only filter in the full edition remains
a browsing aid, not a network enforcement switch.

## Connected-tool contract

DNS Lookup is the first connected tool: user-entered domain and A, AAAA,
CNAME, MX, NS or TXT query, explicit **Look up** action, response/status table and
copy/export. Use Cloudflare's documented browser-compatible DNS-over-HTTPS JSON
endpoint after verifying its current CORS behavior and terms at gate 1. Show the
provider and that the entered domain is sent there before the action. Do not send
queries while typing, on page load or automatically retry them. Handle cancellation,
timeout, empty answer, NXDOMAIN, HTTP failure and stale responses. No credentials,
saved query history, proxy, analytics or telemetry. If CORS/terms are unsuitable,
stop at an operator decision with evidence; do not add a backend silently.

## Build and distribution contract

Add explicit `build:full` and `build:airgap` commands. Separate edition entry/registry
generation must exclude connected modules and endpoint strings from airgap output,
including lazy chunks, generated routes, sitemap and llms metadata. Do not rely on
runtime hiding or dead-code elimination without inspecting the built files.
In an airgap build, a direct connected-tool URL displays an edition explanation
without loading connected code. Full edition local tools continue to work when
DNS/network access fails. Update About, footer, README and AGENTS together so their
privacy statements match the edition and tool. Local tools retain zero data
transmission. Do not apply blanket “data never leaves” wording to connected tools.

Ship prebuilt static archives for a **local HTTP server**, with every asset, font,
wordlist and lazy chunk included. No Node/npm/internet is required to run a built
archive. Include nginx configuration and clear local serving instructions. Direct
`file://` use is not promised for this SPA. Also build separately named full and
airgap container images; document offline image transfer through save/load.
Record source SHA, edition, build tooling, hashes and licenses in each release.
Building may access package registries; running airgap artifacts must not.

## Gates and acceptance

1. **Policy/data.** Confirm DNS provider feasibility, metadata/edition schema and
   privacy copy. Add fixtures for local, remote and hybrid admission. Define the
   connected route list centrally; no separate hand-maintained directory counts.
2. **DNS implementation.** Pure response parsing plus lazy UI and a narrow network
   adapter. Tests use deterministic responses for errors/races. A real provider
   query proves browser behavior without making external uptime a unit-test gate.
3. **Edition builds.** Produce separate output directories, manifests, static
   archives and images. Verify no connected route/chunk/endpoint survives airgap.
   Generated page counts and discovery metadata must match each edition registry.
4. **Release qualification.** Use a fresh browser context with no warmed caches;
   allow only the local server and reject every other network request. Visit every
   airgap route and exercise late-loaded wordlists, fonts, diagrams, Text Transformer,
   file imports and downloads. Qualify the tools registered at the starting commit;
   do not build or qualify the cloud planner here. Inspect outgoing attempts, not just success.
   Full edition DNS works online and reports failure offline without harming local
   tools. Reinstall/serve both archives and images from documented instructions.
5. **Publication review.** Document versions, checksum verification and rollback.
   Any CI/release-workflow edit needs explicit workflow approval; upload/release
   publication follows the operator's authorization at that point.

No service worker is necessary for this contract, and a warm browser cache is not
air-gap proof. AI utilities, accounts and paid API integrations remain later work.
