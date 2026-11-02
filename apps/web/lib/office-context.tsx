'use client';

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react';
import type { ApprovalDecision, OfficeEvent, OfficeSnapshot } from '@ai-office/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000/ws';

const empty: OfficeSnapshot = { agents: [], approvals: [], activity: [], tasks: [] };

function reducer(state: OfficeSnapshot, event: OfficeEvent): OfficeSnapshot {
  switch (event.type) {
    case 'snapshot':
      return event.snapshot;
    case 'agent':
      return { ...state, agents: state.agents.map((a) => (a.id === event.agent.id ? event.agent : a)) };
    case 'activity':
      return { ...state, activity: [event.entry, ...state.activity].slice(0, 200) };
    case 'approval:new':
      return { ...state, approvals: [...state.approvals, event.approval] };
    case 'approval:resolved':
      return { ...state, approvals: state.approvals.filter((a) => a.id !== event.id) };
    case 'task': {
      const others = state.tasks.filter((t) => t.id !== event.task.id);
      return { ...state, tasks: [...others, event.task] };
    }
  }
}

type OfficeValue = OfficeSnapshot & {
  connected: boolean;
  startTask: (prompt: string) => Promise<void>;
  decide: (approvalId: string, decision: ApprovalDecision) => Promise<void>;
};

const OfficeContext = createContext<OfficeValue | null>(null);

/** One WebSocket for the whole app; every page reads live office state from here. */
export function OfficeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, empty);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(WS_URL);
      socket.onopen = () => setConnected(true);
      socket.onmessage = (e) => dispatch(JSON.parse(e.data) as OfficeEvent);
      socket.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 2000);
      };
    };
    connect();

    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, []);

  const value: OfficeValue = {
    ...state,
    connected,
    startTask: async (prompt) => {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
    },
    decide: async (approvalId, decision) => {
      await fetch(`/api/approvals/${approvalId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(decision) });
    },
  };

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>;
}

export function useOffice(): OfficeValue {
  const value = useContext(OfficeContext);
  if (!value) throw new Error('useOffice must be used inside <OfficeProvider>');
  return value;
}
