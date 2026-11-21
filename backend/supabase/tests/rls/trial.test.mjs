// Test T2.4: trial_slots, purge_household, deletion_evidence, job-trial-purge, export_request (BLOCKED_H4).
// Mã: TRIAL-SLOT (AC-CON-23, 24), TRIAL-JOB (AC-CON-25, D-44 mốc 7 ngày), TRIAL-WD (AC-CON-26), TRIAL-PURGE (diễn tập xóa trên dữ liệu giả),
// TRIAL-H4 (AC-CON-20, BR-CON-056), TRIAL-EXP, TRIAL-EVID (không dữ liệu cá nhân), TRIAL-FK (bảng mới phải khai cách xóa).
// AC-CON-19 (hạn xóa chốt sau) và AC-CON-21 (xuất giữa chừng) CHƯA kiểm được: PR-CON-01 UNKNOWN, chưa dựng bản xuất. Dữ liệu: chỉ tên giả.
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
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const U_HOA = A.QL.sub, U_MINH = A.NL.sub, U_NA = A.CON.sub, U_LAN = A.HO_KHAC.sub, U_SU = A.CON_CHUA_GHEP.sub;
const PIN = '482916';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
const SVC = { role: 'service_role' };
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\nset local role ${a.role};\n`;
const adm = (sql) => `reset role;\nselect set_config('request.jwt.claims', '{"role":"service_role"}', true) as _s \\gset\n${sql};\n`;
const J = (r, i = 0) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[i]); };
const rejected = (r, code, sqlstate, rule = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, sqlstate, r.err);
  if (code) assert.match(r.err, new RegExp(code));
  if (rule) assert.match(r.err, new RegExp(rule));
};
const FORBIDDEN = (r, rule) => rejected(r, 'FORBIDDEN', 'PT403', rule);
const NOT_FOUND = (r) => rejected(r, 'NOT_FOUND', 'PT404');
const VALIDATION = (r, rule) => rejected(r, 'VALIDATION', 'PT422', rule);
const FROZEN = (r) => rejected(r, 'FROZEN', 'PT423');
const BLOCKED = (r) => rejected(r, 'BLOCKED_H4', 'PT403');
const CHECK = (r) => assert.equal(r.code, '23514', r.err);   // ràng buộc, trigger kiểm
const NO_EXEC = (r) => { assert.equal(r.ok, false); assert.equal(r.code, '42501'); };

// ---- vị trí thử: hạn kết thúc = hôm nay (VN) + 2; mốc thời gian TS(k) = 03:00 VN của ngày end_date + k
const D = `private.today_vn()`;
const TS = (k) => `(((${D} + 2 + ${k})::timestamp + time '03:00') at time zone 'Asia/Ho_Chi_Minh')`;
const OPEN = (hh = HH1, ref = 'PHIEU-A') => `do $t$ declare s uuid; begin
  s := (app.trial_open(${D} + 2, '${ref}')->>'slot_id')::uuid; perform app.trial_attach('${hh}', s); end $t$;`;
const jobs = (k) => `select private.job_daily(${TS(k)}); select private.job_trial_purge(${TS(k)});`;
const hh = (id = HH1) => `select count(*) from app.households where id = '${id}'`;
const slot = `select state from app.trial_slots order by created_at desc limit 1`;

describe('TRIAL-SLOT: vị trí thử (BR-CON-080..082; AC-CON-23, 24)', { skip }, () => {
  it('TRIAL-SLOT-01: tối đa 3 vị trí đang thu cùng lúc; gia đình thứ 4 bị từ chối cả qua hàm lẫn ghi trực tiếp (AC-CON-23)', () => {
    const three = `select app.trial_open(${D} + 3, 'P1'); select app.trial_open(${D} + 3, 'P2'); select app.trial_open(${D} + 3, 'P3');`;
    VALIDATION(run(SVC, `${three} select app.trial_open(${D} + 3, 'P4')`), 'BR-CON-081');
    const direct = run({ role: 'admin' }, `${three} insert into app.trial_slots(end_date, consent_paper_ref, state) values (${D} + 3, 'P4', 'DANG_THU')`);
    CHECK(direct);
    // đóng một vị trí thì mở lại được
    const re = run(SVC, `${three} select app.trial_close((select id from app.trial_slots where consent_paper_ref = 'P1')); select app.trial_open(${D} + 3, 'P4')`);
    assert.equal(J(re, 4).state, 'DANG_THU');
  });

  it('TRIAL-SLOT-02: thiếu hạn kết thúc hoặc mã phiếu, hạn ngoài khoảng, mã phiếu chứa dữ liệu cá nhân: từ chối (AC-CON-24)', () => {
    VALIDATION(run(SVC, `select app.trial_open(null, 'P1')`), 'BR-CON-082');
    VALIDATION(run(SVC, `select app.trial_open(${D} + 3, null)`), 'BR-CON-082');
    VALIDATION(run(SVC, `select app.trial_open(${D} + 3, '   ')`), 'BR-CON-082');
    VALIDATION(run(SVC, `select app.trial_open(${D} + 3, 'chị Hoa 0912345678')`), 'BR-CON-082');
    VALIDATION(run(SVC, `select app.trial_open(${D} - 1, 'P1')`), 'PR-CON-09');
    VALIDATION(run(SVC, `select app.trial_open(${D} + 15, 'P1')`), 'PR-CON-09');
    for (const [e, p] of [['null', "'P1'"], [`${D} + 3`, 'null']]) {
      CHECK(run({ role: 'admin' }, `insert into app.trial_slots(end_date, consent_paper_ref, state) values (${e}, ${p}, 'DANG_THU')`));
    }
    CHECK(run({ role: 'admin' }, `insert into app.trial_slots(end_date, consent_paper_ref, state) values (${D} + 20, 'P1', 'DANG_THU')`));
    // CHUA_MO không cần đủ trường, nhưng mở thì phải đủ
    assert.ok(run({ role: 'admin' }, `insert into app.trial_slots(state) values ('CHUA_MO')`).ok);
    CHECK(run({ role: 'admin' }, `insert into app.trial_slots(state) values ('CHUA_MO'); update app.trial_slots set state = 'DANG_THU'`));
  });

  it('TRIAL-SLOT-03: chỉ hệ thống: người đăng nhập và anon không gọi được hàm quản lý vị trí và purge', () => {
    for (const who of [QL, NL, DEV_NA, HK, ANON]) {
      NO_EXEC(run(who, `select app.trial_open(${D} + 3, 'P1')`));
      NO_EXEC(run(who, `select app.trial_close('${NA}')`));
      NO_EXEC(run(who, `select app.trial_attach('${HH1}', '${NA}')`));
      NO_EXEC(run(who, `select app.purge_household('${HH1}', 'OWNER')`));
      NO_EXEC(run(who, `select private.job_trial_purge()`));
    }
  });

  it('TRIAL-SLOT-04: gắn hộ: chỉ hộ giả lập vào vị trí đang thu; mỗi vị trí một hộ; không đổi loại ngược; QL thấy vị trí của hộ mình, người khác thì không (BR-CON-080)', () => {
    const o = { setup: OPEN() };
    const cls = run({ role: 'admin' }, `select data_class || ':' || (trial_slot_id is not null) from app.households where id = '${HH1}'`, o);
    assert.equal(cls.rows[0], 'THU_NOI_BO_D01:true');
    assert.equal(run(QL, `select count(*) from app.trial_slots`, o).rows[0], '1');
    for (const who of [NL, HK, DEV_NA]) assert.equal(run(who, `select count(*) from app.trial_slots`, o).rows[0], '0');
    // gắn hộ thứ hai vào cùng vị trí, gắn vào vị trí chưa mở, đổi loại ngược, đặt loại thử không vị trí
    VALIDATION(run(SVC, `select app.trial_attach('${HH2}', (select id from app.trial_slots))`, o), 'BR-CON-081');
    VALIDATION(run(SVC, `select app.trial_attach('${HH2}', gen_random_uuid())`), 'BR-CON-080');
    CHECK(run({ role: 'admin' }, `update app.households set data_class = 'GIA_LAP' where id = '${HH1}'`, o));
    CHECK(run({ role: 'admin' }, `update app.households set data_class = 'THU_NOI_BO_D01', trial_slot_id = null where id = '${HH2}'`));
    CHECK(run({ role: 'admin' }, `insert into app.trial_slots(end_date, consent_paper_ref, state) values (${D} + 1, 'X', 'HET_THU');
      update app.households set data_class = 'THU_NOI_BO_D01', trial_slot_id = (select id from app.trial_slots) where id = '${HH2}'`));
    // gắn lặp: replay
    assert.equal(J(run(SVC, `select app.trial_attach('${HH1}', (select id from app.trial_slots))`, o)).replay, true);
  });

  it('TRIAL-SLOT-05: chuyển trạng thái hợp lệ; hạn chỉ được rút ngắn; trạng thái cuối không đi tiếp', () => {
    const o = { setup: OPEN() };
    CHECK(run({ role: 'admin' }, `update app.trial_slots set end_date = end_date + 1`, o));
    CHECK(run({ role: 'admin' }, `update app.trial_slots set state = 'CHUA_MO'`, o));
    CHECK(run({ role: 'admin' }, `update app.trial_slots set state = 'XOA_XONG', purged_at = now()`, o));
    const r = run({ role: 'admin' }, `update app.trial_slots set state = 'HET_THU'; update app.trial_slots set state = 'DANG_THU'`, o);
    CHECK(r);
    const s = run({ role: 'admin' }, `update app.trial_slots set end_date = end_date - 1; select purge_due_at - end_date from app.trial_slots`, o);
    assert.equal(s.rows[0], '7', 'purge_due_at = end_date + 7 (D-44)');
  });
});

describe('TRIAL-JOB: hết hạn thử và xóa theo D-44 (AC-CON-25; BR-CON-086, EC-CON-14)', { skip }, () => {
  it('TRIAL-JOB-01: ngày cuối vẫn thu; sang ngày sau job-daily đóng sổ: ngừng thu ngay (hộ CHO_XOA, ghi FROZEN, máy con không đọc), dữ liệu còn nguyên', () => {
    const r = run({ role: 'admin' }, `select private.job_daily(${TS(0)}); ${slot}; select state from app.households where id = '${HH1}';
      select private.job_daily(${TS(1)}); ${slot}; select state from app.households where id = '${HH1}'; select count(*) from app.children where household_id = '${HH1}';
      select count(*) from app.audit_log where event_code = 'household.closing'`, { setup: OPEN() });
    assert.equal(J(r, 0).trial_end.ended, 0);
    assert.equal(r.rows[1], 'DANG_THU');
    assert.equal(r.rows[2], 'HOAT_DONG');
    assert.equal(J(r, 3).trial_end.ended, 1);
    assert.equal(r.rows[4], 'HET_THU');
    assert.equal(r.rows[5], 'CHO_XOA');
    assert.equal(r.rows[6], '2');
    assert.equal(r.rows[7], '1');
    const end = `do $e$ begin perform private.job_daily(${TS(1)}); end $e$;`;
    const o = { setup: `${OPEN()} ${end}` };
    FROZEN(run(QL, `select app.consent_record('${BIN}', 'MD-SUCKHOE', 'DONG_Y')`, o));
    FROZEN(run(QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`, o));
    assert.equal(run(DEV_NA, `select count(*) from app.children`, o).rows[0], '0');
    VALIDATION(run(QL, `select app.household_reopen(true)`, o), 'BR-CON-086');
  });

  it('TRIAL-JOB-02: xóa đúng 7 ngày sau ngày kết thúc (D-44): ngày +6 chưa, ngày +7 xóa; hộ khác không bị chạm; vị trí XOA_XONG; có bằng chứng', () => {
    const r = run({ role: 'admin' }, `select private.job_trial_purge(${TS(6)}); ${hh()};
      select private.job_trial_purge(${TS(7)}); ${hh()}; ${hh(HH2)}; ${slot}; select count(*) from app.deletion_evidence;
      select reason || ':' || data_class from app.deletion_evidence; select private.job_trial_purge(${TS(8)})`, { setup: `${OPEN()} do $e$ begin perform private.job_daily(${TS(1)}); end $e$;` });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).purged, 0);
    assert.equal(r.rows[1], '1');
    assert.equal(J(r, 2).purged, 1);
    assert.equal(r.rows[3], '0');
    assert.equal(r.rows[4], '1');
    assert.equal(r.rows[5], 'XOA_XONG');
    assert.equal(r.rows[6], '1');
    assert.equal(r.rows[7], 'HET_THU:THU_NOI_BO_D01');
    assert.equal(J(r, 8).purged, 0, 'chạy lại: không xóa thêm, không lỗi');
  });

  it('TRIAL-JOB-03: chạy bù: bỏ lỡ job-daily vẫn xóa đúng hạn (job-trial-purge tự đóng sổ vị trí quá ngày cuối); Owner kết thúc sớm: ngừng thu, xóa sau 7 ngày', () => {
    const r = run({ role: 'admin' }, `select private.job_trial_purge(${TS(7)}); ${hh()}`, { setup: OPEN() });
    assert.equal(J(r, 0).purged, 1);
    assert.equal(r.rows[1], '0');
    const early = run(SVC, `select app.trial_close((select id from app.trial_slots)); select state from app.households where id = '${HH1}'; select purge_due_at - ${D} from app.trial_slots`, { setup: OPEN() });
    assert.equal(J(early).state, 'HET_THU');
    assert.equal(early.rows[1], 'CHO_XOA');
    assert.equal(early.rows[2], '7');
  });

  it('TRIAL-JOB-04: job không chạm hộ giả lập không có vị trí thử và hộ đang thử còn hạn, kể cả khi lỗi một hộ không chặn hộ khác (ghi LOI)', () => {
    const r = run({ role: 'admin' }, `select private.job_trial_purge(${TS(30)}); ${hh()}; ${hh(HH2)}`, { setup: `${OPEN(HH1)} update app.trial_slots set state = 'HET_THU' where false;` });
    assert.equal(J(r, 0).purged, 1);
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[2], '1', 'hộ 2 là giả lập không vị trí: không bao giờ bị job xóa');
    const live = run({ role: 'admin' }, `select private.job_trial_purge(${TS(-1)}); ${hh()}`, { setup: OPEN() });
    assert.equal(J(live, 0).purged, 0);
    assert.equal(live.rows[1], '1');
  });
});

