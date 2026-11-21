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

"""Core site branding & general preferences endpoints."""
from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from . import agendas
from .auth import require_permission

router = APIRouter(prefix="/api/branding", tags=["branding"])


@router.get("")
def get_branding():
    return agendas.get_preferences_branding()


class HomeTextIn(BaseModel):
    home_heading: str = ""
    home_intro_body: str = ""


@router.put("")
def update_branding(
    body: agendas.GeneralPreferencesIn,
    user: dict = Depends(require_permission("settings.manage", "agendas.manage")),
):
    return agendas.update_general_preferences(body, user)


@router.put("/home-text")
def update_branding_home_text(
    body: HomeTextIn,
    _: dict = Depends(require_permission("settings.manage", "pages.manage", "blog.manage", "agendas.manage")),
):
    return agendas.update_home_text(body.home_heading, body.home_intro_body)


@router.get("/logo")
def get_branding_logo():
    return agendas.get_preferences_logo()


@router.post("/logo")
async def upload_branding_logo(
    file: UploadFile = File(...),
    user: dict = Depends(require_permission("settings.manage", "agendas.manage")),
):
    return await agendas.upload_preferences_logo(file=file, _=user)


@router.delete("/logo")
def delete_branding_logo(
    user: dict = Depends(require_permission("settings.manage", "agendas.manage")),
):
    return agendas.delete_preferences_logo(user)
