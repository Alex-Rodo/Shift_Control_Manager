import pool from '../db';

export type TurnRow = {
  id: string;
  patient_name: string;
  specialty: string;
  consult_room: string | null;
  scheduled_at: string | null;
  created_at: string;
  status: string;
};

export async function createTurn(patientName: string, specialty: string, scheduledAt?: string | null, consultRoom?: string | null) {
  const res = await pool.query<TurnRow>(
    `INSERT INTO turns (patient_name, specialty, scheduled_at, consult_room) VALUES ($1,$2,$3,$4) RETURNING *`,
    [patientName, specialty, scheduledAt || null, consultRoom || null]
  ); 
  return res.rows[0];
}

export async function listTurns(filter: { status?: string; specialty?: string }) {
  const conditions: string[] = [];
  const params: any[] = [];
  if (filter.status) {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filter.specialty) {
    params.push(filter.specialty);
    conditions.push(`specialty = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const q = `SELECT * FROM turns ${where} ORDER BY scheduled_at NULLS LAST, created_at`;
  const res = await pool.query<TurnRow>(q, params);
  return res.rows;
}

export async function getNextTurnAndMarkCalled(specialty: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sel = await client.query<TurnRow>(
      `SELECT * FROM turns
       WHERE specialty = $1 AND status = 'waiting'
       ORDER BY scheduled_at NULLS LAST, created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1`,
      [specialty]
    );
    if (sel.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const id = sel.rows[0].id;
    await client.query(`UPDATE turns SET status='called' WHERE id=$1`, [id]);
    const updated = await client.query<TurnRow>(`SELECT * FROM turns WHERE id=$1`, [id]);
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function markTurnCompleted(id: string) {
  const res = await pool.query<TurnRow>(`UPDATE turns SET status='completed' WHERE id=$1 RETURNING *`, [id]);
  return res.rows[0];
}
