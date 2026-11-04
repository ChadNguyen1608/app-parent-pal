import type { Activity, Budget, Day, PalState, Plan } from './types.ts';

export type DayLog = { k: Record<string, { xong?: string; loi_cho_con?: string; tom_tat?: string }>; met: string; doi?: string[] };
export type ChatMsg = { role: 'user' | 'assistant'; content: string; warn?: string };
export type Proposal = { text: string; ngay: string; tu: 'con'; loai?: 'doi'; xong?: boolean };

/** Toàn bộ dữ liệu app. Phần đầu là PalState mà bộ kiểm tra đọc. */
export type AppState = PalState & {
  presets: Record<string, Budget>;
  presetActive: string;
  budgetOk?: Record<string, boolean>;
  log: Record<string, DayLog>;
  wx: Record<string, string>;
  proposals: Proposal[];
  messages: ChatMsg[];
  palMode: 'mock' | 'bridge';
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
  messages: [],
  palMode: 'mock',
  actNew: [],
  actDirty: false,
  changed: {},
  removed: {},
  v: 1,
});

