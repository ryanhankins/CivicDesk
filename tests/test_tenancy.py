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

"""Unit tests for schema-per-tenant context, slug validation, and object key isolation."""
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "api"))

try:
    from fastapi import HTTPException
    from app import tenancy

    HAS_TENANCY_DEPS = True
except ImportError:
    HAS_TENANCY_DEPS = False


@unittest.skipUnless(HAS_TENANCY_DEPS, "API dependencies (fastapi/psycopg) not installed")
class TenancyUnitTest(unittest.TestCase):
    def test_slug_validation_and_schema_naming(self):
        self.assertEqual(tenancy.validate_tenant_slug("birchwood-village"), "birchwood_village")
        self.assertEqual(tenancy.schema_for_slug("default"), "public")
        self.assertEqual(tenancy.schema_for_slug("birchwood_village"), "tenant_birchwood_village")
        for bad in ("", "a", "default", "public", "1bad", "bad;drop"):
            with self.assertRaises(HTTPException):
                tenancy.validate_tenant_slug(bad)

    def test_tenant_object_key_and_strip(self):
        self.assertEqual(tenancy.tenant_object_key("agendas/1/file.pdf"), "agendas/1/file.pdf")
        with tenancy.tenant_context("northfield", "tenant_northfield"):
            self.assertEqual(
                tenancy.tenant_object_key("agendas/1/file.pdf"),
                "tenants/northfield/agendas/1/file.pdf",
            )
            self.assertEqual(
                tenancy.strip_tenant_prefix("tenants/northfield/agendas/1/file.pdf"),
                "agendas/1/file.pdf",
            )
        self.assertEqual(tenancy.get_current_tenant_slug(), "default")


if __name__ == "__main__":
    unittest.main()
