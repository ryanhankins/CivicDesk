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

# One-shot bucket setup. Chainguard's mc image has no shell, so copy the
# static mc binary onto alpine to be able to read Swarm secret files.
FROM cgr.dev/chainguard/minio-client:latest AS mc

FROM alpine:3.20
COPY --from=mc /usr/bin/mc /usr/bin/mc
COPY init.sh /init.sh
ENTRYPOINT ["/bin/sh", "/init.sh"]
