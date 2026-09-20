# Azure SWA deployment repair — 2026-09-20

Authority: operator-approved repair in the Codex task. No feature merge or push to main is authorized.

## Initial state

- Azure app `ops-toolbox` had no repository/branch record but required GitHub deployment authorization.
- Only the production environment remained; the public site referenced the July 10 build assets.
- Main base: `9d177424bfc9e5cd32e071ed2990fa51de6059c1`.
- Feature PR #7 base: `2181ee571eaa9eb98b288e0109b453169bb90898`.
- Existing GitHub and Azure credentials had the required permissions; no PAT was created.

## Changes and decisions

- Changed Azure authorization to `DeploymentToken` through an ARM PATCH. The first request required a repository credential; the second used the existing GitHub OAuth credential privately. A separate GET confirmed the new policy.
- Synchronized the existing Azure deployment token into the existing repository secret. No credential values were printed or committed. No token rotation was requested.
- Preserved the hand-maintained workflow, removed OIDC, made `main` explicit, and supplied a token to preview cleanup.
- Build and test before upload, then verify a build manifest and SHA-256 hashes for every public file. The private Azure serving configuration is copied into the upload but excluded from HTTP verification.
- Existing workflow runs cannot be rerun because GitHub rejects runs more than a month old. Fresh PR runs will verify previews; a clean build of the existing main commit will verify production using Microsoft's deployment CLI.
- No app feature source files changed. Neither main nor the feature PR will be merged by this repair.

## Validation before publication

- Baseline: 474 tests passed across 56 files.
- Updated checkout: 478 tests passed across 57 files; Vite production build passed.
- Verifier catches stale metadata, changed assets, and HTTP 200 fallback pages.
- Workflow YAML parsed and `git diff --check` passed.
- Independent review found no actionable issues.
- Live deployment evidence will be appended after publication.

## Execution findings

- The first fresh repair run stopped before deployment because Node 22's bundled npm 10.9.8 crashed resolving dependencies (`edgesOut`). Pin npm to 12.0.2, the version used by the successful clean local install, tests, and build.
- Temporary nested worktrees caused duplicate local test discovery. Moved the agent-created worktrees to sibling directories within `/opt/agents/repos`; the feature checkout then passed all 505 tests across 59 files. No application fix was required.

## Live verification

- Repair preview: [run 35524102869](https://github.com/vintagedon/ops-toolbox/actions/runs/35524102869) passed; all 199 public files matched the local build manifest for merge commit `b6f7541b698abbf22477bf5a0710b1952dcf804c`.
- Feature preview: [run 35524124864](https://github.com/vintagedon/ops-toolbox/actions/runs/35524124864) passed all 505 tests and verified all 201 public files for merge commit `0c780fe89973ac8428ca2b2e016148e41d6afc1f`. Preview: https://mango-desert-0542ac90f-7.eastus2.4.azurestaticapps.net .
- Cleanup: [run 35524286218](https://github.com/vintagedon/ops-toolbox/actions/runs/35524286218) successfully closed repair preview #8. Azure environment listing then contained only `default` and `7`. Repair PR #8 was reopened afterward.
- Production: built clean, unchanged main commit `9d177424bfc9e5cd32e071ed2990fa51de6059c1`; 474 tests passed. Microsoft's SWA deployment client, SHA-256 checked against its published release metadata, completed deployment `21435b91-b2a4-4f19-98d1-169565141ae8` with exit 0.
- Before publishing, the origin correctly failed verification against the new artifact manifest. After publishing, every one of its 199 public files matched independently at both the Azure origin and https://opstoolbox.dev .
- Azure production `lastUpdatedOn` advanced to `2026-09-20T16:57:13.880865+00:00`. The published `deployment.json` identifies source commit `9d177424bfc9e5cd32e071ed2990fa51de6059c1` and run `ml01-production-20260920`.
- Production was verified through the official deployment client, not a fresh GitHub main push: historical GitHub jobs were too old to rerun, and main was not modified. The updated GitHub workflow was verified through both preview jobs and the cleanup job.
- [Repair PR #8](https://github.com/vintagedon/ops-toolbox/pull/8) remains draft and unmerged. Feature PR #7 remains open and unmerged. The workflow improvements reach main when the operator merges the repair PR; the cloud authorization repair is already active.

No additional operator decisions were requested during execution. No new PAT, token rotation, domain change, main push, or merge was performed.
