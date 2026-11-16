/*
 * Copyright 2026 Ryan Hankins
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

const AgendasListPage = React.lazy(() => import('./AgendasListPage.jsx'));
const AgendaDetailPage = React.lazy(() => import('./AgendaDetailPage.jsx'));
const BacklogPage = React.lazy(() => import('./BacklogPage.jsx'));
const AgendaPrefsPage = React.lazy(() => import('./AgendaPrefsPage.jsx'));
const CouncilPage = React.lazy(() => import('./CouncilPage.jsx'));

const agendasModule = {
  id: 'agendas',
  prefNavItems: [
    { section: 'preferences-agenda', label: 'Agenda Preferences', permission: 'agendas.manage' },
  ],
  routes: [
    {
      match: (hash) => {
        const m = hash.match(/^agendas\/(\d+)(?:\/(contents|minutes))?$/);
        return m ? { agendaId: Number(m[1]), tab: m[2] || 'edit' } : null;
      },
      permission: 'agendas.manage',
      component: AgendaDetailPage,
    },
    {
      match: (hash) => (hash === 'agendas' ? {} : null),
      permission: 'agendas.manage',
      component: AgendasListPage,
    },
    {
      match: (hash) => (hash === 'backlog' ? {} : null),
      permission: 'agendas.manage',
      component: BacklogPage,
    },
    {
      match: (hash) => (hash === 'preferences-agenda' || hash === 'preferences' ? {} : null),
      permission: 'agendas.manage',
      component: AgendaPrefsPage,
    },
    {
      match: (hash) => (hash === 'council' ? {} : null),
      permission: 'agendas.submit',
      component: CouncilPage,
    },
  ],
};

export default agendasModule;