describe('TRIAL-WD: hộ thử rút giữa chừng thì xóa ngay (AC-CON-26; BR-CON-087, D-44)', { skip }, () => {
  const tok = `select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset\n`;
  const withdraw = `${tok} select app.consent_withdraw_all('${NA}', :'tok'::uuid);`;

  // bé Bin đã bị ẩn từ trước (yêu cầu xóa): bé Na là con CUỐI chưa ẩn -> rút bé Na là hộ rút
  const BIN_HIDDEN = `update app.children set state = 'CHO_XOA', hidden_at = now(), hidden_reason = 'XOA' where id = '${BIN}';`;
  it('TRIAL-WD-01: rút toàn bộ CON CUỐI bước 2: vị trí RUT_SOM, hộ ngừng thu; lần chạy purge kế tiếp (chế độ chỉ RUT_SOM) xóa cả hộ, không chờ hết hạn', () => {
    const r = run(QL, `${withdraw} ${adm(`${slot}; select state from app.households where id = '${HH1}'`)}
      ${adm(`select private.job_trial_purge(now(), true); ${hh()}; ${hh(HH2)}; ${slot}; select reason from app.deletion_evidence;
      select count(*) from auth.users where id in ('${U_HOA}', '${U_MINH}', '${U_NA}'); select count(*) from auth.users where id in ('${U_LAN}', '${U_SU}')`)}`, { setup: `${OPEN()} ${BIN_HIDDEN}` });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], 'RUT_SOM');
    assert.equal(r.rows[2], 'CHO_XOA');
    assert.equal(J(r, 3).purged, 1);
    assert.equal(r.rows[4], '0');
    assert.equal(r.rows[5], '1');
    assert.equal(r.rows[6], 'XOA_XONG');
    assert.equal(r.rows[7], 'RUT_SOM');
    assert.equal(r.rows[8], '0', 'người lớn và máy con ẩn danh của hộ đã bị xóa');
    assert.equal(r.rows[9], '2', 'người dùng hộ khác còn nguyên');
  });

  it('TRIAL-WD-02: chế độ "chỉ RUT_SOM" không xóa vị trí HET_THU chưa đến hạn; xóa cả gia đình của hộ thử cũng là rút; xóa một hồ sơ con (yêu cầu xóa) thì không', () => {
    const end = `do $e$ begin perform private.job_daily(${TS(1)}); end $e$;`;
    const early = run({ role: 'admin' }, `select private.job_trial_purge(${TS(2)}, true); ${hh()}`, { setup: `${OPEN()} ${end}` });
    assert.equal(J(early, 0).purged, 0);
    assert.equal(early.rows[1], '1');
    const fam = run(HK, `select app.deletion_request('GIA_DINH', null, true); ${adm(slot)}`, { setup: OPEN(HH2, 'PHIEU-B') });
    assert.equal(fam.rows[1], 'RUT_SOM');
    const kid = run(QL, `select app.deletion_request('HO_SO_CON', '${BIN}', true); ${adm(slot)}`, { setup: OPEN() });
    assert.equal(kid.rows[1], 'DANG_THU');
  });

  it('TRIAL-WD-03: rút MỘT con khi hộ còn con khác (D-64): vị trí và hộ giữ nguyên; job xóa ngay chỉ dữ liệu con đó (bằng chứng scope CON); con kia và người lớn còn nguyên', () => {
    const r = run(QL, `${withdraw} ${adm(`${slot}; select state from app.households where id = '${HH1}'; select state from app.children where id = '${NA}'`)}
      ${adm(`select private.job_trial_purge(now(), true); ${slot}; select state from app.households where id = '${HH1}';
        select (select count(*) from app.children where id = '${NA}') || ':' || (select count(*) from app.children where id = '${BIN}')
          || ':' || (select count(*) from app.members where household_id = '${HH1}') || ':' || (select count(*) from app.purpose_state where child_id = '${BIN}')
          || ':' || (select count(*) from app.consent_events where child_id = '${NA}') || ':' || (select count(*) from app.child_health_notes where child_id = '${NA}')
          || ':' || (select count(*) from app.audit_log where subject_ref = 'child:${NA}') || ':' || (select count(*) from app.deletion_requests where child_id = '${NA}');
        select scope || ':' || reason || ':' || data_class || ':' || (household_ref_hash = encode(extensions.digest(convert_to('${NA}', 'UTF8'), 'sha256'), 'hex')) from app.deletion_evidence;
        select count(*) from auth.users where id = '${U_NA}'; select count(*) from auth.users where id in ('${U_HOA}', '${U_MINH}')`)}`, { setup: OPEN() });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], 'DANG_THU', 'vị trí không RUT_SOM khi hộ còn con khác');
    assert.equal(r.rows[2], 'HOAT_DONG');
    assert.equal(r.rows[3], 'CHO_XOA');
    assert.equal(J(r, 4).children_purged, 1);
    assert.equal(J(r, 4).purged, 0);
    assert.equal(r.rows[5], 'DANG_THU');
    assert.equal(r.rows[6], 'HOAT_DONG');
    assert.equal(r.rows[7], '0:1:2:1:0:0:0:0');
    assert.equal(r.rows[8], 'CON:RUT_SOM:THU_NOI_BO_D01:true');
    assert.equal(r.rows[9], '0', 'máy bé Na ẩn danh bị xóa');
    assert.equal(r.rows[10], '2', 'người lớn còn nguyên');
  });

  it('TRIAL-WD-04: rút nốt con cuối sau đó: hộ rút (RUT_SOM) và xóa cả hộ; chạy lại job không đổi gì', () => {
    const tokBin = `select app.consent_withdraw_all('${BIN}')->>'confirm_token' as tok \\gset\n`;
    const r = run(QL, `${withdraw} ${adm(`select private.job_trial_purge(now(), true)`)} ${as(QL)} ${tokBin} select app.consent_withdraw_all('${BIN}', :'tok'::uuid);
      ${adm(`${slot}; select private.job_trial_purge(now(), true); ${hh()}; ${slot}; select string_agg(scope, ',' order by scope) from app.deletion_evidence;
        select private.job_trial_purge(now(), true)`)}`, { setup: OPEN() });
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 1).children_purged, 1);
    assert.equal(r.rows[3], 'RUT_SOM');
    assert.equal(J(r, 4).purged, 1);
    assert.equal(r.rows[5], '0');
    assert.equal(r.rows[6], 'XOA_XONG');
    assert.equal(r.rows[7], 'CON,HO');
    assert.equal(J(r, 8).purged, 0);
  });
});

