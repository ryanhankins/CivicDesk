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

# Remove the stack. Volumes and secrets are kept unless --purge is given.
set -euo pipefail
STACK_NAME="${STACK_NAME:-civicdesk}"

docker stack rm "$STACK_NAME"

if [ "${1:-}" = "--purge" ]; then
  echo "Waiting for services to stop..."
  while docker ps -q --filter "label=com.docker.stack.namespace=$STACK_NAME" | grep -q .; do sleep 2; done
  sleep 3
  docker volume rm "${STACK_NAME}_records_data" "${STACK_NAME}_pgdata" "${STACK_NAME}_minio_data" 2>/dev/null || true
  docker secret rm postgres_password gemini_api_key minio_root_user minio_root_password 2>/dev/null || true
  docker config rm civicdesk_db_init_v1 2>/dev/null || true
  echo "Purged volumes, secrets and configs."
fi
