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
STACK_NAME="${STACK_NAME:-civicdesk}"
export CIVICDESK_TAG="${CIVICDESK_TAG:-latest}"
export CIVICDESK_REGISTRY="${CIVICDESK_REGISTRY:-}"

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
create_secret postgres_password   "${POSTGRES_PASSWORD:-$(rand)}"
create_secret minio_root_user     "${MINIO_ROOT_USER:-civicdesk}"
create_secret minio_root_password "${MINIO_ROOT_PASSWORD:-$(rand)}"

# 3. Images
echo "==> Building images"
IMAGES="api:api web:web minio:minio minio-init:minio/init"
for pair in $IMAGES; do
  name="${pair%%:*}"; ctx="${pair#*:}"
  docker build -q -t "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}" "$ctx"
  if [ -n "$CIVICDESK_REGISTRY" ]; then docker push "${CIVICDESK_REGISTRY}civicdesk-${name}:${CIVICDESK_TAG}"; fi
done

# 4. Deploy
echo "==> Deploying stack '$STACK_NAME'"
docker stack deploy --detach=true -c docker-stack.yml "$STACK_NAME"

# Force services onto freshly built :latest images
for svc in api web minio; do
  docker service update --detach=true --force --quiet \
    --image "${CIVICDESK_REGISTRY}civicdesk-${svc}:${CIVICDESK_TAG}" \
    "${STACK_NAME}_${svc}" >/dev/null
done

echo
echo "Dashboard:     http://localhost:8080"
echo "MinIO console: http://localhost:9001  (user: docker secret minio_root_user)"
echo "Status:        docker stack services $STACK_NAME"
