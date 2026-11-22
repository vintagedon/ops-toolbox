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

### Gate 1.5.2 checkpoint

Gate 1.5.1 sealed commit: `9723bff38f03da115b84c3161d617e41337683ad`.
Data decision: match complete EFF Short entries using an anchored expression
with exact repetition counts, retaining internal hyphens. Capitalized assertions
build alternatives by uppercasing the first character of each full word.
All seven tests run twice: real draws, and a scoped `window.crypto.getRandomValues`
spy filling each typed array with `EFF_SHORT_WORDLIST.indexOf('yo-yo')`.
The forced cases also require the exact repeated `yo-yo` or `Yo-yo` output.
The spy is restored in `finally`. No product logic or wordlists change.

| Changed test (suite / name) | Exact parsing contract |
|---|---|
| generatePassphrase / returns string with correct number of words split by default separator | 6 full list entries joined by hyphens |
| generatePassphrase / default separator is hyphen | 4 full list entries joined by hyphens |
| generatePassphrase / capitalize option capitalizes first letter of each word | 4 capitalized full list entries joined by hyphens |
| rejection sampling / generates correct number of words split by separator | 6 full list entries joined by hyphens |
| rejection sampling / all words in output exist in EFF_SHORT_WORDLIST | 8 full list entries joined by hyphens |
| rejection sampling / default separator is hyphen | 4 full list entries joined by hyphens |
| rejection sampling / capitalize option capitalizes first letter of each word | 4 capitalized full list entries joined by hyphens |

Remaining hyphen splits use only the supplied list `['alpha', 'bravo']`; dot
splits use the default list, whose entries contain no dot. Neither is vulnerable
to internal hyphens. Clean gate checkout validation, M2 and 100 consecutive
password test runs will follow; no retries or relaxed assertions.

Gate 1.5.2 validation: clean candidate `59929ea`, Node `v22.23.5`, npm
`12.0.2`; `npm ci` passed (375 packages, 0 vulnerabilities). Password suite
passed 55/55 (701 ms), including all seven forced-draw variants with capitalization
covered. M2 replaced only the scratch test file with `main`'s version plus the
same index-filling spy scoped to the two parsing suites. All seven original
tests listed above failed: 6 words split into 12 pieces, 4 into 8, membership
reported `yo` absent, and both capitalization tests compared `y` to `Y`.
M2 exited 1, 1.616 s; scratch file restored byte for byte, SHA-256
`8d533d64de851194c182050e3d27907a7e0380bd55541253c71416630440060c`.
The `-t` selection ran the seven original tests only; no committed skip/retry.
Supporting soak: 100 consecutive separate `npm run test -- tests/lib/password.test.js`
processes under the pinned npx toolchain, all exit 0, 55/55 each, no unhandled
errors, elapsed 92.444 s. The runner stops immediately on any failure.
`git diff main --stat -- src/lib/` is empty. This worklog-only amendment leaves
qualified test/source bytes identical to the candidate.

### Gate 1.5.3 checkpoint

Gate 1.5.2 sealed commit: `37a103b65b60b7dd2c642c7746c4a9cf20d90b51`.
Architecture: the generation effect owns a `current` flag; dependency cleanup
and unmount invalidate it. Both success and failure check the flag before
calling `setOutput`. Product changes stay inside that effect.
A1 settles R2 then R1 success; A2 settles R2 then R1 failure. U1/U2 unmount with
the latest request pending, then settle success/failure. A test-only React state
wrapper records setter entry after unmount while forwarding every call unchanged;
this avoids depending on React 18 warnings or tearing down jsdom prematurely.
Controlled promises and fake debounce time make these four cases deterministic.
All seven existing test bodies remain unchanged. No rejection handler outside
the component, suppression, retries or weakened assertions are introduced.
Clean checkout tests, M3/M4 and 50 banner / 5 full-suite soaks follow.

Gate 1.5.3 validation: clean candidate `6fcc4d4`, Node `v22.23.5`, npm
`12.0.2`; `npm ci` passed (375 packages, 0 vulnerabilities). Banner tests
passed 11/11, duration 1.10 s. M3 replaced the effect with the unguarded original:
A1 displayed `banner ONE`, A2 cleared R2, U1 observed a setter with
`unmounted banner`, U2 observed a setter with an empty string. All four failed;
the original seven passed. M3 elapsed 2.024 s. M4 used a ref counter incremented
only at request start, with no cleanup: A1/A2 and the original seven passed;
U1/U2 each detected one post-unmount setter call and failed. M4 elapsed 1.992 s.
Each mutation ran all 11 tests, exited 1 as expected, produced no unhandled error,
and restored the source byte for byte (SHA-256
`9957df515446dc77a9651a82c84ad701db39f87e95ea20632de16d765fdbe495`).

