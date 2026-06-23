import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'dmrc-mobile.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function openDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS popular_routes (
      route_key TEXT PRIMARY KEY NOT NULL,
      from_station_code TEXT NOT NULL,
      to_station_code TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      hit_count INTEGER NOT NULL DEFAULT 1,
      last_fetched_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS station_search_cache (
      cache_key TEXT PRIMARY KEY NOT NULL,
      payload_json TEXT NOT NULL,
      last_updated_at INTEGER NOT NULL
    );
  `);
  return db;
}

/**
 * Returns a singleton database connection.
 * If the initial open fails, the cached promise is cleared so
 * subsequent calls will retry instead of returning the rejected promise forever.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDb().catch((error) => {
      // Clear the cached promise so the next call retries
      dbPromise = null;
      console.error('[database] Failed to open database:', error);
      throw error;
    });
  }
  return dbPromise;
}
