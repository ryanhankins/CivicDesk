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

import { useEffect, useState } from 'react';
import { api, formatDate } from '../../core/api.js';
import { useToast } from '../../core/toast.jsx';
import { StatusBadge } from './constants.jsx';

export default function MyComplaintsPage({ onNavigate }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api('/api/complaints/mine');
        if (active) setItems(data.items || []);
      } catch (err) {
        if (active) toast.error(err.message || 'Failed to load your complaints');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}>My Complaints</h2>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Track non-anonymous complaints you have submitted. Anonymous filings are tracked in the public Complaint Log Book.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('complaints-file')}>
          + File a Complaint
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading your complaints...</p>
        ) : items.length === 0 ? (
          <p className="muted">You have not filed any tracked complaints yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {items.map((c) => (
              <div
                key={c.id}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong>{c.complaint_number} — {c.subject_property_address || c.ordinance_section || 'Complaint'}</strong>
                  <StatusBadge status={c.status} />
                </div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Filed {formatDate(c.created_at)} · Ordinance: {c.ordinance_section || 'Unspecified'}
                </div>
                <div>{c.conduct_description}</div>
                {c.investigation_report && (
                  <div style={{ background: '#f8fafc', padding: 8, borderRadius: 6, fontSize: 13 }}>
                    <strong>Investigation Report:</strong> {c.investigation_report}
                  </div>
                )}
                {c.final_resolution && (
                  <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 6, fontSize: 13 }}>
                    <strong>Final Resolution:</strong> {c.final_resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
