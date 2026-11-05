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

db.execSync(`
  CREATE TABLE IF NOT EXISTS lab_sched (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    scheduled_at INTEGER NOT NULL
  );
`);

/** Nhớ thông báo đã hẹn theo mã, vì dữ liệu kèm theo không luôn đọc lại được từ khay thông báo. */
export function saveSched(id: string, kind: string, scheduledAt: number) {
  db.runSync('INSERT OR REPLACE INTO lab_sched (id, kind, scheduled_at) VALUES (?, ?, ?)', id, kind, scheduledAt);
}

export function getSched(id: string): { kind: string; scheduledAt: number } | null {
  const r = db.getFirstSync<{ kind: string; scheduled_at: number }>('SELECT kind, scheduled_at FROM lab_sched WHERE id = ?', id);
  return r ? { kind: r.kind, scheduledAt: r.scheduled_at } : null;
}

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

export function clearSched() {
  db.runSync('DELETE FROM lab_sched');
}
