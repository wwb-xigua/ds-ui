#!/usr/bin/env bash
#
# Build the documentation site and sync it to the internal server.
#
# Authentication uses an SSH key, never a password. Set up once:
#
#   ssh-keygen -t ed25519 -C "docs-deploy"
#   cat ~/.ssh/id_ed25519.pub            # add the public key on the server
#
# Then point this script at the server:
#
#   export DEPLOY_HOST=192.168.1.55
#   export DEPLOY_USER=<ssh-user>
#   export DEPLOY_PORT=8091
#   export DEPLOY_PATH=/opt/ds-ui-docs
#   ./scripts/deploy-docs.sh
#
# The target port is deliberately separate from the services already running on
# the host (8080 / 8090) so nothing existing is disturbed.

set -euo pipefail

cd "$(dirname "$0")/.."

DEPLOY_HOST="${DEPLOY_HOST:-192.168.1.55}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PORT="${DEPLOY_PORT:-8091}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/ds-ui-docs}"

if [[ -z "$DEPLOY_USER" ]]; then
  echo "error: DEPLOY_USER is not set" >&2
  echo "       export DEPLOY_USER=<ssh-user>" >&2
  exit 1
fi

echo "==> Building documentation"
npm run build:docs

echo "==> Syncing to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"

# --delete keeps the remote copy in sync with the build; stale files from an
# older build would otherwise linger and 404-link against new routes.
rsync -avz --delete \
  docs/.vitepress/dist/ \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

echo "==> Done"
echo
echo "Documentation deployed to http://${DEPLOY_HOST}:${DEPLOY_PORT}/"
echo "(requires nginx on ${DEPLOY_HOST} serving ${DEPLOY_PATH} on port ${DEPLOY_PORT})"
echo
echo "See deploy/nginx.conf for a drop-in server block."
