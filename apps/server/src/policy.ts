import type { ApprovalKind } from '@ai-office/shared';

/**
 * What each tool call is allowed to do without a human.
 *
 * - allow:   runs straight away
 * - approve: pauses the agent until someone approves it on the dashboard
 * - block:   always refused
 *
 * Rules are checked in order and the first match wins. MCP tools are named
 * `mcp__<server>__<tool>`, so patterns can target a whole connector or one tool.
 * Anything that matches no rule needs approval: unknown tools are never
 * auto-allowed.
 */
type Rule = { pattern: RegExp; action: 'allow' | 'approve' | 'block'; kind?: ApprovalKind };

const RULES: Rule[] = [
  // Read-only and local work.
  { pattern: /^(Read|Glob|Grep|WebSearch|WebFetch|TodoWrite)$/, action: 'allow' },
  { pattern: /^(Write|Edit)$/, action: 'allow' }, // confined to the server's workspace/ folder
  { pattern: /^(Agent|Task)$/, action: 'allow' }, // delegating to a teammate

  // Shell access is the easiest way around every other rule.
  { pattern: /^Bash$/, action: 'block' },

  // Anything that reaches clients or the public.
  { pattern: /^mcp__wordpress__.*(publish|update|delete|install|activate)/i, action: 'approve', kind: 'publish' },
  { pattern: /^mcp__netlify__.*(deploy|delete)/i, action: 'approve', kind: 'deploy' },
  { pattern: /(send_?email|gmail|outlook)/i, action: 'approve', kind: 'client-email' },
  { pattern: /invoice/i, action: 'approve', kind: 'invoice' },

  // Reading from connectors is fine.
  { pattern: /^mcp__[a-z0-9_-]+__.*(get|list|search|read|fetch)/i, action: 'allow' },

  // Internal project management writes.
  { pattern: /^mcp__(clickup|monday)__/, action: 'allow' },
];

export function policyFor(toolName: string): { action: Rule['action']; kind: ApprovalKind } {
  const rule = RULES.find((r) => r.pattern.test(toolName));
  if (!rule) return { action: 'approve', kind: 'other' };
  return { action: rule.action, kind: rule.kind ?? 'other' };
}
