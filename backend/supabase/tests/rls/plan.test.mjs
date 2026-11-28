// Test D-68, D-72, D-74: gói dịch vụ FREE / TRIAL / PREMIUM ở cấp hộ (app.household_plans, my_plan, plan_set, chặn tạo/sửa kế hoạch THEO CON, ghép máy, đồng bộ,
// dùng thử tự phục vụ trial_start, plan_active của máy con, outbox goi_doi, hết hạn).
// Mã: PLAN-DB (bảng, plan_set), PLAN-AUD (audit plan.changed), PLAN-MY (my_plan), PLAN-GATE (chặn tạo/sửa kế hoạch: profile_save, commit),
//     PLAN-PAIR (ghép máy theo KHÓA, D-74), PLAN-SYNC (outbox lich_moi chỉ máy còn trong gói và trong số khóa), PLAN-PURGE (xóa theo hộ),
//     PLAN-TRIAL (trial_start, trial_claims: D-72), PLAN-ACTIVE (plan_active), PLAN-NOTIFY (goi_doi), PLAN-EXP (plan.expired), PLAN-KEY (khóa ghép máy: device_keys, plan_set, my_plan).
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
    assert.equal(ins('tier, device_keys', `'PREMIUM', 51`).code, '23514');    // D-74: device_keys 0..50
    assert.equal(ins('tier, device_keys', `'PREMIUM', -1`).code, '23514');
    assert.equal(ins('tier, trial_started_at, trial_ends_at, note', `'TRIAL', now(), now() + interval '7 days', repeat('a', 500)`).ok, true);
  });

  it('PLAN-DB-02: plan_set không cấp EXECUTE cho người dùng/anon; có cấp nhầm thì require_system vẫn chặn JWT người dùng; service_role dùng được', () => {
    for (const who of [QL, NL, DEV, ANON]) {
      const r = run(who, `select app.plan_set('${HH1}', 'FREE')`);
      assert.equal(r.ok, false); assert.equal(r.code, '42501', `${who.role}`);
    }
    const GRANT = `grant execute on function app.plan_set(uuid, text, timestamptz, text, text, int) to authenticated;`;
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
    assert.equal(p.tier, 'FREE'); assert.equal(p.plans_max, 0); assert.deepEqual(p.children, []);
    assert.equal(p.trial_available, true); assert.equal(p.trial_days, 7);
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

describe('PLAN-MY: app.my_plan (người lớn trong hộ, theo con)', { skip }, () => {
  const my = (who, setup = '') => J(run(who, `select app.my_plan()`, { setup }));
  const kid = (p, id) => p.children.find((c) => c.child_id === id);
  it('PLAN-MY-01: FREE: không được tạo, không lượt sửa; số kế hoạch đã dùng của từng con vẫn hiện; hộ từng PREMIUM thì không còn trial_available', () => {
    const p = my(QL, TIER(HH1, 'FREE'));
    assert.deepEqual(p, { ok: true, tier: 'FREE', expired: false, plans_max: 0, edits_max: 0, pal_questions_left: null, trial_ends_at: null, trial_available: false, trial_days: 7,
      device_keys: 0, device_keys_used: 1,
      children: [{ child_id: NA, plans_used: 1, edits_used: 0, edits_left: 0 }, { child_id: BIN, plans_used: 0, edits_used: 0, edits_left: 0 }] });
  });
  it('PLAN-MY-02: TRIAL: mỗi con 1 kế hoạch, còn 3 lượt sửa; trừ dần theo phiên bản mới CỦA CON ĐÓ; không âm', () => {
    let p = my(QL, TIER(HH1, 'TRIAL'));
    assert.equal(p.tier, 'TRIAL'); assert.equal(p.plans_max, 1); assert.equal(p.edits_max, 3);
    assert.deepEqual(kid(p, NA), { child_id: NA, plans_used: 1, edits_used: 0, edits_left: 3 });
    assert.deepEqual(kid(p, BIN), { child_id: BIN, plans_used: 0, edits_used: 0, edits_left: 3 });
    p = my(QL, TIER(HH1, 'TRIAL') + NA_EDITS(2));
    assert.equal(kid(p, NA).edits_used, 2); assert.equal(kid(p, NA).edits_left, 1); assert.equal(kid(p, BIN).edits_left, 3, 'con khác không bị trừ');
    p = my(QL, TIER(HH1, 'TRIAL') + NA_EDITS(5));
    assert.equal(kid(p, NA).edits_used, 5); assert.equal(kid(p, NA).edits_left, 0);
    p = my(QL, TIER(HH1, 'TRIAL', { ends: `now() + interval '5 days'` }));
    assert.match(p.trial_ends_at, /^\d{4}-\d\d-\d\dT/);
    assert.equal(kid(my(HK, TIER(HH2, 'TRIAL')), SU).plans_used, 0);
    assert.equal(kid(my(HK, TIER(HH2, 'TRIAL')), SU).edits_left, 3);
  });
  it('PLAN-MY-03: PREMIUM không giới hạn (null); TRIAL quá hạn coi như FREE và báo expired', () => {
    const p = my(QL);
    assert.equal(p.tier, 'PREMIUM'); assert.equal(p.plans_max, null); assert.equal(p.edits_max, null); assert.equal(p.pal_questions_left, null);
    assert.equal(kid(p, NA).edits_left, null);
    const e = my(QL, TIER(HH1, 'TRIAL', EXPIRED));
    assert.equal(e.tier, 'FREE'); assert.equal(e.expired, true); assert.equal(kid(e, NA).edits_left, 0); assert.equal(e.trial_ends_at, null);
    assert.equal(e.trial_available, false);
  });
  it('PLAN-MY-04: ai gọi được: mọi người lớn trong hộ (cả NL); người hộ khác thấy gói hộ mình; máy con, người chưa có hộ, anon bị từ chối', () => {
    assert.equal(my(NL).tier, 'PREMIUM');
    assert.equal(my(HK, TIER(HH1, 'FREE')).tier, 'PREMIUM');
    rejected(run(DEV, `select app.my_plan()`), 'FORBIDDEN', 'PT403');
    rejected(run(MAI, `select app.my_plan()`), 'FORBIDDEN', 'PT403');
    assert.equal(run(ANON, `select app.my_plan()`).code, '42501');
  });
  it('PLAN-MY-05: con đã ẩn không còn trong danh sách và không ảnh hưởng con khác; NL chỉ thấy con mình được xem', () => {
    const p = my(HK, `${TIER(HH2, 'TRIAL')} ${EDITS(SU, P_SU, MEM_LAN, 1, 1)} update app.children set hidden_at = now(), hidden_reason = 'XOA' where id = '${SU}';`);
    assert.deepEqual(p.children, []);
    const nl = my(NL);
    assert.deepEqual(nl.children.map((c) => c.child_id), [NA], 'NL có grant xem bé Na, không thấy bé Bin');
  });
  it('PLAN-MY-06: trial_available: hộ chưa có dòng gói hoặc FREE chưa từng dùng thử; false khi từng TRIAL hoặc PREMIUM', () => {
    assert.equal(my(QL, `delete from app.household_plans where household_id = '${HH1}';`).trial_available, true);
    assert.equal(my(QL, `update app.household_plans set tier = 'FREE', had_premium = false where household_id = '${HH1}';`).trial_available, true);
    assert.equal(my(QL).trial_available, false, 'PREMIUM');
    assert.equal(my(QL, TIER(HH1, 'TRIAL')).trial_available, false, 'đang TRIAL');
  });
});

describe('PLAN-GATE: chặn xem trước và tạo/sửa kế hoạch THEO CON (schedule_plan_check, schedule_commit_apply); lưu hồ sơ không xét gói', { skip }, () => {
  const SAVE_OK = (who, child, setup) => { const r = run(who, `select app.profile_save('${child}', ${q(JSON.stringify({ budget: null }))})`, { setup }); assert.ok(r.ok, r.err); return r; };
  const CHECK = (who, profile, setup = '') => run(who, `select app.schedule_plan_check('${profile}')`, { setup });
  it('PLAN-GATE-01: FREE: lưu hồ sơ ĐƯỢC; xem trước và commit đều PLAN_REQUIRED (402), commit không ghi gì', () => {
    const FREE = TIER(HH1, 'FREE');
    SAVE_OK(QL, NA, FREE);
    const card = run(QL, `select app.profile_save('${NA}', ${q(JSON.stringify({ cards: [CARD] }))})`, { setup: FREE });
    assert.ok(card.ok, card.err);
    const pv = CHECK(QL, P_NA, FREE);
    PLAN_REQ(pv, 'D-68.free');
    assert.match(pv.err, /miễn phí chưa xem trước và tạo lịch/);
    PLAN_REQ(COMMIT(commit(), QL, FREE), 'D-68.free');
    assert.equal(admin(`select ${versions(NA)}`).rows[0], '1');
    SAVE_OK(HK, SU, TIER(HH2, 'FREE'));
    PLAN_REQ(CHECK(HK, P_SU, TIER(HH2, 'FREE')), 'D-68.free');
  });

  it('PLAN-GATE-02: kiểm gói chạy SAU kiểm quyền: NL không grant, hộ khác, máy con nhận FORBIDDEN/NOT_FOUND chứ không PLAN_REQUIRED', () => {
    const FREE = TIER(HH1, 'FREE');
    rejected(CHECK(NL, P_BIN, FREE), 'NOT_FOUND', 'PT404');
    rejected(CHECK(NL, P_NA, FREE), 'FORBIDDEN', 'PT403');
    rejected(CHECK(HK, P_NA, FREE), 'NOT_FOUND', 'PT404');
    rejected(CHECK(DEV, P_NA, FREE), 'FORBIDDEN', 'PT403');
    assert.equal(CHECK(ANON, P_NA, FREE).code, '42501');
    rejected(run(QL, `select app.schedule_plan_check('00000000-0000-4000-8000-0000000fffff')`, { setup: FREE }), 'NOT_FOUND', 'PT404');
  });

  it('PLAN-GATE-03: gửi lại cùng khóa idempotency vẫn trả kết quả cũ khi gói đã hạ xuống FREE (replay chạy trước kiểm gói)', () => {
    const c = commit();
    const r = run(QL, `select ${c.call}; reset role; update app.household_plans set tier = 'FREE' where household_id = '${HH1}'; set local role authenticated;
      ${as(QL)} select ${c.call}`, { setup: c.setup });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).replay, false); assert.equal(J(r, 1).replay, true);
    PLAN_REQ(run(QL, `select ${commit({ key: '30000000-0000-4000-8000-0000000000a2' }).call}`, { setup: `${TIER(HH1, 'FREE')} ${commit({ key: '30000000-0000-4000-8000-0000000000a2' }).setup}` }), 'D-68.free');
  });

  it('PLAN-GATE-04: TRIAL tạo kế hoạch đầu tiên của con được (con chưa có phiên bản nào); xem trước được', () => {
    const c = commit({ child: SU, profile: P_SU, rev: 0 });
    const r = run(HK, `select ${c.call}; select app.my_plan()`, { setup: `${TIER(HH2, 'TRIAL')} ${c.setup}` });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).rev, 1);
    const p = J(r, 1);
    assert.deepEqual(p.children, [{ child_id: SU, plans_used: 1, edits_used: 0, edits_left: 3 }]);
    assert.ok(CHECK(HK, P_SU, TIER(HH2, 'TRIAL')).ok);
  });

  it('PLAN-GATE-05: TRIAL con đã có kế hoạch: sửa tối đa 3 lần (phiên bản mới), lần thứ 4 PLAN_REQUIRED', () => {
    for (const [n, ok] of [[0, true], [2, true], [3, false], [6, false]]) {
      const c = commit({ rev: 1 + n, key: `30000000-0000-4000-8000-00000000b00${n}` });
      const r = COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(n)}`);
      if (ok) { assert.ok(r.ok, `n=${n}: ${r.err}`); assert.equal(J(r).rev, 2 + n); }
      else PLAN_REQ(r, 'D-68.trial_edit');
    }
    assert.equal(admin(`select ${versions(NA)}`).rows[0], '1');
  });

  it('PLAN-GATE-06: đếm THEO CON: bé Na hết lượt sửa nhưng bé Bin vẫn tạo kế hoạch đầu và sửa đủ 3 lần riêng; hết lượt của Bin không ảnh hưởng Na', () => {
    const T = TIER(HH1, 'TRIAL') + NA_EDITS(3);
    PLAN_REQ(COMMIT(commit({ rev: 4, key: '30000000-0000-4000-8000-00000000c001' }), QL, T), 'D-68.trial_edit');   // Na hết lượt
    const BIN_EDITS = (n) => EDITS(BIN, P_BIN, MEM_HOA, 1, n);
    const first = COMMIT(commit({ child: BIN, profile: P_BIN, rev: 0, key: '30000000-0000-4000-8000-00000000c002' }), QL, T);
    assert.ok(first.ok, first.err);                                                                                  // Bin tạo kế hoạch đầu
    assert.ok(CHECK(QL, P_BIN, T).ok);
    const third = COMMIT(commit({ child: BIN, profile: P_BIN, rev: 2, key: '30000000-0000-4000-8000-00000000c003' }), QL, `${T} ${BIN_EDITS(2)}`);
    assert.ok(third.ok, third.err);                                                                                  // Bin: đã có 2 phiên bản (1 sửa) + lần này = lần sửa thứ 2, còn lượt
    PLAN_REQ(COMMIT(commit({ child: BIN, profile: P_BIN, rev: 4, key: '30000000-0000-4000-8000-00000000c004' }), QL, `${T} ${BIN_EDITS(4)}`), 'D-68.trial_edit');
    const kids = J(run(QL, `select app.my_plan()`, { setup: `${T} ${BIN_EDITS(4)}` })).children;
    assert.deepEqual(kids.map((c) => [c.child_id, c.edits_used, c.edits_left]), [[NA, 3, 0], [BIN, 3, 0]]);
  });

  it('PLAN-GATE-07: xem trước (schedule_plan_check) bị chặn khi con hết lượt sửa TRIAL; còn lượt thì qua; lưu hồ sơ vẫn được', () => {
    const ok = CHECK(QL, P_NA, TIER(HH1, 'TRIAL') + NA_EDITS(2));
    assert.ok(ok.ok, ok.err);
    const s = CHECK(QL, P_NA, TIER(HH1, 'TRIAL') + NA_EDITS(3));
    PLAN_REQ(s, 'D-68.trial_edit');
    assert.match(s.err, /mỗi con tối đa 3 lần/);
    SAVE_OK(QL, NA, TIER(HH1, 'TRIAL') + NA_EDITS(3));
  });

  it('PLAN-GATE-08: TRIAL quá hạn (trial_ends_at đã qua) bị chặn như FREE: xem trước, commit; lưu hồ sơ vẫn được', () => {
    const E = TIER(HH1, 'TRIAL', EXPIRED);
    PLAN_REQ(CHECK(QL, P_NA, E), 'D-68.free');
    PLAN_REQ(COMMIT(commit(), QL, E), 'D-68.free');
    SAVE_OK(QL, NA, E);
  });

  it('PLAN-GATE-09: PREMIUM không giới hạn số lần sửa lẫn số kế hoạch (hai con cùng có kế hoạch); xem trước được', () => {
    const r = COMMIT(commit({ rev: 13, key: '30000000-0000-4000-8000-00000000b0aa' }), QL, NA_EDITS(12));
    assert.ok(r.ok, r.err);
    const b = COMMIT(commit({ child: BIN, profile: P_BIN, rev: 0, key: '30000000-0000-4000-8000-00000000b0ab' }), QL, NA_EDITS(12));
    assert.ok(b.ok, b.err);
    assert.ok(CHECK(QL, P_NA, NA_EDITS(12)).ok);
  });

  it('PLAN-GATE-10: đổi tham số trial_edits_max có hiệu lực không cần sửa hàm; 0 nghĩa là con đã có kế hoạch không sửa được', () => {
    const c = commit({ rev: 4, key: '30000000-0000-4000-8000-00000000b0ac' });
    PLAN_REQ(COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(3)}`), 'D-68.trial_edit');
    const up = COMMIT(c, QL, `${TIER(HH1, 'TRIAL')} ${NA_EDITS(3)} update private.params set value_int = 4 where key = 'trial_edits_max';`);
    assert.ok(up.ok, up.err);
    const zero = CHECK(QL, P_NA, `${TIER(HH1, 'TRIAL')} update private.params set value_int = 0 where key = 'trial_edits_max';`);
    PLAN_REQ(zero, 'D-68.trial_edit');
  });
});

