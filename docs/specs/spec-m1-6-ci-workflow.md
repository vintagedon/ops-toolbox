---
title: "1.6 CI workflow"
description: "Pin the workflow's actions and runner, and build, run and smoke-test the Docker image in CI"
date: "2026-11-22"
version: "0.1"
status: "under-review"
tags:
  - type: specification
  - domain: architecture
  - tech: [azure-swa, javascript]
related_documents:
  - "[Specifications index](README.md)"
  - "[AGENTS.md: Executing a Work Spec](../../AGENTS.md)"
  - "[1.0 review document: D1 and W1 to W3](reviews/review-m1-0-dependency-maintenance.md)"
---

# 1.6 CI workflow

v0.1 (Claude, 2026-11-22). Don approved this workflow change explicitly, as AGENTS.md requires, in the batch "approved, execute" (Action Registry `recqF2TzzUDjAc4su`). GPT reviews this spec before dispatch.

## Objective

When this spec closes, the workflow raises none of the three warnings in spec 1.0's review (W1 to W3), and every push and pull request builds the Docker image, runs it and smoke-tests it, which closes D1. Deployment behavior does not change: `main` deploys production, a pull request deploys a preview, and closing a pull request removes only its preview.

## Why this exists

- **W1 to W3.** Production run 43719022719 (2026-11-15) still carried all three annotations: `actions/checkout@v3` and `actions/setup-node@v4` target Node 20; `Azure/static-web-apps-deploy@v1` reports `skip_api_build` and `production_branch` as unexpected inputs; and `ubuntu-latest` is migrating to Ubuntu 26. The corrected proposals and their evidence are in the [1.0 review document](reviews/review-m1-0-dependency-maintenance.md) ("W1, corrected" to "W3, corrected"). In short: `@v1` resolves to a lightweight tag from 2021 (`1a947af`) that declares neither input, while the `v1` branch head (`4d27395`, 2024, same `staticappsclient:stable` image) declares both; and production already runs on `ubuntu-26.04`.
- **D1.** Nothing builds the Docker image today; ml01a's run account has no Docker access, and CI never runs `docker build`. Spec 1.0 moved the build to Vite 8, whose native Rolldown and Lightning CSS bindings must resolve on the Alpine build stage. Building alone does not prove nginx serves the site (GPT, 2026-11-22 review), so the job runs the image and exercises it.

## Execution Environment

