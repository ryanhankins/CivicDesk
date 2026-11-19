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
  const showToast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyById, setReplyById] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api('/api/complaints/mine');
        if (active) setItems(data.items || []);
      } catch (err) {
        if (active) showToast(err.message || 'Failed to load your complaints', 'error');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [showToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}>My Complaints</h2>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            Track non-anonymous complaints you have submitted. Anonymous filings are tracked in the public Complaint Log Book.
          </p>
        </div>
        <button type="button" className="btn primary" onClick={() => onNavigate('complaints-file')}>
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
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8, display: 'grid', gap: 6 }}>
                  <strong style={{ fontSize: 12 }}>Messages ({(c.messages || []).length})</strong>
                  {(c.messages || []).map((m) => (
                    <div key={m.id} style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: 6, fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <strong>{m.sender_username || 'City Staff'}</strong>
                        <span className="muted" style={{ fontSize: 11 }}>{formatDate(m.created_at)}</span>
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                    </div>
                  ))}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const txt = (replyById[c.id] || '').trim();
                      if (!txt) return;
                      setSendingId(c.id);
                      try {
                        const updated = await api(`/api/complaints/${c.id}/messages`, {
                          method: 'POST',
                          body: JSON.stringify({ body: txt, is_internal: false }),
                        });
                        setItems((prev) => prev.map((x) => (x.id === c.id ? updated : x)));
                        setReplyById((prev) => ({ ...prev, [c.id]: '' }));
                        showToast('Reply sent', 'ok');
                      } catch (err) {
                        showToast(err.message || 'Failed to send reply', 'error');
                      } finally {
                        setSendingId(null);
                      }
                    }}
                    style={{ display: 'flex', gap: 6 }}
                  >
                    <input
                      style={{ flex: 1 }}
                      placeholder="Reply to city staff..."
                      value={replyById[c.id] || ''}
                      onChange={(e) => setReplyById((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    />
                    <button type="submit" className="btn sm primary" disabled={sendingId === c.id}>
                      {sendingId === c.id ? 'Sending…' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
