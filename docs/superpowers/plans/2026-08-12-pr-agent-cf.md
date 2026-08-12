# PR-Agent Cloudflare Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the pinned official PR-Agent GitHub App container through a thin Cloudflare Worker.

**Architecture:** The Worker owns health routing and forwards all other requests to one named Cloudflare Container. GitHub Actions validates pull requests and deploys `main` serially through Cloudflare's Wrangler action.

**Tech Stack:** Plain JavaScript, Node.js tests, Wrangler, Cloudflare Workers Containers, Docker, GitHub Actions.

## Global Constraints

- Preserve `pragent/pr-agent:0.42.0-github_app@sha256:e044769467726ce4b9533f9537438ef83d024eab035433f75c6e1debc334597f`.
- Keep OpenAI and GitHub App values in Cloudflare Worker secrets only.
- Pin third-party GitHub Actions to immutable commit SHAs.
- Deploy only from `main`, without cancellation of in-progress deployments.

---

### Task 1: Add the Worker routing boundary

**Files:**
- Create: `test/router.test.js`
- Create: `worker/router.js`
- Create: `worker/index.js`
- Create: `wrangler.jsonc`
- Create: `Dockerfile`
- Create: `package.json`

**Interfaces:**
- Produces: `routeRequest(request, env)`, which returns JSON health at `GET /health` and forwards every other request to `PR_AGENT.getByName("github-app")`.

- [ ] **Step 1: Write the failing test**

```javascript
test("health does not start PR-Agent", async function () {
  const response = await routeRequest(
    new Request("https://reviewer.example/health"),
    createEnvironment([]),
  );

  assert.equal(response.status, 200);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because `worker/router.js` does not exist.

- [ ] **Step 3: Write the minimal implementation**

```javascript
if (request.method === "GET" && url.pathname === "/health") {
  return Response.json({ status: "ok" });
}

return env.PR_AGENT.getByName("github-app").fetch(request);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: PASS for health and webhook forwarding.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile package.json test/router.test.js worker/index.js worker/router.js wrangler.jsonc
git commit -S -m "Add Cloudflare PR-Agent runtime"
```

### Task 2: Add delivery automation and operations guidance

**Files:**
- Create: `.github/workflows/check.yml`
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `npm test`, `npm run check`, `wrangler deploy`, and the deployed `/health` endpoint.
- Produces: pull request validation and a serialized main deployment with a retrying health probe.

- [ ] **Step 1: Add workflow validation to the passing automation suite**

```javascript
assert.equal(await run("npm", ["run", "check"]), 0);
```

- [ ] **Step 2: Run the validation command**

Run: `npm run check`

Expected: PASS after the Worker bundle validates.

- [ ] **Step 3: Add the workflows and README**

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

- [ ] **Step 4: Run delivery validation**

Run: `npm run check`

Expected: PASS after the Worker bundle validates.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows README.md package-lock.json
git commit -S -m "Add PR-Agent delivery workflows"
```
