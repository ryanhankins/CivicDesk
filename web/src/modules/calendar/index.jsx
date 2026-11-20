/*
 * Copyright 2026 DocketHall Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { lazy } from 'react';

const CalendarManagePage = lazy(() => import('./CalendarManagePage.jsx'));
const CalendarPrefsPage = lazy(() => import('./CalendarPrefsPage.jsx'));

const calendarModule = {
  id: 'calendar',
  prefNavItems: [
    { section: 'preferences-calendar', label: 'Calendar & Rental Settings', permission: 'calendar.manage' },
  ],
  routes: [
    {
      match: (hash) => (hash === 'calendar-manage' ? {} : null),
      permission: 'calendar.manage',
      component: CalendarManagePage,
    },
    {
      match: (hash) => (hash === 'preferences-calendar' ? {} : null),
      permission: 'calendar.manage',
      component: CalendarPrefsPage,
    },
  ],
};

export default calendarModule;
