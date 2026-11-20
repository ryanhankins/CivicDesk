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

import React, { useCallback, useEffect, useState } from 'react';
import { api, formatDate } from './api.js';
import { useToast } from './toast.jsx';

export default function AuditLogPage() {
  const showToast = useToast();
  const [items, setItems] = useState([]);
  const [targetTypes, setTargetTypes] = useState([]);
  const [q, setQ] = useState('');
  const [targetType, setTargetType] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (targetType) params.set('target_type', targetType);
      const qs = params.toString();
      const data = await api(`/api/audit${qs ? `?${qs}` : ''}`);
      setItems(Array.isArray(data.items) ? data.items : []);
      setTargetTypes(Array.isArray(data.target_types) ? data.target_types : []);
    } finally {
      setLoading(false);
    }
  }, [q, targetType]);

  useEffect(() => {
    const t = setTimeout(() => {
      load().catch((e) => showToast(e.message, 'error'));
    }, 150);
    return () => clearTimeout(t);
  }, [load, showToast]);

  return (
    <section id="section-audit">
      <div className="between" style={{ marginBottom: '.75rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Administration Audit Log</h1>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Read-only compliance trail of user, module, agenda, permit, and enforcement actions.
          </p>
        </div>
        <button type="button" className="btn sm" onClick={() => load().catch((e) => showToast(e.message, 'error'))}>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="row" style={{ marginBottom: '.85rem', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, minWidth: 220 }}>
            <label htmlFor="audit-search">Search Actor, Action, or Summary</label>
            <input
              id="audit-search"
              type="search"
              placeholder="Search username, action, ID, or summary…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="field" style={{ minWidth: 160 }}>
            <label htmlFor="audit-type">Category</label>
            <select id="audit-type" value={targetType} onChange={(e) => setTargetType(e.target.value)}>
              <option value="">All Categories</option>
              {targetTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading audit log…</p>
        ) : !items.length ? (
          <p className="muted">No audit events recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Category</th>
                <th>Action</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev) => (
                <tr key={ev.id}>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>{formatDate(ev.created_at)}</td>
                  <td><strong>{ev.actor_username || 'system'}</strong></td>
                  <td><span className="badge draft">{ev.target_type}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>{ev.action}</td>
                  <td>{ev.summary || ev.target_id || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
