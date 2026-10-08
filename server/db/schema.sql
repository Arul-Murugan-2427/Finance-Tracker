-- Schema SQL for RupeeTrack Personal Finance Database (Multi-Tenant User Isolation)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  dob DATE,
  reset_token TEXT,
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investments (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE NOT NULL,
  platform VARCHAR(150),
  linked_goal_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS goals (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  base_amount NUMERIC(12, 2) DEFAULT 0,
  manual_topups NUMERIC(12, 2) DEFAULT 0,
  deadline DATE,
  icon VARCHAR(10) DEFAULT '🎯',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  monthly_limit NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (user_id, category)
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  CONSTRAINT unique_user_name_type UNIQUE (user_id, name, type)
);
