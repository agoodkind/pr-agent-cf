#!/usr/bin/env bash

set -euo pipefail

NEEDLE="${1:?needle is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"

request_file=$(mktemp)
response_file=$(mktemp)

cleanup() {
    rm -f "$request_file" "$response_file"
}
trap cleanup EXIT INT TERM

now_seconds=$(date +%s)
from_milliseconds=$(((now_seconds - 7200) * 1000))
to_milliseconds=$((now_seconds * 1000))

jq -n \
    --arg needle "$NEEDLE" \
    --argjson from "$from_milliseconds" \
    --argjson to "$to_milliseconds" \
    '{
        queryId: "pr-agent-live-proof",
        timeframe: {from: $from, to: $to},
        dry: true,
        limit: 500,
        parameters: {
            datasets: [],
            filterCombination: "and",
            filters: [],
            needle: {value: $needle, isRegex: false, matchCase: false}
        },
        view: "events"
    }' >"$request_file"

curl \
    --fail-with-body \
    --silent \
    --show-error \
    --output "$response_file" \
    --request POST \
    --header "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    --header "Content-Type: application/json" \
    --data-binary "@$request_file" \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/observability/telemetry/query"

jq '{
    success,
    errors,
    events: [
        .result.events[]? |
        {
            timestamp,
            dataset,
            source,
            metadata: .["$metadata"],
            containers: .["$containers"],
            workers: .["$workers"]
        }
    ]
}' "$response_file"
