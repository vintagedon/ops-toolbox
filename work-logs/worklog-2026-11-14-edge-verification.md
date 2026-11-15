---
title: "Cloudflare edge verification closeout"
description: "Recognize managed robots.txt additions while retaining origin content checks"
date: "2026-11-14"
status: "under-review"
tags:
  - type: worklog
  - domain: testing
---

# Cloudflare edge verification closeout

The operator explicitly approved merging PR #7 and closing superseded PR #8.
PR #7 merged as `a103ffc93b66f72f8df06b0db78af3d8ce515a23`; the primary checkout
is clean on main and its fresh install, 537 tests and production build pass.
ML01a serves that commit and verifies all 143 file hashes. PR #8 is closed.

Production run [43659514318](https://github.com/vintagedon/ops-toolbox/actions/runs/43659514318)
successfully built, deployed, and verified all files at the Azure origin. Its final
public-domain step failed because Cloudflare prepends its managed crawler policy
to robots.txt. The deployed manifest's 143 hashes match the local main build;
the public robots.txt response contains the original file after a marked prefix.
[Cloudflare documents this behavior](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).

## Repair and verification

On branch `codex/edge-verification-closeout`, the verifier permits only the marked
prefix on HTTPS opstoolbox.dev robots.txt with a Cloudflare text/plain response.
After stripping the prefix, the original bytes must match their recorded SHA-256.
Manifest, application assets, origin and preview checks remain byte-exact. No
Cloudflare setting, crawler policy, application code or workflow file is changed.
The verifier logs the distinction instead of claiming the edge file is byte-exact.

Thirteen regression cases were added. Before repair, the intended positive case
failed with `Content mismatch: robots.txt`; the other 12 tests passed. Independent
review identified malformed UTF-8, duplicate markers, and redirected paths as gaps
in the first implementation. Four additional tests reproduced those failures;
the verifier now requires lossless UTF-8 decoding, unique markers and exact paths.
After repair, all **550 tests across 63 files** pass and the build emits 26 routes. The repaired
verifier checks the live main deployment: **143 files verified**, comprising
142 exact-byte matches and one exact origin-content match behind the marked prefix.
This explicitly does not attest to Cloudflare's independently managed policy text.

Azure environment inspection also found orphan preview `8`, tied to
`fix/swa-token-auth`. That temporary environment was deleted; the subsequent list
contains only production `default`, on main, Ready. Final publication state is recorded
in the follow-up PR and the final closeout receipt.

Execution: ML01a, Codex; exact model identifier and token usage unreported.
The application and dependency behavior is unchanged from the reviewed main build.
Final PR checks and merge remain separate from these local verification results.
