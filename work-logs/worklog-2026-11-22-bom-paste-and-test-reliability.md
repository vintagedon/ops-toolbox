---
title: "Worklog — 1.5 Paste BOM fidelity and test reliability"
spec: "docs/specs/spec-m1-5-bom-paste-and-test-reliability.md"
status: "blocked"
started: "2026-11-22"
finished: "2026-11-22T02:07:40-05:00"
executor:
  model: "unreported"
  runtime: "codex-cli 0.163.0"
  duration: "Total session duration unavailable; recorded clock samples span 16 seconds"
git:
  repo: "/opt/agents/repos/ops-toolbox-task-1-5"
  branch: "task/1-5-bom-paste-and-test-reliability"
  base: "a265781fd244851f0a0edf1af21bd3483f88fceb"
  commit: "Documentation-only stop checkpoint; resolve via git log for this file"
publication:
  status: "pending"
  ref: "Local branch only; no PR created or updated"
---

# Worklog — 1.5 Paste BOM fidelity and test reliability

## Objective and authority

Execute spec 1.5 v0.2 only, under Don's dispatch approval at
2026-11-22 01:34 America/New_York, Action Registry `recqF2TzzUDjAc4su`.
Tracking issue: #19; intended eventual PR also closes #14 and #15.
Run: `opstoolbox15-codex-20261122T070634Z-7f93a7`.
Observed host: `ml01a`; account: `crainbramp`.

## Outcome: stopped before implementation

The dispatch contains a conflict with a frozen validation. Dispatch says
"Network: package registries only." Gate 1.5.4 requires
`git ls-remote origin task/1-5-bom-paste-and-test-reliability` to return empty.
The repository's documented origin is GitHub, not a package registry.
Executing that remote check would exceed the dispatch's network authorization;
omitting or replacing it would leave the validation unable to pass as written.

The dispatch explicitly states: "A validation that cannot pass as written is a
stop condition, not a reason to edit the validation." Stopped on that condition,
without running the remote command, changing the validation, or implementing
any gate. This is a documentation-only stop checkpoint, not a gate completion
or acceptance claim. All four gates remain outstanding.

## Preflight evidence

- Initial working tree was clean; branch and HEAD matched the dispatcher.
- `git rev-parse HEAD` and `git merge-base main HEAD` both returned
  `a265781fd244851f0a0edf1af21bd3483f88fceb`.
- Spec SHA-256 matched the authorized value:
  `48198c0d51bced8149773cb0b7c49b99e2fd0378c22b8466e78747a4b14f84b3`.
- Read the full pinned spec, repository AGENTS.md, workspace AGENTS.md and
  `docs/specs/README.md`; also consulted the host guidance, lifecycle instructions
  and worklog template. The dispatch's narrower scope governs: no central
  registry update, archive relocation, publication, or changes outside Modify.
- `hostname` returned `ml01a`; `id -un` returned `crainbramp`;
  `codex --version` returned `codex-cli 0.163.0`. That CLI command also warned
  that PATH aliases could not be created on a read-only filesystem; no workaround
  was attempted.
- The active runtime does not expose a precise model identifier to this session.
  The dispatch names `gpt-6.1-sol`, reasoning high; those are dispatch metadata,
  not independently observed runtime model facts. No model switch or agent spawn.
- Actual clock samples: `2026-11-22T02:07:24-05:00` and
  `2026-11-22T02:07:40-05:00` (16 seconds). They cover the recording interval,
  not the entire session. No reliable total duration or token/cost data available.

## Gate checkpoints and validation status

| Gate | Status | Gate commit |
|---|---|---|
| 1.5.1 | Not started; B1–B4 and M1 not run | None |
| 1.5.2 | Not started; forced draw, M2 and 100-run soak not run | None |
| 1.5.3 | Not started; A1/A2/U1/U2, M3/M4 and soaks not run | None |
| 1.5.4 | Blocked at preflight by network/validation conflict | None |

No dependency installation, tests, build, preview, browser checks, mutations or
soaks ran. Node/npm parity versions were not measured; none are claimed.
No scratch worktree was created. No remote state was queried; remote branch
absence is unverified. No push or other GitHub operation was attempted.

## Files changed and scope

Only this worklog was added. Source, tests, the pinned spec, package files,
configuration, workflows, instruction files and their case variants remain
unchanged. No repository file was deleted. No primary-checkout file was modified
and no branch was switched. No secrets, auth files or token stores were read;
no `gh` command ran. No out-of-scope code changes are proposed.