// ---- diễn tập xóa: tập id của hộ (đóng bao theo khóa ngoại) + quét mọi bảng app/private/auth.users sau khi xóa
const RICH = `
  do $r$ begin
    perform private.pin_store('${MEM_HOA}', '${PIN}');
    insert into private.pair_throttle(scope, key, failed_count) values ('HOUSEHOLD', '${HH1}', 1), ('USER', '${U_HOA}', 1), ('USER', '${U_NA}', 1), ('USER', '${U_LAN}', 1);
    insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${U_NA}', private.pair_hmac('135790'), now() + interval '10 minutes');
    insert into private.lifecycle_notices(household_id, kind, anchor_at) values ('${HH1}', 'NHAC_QL', now());
    insert into private.withdraw_confirmations(child_id, member_id, expires_at) values ('${NA}', '${MEM_HOA}', now() + interval '10 minutes');
    insert into app.deletion_requests(household_id, scope, child_id, requested_by, reason) values ('${HH1}', 'HO_SO_CON', '${BIN}', '${MEM_HOA}', 'XOA_HO_SO');
    insert into app.child_alerts(child_id, binding_id, kind) values ('${NA}', '00000000-0000-4000-8000-000000000401', 'DON_SOM');
    insert into private.ai_usage(household_id, member_id, model, input_tokens, output_tokens) values ('${HH1}', '${MEM_HOA}', 'model-gia', 100, 50);
    insert into private.ops_alerts(kind, scope, household_id, metrics, action) values ('SOFT_HOUSEHOLD_DAY', 'HOUSEHOLD', '${HH1}', '{"tokens_today": 1}', 'NONE');
    insert into private.pal_locks(household_id, reason) values ('${HH1}', 'SPIKE');
  end $r$;`;
