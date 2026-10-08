import express from 'express';
import pool from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

const DEFAULT_INCOME = ['Salary', 'Freelance', 'Investments Dividend', 'Bonus', 'Rental Income', 'Other Income'];
const DEFAULT_EXPENSE = ['Housing & Rent', 'Groceries & Food', 'Utilities & Bills', 'Transportation & Fuel', 'Shopping & Clothing', 'Dining Out & Swiggy', 'Entertainment & Subscriptions', 'Healthcare & Medical', 'EMIs & Loans', 'Travel & Leisure', 'Miscellaneous'];

// GET all categories for user grouped by income/expense
router.get('/', async (req, res) => {
  try {
    let result = await pool.query(
      `SELECT name, type FROM categories WHERE user_id = $1 ORDER BY id ASC`,
      [req.user.id]
    );

    // If user has no categories initialized yet in DB, seed default categories once
    if (result.rowCount === 0) {
      for (const cat of DEFAULT_INCOME) {
        await pool.query('INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [req.user.id, cat, 'income']);
      }
      for (const cat of DEFAULT_EXPENSE) {
        await pool.query('INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [req.user.id, cat, 'expense']);
      }

      result = await pool.query(
        `SELECT name, type FROM categories WHERE user_id = $1 ORDER BY id ASC`,
        [req.user.id]
      );
    }

    const formatted = { income: [], expense: [] };
    result.rows.forEach(r => {
      if (formatted[r.type]) formatted[r.type].push(r.name);
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new category for user
router.post('/', async (req, res) => {
  const { name, type } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Category name is required' });

  const cleanName = name.trim();
  const cleanType = type || 'expense';

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, type)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, name, type) DO NOTHING
       RETURNING name, type`,
      [req.user.id, cleanName, cleanType]
    );
    res.status(201).json(result.rows[0] || { name: cleanName, type: cleanType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT edit/rename category for user
router.put('/', async (req, res) => {
  const { oldName, newName, type } = req.body;
  if (!oldName || !newName || !newName.trim()) {
    return res.status(400).json({ error: 'Old name and new name are required' });
  }

  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();
  const cleanType = type || 'expense';

  try {
    // 1. Update categories table
    await pool.query(
      `UPDATE categories SET name = $1 WHERE name = $2 AND type = $3 AND user_id = $4`,
      [cleanNew, cleanOld, cleanType, req.user.id]
    );

    // 2. Cascade category rename to transactions table
    await pool.query(
      `UPDATE transactions SET category = $1 WHERE category = $2 AND type = $3 AND user_id = $4`,
      [cleanNew, cleanOld, cleanType, req.user.id]
    );

    // 3. Cascade category rename to budgets table
    if (cleanType === 'expense') {
      await pool.query(
        `UPDATE budgets SET category = $1 WHERE category = $2 AND user_id = $3`,
        [cleanNew, cleanOld, req.user.id]
      );
    }

    res.json({ success: true, oldName: cleanOld, newName: cleanNew, type: cleanType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category for user
router.delete('/', async (req, res) => {
  const { name, type } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const cleanName = name.trim();
  const cleanType = type || 'expense';

  try {
    await pool.query(
      `DELETE FROM categories WHERE name = $1 AND type = $2 AND user_id = $3`,
      [cleanName, cleanType, req.user.id]
    );
    res.json({ success: true, name: cleanName, type: cleanType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
