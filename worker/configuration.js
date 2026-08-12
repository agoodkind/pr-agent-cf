export function createPrAgentEnvironment(secrets) {
  return {
    CONFIG__FALLBACK_MODELS: "[]",
    CONFIG__MAX_MODEL_TOKENS: "32000",
    CONFIG__MODEL: "gpt-5.4-nano",
    CONFIG__PERSISTENT_INLINE_COMMENTS: "true",
    CONFIG__REASONING_EFFORT: "none",
    GITHUB_APP__BOT_USER: "agoodkind-nano-pr-reviewer[bot]",
    GITHUB_APP__HANDLE_PR_ACTIONS: '["opened", "reopened", "ready_for_review"]',
    GITHUB_APP__HANDLE_PUSH_TRIGGER: "true",
    GITHUB_APP__PR_COMMANDS: '["/review", "/improve --pr_code_suggestions.commitable_code_suggestions=true"]',
    GITHUB_APP__PUSH_COMMANDS: '["/review", "/improve --pr_code_suggestions.commitable_code_suggestions=true"]',
    GITHUB__APP_ID: "4571682",
    GITHUB__DEPLOYMENT_TYPE: "app",
    GITHUB__PRIVATE_KEY: secrets.GITHUB_PRIVATE_KEY,
    GITHUB__PUBLISH_AS_CHECK_RUN: "false",
    GITHUB__PUBLISH_REVIEW_LIFECYCLE: "true",
    GITHUB__REVIEW_LIFECYCLE_TIMEOUT_SECONDS: "600",
    GITHUB__WEBHOOK_SECRET: secrets.GITHUB_WEBHOOK_SECRET,
    GUNICORN_WORKERS: "1",
    OPENAI__KEY: secrets.OPENAI_KEY,
    PR_CODE_SUGGESTIONS__COMMITABLE_CODE_SUGGESTIONS: "true",
  };
}