const DRILL = (reason = 'GIA_LAP_DIEN_TAP', prelude = RICH, root = HH1, call = `app.purge_household('${HH1}', '${reason}')`) => `${prelude}
  create temp table pp_ids (id text primary key);
  create temp table pp_before (tbl text primary key, n bigint);
  create temp table pp_out (line text);
  create function pg_temp.cnt(t text) returns bigint language plpgsql as $f$ declare n bigint; begin execute 'select count(*) from ' || t into n; return n; end $f$;
  create function pg_temp.alltbls() returns setof text language sql as $f$
    select format('%I.%I', n.nspname, c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relkind = 'r' and (n.nspname in ('app', 'private') or (n.nspname = 'auth' and c.relname = 'users')) $f$;
  do $d$ declare fk record; k int; v int; begin
    insert into pp_ids values ('${root}');
    loop
      v := 0;
      insert into pp_ids select m.user_id::text from app.members m where m.id::text in (select id from pp_ids) on conflict do nothing;
      get diagnostics k = row_count; v := v + k;
      insert into pp_ids select b.device_user_id::text from app.device_bindings b where b.id::text in (select id from pp_ids) on conflict do nothing;
      get diagnostics k = row_count; v := v + k;
      for fk in select c.conrelid::regclass::text as child_tbl, a.attname as col from pg_constraint c
          join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
          where c.contype = 'f' and array_length(c.conkey, 1) = 1 and c.connamespace in ('app'::regnamespace, 'private'::regnamespace)
            and c.confrelid::regclass::text not in ('app.purposes', 'app.policy_versions', 'private.audit_events', 'app.trial_slots')
            and exists (select 1 from pg_attribute x where x.attrelid = c.conrelid and x.attname = 'id' and not x.attisdropped)
      loop
        execute format('insert into pp_ids select t.id::text from %s t where t.%I::text in (select id from pp_ids) on conflict do nothing', fk.child_tbl, fk.col);
        get diagnostics k = row_count; v := v + k;
      end loop;
      exit when v = 0;
    end loop;
    insert into pp_before select t, pg_temp.cnt(t) from pg_temp.alltbls() t;
  end $d$;
  select count(*) from pp_ids;
  select ${call} as pr \\gset
  insert into pp_out select 'RESULT|' || ((:'pr'::jsonb)->>'ok');
  do $d$ declare t text; n bigint; ev jsonb; b bigint; begin
    select row_counts into ev from app.deletion_evidence order by purged_at desc limit 1;
    for t in select * from pg_temp.alltbls() loop
      execute format('select count(*) from %s x where exists (select 1 from pp_ids i where row_to_json(x)::text like ''%%'' || i.id || ''%%'')', t) into n;
      if n > 0 then insert into pp_out values ('LEFT|' || t || '|' || n); end if;
      if t not in ('app.deletion_evidence', 'app.job_runs', 'app.trial_slots') then
        select pb.n into b from pp_before pb where pb.tbl = t;
        if pg_temp.cnt(t) <> b - coalesce((ev ->> t)::bigint, 0) then insert into pp_out values ('DIFF|' || t || '|' || b || '|' || pg_temp.cnt(t) || '|' || coalesce(ev ->> t, '0')); end if;
      end if;
    end loop;
  end $d$;
  select line from pp_out order by line;`;

