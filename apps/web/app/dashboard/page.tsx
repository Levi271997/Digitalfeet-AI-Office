'use client';

import Link from 'next/link';
import { ApprovalCard } from '@/components/ApprovalCard';
import { useOffice } from '@/lib/office-context';

export default function DashboardPage() {
  const { approvals, tasks, agents } = useOffice();
  const today = new Date().toDateString();
  const running = tasks.filter((t) => t.status === 'running').length;
  const doneToday = tasks.filter((t) => t.status === 'done' && t.finishedAt && new Date(t.finishedAt).toDateString() === today).length;
  const spent = tasks.reduce((sum, t) => sum + t.costUsd, 0);

  return (
    <>
      <div className="stats">
        <div className="card"><div className="muted">Waiting for approval</div><div className="stat-value" style={{ color: '#B45309' }}>{approvals.length}</div></div>
        <div className="card"><div className="muted">Tasks running</div><div className="stat-value">{running}</div></div>
        <div className="card"><div className="muted">Finished today</div><div className="stat-value">{doneToday}</div></div>
        <div className="card"><div className="muted">Spend since server start</div><div className="stat-value">${spent.toFixed(2)}</div></div>
      </div>

      <div className="page">
        <section className="main" aria-labelledby="queue">
          <h1 id="queue" style={{ fontSize: 24 }}>Needs your approval</h1>
          {approvals.length === 0 ? <p className="muted">Nothing is waiting for you.</p> : approvals.map((a) => <ApprovalCard key={a.id} approval={a} />)}
        </section>

        <aside className="side card" aria-labelledby="team">
          <h2 id="team" style={{ fontSize: 18 }}>Team</h2>
          {agents.map((a) => (
            <Link key={a.id} href={`/agents/${a.id}`} className="stack" style={{ gap: 4, color: 'inherit', textDecoration: 'none' }}>
              <div className="row">
                <span className={`dot dot-${a.status}`} />
                <strong>{a.name}</strong>
                <span className="muted">· {a.role} · {a.model}</span>
              </div>
              <div className="muted">${a.spentUsd.toFixed(2)} spent</div>
            </Link>
          ))}
        </aside>
      </div>
    </>
  );
}
