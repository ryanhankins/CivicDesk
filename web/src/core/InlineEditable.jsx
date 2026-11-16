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
import { useToast } from './toast.jsx';

export function InlineEditable({
  value,
  placeholder = '',
  required = false,
  multiline = false,
  listId = '',
  title = 'Click to edit',
  className = '',
  as: Tag = 'span',
  style = {},
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);
  const doneRef = useRef(false);
  const showToast = useToast();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) inputRef.current.select();
    }
  }, [editing, multiline]);

  const startEdit = (e) => {
    e?.stopPropagation?.();
    doneRef.current = false;
    setDraft(value || '');
    setEditing(true);
  };

  const cancel = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
  };

  const commit = async () => {
    if (doneRef.current) return;
    const next = draft.trim();
    if (required && !next) { cancel(); return; }
    if (next === (value || '').trim()) { cancel(); return; }
    doneRef.current = true;
    setEditing(false);
    try {
      await onSave(next);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (editing) {
    const commonProps = {
      ref: inputRef,
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onClick: (e) => e.stopPropagation(),
      onKeyDown: (e) => {
        if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
        if (multiline && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
      },
      style: { font: 'inherit', width: '100%', minWidth: '220px', padding: '.25rem .45rem' },
    };
    return multiline
      ? <textarea rows={2} {...commonProps} />
      : <input list={listId || undefined} {...commonProps} />;
  }

  const display = (value || '').trim();
  const emptyCls = !display && placeholder ? ' editable-empty' : '';
  return (
    <Tag
      className={`editable${emptyCls}${className ? ` ${className}` : ''}`}
      title={title}
      style={style}
      onClick={startEdit}
    >
      {display || placeholder}
    </Tag>
  );
}