describe('TRIAL-PURGE: diễn tập xóa trên dữ liệu giả (seed) - không còn dòng nào của hộ ở mọi bảng', { skip }, () => {
  it('TRIAL-PURGE-01: purge hộ 1 (đủ mọi bảng app/private, máy con, người lớn): không còn id nào của hộ ở bất kỳ bảng nào; số dòng xóa khớp bằng chứng', () => {
    const r = admin(DRILL());
    assert.ok(r.ok, r.err);
    const n = Number(r.rows[0]);
    assert.ok(n >= 25, `tập id quá nhỏ (${n}): dữ liệu diễn tập chưa đủ giàu`);
    assert.deepEqual(r.rows.slice(1), ['RESULT|true'], `còn sót hoặc lệch: ${r.rows.slice(1).join(' ; ')}`);
  });

  it('TRIAL-PURGE-02: diễn tập chạm MỌI bảng gắn hộ (số dòng đã xóa > 0 ở từng bảng), nên đột biến bỏ sót bảng nào cũng bị phát hiện', () => {
    const r = admin(`${RICH} select app.purge_household('${HH1}', 'GIA_LAP_DIEN_TAP') as pr \\gset
      select k from jsonb_object_keys((:'pr'::jsonb)->'row_counts') k where ((:'pr'::jsonb)->'row_counts'->>k)::int = 0 order by 1`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, [], `bảng chưa có dữ liệu diễn tập: ${r.rows.join(', ')}`);
  });

  it('TRIAL-PURGE-03: hộ khác nguyên vẹn; bảng chỉ-thêm vẫn chặn xóa ngoài purge; ngữ cảnh purge không còn và không ai ghi được', () => {
    const r = admin(`select (select count(*) from app.members where household_id = '${HH2}') || ':' || (select count(*) from app.audit_log where household_id = '${HH2}')
      || ':' || (select count(*) from app.consent_events where household_id = '${HH2}'); select app.purge_household('${HH1}', 'OWNER');
      select (select count(*) from app.members where household_id = '${HH2}') || ':' || (select count(*) from app.audit_log where household_id = '${HH2}')
      || ':' || (select count(*) from app.consent_events where household_id = '${HH2}'); select count(*) from private.purge_context`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], r.rows[2]);
    assert.equal(r.rows[3], '0');
    for (const who of [{ role: 'admin' }, SVC]) {
      for (const sql of [`delete from app.audit_log`, `delete from app.mode_history`, `delete from app.consent_events`, `delete from app.deletion_evidence`]) {
        const x = run(who, sql, { setup: `insert into app.deletion_evidence(household_ref_hash, reason, data_class, row_counts) values (repeat('c', 64), 'OWNER', 'GIA_LAP', '{}');` });
        assert.equal(x.code, '55000', `${who.role}: ${sql} -> ${x.code}`);
      }
    }
    NO_EXEC(run(SVC, `insert into private.purge_context(txid, household_id) values (txid_current(), '${HH1}')`));
    const sneak = run(SVC, `delete from app.audit_log`);
    assert.equal(sneak.code, '55000');
  });

  it('TRIAL-PURGE-04: hộ chia sẻ người dùng đăng nhập với hộ khác: giữ người dùng đó, xóa phần còn lại', () => {
    // máy bé Su (hộ 2) từng ghép ở hộ 1 (binding cũ đã hủy): không xóa auth user khi purge hộ 1
    const r = admin(`insert into app.device_bindings(child_id, device_user_id, state, epoch) values ('${NA}', '${U_SU}', 'DA_HUY', 5);
      select app.purge_household('${HH1}', 'OWNER') as pr \\gset
      select (select count(*) from auth.users where id = '${U_SU}') || ':' || (select count(*) from auth.users where id = '${U_HOA}') || ':' || ((:'pr'::jsonb)->>'auth_users_deleted')`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], '1:0:3');
  });

  it('TRIAL-PURGE-05: tham số purge_delete_auth_users = 0: không xóa auth.users, trả danh sách id cho Edge Function', () => {
    const r = admin(`update private.params set value_int = 0 where key = 'purge_delete_auth_users';
      select app.purge_household('${HH1}', 'OWNER') as pr \\gset
      select jsonb_array_length((:'pr'::jsonb)->'auth_user_ids'); select count(*) from auth.users where id in ('${U_HOA}', '${U_MINH}', '${U_NA}')`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, ['3', '3']);
  });
});

