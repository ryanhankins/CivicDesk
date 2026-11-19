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

"""Unit tests for backend PDF generation, validation, and integration helpers."""
import io
import os
import sys
import unittest
from types import SimpleNamespace

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "api"))

try:
    from fastapi import HTTPException
    from pypdf import PdfReader
    from app.agenda_pdf import build_minutes_pdf
    from app.agendas import _validate_media
    from app.integrations import get_app_base_url

    HAS_API_DEPS = True
except ImportError:
    HAS_API_DEPS = False


@unittest.skipUnless(HAS_API_DEPS, "API dependencies (fastapi/pypdf/reportlab) not installed")
class UnitHelpersTest(unittest.TestCase):
    def test_get_app_base_url_priority(self):
        prev = os.environ.pop("APP_BASE_URL", None)
        try:
            req = SimpleNamespace(
                headers={"origin": "https://city.example.gov/"},
                url=SimpleNamespace(scheme="http"),
            )
            self.assertEqual(get_app_base_url(req), "https://city.example.gov")
            os.environ["APP_BASE_URL"] = "https://override.example.gov/"
            self.assertEqual(get_app_base_url(req), "https://override.example.gov")
        finally:
            if prev is None:
                os.environ.pop("APP_BASE_URL", None)
            else:
                os.environ["APP_BASE_URL"] = prev

    def test_validate_media(self):
        self.assertEqual(_validate_media("https://youtube.com/watch?v=1", ""), ("https://youtube.com/watch?v=1", "video"))
        self.assertEqual(_validate_media("https://example.org/a.mp3", "audio"), ("https://example.org/a.mp3", "audio"))
        self.assertEqual(_validate_media("", None), ("", ""))
        with self.assertRaises(HTTPException) as ctx:
            _validate_media("ftp://example.org/file.mp4", "video")
        self.assertEqual(ctx.exception.status_code, 400)

    def test_minutes_pdf_draft_watermark_vs_approved(self):
        sample_agenda = {
            "title": "Regular Council Meeting",
            "body": "City Council",
            "meeting_date": "2026-12-01",
            "meeting_time": "18:30",
            "minutes_attendance": "Present: Mayor, Councilmembers",
            "minutes_notes": "Called to order at 6:30 PM.",
            "items": [
                {
                    "position": 1,
                    "title": "Approve Consent Agenda",
                    "section": "Consent",
                    "minutes_action": "Approved",
                    "minutes_motion_by": "Lee",
                    "minutes_second_by": "Patel",
                    "minutes_vote": "5-0",
                    "minutes_notes": "",
                }
            ],
        }
        draft_pdf = build_minutes_pdf(sample_agenda, lambda _: b"", watermark_draft=True)
        approved_pdf = build_minutes_pdf(sample_agenda, lambda _: b"", watermark_draft=False)
        self.assertTrue(draft_pdf.startswith(b"%PDF"))
        self.assertTrue(approved_pdf.startswith(b"%PDF"))

        draft_text = "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(draft_pdf)).pages)
        approved_text = "\n".join(p.extract_text() or "" for p in PdfReader(io.BytesIO(approved_pdf)).pages)
        self.assertIn("DRAFT", draft_text)
        self.assertNotIn("DRAFT", approved_text)
        self.assertIn("APPROVED", approved_text)


if __name__ == "__main__":
    unittest.main()
