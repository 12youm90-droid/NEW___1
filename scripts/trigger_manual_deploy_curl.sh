#!/usr/bin/env bash
# Trigger manual web deploy workflow via GitHub REST API
# Requires environment variable GITHUB_TOKEN (personal access token with repo/workflow scope)
# Usage: GITHUB_TOKEN=xxx ./scripts/trigger_manual_deploy_curl.sh

set -e
REPO_OWNER="12youm90-droid"
REPO_NAME="NEW___1"
WORKFLOW_FILE="deploy-web-manual.yml"  # filename or id
REF="main"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Please set GITHUB_TOKEN env var (personal access token with repo/workflow permissions)."
  exit 1
fi

API_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/dispatches"

echo "Dispatching workflow via API: $API_URL"

curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "$API_URL" \
  -d "{ \"ref\": \"$REF\" }"

echo "Done. Check Actions tab: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
