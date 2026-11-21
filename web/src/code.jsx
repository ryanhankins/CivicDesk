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

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../app.css';
import { PublicFooter, PublicHeader, UrgentAlertBanner } from './core/PublicChrome.jsx';
import { applyTheme } from './core/theme.js';
import CodeLibraryViewer from './modules/codification/CodeLibraryViewer.jsx';

function PublicCityCode() {
  const [branding, setBranding] = useState({ city_title: '', has_city_logo: false });

  useEffect(() => {
    fetch('/api/branding').then(r => (r.ok ? r.json() : null)).then(b => {
      if (b) {
        setBranding(b);
        applyTheme(b);
        document.title = b.city_title ? `${b.city_title} - City Code` : 'City Code - DocketHall';
      }
    }).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
      <UrgentAlertBanner branding={branding} />
      <PublicHeader branding={branding} subtitle="City Code" logoHeight={56}>
        <a className="btn sm" href="/portal">Permits Portal</a>
        <a className="btn sm primary" href="/">Sign In</a>
      </PublicHeader>

      <main style={{ margin: '0 auto', width: '100%', maxWidth: '1440px', padding: '1rem 1.25rem', boxSizing: 'border-box' }}>
        <CodeLibraryViewer branding={branding} standalone />
      </main>
      <PublicFooter branding={branding} />
    </div>
  );
}

createRoot(document.getElementById('code-root')).render(
  <React.StrictMode>
    <PublicCityCode />
  </React.StrictMode>,
);
