'use client';

import { useState, type FormEvent } from 'react';
import { useOffice } from '@/lib/office-context';

export function TaskForm() {
  const { startTask, connected } = useOffice();
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSending(true);
    try {
      await startTask(prompt.trim());
      setPrompt('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="stack">
      <label htmlFor="task">Give the office a task</label>
      <textarea
        id="task"
        className="field"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g. Prepare the November maintenance summary for all hosting clients"
      />
      <button type="submit" className="btn btn-primary" disabled={!connected || sending}>
        {sending ? 'Sending…' : 'Send to Atlas'}
      </button>
    </form>
  );
}
