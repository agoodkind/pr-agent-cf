# PR-Agent on Cloudflare

This repository runs the official PR-Agent GitHub App image in one scale to zero Cloudflare Container.

## Setup

Install dependencies with `npm install`.

Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` only in your shell when running `npm run deploy`.

Store `OPENAI_KEY`, `GITHUB_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET` as Cloudflare Worker secrets. Do not add their values to this repository.

## Deployment

Pull requests run `npm run check`.

Updates to `main` deploy through GitHub Actions. Configure the `CLOUDFLARE_API_TOKEN` GitHub Actions secret and the `CLOUDFLARE_ACCOUNT_ID` GitHub Actions variable before merging.

## Verification

Run `npm test` for Worker routing. Run `npm run check` to test routing and validate the Wrangler bundle. After deployment, the workflow waits for `https://agoodkind-nano-pr-reviewer.alex-ee7.workers.dev/health` to return HTTP 200.

Production acceptance also requires a successful signed GitHub webhook redelivery and visible PR-Agent output on a pull request.

## Recovery

If a deployment fails its health probe, inspect the GitHub Actions log and restore the previous Worker version with Cloudflare's rollback control before retrying.
