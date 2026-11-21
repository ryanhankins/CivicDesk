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

"""Utility Billing module definition."""
from ..registry import CivicModule

UTILITIES_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = []

MODULE = CivicModule(
    id="utilities",
    name="Utility Billing",
    description="Water, sewer, and trash utility accounts, batch CSV statements, late-fee aging, and online payment.",
    routers=[],
    bootstrap=lambda: None,
    permissions=[
        {"key": "utilities.manage", "label": "Manage Utility Accounts & Billing Statements"},
    ],
    features=[
        {"key": "late_fees", "label": "Automated Late-Fee Aging", "description": "Apply flat or percentage late fees to past-due utility accounts.", "default": True},
        {"key": "csv_import", "label": "Batch CSV Statement Import", "description": "Bulk-import monthly utility billing cycles from CSV.", "default": True},
    ],
    nav_groups=[
        {
            "id": "utilities-staff",
            "label": "Utility Billing",
            "section_title": "Staff",
            "permission": "utilities.manage",
            "items": [
                {"section": "utilities-manage", "label": "Utility Accounts & Bills", "permission": "utilities.manage"},
            ],
        },
    ],
    backup_tables=UTILITIES_BACKUP_TABLES,
)
