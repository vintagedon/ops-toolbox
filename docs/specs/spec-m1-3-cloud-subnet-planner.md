---
title: "1.3 Cloud subnet planner"
description: "Local IPv4 planning with provider rules, a visual address map and exports"
date: "2026-11-14"
status: "draft"
tags:
  - type: specification
  - domain: networking
---

# 1.3 Cloud subnet planner

## Outcome and boundary

Extend the existing subnet splitter in place. Keep its URL, split/join operations,
notes and subnet identifiers while improving the presentation. Offer generic,
AWS, Azure and GCP planning profiles. All calculations are local in both editions.
There is no cloud account login, import, provisioning or resource discovery.

Initial cloud mode supports standard **private IPv4** subnets contained within one
RFC1918 block. Do not claim support for every provider-supported address range.
Reject non-private ranges in cloud mode with a scope explanation; generic mode
retains full IPv4 arithmetic. IPv6, BYOIP, GCP secondary ranges, service-specific
subnet reservations and account/region quotas are deferred.

| Profile | Standard size rule | Reserved addresses |
|---|---|---|
| Generic | /0–/32 | First/last, except /31 has 2 usable and /32 has 1 |
| AWS | /16–/28 | First four and last one |
| Azure | /2–/29 provider size bound; private-range containment also applies | First four and last one |
| GCP primary | /4–/29 provider size bound; private-range containment also applies | First two and last two |

Rules were checked November 14, 2026 against
[AWS](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html),
[Azure](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-faq)
and [GCP](https://docs.cloud.google.com/vpc/docs/subnets). Keep a bundled source/date
record. No runtime fetch for rules. Recheck official sources at implementation.
Show total, reserved and assignable counts separately: a /24 is 254 generic,
251 AWS/Azure and 252 GCP-primary assignable addresses. Do not call these counts
actual utilization or certify that a cloud deployment will succeed.

## Data and interaction

Parse IPv4 and prefix strictly; reject partial numbers and out-of-range values.
Canonicalize host bits before storing, splitting or exporting and display the
normalization. Extract profile rules and calculations into pure modules. Shared
`subnet.js` changes must preserve CIDR Expander behavior with explicit regression
tests, including /0, /31, /32 and unsigned boundaries.

Keep a labelled table plus a proportional address-space map with keyboard-accessible
subnet selection. Colors use semantic tokens and labels/patterns; information must
remain understandable without color. Tiny subnets remain selectable through the
table, not misleading minimum-width blocks. Distinguish parent containers from
leaf subnets: reserved counts apply only to leaves. Max 1,024 leaves; refuse a
split beyond the limit. Switching profile revalidates the whole plan, preserves
input/notes, marks invalid leaves and disables exports claiming a valid plan.

Joining discards descendants only after confirmation when they contain notes;
provide undo for the last split/join/profile change. Do not enumerate every address.
No input persistence without an explicit save. JSON plan schema v1 includes root,
profile, rule revision, hierarchy and notes; derived counts are recomputed on import.
Reject invalid/overlapping/out-of-parent leaves and files over 2 MiB before mutation.

## Gates and acceptance

1. **Math and profiles.** Fix strict parsing/canonicalization with failing tests,
   then implement provider tables, bounds, reservations and overlap validation.
   Test minimum/maximum sizes and profile changes across an existing split tree.
2. **Workspace and map.** Adopt Sentinel controls and chart/frame/export patterns
   from spec 1.1's pinned baseline. An SVG address map is sufficient; do not add a
   chart engine solely for rectangles. Verify split/join/undo, notes and accessible
   table/map selection at 320 px and desktop in all themes.
3. **Exports.** Save/load JSON plan, CSV leaf table, SVG map and print view. Include
   profile/rule date/legend in visual exports; neutralize spreadsheet formula
   prefixes in user labels/notes. SVG must escape notes and contain its needed
   styles. PNG and infrastructure-as-code exports are later enhancements.
4. **Qualification.** Full tests/build; JSON round trip, malformed import leaves
   state intact, CSV hostile-note fixture, SVG open outside the app, printed table
   readability, keyboard use, large tree and disconnected runtime checks.
