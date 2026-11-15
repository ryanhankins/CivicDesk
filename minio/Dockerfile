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

# MinIO server.
# The official minio/minio image was removed from Docker Hub, so this uses
# Chainguard's free image. It runs as uid 65532 and has no shell, so /data is
# pre-created here with the right owner (a fresh named volume inherits it).
FROM alpine:3.20 AS prep
RUN mkdir -p /data

FROM cgr.dev/chainguard/minio:latest
COPY --from=prep --chown=65532:65532 /data /data
EXPOSE 9000 9001
