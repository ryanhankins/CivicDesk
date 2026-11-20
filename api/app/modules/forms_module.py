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

"""Standalone Custom Forms & Opinion Polls module definition."""
from .. import forms
from ..registry import CivicModule

FORMS_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "city_forms",
        [
            "id", "slug", "title", "form_kind", "description", "fields",
            "allow_anonymous", "show_poll_results", "closes_at",
            "is_public", "sort_order", "created_by", "created_at", "updated_at",
        ],
        {"fields"},
        True,
    ),
    (
        "city_form_submissions",
        ["id", "form_id", "submitter_name", "submitter_email", "responses", "status", "staff_notes", "created_at"],
        {"responses"},
        True,
    ),
]

MODULE = CivicModule(
    id="forms",
    name="Forms & Opinion Polls",
    description="Create general-purpose resident forms, applications, and community opinion polls.",
    routers=[forms.router],
    bootstrap=forms.bootstrap,
    permissions=[
        {"key": "forms.manage", "label": "Manage Custom Forms, Polls & Submissions"},
    ],
    nav_groups=[
        {
            "id": "forms-staff",
            "label": "Forms & Polls",
            "section_title": "Staff",
            "permission": "forms.manage",
            "items": [
                {"section": "forms-manage", "label": "Forms & Opinion Polls", "permission": "forms.manage"},
            ],
        },
    ],
    backup_tables=FORMS_BACKUP_TABLES,
)
