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

export const DEFAULT_THEME = {
  theme_primary: '#2563eb',
  theme_secondary: '#1d4ed8',
  theme_tint: '#e6f0ff',
  theme_bg: '#f3f5f8',
  theme_surface: '#ffffff',
  theme_header_bg: '#ffffff',
};

export const THEME_PRESETS = [
  {
    id: 'default',
    label: 'CivicDesk Blue (Default)',
    colors: { ...DEFAULT_THEME },
  },
  {
    id: 'birchwood',
    label: 'Birchwood Forest',
    colors: {
      theme_primary: '#2d4a2d',
      theme_secondary: '#4a7c59',
      theme_tint: '#e8f0e8',
      theme_bg: '#f4f7f4',
      theme_surface: '#ffffff',
      theme_header_bg: '#ffffff',
    },
  },
];

function isDarkHex(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec((hex || '').trim());
  if (!m) return false;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum < 0.45;
}

export function applyTheme(theme = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  const primary = theme.theme_primary || DEFAULT_THEME.theme_primary;
  const secondary = theme.theme_secondary || DEFAULT_THEME.theme_secondary;
  const tint = theme.theme_tint || DEFAULT_THEME.theme_tint;
  const bg = theme.theme_bg || DEFAULT_THEME.theme_bg;
  const surface = theme.theme_surface || DEFAULT_THEME.theme_surface;
  const headerBg = theme.theme_header_bg || DEFAULT_THEME.theme_header_bg;
  const darkHeader = isDarkHex(headerBg);

  root.setProperty('--cd-primary', primary);
  root.setProperty('--cd-secondary', secondary);
  root.setProperty('--cd-tint', tint);
  root.setProperty('--cd-bg', bg);
  root.setProperty('--cd-surface', surface);
  root.setProperty('--cd-header-bg', headerBg);
  root.setProperty('--cd-header-text', darkHeader ? '#ffffff' : '#18181c');
  root.setProperty('--cd-header-muted', darkHeader ? 'rgba(255, 255, 255, 0.85)' : '#52606d');
  root.setProperty('--cd-border', `color-mix(in srgb, ${secondary} 28%, #d9e2ec)`);
}
