#!/usr/bin/env bash
# Trigger manual web deploy workflow using gh CLI
# Usage: ./scripts/trigger_manual_deploy.sh

set -e
REPO="12youm90-droid/NEW___1"
WORKFLOW_FILE="deploy-web-manual.yml"
REF="main"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install from https://github.com/cli/cli and run 'gh auth login'"
  exit 1
fi

echo "Triggering workflow '$WORKFLOW_FILE' on $REPO (ref=$REF)..."
# workflow filename is accepted by gh workflow run
gh workflow run "$WORKFLOW_FILE" --repo "$REPO" --ref "$REF"

echo "Workflow dispatched. Check Actions tab: https://github.com/$REPO/actions"
