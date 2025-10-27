import express from 'express';
import * as queueService from '../services/queueService';
import { getIO } from '../socket';

const router = express.Router();

router.post('/', async (req, res) => {
  const { patientName, specialty, scheduledAt, consultRoom } = req.body;
  if (!patientName || !specialty) return res.status(400).json({ error: 'patientName and specialty required' });
  const created = await queueService.createTurn(patientName, specialty, scheduledAt, consultRoom);
  getIO().to('global').emit('queue.add', created);
  return res.status(201).json(created);
});

router.get('/', async (req, res) => {
  const { status, specialty } = req.query;
  const rows = await queueService.listTurns({ status: status as string | undefined, specialty: specialty as string | undefined });
  return res.json(rows);
});

router.post('/next', async (req, res) => {
  const { specialty } = req.body;
  if (!specialty) return res.status(400).json({ error: 'specialty required' });
  const next = await queueService.getNextTurnAndMarkCalled(specialty);
  if (!next) return res.status(404).json({ error: 'No waiting turns' });
  getIO().to(specialty).emit('queue.update', next);
  getIO().to('global').emit('queue.update', next);
  return res.json(next);
});

router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const done = await queueService.markTurnCompleted(id);
  getIO().to('global').emit('queue.update', done);
  return res.json(done);
});

export default router;
