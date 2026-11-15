// Chạy trong tiến trình con với TZ khác nhau; in băm SHA-256 của toàn bộ đầu ra. Không phải test.
import { createHash } from 'node:crypto';
import { scheduleWeek } from '../src/scheduler.ts';
import * as V from '../src/validators.ts';
import { validatePhase, submitPhase, tickPhases } from '../src/phase.ts';
import { onCheckin, trendByDayType } from '../src/fatigue.ts';
import { PROFILES } from '../src/profiles.ts';
import { dayCodeOf, dateInVietnam, weekStart, addDays } from '../../domain/src/index.ts';

const out: any = { weeks: PROFILES.map((p: any) => scheduleWeek(p)) };
out.phase = PROFILES.filter((p: any) => p.phase).map((p: any) => validatePhase(p.phase, p.phaseHistory || []));
const store: any = { profiles: { base: { id: 'base' } }, active: 'base', phases: [], lock: false };
let s = submitPhase(store, { id: 'g1', purpose: 'on_thi', scope: 'c', nguon: 'bo_me', tu_ngay: '2027-01-01', den_ngay: '2027-02-20', noi_long: ['man_hinh'] }, [], '2027-01-01');
out.tick = ['2027-01-14', '2027-01-15', '2027-02-20', '2027-02-21'].map((d) => tickPhases(s, d));
out.trend = trendByDayType([{ choice: 'rat_met', date: '2027-01-12' }], '2027-01-15', () => ['hoc_them_toi']);
out.checkin = onCheckin({ choice: 'rat_met', mode: 'CHILD_EXECUTED', date: '2027-01-05', day: 'T3' });
out.dates = [dayCodeOf('2027-01-01'), dateInVietnam(Date.UTC(2026, 10, 15, 17, 30)), weekStart('2026-11-15'), addDays('2026-12-31', 1)];
out.val = PROFILES.map((p: any) => { const r = scheduleWeek(p); const ctx = V.makeCtx({ plan: r.plan, age: p.age, grade: p.grade, budget: r.budget, activities: p.activities }); return V.DAYS.map((d: string) => [V.checkDayK(ctx, d), V.extraChecks(ctx, d, { tradeoffs: r.tradeoffs }), V.actualDay(ctx, d)]); });
console.log(createHash('sha256').update(JSON.stringify(out)).digest('hex'));
