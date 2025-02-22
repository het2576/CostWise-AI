import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDb() {
  return open({
    filename: path.join(__dirname, '..', '..', 'database.sqlite'),
    driver: sqlite3.Database
  });
}

export async function initializeDb() {
  const db = await getDb();
  
  // Create expenses table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create budgets table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      fiscal_year INTEGER NOT NULL,
      quarter INTEGER NOT NULL
    )
  `);

  return db;
} 