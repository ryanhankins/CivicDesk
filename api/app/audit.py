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

"""Platform-wide administration and compliance audit log."""
from fastapi import APIRouter, Depends, Query

from .auth import require_admin
from .db import pool

router = APIRouter(prefix="/api/audit", tags=["audit"])

SCHEMA = """
CREATE TABLE IF NOT EXISTS core_audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_username  TEXT NOT NULL DEFAULT '',
    action          TEXT NOT NULL,
    target_type     TEXT NOT NULL DEFAULT '',
    target_id       TEXT NOT NULL DEFAULT '',
    summary         TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS core_audit_created_idx ON core_audit_log(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS core_audit_target_idx ON core_audit_log(target_type, id DESC);
"""


def bootstrap() -> None:
    with pool.connection() as conn:
        conn.execute(SCHEMA)


def record_audit(
    actor_username: str,
    action: str,
    target_type: str,
    target_id: str | int = "",
    summary: str = "",
    *,
    conn=None,
) -> None:
    """Best-effort audit log insert; never breaks the caller mutation."""
    try:
        params = (
            (actor_username or "").strip(),
            action.strip(),
            target_type.strip(),
            str(target_id) if target_id is not None else "",
            summary.strip(),
        )
        sql = (
            "INSERT INTO core_audit_log (actor_username, action, target_type, target_id, summary) "
            "VALUES (%s, %s, %s, %s, %s)"
        )
        if conn is not None:
            conn.execute(sql, params)
        else:
            with pool.connection() as c:
                c.execute(sql, params)
    except Exception:
        pass


@router.get("")
def list_audit_log(
    q: str = Query(""),
    target_type: str = Query(""),
    limit: int = Query(200, ge=1, le=500),
    _: dict = Depends(require_admin),
):
    clauses = ["1=1"]
    params: list = []
    if target_type.strip():
        clauses.append("target_type = %s")
        params.append(target_type.strip())
    if q.strip():
        like = f"%{q.strip()}%"
        clauses.append(
            "(actor_username ILIKE %s OR action ILIKE %s OR target_id ILIKE %s OR summary ILIKE %s)"
        )
        params.extend([like, like, like, like])
    where_sql = " AND ".join(clauses)
    params.append(limit)

    with pool.connection() as conn:
        rows = conn.execute(
            f"SELECT id, actor_username, action, target_type, target_id, summary, created_at "
            f"FROM core_audit_log WHERE {where_sql} ORDER BY id DESC LIMIT %s",
            params,
        ).fetchall()
        types = [
            r[0]
            for r in conn.execute(
                "SELECT DISTINCT target_type FROM core_audit_log WHERE target_type <> '' ORDER BY target_type"
            ).fetchall()
        ]
    return {
        "target_types": types,
        "items": [
            {
                "id": r[0],
                "actor_username": r[1],
                "action": r[2],
                "target_type": r[3],
                "target_id": r[4],
                "summary": r[5],
                "created_at": r[6].isoformat() if r[6] else None,
            }
            for r in rows
        ],
    }