describe('PLAN-PAIR: ghép máy theo KHÓA ghép máy (D-74; thay "chỉ PREMIUM" của D-68)', { skip }, () => {
  const FLOW = `update app.children set has_device = true where id = '${BIN}';
    insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${DEV_NEW_SUB}', private.pair_hmac('${CODE}'), now() + interval '10 minutes');`;
  const CONFIRM = `select app.pair_confirm('${BIN}', '${CODE}', '${PIN}')`;
  const KEYS = (hh, n) => `update app.household_plans set device_keys = ${n} where household_id = '${hh}';`;
  /** bé Na (seed) đang giữ 1 khóa bằng liên kết HIEU_LUC; bỏ liên kết đó để hộ có 0 máy. */
  const NO_DEVICE = `update app.device_bindings set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'BO_ME_HUY' where child_id = '${NA}' and state = 'HIEU_LUC';`;
  const state = `reset role; select (select count(*) from app.device_bindings where child_id = '${BIN}'), (select state from private.pairing_codes where device_user_id = '${DEV_NEW_SUB}'),
      (select count(*) from private.pair_throttle)`;
  const CLEAN = (setup, rule) => {          // bị từ chối mà không tiêu mã, không đếm sai, không tạo binding
    const r = run(QL, `do $t$ begin ${CONFIRM.replace('select ', 'perform ')}; exception when sqlstate 'PT402' then null; end $t$; ${state}`, { setup });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], '0|CON_HAN|0', rule);
  };

  it('PLAN-PAIR-01: pair_confirm: FREE, TRIAL quá hạn, hộ chưa có dòng gói bị PLAN_REQUIRED (không tiêu mã, không đếm sai, không tạo binding)', () => {
    for (const t of [TIER(HH1, 'FREE'), TIER(HH1, 'TRIAL', EXPIRED), `delete from app.household_plans where household_id = '${HH1}';`]) {
      PLAN_REQ(run(QL, CONFIRM, { setup: FLOW + t }), 'D-68.premium');
      CLEAN(FLOW + t, 'PLAN_REQUIRED');
    }
  });

  it('PLAN-PAIR-02: hết khóa: PREMIUM 1 khóa (Na đang giữ), PREMIUM 0 khóa, TRIAL (1 khóa, Na đang giữ) -> DEVICE_KEY_LIMIT 402 `D-74.keys`, lời tiếng Việt nêu số khóa; không tiêu mã, không tạo binding', () => {
    for (const t of [KEYS(HH1, 1), KEYS(HH1, 0), TIER(HH1, 'TRIAL')]) {
      const r = run(QL, CONFIRM, { setup: FLOW + t });
      rejected(r, 'DEVICE_KEY_LIMIT', 'PT402', 'D-74.keys');
      assert.match(r.err, /Hãy hủy liên kết một máy hoặc nâng cấp gói/);
      CLEAN(FLOW + t, 'DEVICE_KEY_LIMIT');
    }
    assert.match(run(QL, CONFIRM, { setup: FLOW + KEYS(HH1, 1) }).err, /tối đa 1 máy/);
  });

  it('PLAN-PAIR-03: còn khóa thì ghép được: TRIAL còn hạn khi chưa có máy nào (1 khóa dùng thử); PREMIUM 2 khóa khi đã có 1 máy; hộ khác không chia khóa', () => {
    const t = run(QL, `${CONFIRM}; ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW + TIER(HH1, 'TRIAL', { ends: `now() + interval '5 days'` }) + NO_DEVICE });
    assert.equal(J(t, 0).ok, true); assert.equal(J(t, 1).ok, true);
    const p = run(QL, `${CONFIRM}; ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW + KEYS(HH1, 2) });
    assert.equal(J(p, 0).ok, true); assert.equal(J(p, 1).ok, true);
    // hộ 2 đang có máy chờ (seed) nhưng khóa của hộ 1 không bị tính chung
    assert.equal(J(run(QL, CONFIRM, { setup: FLOW + KEYS(HH1, 2) + KEYS(HH2, 1) })).ok, true);
  });

  it('PLAN-PAIR-04: yêu cầu ghép đang chờ máy con xác nhận giữ một khóa; quá hạn xác nhận thì nhả khóa; liên kết đã hủy nhả khóa; con khác của hộ bị chặn khi hết khóa', () => {
    const SUB5 = '00000000-0000-4000-8000-0000000000a5';
    const C3 = '00000000-0000-4000-8000-0000000000c3';
    const F2 = `${FLOW} ${KEYS(HH1, 2)}
      insert into app.children (id, household_id, call_name, grade, mode, has_device) values ('${C3}', '${HH1}', 'bé Cả', 3, 'CHILD_EXECUTED', true);
      delete from private.pairing_codes where device_user_id = '${SUB5}';
      insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${SUB5}', private.pair_hmac('246802'), now() + interval '10 minutes');`;
    const C2 = `select app.pair_confirm('${C3}', '246802', null)`;
    // Na (HIEU_LUC) + Bin (chờ) = 2 khóa đã dùng: con thứ ba bị chặn. (PIN đã có sau lần ghép đầu của chị Hoa: gọi lần hai không kèm PIN.)
    const blocked = run(QL, `${CONFIRM}; ${C2}`, { setup: F2 });
    rejected(blocked, 'DEVICE_KEY_LIMIT', 'PT402', 'D-74.keys');
    // yêu cầu chờ của Bin quá hạn xác nhận (5 phút): không còn giữ khóa
    const aged = run(QL, `${CONFIRM}; ${adm(`update app.device_bindings set created_at = now() - interval '10 minutes' where child_id = '${BIN}'`)} ${as(QL)} ${C2}`, { setup: F2 });
    assert.ok(aged.ok, aged.err);
    // liên kết đã hủy nhả khóa
    const freed = run(QL, `${CONFIRM}; ${adm(`update app.device_bindings set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'BO_ME_HUY' where child_id = '${BIN}'`)} ${as(QL)} ${C2}`, { setup: F2 });
    assert.ok(freed.ok, freed.err);
    // yêu cầu chờ của CHÍNH con đó không tính: xác nhận lại cho Bin bằng máy khác thì thay yêu cầu cũ, dù hộ đang ở đúng 2/2 khóa
    const again = run(QL, `${CONFIRM}; ${adm(`delete from private.pairing_codes where device_user_id = '${SUB5}'; insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${SUB5}', private.pair_hmac('246810'), now() + interval '10 minutes')`)} ${as(QL)}
      select app.pair_confirm('${BIN}', '246810', null); reset role;
      select (select count(*) from app.device_bindings where child_id = '${BIN}' and state = 'CHO_XAC_NHAN_MAY_CON'), (select count(*) from app.device_bindings where child_id = '${BIN}' and state = 'DA_HUY')`,
      { setup: FLOW + KEYS(HH1, 2) });
    assert.ok(again.ok, again.err);
    assert.equal(again.rows.at(-1), '1|1', 'yêu cầu mới thay yêu cầu cũ');
  });

  it('PLAN-PAIR-05: pair_accept: giảm khóa hoặc hạ gói giữa chừng thì máy con không ghép nốt (yêu cầu vẫn chờ, không tự hủy); trả lại khóa thì ghép được', () => {
    const st = (cond) => `reset role; select state from app.device_bindings where child_id = '${BIN}' and device_user_id = '${DEV_NEW_SUB}'`;
    const lim = run(QL, `${CONFIRM}; ${adm(KEYS(HH1, 1).slice(0, -1))} ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW + KEYS(HH1, 2) });
    rejected(lim, 'DEVICE_KEY_LIMIT', 'PT402', 'D-74.keys');
    const keep = run(QL, `${CONFIRM}; ${adm(KEYS(HH1, 1).slice(0, -1))} ${as(DEV_NEW)}
      do $t$ begin perform app.pair_accept(); exception when sqlstate 'PT402' then null; end $t$; ${st()}`, { setup: FLOW + KEYS(HH1, 2) });
    assert.equal(keep.rows.at(-1), 'CHO_XAC_NHAN_MAY_CON');
    const free = run(QL, `${CONFIRM}; ${adm(TIER(HH1, 'FREE').slice(0, -1))} ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW + KEYS(HH1, 2) });
    PLAN_REQ(free, 'D-68.premium');
    const ok = run(QL, `${CONFIRM}; ${as(DEV_NEW)} select app.pair_accept()`, { setup: FLOW + KEYS(HH1, 2) });
    assert.equal(J(ok, 1).ok, true);
  });

  it('PLAN-PAIR-06: máy đã ghép giữ liên kết khi hộ hạ gói (không tự hủy); gọi lại pair_accept trả replay; pair_code_create của máy chưa ghép không bị chặn theo gói', () => {
    const r = run(DEV, `select app.pair_accept(); select (select count(*) from app.device_bindings where state = 'HIEU_LUC' and child_id = '${NA}')`, { setup: TIER(HH1, 'FREE') });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).replay, true); assert.equal(r.rows[1], '1');
    const c = run(DEV_NEW, `select app.pair_code_create()`, { setup: TIER(HH1, 'FREE') + TIER(HH2, 'FREE') });
    assert.ok(c.ok, c.err);
  });
});

describe('PLAN-SYNC: đồng bộ lịch sang máy con chỉ cho máy còn trong gói và trong số khóa (outbox lich_moi)', { skip }, () => {
  const outbox = `reset role; select count(*) from app.notifications where child_id = '${NA}' and type = 'lich_moi'`;
  const BIN_DEV = `update app.children set has_device = true where id = '${BIN}';
    insert into app.device_bindings (child_id, device_user_id, state, paired_by_member_id, paired_at)
      values ('${BIN}', '${DEV_NEW_SUB}', 'HIEU_LUC', '${MEM_HOA}', now() - interval '1 day');`;      // máy của Bin ghép TRƯỚC máy của Na
  const sync = (setup) => { const c = commit(); const r = run(QL, `select ${c.call}; ${outbox}`, { setup: `${setup} ${c.setup}` }); assert.ok(r.ok, r.err); return Number(r.rows.at(-1)); };
  it('PLAN-SYNC-01: PREMIUM ghi outbox cho máy đã ghép; TRIAL (còn hạn, 1 khóa) cũng ghi (D-74); PREMIUM 0 khóa commit được nhưng KHÔNG ghi; liên kết vẫn HIEU_LUC', () => {
    assert.equal(sync(''), 2, 'PREMIUM: hàng seed + 1');
    assert.equal(sync(TIER(HH1, 'TRIAL')), 2, 'TRIAL còn hạn');
    assert.equal(sync(`update app.household_plans set device_keys = 0 where household_id = '${HH1}';`), 1, 'PREMIUM 0 khóa: chỉ hàng seed');
    // FREE và TRIAL quá hạn không tạo/sửa được kế hoạch (PLAN_REQUIRED), nên không có lần commit nào để ghi outbox; liên kết vẫn giữ
    const c = commit();
    const t = run(QL, `select ${c.call}; reset role; select count(*) from app.device_bindings where child_id = '${NA}' and state = 'HIEU_LUC'`, { setup: `update app.household_plans set device_keys = 0 where household_id = '${HH1}'; ${c.setup}` });
    assert.equal(t.rows[1], '1', 'liên kết vẫn HIEU_LUC');
  });
  it('PLAN-SYNC-02: máy vượt số khóa (ghép sau cùng) không nhận lịch mới; đủ khóa thì nhận; không tự hủy liên kết', () => {
    assert.equal(sync(`${BIN_DEV} update app.household_plans set device_keys = 1 where household_id = '${HH1}';`), 1, 'khóa 1: máy Bin giữ, máy Na vượt');
    assert.equal(sync(`${BIN_DEV} update app.household_plans set device_keys = 2 where household_id = '${HH1}';`), 2, 'khóa 2: cả hai');
    assert.equal(sync(`${BIN_DEV} update app.household_plans set device_keys = 0 where household_id = '${HH1}';`), 1, 'khóa 0: không máy nào');
    const c = commit();
    const r = run(QL, `select ${c.call}; select count(*) from app.device_bindings where state = 'HIEU_LUC' and child_id in ('${NA}', '${BIN}')`,
      { setup: `${BIN_DEV} update app.household_plans set device_keys = 1 where household_id = '${HH1}'; ${c.setup}` });
    assert.equal(r.rows[1], '2');
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

// ================================================================ D-72
const H1 = 'a'.repeat(64);
const H2 = 'b'.repeat(64);
const QL_SUB = '00000000-0000-4000-8000-0000000000a1';
/** Đưa hộ 1 về FREE chưa từng dùng thử (xóa dòng gói): đủ điều kiện gọi trial_start. */
const FRESH = `delete from app.household_plans where household_id = '${HH1}';`;
/** Ghi sẵn một lần dùng thử của hộ khác (hộ ma): mã máy và email thô (được chuẩn hóa + băm như trial_start). */
const CLAIM = (device, email) => `insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${device}', private.email_hash(${q(email)}), gen_random_uuid());`;
const SET_EMAIL = (email) => `update auth.users set email = ${q(email)} where id = '${QL_SUB}';`;
const START = (who, hash, setup = '') => run(who, `select app.trial_start('${hash}')`, { setup });
const USED = (r, rule = 'D-72') => rejected(r, 'TRIAL_USED', 'PT409', rule);

describe('PLAN-TRIAL: app.trial_start và private.trial_claims (D-72)', { skip }, () => {
  it('PLAN-TRIAL-01: email chuẩn hóa: chữ thường; mọi miền bỏ phần sau "+"; gmail/googlemail bỏ dấu chấm và thành gmail.com; miền khác giữ dấu chấm', () => {
    const e = (x) => admin(`select private.email_norm(${q(x)})`).rows[0];
    assert.equal(e('Hoa.Nguyen+Test@Example.Test'), 'hoa.nguyen@example.test');
    assert.equal(e('  HOA@example.test '), 'hoa@example.test');
    assert.equal(e('Ho.A.n+x+y@Gmail.com'), 'hoan@gmail.com');
    assert.equal(e('ho.an@googlemail.com'), 'hoan@gmail.com');
    assert.equal(e('ho.an@gmail.com.vn'), 'ho.an@gmail.com.vn');
    assert.equal(e('hoan+@gmail.com'), 'hoan@gmail.com');
    assert.equal(e('khong-co-a-cong'), 'khong-co-a-cong');
    assert.equal(admin(`select private.email_hash('HOA+1@example.test') = private.email_hash('hoa@example.test')`).rows[0], 't');
    assert.equal(admin(`select private.email_hash('ho.a@example.test') = private.email_hash('hoa@example.test')`).rows[0], 'f');
  });

  it('PLAN-TRIAL-02: hộ đủ điều kiện: TRIAL đủ trial_days (7), ghi một dòng trial_claims chỉ có băm (không email thô, không Android ID), audit plan.changed FREE -> TRIAL do người lớn', () => {
    const r = run(QL, `select app.trial_start('${H1}'); select app.my_plan();
      reset role; select count(*), min(device_hash), bool_and(email_norm_hash ~ '^[0-9a-f]{64}$' and position('@' in email_norm_hash) = 0), min(household_id::text) from private.trial_claims;
      select tier, set_by, trial_ends_at - trial_started_at = interval '7 days', expired_noted_at is null from app.household_plans where household_id = '${HH1}';
      select actor_kind || '|' || meta::text from app.audit_log where event_code = 'plan.changed' and household_id = '${HH1}' order by at desc, id limit 1`, { setup: FRESH });
    assert.ok(r.ok, r.err);
    const o = J(r, 0);
    assert.equal(o.tier, 'TRIAL'); assert.match(o.trial_ends_at, /^\d{4}-\d\d-\d\dT/);
    const p = J(r, 1);
    assert.equal(p.tier, 'TRIAL'); assert.equal(p.trial_available, false); assert.equal(p.expired, false);
    assert.equal(r.rows[2], `1|${H1}|t|${HH1}`);
    assert.equal(r.rows[3], 'TRIAL|self|t|t');
    assert.equal(r.rows[4], 'adult|{"new_tier": "TRIAL", "old_tier": "FREE"}');
  });

  it('PLAN-TRIAL-03: hộ FREE có dòng gói nhưng chưa từng dùng thử cũng bắt đầu được; sau đó tạo kế hoạch đầu của con được', () => {
    const r = run(QL, `select app.trial_start('${H1}')`, { setup: `update app.household_plans set tier = 'FREE', had_premium = false where household_id = '${HH1}';` });
    assert.ok(r.ok, r.err);
    assert.equal(J(r).tier, 'TRIAL');
    const c = commit({ child: BIN, profile: P_BIN, rev: 0, key: '30000000-0000-4000-8000-00000000d001' });
    const k = run(QL, `select app.trial_start('${H1}'); ${as(QL)} select ${c.call}`, { setup: `${FRESH} ${c.setup}` });
    assert.ok(k.ok, k.err);
    assert.equal(J(k, 1).rev, 1);
  });

  it('PLAN-TRIAL-04: lặp theo MÃ MÁY: mã máy đã có trong trial_claims -> TRIAL_USED 409, không đổi gói, không thêm dòng', () => {
    const r = START(QL, H1, `${FRESH} ${CLAIM(H1, 'nguoi-khac@example.test')}`);
    USED(r, 'D-72.claim');
    assert.match(r.err, /Máy này hoặc email này đã dùng thử/);
    const after = run(QL, `do $t$ begin perform app.trial_start('${H1}'); exception when sqlstate 'PT409' then null; end $t$; reset role;
      select (select count(*) from private.trial_claims), (select count(*) from app.household_plans where household_id = '${HH1}')`, { setup: `${FRESH} ${CLAIM(H1, 'nguoi-khac@example.test')}` });
    assert.equal(after.rows.at(-1), '1|0');
    assert.ok(START(QL, H2, `${FRESH} ${CLAIM(H1, 'nguoi-khac@example.test')}`).ok, 'mã máy khác thì được');
  });

  it('PLAN-TRIAL-05: lặp theo EMAIL chuẩn hóa: biến thể hoa/thường, "+tag" đều bị chặn; email khác hẳn (kể cả khác dấu chấm ở miền thường) thì được', () => {
    for (const old of ['HOA@Example.Test', 'hoa+thu1@example.test', 'Hoa+a+b@EXAMPLE.test']) {
      USED(START(QL, H2, `${FRESH} ${CLAIM(H1, old)}`), 'D-72.claim');
    }
    assert.ok(START(QL, H2, `${FRESH} ${CLAIM(H1, 'ho.a@example.test')}`).ok, 'miền thường: dấu chấm là khác');
    assert.ok(START(QL, H2, `${FRESH} ${CLAIM(H1, 'hoa2@example.test')}`).ok);
  });

  it('PLAN-TRIAL-06: gmail: biến thể dấu chấm, "+", googlemail đều coi là một email; không áp cho miền khác', () => {
    const E = SET_EMAIL('Ho.A+abc@gmail.com');
    for (const old of ['hoa@gmail.com', 'h.o.a@googlemail.com', 'HOA+x@Gmail.com']) {
      USED(START(QL, H2, `${FRESH} ${E} ${CLAIM(H1, old)}`), 'D-72.claim');
    }
    assert.ok(START(QL, H2, `${FRESH} ${E} ${CLAIM(H1, 'hoa@gmail.com.vn')}`).ok);
    assert.ok(START(QL, H2, `${FRESH} ${E} ${CLAIM(H1, 'hoa@yahoo.com')}`).ok);
    USED(START(QL, H2, `${FRESH} ${SET_EMAIL('hoa@googlemail.com')} ${CLAIM(H1, 'h.o.a+z@gmail.com')}`), 'D-72.claim');
  });

  it('PLAN-TRIAL-07: hộ đã từng TRIAL hoặc PREMIUM bị TRIAL_USED (rule D-72.household) dù mã máy/email mới; PREMIUM đang dùng cũng vậy', () => {
    for (const [name, setup] of [
      ['đang PREMIUM', ''],
      ['đang TRIAL', TIER(HH1, 'TRIAL')],
      ['TRIAL hết hạn', TIER(HH1, 'TRIAL', EXPIRED)],
      ['FREE nhưng từng TRIAL', `update app.household_plans set tier = 'FREE', trial_started_at = now() - interval '30 days', trial_ends_at = now() - interval '23 days' where household_id = '${HH1}';`],
      ['FREE nhưng từng PREMIUM', `update app.household_plans set tier = 'FREE' where household_id = '${HH1}';`],
    ]) {
      const r = START(QL, H1, setup);
      assert.equal(r.ok, false, name);
      USED(r, 'D-72.household');
    }
    assert.equal(admin(`select count(*) from private.trial_claims`).rows[0], '0');
  });

  it('PLAN-TRIAL-08: chỉ người quản lý chính; NL, máy con, người chưa có hộ bị từ chối; anon không có EXECUTE; đầu vào sai; không có email', () => {
    rejected(START(NL, H1, FRESH), 'FORBIDDEN', 'PT403');
    rejected(START(DEV, H1, FRESH), 'FORBIDDEN', 'PT403');
    rejected(START(MAI, H1), 'FORBIDDEN', 'PT403');
    assert.equal(START(ANON, H1, FRESH).code, '42501');
    for (const bad of ['', 'xyz', 'A'.repeat(64), 'a'.repeat(63), 'a'.repeat(65)]) rejected(START(QL, bad, FRESH), 'VALIDATION', 'PT422');
    assert.equal(run(QL, `select app.trial_start(null)`, { setup: FRESH }).code, 'PT422');
    rejected(START(QL, H1, `${FRESH} ${SET_EMAIL('')}`), 'VALIDATION', 'PT422');
    rejected(START(QL, H1, `${FRESH} update auth.users set email = null where id = '${QL_SUB}';`), 'VALIDATION', 'PT422');
    rejected(START(HK, H1, `${FRESH}`), 'TRIAL_USED', 'PT409');                    // hộ 2 đang PREMIUM
  });

  it('PLAN-TRIAL-09: hộ đóng băng -> FROZEN; hộ ẩn -> NOT_FOUND; không dùng mã máy', () => {
    rejected(START(QL, H1, `${FRESH} update app.households set state = 'DONG_BANG', frozen_at = now() where id = '${HH1}';`), 'FROZEN', 'PT423');
    rejected(START(QL, H1, `${FRESH} update app.households set hidden_at = now() where id = '${HH1}';`), 'NOT_FOUND', 'PT404');
    assert.equal(admin(`select count(*) from private.trial_claims`).rows[0], '0');
  });

  it('PLAN-TRIAL-10: người dùng, anon không đọc/ghi trial_claims; chỉ service_role', () => {
    for (const who of [QL, NL, DEV, HK, ANON]) {
      assert.equal(run(who, `select count(*) from private.trial_claims`).code, '42501');
      assert.equal(run(who, `insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', '${H2}', gen_random_uuid())`).code, '42501');
    }
    assert.equal(run(SVC, `select count(*) from private.trial_claims`).ok, true);
    assert.equal(admin(`insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('x', '${H2}', gen_random_uuid())`).code, '23514');
    assert.equal(admin(`insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', 'y', gen_random_uuid())`).code, '23514');
    assert.equal(admin(`insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', '${H1}', gen_random_uuid()), ('${H1}', '${H2}', gen_random_uuid())`).code, '23505');
    assert.equal(admin(`insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', '${H1}', gen_random_uuid()), ('${H2}', '${H1}', gen_random_uuid())`).code, '23505');
  });

  it('PLAN-TRIAL-11: purge_household KHÔNG xóa trial_claims (chống lặp sau khi xóa hộ), không ghi vào row_counts; vẫn chặn dùng thử lại bằng mã máy cũ', () => {
    const r = run(SVC, `select app.purge_household('${HH2}', 'GIA_LAP_DIEN_TAP'); select count(*) from private.trial_claims where household_id = '${HH2}';
      select row_counts::text like '%trial_claims%' from app.deletion_evidence order by purged_at desc limit 1`,
      { setup: `insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', '${H2}', '${HH2}');` });
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(1), ['1', 'f']);
    USED(START(QL, H1, `${FRESH} insert into private.trial_claims (device_hash, email_norm_hash, household_id) values ('${H1}', '${H2}', gen_random_uuid());`), 'D-72.claim');
  });

  it('PLAN-TRIAL-12: trial_start gọi lại ngay sau khi thành công -> TRIAL_USED (hộ); sau TRIAL hết hạn không dùng thử lại được', () => {
    const r = run(QL, `select app.trial_start('${H1}'); ${as(QL)} do $t$ begin perform app.trial_start('${H2}'); exception when sqlstate 'PT409' then null; end $t$; reset role; select (select count(*) from private.trial_claims)`, { setup: FRESH });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows.at(-1), '1');
    USED(run(QL, `select app.trial_start('${H2}')`, { setup: `${FRESH} insert into app.household_plans (household_id, tier, trial_started_at, trial_ends_at)
      values ('${HH1}', 'FREE', now() - interval '9 days', now() - interval '2 days');` }), 'D-72.household');
  });
});

