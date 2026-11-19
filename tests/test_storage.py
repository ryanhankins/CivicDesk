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

"""Unit tests for LocalStorageClient (optional MinIO replacement)."""
import io
import os
import sys
import tempfile
from types import SimpleNamespace
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "api"))

try:
    from app.storage import LocalStorageClient

    HAS_STORAGE_DEPS = True
except ImportError:
    HAS_STORAGE_DEPS = False


@unittest.skipUnless(HAS_STORAGE_DEPS, "API dependencies (minio/psycopg) not installed")
class LocalStorageTest(unittest.TestCase):
    def test_put_get_copy_remove_and_path_safety(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            client = LocalStorageClient(tmpdir)
            client.put_object("records", "agendas/1/test.pdf", io.BytesIO(b"%PDF-1.4"), length=8)

            obj = client.get_object("records", "agendas/1/test.pdf")
            try:
                self.assertEqual(obj.read(), b"%PDF-1.4")
            finally:
                obj.close()
                obj.release_conn()

            client.copy_object(
                "records",
                "agendas/2/copy.pdf",
                SimpleNamespace(bucket_name="records", object_name="agendas/1/test.pdf"),
            )
            obj2 = client.get_object("records", "agendas/2/copy.pdf")
            try:
                self.assertEqual(obj2.read(), b"%PDF-1.4")
            finally:
                obj2.close()
                obj2.release_conn()

            client.remove_object("records", "agendas/1/test.pdf")
            client.remove_object("records", "agendas/1/test.pdf")  # idempotent
            with self.assertRaises(FileNotFoundError):
                client.get_object("records", "agendas/1/test.pdf")

            with self.assertRaises(ValueError):
                client.get_object("records", "../../etc/passwd")


if __name__ == "__main__":
    unittest.main()
