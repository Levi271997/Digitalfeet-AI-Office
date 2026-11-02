'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ApprovalCard } from '@/components/ApprovalCard';
import { Sprite } from '@/components/Sprite';
import { useOffice } from '@/lib/office-context';

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const { agents, approvals, activity } = useOffice();
  const agent = agents.find((a) => a.id === id);

  return (
    <div className="page">
      <nav aria-label="Agents" className="stack" style={{ flex: '1 1 200px', maxWidth: 240, gap: 4 }}>
        {agents.map((a) => (
          <Link
            key={a.id}
            href={`/agents/${a.id}`}
            aria-current={a.id === id ? 'page' : undefined}
            className="row"
            style={{ padding: '10px 12px', borderRadius: 8, color: 'inherit', textDecoration: 'none', background: a.id === id ? 'var(--surface)' : 'transparent', fontWeight: a.id === id ? 600 : 400 }}
          >
            <span className={`dot dot-${a.status}`} />
            {a.name} · {a.role}
          </Link>
        ))}
      </nav>

      {!agent ? (
        <main className="main"><p className="muted">Connecting…</p></main>
      ) : (
        <main className="main">
          <div className="card row">
            <Sprite agent={agent} scale={3} />
            <div style={{ flexGrow: 1 }}>
              <h1 style={{ fontSize: 20 }}>{agent.name}</h1>
              <div className="muted">{agent.role} · Claude {agent.model}</div>
            </div>
            <span className="row muted"><span className={`dot dot-${agent.status}`} />{agent.activity ?? agent.status}</span>
          </div>

          {approvals.filter((a) => a.agentId === agent.id).map((a) => <ApprovalCard key={a.id} approval={a} />)}

          <section className="card stack">
            <h2 style={{ fontSize: 16 }}>Recent work</h2>
            <ol className="feed">
              {activity.filter((e) => e.agentId === agent.id).slice(0, 30).map((e) => (
                <li key={e.id}>
                  <time dateTime={e.at}>{new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  <span>{e.text}</span>
                </li>
              ))}
            </ol>
          </section>
        </main>
      )}
    </div>
  );
}
