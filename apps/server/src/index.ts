import { createServer } from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';
import type { ApprovalDecision, OfficeEvent } from '@ai-office/shared';
import { cancelTask, startTask } from './agents/orchestrator.js';
import { resolveApproval } from './approvals.js';
import { office } from './office.js';

const PORT = Number(process.env.PORT ?? 4000);
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', WEB_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/state', (_req, res) => {
  res.json(office.snapshot());
});

app.post('/api/tasks', (req, res) => {
  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  res.status(201).json(startTask(prompt));
});

app.post('/api/tasks/:id/cancel', (req, res) => {
  res.json({ cancelled: cancelTask(req.params.id) });
});

app.post('/api/approvals/:id', (req, res) => {
  const body = req.body as Partial<ApprovalDecision> & { reason?: string };
  if (body.decision !== 'approve' && body.decision !== 'reject') {
    return res.status(400).json({ error: 'decision must be "approve" or "reject"' });
  }
  const decision: ApprovalDecision =
    body.decision === 'approve' ? { decision: 'approve' } : { decision: 'reject', reason: body.reason };
  if (!resolveApproval(req.params.id, decision)) return res.status(404).json({ error: 'No pending approval with that id' });
  office.log('human', `${decision.decision === 'approve' ? 'approved' : 'rejected'} a request`);
  res.json({ ok: true });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket) => {
  const send = (event: OfficeEvent) => socket.send(JSON.stringify(event));
  send({ type: 'snapshot', snapshot: office.snapshot() });
  office.on('event', send);
  socket.on('close', () => office.off('event', send));
});

server.listen(PORT, () => {
  console.log(`AI office server on http://localhost:${PORT} (WebSocket at /ws)`);
  if (!process.env.ANTHROPIC_API_KEY) console.warn('ANTHROPIC_API_KEY is not set: tasks will fail until you add it to apps/server/.env');
});
