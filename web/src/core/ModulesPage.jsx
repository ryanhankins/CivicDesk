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
import { api } from './api.js';
import { useToast } from './toast.jsx';

export default function ModulesPage({ onModulesChanged }) {
  const [modules, setModules] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const showToast = useToast();

  const loadModules = useCallback(async () => {
    const list = await api('/api/modules/admin');
    setModules(Array.isArray(list) ? list : []);
  }, []);

  useEffect(() => {
    loadModules().catch(e => showToast(e.message, 'error'));
  }, [loadModules, showToast]);

  const handleToggle = async (mod) => {
    setBusyId(mod.id);
    try {
      const updated = await api(`/api/modules/admin/${mod.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled: !mod.enabled }),
      });
      setModules(Array.isArray(updated) ? updated : []);
      showToast(`${mod.name} ${!mod.enabled ? 'enabled' : 'disabled'}`, 'ok');
      await onModulesChanged?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section id="section-modules">
      <h1>Manage Modules</h1>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Enable or disable pluggable CivicDesk modules. Disabling a module hides its navigation and disables its API routes while preserving its database records.
        </p>
        <table>
          <thead>
            <tr>
              <th>Module</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m.id}>
                <td>
                  <strong>{m.name}</strong>
                  <div className="muted" style={{ fontSize: '.8rem' }}>{m.id}</div>
                </td>
                <td>{m.description}</td>
                <td className="muted" style={{ fontSize: '.82rem' }}>
                  {(m.permissions || []).map(p => p.key).join(', ') || '—'}
                </td>
                <td>
                  <span className={`badge ${m.enabled ? 'active' : 'disabled'}`}>
                    {m.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={`btn sm${m.enabled ? ' danger' : ' primary'}`}
                    disabled={busyId === m.id}
                    onClick={() => handleToggle(m)}
                  >
                    {m.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
