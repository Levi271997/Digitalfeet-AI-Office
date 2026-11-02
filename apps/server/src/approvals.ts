import { randomUUID } from 'node:crypto';
import type { AgentId, ApprovalDecision, ApprovalKind } from '@ai-office/shared';
import { office } from './office.js';

type Pending = { resolve: (d: ApprovalDecision) => void };

const pending = new Map<string, Pending>();

/**
 * Put a tool call in the approval queue and wait for a human.
 * The agent stays paused (its canUseTool callback is awaiting this promise)
 * until someone approves or rejects it, or the task is aborted.
 */
export function requestApproval(args: {
  taskId: string;
  agentId: AgentId;
  kind: ApprovalKind;
  toolName: string;
  input: Record<string, unknown>;
  signal: AbortSignal;
}): Promise<ApprovalDecision> {
  const id = randomUUID();
  const summary = `${args.toolName.replace(/^mcp__/, '').replace(/__/g, ' → ')}`;

  office.addApproval({
    id,
    taskId: args.taskId,
    agentId: args.agentId,
    kind: args.kind,
    toolName: args.toolName,
    input: args.input,
    summary,
    createdAt: new Date().toISOString(),
  });
  office.setAgent(args.agentId, 'waiting', `Waiting for approval: ${summary}`);
  office.log(args.agentId, `asked for approval: ${summary}`);

  return new Promise((resolve) => {
    pending.set(id, { resolve });
    args.signal.addEventListener('abort', () => resolveApproval(id, { decision: 'reject', reason: 'Task was cancelled.' }), { once: true });
  });
}

export function resolveApproval(id: string, decision: ApprovalDecision): boolean {
  const entry = pending.get(id);
  if (!entry) return false;
  pending.delete(id);
  office.removeApproval(id, decision.decision);
  entry.resolve(decision);
  return true;
}
