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

import React from 'react';
import ModuleNotificationsCard from '../../core/ModuleNotificationsCard.jsx';

const COMPLAINT_NOTIFICATION_EVENTS = [
  {
    key: 'complaints_submitted',
    label: 'New Complaint Filed',
    description: 'Sent when a resident or staff member submits a new complaint.',
  },
  {
    key: 'complaints_escalated',
    label: 'Notice of Violation Issued',
    description: 'Sent when staff issues a Section 618.040 Notice of Violation for a complaint.',
  },
];

export default function ComplaintPrefsPage() {
  return (
    <section id="section-preferences-complaints">
      <h1>Complaint Preferences</h1>
      <ModuleNotificationsCard
        moduleId="complaints"
        title="Complaint Email Notifications"
        events={COMPLAINT_NOTIFICATION_EVENTS}
      />
    </section>
  );
}
