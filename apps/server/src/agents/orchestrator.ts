import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, type CanUseTool, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import type { AgentId, OfficeTask } from '@ai-office/shared';
import { requestApproval } from '../approvals.js';
import { mcpServers } from '../mcp.js';
import { office } from '../office.js';
import { policyFor } from '../policy.js';
import { AGENT_IDS, MANAGER_PROMPT, SUBAGENTS } from './roster.js';

const WORKSPACE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../workspace');

const running = new Map<string, AbortController>();

/**
 * Run one office task: Atlas (the main agent) plans it and delegates to the
 * subagents. Everything that happens is mirrored into `office`, which streams
 * it to the web app.
 */
export function startTask(prompt: string): OfficeTask {
  const task: OfficeTask = {
    id: randomUUID(),
    prompt,
    status: 'running',
    costUsd: 0,
    result: null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  office.upsertTask(task);
  office.log('human', `gave the office a task: ${prompt}`);

  const abort = new AbortController();
  running.set(task.id, abort);
  void run(task, abort).finally(() => running.delete(task.id));
  return task;
}

export function cancelTask(id: string): boolean {
  const abort = running.get(id);
  if (!abort) return false;
  abort.abort();
  return true;
}

async function run(task: OfficeTask, abort: AbortController) {
  // Which office agent a tool call or subagent message belongs to.
  // Delegation call id → role, and every tool_use id → the role that made it.
  const delegations = new Map<string, AgentId>();
  const toolOwners = new Map<string, AgentId>();

  const ownerOf = (parentToolUseId: string | null): AgentId =>
    (parentToolUseId && delegations.get(parentToolUseId)) || 'atlas';

  const canUseTool: CanUseTool = async (toolName, input, { signal, toolUseID }) => {
    const agentId = toolOwners.get(toolUseID) ?? 'atlas';
    const { action, kind } = policyFor(toolName);

    if (action === 'allow') return { behavior: 'allow', updatedInput: input };
    if (action === 'block') {
      office.log(agentId, `was blocked from using ${toolName}`);
      return { behavior: 'deny', message: `${toolName} is not allowed in this office.` };
    }

    const decision = await requestApproval({ taskId: task.id, agentId, kind, toolName, input, signal });
    office.setAgent(agentId, 'working', decision.decision === 'approve' ? `Approved: ${toolName}` : null);
    return decision.decision === 'approve'
      ? { behavior: 'allow', updatedInput: input }
      : { behavior: 'deny', message: decision.reason ?? 'A human rejected this action.' };
  };

  office.setAgent('atlas', 'working', `Planning: ${task.prompt}`);

  try {
    const stream = query({
      prompt: task.prompt,
      options: {
        cwd: WORKSPACE,
        systemPrompt: MANAGER_PROMPT,
        model: 'opus',
        agents: SUBAGENTS,
        mcpServers: mcpServers(),
        canUseTool,
        permissionMode: 'default',
        // Don't pick up the developer's own ~/.claude settings or CLAUDE.md.
        settingSources: [],
        maxTurns: 60,
        maxBudgetUsd: Number(process.env.MAX_BUDGET_USD_PER_TASK ?? 2),
        abortController: abort,
      },
    });

    for await (const message of stream) {
      handleMessage(message);
    }
  } catch (err) {
    finish('failed', err instanceof Error ? err.message : String(err));
  }

  function handleMessage(message: SDKMessage) {
    if (message.type === 'assistant') {
      const agentId = ownerOf(message.parent_tool_use_id);
      for (const block of message.message.content) {
        if (block.type !== 'tool_use') continue;
        toolOwners.set(block.id, agentId);
        const input = block.input as Record<string, unknown>;

        if ((block.name === 'Agent' || block.name === 'Task') && typeof input.subagent_type === 'string') {
          const role = input.subagent_type;
          if (AGENT_IDS.has(role)) {
            const sub = role as AgentId;
            delegations.set(block.id, sub);
            const what = String(input.description ?? 'a task');
            office.setAgent(sub, 'working', what);
            office.log(agentId, `handed “${what}” to ${sub}`);
          }
        } else {
          office.setAgent(agentId, 'working', `Using ${block.name}`);
        }
      }
    }

    if (message.type === 'user' && Array.isArray(message.message.content)) {
      for (const block of message.message.content) {
        if (block.type !== 'tool_result') continue;
        const sub = delegations.get(block.tool_use_id);
        if (sub) {
          office.setAgent(sub, 'idle', null);
          office.log(sub, 'finished and reported back to Atlas');
        }
      }
    }

    if (message.type === 'result') {
      task.costUsd = message.total_cost_usd;
      office.addSpend('atlas', message.total_cost_usd);
      if (message.subtype === 'success') finish('done', message.result);
      else if (message.subtype === 'error_max_budget_usd') finish('over-budget', 'Stopped: the task hit its spend cap.');
      else finish('failed', `Stopped: ${message.subtype}`);
    }
  }

  function finish(status: OfficeTask['status'], result: string) {
    if (task.finishedAt) return;
    task.status = status;
    task.result = result;
    task.finishedAt = new Date().toISOString();
    office.upsertTask(task);
    for (const id of new Set<AgentId>(['atlas', ...delegations.values()])) office.setAgent(id, 'idle', null);
    office.log('atlas', status === 'done' ? 'finished the task' : result);
  }
}
