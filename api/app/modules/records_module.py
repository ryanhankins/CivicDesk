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

"""Contracts, Resolutions & Document Repository module definition."""
from .. import records
from ..registry import CivicModule

RECORDS_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "repository_documents",
        [
            "id", "doc_number", "category", "title", "counterparty",
            "effective_date", "expiration_date", "renewal_notice_days",
            "status", "tags", "notes", "is_public", "created_by",
            "created_at", "updated_at",
        ],
        set(),
        True,
    ),
    (
        "repository_files",
        [
            "id", "document_id", "title", "filename", "content_type",
            "size_bytes", "sha256", "object_key", "uploaded_by", "created_at",
        ],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="records",
    name="Contracts & Document Repository",
    description="Searchable archive of contracts, resolutions, easements, and insurance certificates with expiration tracking.",
    routers=[records.router],
    bootstrap=records.bootstrap,
    permissions=[
        {"key": "records.manage", "label": "Manage Contracts, Resolutions & Document Repository"},
        {"key": "records.view", "label": "View Internal Contracts & Document Repository"},
    ],
    nav_groups=[
        {
            "id": "records-staff",
            "label": "Document Repository",
            "section_title": "Staff",
            "permission": "records.view",
            "items": [
                {"section": "records-repo", "label": "Contracts & Resolutions", "permission": "records.view"},
            ],
        },
    ],
    backup_tables=RECORDS_BACKUP_TABLES,
)
