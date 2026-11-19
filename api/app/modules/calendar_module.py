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

"""City Calendar & Facility Reservations module definition."""
from .. import calendar_mod
from ..registry import CivicModule

CALENDAR_BACKUP_TABLES: list[tuple[str, list[str], set[str], bool]] = [
    (
        "reservable_facilities",
        ["id", "name", "description", "daily_fee", "capacity", "rules", "is_active", "sort_order", "created_at"],
        set(),
        True,
    ),
    (
        "facility_reservations",
        [
            "id", "reservation_number", "facility_id", "facility_name", "event_date",
            "event_title", "requester_name", "requester_email", "requester_phone",
            "notes", "fee_amount", "payment_status", "status", "staff_notes",
            "reviewed_by", "created_at", "updated_at",
        ],
        set(),
        True,
    ),
    (
        "calendar_events",
        ["id", "title", "event_date", "start_time", "end_time", "location", "category", "description", "is_public", "created_by", "created_at"],
        set(),
        True,
    ),
]

MODULE = CivicModule(
    id="calendar",
    name="City Calendar & Rentals",
    description="Public community calendar synced with council meetings, plus configurable municipal facility reservations.",
    routers=[calendar_mod.router],
    bootstrap=calendar_mod.bootstrap,
    permissions=[
        {"key": "calendar.manage", "label": "Manage City Calendar, Events & Facility Reservations"},
    ],
    nav_groups=[
        {
            "id": "calendar-staff",
            "label": "Calendar & Rentals",
            "section_title": "Staff",
            "permission": "calendar.manage",
            "items": [
                {"section": "calendar-manage", "label": "Reservations & Events", "permission": "calendar.manage"},
                {"section": "preferences-calendar", "label": "Calendar & Rental Settings", "permission": "calendar.manage"},
            ],
        },
    ],
    backup_tables=CALENDAR_BACKUP_TABLES,
)