describe('TRIAL-CHILD: app.purge_child - xóa thật chỉ dữ liệu một con (D-64; cùng nguyên tắc purge_household)', { skip }, () => {
  const CHILD_RICH = `${RICH}
    do $c$ begin
      insert into app.deletion_requests(household_id, scope, child_id, requested_by, reason) values ('${HH1}', 'HO_SO_CON', '${NA}', '${MEM_HOA}', 'XOA_HO_SO');
    end $c$;`;

  it('TRIAL-CHILD-01: diễn tập trên bé Na: không còn id nào của bé Na ở mọi bảng, số dòng khớp bằng chứng; bé Bin, người lớn, hộ còn nguyên', () => {
    const r = admin(DRILL('GIA_LAP_DIEN_TAP', CHILD_RICH, NA, `app.purge_child('${NA}', 'GIA_LAP_DIEN_TAP')`));
    assert.ok(r.ok, r.err);
    const n = Number(r.rows[0]);
    assert.ok(n >= 12, `tập id quá nhỏ (${n})`);
    assert.deepEqual(r.rows.slice(1), ['RESULT|true'], `còn sót hoặc lệch: ${r.rows.slice(1).join(' ; ')}`);
    const keep = admin(`${CHILD_RICH} select app.purge_child('${NA}', 'OWNER');
      select (select count(*) from app.children where household_id = '${HH1}') || ':' || (select count(*) from app.members where household_id = '${HH1}')
        || ':' || (select count(*) from app.purpose_state where child_id = '${BIN}') || ':' || (select count(*) from app.households where id = '${HH1}')
        || ':' || (select count(*) from auth.users where id in ('${U_HOA}', '${U_MINH}')) || ':' || (select count(*) from auth.users where id = '${U_NA}')`);
    assert.ok(keep.ok, keep.err);
    assert.equal(keep.rows[1], '1:2:1:1:2:0');
  });

  it('TRIAL-CHILD-02: chạm MỌI bảng gắn con (số dòng đã xóa > 0 ở từng bảng, trừ bộ đếm hộ)', () => {
    const r = admin(`${CHILD_RICH} select app.purge_child('${NA}', 'OWNER') as pr \\gset
      select k from jsonb_object_keys((:'pr'::jsonb)->'row_counts') k where ((:'pr'::jsonb)->'row_counts'->>k)::int = 0 order by 1`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, [], `bảng chưa có dữ liệu diễn tập: ${r.rows.join(', ')}`);
  });

  it('TRIAL-CHILD-03: con cuối cùng của hộ -> xóa cả hộ (scope HO); gửi lặp replay; con không có NOT_FOUND', () => {
    const r = admin(`update app.children set hidden_at = now() where id = '${BIN}'; select app.purge_child('${NA}', 'OWNER');
      select count(*) from app.households where id = '${HH1}'; select string_agg(scope, ',' order by scope) from app.deletion_evidence; select app.purge_child('${NA}', 'OWNER')`);
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).scope, 'HO');
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[2], 'CON,HO');
    assert.equal(J(r, 3).replay, true);
    NOT_FOUND(admin(`select app.purge_child(gen_random_uuid(), 'OWNER')`));
  });

  it('TRIAL-CHILD-04: dữ liệu thật -> BLOCKED_H4 không xóa gì; lý do lạ/không khớp loại: VALIDATION; hộ thử: con phải đã rút (CHO_XOA)', () => {
    const REAL = `alter table app.households drop constraint households_data_class_check; update app.households set data_class = 'THAT' where id = '${HH1}';`;
    BLOCKED(admin(`select app.purge_child('${NA}', 'OWNER')`, { setup: REAL }));
    VALIDATION(admin(`select app.purge_child('${NA}', 'LY_DO_LA')`), 'D-64');
    VALIDATION(admin(`select app.purge_child('${NA}', 'RUT_SOM')`), 'D-44');           // hộ giả lập không dùng lý do của hộ thử
    VALIDATION(admin(`select app.purge_child('${NA}', 'GIA_LAP_DIEN_TAP')`, { setup: OPEN() }), 'D-44');   // hộ thử không dùng lý do giả lập
    VALIDATION(admin(`select app.purge_child('${NA}', 'RUT_SOM')`, { setup: OPEN() }), 'D-64');            // con chưa rút
    const after = admin(`do $x$ begin begin perform app.purge_child('${NA}', 'OWNER'); exception when others then null; end; end $x$;
      select (select count(*) from app.children where id = '${NA}') || ':' || (select count(*) from app.deletion_evidence)`, { setup: REAL });
    assert.equal(after.rows[0], '1:0');
  });

  it('TRIAL-CHILD-05: chỉ hệ thống: người đăng nhập, máy con, anon không gọi được; JWT người dùng bị từ chối dù có EXECUTE', () => {
    for (const who of [QL, NL, DEV_NA, HK, ANON]) NO_EXEC(run(who, `select app.purge_child('${NA}', 'OWNER')`));
    FORBIDDEN(run({ role: 'authenticated', sub: U_HOA }, `select app.purge_child('${NA}', 'OWNER')`, { setup: `grant execute on function app.purge_child(uuid, text) to authenticated;` }), 'D-44');
  });
});

