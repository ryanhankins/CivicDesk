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

"""News Flash, Public Notices, Bids/RFPs & Jobs module definition."""
from .. import notices
from ..registry import CivicModule

NOTICES_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "city_notices",
        [
            "id", "title", "category", "summary", "body", "department",
            "contact_info", "attachment_url", "attachment_key", "attachment_filename",
            "publish_at", "expires_at",
            "deadline_at", "is_pinned", "is_published", "created_by",
            "created_at", "updated_at",
        ],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="notices",
    name="News, Notices, Bids & Jobs",
    description="Publish city news flashes, statutory public notices, open RFPs/bids, and job postings.",
    routers=[notices.router],
    bootstrap=notices.bootstrap,
    permissions=[
        {"key": "notices.manage", "label": "Manage City News, Public Notices, Bids & Jobs"},
    ],
    nav_groups=[
        {
            "id": "notices-staff",
            "label": "News & Notices",
            "section_title": "Staff",
            "permission": "notices.manage",
            "items": [
                {"section": "notices-manage", "label": "News, Notices, Bids & Jobs", "permission": "notices.manage"},
            ],
        },
    ],
    backup_tables=NOTICES_BACKUP_TABLES,
)
