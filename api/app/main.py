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

from fastapi import Depends, FastAPI

from . import auth, backup, branding, registry, users
from .db import open_pool, pool
from .modules import register_builtin_modules

register_builtin_modules()


@asynccontextmanager
async def lifespan(app: FastAPI):
    open_pool()
    auth.bootstrap()
    registry.bootstrap()
    for mod in registry.get_all_registered_modules():
        mod.bootstrap()
    yield
    pool.close()


app = FastAPI(title="CivicDesk API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(branding.router)
app.include_router(backup.router)
app.include_router(registry.router)

for mod in registry.get_all_registered_modules():
    for r in mod.routers:
        app.include_router(r, dependencies=[Depends(registry.require_module_enabled(mod.id))])


@app.get("/api/health")
def health():
    return {"status": "ok"}
