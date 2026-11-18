/*
 * Copyright 2026 CivicDesk Contributors
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

const ComplaintsFilePage = lazy(() => import('./ComplaintsFilePage.jsx'));
const MyComplaintsPage = lazy(() => import('./MyComplaintsPage.jsx'));
const ComplaintLogPage = lazy(() => import('./ComplaintLogPage.jsx'));
const ComplaintsManagePage = lazy(() => import('./ComplaintsManagePage.jsx'));
const ComplaintPrefsPage = lazy(() => import('./ComplaintPrefsPage.jsx'));

const complaintsModule = {
  id: 'complaints',
  prefNavItems: [
    { section: 'preferences-complaints', label: 'Complaint Preferences', permission: 'complaints.manage' },
  ],
  routes: [
    {
      match: (hash) => (hash === 'preferences-complaints' ? {} : null),
      permission: 'complaints.manage',
      component: ComplaintPrefsPage,
    },
    {
      match: (hash) => (hash === 'complaints-file' ? {} : null),
      permission: 'complaints.submit',
      component: ComplaintsFilePage,
    },
    {
      match: (hash) => (hash === 'my-complaints' ? {} : null),
      permission: 'complaints.submit',
      component: MyComplaintsPage,
    },
    {
      match: (hash) => (hash === 'complaints-log' ? {} : null),
      permission: 'complaints.log',
      component: ComplaintLogPage,
    },
    {
      match: (hash) => (hash === 'complaints-manage' ? {} : null),
      permission: 'complaints.manage',
      component: ComplaintsManagePage,
    },
  ],
};

export default complaintsModule;
