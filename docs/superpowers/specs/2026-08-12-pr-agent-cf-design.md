# PR-Agent Cloudflare Deployment

## Purpose

Run the official PR-Agent GitHub App image in one scale-to-zero Cloudflare
Container. Keep the repository public, the wrapper minimal, and runtime secrets
only in Cloudflare.

## Runtime

A plain JavaScript Worker returns its own health response and forwards every
other request to one named Container instance. The Container runs the pinned
official PR-Agent image as a non-root user.

PR-Agent uses `gpt-5.6-sol` through the Clyde OpenAI-compatible endpoint. New
pull requests run `/review` and `/improve`.
New commits run the same commands. Improve results enable committable code
suggestions, and persistent inline comments prevent duplicate suggestions across
runs.

Cloudflare Access rejects every Clyde request except requests carrying the
dedicated PR-Agent service token. Clyde separately validates its bearer token.

## Delivery

Pull requests run routing tests and validate the Wrangler deployment bundle.
Every update to `main` deploys through Cloudflare's official Wrangler GitHub
Action on a hosted Ubuntu runner. Deployments run one at a time and finish with
a live health probe.

GitHub stores only the dedicated Cloudflare deployment token and account
identifier. Clyde and GitHub App secrets remain Cloudflare Worker secrets.

## Verification

Local checks exercise the health and webhook routing boundaries. Delivery also
builds the pinned container, deploys the existing Worker, waits for the live
health endpoint, and retains GitHub Actions logs when any step fails.

Production acceptance requires a healthy Container, an HTTP 200 health response,
a successful signed GitHub webhook redelivery, and visible PR-Agent output on a
pull request.

## Migration

The standalone repository must deploy and verify the existing production Worker
before the superseded configs pull request, branch, and worktree are removed.
Temporary Cloudflare credentials are revoked after the dedicated deployment
credential is stored in GitHub.