Soaks under the pinned toolchain, with immediate stop on nonzero exit or any
unhandled error: banner 50 consecutive processes, 11/11 each, elapsed 65.535 s;
full suite 5 consecutive processes, 66/66 files and 648/648 tests each, elapsed
73.041 s. Full-process times: 14.355, 14.848, 14.646, 14.544 and 14.593 s.
All 55 processes exited 0 and Vitest reported no unhandled errors. A text check
confirmed the entire original seven-test `describe` block is byte-identical.
Product diff changes only the generation effect. This worklog-only amendment
leaves qualified source/test bytes identical to the candidate. No retries,
suppression, committed skips or weakened assertions. No out-of-scope changes.

### Gate 1.5.4 — qualification start

Implementation gates are complete. Qualification uses a new clean detached
worktree, the pinned Node/npm command, production build and required Python
Playwright runtime. Primary checkout was read-only checked: branch `main`, HEAD
`a265781fd244851f0a0edf1af21bd3483f88fceb`; it remains untouched.

## Resumed-run outcome — blocked at gate 1.5.4

Gate 1.5.3 sealed commit: `2adf741479934471b3c897ddcc3fb7cf4aa7c862`.
All implementation gates and mutations/soaks passed. Gate 1.5.4 is incomplete:
the frozen production-browser check could not render a non-empty ASCII banner.
The operator explicitly requires stopping when a validation cannot pass as
written. No retry, font workaround, fixture injection, validation amendment or
out-of-scope fix was attempted. This is a blocked closeout, not acceptance.

### Qualification evidence

New clean detached checkout `/tmp/opstoolbox15b-g4` of
`2adf741479934471b3c897ddcc3fb7cf4aa7c862`; `git status --porcelain` was
empty before installation. Every command used Node `v22.23.5` and npm `12.0.2`
through `npx -y -p node@22 -p npm@12.0.2 -- <command>`:

| Command | Result | Measured process time |
|---|---|---|
| `npm ci` | Exit 0; 375 packages, 0 vulnerabilities | 2.383 s |
| `npm run test` | Exit 0; 66 files, 648 tests passed; no unhandled errors | 14.497 s |
| `npm run build` | Exit 0; 27 prerendered routes and sitemap entries | 1.312 s |

Build emitted the existing >500 kB chunk advisory; no configuration changed.
The qualification was on the final implementation commit, not the subsequent
documentation-only stop commit. A clean checkout of that final stop commit was
not requalified after the mandatory stop, and full 1.5.4 completion is not claimed.

Production build served with:
`npx -y -p node@22 -p npm@12.0.2 -- npx vite preview --host 127.0.0.1 --port 4175 --strictPort`.
Browser command used `/opt/agents/venv/bin/python`, Playwright `1.64.0`,
`PLAYWRIGHT_BROWSERS_PATH=/opt/agents/data-storage-write/playwright-browsers`,
installed Chromium headless shell 1248, actual browser version `156.0.8078.4`.
No browser download. Fresh context, service workers blocked, clipboard-read/write
permissions. A context route continued only `http://127.0.0.1:4175` requests;
all others were to be aborted and logged.

One browser run, elapsed 12.278 s, exited 1:

- `/text-transformer`: imported bytes `efbbbf6162630d0a6465660d0a`, wrote `XY`
  with `navigator.clipboard.writeText`, focused Input and selected caret `[1,1]`,
  pressed `Control+V`, waited for `Preview is current.`, then downloaded.
  Actual bytes: `efbbbf61585962630d0a6465660d0a`, exactly B1's expected value.
- `/ascii-banner`: filled `Hello World` input with `Ops`. After the 10,000 ms
  assertion timeout, the `<pre>` still read `Output will appear here…`.
  Assertion: `expect(page.locator('pre')).not_to_contain_text('Output will appear here…', timeout=10000)`.
- Browser response log: two requests to
  `http://127.0.0.1:4175/fonts/Standard.flf`, both HTTP 200 with
  `content-type: text/html`, rather than FIGlet font data. These are product
  requests (initial effect and changed text), not test retries.
- Aborted external-request log: `[]`. Console-error log: `[]`. Page-error log:
  `[]`. These arrays were recorded in `finally`, including on assertion failure.

