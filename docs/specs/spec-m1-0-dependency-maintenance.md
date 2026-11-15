---
title: "1.0 Dependency maintenance"
description: "Qualify remaining major dependency upgrades before feature work"
date: "2026-11-14"
status: "draft"
tags:
  - type: specification
  - domain: security
---

# 1.0 Dependency maintenance

## Outcome and scope

Remove the remaining audited dependency findings with verified upgrades while
preserving all 24 tools and their routes. The November closeout tracks a lockfile,
uses npm 12.0.2 in CI/Docker, and applies compatible fixes. Its audit has seven
affected package entries: three low, three moderate, one high; none critical.
This is not seven distinct application exploits.

Vite 5/esbuild findings concern development servers and editor integration; deployed
sites serve static files through nginx/Azure. React Router's redirect finding needs
attacker-controlled navigation destinations; current destinations come from the
static registry. Its SSR error-deserialization finding excludes this declarative
BrowserRouter app. KaTeX's issue requires preexisting prototype pollution or
attacker-controlled option prototypes; no such path was established in closeout.
These are applicability assessments, not a claim that the packages are patched.

Production run [43659514318](https://github.com/vintagedon/ops-toolbox/actions/runs/43659514318)
also reported CI maintenance warnings: checkout/setup-node action runtime
deprecation, inputs `skip_api_build` and `production_branch` not declared by the
resolved Azure deploy action, and an upcoming `ubuntu-latest` image migration.
These did not stop deployment; that run failed later on the public robots.txt
content check, repaired separately. Inventory the action versions, declared inputs,
effective deployment behavior and runner image before proposing a workflow repair.
The closeout's approval for locked installs and timeouts does not authorize these
additional workflow changes; present the concrete diff for operator approval under
AGENTS.md. Verify production/preview routing and preview cleanup after any repair.

## Gates

1. **Inventory and decisions.** Refresh `npm audit --json`, inspect the lockfile and
   upstream fixes. Record exact proposed versions and compatibility for Vite/plugin,
   Vitest, React Router and Mermaid/ELK/KaTeX. Keep React 18 and Tailwind 3 unless a
   separately reviewed requirement proves a change necessary. Do not force a
   transitive override outside its supported range just to silence the audit.
2. **Tooling.** Upgrade Vite and its React plugin together to a supported patched
   combination. Verify Node 22, npm 12.0.2, clean `npm ci`, tests and build. Remove
   existing Vite/oxc plugin deprecation warnings by fixing compatibility. Keep the
   development server local; never serve it through the shared nginx site.
3. **Runtime dependencies.** Upgrade the router and Mermaid stack independently,
   with a commit and verification for each. Check direct links, not-found handling,
   Mermaid strict security, math, both diagram layouts and image exports. Preserve
   Markdown/JSON HTML sanitization. No unrelated redesign in this gate.
4. **Release proof.** Full tests, production build, Docker build and local runtime,
   all tool routes, no unexpected external browser requests, and fresh audit.
   Record every residual advisory and its applicability; no silent blanket waiver.
   Update stack/version references in AGENTS and docs, review, then PR.

## Acceptance

Clean installs work on CI's Node/npm combination and the documented container.
Audit reports no critical/high runtime findings and no unreviewed findings at any
severity. Target zero findings; if upstream has no compatible repair, the gate
ends with an explicit operator decision rather than claiming zero. Keep built
artifacts and private input out of Git. Roll back a failed upgrade by reverting its
gate commit, not by editing the lockfile manually.

## Sources

- [Vite source-map traversal](https://github.com/advisories/GHSA-4w7w-66w2-5vf9)
- [Router navigation](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6)
- [Router hydration](https://github.com/advisories/GHSA-337j-9hxr-rhxg)
- [KaTeX options inheritance](https://github.com/advisories/GHSA-238p-pmpm-9mq7)

Recheck these and the full live audit at execution; this is a November 14 snapshot.