describe('PLAN-ACTIVE: app.my_family_state.plan_active (máy con, D-72, D-74)', { skip }, () => {
  const active = (setup = '', who = DEV) => J(run(who, `select app.my_family_state()`, { setup })).plan_active;
  const BIN_DEV = `update app.children set has_device = true where id = '${BIN}';
    insert into app.device_bindings (child_id, device_user_id, state, paired_by_member_id, paired_at)
      values ('${BIN}', '${DEV_NEW_SUB}', 'HIEU_LUC', '${MEM_HOA}', now() - interval '1 day');`;      // máy của Bin ghép TRƯỚC máy của Na
  it('PLAN-ACTIVE-01: PREMIUM (còn khóa) và TRIAL còn hạn là true; TRIAL quá hạn, FREE, hộ chưa có gói, PREMIUM 0 khóa là false; trả đúng ba khóa ngoài ok', () => {
    assert.equal(active(), true);
    assert.equal(active(TIER(HH1, 'TRIAL')), true);
    assert.equal(active(TIER(HH1, 'TRIAL', { ends: `now() + interval '5 days'` })), true);
    assert.equal(active(TIER(HH1, 'TRIAL', EXPIRED)), false);
    assert.equal(active(TIER(HH1, 'FREE')), false);
    assert.equal(active(`delete from app.household_plans where household_id = '${HH1}';`), false);
    assert.equal(active(`update app.household_plans set device_keys = 0 where household_id = '${HH1}';`), false);
    assert.deepEqual(Object.keys(J(run(DEV, `select app.my_family_state()`))).sort(), ['frozen', 'ok', 'plan_active', 'state']);
  });
  it('PLAN-ACTIVE-02: đổi gói theo hộ: hạ rồi nâng lại -> false rồi true; hộ khác không ảnh hưởng; liên kết giữ nguyên', () => {
    const r = run(DEV, `select app.my_family_state(); reset role; update app.household_plans set tier = 'FREE' where household_id = '${HH1}'; ${as(DEV)} set local role authenticated;
      select app.my_family_state(); reset role; update app.household_plans set tier = 'TRIAL', trial_started_at = now() where household_id = '${HH1}'; ${as(DEV)} set local role authenticated; select app.my_family_state();
      reset role; select count(*) from app.device_bindings where child_id = '${NA}' and state = 'HIEU_LUC'`);
    assert.ok(r.ok, r.err);
    assert.deepEqual([J(r, 0).plan_active, J(r, 1).plan_active, J(r, 2).plan_active, r.rows[3]], [true, false, true, '1']);
    assert.equal(J(run(DEV, `select app.my_family_state()`, { setup: TIER(HH2, 'FREE') })).plan_active, true);
  });
  it('PLAN-ACTIVE-03: giảm khóa dưới số máy đang ghép: không hủy liên kết; máy ghép SAU CÙNG vượt khóa tạm dừng, máy ghép trước vẫn chạy; nâng khóa thì cả hai chạy', () => {
    const k = (n) => `${BIN_DEV} update app.household_plans set device_keys = ${n} where household_id = '${HH1}';`;
    assert.deepEqual([active(k(2)), active(k(2), DEV_NEW)], [true, true]);
    assert.deepEqual([active(k(1)), active(k(1), DEV_NEW)], [false, true], 'Na ghép sau Bin: vượt khóa');
    assert.deepEqual([active(k(0)), active(k(0), DEV_NEW)], [false, false]);
    const n = admin(`${k(1)} select count(*) from app.device_bindings where state = 'HIEU_LUC' and child_id in ('${NA}', '${BIN}')`);
    assert.equal(n.rows[0], '2', 'không tự hủy liên kết');
    assert.deepEqual([active(`${BIN_DEV} ${TIER(HH1, 'TRIAL')}`), active(`${BIN_DEV} ${TIER(HH1, 'TRIAL')}`, DEV_NEW)], [false, true], 'TRIAL 1 khóa: chỉ máy ghép trước');
  });
});

