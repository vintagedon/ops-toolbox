<!--
---
title: "Deployment Verification Tests"
description: "How to run the deployment verification suite that checks served content, metadata, and SPA fallback behavior"
author: "VintageDon (https://github.com/vintagedon/)"
date: "2026-09-20"
version: "1.0"
status: "Active"
tags:
  - type: directory-readme
  - domain: testing
  - tech: [vitest, azure-swa]
related_documents:
  - "[Deployment verification test](verifyDeployment.test.js)"
  - "[Deployment scripts README](../../scripts/README.md)"
---
-->

# Deployment verification tests

`verifyDeployment.test.js` uses a local HTTP server to check matching content, stale deployment metadata, corrupted JavaScript, and an HTTP 200 SPA fallback returned for a missing asset. Run with `npm test -- tests/scripts/verifyDeployment.test.js`.
