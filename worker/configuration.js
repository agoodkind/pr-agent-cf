export function createPrAgentEnvironment(secrets) {
  const {
    CF_ACCESS_CLIENT_ID,
    CF_ACCESS_CLIENT_SECRET,
    GITHUB_PRIVATE_KEY,
    GITHUB_WEBHOOK_SECRET,
    OPENAI_KEY,
  } = secrets;

  return {
    CF_ACCESS_CLIENT_ID,
    CF_ACCESS_CLIENT_SECRET,
    CLYDE_API_KEY: OPENAI_KEY,
    CLYDE_BASE_URL: "https://clyde-suburban.goodkind.io/v1",
    GITHUB_APP_ID: "4571682",
    GITHUB_BOT_LOGIN: "goodkind-io-pr-agent[bot]",
    GITHUB_PRIVATE_KEY,
    GITHUB_WEBHOOK_SECRET,
    PORT: "3000",
    REVIEW_MAX_UNRESOLVED_COMMENTS: "3",
    REVIEW_MIN_IMPORTANCE: "9",
    REVIEW_TIMEOUT: "10m",
  };
}
