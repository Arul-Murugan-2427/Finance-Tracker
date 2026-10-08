import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Bulk Sync endpoint from frontend to PostgreSQL for current user
router.post('/', async (req, res) => {
  const { transactions = [], investments = [], goals = [], budgets = [], categories = {} } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Sync Transactions
    if (Array.isArray(transactions)) {
      for (const t of transactions) {
        if (!t || !t.id) continue;
        const txAmount = Number(t.amount) || 0;
        const txDate = (t.date && String(t.date).trim()) ? String(t.date).trim() : new Date().toISOString().split('T')[0];
        const txType = t.type === 'income' ? 'income' : 'expense';
        const txCategory = t.category || 'Miscellaneous';
        const txTags = Array.isArray(t.tags) ? t.tags : [];

        await client.query(
          `INSERT INTO transactions (id, user_id, type, amount, category, date, note, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type,
             amount = EXCLUDED.amount,
             category = EXCLUDED.category,
             date = EXCLUDED.date,
             note = EXCLUDED.note,
             tags = EXCLUDED.tags
           WHERE transactions.user_id = $2`,
          [t.id, userId, txType, txAmount, txCategory, txDate, t.note || '', txTags]
        );
      }
    }

    // 2. Sync Goals
    if (Array.isArray(goals)) {
      for (const g of goals) {
        if (!g || !g.id) continue;
        const targetAmt = Number(g.targetAmount) || 0;
        const currentAmt = Number(g.currentAmount) || 0;
        const baseAmt = Number(g.baseAmount) || 0;
        const manualTopups = Number(g.manualTopUps) || 0;
        const deadline = (g.deadline && String(g.deadline).trim()) ? String(g.deadline).trim() : null;

        await client.query(
          `INSERT INTO goals (id, user_id, name, category, target_amount, current_amount, base_amount, manual_topups, deadline, icon)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             category = EXCLUDED.category,
             target_amount = EXCLUDED.target_amount,
             current_amount = EXCLUDED.current_amount,
             base_amount = EXCLUDED.base_amount,
             manual_topups = EXCLUDED.manual_topups,
             deadline = EXCLUDED.deadline,
             icon = EXCLUDED.icon
           WHERE goals.user_id = $2`,
          [g.id, userId, g.name || 'Goal', g.category || 'General', targetAmt, currentAmt, baseAmt, manualTopups, deadline, g.icon || '🎯']
        );
      }
    }

    // 3. Sync Investments
    if (Array.isArray(investments)) {
      for (const inv of investments) {
        if (!inv || !inv.id) continue;
        const invAmt = Number(inv.amount) || 0;
        const invDate = (inv.date && String(inv.date).trim()) ? String(inv.date).trim() : new Date().toISOString().split('T')[0];
        const invType = inv.type || 'Mutual Funds';

        await client.query(
          `INSERT INTO investments (id, user_id, type, amount, date, platform, linked_goal_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type,
             amount = EXCLUDED.amount,
             date = EXCLUDED.date,
             platform = EXCLUDED.platform,
             linked_goal_id = EXCLUDED.linked_goal_id
           WHERE investments.user_id = $2`,
          [inv.id, userId, invType, invAmt, invDate, inv.platform || invType, inv.linkedGoalId || null]
        );
      }
    }

    // 4. Sync Budgets
    if (Array.isArray(budgets)) {
      for (const b of budgets) {
        if (!b || !b.category) continue;
        const limitAmt = Number(b.limit) || 0;
        await client.query(
          `INSERT INTO budgets (user_id, category, monthly_limit)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, category) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit`,
          [userId, b.category, limitAmt]
        );
      }
    }

    // 5. Sync Custom Categories
    if (categories && categories.income && Array.isArray(categories.income)) {
      for (const cat of categories.income) {
        if (!cat || typeof cat !== 'string') continue;
        await client.query(
          `INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'income') ON CONFLICT DO NOTHING`,
          [userId, cat.trim()]
        );
      }
    }
    if (categories && categories.expense && Array.isArray(categories.expense)) {
      for (const cat of categories.expense) {
        if (!cat || typeof cat !== 'string') continue;
        await client.query(
          `INSERT INTO categories (user_id, name, type) VALUES ($1, $2, 'expense') ON CONFLICT DO NOTHING`,
          [userId, cat.trim()]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'User data synced successfully into PostgreSQL!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during bulk sync:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;

