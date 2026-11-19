// Test D-68: gói dịch vụ FREE / TRIAL / PREMIUM ở cấp hộ (app.household_plans, my_plan, plan_set, chặn tạo/sửa kế hoạch, ghép máy, đồng bộ).
// Mã: PLAN-DB (bảng, plan_set), PLAN-AUD (audit plan.changed), PLAN-MY (my_plan), PLAN-GATE (chặn tạo/sửa kế hoạch: profile_save, commit),
//     PLAN-PAIR (ghép máy chỉ PREMIUM), PLAN-SYNC (outbox lich_moi chỉ PREMIUM), PLAN-PURGE (xóa theo hộ).
// Seed: hai hộ PREMIUM; mỗi test đổi gói bằng setup (giao dịch rồi ROLLBACK). Dữ liệu: chỉ tên giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const HH2 = '00000000-0000-4000-8000-000000000102';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const SU = '00000000-0000-4000-8000-000000000303';
const P_NA = '00000000-0000-4000-8000-000000000501';
const P_BIN = '00000000-0000-4000-8000-000000000502';
const P_SU = '00000000-0000-4000-8000-000000000503';
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const MEM_LAN = '00000000-0000-4000-8000-000000000203';
const DEV_NEW_SUB = '00000000-0000-4000-8000-0000000000a7';
const MAI = { role: 'authenticated', sub: '00000000-0000-4000-8000-0000000000a6' };       // người lớn mới, chưa thuộc hộ nào
const PIN = '482916';
const CODE = '135790';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV = { ...A.CON, claims: { is_anonymous: true } };
const DEV_NEW = { role: 'authenticated', sub: DEV_NEW_SUB, claims: { is_anonymous: true } };
const SVC = { role: 'service_role' };
const J = (r, i = 0) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[i]); };
const rejected = (r, code, st, rule = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, st, r.err);
  if (code) assert.match(r.err, new RegExp(code));
  if (rule) assert.match(r.err, new RegExp(rule));
};
const PLAN_REQ = (r, rule) => rejected(r, 'PLAN_REQUIRED', 'PT402', rule);
const q = (s) => `$q$${s}$q$`;
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\n`;
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;

// ---------------------------------------------------------------- đặt gói trực tiếp (quản trị, trong giao dịch thử)
const TIER = (hh, tier, o = {}) => tier === 'TRIAL'
  ? `update app.household_plans set tier = 'TRIAL', trial_started_at = ${o.started || `now() - interval '1 day'`}, trial_ends_at = ${o.ends || 'null'} where household_id = '${hh}';`
  : `update app.household_plans set tier = '${tier}' where household_id = '${hh}';`;
const EXPIRED = { started: `now() - interval '3 days'`, ends: `now() - interval '1 hour'` };
/** n phiên bản "sửa" thêm cho một con (rev tiếp theo rev hiện có), cập nhật schedule_state. */
const EDITS = (child, profile, member, fromRev, n) => n === 0 ? '' : `
  insert into app.schedule_versions (child_id, profile_id, profile_version, rev, engine_version, params_version, input_hash, output, committed_by_kind, committed_by, idempotency_key)
    select '${child}', '${profile}', 1, g, 'e', 'p', repeat('a', 64), '{}', 'member', '${member}', gen_random_uuid() from generate_series(${fromRev}, ${fromRev + n - 1}) g;
  insert into app.schedule_state (child_id, rev) values ('${child}', ${fromRev + n - 1}) on conflict (child_id) do update set rev = excluded.rev;`;
const NA_EDITS = (n) => EDITS(NA, P_NA, MEM_HOA, 2, n);       // seed: bé Na đã có phiên bản rev 1 (lần tạo đầu)

const OUT = JSON.stringify({ ngay: Object.fromEntries(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => [d, []])), tong_quan: {} });
/** Dựng lời gọi schedule_commit_apply có chữ ký đúng (như schedule.test.mjs). */
function commit(o = {}) {
  const f = { child: NA, profile: P_NA, rev: 1, key: '30000000-0000-4000-8000-0000000000a1', ih: 'b'.repeat(64), eng: 'e1-0123456789ab', par: 'p-0123456789ab',
    bal: 'UNKNOWN', out: OUT, trade: '[]', quest: '[]', ans: '[]', ...o };
  const setup = `select set_config('request.jwt.claims', '{"role":"service_role"}', true) as _svc \\gset
    select private.profile_content_hash('${f.profile}') as ch \\gset
    select private.schedule_commit_sign(private.schedule_commit_message('${f.child}', '${f.profile}', ${f.rev}, '${f.key}', :'ch', '${f.ih}', '${f.eng}', '${f.par}',
      '${f.bal}', ${q(f.out)}, ${q(f.trade)}, ${q(f.quest)}, ${q(f.ans)})) as sig \\gset`;
  const call = `app.schedule_commit_apply('${f.child}', '${f.profile}', ${f.rev}, '${f.key}', :'ch', '${f.ih}', '${f.eng}', '${f.par}', '${f.bal}',
    ${q(f.out)}, ${q(f.trade)}, ${q(f.quest)}, ${q(f.ans)}, :'sig')`;
  return { setup, call };
}
const CARD = { name: 'Vẽ', type: 'nang_khieu', days: ['T7'], start: '09:00', end: '10:00', travel_before_min: 10, travel_after_min: 10 };
const SAVE = (child, who = QL) => run(who, `select app.profile_save('${child}', ${q(JSON.stringify({ budget: null }))})`);
const COMMIT = (c, who, extra = '') => run(who, `select ${c.call}`, { setup: `${extra} ${c.setup}` });
const versions = (child) => `(select count(*) from app.schedule_versions where child_id = '${child}')`;

describe('PLAN-DB: bảng household_plans và app.plan_set (chỉ hệ thống)', { skip }, () => {
  it('PLAN-DB-01: người dùng đăng nhập, máy con, anon không đọc/ghi trực tiếp; ràng buộc cột', () => {
    for (const who of [QL, NL, HK, DEV, ANON]) {
      const r = run(who, `select count(*) from app.household_plans`);
      assert.equal(r.ok, false); assert.equal(r.code, '42501');
      assert.equal(run(who, `update app.household_plans set tier = 'PREMIUM'`).code, '42501');
    }
    assert.equal(admin(`select string_agg(tier, ',' order by household_id) from app.household_plans`).rows[0], 'PREMIUM,PREMIUM');
    const ins = (cols, vals) => admin(`delete from app.household_plans where household_id = '${HH2}'; insert into app.household_plans (household_id, ${cols}) values ('${HH2}', ${vals})`);
    assert.equal(ins('tier', `'GOLD'`).code, '23514');
    assert.equal(ins('tier', `'TRIAL'`).code, '23514');                       // TRIAL phải có trial_started_at
    assert.equal(ins('tier, trial_started_at, trial_ends_at', `'TRIAL', now(), now() - interval '1 day'`).code, '23514');
    assert.equal(ins('tier, set_by', `'FREE', 'chu san pham'`).code, '23514');
    assert.equal(ins('tier, note', `'FREE', repeat('a', 501)`).code, '23514');
    assert.equal(ins('tier, trial_started_at, trial_ends_at, note', `'TRIAL', now(), now() + interval '7 days', repeat('a', 500)`).ok, true);
  });

  it('PLAN-DB-02: plan_set không cấp EXECUTE cho người dùng/anon; có cấp nhầm thì require_system vẫn chặn JWT người dùng; service_role dùng được', () => {
    for (const who of [QL, NL, DEV, ANON]) {
      const r = run(who, `select app.plan_set('${HH1}', 'FREE')`);
      assert.equal(r.ok, false); assert.equal(r.code, '42501', `${who.role}`);
    }
    const GRANT = `grant execute on function app.plan_set(uuid, text, timestamptz, text, text) to authenticated;`;
    rejected(run(QL, `select app.plan_set('${HH1}', 'FREE')`, { setup: GRANT }), 'FORBIDDEN', 'PT403');
    rejected(run(DEV, `select app.plan_set('${HH1}', 'FREE')`, { setup: GRANT }), 'FORBIDDEN', 'PT403');
    assert.equal(J(run(SVC, `select app.plan_set('${HH1}', 'FREE')`)).tier, 'FREE');
  });

  it('PLAN-DB-03: plan_set: bắt đầu dùng thử, giữ mốc khi cùng gói, bắt đầu lại sau PREMIUM; kiểm đầu vào', () => {
    const r = run(SVC, `select app.plan_set('${HH1}', 'TRIAL', now() + interval '14 days', '  chờ chủ sản phẩm duyệt  ', 'owner:test');
      select trial_started_at from app.household_plans where household_id = '${HH1}' \\gset
      select app.plan_set('${HH1}', 'TRIAL', null, null);
      select trial_started_at = :'trial_started_at'::timestamptz, trial_ends_at is null, note is null, set_by from app.household_plans where household_id = '${HH1}';
      select app.plan_set('${HH1}', 'PREMIUM');
      select trial_started_at = :'trial_started_at'::timestamptz, trial_ends_at is null from app.household_plans where household_id = '${HH1}'`);
    assert.ok(r.ok, r.err);
    const a = J(r, 0);
    assert.equal(a.old_tier, 'PREMIUM'); assert.equal(a.tier, 'TRIAL'); assert.equal(a.changed, true);
    assert.equal(J(r, 1).changed, false);
    assert.equal(r.rows[2], 't|t|t|owner');
    assert.equal(r.rows[4], 't|t');
    const again = run(SVC, `select app.plan_set('${HH1}', 'TRIAL'); select app.plan_set('${HH1}', 'PREMIUM'); select app.plan_set('${HH1}', 'TRIAL');
      select trial_started_at > now() - interval '1 minute' from app.household_plans where household_id = '${HH1}'`, { setup: TIER(HH1, 'PREMIUM') });
    assert.ok(again.ok, again.err);
    assert.equal(again.rows.at(-1), 't');
    const bad = (sql, code, st) => rejected(run(SVC, sql), code, st);
    bad(`select app.plan_set('${HH1}', 'GOLD')`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set('${HH1}', null)`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set(null, 'FREE')`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set('${HH1}', 'TRIAL', now() - interval '1 day')`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set('${HH1}', 'PREMIUM', now() + interval '1 day')`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set('${HH1}', 'FREE', null, repeat('a', 501))`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set('${HH1}', 'FREE', null, null, 'có dấu cách')`, 'VALIDATION', 'PT422');
    bad(`select app.plan_set(gen_random_uuid(), 'FREE')`, 'NOT_FOUND', 'PT404');
  });

  it('PLAN-DB-04: hộ chưa có dòng gói là FREE (hộ tạo bằng family_create)', () => {
    const r = run(MAI, `select app.family_create('chị Mai'); select app.my_plan()`);
    assert.ok(r.ok, r.err);
    const p = J(r, 1);
    assert.equal(p.tier, 'FREE'); assert.equal(p.plans_max, 0); assert.equal(p.edits_left, 0); assert.equal(p.plans_used, 0);
  });
});

describe('PLAN-AUD: audit plan.changed (chỉ gói cũ và gói mới)', { skip }, () => {
  const log = `select string_agg(event_code || '|' || actor_kind || '|' || coalesce(subject_ref, '') || '|' || meta::text, ';' order by at, id) from app.audit_log where event_code = 'plan.changed' and household_id = '${HH2}' and at > now()`;
  it('PLAN-AUD-01: đổi gói ghi một dòng hệ thống; gói không đổi (chỉ hạn/ghi chú) không ghi; hộ chưa có dòng đi từ FREE', () => {
    const r = run(SVC, `select app.plan_set('${HH2}', 'TRIAL', now() + interval '10 days'); select app.plan_set('${HH2}', 'TRIAL', now() + interval '20 days', 'gia hạn');
      select app.plan_set('${HH2}', 'FREE'); ${log}`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows.at(-1),
      `plan.changed|system|household:${HH2}|{"new_tier": "TRIAL", "old_tier": "PREMIUM"};plan.changed|system|household:${HH2}|{"new_tier": "FREE", "old_tier": "TRIAL"}`);
    const fresh = run(SVC, `select app.plan_set('${HH2}', 'FREE'); select app.plan_set('${HH2}', 'TRIAL'); ${log}`, { setup: `delete from app.household_plans where household_id = '${HH2}';` });
    assert.equal(fresh.rows.at(-1), `plan.changed|system|household:${HH2}|{"new_tier": "TRIAL", "old_tier": "FREE"}`);
  });
  it('PLAN-AUD-02: sửa thẳng cột tier bằng quản trị cũng để lại dấu (trigger, không chỉ hàm); meta không nhận khóa khác', () => {
    const r = admin(`update app.household_plans set tier = 'FREE' where household_id = '${HH2}'; ${log}`);
    assert.equal(r.rows.at(-1), `plan.changed|system|household:${HH2}|{"new_tier": "FREE", "old_tier": "PREMIUM"}`);
    const k = admin(`select allowed_meta_keys::text from private.audit_events where event_code = 'plan.changed'`);
    assert.equal(k.rows[0], '{old_tier,new_tier}');
  });
});

describe('PLAN-MY: app.my_plan (người lớn trong hộ)', { skip }, () => {
  const my = (who, setup = '') => J(run(who, `select app.my_plan()`, { setup }));
  it('PLAN-MY-01: FREE: không được tạo, không lượt sửa; số kế hoạch đã dùng vẫn hiện', () => {
    const p = my(QL, TIER(HH1, 'FREE'));
    assert.deepEqual(p, { ok: true, tier: 'FREE', expired: false, plans_used: 1, plans_max: 0, edits_used: 0, edits_left: 0, pal_questions_left: null, trial_ends_at: null });
  });
  it('PLAN-MY-02: TRIAL: 1 kế hoạch, còn 3 lượt sửa; trừ dần theo phiên bản mới; không âm', () => {
    let p = my(QL, TIER(HH1, 'TRIAL'));
    assert.equal(p.tier, 'TRIAL'); assert.equal(p.plans_max, 1); assert.equal(p.plans_used, 1); assert.equal(p.edits_used, 0); assert.equal(p.edits_left, 3);
    p = my(QL, TIER(HH1, 'TRIAL') + NA_EDITS(2));
    assert.equal(p.edits_used, 2); assert.equal(p.edits_left, 1);
    p = my(QL, TIER(HH1, 'TRIAL') + NA_EDITS(5));
    assert.equal(p.edits_used, 5); assert.equal(p.edits_left, 0);
    p = my(QL, TIER(HH1, 'TRIAL', { ends: `now() + interval '5 days'` }));
    assert.match(p.trial_ends_at, /^\d{4}-\d\d-\d\dT/);
    assert.equal(my(HK, TIER(HH2, 'TRIAL')).plans_used, 0);
    assert.equal(my(HK, TIER(HH2, 'TRIAL')).edits_left, 3);
  });
  it('PLAN-MY-03: PREMIUM không giới hạn (null); TRIAL quá hạn coi như FREE và báo expired', () => {
    const p = my(QL);
    assert.equal(p.tier, 'PREMIUM'); assert.equal(p.plans_max, null); assert.equal(p.edits_left, null); assert.equal(p.pal_questions_left, null);
    const e = my(QL, TIER(HH1, 'TRIAL', EXPIRED));
    assert.equal(e.tier, 'FREE'); assert.equal(e.expired, true); assert.equal(e.edits_left, 0); assert.equal(e.trial_ends_at, null);
  });
  it('PLAN-MY-04: ai gọi được: mọi người lớn trong hộ (cả NL); người hộ khác thấy gói hộ mình; máy con, người chưa có hộ, anon bị từ chối', () => {
    assert.equal(my(NL).tier, 'PREMIUM');
    assert.equal(my(HK, TIER(HH1, 'FREE')).tier, 'PREMIUM');
    rejected(run(DEV, `select app.my_plan()`), 'FORBIDDEN', 'PT403');
    rejected(run(MAI, `select app.my_plan()`), 'FORBIDDEN', 'PT403');
    assert.equal(run(ANON, `select app.my_plan()`).code, '42501');
  });
  it('PLAN-MY-05: con đã ẩn vẫn tính suất kế hoạch (xóa hồ sơ con không trả lại suất)', () => {
    const p = my(HK, `${TIER(HH2, 'TRIAL')} ${EDITS(SU, P_SU, MEM_LAN, 1, 1)} update app.children set hidden_at = now(), hidden_reason = 'XOA' where id = '${SU}';`);
    assert.equal(p.plans_used, 1); assert.equal(p.edits_used, 0);
  });
});

describe('PLAN-GATE: chặn tạo và sửa kế hoạch (profile_save, schedule_commit_apply)', { skip }, () => {
  it('PLAN-GATE-01: FREE: lưu nháp và commit đều PLAN_REQUIRED (402), không ghi gì', () => {
    const FREE = TIER(HH1, 'FREE');
    const r = run(QL, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: FREE });
    PLAN_REQ(r, 'D-68.free');
    assert.match(r.err, /Cần gói dùng thử hoặc Premium/);
    const c = commit();
    PLAN_REQ(COMMIT(c, QL, FREE), 'D-68.free');
    const n = admin(`select ${versions(NA)}, (select count(*) from app.schedule_profiles where child_id = '${NA}')`);
    assert.equal(n.rows[0], '1|1');
    PLAN_REQ(run(HK, `select app.profile_save('${SU}', ${q(JSON.stringify({ budget: null }))})`, { setup: TIER(HH2, 'FREE') }), 'D-68.free');
  });

  it('PLAN-GATE-02: kiểm gói chạy SAU kiểm quyền: NL không grant vẫn FORBIDDEN/NOT_FOUND chứ không PLAN_REQUIRED', () => {
    const FREE = TIER(HH1, 'FREE');
    rejected(run(NL, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: FREE }), 'FORBIDDEN', 'PT403');
    rejected(run(NL, `select app.profile_save('${BIN}', ${q(JSON.stringify({ budget: null }))})`, { setup: FREE }), 'NOT_FOUND', 'PT404');
    rejected(run(HK, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: FREE }), 'NOT_FOUND', 'PT404');
    rejected(run(DEV, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: FREE }), 'FORBIDDEN', 'PT403');
  });

  it('PLAN-GATE-03: gửi lại cùng khóa idempotency vẫn trả kết quả cũ khi gói đã hạ xuống FREE (replay chạy trước kiểm gói)', () => {
    const c = commit();
    const r = run(QL, `select ${c.call}; reset role; update app.household_plans set tier = 'FREE' where household_id = '${HH1}'; set local role authenticated;
      ${as(QL)} select ${c.call}`, { setup: c.setup });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).replay, false); assert.equal(J(r, 1).replay, true);
    PLAN_REQ(run(QL, `select ${commit({ key: '30000000-0000-4000-8000-0000000000a2' }).call}`, { setup: `${TIER(HH1, 'FREE')} ${commit({ key: '30000000-0000-4000-8000-0000000000a2' }).setup}` }), 'D-68.free');
  });

  it('PLAN-GATE-04: TRIAL tạo kế hoạch đầu tiên được (hộ chưa có phiên bản nào)', () => {
    const c = commit({ child: SU, profile: P_SU, rev: 0 });
    const r = run(HK, `select ${c.call}; select app.my_plan()`, { setup: `${TIER(HH2, 'TRIAL')} ${c.setup}` });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).rev, 1);
    const p = J(r, 1);
    assert.equal(p.plans_used, 1); assert.equal(p.edits_used, 0); assert.equal(p.edits_left, 3);
  });

  it('PLAN-GATE-05: TRIAL đã có kế hoạch: sửa tối đa 3 lần (phiên bản mới), lần thứ 4 PLAN_REQUIRED', () => {
    for (const [n, ok] of [[0, true], [2, true], [3, false], [6, false]]) {
      const c = commit({ rev: 1 + n, key: `30000000-0000-4000-8000-00000000b00${n}` });
      const r = COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(n)}`);
      if (ok) { assert.ok(r.ok, `n=${n}: ${r.err}`); assert.equal(J(r).rev, 2 + n); }
      else PLAN_REQ(r, 'D-68.trial_edit');
    }
    assert.equal(admin(`select ${versions(NA)}`).rows[0], '1');
  });

  it('PLAN-GATE-06: TRIAL chỉ 1 kế hoạch cho cả hộ: con thứ hai (bé Bin) không tạo được, kể cả lưu nháp', () => {
    const T = TIER(HH1, 'TRIAL');
    const c = commit({ child: BIN, profile: P_BIN, rev: 0 });
    PLAN_REQ(COMMIT(c, QL, T), 'D-68.trial_plan');
    const s = run(QL, `select app.profile_save('${BIN}', ${q(JSON.stringify({ budget: null }))})`, { setup: T });
    PLAN_REQ(s, 'D-68.trial_plan');
    assert.match(s.err, /chỉ tạo được 1 kế hoạch/);
  });

  it('PLAN-GATE-07: TRIAL: lưu nháp cho con có kế hoạch được khi còn lượt sửa, hết lượt thì chặn', () => {
    const ok = run(QL, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: TIER(HH1, 'TRIAL') + NA_EDITS(2) });
    assert.ok(ok.ok, ok.err);
    const s = run(QL, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: TIER(HH1, 'TRIAL') + NA_EDITS(3) });
    PLAN_REQ(s, 'D-68.trial_edit');
    assert.match(s.err, /tối đa 3 lần/);
  });

  it('PLAN-GATE-08: TRIAL quá hạn (trial_ends_at đã qua) bị chặn như FREE', () => {
    const E = TIER(HH1, 'TRIAL', EXPIRED);
    PLAN_REQ(run(QL, `select app.profile_save('${NA}', ${q(JSON.stringify({ budget: null }))})`, { setup: E }), 'D-68.free');
    PLAN_REQ(COMMIT(commit(), QL, E), 'D-68.free');
  });

  it('PLAN-GATE-09: PREMIUM không giới hạn số lần sửa lẫn số kế hoạch (hai con cùng có kế hoạch)', () => {
    const r = COMMIT(commit({ rev: 13, key: '30000000-0000-4000-8000-00000000b0aa' }), QL, NA_EDITS(12));
    assert.ok(r.ok, r.err);
    const b = COMMIT(commit({ child: BIN, profile: P_BIN, rev: 0, key: '30000000-0000-4000-8000-00000000b0ab' }), QL, NA_EDITS(12));
    assert.ok(b.ok, b.err);
  });

  it('PLAN-GATE-10: đổi tham số (trial_edits_max, trial_plans_max) có hiệu lực không cần sửa hàm', () => {
    const c = commit({ rev: 4, key: '30000000-0000-4000-8000-00000000b0ac' });
    PLAN_REQ(COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(3)}`), 'D-68.trial_edit');
    const up = COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(3)} update private.params set value_int = 4 where key = 'trial_edits_max';`);
    assert.ok(up.ok, up.err);
    const two = COMMIT(commit({ child: BIN, profile: P_BIN, rev: 0, key: '30000000-0000-4000-8000-00000000b0ad' }), QL, `${TIER(HH1, 'TRIAL')} update private.params set value_int = 2 where key = 'trial_plans_max';`);
    assert.ok(two.ok, two.err);
  });
});

