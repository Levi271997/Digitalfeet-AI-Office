# CLAUDE.md

Context for Claude Code when working in this repo.

## What this is

Digitalfeet AI Office: Claude agents as office staff for a small web agency, with a pixel-art office UI and a human approval queue. npm workspaces monorepo, TypeScript throughout.

- `apps/server`: Express 5 + `ws` + `@anthropic-ai/claude-agent-sdk`. Run with `tsx` (no build step). ESM, so relative imports end in `.js`.
- `apps/web`: Next.js 16 (App Router, Turbopack), React 19, plain CSS in `app/globals.css` (no Tailwind). `/api/*` is rewritten to the server; live state comes over the WebSocket in `lib/office-context.tsx`.
- `packages/shared`: types and the `AGENTS` / `ROOMS` roster, consumed as TS source (`transpilePackages` in Next).

## Commands

- `npm run dev`: server (:4000) and web (:3000) together
- `npm run typecheck`: all workspaces
- `npm run build`: production build of the web app

## Teams

The office mirrors Digitalfeet's five teams (`TeamId` in shared; each is a room on the floor):

- Office management: Ops
- Marketing: Muse
- Project management: Compass (boards, timelines), Ledger (client reporting)
- Development: Forge (WordPress, deploys), Scout (QA)
- Design: Pixel (Figma, Canva)

Atlas (manager) sits above the teams. Adding an agent means updating `AgentId` + `AGENTS` in shared, `SUBAGENTS` and the team list in `MANAGER_PROMPT` in roster.ts.

## Key decisions

- Atlas is the SDK's main agent; the other roles are `agents` subagents (`apps/server/src/agents/roster.ts`). Their ids must match `AgentId` in shared.
- Human approval runs through `canUseTool` + `apps/server/src/policy.ts`: the callback awaits a promise resolved by `POST /api/approvals/:id`. Unknown tools default to needing approval. `Bash` is blocked.
- Tool calls are attributed to agents by mapping `parent_tool_use_id` of streamed messages to the delegating `Agent`/`Task` tool_use id.
- `settingSources: []` so the developer's own Claude settings don't leak into agent runs. Agents work in `apps/server/workspace/` (git-ignored).
- Every run has `maxBudgetUsd` from `MAX_BUDGET_USD_PER_TASK`.
- Office state is in memory (`apps/server/src/office.ts`); no database yet.
- UI design follows the canvas "AI Office UI Concepts" (office floor, dashboard + approvals, agent desk). Its source is copied into `docs/design/` (see the README there); the canvas is the place to edit it.

## Commit rules

- Author must be Levi271997 only. Never add a `Co-Authored-By` trailer.
- Update this file after each commit so it reflects the current state.

## Status

- [x] Boilerplate: server, web app, shared types, approval queue, policy, MCP config from env
- [x] Roster organised into the five Digitalfeet teams (added Compass and Pixel)
- [x] Design canvas updated to the five teams and its source added to `docs/design/`
- [ ] Persistence (SQLite/Postgres)
- [ ] Auth for the dashboard
- [ ] Real connector tokens and per-role testing
- [ ] Scheduled / always-on tasks
