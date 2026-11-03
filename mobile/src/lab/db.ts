import * as SQLite from 'expo-sqlite';

export type LabEvent = {
  id: number;
  kind: string;
  label: string;
  scheduledAt: number | null;
  actualAt: number;
  deltaMs: number | null;
  batteryPct: number | null;
};

const db = SQLite.openDatabaseSync('lab.db');

db.execSync(`
  CREATE TABLE IF NOT EXISTS lab_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL,
    label TEXT NOT NULL,
    scheduled_at INTEGER,
    actual_at INTEGER NOT NULL,
    delta_ms INTEGER,
    battery_pct INTEGER,
    ref TEXT UNIQUE
  );
`);

type Row = {
  id: number;
  kind: string;
  label: string;
  scheduled_at: number | null;
  actual_at: number;
  delta_ms: number | null;
  battery_pct: number | null;
};

export function insertEvent(e: {
  kind: string;
  label: string;
  scheduledAt?: number | null;
  actualAt?: number;
  batteryPct?: number | null;
  ref?: string;
}): boolean {
  const actualAt = e.actualAt ?? Date.now();
  const scheduledAt = e.scheduledAt ?? null;
  const deltaMs = scheduledAt === null ? null : actualAt - scheduledAt;
  const res = db.runSync(
    `INSERT OR IGNORE INTO lab_events (kind, label, scheduled_at, actual_at, delta_ms, battery_pct, ref)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    e.kind,
    e.label,
    scheduledAt,
    actualAt,
    deltaMs,
    e.batteryPct ?? null,
    e.ref ?? null,
  );
  return res.changes > 0;
}

export function listEvents(limit = 100): LabEvent[] {
  return db
    .getAllSync<Row>('SELECT * FROM lab_events ORDER BY actual_at DESC, id DESC LIMIT ?', limit)
    .map((r) => ({
      id: r.id,
      kind: r.kind,
      label: r.label,
      scheduledAt: r.scheduled_at,
      actualAt: r.actual_at,
      deltaMs: r.delta_ms,
      batteryPct: r.battery_pct,
    }));
}

export function clearEvents() {
  db.runSync('DELETE FROM lab_events');
}
