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

import React from 'react';

const NoticesManagePage = React.lazy(() => import('../notices/NoticesManagePage.jsx'));
const DirectoryManagePage = React.lazy(() => import('../directory/DirectoryManagePage.jsx'));
const PagesManagePage = React.lazy(() => import('../pages/PagesManagePage.jsx'));
const FormsManagePage = React.lazy(() => import('../forms/FormsManagePage.jsx'));

const communicationsModule = {
  id: 'communications',
  prefNavItems: [],
  routes: [
    {
      match: (hash) => (hash === 'notices-manage' ? {} : null),
      permission: 'notices.manage',
      component: NoticesManagePage,
    },
    {
      match: (hash) => (hash === 'directory-manage' ? {} : null),
      permission: 'directory.manage',
      component: DirectoryManagePage,
    },
    {
      match: (hash) => (hash === 'pages-manage' ? {} : null),
      permission: 'pages.manage',
      component: PagesManagePage,
    },
    {
      match: (hash) => (hash === 'forms-manage' ? {} : null),
      permission: 'forms.manage',
      component: FormsManagePage,
    },
  ],
};

export default communicationsModule;
