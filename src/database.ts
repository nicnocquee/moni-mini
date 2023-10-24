import path from "path";
import SQLite3 from "sqlite3";
import { open, Database, ISqlite } from "sqlite";
import { logWithTimestamp } from "./utils";

const sqlite3 = SQLite3.verbose();
const dbPath = path.resolve(process.cwd(), "monika-logs.db");

let db: Database<SQLite3.Database, SQLite3.Statement>;
export const getSQLiteDB = async () => {
  if (!db) {
    db = await open({
      filename: dbPath,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      driver: sqlite3.Database,
    });
  }

  return db;
};

export async function migrate() {
  const _db = await getSQLiteDB();
  const migrationsPath = path.join(__dirname, "./migrations");
  logWithTimestamp(`Migration starts: ${migrationsPath}`);
  await _db.migrate({
    migrationsPath,
  });
  logWithTimestamp(`Migration finishes`);
}

export async function writeHistory({
  probeId,
  duration,
  size,
  status,
}: {
  probeId: string;
  duration: number;
  size: number;
  status: number;
}) {
  const sql = `INSERT INTO history (created_at, probe_id, response_status, response_time, response_size) values (?, ?, ?, ?, ?)`;
  const _db = await getSQLiteDB();
  await _db.run(sql, [
    new Date().toISOString(),
    probeId,
    status,
    duration,
    size,
  ]);
}
