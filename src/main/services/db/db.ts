import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { app } from 'electron';
import * as schema from './schema';

// Get the app data directory
const appDataPath = app.getPath('userData');
const dbPath = join(appDataPath, 'transcriptions.db');

// Create libsql client
const client = createClient({
  url: `file:${dbPath}`
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Initialize database and run migrations
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Create tables if they don't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS transcriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        timestamp TEXT DEFAULT (datetime('now')),
        duration INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { client };