describe('PLAN-NOTIFY: outbox goi_doi cho máy con khi "gói đang hoạt động" của hộ đổi hoặc số khóa đổi (D-72, D-74)', { skip }, () => {
  const rows = (extra = '') => `reset role; select coalesce(string_agg(payload_min::text || '|' || recipient_kind || '|' || state, ';'), '') from app.notifications where type = 'goi_doi' and child_id = '${NA}' ${extra}`;
  const BIND = '00000000-0000-4000-8000-000000000401';
  /** Đưa seed về PREMIUM 1 khóa (mặc định thật) mà không phát thông báo. */
  const KEY1 = `alter table app.household_plans disable trigger household_plans_notify; update app.household_plans set device_keys = 1 where household_id = '${HH1}'; alter table app.household_plans enable trigger household_plans_notify;`;
  const cnt = `select count(*) from app.notifications where type = 'goi_doi' and child_id = '${NA}'`;
  it('PLAN-NOTIFY-01: mỗi lần "gói hoạt động" đổi (kể cả FREE <-> TRIAL) ghi một hàng goi_doi cho máy đã ghép (nội dung tối giản {type,id}); PREMIUM <-> TRIAL cùng 1 khóa không đổi gì với máy con thì không ghi', () => {
    const r = run(SVC, `select app.plan_set('${HH1}', 'TRIAL'); ${cnt};
      select app.plan_set('${HH1}', 'FREE'); ${rows()}; ${cnt};
      select app.plan_set('${HH1}', 'TRIAL'); ${cnt};
      select app.plan_set('${HH1}', 'PREMIUM'); ${cnt};
      select app.plan_set('${HH1}', 'FREE'); ${cnt}`, { setup: KEY1 });
    assert.ok(r.ok, r.err);
    const n = r.rows.filter((x) => /^\d+$/.test(x)).map(Number);
    assert.deepEqual(n, [0, 1, 2, 2, 3], 'PREMIUM->TRIAL: 0; TRIAL->FREE: 1; FREE->TRIAL: 2; TRIAL->PREMIUM: không đổi (cùng 1 khóa) ; PREMIUM->FREE: 3');
    assert.equal(r.rows.find((x) => x.includes('goi_doi')), `{"id": "${BIND}", "type": "goi_doi"}|device|CHO_GUI`);
  });
  it('PLAN-NOTIFY-02: đổi số khóa hiệu lực ghi goi_doi (máy nào vượt khóa đổi theo); đổi ghi chú, giữ nguyên gói và khóa thì không ghi; máy con chỉ thấy hàng của mình; hộ khác và máy chưa ghép không có', () => {
    const r = run(SVC, `select app.plan_set('${HH1}', 'PREMIUM', null, 'ghi chú mới'); ${cnt}; select app.plan_set('${HH1}', 'PREMIUM', null, null, 'owner', 3); ${cnt}; select app.plan_set('${HH1}', 'PREMIUM', null, null, 'owner', 3); ${cnt}`, { setup: KEY1 });
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.filter((x) => /^\d+$/.test(x)), ['0', '1', '1']);
    const d = run(DEV, `select count(*) from app.notifications where type = 'goi_doi'`, { setup: TIER(HH1, 'FREE') });
    assert.equal(d.rows[0], '1');
    assert.equal(run(QL, `select count(*) from app.notifications where type = 'goi_doi'`, { setup: TIER(HH1, 'FREE') }).rows[0], '0');
    assert.equal(run(HK, `select count(*) from app.notifications where type = 'goi_doi'`, { setup: TIER(HH1, 'FREE') }).rows[0], '0');
    const other = admin(`${TIER(HH2, 'FREE')} select count(*) from app.notifications where type = 'goi_doi'`);
    assert.equal(other.rows[0], '0', 'hộ 2 chưa có máy con đã ghép');
  });
  it('PLAN-NOTIFY-03: hủy liên kết máy rồi đổi gói: không ghi cho liên kết đã hủy; con ẩn không nhận', () => {
    const a = admin(`update app.device_bindings set state = 'DA_HUY', revoked_at = now() where id = '${BIND}'; ${TIER(HH1, 'FREE')} select count(*) from app.notifications where type = 'goi_doi'`);
    assert.equal(a.rows[0], '0');
    const b = admin(`update app.children set hidden_at = now(), hidden_reason = 'XOA' where id = '${NA}'; ${TIER(HH1, 'FREE')} select count(*) from app.notifications where type = 'goi_doi'`);
    assert.equal(b.rows[0], '0');
  });
  it('PLAN-NOTIFY-04: hộ chưa có dòng gói được plan_set PREMIUM: máy đã ghép nhận goi_doi (đường INSERT)', () => {
    const r = run(SVC, `select app.plan_set('${HH1}', 'PREMIUM'); ${rows()}`, { setup: `delete from app.household_plans where household_id = '${HH1}';` });
    assert.ok(r.ok, r.err);
    assert.match(r.rows.at(-1), /goi_doi/);
  });
});

