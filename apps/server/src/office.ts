import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import {
  AGENTS,
  type ActivityEntry,
  type AgentId,
  type AgentState,
  type AgentStatus,
  type ApprovalRequest,
  type OfficeEvent,
  type OfficeSnapshot,
  type OfficeTask,
} from '@ai-office/shared';

const MAX_ACTIVITY = 200;

/**
 * In-memory office state. Every change is pushed to listeners as an
 * OfficeEvent, which the WebSocket layer forwards to the web app.
 *
 * Swap this for a database (SQLite, Postgres) once you need state to survive
 * a server restart.
 */
class Office extends EventEmitter<{ event: [OfficeEvent] }> {
  private agents = new Map<AgentId, AgentState>(
    AGENTS.map((a) => [a.id, { ...a, status: 'idle', activity: null, spentUsd: 0 }]),
  );
  private approvals = new Map<string, ApprovalRequest>();
  private activity: ActivityEntry[] = [];
  private tasks = new Map<string, OfficeTask>();

  snapshot(): OfficeSnapshot {
    return {
      agents: [...this.agents.values()],
      approvals: [...this.approvals.values()],
      activity: this.activity,
      tasks: [...this.tasks.values()],
    };
  }

  setAgent(id: AgentId, status: AgentStatus, activity: string | null) {
    const agent = this.agents.get(id);
    if (!agent) return;
    agent.status = status;
    agent.activity = activity;
    this.emit('event', { type: 'agent', agent });
  }

  addSpend(id: AgentId, usd: number) {
    const agent = this.agents.get(id);
    if (!agent) return;
    agent.spentUsd += usd;
    this.emit('event', { type: 'agent', agent });
  }

  log(agentId: ActivityEntry['agentId'], text: string) {
    const entry: ActivityEntry = { id: randomUUID(), at: new Date().toISOString(), agentId, text };
    this.activity = [entry, ...this.activity].slice(0, MAX_ACTIVITY);
    this.emit('event', { type: 'activity', entry });
  }

  addApproval(approval: ApprovalRequest) {
    this.approvals.set(approval.id, approval);
    this.emit('event', { type: 'approval:new', approval });
  }

  removeApproval(id: string, decision: 'approve' | 'reject') {
    this.approvals.delete(id);
    this.emit('event', { type: 'approval:resolved', id, decision });
  }

  upsertTask(task: OfficeTask) {
    this.tasks.set(task.id, task);
    this.emit('event', { type: 'task', task });
  }
}

export const office = new Office();
