import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET user investments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, amount, TO_CHAR(date, 'YYYY-MM-DD') as date, platform, linked_goal_id as "linkedGoalId"
       FROM investments
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new investment
router.post('/', async (req, res) => {
  const { id, type, amount, date, platform, linkedGoalId } = req.body;

  if (!type || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Investment type and amount are required.' });
  }

  const invId = id || 'inv-' + Date.now();
  const invAmt = Number(amount) || 0;
  const invDate = (date && String(date).trim()) ? String(date).trim() : new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `INSERT INTO investments (id, user_id, type, amount, date, platform, linked_goal_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, amount, TO_CHAR(date, 'YYYY-MM-DD') as date, platform, linked_goal_id as "linkedGoalId"`,
      [invId, req.user.id, type, invAmt, invDate, platform || type, linkedGoalId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding investment:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT edit investment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, amount, date, platform, linkedGoalId } = req.body;

  if (!type || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Investment type and amount are required.' });
  }

  const invAmt = Number(amount) || 0;
  const invDate = (date && String(date).trim()) ? String(date).trim() : new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `UPDATE investments
       SET type = $1, amount = $2, date = $3, platform = $4, linked_goal_id = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, type, amount, TO_CHAR(date, 'YYYY-MM-DD') as date, platform, linked_goal_id as "linkedGoalId"`,
      [type, invAmt, invDate, platform || type, linkedGoalId || null, id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Investment not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating investment:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE investment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM investments WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Investment not found or unauthorized' });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
