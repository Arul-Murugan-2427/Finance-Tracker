import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET all goals for user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, category, target_amount as "targetAmount", current_amount as "currentAmount",
              base_amount as "baseAmount", manual_topups as "manualTopUps", TO_CHAR(deadline, 'YYYY-MM-DD') as deadline,
              icon, TO_CHAR(created_at, 'YYYY-MM-DD') as "createdAt"
       FROM goals
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new goal for user
router.post('/', async (req, res) => {
  const { id, name, category, targetAmount, currentAmount, deadline, icon } = req.body;
  const goalId = id || 'goal-' + Date.now();

  try {
    const result = await pool.query(
      `INSERT INTO goals (id, user_id, name, category, target_amount, current_amount, base_amount, deadline, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, category, target_amount as "targetAmount", current_amount as "currentAmount",
                 base_amount as "baseAmount", manual_topups as "manualTopUps", TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, icon`,
      [goalId, req.user.id, name, category, targetAmount, currentAmount || 0, currentAmount || 0, deadline || null, icon || '🎯']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit goal for user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, targetAmount, currentAmount, deadline, icon } = req.body;

  const targetAmt = Number(targetAmount) || 0;
  const currentAmt = Number(currentAmount) || 0;
  const goalDeadline = (deadline && String(deadline).trim()) ? String(deadline).trim() : null;

  try {
    const result = await pool.query(
      `UPDATE goals
       SET name = $1, category = $2, target_amount = $3, current_amount = $4, deadline = $5, icon = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, name, category, target_amount as "targetAmount", current_amount as "currentAmount",
                 base_amount as "baseAmount", manual_topups as "manualTopUps", TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, icon`,
      [name, category, targetAmt, currentAmt, goalDeadline, icon || '🎯', id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating goal:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST manual top-up to goal for user
router.post('/:id/topup', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const topupVal = Number(amount);

  try {
    const result = await pool.query(
      `UPDATE goals
       SET manual_topups = manual_topups + $1,
           current_amount = current_amount + $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, name, category, target_amount as "targetAmount", current_amount as "currentAmount",
                 base_amount as "baseAmount", manual_topups as "manualTopUps", TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, icon`,
      [topupVal, id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE goal for user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE investments SET linked_goal_id = NULL WHERE linked_goal_id = $1 AND user_id = $2`, [id, req.user.id]);
    const result = await pool.query(`DELETE FROM goals WHERE id = $1 AND user_id = $2`, [id, req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Goal not found or unauthorized' });
    }
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
