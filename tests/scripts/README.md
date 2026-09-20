# Deployment verification tests

`verifyDeployment.test.js` uses a local HTTP server to check matching content, stale deployment metadata, corrupted JavaScript, and an HTTP 200 SPA fallback returned for a missing asset. Run with `npm test -- tests/scripts/verifyDeployment.test.js`.
