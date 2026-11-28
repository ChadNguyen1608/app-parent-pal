// Test T2.3: đóng băng 30 ngày, job-daily, mở lại (chỉ QL), deletion_request, rút luôn được khi đóng băng (D-64).
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
// Mã: LC-JOB (AC-FAM-21, 22, 26; BR-FAM-050..053), LC-FROZEN (RLS-FROZEN, AC-FAM-22), LC-REOPEN (AC-FAM-23, 24; BR-FAM-057, 058),
// LC-DEL (AC-CON-17, 18; BR-FAM-080..089), LC-WITHDRAW (rút luôn được khi đóng băng, D-64), LC-CRON.
// AC-FAM-25 (giai đoạn tạm thời hết hạn khi đóng băng) CHƯA kiểm được: bảng `phases` ở T4.x; phần "không tính là dùng app" được kiểm ở LC-JOB-05.
// Dữ liệu: chỉ tên giả. PIN trong test (482916) là giá trị thử.
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
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const MEM_MINH = '00000000-0000-4000-8000-000000000202';
const MEM_LAN = '00000000-0000-4000-8000-000000000203';
const DEV_NEW_SUB = '00000000-0000-4000-8000-0000000000a7';
const PIN = '482916';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
const DEV_NEW = { role: 'authenticated', sub: DEV_NEW_SUB, claims: { is_anonymous: true } };
const SVC = { role: 'service_role' };
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\n`;
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;
const J = (r, i = 0) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[i]); };
const rejected = (r, code, sqlstate, rule = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, sqlstate, r.err);
  assert.match(r.err, new RegExp(code));
  if (rule) assert.match(r.err, new RegExp(rule));
};
const FORBIDDEN = (r, rule) => rejected(r, 'FORBIDDEN', 'PT403', rule);
const NOT_FOUND = (r) => rejected(r, 'NOT_FOUND', 'PT404');
const VALIDATION = (r, rule) => rejected(r, 'VALIDATION', 'PT422', rule);
const FROZEN = (r) => rejected(r, 'FROZEN', 'PT423');
const UNAUTH = (r) => rejected(r, 'UNAUTHENTICATED', 'PT401');
const NO_EXEC = (r) => { assert.equal(r.ok, false); assert.equal(r.code, '42501'); };

// Giờ tham chiếu của job: quá khứ cố định (hộ 2 vào hệ thống từ "bây giờ" thật nên không bao giờ quá hạn ở mốc này).
const NOW = `'2026-06-30 12:00:00+00'::timestamptz`;
const idle = (ql, nl) => `update app.members set last_active_at = ${NOW} - interval '${ql}' where id = '${MEM_HOA}';
  update app.members set last_active_at = ${NOW} - interval '${nl}' where id = '${MEM_MINH}';`;
const JOB = (now = NOW) => `select private.job_daily(${now})`;
const DO_JOB = (now = NOW) => `do $j$ begin perform private.job_daily(${now}); end $j$;`;
const FREEZE_JOB = `${idle('40 days', '40 days')} ${DO_JOB()}`;   // đóng băng bằng đường thật (job), chạy ở vai quản trị (setup)
const hhState = (hh = HH1) => `select state || ':' || (frozen_at is not null) from app.households where id = '${hh}'`;
const snap = `select (select count(*) from app.children) || ':' || (select count(*) from app.consent_events) || ':' || (select count(*) from app.purpose_state)
  || ':' || (select count(*) from app.grants) || ':' || (select count(*) from app.device_bindings where state = 'HIEU_LUC') || ':' || (select count(*) from private.checkin_responses)`;

// ================================================================ LC-JOB: job đóng băng (AC-FAM-21, 22, 26)
describe('LC-JOB: job-daily đóng băng sau 30 ngày không dùng (D-41, PR-FAM-06)', { skip }, () => {
  it('LC-JOB-01: đúng mốc 30 ngày (>=): 30 ngày đóng băng, thiếu một giây thì không; chạy lại không đổi frozen_at', () => {
    const r = admin(`${idle('30 days', '30 days')} ${JOB()}; ${hhState()}; ${JOB()}; ${hhState()};
      ${idle('29 days 23 hours 59 minutes 59 seconds', '29 days 23 hours 59 minutes 59 seconds')}
      update app.households set state = 'HOAT_DONG', frozen_at = null where id = '${HH1}';
      ${JOB()}; ${hhState()}; select (select frozen_at from app.households where id = '${HH1}') is null;`);
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).freeze.frozen, 1, 'đúng 30 ngày phải đóng băng');
    assert.equal(r.rows[1], 'DONG_BANG:true');
    assert.equal(J(r, 2).freeze.frozen, 0, 'chạy lại: không đóng băng thêm');
    assert.equal(r.rows[3], 'DONG_BANG:true');
    assert.equal(J(r, 4).freeze.frozen, 0, 'thiếu một giây so với 30 ngày: chưa đóng băng');
    assert.equal(r.rows[5], 'HOAT_DONG:false');
    assert.equal(r.rows[6], 't');
  });

  it('LC-JOB-02: QL quá hạn nhưng NL còn dùng thì KHÔNG đóng băng; nhắc QL một lần mỗi chu kỳ (AC-FAM-21, BR-FAM-052)', () => {
    const r = admin(`${idle('31 days', '10 days')} ${JOB()}; ${hhState()}; ${JOB()};
      select count(*) from private.lifecycle_notices where household_id = '${HH1}' and kind = 'NHAC_QL';
      select count(*) from private.lifecycle_notices where household_id = '${HH1}' and kind = 'DONG_BANG';
      ${idle('32 days', '10 days')} ${JOB()};
      select count(*) from private.lifecycle_notices where household_id = '${HH1}' and kind = 'NHAC_QL';`);
    assert.ok(r.ok, r.err);
    const a = J(r, 0);
    assert.equal(a.freeze.frozen, 0);
    assert.equal(a.freeze.ql_reminders, 1);
    assert.equal(r.rows[1], 'HOAT_DONG:false');
    assert.equal(J(r, 2).freeze.ql_reminders, 0, 'chạy lại cùng chu kỳ: không nhắc thêm');
    assert.equal(r.rows[3], '1');
    assert.equal(r.rows[4], '0');
    assert.equal(r.rows[6], '2', 'QL dùng rồi lại bỏ (mốc mới) là chu kỳ mới');
  });

  it('LC-JOB-03: cả hai người lớn quá hạn: đóng băng, giữ NGUYÊN dữ liệu (không xóa, không ẩn thêm), có thông báo và audit hệ thống (AC-FAM-22)', () => {
    const r = admin(`${snap}; ${idle('45 days', '31 days')} ${JOB()}; ${snap}; ${hhState()}; ${hhState(HH2)};
      select count(*) from private.lifecycle_notices where household_id = '${HH1}' and kind = 'DONG_BANG';
      select string_agg(event_code || '|' || actor_kind, ',') from app.audit_log where event_code like 'household.%' and household_id = '${HH1}';
      select count(*) from app.children where hidden_at is not null;`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], r.rows[2], 'dữ liệu đổi sau khi đóng băng');
    assert.equal(J(r, 1).freeze.frozen, 1);
    assert.equal(r.rows[3], 'DONG_BANG:true');
    assert.equal(r.rows[4], 'HOAT_DONG:false', 'hộ khác không bị ảnh hưởng');
    assert.equal(r.rows[5], '1');
    assert.equal(r.rows[6], 'household.frozen|system');
    assert.equal(r.rows[7], '0');
  });

  it('LC-JOB-04: chỉ xét người lớn đang tham gia; last_active_at null tính từ joined_at; hộ ẩn, CHO_XOA, đã đóng băng không bị chạm', () => {
    // NL đã rời (DA_ROI) vừa dùng gần đây không giữ hộ sống
    const left = admin(`${idle('31 days', '1 day')} update app.members set status = 'DA_ROI' where id = '${MEM_MINH}'; ${JOB()}; ${hhState()}`);
    assert.equal(J(left, 0).freeze.frozen, 1);
    assert.equal(left.rows[1], 'DONG_BANG:true');
    // chưa từng chạm: lấy joined_at; joined 5 ngày thì chưa đóng băng, 31 ngày thì có
    const fresh = `update app.members set last_active_at = null, joined_at = ${NOW} - interval '5 days' where household_id = '${HH1}';`;
    const old = `update app.members set last_active_at = null, joined_at = ${NOW} - interval '31 days' where household_id = '${HH1}';`;
    assert.equal(J(admin(`${fresh} ${JOB()}`)).freeze.frozen, 0);
    assert.equal(J(admin(`${old} ${JOB()}`)).freeze.frozen, 1);
    // CHO_XOA, ẩn, đã đóng băng: không đụng (frozen_at giữ nguyên)
    for (const s of [`update app.households set state = 'CHO_XOA' where id = '${HH1}';`,
      `update app.households set hidden_at = now(), hidden_reason = 'test' where id = '${HH1}';`]) {
      const x = admin(`${idle('90 days', '90 days')} ${s} ${JOB()}; select state || ':' || (frozen_at is null) from app.households where id = '${HH1}'`);
      assert.equal(J(x).freeze.frozen, 0, s);
      assert.match(x.rows[1], /^(CHO_XOA|HOAT_DONG):true$/);
    }
    const again = admin(`${idle('90 days', '90 days')} ${JOB()}; select frozen_at from app.households where id = '${HH1}';
      ${JOB(`${NOW} + interval '10 days'`)}; select frozen_at from app.households where id = '${HH1}'`);
    assert.equal(again.rows[1], again.rows[3], 'frozen_at đổi khi chạy lại');
  });

  it('LC-JOB-05: job và máy con không tính là "dùng app": last_active_at không đổi; máy con không gọi touch_active (AC-FAM-26, BR-FAM-050)', () => {
    const r = admin(`${idle('45 days', '31 days')} select md5(string_agg(last_active_at::text, ',' order by id)) from app.members;
      ${JOB()}; select md5(string_agg(last_active_at::text, ',' order by id)) from app.members;`);
    assert.equal(r.rows[0], r.rows[2]);
    FORBIDDEN(run(DEV_NA, `select app.touch_active()`), 'BR-FAM-050');
    // QL chạm khi đã đóng băng: ghi nhận hoạt động nhưng KHÔNG tự mở lại
    const t = run(QL, `select app.touch_active(); ${adm(hhState())}`, { setup: `${idle('45 days', '45 days')} update app.members set last_active_at = now() - interval '2 hours' where id = '${MEM_HOA}';
      update app.households set state = 'DONG_BANG', frozen_at = now() where id = '${HH1}';` });
    assert.equal(J(t).touched, true);
    assert.equal(t.rows[1], 'DONG_BANG:true');
  });

  it('LC-JOB-06: job chỉ cho hệ thống: người đăng nhập, anon không gọi được; có dòng job_runs; không chạm hộ đang dùng', () => {
    for (const who of [QL, NL, DEV_NA, ANON]) NO_EXEC(run(who, `select private.job_daily()`));
    const r = admin(`${idle('1 day', '1 day')} ${JOB()}; select job || ':' || status from app.job_runs`);
    assert.equal(J(r, 0).freeze.frozen, 0);
    assert.equal(r.rows[1], 'job-daily:OK');
  });
});

// ================================================================ LC-FROZEN: RLS-FROZEN
describe('LC-FROZEN: hộ đóng băng - mọi hàm ghi trả FROZEN trừ danh sách ngoại lệ (RLS-FROZEN; AC-FAM-22..24)', { skip }, () => {
  const pending = `update app.children set has_device = true where id = '${BIN}';
    insert into app.device_bindings(child_id, device_user_id, epoch, state, paired_by_member_id)
      values ('${BIN}', '${DEV_NEW_SUB}', 1, 'CHO_XAC_NHAN_MAY_CON', '${MEM_HOA}');
    insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${DEV_NEW_SUB}', private.pair_hmac('654321'), now() + interval '10 minutes');`;
  const SETUP = `${pending} select private.pin_store('${MEM_HOA}', '${PIN}'); ${FREEZE_JOB}`;
  const o = { setup: SETUP.replace('select private.pin_store', 'do $p$ begin perform private.pin_store').replace(`'${PIN}');`, `'${PIN}'); end $p$;`) };
  const tok = (child) => `select app.consent_withdraw_all('${child}')->>'confirm_token' as tok \\gset\n`;

  // Hàm authenticated có thể gọi (đúng danh sách policy-matrix.json) -> cách xử lý khi hộ đóng băng.
  const FROZEN_FNS = {
    child_create: (s) => FROZEN(run(QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`, s)),
    child_update: (s) => FROZEN(run(QL, `select app.child_update('${NA}', '{"grade": 4}')`, s)),
    child_delete: (s) => assert.equal(J(run(QL, `select app.child_delete('${NA}', true)`, s)).hidden, true),   // rút/xóa luôn được (D-64)
    mode_set: (s) => FROZEN(run(QL, `select app.mode_set('${NA}', 'PARENT_LED')`, s)),
    pin_set: (s) => FROZEN(run(QL, `select app.pin_set('735190')`, s)),
    pair_confirm: (s) => FROZEN(run(QL, `select app.pair_confirm('${BIN}', '654321')`, s)),
    pair_accept: (s) => FROZEN(run(DEV_NEW, `select app.pair_accept()`, s)),
    consent_record: (s) => {
      FROZEN(run(QL, `select app.consent_record('${BIN}', 'MD-SUCKHOE', 'DONG_Y')`, s));   // đồng ý MỚI: FROZEN
      assert.equal(J(run(QL, `select app.consent_record('${NA}', 'MD-SUCKHOE', 'RUT')`, s)).changed, true);   // RÚT luôn được (D-64)
    },
    consent_withdraw_all: (s) => {
      assert.equal(J(run(QL, `select app.consent_withdraw_all('${NA}')`, s)).step, 1);
      assert.equal(J(run(QL, `${tok(NA)} select app.consent_withdraw_all('${NA}', :'tok'::uuid)`, s)).step, 2);
    },
    profile_save: (s) => FROZEN(run(QL, `select app.profile_save('${NA}', '{"budget": null}')`, s)),
    schedule_inputs: (s) => FROZEN(run(QL, `select app.schedule_inputs('00000000-0000-4000-8000-000000000501')`, s)),
    schedule_commit_apply: (s) => FROZEN(run(QL, `select app.schedule_commit_apply('${NA}', '00000000-0000-4000-8000-000000000501', 1, gen_random_uuid(), repeat('a', 64), repeat('b', 64), 'e', 'p', 'UNKNOWN', '{}', '[]', '[]', '[]', 'x')`, s)),
    schedule_plan_check: (s) => FROZEN(run(QL, `select app.schedule_plan_check('00000000-0000-4000-8000-000000000501')`, s)),
    trial_start: (s) => FROZEN(run(QL, `select app.trial_start('${'c'.repeat(64)}')`, s)),
    deletion_request: (s) => {
      assert.equal(J(run(QL, `select app.deletion_request('HO_SO_CON', '${NA}', true)`, s)).replay, false);   // luôn được (D-64)
      VALIDATION(run(QL, `select app.deletion_request('GIA_DINH', null, true)`, s), 'BR-FAM-083');          // không còn FROZEN: còn người lớn khác
      assert.equal(J(run(NL, `select app.deletion_request('NGUOI_LON_ROI', null, true)`, s)).scope, 'NGUOI_LON_ROI');
    },
    health_note_add: (s) => FROZEN(run(QL, `select app.health_note_add('${NA}', 'KHAC', 'ghi chú thử')`, s)),
    health_note_update: (s) => FROZEN(run(QL, `select app.health_note_update((select id from app.child_health_notes limit 1), '{"content": "x"}')`, s)),
    child_alert_send: (s) => FROZEN(run(DEV_NA, `select app.child_alert_send('DON_SOM')`, s)),
    child_alert_seen: (s) => FROZEN(run(QL, `reset role; select id as aid from app.child_alerts limit 1 \\gset
      set local role authenticated; select app.child_alert_seen(:'aid'::uuid)`, { setup: `${s.setup} insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
        select '${HH1}', '${NA}', 'MD-CONBAO', 'DONG_Y', '${MEM_HOA}', id from app.policy_versions limit 1;
        insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '00000000-0000-4000-8000-000000000401', 'DON_SOM');` })),
    child_consent_record: (s) => FROZEN(run(DEV_NA, `select app.child_consent_record()`, s)),
    child_setting_set: (s) => {
      FROZEN(run(QL, `select app.child_setting_set('${NA}', 'ai_chat_enabled', true)`, s));
      assert.equal(run(QL, `select app.child_setting_set('${NA}', 'ai_chat_enabled', false)`, s).ok, true);   // tắt = thu hẹp
    },
    my_child_settings: (s) => FROZEN(run(DEV_NA, `select app.my_child_settings()`, s)),
  };
  // Ngoại lệ (được làm khi đóng băng) và lý do; mỗi hàm kiểm một lời gọi cụ thể.
  const EXCEPTIONS = {
    touch_active: ['ghi nhận hoạt động của người lớn, không tự mở lại', (s) => assert.equal(J(run(QL, `select app.touch_active()`, s)).touched, true)],
    household_reopen: ['lối ra: chỉ QL, có xác nhận', (s) => assert.equal(J(run(QL, `select app.household_reopen(true)`, s)).changed, true)],
    unlink_device: ['chỉ thu hẹp quyền (hủy liên kết) vẫn được', (s) => assert.equal(J(run(QL, `select app.unlink_device('${NA}', '${PIN}')`, s)).ok, true)],
    pair_decline: ['chỉ thu hẹp: máy con từ chối', (s) => assert.equal(J(run(DEV_NEW, `select app.pair_decline()`, s)).declined, true)],
    pair_pending: ['chỉ đọc', (s) => assert.equal(run(DEV_NEW, `select app.pair_pending()`, s).ok, true)],
    pair_code_create: ['máy con chưa gắn hộ (không có hộ để đóng băng)', (s) => assert.equal(run({ ...DEV_NEW, sub: '00000000-0000-4000-8000-0000000000a7' }, `select app.pair_code_create()`, s).ok, true)],
    weekly_report: ['chỉ đọc', (s) => assert.equal(run(QL, `select app.weekly_report('${NA}', '2025-W40')`, s).ok, true)],
    family_create: ['gửi lặp trả hộ cũ', (s) => assert.equal(J(run(QL, `select app.family_create('chị Hoa')`, s)).replay, true)],
    export_request: ['luôn BLOCKED_H4 (không ghi gì)', (s) => rejected(run(QL, `select app.export_request()`, s), 'BLOCKED_H4', 'PT403')],
    health_note_delete: ['xóa là thu hẹp, luôn được (D-66)', (s) => assert.equal(J(run(QL, `select app.health_note_delete((select id from app.child_health_notes limit 1))`, s)).deleted, true)],
    child_setting_get: ['chỉ đọc', (s) => assert.equal(J(run(QL, `select app.child_setting_get('${NA}')`, s)).ai_chat_enabled, false)],
    my_plan: ['chỉ đọc gói dịch vụ (D-68)', (s) => assert.equal(J(run(QL, `select app.my_plan()`, s)).tier, 'PREMIUM')],
    my_family_state: ['máy con biết hộ đóng băng (D-41)', (s) => assert.equal(J(run(DEV_NA, `select app.my_family_state()`, s)).frozen, true)],
    terms_status: ['chỉ đọc trạng thái đồng ý điều khoản (D-76)', (s) => assert.equal(J(run(QL, `select app.terms_status()`, s)).accepted, false)],
    terms_accept: ['đồng ý điều khoản là của người dùng, không phải dữ liệu của hộ (D-76)', (s) => assert.equal(J(run(QL, `select app.terms_accept('2026-11-28-nhap')`, s)).accepted, true)],
    member_invite: ['tính năng tắt', (s) => rejected(run(QL, `select app.member_invite('SUPPORTER')`, s), 'FEATURE_OFF', 'PT403')],
  };

  it('LC-FROZEN-01: mỗi hàm ghi (đường thật: job đóng băng) trả FROZEN; danh sách ngoại lệ chạy được; không hàm nào bị bỏ sót', () => {
    const declared = Object.entries(matrix.app_functions).filter(([k, v]) => v.includes('authenticated')).map(([k]) => k).sort();
    assert.deepEqual([...Object.keys(FROZEN_FNS), ...Object.keys(EXCEPTIONS)].sort(), declared,
      'hàm authenticated mới phải được xếp vào FROZEN_FNS hoặc EXCEPTIONS');
    for (const [name, check] of Object.entries(FROZEN_FNS)) {
      try { check(o); } catch (e) { e.message = `${name}: ${e.message}`; throw e; }
    }
    for (const [name, [, check]] of Object.entries(EXCEPTIONS)) {
      try { check(o); } catch (e) { e.message = `${name}: ${e.message}`; throw e; }
    }
  });

  it('LC-FROZEN-02: đọc khi đóng băng: QL thấy trạng thái và hồ sơ; NL và máy con không đọc hồ sơ con (BR-FAM-054, D-41); hộ khác không ảnh hưởng', () => {
    const cnt = (who) => J(run(who, `select count(*) from app.children`, o));
    // run().rows[0] là chuỗi số
    assert.equal(run(QL, `select count(*) from app.children`, o).rows[0], '2');
    assert.equal(run(NL, `select count(*) from app.children`, o).rows[0], '0');
    assert.equal(run(DEV_NA, `select count(*) from app.children`, o).rows[0], '0');
    assert.equal(run(NL, `select state from app.households`, o).rows[0], 'DONG_BANG');
    assert.equal(run(HK, `select count(*) from app.children`, o).rows[0], '1');
    const st = run(SVC, `select app.access_state('${DEV_NA.sub}', 'child.view', '${NA}')`, o);
    assert.equal(st.rows[0], 'FROZEN');
    assert.equal(run(SVC, `select app.access_state('${QL.sub}', 'child.view', '${NA}')`, o).rows[0], 'ALLOW');
    void cnt;
  });
});

// ================================================================ LC-REOPEN: mở lại (AC-FAM-23, 24)
describe('LC-REOPEN: mở lại - chỉ QL, có xác nhận (BR-FAM-057, 058; D-41)', { skip }, () => {
  const o = { setup: FREEZE_JOB };

  it('LC-REOPEN-01: QL đăng nhập rồi xác nhận: HOAT_DONG; máy bé Na nhận lại quyền xem; có audit và thông báo; job ngay sau đó không đóng băng lại (AC-FAM-24)', () => {
    const r = run(QL, `select app.household_reopen(true); ${adm(hhState())};
      ${adm(`select string_agg(event_code || '|' || actor_kind, ',' order by at) from app.audit_log where event_code like 'household.%'`)};
      ${adm(`select count(*) from private.lifecycle_notices where kind = 'MO_LAI'`)};
      ${adm(`select private.job_daily()`)}; ${adm(hhState())};
      ${as(DEV_NA)} select count(*) from app.children;`, o);
    assert.equal(J(r).changed, true);
    assert.equal(r.rows[1], 'HOAT_DONG:false');
    assert.equal(r.rows[2], 'household.frozen|system,household.reopened|adult');
    assert.equal(r.rows.at(-1), '1');
    assert.equal(J(r, 4).freeze.frozen, 0);
    assert.equal(r.rows[5], 'HOAT_DONG:false');
    assert.equal(r.rows[6], '1', 'máy con nhận lại lịch/hồ sơ');
  });

  it('LC-REOPEN-02: NL đăng nhập khi đóng băng chỉ thấy trạng thái, KHÔNG mở lại được; máy con, hộ khác, anon cũng không (AC-FAM-23, BR-FAM-057)', () => {
    assert.equal(run(NL, `select state from app.households`, o).rows[0], 'DONG_BANG');
    FORBIDDEN(run(NL, `select app.household_reopen(true)`, o), 'BR-FAM-057');
    FORBIDDEN(run(NL, `select app.household_reopen(false)`, o), 'BR-FAM-057');
    FORBIDDEN(run(DEV_NA, `select app.household_reopen(true)`, o), 'BR-FAM-057');
    const hk = run(HK, `select app.household_reopen(true); ${adm(hhState())}`, o);
    assert.equal(J(hk).changed, false, 'QL hộ khác chỉ chạm hộ của mình (đang hoạt động): không đổi gì');
    assert.equal(hk.rows[1], 'DONG_BANG:true', 'hộ 1 vẫn đóng băng');
    NO_EXEC(run(ANON, `select app.household_reopen(true)`));
    UNAUTH(run({ role: 'authenticated' }, `select app.household_reopen(true)`));
    // NL không tự nâng quyền: sau lời gọi bị từ chối trạng thái không đổi
    const after = run(NL, `select state from app.households`, o);
    assert.equal(after.rows[0], 'DONG_BANG');
  });

  it('LC-REOPEN-03: đăng nhập thôi không đủ: phải xác nhận rõ ràng (BR-FAM-057)', () => {
    VALIDATION(run(QL, `select app.household_reopen()`, o), 'BR-FAM-057');
    VALIDATION(run(QL, `select app.household_reopen(false)`, o), 'BR-FAM-057');
    const t = run(QL, `select app.touch_active(); ${adm(hhState())}`, o);
    assert.equal(t.rows[1], 'DONG_BANG:true');
  });

  it('LC-REOPEN-04: hộ đang hoạt động: changed=false (gửi lặp); gửi lặp sau khi mở lại cũng vậy; CHO_XOA không mở lại được', () => {
    const r = run(QL, `select app.household_reopen(true); select app.household_reopen(true)`, o);
    assert.equal(J(r, 0).changed, true);
    assert.equal(J(r, 1).changed, false);
    const active = run(QL, `select app.household_reopen(true)`);
    assert.equal(J(active).changed, false);
    VALIDATION(run(QL, `select app.household_reopen(true)`, { setup: `update app.households set state = 'CHO_XOA' where id = '${HH1}';` }), 'BR-CON-086');
  });

  it('LC-REOPEN-05: sau khi mở lại, QL cũ quá hạn không bị đóng băng lại ngay: last_active_at của QL đặt = bây giờ', () => {
    const r = run(QL, `select app.household_reopen(true); ${adm(`select (last_active_at > now() - interval '1 minute') from app.members where id = '${MEM_HOA}'`)}`, o);
    assert.equal(r.rows[1], 't');
  });
});

// ================================================================ LC-DEL: deletion_request (AC-CON-17, 18)
describe('LC-DEL: yêu cầu xóa idempotent, ẩn ngay, không xóa hẳn (Tech Spec #30; BR-FAM-080..089, BR-CON-050..053)', { skip }, () => {
  const del = (scope, child = null, confirm = true) => `select app.deletion_request('${scope}', ${child ? `'${child}'` : 'null'}, ${confirm})`;

  it('LC-DEL-01: xóa hồ sơ con cần xác nhận lần hai; sau đó ẩn ngay, máy con mất liên kết, yêu cầu CHO_QUYET_HAN không hạn, chưa xóa hẳn (AC-CON-18)', () => {
    VALIDATION(run(QL, del('HO_SO_CON', NA, false)), 'BR-FAM-080');
    const before = run({ role: 'admin' }, `select count(*) from app.consent_events where child_id = '${NA}'`).rows[0];
    const r = run(QL, `${del('HO_SO_CON', NA)}; select count(*) from app.children;
      ${adm(`select state || ':' || coalesce(hidden_reason, '') || ':' || (hidden_at is not null) from app.children where id = '${NA}'`)};
      ${adm(`select string_agg(state || ':' || revoke_reason, ',') from app.device_bindings where child_id = '${NA}'`)};
      ${adm(`select state || ':' || (due_at is null) || ':' || reason || ':' || scope from app.deletion_requests`)};
      ${adm(`select count(*) from app.consent_events where child_id = '${NA}'`)};`);
    const a = J(r);
    assert.equal(a.replay, false);
    assert.equal(a.hard_deleted, false);
    assert.equal(a.state, 'CHO_QUYET_HAN');
    assert.equal(r.rows[1], '1', 'QL không còn thấy hồ sơ đã xóa');
    assert.equal(r.rows[2], 'CHO_XOA:XOA:true');
    assert.equal(r.rows[3], 'DA_HUY:XOA_HO_SO');
    assert.equal(r.rows[4], 'CHO_QUYET_HAN:true:XOA_HO_SO:HO_SO_CON');
    assert.equal(r.rows[5], before, 'dữ liệu (sổ đồng ý) còn nguyên: chưa xóa hẳn, không hứa "đã xóa hết"');
  });

  it('LC-DEL-02: gửi lặp: một yêu cầu, accepted_at là lần ĐẦU (AC-CON-17); đã ẩn bằng child_delete rồi mới yêu cầu xóa cũng được', () => {
    const r = run(QL, `${del('HO_SO_CON', NA)}; ${adm(`select pg_sleep(0.05)`)} ${del('HO_SO_CON', NA)};
      ${adm(`select count(*) from app.deletion_requests`)}`);
    const a = J(r, 0), b = J(r, 1);
    assert.equal(b.replay, true);
    assert.equal(a.deletion_request_id, b.deletion_request_id);
    assert.equal(a.accepted_at, b.accepted_at);
    assert.equal(r.rows.at(-1), '1');
    const after = run(QL, `select app.child_delete('${NA}', true); ${del('HO_SO_CON', NA)}`);
    assert.equal(J(after, 1).replay, false);
    assert.equal(J(after, 1).state, 'CHO_QUYET_HAN');
  });

  it('LC-DEL-03: ai gọi được: NL FORBIDDEN, máy con FORBIDDEN, hộ khác NOT_FOUND, chưa đăng nhập, anon; tham số sai VALIDATION', () => {
    FORBIDDEN(run(NL, del('HO_SO_CON', NA)), 'BR-CON-053');
    FORBIDDEN(run(NL, del('GIA_DINH')), 'BR-CON-053');
    FORBIDDEN(run(DEV_NA, del('HO_SO_CON', NA)), 'BR-FAM-086');
    NOT_FOUND(run(HK, del('HO_SO_CON', NA)));
    UNAUTH(run({ role: 'authenticated' }, del('HO_SO_CON', NA)));
    NO_EXEC(run(ANON, del('HO_SO_CON', NA)));
    VALIDATION(run(QL, del('LA_LA', NA)), 'BR-FAM-085');
    VALIDATION(run(QL, del('HO_SO_CON', null)), 'BR-FAM-080');
    NOT_FOUND(run(QL, del('HO_SO_CON', SU)));
  });

  it('LC-DEL-04: xóa gia đình (QL, hộ chỉ còn một người lớn): ẩn hộ và mọi hồ sơ, hủy liên kết; QL vẫn đọc được yêu cầu của mình; gửi lặp vẫn replay', () => {
    const r = run(HK, `${del('GIA_DINH')}; select count(*) from app.households; select count(*) from app.children;
      select count(*) from app.deletion_requests; ${del('GIA_DINH')};
      ${adm(`select state || ':' || hidden_reason from app.households where id = '${HH2}'`)};
      ${adm(`select count(*) from app.device_bindings where child_id = '${SU}' and state = 'DA_HUY'`)}`);
    const a = J(r, 0);
    assert.equal(a.replay, false);
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[2], '0');
    assert.equal(r.rows.at(-1), '1');
    assert.equal(J(r, 4).replay, true);
    assert.equal(J(r, 4).accepted_at, a.accepted_at);
    assert.equal(r.rows[5], 'CHO_XOA:XOA_GIA_DINH');
    assert.equal(r.rows[6], '1');
  });

  it('LC-DEL-05: xóa gia đình khi còn người lớn khác bị chặn (BR-FAM-083, cần luồng chuyển QL: nhánh an toàn)', () => {
    VALIDATION(run(QL, del('GIA_DINH')), 'BR-FAM-083');
  });

  it('LC-DEL-06: NL tự rời: thu hồi quyền xem, mất thấy con; QL không rời bằng lối này (BR-FAM-016); gửi lặp replay', () => {
    const r = run(NL, `select count(*) from app.children; ${del('NGUOI_LON_ROI')}; select count(*) from app.children; ${del('NGUOI_LON_ROI')};
      ${adm(`select status || ':' || (left_at is not null) from app.members where id = '${MEM_MINH}'`)};
      ${adm(`select state from app.grants where member_id = '${MEM_MINH}'`)}`);
    assert.equal(r.rows[0], '1');
    assert.equal(J(r, 1).replay, false);
    assert.equal(r.rows[2], '0');
    assert.equal(J(r, 3).replay, true);
    assert.equal(r.rows[4], 'DA_ROI:true');
    assert.equal(r.rows[5], 'THU_HOI');
    VALIDATION(run(QL, del('NGUOI_LON_ROI')), 'BR-FAM-016');
  });

  it('LC-DEL-07: job không bao giờ xóa hẳn dữ liệu có yêu cầu xóa chưa có hạn (AC-CON-18): hộ giả lập không vị trí thử còn nguyên sau mọi job', () => {
    const r = run(QL, `${del('HO_SO_CON', NA)};
      ${adm(`select private.job_daily('2030-01-01 00:00+00'); select private.job_trial_purge('2030-01-01 00:00+00')`)}
      ${adm(`select (select count(*) from app.children where id = '${NA}') || ':' || (select count(*) from app.deletion_requests) || ':' || (select count(*) from app.deletion_evidence)`)}`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[r.rows.length - 1], '1:1:0');
  });
});

// ================================================================ LC-WITHDRAW: rút luôn được kể cả đóng băng (D-64)
describe('LC-WITHDRAW: rút (đồng ý, toàn bộ, xóa, yêu cầu xóa) luôn được khi đóng băng; việc MỞ RỘNG vẫn FROZEN (D-64; BR-FAM-054)', { skip }, () => {
  const o = { setup: FREEZE_JOB };
  const tok = `select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset\n`;

  it('LC-WITHDRAW-01: không còn tham số frozen_allows_withdrawal (không còn công tắc)', () => {
    assert.equal(admin(`select count(*) from private.params where key = 'frozen_allows_withdrawal'`).rows[0], '0');
    assert.equal(admin(`select count(*) from pg_proc where proname = 'frozen_allows_withdrawal'`).rows[0], '0');
  });

  it('LC-WITHDRAW-02: đóng băng: RUT một mục, rút toàn bộ hai bước, xóa hồ sơ, yêu cầu xóa đều chạy; replay luôn trả được', () => {
    assert.equal(J(run(QL, `select app.consent_record('${NA}', 'MD-SUCKHOE', 'RUT')`, o)).changed, true);
    assert.equal(J(run(QL, `select app.consent_withdraw_all('${NA}')`, o)).step, 1);
    const two = run(QL, `${tok} select app.consent_withdraw_all('${NA}', :'tok'::uuid)`, o);
    assert.equal(J(two).step, 2);
    assert.equal(J(run(QL, `select app.child_delete('${NA}', true)`, o)).hidden, true);
    assert.equal(J(run(QL, `select app.deletion_request('HO_SO_CON', '${BIN}', true)`, o)).state, 'CHO_QUYET_HAN');
    assert.equal(J(run(NL, `select app.deletion_request('NGUOI_LON_ROI', null, true)`, o)).scope, 'NGUOI_LON_ROI');
  });

  it('LC-WITHDRAW-03: vẫn FROZEN khi đóng băng: đồng ý mới, sửa hồ sơ, đổi mode, tạo con, ghép máy, đặt PIN, bật cài đặt AI', () => {
    FROZEN(run(QL, `select app.consent_record('${BIN}', 'MD-SUCKHOE', 'DONG_Y')`, o));
    FROZEN(run(QL, `select app.child_update('${NA}', '{"grade": 4}')`, o));
    FROZEN(run(QL, `select app.mode_set('${NA}', 'PARENT_LED')`, o));
    FROZEN(run(QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`, o));
    FROZEN(run(QL, `select app.pin_set('735190')`, o));
    FROZEN(run(QL, `select app.child_setting_set('${NA}', 'ai_chat_enabled', true)`, o));
  });

  it('LC-WITHDRAW-04: hộ đã CHO_XOA (hết hạn thử, xóa gia đình): mọi việc FROZEN, kể cả rút (đã ngừng xử lý)', () => {
    const c = { setup: `update app.households set state = 'CHO_XOA' where id = '${HH1}';` };
    FROZEN(run(QL, `select app.consent_record('${NA}', 'MD-SUCKHOE', 'RUT')`, c));
    FROZEN(run(QL, `select app.consent_withdraw_all('${NA}')`, c));
    FROZEN(run(QL, `select app.deletion_request('HO_SO_CON', '${NA}', true)`, c));
  });
});

