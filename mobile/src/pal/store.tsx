import * as SQLite from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { Activity, Block, Budget, Day, PalState, Plan } from './types.ts';

export type DayLog = { k: Record<string, { xong?: string; loi_cho_con?: string; tom_tat?: string }>; met: string; doi?: string[] };
export type Proposal = { text: string; ngay: string; tu: 'con'; loai?: 'doi'; xong?: boolean };

/** Toàn bộ dữ liệu app. Phần đầu là PalState mà bộ kiểm tra đọc. */
export type AppState = PalState & {
  presets: Record<string, Budget>;
  presetActive: string;
  budgetOk?: Record<string, boolean>;
  log: Record<string, DayLog>;
  wx: Record<string, string>;
  proposals: Proposal[];
  actNew: string[];
  actDirty: boolean;
  changed: Partial<Record<Day, number[]>>;
  removed: Partial<Record<Day, number>>;
  v: 1;
};

export const blank = (): AppState => ({
  profile: {},
  plan: { tong_quan: null, ngay: {}, ngoai_le: {} } as Plan,
  budget: null,
  activities: [] as Activity[],
  presets: {},
  presetActive: '',
  log: {},
  wx: {},
  proposals: [],
  actNew: [],
  actDirty: false,
  changed: {},
  removed: {},
  v: 1,
});

const db = SQLite.openDatabaseSync('lab.db');
db.execSync('CREATE TABLE IF NOT EXISTS app_state (k TEXT PRIMARY KEY, v TEXT NOT NULL)');

function load(): AppState {
  try {
    const row = db.getFirstSync<{ v: string }>("SELECT v FROM app_state WHERE k = 'state'");
    if (row) return { ...blank(), ...JSON.parse(row.v) };
  } catch {
    // dữ liệu hỏng: bắt đầu lại từ trống
  }
  return blank();
}

function persist(s: AppState) {
  db.runSync("INSERT OR REPLACE INTO app_state (k, v) VALUES ('state', ?)", JSON.stringify(s));
}

type Ctx = { state: AppState; update: (fn: (draft: AppState) => void) => void; replace: (s: AppState) => void };
const PalContext = createContext<Ctx | null>(null);

export function PalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => load());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((s: AppState) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(s), 300);
  }, []);

  const replace = useCallback(
    (s: AppState) => {
      setState(s);
      save(s);
    },
    [save],
  );

  const update = useCallback(
    (fn: (draft: AppState) => void) => {
      setState((prev) => {
        const next: AppState = JSON.parse(JSON.stringify(prev));
        fn(next);
        save(next);
        return next;
      });
    },
    [save],
  );

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return <PalContext.Provider value={{ state, update, replace }}>{children}</PalContext.Provider>;
}

export function usePal(): Ctx {
  const c = useContext(PalContext);
  if (!c) throw new Error('usePal ngoài PalProvider');
  return c;
}

export const effectiveDay = (s: AppState, d: Day, template = false): Block[] =>
  !template && s.plan.ngoai_le[d] ? s.plan.ngoai_le[d]!.khoi : s.plan.ngay[d] || [];
