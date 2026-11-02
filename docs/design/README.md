# UI design

Source of the "AI Office UI Concepts" design canvas: https://claude.ai/artifact/SstKKsomvSKjxk23qicRZm (private; share it from the canvas's Share menu).

| File | Screen | Built as |
|---|---|---|
| `Main.dc.html` | Office floor: one room per team, agents with status bubbles, live activity | `apps/web/app/page.tsx` |
| `Approvals.dc.html` | Manager dashboard: stats, approval queue, team budgets | `apps/web/app/dashboard/page.tsx` |
| `Agent.dc.html` | Agent desk: chat, tool steps, approval card, permissions, memory | `apps/web/app/agents/[id]/page.tsx` |

These are the canvas's own files, kept here for reference. Edit the design on the canvas, then copy the files back here.