## Proposed PR body (held; not ready for publication)

> Execution is blocked before implementation by the conflict between the
> package-registry-only network rule and gate 1.5.4's required GitHub remote
> query. No fixes or validation results are claimed. Replace this paragraph
> with the completed changes and evidence only after authorized execution
> and Claude's local review.
>
> Closes #19
>
> Closes #14
>
> Closes #15

## Operator interactions and resume point

No operator question or new decision occurred during this run. The next decision
is whether to authorize the single read-only GitHub remote query or amend the
required validation. Neither is inferred from the existing dispatch. After that
conflict is resolved, resume at gate 1.5.1 with all validations still required.
Claude reviews the local branch before any publication; an exit code does not
constitute acceptance.

This blocked-run record is sealed. The documentation checkpoint commit can be
located with `git log -1 --format=%H -- work-logs/worklog-2026-11-22-bom-paste-and-test-reliability.md`.

## Resume — opstoolbox15b-codex-20261122T070922Z-e46d58

The earlier sealed stop record above is preserved verbatim. This section resumes
from `6df5981641c2d52ea5e836909623fa24d94c1dc9` under the operator's corrected
network authorization: package registries and read-only GitHub git queries are
allowed; publication remains prohibited. All four gates were outstanding.

Preflight: clean branch `task/1-5-bom-paste-and-test-reliability`, merge-base
`a265781fd244851f0a0edf1af21bd3483f88fceb`, authorized spec SHA-256
`48198c0d51bced8149773cb0b7c49b99e2fd0378c22b8466e78747a4b14f84b3`.
Read the full spec, repo/workspace instructions and spec index; consulted host
contract, local spec-startup/spec-closeout and worklog template. Explicit dispatch
supersedes broader lifecycle publication, archival and central registry writes.
No agents or model switches. Actual host `ml01a`, account `crainbramp`, runtime
`codex-cli 0.163.0`; precise active model is not exposed, recorded as `unreported`
(the user-supplied model is dispatch metadata). Clock sample at preflight:
`2026-11-22T02:09:59-05:00`; toolchain/remote check ended
`2026-11-22T02:10:33-05:00`. These are measured samples, not full session duration.
Parity command `npx -y -p node@22 -p npm@12.0.2 -- sh -c 'node -v && npm -v'`
reported `v22.23.5` / `12.0.2`. Shared Python Playwright reports `1.64.0`,
Chromium path ends `chromium-1248/chrome-linux64/chrome`.
`git ls-remote origin task/1-5-bom-paste-and-test-reliability` exited 0 with
empty output. No push attempted.

### Gate 1.5.1 checkpoint

Data decision: preserve the current source's BOM metadata when pasting, including
select-all replacement. Reuse `editedSource` without the `bom: false` override;
baseline/undo behavior is unchanged. B1/B2 assert exact download hex after an
offset-1 paste, B3 restores the pasted BOM baseline after typing, and B4 asserts
BOM + `fresh` after select-all. Existing BOM + F4 test is unchanged.

Validation will run against this gate commit in a clean detached `/tmp` worktree,
including scratch mutation M1; measured results follow in the next checkpoint.

Gate 1.5.1 validation: clean checkout of candidate `105ce49`, parity
`v22.23.5` / `12.0.2`; `npm ci` passed (375 packages, 0 vulnerabilities),
`npm run test -- tests/tools/TextTransformer.test.jsx` passed 19/19, duration
12.30 s. B1–B4 and the original BOM + F4 test all pass. M1 reinstated the
single `bom: false` override in scratch; targeted B1 exited 1, receiving
`61585962630d0a6465660d0a` instead of `efbbbf61585962630d0a6465660d0a`.
M1 took 2.196 s; source restored byte for byte, SHA-256
`68e0364de8c9fb7c0682ec0efd3d34c54f0f9d8ed534b4e128c92e42be46857a`.
The filtered mutation command selected B1 only; no test was marked skipped or
weakened in source. `git diff main -- src/tools/TextTransformer.jsx` shows
one line changed inside `paste()` only. This checkpoint amends only the gate's
worklog after testing; source/tests are identical to the qualified candidate.
Git needed normal host execution because the sandbox mounted linked-worktree
metadata read-only; escalation was approved. No permission denial was bypassed.
