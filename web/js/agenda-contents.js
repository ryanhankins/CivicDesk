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

export function renderContentsView(agenda) {
  const hdr = document.getElementById('contents-header');
  hdr.textContent = '';
  if (agenda.body) {
    const b = document.createElement('div');
    b.style.cssText = 'font-weight:700; color:#1e40af; font-size:.95rem; margin-bottom:.2rem;';
    b.textContent = agenda.body;
    hdr.appendChild(b);
  }
  const t = document.createElement('div');
  t.style.cssText = 'font-size:1.15rem; font-weight:700;';
  t.textContent = agenda.title;
  hdr.appendChild(t);
  if (agenda.meeting_date) {
    const d = document.createElement('div');
    d.className = 'muted';
    d.textContent = `Meeting Date: ${agenda.meeting_date}`;
    hdr.appendChild(d);
  }

  const toc = document.getElementById('toc-list');
  const ordered = document.getElementById('ordered-items');
  toc.textContent = '';
  ordered.textContent = '';

  if (!agenda.items.length) {
    ordered.innerHTML = '<p class="muted">No items in this agenda yet.</p>';
    return;
  }

  for (const item of agenda.items) {
    const li = document.createElement('li');
    li.textContent = item.title;
    if (item.documents.length) {
      const sub = document.createElement('ul');
      sub.className = 'toc-docs';
      for (const d of item.documents) {
        const dli = document.createElement('li');
        dli.textContent = `${item.position}.${d.position} ${d.title} [${d.doc_type}]`;
        sub.appendChild(dli);
      }
      li.appendChild(sub);
    }
    toc.appendChild(li);

    const sec = document.createElement('div');
    sec.style.padding = '.85rem 0';
    sec.style.borderBottom = '1px solid #e4e7eb';
    const h = document.createElement('h3');
    h.style.margin = '0 0 .35rem';
    h.textContent = `${item.position}. ${item.title}`;
    sec.appendChild(h);
    if (item.description) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.style.margin = '0 0 .5rem';
      p.textContent = item.description;
      sec.appendChild(p);
    }
    if (item.documents.length) {
      const ul = document.createElement('ul');
      ul.className = 'doc-list';
      for (const d of item.documents) {
        const dli = document.createElement('li');
        const left = document.createElement('span');
        left.textContent = `${item.position}.${d.position} ${d.title} (${d.doc_type})`;
        const right = document.createElement('div');
        right.className = 'actions';
        const aPdf = document.createElement('a');
        aPdf.className = 'btn sm';
        aPdf.href = `/api/agendas/${agenda.id}/documents/${d.id}/pdf`;
        aPdf.target = '_blank';
        aPdf.textContent = 'View PDF';
        right.appendChild(aPdf);
        if (d.doc_type !== 'PDF') {
          const aOrig = document.createElement('a');
          aOrig.className = 'btn sm';
          aOrig.href = `/api/agendas/${agenda.id}/documents/${d.id}/download`;
          aOrig.target = '_blank';
          aOrig.textContent = `Original (${d.doc_type})`;
          right.appendChild(aOrig);
        }
        dli.append(left, right);
        ul.appendChild(dli);
      }
      sec.appendChild(ul);
    } else {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'No supporting documents.';
      sec.appendChild(p);
    }
    ordered.appendChild(sec);
  }
}