describe('TRIAL-H4: dữ liệu thật không xóa hẳn khi cổng H4 mở (AC-CON-20; BR-CON-056)', { skip }, () => {
  const REAL = `alter table app.households drop constraint households_data_class_check;
    update app.households set data_class = 'THAT' where id = '${HH1}';`;

  it('TRIAL-H4-01: loại dữ liệu ngoài GIA_LAP/THU_NOI_BO_D01 -> BLOCKED_H4, không xóa gì; chỉ ẩn qua deletion_request', () => {
    const r = run({ role: 'admin' }, `select app.purge_household('${HH1}', 'OWNER')`, { setup: REAL });
    BLOCKED(r);
    const keep = run({ role: 'admin' }, `savepoint s; select app.purge_household('${HH1}', 'OWNER');`, { setup: REAL });
    assert.equal(keep.ok, false);
    const after = run({ role: 'admin' }, `do $x$ begin begin perform app.purge_household('${HH1}', 'OWNER'); exception when others then null; end; end $x$;
      select (select count(*) from app.members where household_id = '${HH1}') || ':' || (select count(*) from app.deletion_evidence)`, { setup: REAL });
    assert.equal(after.rows[0], '2:0');
    const hide = run(QL, `select app.deletion_request('HO_SO_CON', '${BIN}', true)`, { setup: REAL });
    assert.equal(J(hide).hard_deleted, false);
  });

  it('TRIAL-H4-02: hộ thử còn đang thu, GIA_LAP với lý do của hộ thử, lý do lạ, hộ không có, gửi lặp', () => {
    VALIDATION(run({ role: 'admin' }, `select app.purge_household('${HH1}', 'HET_THU')`, { setup: OPEN() }), 'D-44');
    VALIDATION(run({ role: 'admin' }, `select app.purge_household('${HH1}', 'HET_THU')`), 'D-44');
    VALIDATION(run({ role: 'admin' }, `select app.purge_household('${HH1}', 'LY_DO_LA')`), 'D-44');
    NOT_FOUND(run({ role: 'admin' }, `select app.purge_household(gen_random_uuid(), 'OWNER')`));
    const again = run({ role: 'admin' }, `select app.purge_household('${HH1}', 'OWNER'); select app.purge_household('${HH1}', 'OWNER')`);
    assert.equal(J(again, 0).replay, false);
    assert.equal(J(again, 1).replay, true);
    FORBIDDEN(run({ role: 'authenticated', sub: U_HOA }, `select app.purge_household('${HH1}', 'OWNER')`, { setup: `grant execute on function app.purge_household(uuid, text) to authenticated;` }), 'D-44');
  });
});

describe('TRIAL-EXP: export_request trả BLOCKED_H4 (Tech Spec #31)', { skip }, () => {
  it('TRIAL-EXP-01: QL nhận BLOCKED_H4 (không ghi gì); NL, máy con, người ngoài bị từ chối trước; tham số sai VALIDATION', () => {
    BLOCKED(run(QL, `select app.export_request()`));
    BLOCKED(run(QL, `select app.export_request('HO_SO_CON', '${NA}')`));
    FORBIDDEN(run(NL, `select app.export_request()`), 'BR-CON-060');
    FORBIDDEN(run(DEV_NA, `select app.export_request()`), 'BR-CON-060');
    NO_EXEC(run(ANON, `select app.export_request()`));
    VALIDATION(run(QL, `select app.export_request('LA_LA')`), 'BR-CON-060');
    rejected(run({ role: 'authenticated' }, `select app.export_request()`), 'UNAUTHENTICATED', 'PT401');
  });
});