// ================================================================ LC-CRON: đăng ký cron an toàn khi không có pg_cron
describe('LC-CRON: đăng ký cron bỏ qua an toàn khi không có pg_cron (cục bộ)', { skip }, () => {
  it('LC-CRON-01: register_cron_jobs trả SKIPPED_NO_PG_CRON, gọi lặp không lỗi; chỉ service_role gọi được; hàm nhắc đủ ba lịch', () => {
    const ext = admin(`select count(*) from pg_extension where extname = 'pg_cron'`);
    assert.equal(ext.rows[0], '0', 'môi trường test không có pg_cron');
    const r = admin(`select private.register_cron_jobs(); select private.register_cron_jobs()`);
    assert.deepEqual(r.rows, ['SKIPPED_NO_PG_CRON', 'SKIPPED_NO_PG_CRON']);
    NO_EXEC(run(QL, `select private.register_cron_jobs()`));
    const def = admin(`select pg_get_functiondef('private.register_cron_jobs()'::regprocedure)`);
    const text = def.rows.join('\n');
    for (const s of ["pp_job_daily', '5 17 * * *'", "pp_job_trial_purge', '0 20 * * *'", "pp_job_trial_purge_withdrawn', '*/10 * * * *'"]) {
      assert.ok(text.includes(s), `thiếu lịch: ${s}`);
    }
  });
});
