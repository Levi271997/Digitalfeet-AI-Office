# Digitalfeet AI Office

A virtual office where Claude agents work as Digitalfeet staff. A manager agent (Atlas) takes a task, splits it up and hands the pieces to specialists. You watch them on a pixel-art office floor and approve anything risky before it happens.

The office mirrors Digitalfeet's five teams. Each team has its own room on the office floor.

| Team | Agent | Does | Model |
|---|---|---|---|
| (Manager) | Atlas | Plans each task and hands it to the right team | Opus |
| Office management | Ops | Scheduling, meeting notes, invoices, internal admin | Haiku |
| Marketing | Muse | Copy, social posts, SEO, campaigns | Sonnet |
| Project management | Compass | ClickUp/monday.com boards, timelines, client status updates | Sonnet |
| Project management | Ledger | Quarterly client reports, audits, report emails | Sonnet |
| Development | Forge | WordPress builds, plugin updates, Netlify deploys | Opus |
| Development | Scout | QA: checks pages, links and forms | Haiku |
| Design | Pixel | Website and UI designs in Figma, assets in Canva | Sonnet |

## Structure

```
apps/server     Node + TypeScript. Runs the agents with the Claude Agent SDK,
                holds the approval queue, streams events over a WebSocket.
apps/web        Next.js. Office floor (/), dashboard (/dashboard),
                agent desk (/agents/[id]).
packages/shared Types and the agent roster shared by both apps.
```

## Getting started

Requirements: Node 20+ and an Anthropic API key.

```bash
npm install
cp .env.example apps/server/.env   # then add ANTHROPIC_API_KEY
npm run dev                        # server on :4000, web on :3000
```

Open http://localhost:3000, type a task in **Give the office a task**, and watch the agents pick it up.

## How it works

1. `POST /api/tasks` starts a run in [apps/server/src/agents/orchestrator.ts](apps/server/src/agents/orchestrator.ts). Atlas is the main agent; the other roles are SDK subagents defined in [roster.ts](apps/server/src/agents/roster.ts).
2. Every tool call goes through `canUseTool`, which checks [policy.ts](apps/server/src/policy.ts):
   - **allow**: reading, local file work in `apps/server/workspace/`, delegating, ClickUp/monday.com updates
   - **approve**: publishing or changing WordPress, Netlify deploys, client emails, invoices, and any tool no rule covers
   - **block**: `Bash`
3. An "approve" call pauses the agent and shows up on the dashboard. Approve or reject it there and the agent carries on.
4. Each run is capped by `MAX_BUDGET_USD_PER_TASK` (the SDK has no spend limit by default).

## Connectors

Set `<NAME>_MCP_URL` and `<NAME>_MCP_TOKEN` in `apps/server/.env` for ClickUp, monday.com, Figma, Canva, Fireflies, WordPress or Netlify. A connector without a URL is skipped. The SDK does not run OAuth sign-ins for a headless server, so get each token yourself.

## Not built yet

- State is in memory and resets when the server restarts.
- No login: anyone who can reach the web app can approve actions. Add auth before putting it on a network.
- Agents only run when given a task; there are no always-on agents or scheduled jobs yet.