| Item | Value |
|---|---|
| Host | ml01a, account crainbramp. Worktree on `task/1-6-ci-workflow`, branched from current `main`; the primary checkout stays on `main`. |
| Attended | No. The run does not pause. Claude reviews the local branch, pushes it and opens the PR; CI on that PR is part of the proof. |
| Toolchain | Node 22 / npm 12.0.2 through `npx -y -p node@22 -p npm@12.0.2 -- <command>`. The account has no Docker access, so the image job is proven in CI, not locally. |
| Network | Package registries, and read-only `git ls-remote` against github.com to confirm action pins. |
| Tracking | One issue, opened at dispatch (#N below). |

## Scope

### Modify

- `.github/workflows/azure-static-web-apps-mango-desert-0542ac90f.yml`
- `scripts/docker-smoke.mjs` (new): the smoke checks, runnable against any base URL
- `README.md`: the "Self-Host (Docker)" section, one sentence that CI builds and smoke-tests the image
- `docs/specs/reviews/review-m1-0-dependency-maintenance.md`: a closing note on D1 and W1 to W3 pointing at this spec
- This spec (status and amendments only), `work-logs/worklog-YYYY-MM-DD-ci-workflow.md`

### Do not touch

- `Dockerfile`, `docker/nginx.conf`, `docker-compose.yml`. The job tests the image as it is; a failure is a finding, not a reason to edit the image.
- `package.json` and `package-lock.json`. The smoke script's browser dependency is installed in the job without saving it.
- The workflow's triggers, job conditions, secrets, Azure inputs (`app_location`, `api_location`, `output_location`, `skip_app_build`, `skip_api_build`, `production_branch`, `action`) and the three verify steps.
- Branch protection and required checks, which are Don's settings.

## Frozen decisions

| Item | Value |
|---|---|
| Checkout | `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`, with `submodules: true` and `lfs: false` kept |
| Setup Node | `actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0`, with `node-version: '22'` kept; no cache input (the repository has no `packageManager` field, so v7 adds no automatic cache) |
| Azure deploy | `Azure/static-web-apps-deploy@4d27395796ac319302594769cfe812bd207490b1 # v1 branch head`, in both the upload step and the close step |
| Runner | `ubuntu-26.04` for every job |
| Image job | Its own job, `docker_image_job`, on push and on pull requests other than `closed`, with `permissions: contents: read`. It does not gate deployment. |

## Deliverables

Gate discipline: each gate ends in one local commit referencing its number and a worklog checkpoint.

### Gate 1.6.1: Pins and runner

Apply the frozen pins and runner. Before editing, confirm each pin: `git ls-remote` shows `refs/tags/v7.0.1` of checkout at `3d3c42e…`, `refs/tags/v7.1.0` of setup-node at `949feb2…`, and `refs/heads/v1` of the Azure action at `4d27395…`. A mismatch is a stop condition: record it and change nothing.

**Validation:**

- [ ] The worklog records the three `git ls-remote` lines, each matching its frozen SHA.
- [ ] `grep -nE 'uses: |runs-on:' <workflow>` shows exactly the frozen values: no `@v3`, `@v4`, `@v1` tag or `ubuntu-latest` remains.
- [ ] Apart from the `uses:` and `runs-on:` lines, `git diff main -- <workflow>` touches nothing that existed before this spec; every Azure input, trigger, condition and verify step is byte-identical.
- [ ] The workflow parses as YAML, and every `uses:` value has the form `owner/repo@<40-hex SHA> # <label>`.

### Gate 1.6.2: Image smoke checks

Write `scripts/docker-smoke.mjs`. Given a base URL, it checks: `/` returns 200 and carries the home page's `<title>`; a direct tool route, `/text-transformer`, returns 200 and carries that tool's prerendered `<title>`; an unknown path returns the SPA shell, and in a browser it renders the not-found view; and in Chromium, opening `/mermaid-renderer` loads its lazy chunk and renders its heading, with no console or page errors and no request outside the base URL. It exits non-zero on any failure and prints which check failed.

**Validation:**

- [ ] Against `npm run build` output served the way `docker/nginx.conf` serves it (`dist/<route>/index.html` for a known route, `dist/index.html` for anything else), the script passes. A short local server written for this check is fine. `npx vite preview` is not: on 2026-11-22 it answered `/text-transformer` with the home page's title from the shell, not the tool's prerendered title.
- [ ] Mutation: serve the same build with every path answered by `dist/index.html`, as `vite preview` does; the script fails on the tool-route title check.
- [ ] Mutation: point the tool-route check at a route the build does not have; the script fails on that check. Restore byte for byte.
- [ ] Mutation: make the browser check expect a heading the tool does not render; the script fails. Restore byte for byte.
- [ ] `package.json` and `package-lock.json` are unchanged.

### Gate 1.6.3: Image job

Add `docker_image_job`. It checks out the repository, builds the image from `Dockerfile`, runs it with port 80 published, waits until Docker reports the container healthy (time-limited; a timeout fails the job and prints the container log), installs Playwright and Chromium without saving them, and runs `scripts/docker-smoke.mjs` against the container. It always stops the container.

**Validation (local; CI proof follows in review):**

- [ ] The job uses only frozen action pins and `ubuntu-26.04`.
- [ ] A failed build, an unhealthy container, or a failing smoke check each make the job fail; the worklog shows the step logic for each.
- [ ] `README.md` changes by one sentence in "Self-Host (Docker)"; the 1.0 review document gains a closing note on D1 and W1 to W3 that points at this spec.

### Gate 1.6.4: Closeout

Follow "Executing a Work Spec" in `AGENTS.md`. Commits stay local; the executor does not push, open, mark ready or merge a pull request.

**Validation:**

- [ ] `git log main..HEAD` shows one commit per gate (1.6.1 to 1.6.3) plus closeout; nothing was pushed.
- [ ] In a clean checkout of the final commit under Node 22 / npm 12.0.2, `npm ci`, `npm run test` and `npm run build` pass.
- [ ] The worklog records the pin evidence, mutation results and the proposed PR body carrying `Closes #N`, and is sealed.

## Review and merge acceptance (Claude, after push)

The executor cannot run Docker or GitHub Actions, so these are Claude's checks on the pull request before merging under the batch approval:

- [ ] The PR's run passes every job, including `docker_image_job`, and its annotations contain none of the three warnings.
- [ ] The PR's deploy step reports a preview URL that is not `opstoolbox.dev` or the production Azure host, and the existing verify step passes against it.
- [ ] After merge, the `main` run passes, `https://opstoolbox.dev/deployment.json` reports the merge commit, the close job for the PR succeeds, and the PR's preview URL no longer serves the PR build.
- [ ] Spec 1.0's D1 and W1 to W3 are marked closed in the review document.

## Constraints

- **Pins are SHAs.** A tag or branch reference can move under the workflow; a SHA cannot. Labels say which release each SHA is.
- **Deployment inputs do not change.** W2 is resolved by the pin, not by removing inputs: the old tag ignored them, the branch head declares them, and their values match how the site deploys today.
- **The image job does not gate deployment** and does not publish an image. Publishing images belongs to spec 1.4.
- **No air-gap claims.** This job proves the image builds, starts and serves. Full air-gapped qualification belongs to spec 1.4.

## What the executor may choose

The smoke script's structure and output, how the job waits for health, how Playwright is installed without saving it, and worklog wording.

Frozen: the pins, the runner, the job's triggers and permissions, the smoke checks' coverage, and the do-not-touch list.
