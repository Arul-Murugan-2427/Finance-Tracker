import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/pool.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';
import { sendWelcomeEmail, sendResetPasswordEmail } from '../utils/mailer.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, username, password, name, dob } = req.body;

  if (!email || !username || !password || !name) {
    return res.status(400).json({ error: 'Gmail/Email, Username, Password, and Full Name are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanDob = dob ? dob.trim() : null;

  try {
    // Check if email or username already exists
    const existing = await pool.query(
      'SELECT id, email, username FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
      [cleanEmail, cleanUsername]
    );

    if (existing.rowCount > 0) {
      const match = existing.rows[0];
      if (match.email && match.email.toLowerCase() === cleanEmail) {
        return res.status(400).json({ error: 'An account with this Gmail/Email already exists.' });
      }
      return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, name, dob)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, name, TO_CHAR(dob, 'YYYY-MM-DD') as dob, created_at as "createdAt"`,
      [cleanEmail, cleanUsername, passwordHash, cleanName, cleanDob || null]
    );

    const user = result.rows[0];

    // Trigger Welcome Email to user's Gmail
    sendWelcomeEmail({
      email: user.email,
      name: user.name,
      username: user.username,
      dob: user.dob || 'Not specified',
      password
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      token,
      message: 'Registration successful! Welcome email sent to your Gmail.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Gmail/Username or User ID and Password are required.' });
  }

  const cleanInput = username.trim().toLowerCase();

  try {
    let query = `
      SELECT id, email, username, password_hash, name, TO_CHAR(dob, 'YYYY-MM-DD') as dob, created_at as "createdAt"
      FROM users
      WHERE LOWER(username) = $1 OR LOWER(email) = $1
    `;
    let params = [cleanInput];

    if (!isNaN(cleanInput)) {
      query = `
        SELECT id, email, username, password_hash, name, TO_CHAR(dob, 'YYYY-MM-DD') as dob, created_at as "createdAt"
        FROM users
        WHERE LOWER(username) = $1 OR LOWER(email) = $1 OR id = $2
      `;
      params = [cleanInput, parseInt(cleanInput)];
    }

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid Email/Username or password.' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Email/Username or password.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        dob: user.dob,
        createdAt: user.createdAt
      },
      token,
      message: 'Login successful!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered Gmail/Email.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
      [cleanEmail]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No account found with this Gmail/Email.' });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour expiry

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expires, user.id]
    );

    const clientOrigin = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${clientOrigin}/?resetToken=${resetToken}`;

    sendResetPasswordEmail({
      email: user.email,
      name: user.name,
      resetLink
    });

    res.json({
      success: true,
      message: `Password reset link sent to ${user.email}. Please check your inbox!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP',
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid or expired password reset link. Please request a new one.' });
    }

    const user = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, name, TO_CHAR(dob, 'YYYY-MM-DD') as dob, created_at as "createdAt"
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
