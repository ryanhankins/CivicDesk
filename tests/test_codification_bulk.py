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

"""Unit tests for Municipal Codification bulk URL discovery, ZIP unpacking, and SSRF guards."""
import io
import os
import sys
import unittest
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "api"))


class CodificationBulkImportTest(unittest.TestCase):
    def setUp(self):
        try:
            from app import codification  # noqa: F401
        except ImportError:
            self.skipTest("API dependencies (fastapi/psycopg) not installed")

    def test_extract_pdf_links_from_html(self):
        from app.codification import extract_pdf_links_from_html

        html = """
        <html>
          <head><title>City of Example — City Code</title></head>
          <body>
            <a href="/uploads/Section-101-Series-Adoption-of-Code.pdf">Adoption of Code</a>
            <a href="uploads/Section-102-Rules-of-Construction.pdf?v=2">Rules of Construction</a>
            <a href="/uploads/Section-101-Series-Adoption-of-Code.pdf#page=2">Duplicate Link</a>
            <a href="/about-us">About Us</a>
            <a href="mailto:clerk@example.gov">Email Clerk</a>
          </body>
        </html>
        """
        title, items = extract_pdf_links_from_html(html, "https://cityofexample.gov/code/")
        self.assertEqual(title, "City of Example — City Code")
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]["url"], "https://cityofexample.gov/uploads/Section-101-Series-Adoption-of-Code.pdf")
        self.assertEqual(items[0]["section_number"], "101")
        self.assertEqual(items[0]["chapter_prefix"], "1XX")
        self.assertEqual(items[1]["url"], "https://cityofexample.gov/code/uploads/Section-102-Rules-of-Construction.pdf?v=2")
        self.assertEqual(items[1]["section_number"], "102")

    def test_unpack_pdf_zip_filters_safely(self):
        from app.codification import _unpack_pdf_zip

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("__MACOSX/._Section-101.pdf", b"%PDF-1.4\njunk")
            zf.writestr("code/Section-101-Adoption.pdf", b"%PDF-1.4\nvalid-pdf-1")
            zf.writestr("code/notes.txt", b"ignored text file")
            zf.writestr("code/spoofed.pdf", b"NOT A REAL PDF")

        warnings: list[str] = []
        entries = _unpack_pdf_zip(buf.getvalue(), "city_code.zip", warnings)
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0][0], "Section-101-Adoption.pdf")
        self.assertTrue(entries[0][1].startswith(b"%PDF-1.4"))
        self.assertTrue(any("not a valid PDF" in w for w in warnings))

    def test_is_safe_public_http_url_blocks_internal_targets(self):
        from app.codification import _is_safe_public_http_url

        self.assertFalse(_is_safe_public_http_url("http://127.0.0.1/code.pdf"))
        self.assertFalse(_is_safe_public_http_url("http://localhost:8080/api/health"))
        self.assertFalse(_is_safe_public_http_url("http://169.254.169.254/latest/meta-data/"))
        self.assertFalse(_is_safe_public_http_url("http://10.0.0.5/secret.pdf"))
        self.assertFalse(_is_safe_public_http_url("file:///etc/passwd"))
        self.assertTrue(_is_safe_public_http_url("https://8.8.8.8/code.pdf"))


if __name__ == "__main__":
    unittest.main()
