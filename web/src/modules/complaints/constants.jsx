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

export const COMPLAINT_STATUSES = [
  { value: 'submitted', label: 'Submitted', bg: '#e0f2fe', color: '#0369a1' },
  { value: 'investigating', label: 'Investigating', bg: '#fef3c7', color: '#92400e' },
  { value: 'informal_resolution', label: 'Informal Resolution', bg: '#ede9fe', color: '#5b21b6' },
  { value: 'notice_of_violation', label: 'Notice of Violation', bg: '#fee2e2', color: '#991b1b' },
  { value: 'hearing_requested', label: 'Hearing Requested', bg: '#ffedd5', color: '#9a3412' },
  { value: 'council_review', label: 'Council / Board Review', bg: '#fce7f3', color: '#9d174d' },
  { value: 'resolved', label: 'Resolved', bg: '#dcfce7', color: '#166534' },
  { value: 'dismissed', label: 'Dismissed / No Violation', bg: '#f3f4f6', color: '#374151' },
];

export const ORDINANCE_PRESETS = [
  'Zoning / Land Use',
  'Property Maintenance / Nuisance',
  'Noise / Animal Control',
  'Sign / Right-of-Way',
  'Other / Unknown',
];

export const ASSISTING_AGENCIES = [
  'City Staff',
  'Law Enforcement',
  'Planning & Zoning',
  'Planning Commission',
  'City Council',
];

export function StatusBadge({ status }) {
  const meta = COMPLAINT_STATUSES.find((s) => s.value === status) || {
    label: status || 'unknown',
    bg: '#f3f4f6',
    color: '#374151',
  };
  return (
    <span
      className="badge"
      style={{ background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}
    >
      {meta.label}
    </span>
  );
}