describe('PLAN-EXP: job_daily ghi audit plan.expired khi TRIAL hết hạn (D-72)', { skip }, () => {
  const n = `select count(*) from app.audit_log where event_code = 'plan.expired' and household_id = '${HH1}'`;
  it('PLAN-EXP-01: TRIAL quá hạn: job ghi MỘT dòng plan.expired (hệ thống, không meta); chạy lại không ghi thêm; kết quả job có plan_expiry', () => {
    const r = run(SVC, `${TIER(HH1, 'TRIAL', EXPIRED)} select private.job_daily(); ${n}; select private.job_daily(); select private.job_daily(); ${n};
      select actor_kind || '|' || meta::text || '|' || subject_ref from app.audit_log where event_code = 'plan.expired'`);
    assert.ok(r.ok, r.err);
    assert.equal(JSON.parse(r.rows[0]).plan_expiry.expired, 1);
    assert.equal(r.rows[1], '1');
    assert.equal(JSON.parse(r.rows[2]).plan_expiry.expired, 0);
    assert.equal(r.rows[4], '1');
    assert.equal(r.rows[5], `system|{}|household:${HH1}`);
  });
  it('PLAN-EXP-02: TRIAL còn hạn, TRIAL không hạn, FREE, PREMIUM: không ghi; gia hạn/bắt đầu đợt mới thì được ghi lại khi hết hạn', () => {
    const r = run(SVC, `${TIER(HH1, 'TRIAL', { ends: `now() + interval '2 days'` })} select private.job_daily(); ${n}; ${TIER(HH1, 'TRIAL')} select private.job_daily(); ${n};
      ${TIER(HH1, 'FREE')} select private.job_daily(); ${n}; select private.job_daily(); ${n}`);
    assert.deepEqual(r.rows.filter((x) => !x.startsWith('{')), ['0', '0', '0', '0']);
    const again = run(SVC, `${TIER(HH1, 'TRIAL', EXPIRED)} select private.job_daily(); ${n};
      select app.plan_set('${HH1}', 'FREE'); select app.plan_set('${HH1}', 'TRIAL', now() + interval '1 day');
      update app.household_plans set trial_ends_at = now() - interval '1 minute', trial_started_at = now() - interval '2 days' where household_id = '${HH1}';
      select private.job_daily(); ${n}`);
    assert.deepEqual(again.rows.filter((x) => !x.startsWith('{')), ['1', '2']);
  });
  it('PLAN-EXP-03: job chỉ cho hệ thống: người dùng không gọi được job_plan_expiry', () => {
    for (const who of [QL, NL, DEV, ANON]) assert.equal(run(who, `select private.job_plan_expiry()`).code, '42501');
  });
  it('PLAN-EXP-04: TRIAL hết hạn: job ghi goi_doi cho máy đã ghép đúng một lần (đổi trạng thái theo thời gian không có dòng nào đổi); chạy lại không ghi thêm', () => {
    const c = `select count(*) from app.notifications where type = 'goi_doi' and child_id = '${NA}'`;
    const QUIET = `alter table app.household_plans disable trigger household_plans_notify; ${TIER(HH1, 'TRIAL', EXPIRED)} alter table app.household_plans enable trigger household_plans_notify;`;
    const r = run(SVC, `${c}; select private.job_daily(); ${c}; select private.job_daily(); ${c}`, { setup: QUIET });
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.filter((x) => /^\d+$/.test(x)), ['0', '1', '1']);
  });
});

