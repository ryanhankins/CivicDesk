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

"""Postgres connection pool. Password is read from the Swarm secret file."""
import os
import time

import psycopg
from psycopg_pool import ConnectionPool


def _read_secret(path_env: str, fallback_env: str) -> str:
    path = os.environ.get(path_env)
    if path and os.path.exists(path):
        with open(path) as f:
            return f.read().strip()
    return os.environ.get(fallback_env, "")


def conninfo() -> str:
    return psycopg.conninfo.make_conninfo(
        host=os.environ.get("POSTGRES_HOST", "db"),
        port=os.environ.get("POSTGRES_PORT", "5432"),
        dbname=os.environ.get("POSTGRES_DB", "civicdesk"),
        user=os.environ.get("POSTGRES_USER", "civicdesk"),
        password=_read_secret("POSTGRES_PASSWORD_FILE", "POSTGRES_PASSWORD"),
    )


pool = ConnectionPool(conninfo(), min_size=1, max_size=10, open=False)


def open_pool(timeout_s: int = 60) -> None:
    """Open the pool, waiting for Postgres to come up (Swarm has no depends_on)."""
    deadline = time.monotonic() + timeout_s
    while True:
        try:
            pool.open(wait=True, timeout=5)
            return
        except Exception:
            if time.monotonic() > deadline:
                raise
            time.sleep(2)
