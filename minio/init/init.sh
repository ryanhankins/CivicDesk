#!/bin/sh
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

# Create the records bucket (object lock + versioning enabled). Idempotent.
set -e
ENDPOINT="${MINIO_ENDPOINT:-http://minio:9000}"
BUCKET="${MINIO_BUCKET:-records}"
USER="$(cat /run/secrets/minio_root_user)"
PASS="$(cat /run/secrets/minio_root_password)"

until mc alias set local "$ENDPOINT" "$USER" "$PASS" >/dev/null 2>&1; do
  echo "waiting for minio at $ENDPOINT ..."
  sleep 2
done

mc mb --ignore-existing --with-lock "local/$BUCKET"
echo "minio bucket '$BUCKET' ready"
