#!/usr/bin/env bash
# Copyright 2026 Ryan Hankins
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Build images, create Swarm secrets (if missing) and deploy the CivicDesk stack.
#
#   ./scripts/deploy.sh
#
# Optional env: STACK_NAME (default civicdesk), CIVICDESK_TAG (default latest),
#               CIVICDESK_REGISTRY (e.g. "registry.example.com/" — images are pushed if set)
set -euo pipefail

cd "$(dirname "$0")/.."
if [ -r /etc/civicdesk/upgrade.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /etc/civicdesk/upgrade.env
  set +a
fi
STACK_NAME="${STACK_NAME:-civicdesk}"
if [ -z "${CIVICDESK_SECRET_PREFIX+x}" ]; then
  if [ "$STACK_NAME" = "civicdesk" ]; then
    CIVICDESK_SECRET_PREFIX=""
  else
    CIVICDESK_SECRET_PREFIX="${STACK_NAME}_"
  fi
fi
export CIVICDESK_SECRET_PREFIX
export CIVICDESK_PORT="${CIVICDESK_PORT:-8080}"
export S3_REPLICAS="${S3_REPLICAS:-1}"
export CIVICDESK_TAG="${CIVICDESK_TAG:-latest}"
export CIVICDESK_REGISTRY="${CIVICDESK_REGISTRY:-}"
CIVICDESK_PULL_ONLY="${CIVICDESK_PULL_ONLY:-false}"

# 1. Swarm mode
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}')" != "active" ]; then
  echo "==> Initialising swarm"
  docker swarm init >/dev/null
fi

# 2. Secrets (created once; never overwritten)
create_secret() {  # name value
  if docker secret inspect "$1" >/dev/null 2>&1; then
    echo "    secret $1 exists"
  else
    printf '%s' "$2" | docker secret create "$1" - >/dev/null
    echo "    secret $1 created"
  fi
}
rand() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32; }

echo "==> Secrets"
create_secret "${CIVICDESK_SECRET_PREFIX}postgres_password"   "${POSTGRES_PASSWORD:-$(rand)}"

# 3. Images
if [ "$CIVICDESK_PULL_ONLY" = "true" ]; then
  echo "==> Pulling pre-built images (${CIVICDESK_REGISTRY:-local})"
  PULL_LIST="api web"
  for name in $PULL_LIST; do
    docker pull "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}"
  done
else
  echo "==> Building frontend bundle"
  if [ "${SKIP_WEB_BUILD:-false}" = "true" ]; then
    echo "    (skipped via SKIP_WEB_BUILD=true)"
  elif command -v npm >/dev/null 2>&1; then
    (cd web && ([ -d node_modules ] || npm ci) && npm run build)
  else
    docker run --rm -v "$(pwd)/web:/src" -w /src node:20-alpine sh -c '([ -d node_modules ] || npm ci) && npm run build'
  fi

  echo "==> Building images"
  COMMIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
  IMAGES="api:api web:web"
  for pair in $IMAGES; do
    name="${pair%%:*}"; ctx="${pair#*:}"
    if [ "$name" = "api" ]; then
      docker build -q --build-arg "CIVICDESK_COMMIT=${COMMIT_SHA}" -t "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}" "$ctx"
    else
      docker build -q -t "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}" "$ctx"
    fi
    if [ -n "$CIVICDESK_REGISTRY" ]; then docker push "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}"; fi
  done
fi

# 4. Deploy
echo "==> Deploying stack '$STACK_NAME'"
docker stack deploy --detach=true -c docker-stack.yml "$STACK_NAME"

# Force services onto freshly built/pulled images
UPDATE_SVCS="api web"
for svc in $UPDATE_SVCS; do
  docker service update --detach=true --force --quiet \
    --image "${CIVICDESK_REGISTRY}civicdesk-${svc}:${CIVICDESK_TAG}" \
    "${STACK_NAME}_${svc}" >/dev/null
done

echo
echo "Dashboard:       http://localhost:${CIVICDESK_PORT}"
echo "Status:        docker stack services $STACK_NAME"
