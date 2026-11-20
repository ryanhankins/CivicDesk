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

"""Custom City Pages & Quick Links module definition."""
from .. import pages
from ..registry import CivicModule

PAGES_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "city_pages",
        ["id", "slug", "title", "summary", "body", "category", "sort_order", "is_public", "updated_by", "created_at", "updated_at"],
        set(),
        True,
    ),
    (
        "city_quick_links",
        ["id", "label", "description", "url", "sort_order", "is_public", "created_at"],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="pages",
    name="City Pages & Quick Links",
    description="Publish custom municipal information pages (utilities, trash, snow rules) and quick links.",
    routers=[pages.router],
    bootstrap=pages.bootstrap,
    permissions=[
        {"key": "pages.manage", "label": "Manage City Info Pages & Quick Links"},
    ],
    nav_groups=[
        {
            "id": "pages-staff",
            "label": "City Pages & Links",
            "section_title": "Staff",
            "permission": "pages.manage",
            "items": [
                {"section": "pages-manage", "label": "City Pages & Quick Links", "permission": "pages.manage"},
            ],
        },
    ],
    backup_tables=PAGES_BACKUP_TABLES,
)
