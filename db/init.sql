-- Copyright 2026 Ryan Hankins
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.

-- CivicDesk schema (placeholder).
-- Runs once, on first start of an empty pgdata volume.
-- Replace with the real schema (incl. the audit_log UPDATE/DELETE-blocking trigger).
-- After changing this file, bump configs.db_init.name in docker-stack.yml.
SELECT 1;