describe('PLAN-PAIR: ghép máy chỉ PREMIUM (D-68)', { skip }, () => {
  const FLOW = `update app.children set has_device = true where id = '${BIN}';
    insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${DEV_NEW_SUB}', private.pair_hmac('${CODE}'), now() + interval '10 minutes');`;
  const CONFIRM = `select app.pair_confirm('${BIN}', '${CODE}', '${PIN}')`;

  it('PLAN-PAIR-01: pair_confirm: FREE, TRIAL, TRIAL quá hạn bị PLAN_REQUIRED (không tiêu mã, không đếm sai, không tạo binding); PREMIUM ghép được', () => {
    const state = `reset role; select (select count(*) from app.device_bindings where child_id = '${BIN}'), (select state from private.pairing_codes where device_user_id = '${DEV_NEW_SUB}'),
      (select count(*) from private.pair_throttle)`;
    for (const t of [TIER(HH1, 'FREE'), TIER(HH1, 'TRIAL'), TIER(HH1, 'TRIAL', EXPIRED)]) {
      PLAN_REQ(run(QL, CONFIRM, { setup: FLOW + t }), 'D-68.premium');
      const r = run(QL, `do $t$ begin ${CONFIRM.replace('select ', 'perform ')}; exception when sqlstate 'PT402' then null; end $t$; ${state}`, { setup: FLOW + t });
      assert.ok(r.ok, r.err);
      assert.equal(r.rows[0], '0|CON_HAN|0');
    }
    const ok = run(QL, CONFIRM, { setup: FLOW });
    assert.equal(J(ok).ok, true);
  });

  it('PLAN-PAIR-02: pair_accept: hộ hạ gói giữa chừng thì máy con không ghép nốt (yêu cầu vẫn chờ, không tự hủy)', () => {
    const r = run(QL, `${CONFIRM}; ${adm(`update app.household_plans set tier = 'TRIAL', trial_started_at = now() where household_id = '${HH1}'`)} ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW });
    PLAN_REQ(r, 'D-68.premium');
    const st = run(QL, `${CONFIRM}; ${adm(`update app.household_plans set tier = 'FREE' where household_id = '${HH1}'`)} ${as(DEV_NEW)}
      do $t$ begin perform app.pair_accept(); exception when sqlstate 'PT402' then null; end $t$; reset role;
      select state from app.device_bindings where child_id = '${BIN}' and device_user_id = '${DEV_NEW_SUB}'`, { setup: FLOW });
    assert.equal(st.rows.at(-1), 'CHO_XAC_NHAN_MAY_CON');
    const ok = run(QL, `${CONFIRM}; ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW });
    assert.equal(J(ok, 1).ok, true);
  });

  it('PLAN-PAIR-03: máy đã ghép giữ liên kết khi hộ hạ gói (không tự hủy); gọi lại pair_accept trả replay; pair_code_create của máy chưa ghép không bị chặn theo gói', () => {
    const r = run(DEV, `select app.pair_accept(); select (select count(*) from app.device_bindings where state = 'HIEU_LUC' and child_id = '${NA}')`, { setup: TIER(HH1, 'FREE') });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).replay, true); assert.equal(r.rows[1], '1');
    const c = run(DEV_NEW, `select app.pair_code_create()`, { setup: TIER(HH1, 'FREE') + TIER(HH2, 'FREE') });
    assert.ok(c.ok, c.err);
  });
});

