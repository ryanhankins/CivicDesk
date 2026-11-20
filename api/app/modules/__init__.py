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

"""Available CivicDesk feature modules."""
from .agendas_module import MODULE as AGENDAS_MODULE
from .calendar_module import MODULE as CALENDAR_MODULE
from .codification_module import MODULE as CODIFICATION_MODULE
from .complaints_module import MODULE as COMPLAINTS_MODULE
from .directory_module import MODULE as DIRECTORY_MODULE
from .forms_module import MODULE as FORMS_MODULE
from .notices_module import MODULE as NOTICES_MODULE
from .pages_module import MODULE as PAGES_MODULE
from .permits_module import MODULE as PERMITS_MODULE
from .records_module import MODULE as RECORDS_MODULE
from ..registry import register_module


def register_builtin_modules() -> None:
    register_module(AGENDAS_MODULE)
    register_module(PERMITS_MODULE)
    register_module(CODIFICATION_MODULE)
    register_module(RECORDS_MODULE)
    register_module(COMPLAINTS_MODULE)
    register_module(CALENDAR_MODULE)
    register_module(NOTICES_MODULE)
    register_module(DIRECTORY_MODULE)
    register_module(FORMS_MODULE)
    register_module(PAGES_MODULE)