Read-only diagnosis: neither `public/fonts/Standard.flf` nor
`dist/fonts/Standard.flf` exists. Installed figlet `1.12.0` defaults to
`fontPath: './fonts'` and fetches `${fontPath}/${actualFontName}.flf` when missing.
`src/lib/asciiBanner.js` delegates to that browser loader; it is unchanged from
main, SHA-256 `61d0cddaa044bb3be3bc607652d8bf261ba35f5b56f52143b5171b70632a7750`.
The missing distribution/font-loading path explains the browser failure; its
presence before this spec is inferred from unchanged library/package/build
assets, not claimed from a second baseline browser run.

### Scope boundary and proposed follow-up

Fixing the production font loading/distribution requires an operator-reviewed
amendment: likely bundle and register the required FIGlet fonts in
`src/lib/asciiBanner.js`, or distribute the local font assets through the build.
Those paths are explicitly outside Modify (the library/fonts are Do not touch).
No such change is made or authorized by this run. The frozen browser validation
remains unchanged and unsatisfied. Spec status is blocked; implementation-gate
checkboxes record only their completed validations.

Protected-path comparison against main is empty for `src/lib/`, package files,
Vite/Vitest configuration, workflows and instruction files/case variants. Product
diffs stay within `paste()` and the banner generation effect. Changes are only
the five authorized source/test files, this worklog, and this spec's status.
No repository file was deleted, moved or recycled. The primary checkout stays
on `main` at `a265781fd244851f0a0edf1af21bd3483f88fceb`. No central registry,
archive, other spec or other project was changed.

### Commit and publication ledger

| Record | Commit |
|---|---|
| Base | `a265781fd244851f0a0edf1af21bd3483f88fceb` |
| Preserved original preflight stop | `6df5981641c2d52ea5e836909623fa24d94c1dc9` |
| 1.5.1 | `9723bff38f03da115b84c3161d617e41337683ad` |
| 1.5.2 | `37a103b65b60b7dd2c642c7746c4a9cf20d90b51` |
| 1.5.3 | `2adf741479934471b3c897ddcc3fb7cf4aa7c862` |
| 1.5.4 blocked closeout | Resolve the final documentation commit via `git log -1 --format=%H`; it contains this seal |

The first three gate commits were qualified as clean committed candidates;
worklog-only amendments subsequently recorded their measured results, with no
source/test changes. Candidate SHAs are retained in their checkpoints above.
`git log main..HEAD` has the three gate commits plus the mandatory preserved
preflight stop; the next documentation commit seals the blocked 1.5.4 record.
The extra preflight stop is intentional history, not a completed gate.

`git ls-remote origin task/1-5-bom-paste-and-test-reliability` returned empty
with exit 0 at preflight and again at `2026-11-22T02:19:56-05:00`. No push
was attempted. No PR, issue comment, other GitHub write, `gh`, credentials,
auth file or token store was used. Publication remains prohibited.

### Proposed PR body — held, not publication-ready

Preserve imported UTF-8 BOM metadata through Text Transformer paste. Match
complete EFF Short words in all seven passphrase parsing tests, with forced
`yo-yo`/`Yo-yo` coverage. Ignore ASCII Banner generation results after effect
cleanup and cover both ordering and unmount with controlled promises.

Validation: B1–B4; forced draws; A1/A2/U1/U2; mutations M1–M4; 100 password,
50 banner and 5 full-suite soak runs passed under Node 22 / npm 12.0.2.
Production clipboard download matches the required BOM/CRLF bytes. Qualification
is blocked because `/fonts/Standard.flf` returns HTML and `Ops` renders no banner.
Do not publish until an authorized amendment resolves that scope boundary and
Claude reviews the local branch; no acceptance or CI result is claimed.

Closes #19

Closes #14

Closes #15

### Operator interactions and handoff

No operator question was put during the resumed run. The resume authorization
resolved the original dispatch defect; the independent font-distribution blocker
now needs an operator scope decision. Claude's review remains required before
any publication. Runtime model remains `unreported`, CLI `codex-cli 0.163.0`,
host `ml01a`, account `crainbramp`; no invented model, usage or cost figures.
Only measured process durations and clock samples are reported.

Scratch evidence under `/tmp/opstoolbox15b-evidence/` is **ml01a-local, untracked,
disposable**, supplementary to the inline evidence above. It includes per-run
soak logs, mutation commands/output, qualification logs and browser JSON/script;
no result relies solely on these paths. All validation worktrees are removed
with `git worktree remove` after use. The Vite preview was stopped with Ctrl-C
(exit 130 from intentional shutdown). No server or browser is left running.

Resumed-run final clock sample: `2026-11-22T02:21:51-05:00`.
Measured clock-sample interval from 02:09:59: 712.909 s; this is
not a claimed full session duration. Final status: **blocked** at 1.5.4.
This resumed-run record is sealed. The original sealed stop remains above.
