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

import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useToast } from './toast.jsx';

function statusBadge(status) {
  if (status === 'pass') return <span className="badge active">PASS</span>;
  if (status === 'warn') return <span className="badge draft">WARN</span>;
  return <span className="badge disabled">FAIL</span>;
}

export default function PdfComplianceButton({
  url,
  title = 'PDF Document',
  label = 'Check PDF',
  className = 'btn sm',
}) {
  const showToast = useToast();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const dlgRef = useRef(null);

  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (result && !dlg.open) dlg.showModal();
    if (!result && dlg.open) dlg.close();
  }, [result]);

  const runCheck = async () => {
    setBusy(true);
    try {
      const data = await api(url);
      setResult(data);
    } catch (err) {
      showToast(err.message || 'Failed to check PDF compliance', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={runCheck}
        aria-label={`Check WCAG 2.1 AA compliance for ${title}`}
        title={`Check PDF accessibility compliance (${title})`}
      >
        {busy ? 'Checking…' : label}
      </button>

      <dialog
        ref={dlgRef}
        onCancel={(e) => { e.preventDefault(); setResult(null); }}
        style={{ maxWidth: 620 }}
      >
        {result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
              <h2 style={{ margin: 0 }}>PDF Accessibility Check</h2>
              <span className={`badge ${result.summary === 'Compliant' ? 'active' : (result.summary === 'Needs Attention' ? 'draft' : 'disabled')}`}>
                {result.summary} ({result.score}%)
              </span>
            </div>
            <div className="muted" style={{ fontSize: '.86rem', marginBottom: '.85rem' }}>
              <strong>{result.filename || title}</strong> &middot; {result.page_count} page(s)
            </div>
            <div style={{ display: 'grid', gap: '.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {(result.checks || []).map((c) => {
                const borderLeft = c.status === 'fail' ? '4px solid #dc2626' : (c.status === 'warn' ? '4px solid #d97706' : '4px solid #16a34a');
                const bg = c.status === 'fail' ? '#fef2f2' : (c.status === 'warn' ? '#fffbeb' : '#f8fafc');
                return (
                  <div
                    key={c.id}
                    style={{
                      border: '1px solid #d9e2ec',
                      borderLeft,
                      borderRadius: 6,
                      padding: '.55rem .7rem',
                      background: bg,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', marginBottom: '.2rem' }}>
                      <strong style={{ fontSize: '.88rem' }}>{c.label}</strong>
                      {statusBadge(c.status)}
                    </div>
                    <div style={{ fontSize: '.83rem', color: '#334155', lineHeight: 1.4 }}>{c.detail}</div>
                  </div>
                );
              })}
            </div>
            <div className="dialog-actions">
              <button type="button" className="btn primary" onClick={() => setResult(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
