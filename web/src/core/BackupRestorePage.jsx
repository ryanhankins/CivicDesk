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

import React, { useEffect, useRef, useState } from 'react';
import { api, downloadBackupArchive } from './api.js';
import { useToast } from './toast.jsx';

export default function BackupRestorePage({ reminderDays, onRefreshBackupBanner, onRestored }) {
  const [days, setDays] = useState(String(reminderDays ?? 0));
  const [msg, setMsg] = useState({ text: '', isError: false });
  const fileRef = useRef(null);
  const showToast = useToast();

  useEffect(() => {
    setDays(String(reminderDays ?? 0));
  }, [reminderDays]);

  const handleReminderSave = async (e) => {
    e.preventDefault();
    const num = Number(days || 0);
    try {
      await api('/api/backup/settings', {
        method: 'PUT',
        body: JSON.stringify({ reminder_days: num }),
      });
      await onRefreshBackupBanner?.();
      showToast(num > 0 ? `Backup reminder set to every ${num} day(s)` : 'Backup reminder disabled', 'ok');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (!confirm('Restore from this archive? This will replace current agendas, items, documents, and settings.')) return;
    setMsg({ text: 'Restoring archive…', isError: false });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        credentials: 'same-origin',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `Restore failed (${res.status})`);
      if (fileRef.current) fileRef.current.value = '';
      const totalRows = Object.values(data.row_counts || {}).reduce((a, b) => a + b, 0);
      setMsg({ text: `Restored ${totalRows} database rows and ${data.restored_files || 0} files.`, isError: false });
      showToast('Archive restored', 'ok');
      await onRestored?.();
    } catch (err) {
      setMsg({ text: err.message, isError: true });
    }
  };

  return (
    <section id="section-preferences-backup">
      <h1>Backup &amp; Restore</h1>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Download a full archive (.zip) containing human-readable agendas, CSVs, database JSON, users, preferences, templates, and uploaded attachments, or restore onto an instance.
        </p>
        <div className="actions" style={{ marginBottom: '.75rem' }}>
          <button
            type="button"
            id="backup-export-btn"
            className="btn primary"
            onClick={() => downloadBackupArchive(onRefreshBackupBanner, showToast).catch(e => showToast(e.message, 'error'))}
          >
            Download Full Archive (.zip)
          </button>
        </div>
        <form id="backup-reminder-form" className="row" style={{ alignItems: 'flex-end', marginBottom: '.85rem' }} onSubmit={handleReminderSave}>
          <div className="field" style={{ maxWidth: '260px' }}>
            <label htmlFor="backup-days">Backup Reminder Interval (days, 0 = off)</label>
            <input
              id="backup-days"
              type="number"
              min="0"
              max="3650"
              required
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
          <button type="submit" className="btn sm">Save Reminder</button>
        </form>
        <form id="backup-restore-form" className="row" style={{ alignItems: 'flex-end' }} onSubmit={handleRestore}>
          <div className="field" style={{ flex: 1, minWidth: '220px' }}>
            <label htmlFor="backup-import-file">Restore from Archive (.zip)</label>
            <input id="backup-import-file" ref={fileRef} type="file" accept=".zip" required />
          </div>
          <button type="submit" className="btn danger">Restore Archive</button>
        </form>
        {msg.text && (
          <div id="backup-msg" className={msg.isError ? 'error-msg' : 'ok-msg'} role="status">{msg.text}</div>
        )}
      </div>
    </section>
  );
}
