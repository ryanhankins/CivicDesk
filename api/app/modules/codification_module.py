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

"""Municipal Codification module definition."""
from .. import codification
from ..registry import CivicModule

CODIFICATION_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "code_chapters",
        ["id", "code_prefix", "title", "description", "sort_order", "is_published"],
        set(),
        True,
    ),
    (
        "code_sections",
        [
            "id", "chapter_id", "section_number", "article", "title", "summary", "body",
            "ordinance_ref", "effective_date", "source_pdf_url", "object_key",
            "sort_order", "is_published", "updated_at",
        ],
        set(),
        True,
    ),
    (
        "code_revisions",
        [
            "id", "section_id", "ordinance_number", "effective_date",
            "change_summary", "previous_body", "new_body", "edited_by", "created_at",
        ],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="codification",
    name="City Code & Codification",
    description="Manage municipal code chapters, sections, amendments, and public City Code portal.",
    routers=[codification.router],
    bootstrap=codification.bootstrap,
    permissions=[
        {"key": "codification.manage", "label": "Manage City Code Chapters, Sections & Amendments"},
    ],
    nav_groups=[
        {
            "id": "codification-staff",
            "label": "Codification",
            "section_title": "Staff",
            "permission": "codification.manage",
            "items": [
                {"section": "codification-admin", "label": "City Code Editor", "permission": "codification.manage"},
            ],
        },
    ],
    backup_tables=CODIFICATION_BACKUP_TABLES,
)