describe('PLAN-SYNC: đồng bộ lịch sang máy con chỉ PREMIUM (outbox lich_moi)', { skip }, () => {
  const outbox = `reset role; select count(*) from app.notifications where child_id = '${NA}' and type = 'lich_moi'`;
  it('PLAN-SYNC-01: PREMIUM ghi outbox cho máy đã ghép; TRIAL (còn lượt sửa) commit được nhưng KHÔNG ghi outbox và không hủy liên kết', () => {
    const c = commit();
    const p = run(QL, `select ${c.call}; ${outbox}`, { setup: c.setup });
    assert.ok(p.ok, p.err);
    assert.equal(p.rows.at(-1), '2');
    const t = run(QL, `select ${c.call}; ${outbox}; select count(*) from app.device_bindings where child_id = '${NA}' and state = 'HIEU_LUC'`, { setup: `${TIER(HH1, 'TRIAL')} ${c.setup}` });
    assert.ok(t.ok, t.err);
    assert.equal(J(t, 0).rev, 2);
    assert.equal(t.rows[1], '1', 'chỉ còn hàng seed, không thêm hàng mới');
    assert.equal(t.rows[2], '1', 'liên kết vẫn HIEU_LUC');
  });
});

describe('PLAN-PURGE: xóa theo hộ gồm household_plans', { skip }, () => {
  it('PLAN-PURGE-01: purge_household xóa dòng gói, ghi số dòng vào bằng chứng; hộ khác không đụng', () => {
    const r = run(SVC, `select app.purge_household('${HH2}', 'GIA_LAP_DIEN_TAP');
      select count(*) from app.household_plans where household_id = '${HH2}';
      select count(*) from app.household_plans where household_id = '${HH1}';
      select row_counts ->> 'app.household_plans' from app.deletion_evidence order by purged_at desc limit 1`);
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).ok, true);
    assert.deepEqual(r.rows.slice(1), ['0', '1', '1']);
  });
});
