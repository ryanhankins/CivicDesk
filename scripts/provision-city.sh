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

# Provision an isolated CivicDesk stack for a municipality.
#
# Example:
#   STACK_NAME=northfield CIVICDESK_PORT=8081 \
#   APP_BASE_URL=https://portal.northfield.gov COOKIE_SECURE=true \
#   SMTP_HOST=smtp.postmarkapp.com SMTP_PORT=587 \
#   SMTP_SENDER_EMAIL=alerts@northfield.gov SMTP_PASSWORD=... \
#   ./scripts/provision-city.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -z "${STACK_NAME:-}" ]; then
  echo "Usage: STACK_NAME=<slug> [CIVICDESK_PORT=8080] [APP_BASE_URL=https://...] $0" >&2
  exit 1
fi

export STACK_NAME
export CIVICDESK_PORT="${CIVICDESK_PORT:-8080}"
export COOKIE_SECURE="${COOKIE_SECURE:-true}"
export APP_BASE_URL="${APP_BASE_URL:-}"
export SEED_CITY_PROFILE="${SEED_CITY_PROFILE:-}"

echo "==> Provisioning CivicDesk stack '${STACK_NAME}' on port ${CIVICDESK_PORT}"
./scripts/deploy.sh
