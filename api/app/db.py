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

"""Postgres connection pool with schema-per-tenant search_path isolation."""
from contextlib import contextmanager
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


_raw_pool = ConnectionPool(conninfo(), min_size=1, max_size=10, open=False)


@contextmanager
def raw_connection():
    """Checkout a connection pinned to the public schema (used for tenant lookup)."""
    with _raw_pool.connection() as conn:
        conn.execute("SET search_path TO public")
        if not conn.autocommit:
            conn.commit()
        yield conn


class _TenantAwarePool:
    """Drop-in wrapper around ConnectionPool that applies the active tenant schema."""

    @contextmanager
    def connection(self):
        from .tenancy import get_current_tenant_schema

        schema = get_current_tenant_schema()
        with _raw_pool.connection() as conn:
            conn.execute(f"SET search_path TO {schema}")
            if not conn.autocommit:
                conn.commit()
            try:
                yield conn
            finally:
                if schema != "public":
                    try:
                        if conn.autocommit or conn.info.transaction_status == psycopg.pq.TransactionStatus.IDLE:
                            conn.execute("SET search_path TO public")
                            if not conn.autocommit:
                                conn.commit()
                    except Exception:
                        pass

    def open(self, *args, **kwargs):
        return _raw_pool.open(*args, **kwargs)

    def close(self, *args, **kwargs):
        return _raw_pool.close(*args, **kwargs)


pool = _TenantAwarePool()


def open_pool(timeout_s: int = 60) -> None:
    """Open the pool, waiting for Postgres to come up (Swarm has no depends_on)."""
    deadline = time.monotonic() + timeout_s
    while True:
        try:
            _raw_pool.open(wait=True, timeout=5)
            return
        except Exception:
            if time.monotonic() > deadline:
                raise
            time.sleep(2)
