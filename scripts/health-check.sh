#!/usr/bin/env bash
# Copyright 2026 CivicDesk Contributors
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

# Health, Swarm replica, and disk-space check for a CivicDesk stack.
# Exits non-zero if any check fails (suitable for cron or uptime monitors).
#
# Usage:
#   ./scripts/health-check.sh
#
# Optional env:
#   STACK_NAME      Docker Swarm stack name (default: civicdesk)
#   HEALTH_URL      HTTP health URL (default: http://localhost:8080/api/health)
#   DISK_WARN_PCT   Max allowed root disk % before failing (default: 85)
set -euo pipefail

STACK_NAME="${STACK_NAME:-civicdesk}"
HEALTH_URL="${HEALTH_URL:-http://localhost:8080/api/health}"
DISK_WARN_PCT="${DISK_WARN_PCT:-85}"

# 1. HTTP /api/health
resp="$(curl -fsS --max-time 5 "$HEALTH_URL")"
if ! echo "$resp" | grep -q '"status":"ok"'; then
  echo "FAIL: unexpected /api/health response: $resp" >&2
  exit 1
fi

# 2. Swarm services convergence (api, web, db, minio)
for svc in api web db minio; do
  replicas="$(docker service ls --filter "name=${STACK_NAME}_${svc}" --format '{{.Replicas}}' | head -n 1)"
  if [ -z "$replicas" ]; then
    echo "FAIL: service ${STACK_NAME}_${svc} not found" >&2
    exit 1
  fi
  cur="${replicas%%/*}"
  des="${replicas##*/}"
  if [ "$cur" != "$des" ] || [ "$cur" = "0" ]; then
    echo "FAIL: service ${STACK_NAME}_${svc} replicas=${replicas}" >&2
    exit 1
  fi
done

# 3. Disk usage check
disk_pct="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
if [ "$disk_pct" -ge "$DISK_WARN_PCT" ]; then
  echo "FAIL: root disk usage is ${disk_pct}% (threshold ${DISK_WARN_PCT}%)" >&2
  exit 1
fi

echo "OK: ${STACK_NAME} healthy (${HEALTH_URL}), disk ${disk_pct}%"
