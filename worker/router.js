export function routeRequest(request, env) {
  // Temporary lifecycle check verification.
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/health") {
    return Response.json({ status: "ok" });
  }

  const container = env.PR_AGENT.getByName("github-app");
  return container.fetch(request);
}
