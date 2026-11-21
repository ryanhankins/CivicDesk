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

function UtilitiesManageWrapper() {
  return (
    <BillingManagePage
      fixedBillType="utility"
      pageTitle="Utility Billing & Accounts"
      pageSubtitle="Manage water, sewer, and trash utility statements, batch CSV cycles, late fees, and online payments."
    />
  );
}

const utilitiesModule = {
  id: 'utilities',
  prefNavItems: [],
  routes: [
    {
      match: (hash) => (hash === 'utilities-manage' ? {} : null),
      permission: 'utilities.manage',
      component: UtilitiesManageWrapper,
    },
  ],
};

export default utilitiesModule;
