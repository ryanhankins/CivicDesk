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

import React, { useCallback, useEffect, useState } from 'react';
import { api, formatTime12h } from '../../core/api.js';
import { useToast } from '../../core/toast.jsx';

export default function FinalizedAgendasPage() {
  const [agendas, setAgendas] = useState([]);
  const showToast = useToast();

  const loadData = useCallback(async () => {
    const ags = await api('/api/agendas/council');
    setAgendas(Array.isArray(ags) ? ags : []);
  }, []);

  useEffect(() => {
    loadData().catch(e => showToast(e.message, 'error'));
  }, [loadData, showToast]);

  return (
    <section id="section-finalized-agendas">
      <h1>Finalized Agendas</h1>

      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          View finalized meeting agendas and packets.
        </p>
        <table>
          <thead>
            <tr><th>Meeting</th><th>Body</th><th>Date</th><th>Time</th><th>Items</th><th>Packet</th></tr>
          </thead>
          <tbody>
            {!agendas.length ? (
              <tr><td colSpan={6} className="muted">No finalized agendas yet.</td></tr>
            ) : agendas.map(a => (
              <tr key={a.id}>
                <td>
                  {a.title}
                  {a.amended_at && (
                    <> <span className="badge draft" title={`Amended ${new Date(a.amended_at).toLocaleString()}`}>Amended</span></>
                  )}
                </td>
                <td>{a.body || '—'}</td>
                <td>{a.meeting_date || '—'}</td>
                <td>{a.meeting_time ? formatTime12h(a.meeting_time) : '—'}</td>
                <td>{a.item_count}</td>
                <td>
                  <div className="actions">
                    <a className="btn sm" href={`/api/agendas/${a.id}/packet.pdf?summary=1`} target="_blank" rel="noreferrer">Summary</a>
                    <a className="btn sm primary" href={`/api/agendas/${a.id}/packet.pdf`} target="_blank" rel="noreferrer">Full Packet</a>
                    <a className="btn sm" href={`/api/agendas/${a.id}/packet.pdf?download=1`} target="_blank" rel="noreferrer">Download</a>
                    <a className="btn sm" href={`/api/agendas/${a.id}/minutes.pdf`} target="_blank" rel="noreferrer">
                      {a.minutes_status === 'approved' ? 'Minutes' : 'Minutes (Draft)'}
                    </a>
                    {a.media_url && (
                      <a className="btn sm" href={a.media_url} target="_blank" rel="noreferrer">
                        {a.media_type === 'audio' ? 'Listen Audio' : 'Watch Video'}
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
