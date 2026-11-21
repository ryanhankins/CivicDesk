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

"""Municipal Citations module definition."""
from ..registry import CivicModule

CITATIONS_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = []

MODULE = CivicModule(
    id="citations",
    name="Municipal Citations",
    description="Parking and municipal code citations, online payment, PDF notices, and hearing/contest requests.",
    routers=[],
    bootstrap=lambda: None,
    permissions=[
        {"key": "citations.manage", "label": "Issue & Manage Municipal Citations"},
    ],
    features=[
        {"key": "online_contest", "label": "Online Citation Contest / Hearing Request", "description": "Let recipients contest unpaid citations and request a hearing online.", "default": True},
    ],
    nav_groups=[
        {
            "id": "citations-staff",
            "label": "Municipal Citations",
            "section_title": "Staff",
            "permission": "citations.manage",
            "items": [
                {"section": "citations-manage", "label": "Citations & Contests", "permission": "citations.manage"},
            ],
        },
    ],
    backup_tables=CITATIONS_BACKUP_TABLES,
)
