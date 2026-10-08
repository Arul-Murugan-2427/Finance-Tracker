import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all transaction routes
router.use(authMiddleware);

// GET user transactions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, amount, category, TO_CHAR(date, 'YYYY-MM-DD') as date, note, tags
       FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction for user
router.post('/', async (req, res) => {
  const { id, type, amount, category, date, note, tags } = req.body;

  if (!type || !category || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Type, category, and amount are required.' });
  }

  const txId = id || 'tx-' + Date.now();
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return res.status(400).json({ error: 'Amount must be a valid number.' });
  }

  const txDate = (date && String(date).trim()) ? String(date).trim() : new Date().toISOString().split('T')[0];
  const txTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []);

  try {
    const result = await pool.query(
      `INSERT INTO transactions (id, user_id, type, amount, category, date, note, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, type, amount, category, TO_CHAR(date, 'YYYY-MM-DD') as date, note, tags`,
      [txId, req.user.id, type, numAmount, category, txDate, note || '', txTags]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT edit transaction for user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, date, note, tags } = req.body;

  if (!type || !category || amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Type, category, and amount are required.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return res.status(400).json({ error: 'Amount must be a valid number.' });
  }

  const txDate = (date && String(date).trim()) ? String(date).trim() : new Date().toISOString().split('T')[0];
  const txTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : []);

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, amount = $2, category = $3, date = $4, note = $5, tags = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, type, amount, category, TO_CHAR(date, 'YYYY-MM-DD') as date, note, tags`,
      [type, numAmount, category, txDate, note || '', txTags, id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction for user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

