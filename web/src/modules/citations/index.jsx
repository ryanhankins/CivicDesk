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
import BillingManagePage from '../../core/BillingManagePage.jsx';

function CitationsManageWrapper() {
  return (
    <BillingManagePage
      fixedBillType="citation"
      pageTitle="Municipal & Parking Citations"
      pageSubtitle="Issue parking and code citations, review online contest/hearing requests, and track payments."
    />
  );
}

const citationsModule = {
  id: 'citations',
  prefNavItems: [],
  routes: [
    {
      match: (hash) => (hash === 'citations-manage' ? {} : null),
      permission: 'citations.manage',
      component: CitationsManageWrapper,
    },
  ],
};

export default citationsModule;
