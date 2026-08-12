import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import http from "node:http";
import test from "node:test";
import { promisify } from "node:util";

let routeRequest;
let createPrAgentEnvironment;
const execFileAsync = promisify(execFile);

try {
  ({ routeRequest } = await import("../worker/router.js"));
} catch {}

try {
  ({ createPrAgentEnvironment } = await import("../worker/configuration.js"));
} catch {}

function createEnvironment(forwardedRequests) {
  return {
    PR_AGENT: {
      getByName(name) {
        assert.equal(name, "github-app");
        return {
          async fetch(request) {
            forwardedRequests.push(request);
            return new Response("proxied", { status: 202 });
          },
        };
      },
    },
  };
}

test("health does not start PR-Agent", async function () {
  assert.equal(typeof routeRequest, "function");

  const forwardedRequests = [];
  const response = await routeRequest(
    new Request("https://reviewer.example/health"),
    createEnvironment(forwardedRequests),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(forwardedRequests.length, 0);
});

test("webhooks reach the canonical PR-Agent container", async function () {
  assert.equal(typeof routeRequest, "function");

  const forwardedRequests = [];
  const request = new Request(
    "https://reviewer.example/api/v1/github_webhooks",
    { body: "{}", method: "POST" },
  );

  const response = await routeRequest(request, createEnvironment(forwardedRequests));

  assert.equal(response.status, 202);
  assert.equal(forwardedRequests.length, 1);
});

test("health probe exits when the endpoint returns HTTP 200", async function (context) {
  const server = http.createServer(function (_request, response) {
    response.writeHead(200);
    response.end();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(function () {
    server.close();
  });

  const address = server.address();
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");

  let commandError;
  try {
    await execFileAsync(".github/scripts/probe-health.sh", [], {
      env: {
        ...process.env,
        HEALTH_URL: `http://127.0.0.1:${address.port}/health`,
        MAX_ATTEMPTS: "1",
        RETRY_DELAY_SECONDS: "0",
      },
    });
  } catch (error) {
    commandError = error;
  }

  assert.equal(commandError, undefined);
});

test("health probe retries until the endpoint returns HTTP 200", async function (context) {
  let requestCount = 0;
  const server = http.createServer(function (_request, response) {
    requestCount += 1;
    if (requestCount === 1) {
      response.writeHead(503);
      response.end();
      return;
    }

    response.writeHead(200);
    response.end();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(function () {
    server.close();
  });

  const address = server.address();
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");

  let commandError;
  try {
    await execFileAsync(".github/scripts/probe-health.sh", [], {
      env: {
        ...process.env,
        HEALTH_URL: `http://127.0.0.1:${address.port}/health`,
        MAX_ATTEMPTS: "2",
        RETRY_DELAY_SECONDS: "0",
      },
    });
  } catch (error) {
    commandError = error;
  }

  assert.equal(commandError, undefined);
  assert.equal(requestCount, 2);
});

test("health probe defaults to the container-backed root path", async function (context) {
  let requestedPath;
  const server = http.createServer(function (request, response) {
    requestedPath = request.url;
    response.writeHead(200);
    response.end();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(function () {
    server.close();
  });

  const address = server.address();
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");

  let commandError;
  try {
    await execFileAsync(".github/scripts/probe-health.sh", [], {
      env: {
        ...process.env,
        HEALTH_ORIGIN: `http://127.0.0.1:${address.port}`,
        MAX_ATTEMPTS: "1",
        RETRY_DELAY_SECONDS: "0",
      },
    });
  } catch (error) {
    commandError = error;
  }

  assert.equal(commandError, undefined);
  assert.equal(requestedPath, "/");
});

test("PR-Agent triggers review and committable improve commands", function () {
  assert.equal(typeof createPrAgentEnvironment, "function");

  const environment = createPrAgentEnvironment({});
  const improveCommand = "/improve --pr_code_suggestions.commitable_code_suggestions=true";

  assert.equal(environment.CONFIG__PERSISTENT_INLINE_COMMENTS, "true");
  assert.equal(environment.PR_CODE_SUGGESTIONS__COMMITABLE_CODE_SUGGESTIONS, "true");
  assert.equal(environment.GITHUB_APP__HANDLE_PUSH_TRIGGER, "true");
  assert.deepEqual(JSON.parse(environment.GITHUB_APP__PR_COMMANDS), ["/review", improveCommand]);
  assert.deepEqual(JSON.parse(environment.GITHUB_APP__PUSH_COMMANDS), ["/review", improveCommand]);
});
