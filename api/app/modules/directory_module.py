# Copyright 2026 DocketHall Contributors
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

"""Staff & Council Directory and Self-Service FAQs module definition."""
from .. import directory
from ..registry import CivicModule

DIRECTORY_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "city_directory_entries",
        [
            "id", "name", "title_role", "department", "email", "phone",
            "office_hours", "notes", "is_elected", "sort_order", "is_public", "created_at",
        ],
        set(),
        True,
    ),
    (
        "city_faqs",
        ["id", "question", "answer", "category", "sort_order", "is_public", "created_at", "updated_at"],
        set(),
        True,
    ),
    (
        "city_community_resources",
        [
            "id", "name", "category", "description", "address", "phone", "email",
            "website_url", "hours", "is_featured", "sort_order", "is_public",
            "created_at", "updated_at",
        ],
        set(),
        True,
    ),
    (
        "city_board_members",
        [
            "id", "board_name", "seat_name", "member_name", "email",
            "term_start", "term_end", "is_vacant", "is_public", "sort_order", "notes", "created_at",
        ],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="directory",
    name="Directory & FAQs",
    description="Publish City Council & staff contact directory, local business & community resources, and self-service FAQs.",
    routers=[directory.router],
    bootstrap=directory.bootstrap,
    permissions=[
        {"key": "directory.manage", "label": "Manage Staff/Council Directory & Public FAQs"},
    ],
    features=[
        {"key": "resources", "label": "Community Resources & Local Businesses", "description": "Directory of local businesses, nonprofits, utilities, and schools.", "default": True},
    ],
    nav_groups=[
        {
            "id": "directory-staff",
            "label": "Directory & FAQs",
            "section_title": "Staff",
            "permission": "directory.manage",
            "items": [
                {"section": "directory-manage", "label": "Directory & FAQs", "permission": "directory.manage"},
            ],
        },
    ],
    backup_tables=DIRECTORY_BACKUP_TABLES,
)
