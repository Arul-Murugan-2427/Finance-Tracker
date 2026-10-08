import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/initDb.js';

import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import investmentsRouter from './routes/investments.js';
import goalsRouter from './routes/goals.js';
import budgetsRouter from './routes/budgets.js';
import categoriesRouter from './routes/categories.js';
import syncRouter from './routes/sync.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Universal CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow Netlify domains, localhost, and tunnels
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Bypass-Tunnel-Reminder', 'Access-Control-Allow-Private-Network'],
  optionsSuccessStatus: 200
};

// 1. Enable CORS pre-flight across-the-board
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Extra explicit CORS header fallback middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Bypass-Tunnel-Reminder, Access-Control-Allow-Private-Network');
  res.header('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/investments', investmentsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sync', syncRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'PostgreSQL Multi-Tenant Backend Service is live!' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(`❌ [${req.method} ${req.url}] Internal Server Error:`, err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize Database & Start Express Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 RupeeTrack PostgreSQL Backend Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();