describe('PLAN-KEY: khóa ghép máy (D-74): device_keys, plan_set, my_plan', { skip }, () => {
  const my = (who, setup = '') => J(run(who, `select app.my_plan()`, { setup }));
  const col = (hh) => admin(`select device_keys from app.household_plans where household_id = '${hh}'`).rows[0];
  it('PLAN-KEY-01: cột device_keys mặc định 1 khi hộ mới vào gói; plan_set đặt số khóa, null giữ nguyên; ngoài 0..50 bị VALIDATION', () => {
    const r = run(SVC, `select app.plan_set('${HH1}', 'PREMIUM'); select device_keys from app.household_plans where household_id = '${HH1}';
      select app.plan_set('${HH1}', 'PREMIUM', null, null, 'owner', 4); select device_keys from app.household_plans where household_id = '${HH1}';
      select app.plan_set('${HH1}', 'FREE'); select device_keys from app.household_plans where household_id = '${HH1}'`, { setup: `delete from app.household_plans where household_id = '${HH1}';` });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).device_keys, 1);
    assert.deepEqual([r.rows[1], r.rows[3], r.rows[5]], ['1', '4', '4'], 'đổi gói không xóa số khóa đã đặt');
    for (const n of [-1, 51]) rejected(run(SVC, `select app.plan_set('${HH1}', 'PREMIUM', null, null, 'owner', ${n})`), 'VALIDATION', 'PT422');
    assert.equal(col(HH1), '5', 'seed');
    // D-74: 7 ngày dùng thử và 1 khóa dùng thử là đã chốt
    assert.equal(admin(`select string_agg(key || '=' || value_int || ':' || status, ',' order by key) from private.params where key in ('trial_days', 'trial_device_keys')`).rows[0],
      'trial_days=7:DA_CHOT,trial_device_keys=1:DA_CHOT');
  });
  it('PLAN-KEY-02: my_plan trả số khóa HIỆU LỰC và số đã dùng: FREE 0; TRIAL luôn 1 (bỏ qua cột); PREMIUM theo cột; yêu cầu chờ trong hạn tính, quá hạn không tính', () => {
    const k = (p) => [p.device_keys, p.device_keys_used];
    assert.deepEqual(k(my(QL)), [5, 1]);
    assert.deepEqual(k(my(QL, `update app.household_plans set device_keys = 3 where household_id = '${HH1}';`)), [3, 1]);
    assert.deepEqual(k(my(QL, TIER(HH1, 'FREE'))), [0, 1]);
    assert.deepEqual(k(my(QL, TIER(HH1, 'TRIAL') + `update app.household_plans set device_keys = 9 where household_id = '${HH1}';`)), [1, 1]);
    assert.deepEqual(k(my(QL, TIER(HH1, 'TRIAL', EXPIRED))), [0, 1]);
    const wait = (age) => `update app.children set has_device = true where id = '${BIN}';
      insert into app.device_bindings (child_id, device_user_id, state, paired_by_member_id, created_at) values ('${BIN}', '${DEV_NEW_SUB}', 'CHO_XAC_NHAN_MAY_CON', '${MEM_HOA}', now() - interval '${age}');`;
    assert.deepEqual(k(my(QL, wait('1 minute'))), [5, 2]);
    assert.deepEqual(k(my(QL, wait('10 minutes'))), [5, 1]);
    assert.deepEqual(k(my(HK)), [5, 1], 'hộ 2: máy bé Su đang chờ xác nhận (seed) giữ 1 khóa');
  });
  it('PLAN-KEY-03: con ẩn và liên kết đã hủy không tính khóa; máy con và người ngoài không gọi được hàm khóa nội bộ', () => {
    assert.equal(my(QL, `update app.children set hidden_at = now(), hidden_reason = 'XOA' where id = '${NA}';`).device_keys_used, 0);
    assert.equal(my(QL, `update app.device_bindings set state = 'DA_HUY', revoked_at = now(), revoke_reason = 'BO_ME_HUY' where child_id = '${NA}';`).device_keys_used, 0);
    for (const who of [QL, NL, DEV, ANON]) {
      for (const fn of [`private.device_keys('${HH1}')`, `private.device_keys_used('${HH1}')`, `private.binding_in_plan('${BIND_ID}')`, `private.device_key_require('${HH1}')`]) {
        assert.equal(run(who, `select ${fn}`).code, '42501', fn);
      }
    }
  });
});
const BIND_ID = '00000000-0000-4000-8000-000000000401';
