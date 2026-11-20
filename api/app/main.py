# Copyright 2026 Ryan Hankins
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

from contextlib import asynccontextmanager
import asyncio
import os

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from . import audit, auth, backup, branding, docs, integrations, my_account, payments, pdf_check, permits, registry, search, sla, subscriptions, tenancy, updates, users
from .db import open_pool, pool
from .modules import register_builtin_modules

register_builtin_modules()


def _bootstrap_tenant_schema(slug: str, schema: str) -> None:
    with tenancy.tenant_context(slug, schema):
        auth.bootstrap()
        audit.bootstrap()
        integrations.bootstrap()
        sla.bootstrap()
        payments.bootstrap()
        subscriptions.bootstrap()
        docs.bootstrap()
        registry.bootstrap()
        for mod in registry.get_all_registered_modules():
            mod.bootstrap()


tenancy.register_schema_bootstrapper(_bootstrap_tenant_schema)


@asynccontextmanager
async def lifespan(app: FastAPI):
    open_pool()
    tenancy.bootstrap()
    tenants = tenancy.list_active_tenants() if tenancy.is_multi_tenant() else [("default", "public")]
    for slug, schema in tenants:
        _bootstrap_tenant_schema(slug, schema)
    digest_task = None
    if os.environ.get("DAILY_DIGEST_ENABLED", "").strip().lower() == "true":
        async def _digest_loop():
            while True:
                await asyncio.sleep(86400)
                try:
                    permits.run_daily_compliance_digest()
                except Exception:
                    pass
                try:
                    sla.run_sla_escalation_digest()
                except Exception:
                    pass
        digest_task = asyncio.create_task(_digest_loop())
    yield
    if digest_task:
        digest_task.cancel()
    pool.close()


app = FastAPI(title="DocketHall API", lifespan=lifespan)


@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    path = request.url.path
    if path == "/api/health" or path.startswith("/api/platform/"):
        return await call_next(request)
    resolved = tenancy.resolve_tenant_for_request(
        request.headers.get("host", ""),
        request.headers.get("x-tenant-slug", ""),
    )
    if resolved is None:
        return JSONResponse(status_code=404, content={"detail": "Unknown tenant"})
    slug, schema = resolved
    with tenancy.tenant_context(slug, schema):
        return await call_next(request)


app.include_router(tenancy.router)
app.include_router(auth.router)
app.include_router(audit.router)
app.include_router(users.router)
app.include_router(branding.router)
app.include_router(integrations.router)
app.include_router(sla.router)
app.include_router(payments.router)
app.include_router(pdf_check.router)
app.include_router(my_account.router)
app.include_router(subscriptions.router)
app.include_router(docs.router)
app.include_router(backup.router)
app.include_router(registry.router)
app.include_router(search.router)
app.include_router(updates.router)

for mod in registry.get_all_registered_modules():
    for r in mod.routers:
        app.include_router(r, dependencies=[Depends(registry.require_module_enabled(mod.id))])


@app.get("/api/health")
def health():
    return {"status": "ok"}
