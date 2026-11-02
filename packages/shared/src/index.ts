// Types shared by the server and the web app. Everything that crosses the
// WebSocket or the REST API is described here.

export type AgentId = 'atlas' | 'ops' | 'muse' | 'ledger' | 'forge' | 'scout';

export type AgentStatus = 'idle' | 'working' | 'waiting';

export type RoomId = 'manager' | 'ops' | 'marketing' | 'reporting' | 'dev' | 'meeting';

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  room: RoomId;
  model: 'opus' | 'sonnet' | 'haiku';
  /** Sprite colours for the pixel-art office. */
  sprite: { hair: string; skin: string; shirt: string };
}

export interface AgentState extends AgentProfile {
  status: AgentStatus;
  /** What the agent is doing right now, shown in its speech bubble. */
  activity: string | null;
  /** Spend attributed to this agent in the current period, in USD. */
  spentUsd: number;
}

export type ApprovalKind = 'publish' | 'deploy' | 'client-email' | 'invoice' | 'other';

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentId: AgentId;
  kind: ApprovalKind;
  toolName: string;
  /** The exact input the agent wants to call the tool with. */
  input: Record<string, unknown>;
  summary: string;
  createdAt: string;
}

export type ApprovalDecision =
  | { decision: 'approve' }
  | { decision: 'reject'; reason?: string };

export interface ActivityEntry {
  id: string;
  at: string;
  agentId: AgentId | 'human';
  text: string;
}

export type TaskStatus = 'running' | 'done' | 'failed' | 'over-budget';

export interface OfficeTask {
  id: string;
  prompt: string;
  status: TaskStatus;
  costUsd: number;
  result: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface OfficeSnapshot {
  agents: AgentState[];
  approvals: ApprovalRequest[];
  activity: ActivityEntry[];
  tasks: OfficeTask[];
}

/** Messages the server pushes over the WebSocket. */
export type OfficeEvent =
  | { type: 'snapshot'; snapshot: OfficeSnapshot }
  | { type: 'agent'; agent: AgentState }
  | { type: 'activity'; entry: ActivityEntry }
  | { type: 'approval:new'; approval: ApprovalRequest }
  | { type: 'approval:resolved'; id: string; decision: ApprovalDecision['decision'] }
  | { type: 'task'; task: OfficeTask };

export const AGENTS: AgentProfile[] = [
  { id: 'atlas', name: 'Atlas', role: 'Manager', room: 'manager', model: 'opus', sprite: { hair: '#3A2A1E', skin: '#F2C9A0', shirt: '#3048E0' } },
  { id: 'ops', name: 'Ops', role: 'Admin & ops', room: 'ops', model: 'haiku', sprite: { hair: '#C2410C', skin: '#E8B48A', shirt: '#0F766E' } },
  { id: 'muse', name: 'Muse', role: 'Marketing & content', room: 'marketing', model: 'sonnet', sprite: { hair: '#6D28D9', skin: '#C68B5E', shirt: '#DB2777' } },
  { id: 'ledger', name: 'Ledger', role: 'Client reporting', room: 'reporting', model: 'sonnet', sprite: { hair: '#1E293B', skin: '#8D5A3B', shirt: '#B45309' } },
  { id: 'forge', name: 'Forge', role: 'Web design & dev', room: 'dev', model: 'opus', sprite: { hair: '#141A2A', skin: '#F2C9A0', shirt: '#334155' } },
  { id: 'scout', name: 'Scout', role: 'QA', room: 'dev', model: 'haiku', sprite: { hair: '#A16207', skin: '#E8B48A', shirt: '#64748B' } },
];

export const ROOMS: { id: RoomId; label: string }[] = [
  { id: 'manager', label: "Manager's office" },
  { id: 'ops', label: 'Ops desk' },
  { id: 'marketing', label: 'Marketing studio' },
  { id: 'reporting', label: 'Reporting room' },
  { id: 'dev', label: 'Dev lab' },
  { id: 'meeting', label: 'Meeting room' },
];
