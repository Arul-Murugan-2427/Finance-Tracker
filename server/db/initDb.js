import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './pool.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  const host = process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.PGPORT || '5432');
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgrespassword';
  const targetDbName = process.env.PGDATABASE || 'rupeetrack_db';

  // 1. Ensure target database exists
  const adminClient = new pg.Client({
    host,
    port,
    user,
    password,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${targetDbName}" does not exist. Creating database...`);
      await adminClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully!`);
    }
  } catch (err) {
    console.warn(`Admin database check warning: ${err.message}. Proceeding with target pool connection.`);
  } finally {
    await adminClient.end().catch(() => {});
  }

  // 2. Check schema compatibility and apply missing columns to users table if needed
  try {
    const colCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'user_id'
    `);

    if (colCheck.rowCount === 0) {
      console.log('Detected legacy schema without user_id. Dropping old tables to recreate multi-tenant tables...');
      await pool.query(`
        DROP TABLE IF EXISTS transactions, investments, goals, budgets, categories, users CASCADE;
      `);
    } else {
      // Ensure email, dob, reset_token, reset_token_expires exist on users table
      await pool.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS dob DATE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
      `);
    }
  } catch (err) {
    console.warn('Schema check notice:', err.message);
  }

  // 3. Run schema DDL on target database
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log(`✅ PostgreSQL multi-tenant tables initialized successfully in database "${targetDbName}"!`);
  } catch (err) {
    console.error(`❌ Failed to initialize PostgreSQL tables: ${err.message}`);
  }
}
