'use client';

import Link from 'next/link';
import type { ApprovalRequest } from '@ai-office/shared';
import { useOffice } from '@/lib/office-context';

const KIND_LABEL: Record<ApprovalRequest['kind'], string> = {
  publish: 'Publish to live site',
  deploy: 'Deploy',
  'client-email': 'Client email',
  invoice: 'Invoice',
  other: 'Needs approval',
};

export function ApprovalCard({ approval }: { approval: ApprovalRequest }) {
  const { decide, agents } = useOffice();
  const agent = agents.find((a) => a.id === approval.agentId);

  return (
    <article className="card stack">
      <div className="row">
        <span className={`tag tag-${approval.kind}`}>{KIND_LABEL[approval.kind]}</span>
        <span className="muted">
          Requested by <strong>{agent?.name ?? approval.agentId}</strong> · {new Date(approval.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <h2 style={{ fontSize: 18 }}>{approval.summary}</h2>
      <pre className="code">{JSON.stringify(approval.input, null, 2)}</pre>
      <div className="row">
        <button type="button" className="btn btn-approve" onClick={() => decide(approval.id, { decision: 'approve' })}>
          Approve
        </button>
        <button
          type="button"
          className="btn btn-reject"
          onClick={() => decide(approval.id, { decision: 'reject', reason: 'Rejected from the dashboard.' })}
        >
          Reject
        </button>
        <Link href={`/agents/${approval.agentId}`} style={{ marginLeft: 'auto', fontSize: 14 }}>
          Open {agent?.name ?? 'agent'}&apos;s desk
        </Link>
      </div>
    </article>
  );
}
