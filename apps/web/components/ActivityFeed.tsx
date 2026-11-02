'use client';

import { useOffice } from '@/lib/office-context';

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const { activity, agents } = useOffice();
  const nameOf = (id: string) => (id === 'human' ? 'You' : (agents.find((a) => a.id === id)?.name ?? id));

  if (activity.length === 0) return <p className="muted">Nothing yet. Give the office a task to get started.</p>;

  return (
    <ol className="feed">
      {activity.slice(0, limit).map((e) => (
        <li key={e.id}>
          <time dateTime={e.at}>{new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
          <span>
            <strong>{nameOf(e.agentId)}</strong> {e.text}
          </span>
        </li>
      ))}
    </ol>
  );
}
