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

const PermitApplyPage = React.lazy(() => import('./PermitApplyPage.jsx'));
const MyPermitsPage = React.lazy(() => import('./MyPermitsPage.jsx'));
const PermitsReviewPage = React.lazy(() => import('./PermitsReviewPage.jsx'));
const PermitCatalogAdminPage = React.lazy(() => import('./PermitCatalogAdminPage.jsx'));
const ContractorsManagePage = React.lazy(() => import('./ContractorsManagePage.jsx'));
const ComplianceProgramsPage = React.lazy(() => import('./ComplianceProgramsPage.jsx'));
const PermitsReportsPage = React.lazy(() => import('./PermitsReportsPage.jsx'));
const PropertyProfilePage = React.lazy(() => import('./PropertyProfilePage.jsx'));
const FieldInspectorPage = React.lazy(() => import('./FieldInspectorPage.jsx'));
const RenewalsPage = React.lazy(() => import('./RenewalsPage.jsx'));

const permitsModule = {
  id: 'permits',
  prefNavItems: [
    { section: 'preferences-permits', label: 'Permit Preferences', permission: 'permits.manage' },
  ],
  routes: [
    {
      match: (hash) => {
        const [path, qs] = hash.split('?');
        if (path !== 'permits-apply') return null;
        const p = new URLSearchParams(qs || '');
        return {
          initialTypeId: p.get('type') ? Number(p.get('type')) : null,
          initialUseId: p.get('use') ? Number(p.get('use')) : null,
        };
      },
      permission: 'permits.submit',
      component: PermitApplyPage,
    },
    {
      match: (hash) => (hash === 'my-permits' ? {} : null),
      permission: 'permits.submit',
      component: MyPermitsPage,
    },
    {
      match: (hash) => {
        if (hash === 'permits-review') return {};
        const m = hash.match(/^permits-review\/(\d+)$/);
        return m ? { initialId: Number(m[1]) } : null;
      },
      permission: 'permits.manage',
      component: PermitsReviewPage,
    },
    {
      match: (hash) => (hash === 'contractors' ? {} : null),
      permission: 'permits.manage',
      component: ContractorsManagePage,
    },
    {
      match: (hash) => (hash === 'compliance-programs' ? {} : null),
      permission: 'permits.manage',
      component: ComplianceProgramsPage,
    },
    {
      match: (hash) => (hash === 'permits-reports' ? {} : null),
      permission: 'permits.manage',
      component: PermitsReportsPage,
    },
    {
      match: (hash) => (hash === 'field-inspector' ? {} : null),
      permission: 'permits.manage',
      component: FieldInspectorPage,
    },
    {
      match: (hash) => (hash === 'renewals' ? {} : null),
      permission: 'permits.manage',
      component: RenewalsPage,
    },
    {
      match: (hash) => {
        const [path, qs] = hash.split('?');
        if (path !== 'properties') return null;
        const p = new URLSearchParams(qs || '');
        return { initialParcel: p.get('parcel') || '', initialAddress: p.get('address') || '' };
      },
      permission: 'permits.manage',
      component: PropertyProfilePage,
    },
    {
      match: (hash) => (hash === 'preferences-permits' || hash === 'permits-catalog-admin' ? {} : null),
      permission: 'permits.manage',
      component: PermitCatalogAdminPage,
    },
  ],
};

export default permitsModule;