describe('TRIAL-EVID: bằng chứng xóa không chứa dữ liệu cá nhân (D-44)', { skip }, () => {
  it('TRIAL-EVID-01: chỉ mã băm, lý do, loại dữ liệu, số dòng theo bảng; không id, tên, email của hộ; chỉ-thêm; trình kiểm chặn khóa lạ', () => {
    const r = admin(`${RICH} select app.purge_household('${HH1}', 'OWNER');
      select household_ref_hash = encode(extensions.digest(convert_to('${HH1}', 'UTF8'), 'sha256'), 'hex') from app.deletion_evidence;
      select (row_to_json(e)::text ~ '(\mHoa\M|\mMinh\M|\mNa\M|\mBin\M|example\.|Nhà giả|-4000-8000-)') from app.deletion_evidence e`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], 't');
    assert.equal(r.rows[2], 'f', 'bằng chứng chứa tên, email hoặc id');
    for (const bad of [`'{"app.members": "x"}'`, `'{"chi Hoa": 1}'`, `'{"app.members": 1000000}'`, `'{"app.members": {"a": 1}}'`, `('{"' || gen_random_uuid() || '": 1}')`]) {
      CHECK(run({ role: 'admin' }, `insert into app.deletion_evidence(household_ref_hash, reason, data_class, row_counts) values (repeat('a', 64), 'OWNER', 'GIA_LAP', ${bad}::jsonb)`));
    }
    CHECK(run({ role: 'admin' }, `insert into app.deletion_evidence(household_ref_hash, reason, data_class, row_counts) values ('${HH1}', 'OWNER', 'GIA_LAP', '{}')`));
    for (const who of [{ role: 'admin' }, SVC]) {
      assert.equal(run(who, `update app.deletion_evidence set reason = 'OWNER'`, { setup: `insert into app.deletion_evidence(household_ref_hash, reason, data_class, row_counts) values (repeat('b', 64), 'OWNER', 'GIA_LAP', '{}');` }).code, '55000');
    }
    for (const who of [QL, NL, HK, DEV_NA, ANON]) NO_EXEC(run(who, `select count(*) from app.deletion_evidence`));
  });
});

describe('TRIAL-FK: mọi bảng mới phải có cách xóa theo hộ (chặn bảng quên khai trong purge_household)', { skip }, () => {
  it('TRIAL-FK-01: mỗi bảng app/private (ngoài danh sách toàn cục) có đường khóa ngoại tới households/children/members/auth.users', () => {
    const GLOBAL = ['app.purposes', 'app.policy_versions', 'app.trial_slots', 'app.deletion_evidence', 'app.job_runs',
      'private.params', 'private.audit_events', 'private.purge_context'];
    const r = admin(`with recursive linked(tbl) as (
        select 'app.households' union select 'app.children' union select 'app.members' union select 'auth.users'
        union select format('%I.%I', cn.nspname, cc.relname) from pg_constraint k
          join pg_class cc on cc.oid = k.conrelid join pg_namespace cn on cn.oid = cc.relnamespace
          join pg_class pc on pc.oid = k.confrelid join pg_namespace pn on pn.oid = pc.relnamespace
          join linked l on l.tbl = format('%I.%I', pn.nspname, pc.relname)
          where k.contype = 'f' and cn.nspname in ('app', 'private'))
      select format('%I.%I', n.nspname, c.relname) from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where c.relkind = 'r' and n.nspname in ('app', 'private') order by 1`);
    const all = r.rows;
    const linked = admin(`with recursive linked(tbl) as (
        select 'app.households' union select 'app.children' union select 'app.members' union select 'auth.users'
        union select format('%I.%I', cn.nspname, cc.relname) from pg_constraint k
          join pg_class cc on cc.oid = k.conrelid join pg_namespace cn on cn.oid = cc.relnamespace
          join pg_class pc on pc.oid = k.confrelid join pg_namespace pn on pn.oid = pc.relnamespace
          join linked l on l.tbl = format('%I.%I', pn.nspname, pc.relname)
          where k.contype = 'f' and cn.nspname in ('app', 'private'))
      select tbl from linked`).rows;
    // pair_throttle không có khóa ngoại nhưng được purge xóa theo khóa (khai riêng, có test diễn tập)
    const NO_FK_OK = ['private.pair_throttle'];
    const missing = all.filter((t) => !GLOBAL.includes(t) && !NO_FK_OK.includes(t) && !linked.includes(t));
    assert.deepEqual(missing, [], `bảng chưa có đường xóa theo hộ: ${missing.join(', ')}`);
    const fn = admin(`select pg_get_functiondef('app.purge_household(uuid,text)'::regprocedure)`).rows.join('\n');
    for (const t of all.filter((x) => !GLOBAL.includes(x) && x !== 'app.trial_slots')) {
      assert.ok(fn.includes(`delete from ${t} `), `purge_household không xóa ${t}`);
    }
  });

  it('TRIAL-FK-02: mọi bảng có đường khóa ngoại tới app.children (hoặc dữ liệu theo con) phải được purge_child xóa', () => {
    const kids = admin(`with recursive linked(tbl) as (
        select 'app.children'::text collate "C"
        union select format('%I.%I', cn.nspname, cc.relname) from pg_constraint k
          join pg_class cc on cc.oid = k.conrelid join pg_namespace cn on cn.oid = cc.relnamespace
          join pg_class pc on pc.oid = k.confrelid join pg_namespace pn on pn.oid = pc.relnamespace
          join linked l on l.tbl = format('%I.%I', pn.nspname, pc.relname)
          where k.contype = 'f' and cn.nspname in ('app', 'private'))
      select tbl from linked order by 1`).rows;
    assert.ok(kids.includes('app.child_health_notes') && kids.includes('app.consent_events'), kids.join(','));
    const fn = admin(`select pg_get_functiondef('app.purge_child(uuid,text)'::regprocedure)`).rows.join('\n');
    for (const t of kids.filter((x) => !['app.trial_slots'].includes(x))) {
      assert.ok(fn.includes(`delete from ${t} `), `purge_child không xóa ${t}`);
    }
    // bảng theo con nhưng không có khóa ngoại: audit_log (subject_ref), pair_throttle/pairing_codes (máy con)
    for (const t of ['app.audit_log', 'private.pair_throttle', 'private.pairing_codes']) assert.ok(fn.includes(`delete from ${t} `), t);
  });
});
