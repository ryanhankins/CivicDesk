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

/**
 * Frontend pluggable module registry.
 * Each module registers:
 *   - id: string (matches backend CivicModule.id)
 *   - routes: Array<{ match: (hash) => object | null, component: React.LazyExoticComponent }>
 *   - prefNavItems: Array<{ section: string, label: string, permission?: string }>
 */
const MODULE_LOADERS = {
  agendas: () => import('../modules/agendas/index.jsx'),
  permits: () => import('../modules/permits/index.jsx'),
  codification: () => import('../modules/codification/index.jsx'),
};

export async function loadEnabledFrontendModules(enabledModuleIds) {
  const loaded = {};
  await Promise.all(
    enabledModuleIds
      .filter(id => typeof MODULE_LOADERS[id] === 'function')
      .map(async (id) => {
        const mod = await MODULE_LOADERS[id]();
        loaded[id] = mod.default || mod;
      }),
  );
  return loaded;
}
