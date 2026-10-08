import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET all budgets for user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, monthly_limit as limit FROM budgets WHERE user_id = $1 ORDER BY category ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST or UPSERT category budget for user
router.post('/', async (req, res) => {
  const { category, limit } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, category, monthly_limit)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, category) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit
       RETURNING category, monthly_limit as limit`,
      [req.user.id, category, limit]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category budget for user
router.delete('/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(`DELETE FROM budgets WHERE category = $1 AND user_id = $2`, [category, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Budget not found or unauthorized' });
    }
    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
