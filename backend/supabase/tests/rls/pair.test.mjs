// Test T1.2, T1.5, T1.6: family_create, touch_active, ghép máy (mã, xác nhận hai bên), Parent PIN, unlink_device, epoch.
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
// Mã chuẩn: FN-FAM (T1.2), FN-PAIR / FN-PIN (T1.5), FR01-Txx (FR-01), AC-FAM-xx (BL 11.2), RLS-EPOCH (Tech Spec §6.2).
// Dữ liệu: chỉ tên giả. PIN trong test (482916, 735190) là giá trị thử, không phải PIN thật.
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
const BIND_NA = '00000000-0000-4000-8000-000000000401';
const U = {
  QL: A.QL.sub, NL: A.NL.sub, DEV_NA: A.CON.sub, HK: A.HO_KHAC.sub, DEV_SU: A.CON_CHUA_GHEP.sub,
  ADULT_NEW: '00000000-0000-4000-8000-0000000000a6', DEV_NEW: '00000000-0000-4000-8000-0000000000a7',
};
const PIN = '482916';
const PIN2 = '735190';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

// ---------------------------------------------------------------- người gọi (claims mô phỏng Supabase Auth)
const ADULT_NEW = { role: 'authenticated', sub: U.ADULT_NEW };
const dev = (sub, extra = {}) => ({ role: 'authenticated', sub, claims: { is_anonymous: true, ...extra } });
const DEV_NA = dev(U.DEV_NA);      // máy bé Na, đã ghép (HIEU_LUC, epoch 1 trong seed)
const DEV_SU = dev(U.DEV_SU);      // máy bé Su, binding chờ xác nhận (hộ 2)
const DEV_NEW = dev(U.DEV_NEW);    // máy con mới, chưa ghép, chưa có mã
const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;

// ---------------------------------------------------------------- trợ giúp
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\n`;
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;   // bước quản trị giữa chừng
const BIN_DEVICE = adm(`update app.children set has_device = true where id = '${BIN}'`);
const SET_PIN = (m = MEM_HOA, p = PIN) => `select private.pin_store('${m}', '${p}');`;
const FREEZE = `update app.households set state='DONG_BANG', frozen_at=now() where id='${HH1}';`;
const hmac = (c) => `private.pair_hmac('${c}')`;
const injectCode = (sub, code = '123456', mins = 10) =>
  `insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${sub}', ${hmac(code)}, now() + interval '${mins} minutes');`;

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
const RATE = (r) => rejected(r, 'RATE_LIMITED', 'PT429');
const CONFLICT = (r) => rejected(r, 'CONFLICT_REV', 'PT409');
const UNAUTH = (r) => rejected(r, 'UNAUTHENTICATED', 'PT401');
const NO_EXEC = (r) => { assert.equal(r.ok, false); assert.equal(r.code, '42501'); };
const failJson = (o, code = 'NOT_FOUND') => { assert.equal(o.ok, false); assert.equal(o.error.code, code); };

// ================================================================ T1.2: family_create, touch_active
describe('FN-FAM: tạo hộ và hoạt động (T1.2; BR-FAM-001, 050; AC-FAM-22, 24, 26 phần đăng nhập)', { skip }, () => {
  it('FN-FAM-01: người lớn mới tạo hộ - thành viên PRIMARY, hộ GIA_LAP/HOAT_DONG, tên gọn, last_active_at đặt, tự thấy hộ', () => {
    const r = run(ADULT_NEW, `select app.family_create('  chị Mai ');
      select count(*) from app.households; select count(*) from app.members;
      select role || ':' || call_name || ':' || status || ':' || (last_active_at is not null) from app.members;
      ${adm(`select data_class || ':' || state || ':' || (frozen_at is null) from app.households h join app.members m on m.household_id = h.id where m.user_id = '${U.ADULT_NEW}'`)}`);
    const out = J(r);
    assert.equal(out.role, 'PRIMARY');
    assert.equal(out.call_name, 'chị Mai');
    assert.equal(out.replay, false);
    assert.equal(r.rows[1], '1');   // chỉ thấy hộ của mình (RLS)
    assert.equal(r.rows[2], '1');
    assert.equal(r.rows[3], 'PRIMARY:chị Mai:DA_THAM_GIA:true');
    assert.equal(r.rows[4], 'GIA_LAP:HOAT_DONG:true');
  });

  it('FN-FAM-02: gọi lại (mất phản hồi) trả hộ cũ, không tạo hộ thứ hai; chị Hoa đã là QL cũng vậy', () => {
    const r = run(ADULT_NEW, `select app.family_create('chị Mai'); select app.family_create('tên khác');
      ${adm(`select count(*) from app.households; select count(*) from app.members where user_id = '${U.ADULT_NEW}'`)}`);
    const a = J(r, 0), b = J(r, 1);
    assert.equal(b.replay, true);
    assert.equal(b.household_id, a.household_id);
    assert.equal(b.member_id, a.member_id);
    assert.equal(b.call_name, 'chị Mai');
    assert.equal(r.rows[2], '3');   // 2 hộ seed + 1
    assert.equal(r.rows[3], '1');
    const hoa = J(run(QL, `select app.family_create('chị Hoa')`));
    assert.equal(hoa.replay, true);
    assert.equal(hoa.household_id, HH1);
  });

  it('FN-FAM-03: từ chối đúng mã - đã là người lớn khác của hộ, đã rời hộ, máy con, chưa đăng nhập, anon, tên sai', () => {
    VALIDATION(run(NL, `select app.family_create('anh Minh')`), 'BR-FAM-001');
    VALIDATION(run(ADULT_NEW, `select app.family_create('chị Mai')`, {
      setup: `insert into app.members(household_id,user_id,role,call_name,status) values ('${HH2}','${U.ADULT_NEW}','SUPPORTER','chị Mai','DA_ROI');` }), 'BR-FAM-001');
    FORBIDDEN(run(DEV_NEW, `select app.family_create('bé')`), 'FR-01');                       // máy con (cột auth.users + claim)
    FORBIDDEN(run({ ...ADULT_NEW, claims: { is_anonymous: true } }, `select app.family_create('chị Mai')`), 'FR-01');   // claim đủ
    UNAUTH(run({ role: 'authenticated' }, `select app.family_create('chị Mai')`));
    UNAUTH(run({ role: 'authenticated', sub: '00000000-0000-4000-8000-0000000000ee' }, `select app.family_create('x')`));
    NO_EXEC(run(ANON, `select app.family_create('chị Mai')`));
    for (const bad of ['', '   ', 'x'.repeat(41)]) VALIDATION(run(ADULT_NEW, `select app.family_create('${bad}')`), 'BR-FAM-001');
    assert.equal(run(ADULT_NEW, `select app.family_create(null)`).ok, false);
  });

  it('FN-FAM-04: touch_active - cập nhật last_active_at, tối đa 1 lần/giờ, NL cũng tính (AC-FAM-24)', () => {
    const r = run(QL, `select app.touch_active(); select app.touch_active();
      ${adm(`update app.members set last_active_at = now() - interval '61 minutes' where id = '${MEM_HOA}'`)}
      select app.touch_active();
      ${as(NL)} select app.touch_active(); select app.touch_active();`);
    assert.equal(J(r, 0).touched, true);
    assert.equal(J(r, 1).touched, false);
    assert.equal(J(r, 2).touched, true);
    assert.equal(J(r, 3).touched, true);
    assert.equal(J(r, 4).touched, false);
    const small = run(QL, `${adm(`update app.members set last_active_at = now() - interval '59 minutes' where id = '${MEM_HOA}'`)} select app.touch_active()`);
    assert.equal(J(small).touched, false);
  });

  it('FN-FAM-05: touch_active - máy con và người ngoài hộ không tính (AC-FAM-26); anon bị chặn; không đổi trạng thái đóng băng', () => {
    FORBIDDEN(run(DEV_NA, `select app.touch_active()`), 'BR-FAM-050');
    FORBIDDEN(run(ADULT_NEW, `select app.touch_active()`), 'BR-FAM-050');
    UNAUTH(run({ role: 'authenticated' }, `select app.touch_active()`));
    NO_EXEC(run(ANON, `select app.touch_active()`));
    FORBIDDEN(run(QL, `select app.touch_active()`, { setup: `update app.members set status='DA_ROI' where id='${MEM_HOA}';` }));
    const r = run(QL, `select app.touch_active(); ${adm(`select state || ':' || (frozen_at is not null) from app.households where id = '${HH1}'`)}`,
      { setup: FREEZE });
    assert.equal(J(r).touched, true);
    assert.equal(r.rows[1], 'DONG_BANG:true', 'touch không tự mở lại hộ (BR-FAM-057)');
    // ghi trực tiếp last_active_at bị từ chối
    const w = run(QL, `update app.members set last_active_at = now()`);
    assert.equal(w.code, '42501');
  });
});

// ================================================================ T1.5: mã ghép
describe('FN-PAIR: mã ghép và xác nhận hai bên (T1.5; BR-FAM-030..039; AC-FAM-11, 12, 16; FR01-T05, T06, T08)', { skip }, () => {
  it('FN-PAIR-01: pair_code_create - mã 6 số, chỉ lưu HMAC (không lưu mã), hạn theo tham số, mã mới hủy mã cũ', () => {
    const r = run(DEV_NEW, `select app.pair_code_create() as c1 \\gset
      select :'c1'::jsonb ->> 'code'; select :'c1'::jsonb ->> 'ttl_minutes';
      select app.pair_code_create()->>'code' as code2 \\gset
      ${adm(`select count(*) filter (where state='CON_HAN') || ':' || count(*) filter (where state='HET_HAN') || ':' || count(*)
               from private.pairing_codes where device_user_id = '${U.DEV_NEW}';
             select (code_hmac = private.pair_hmac(:'code2')) || ':' || (code_hmac = :'code2') || ':' || length(code_hmac) || ':' ||
               (expires_at - created_at = interval '10 minutes') from private.pairing_codes
               where device_user_id = '${U.DEV_NEW}' and state = 'CON_HAN'`)}`);
    assert.match(r.rows[0], /^[0-9]{6}$/);
    assert.equal(r.rows[1], '10');
    assert.equal(r.rows[2], '1:1:2');
    assert.equal(r.rows[3], 'true:false:64:true');
  });

  it('FN-PAIR-02: pair_code_create - chỉ máy con; máy đã ghép bị từ chối; anon bị chặn; giới hạn tạo mã mỗi giờ', () => {
    FORBIDDEN(run(QL, `select app.pair_code_create()`), 'FR-01');
    FORBIDDEN(run({ ...ADULT_NEW }, `select app.pair_code_create()`), 'FR-01');
    VALIDATION(run(DEV_NA, `select app.pair_code_create()`), 'BR-FAM-036');
    UNAUTH(run({ role: 'authenticated' }, `select app.pair_code_create()`));
    NO_EXEC(run(ANON, `select app.pair_code_create()`));
    const ten = run(DEV_NEW, `select count(*) from (select app.pair_code_create() from generate_series(1,10)) s; select 1;`);
    assert.ok(ten.ok, ten.err);
    RATE(run(DEV_NEW, `select count(*) from (select app.pair_code_create() from generate_series(1,10)) s; select app.pair_code_create();`));
  });

  it('FN-PAIR-03: mã đều chữ số, không lệch, không trùng trong lô; khóa bí mật thiếu thì lỗi INTERNAL, có setting dự phòng', () => {
    const r = run(DEV_NEW, `select string_agg(app.pair_code_create()->>'code', ',') from (select 1 from generate_series(1,1)) s;`);
    assert.match(r.rows[0], /^[0-9]{6}$/);
    // 8 máy tạo mã, tất cả khác nhau và đúng định dạng
    const ids = Array.from({ length: 8 }, (_, i) => `00000000-0000-4000-8000-0000000001${i}0`);
    const setup = ids.map((id) => `insert into auth.users(id,aud,role,is_anonymous) values ('${id}','authenticated','authenticated',true);`).join('');
    const body = ids.map((id) => `${as(dev(id))} select app.pair_code_create()->>'code';`).join('\n');
    const many = run(DEV_NEW, body, { setup });
    assert.equal(many.rows.length, 8);
    assert.ok(many.rows.every((c) => /^[0-9]{6}$/.test(c)));
    assert.equal(new Set(many.rows).size, 8);
    // thiếu khóa
    const noKey = run(DEV_NEW, `select app.pair_code_create()`, { setup: `delete from vault.decrypted_secrets where name='pairing_secret';` });
    assert.equal(noKey.code, 'PT500');
    assert.match(noKey.err, /secret_missing:pairing_secret/);
    assert.equal(run(DEV_NEW, `select app.pair_code_create()`, { setup: `update vault.decrypted_secrets set decrypted_secret='ngan' where name='pairing_secret';` }).code, 'PT500');
    // dự phòng bằng cài đặt cơ sở dữ liệu
    const fb = run(DEV_NEW, `select app.pair_code_create()->>'code'`, {
      setup: `delete from vault.decrypted_secrets where name='pairing_secret'; select set_config('app.settings.pairing_secret','TEST-ONLY-setting-fallback-key-0003',false) as _k \\gset\n` });
    assert.match(fb.rows[0], /^[0-9]{6}$/, fb.err);
  });

  it('FN-PAIR-04: luồng đầy đủ - máy con chưa đọc được gì khi chờ; Đồng ý mới HIEU_LUC; mã DA_DUNG rồi bị dọn (AD-11, BR-FAM-032)', () => {
    const r = run(DEV_NEW, `select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${BIN}', :'code', '${PIN}');
      select count(*) from app.device_bindings where child_id = '${BIN}';
      ${as(DEV_NEW)} select count(*) from app.children; select app.pair_pending();
      ${adm(`select state from private.pairing_codes where device_user_id = '${U.DEV_NEW}'`)}
      select app.pair_accept();
      select count(*) from app.children;
      ${adm(`select count(*) from private.pairing_codes where device_user_id = '${U.DEV_NEW}'`)}
      select app.pair_accept();
      ${as(QL)} select state || ':' || epoch from app.device_bindings where child_id = '${BIN}';`, { setup: BIN_DEVICE.replace(/reset role;\n|set local role authenticated;\n/g, '') });
    const conf = J(r, 0);
    assert.equal(conf.ok, true);
    assert.equal(conf.state, 'CHO_XAC_NHAN_MAY_CON');
    assert.equal(conf.epoch, 1);
    assert.equal(conf.pin_set, true);
    assert.equal(r.rows[1], '1');
    assert.equal(r.rows[2], '0', 'máy con chưa đọc được hồ sơ khi chưa bấm Đồng ý');
    const pend = J(r, 3);
    assert.equal(pend.pending, true);
    assert.equal(pend.adult_call_name, 'chị Hoa');
    assert.equal(r.rows[4], 'DA_DUNG');
    const acc = J(r, 5);
    assert.deepEqual([acc.ok, acc.replay, acc.epoch, acc.child_id], [true, false, 2, BIN]);
    assert.equal(r.rows[6], '1');
    assert.equal(r.rows[7], '0', 'mã của máy được xóa sau khi ghép');
    const again = J(r, 8);
    assert.deepEqual([again.ok, again.replay, again.epoch], [true, true, 2]);
    assert.equal(r.rows[9], 'HIEU_LUC:2');
  });

  it('FN-PAIR-05 / AC-FAM-11: mã dùng lại, mã sai, mã hết hạn, sai định dạng - cùng một thông báo, không lộ mã có tồn tại không', () => {
    const r = run(DEV_NEW, `select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${BIN}', :'code', '${PIN}') as first \\gset
      select app.pair_confirm('${BIN}', :'code');
      select app.pair_confirm('${BIN}', '000000');
      select app.pair_confirm('${BIN}', 'abc');
      select app.pair_confirm('${BIN}', null);`, { setup: `update app.children set has_device=true where id='${BIN}';` });
    const used = J(r, 0), wrong = J(r, 1), fmt = J(r, 2), nul = J(r, 3);
    failJson(used); failJson(wrong); failJson(fmt); failJson(nul);
    assert.deepEqual(used, wrong);
    assert.deepEqual(wrong, fmt);
    assert.deepEqual(wrong, nul);
    assert.equal(wrong.error.message_vi, 'Mã không đúng hoặc đã hết hạn.');
    // hết hạn: cùng kết quả chung
    const exp = run(QL, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, {
      setup: `update app.children set has_device=true where id='${BIN}'; ${injectCode(U.DEV_NEW, '123456', -1)}` });
    assert.deepEqual(J(exp), wrong);
  });

  it('FN-PAIR-06: nhập mã sai bị đếm và khóa theo tài khoản + hộ; khóa thì mã đúng cũng bị từ chối; hộ khác không bị ảnh hưởng', () => {
    const guess = (n) => Array.from({ length: n }, (_, i) => `select app.pair_confirm('${BIN}', '00000${i}', '${PIN}');`).join('\n');
    const r = run(QL, `${guess(5)}
      ${adm(`select scope || ':' || failed_count || ':' || (locked_until is not null) from private.pair_throttle order by scope`)}`,
      { setup: `update app.children set has_device=true where id='${BIN}'; ${injectCode(U.DEV_NEW)}` });
    for (let i = 0; i < 5; i++) failJson(J(r, i));
    assert.equal(r.rows[5], 'HOUSEHOLD:5:true');
    assert.equal(r.rows[6], 'USER:5:true');
    RATE(run(QL, `${guess(5)} select app.pair_confirm('${BIN}', '123456', '${PIN}')`,
      { setup: `update app.children set has_device=true where id='${BIN}'; ${injectCode(U.DEV_NEW)}` }));
    // hết khóa (cửa sổ đã qua) thì nhập lại được; mã đúng thành công
    const ok = run(QL, `${guess(5)}
      ${adm(`update private.pair_throttle set locked_until = now() - interval '1 second', window_start = now() - interval '16 minutes'`)}
      select app.pair_confirm('${BIN}', '123456', '${PIN}')`,
      { setup: `update app.children set has_device=true where id='${BIN}'; ${injectCode(U.DEV_NEW)}` });
    assert.equal(J(ok, 5).ok, true);
    // hộ 2 (cô Lan) không bị khóa vì hộ 1
    const lan = run(HK, `select app.pair_confirm('${SU}', '123456', '${PIN}')`, { setup:
      `${injectCode(U.DEV_NEW)} update private.pair_throttle set locked_until = now() + interval '1 hour';
       insert into private.pair_throttle(scope,key,failed_count,locked_until) values ('HOUSEHOLD','${HH1}',5,now() + interval '1 hour');` });
    assert.equal(J(lan).ok, true);
  });

  it('FN-PAIR-07 / AC-FAM-12 / FR01-T08: máy đã ghép ở hộ A, hộ B nhập mã - từ chối chung; mã đúng bị đếm và khóa sau N lần; con đã có liên kết bị từ chối', () => {
    const inject = `${injectCode(U.DEV_NA)} update app.children set has_device=true where id='${SU}';`;
    const r = run(HK, `select app.pair_confirm('${SU}', '123456', '${PIN}');
      ${adm(`select attempts || ':' || state from private.pairing_codes where code_hmac = ${hmac('123456')}; select count(*) from app.device_bindings where device_user_id = '${U.DEV_NA}'`)}`,
      { setup: inject });
    failJson(J(r, 0));
    assert.equal(r.rows[1], '1:CON_HAN');
    assert.equal(r.rows[2], '1', 'không tạo binding mới cho máy đã ghép');
    // 5 lần: mã bị khóa (HET_HAN) dù throttle chưa chặn lần thứ 5
    const five = run(HK, Array.from({ length: 5 }, () => `select app.pair_confirm('${SU}', '123456', '${PIN}');`).join('\n') + '\n' +
      adm(`select attempts || ':' || state from private.pairing_codes where code_hmac = ${hmac('123456')}`), { setup: inject });
    assert.equal(five.rows[5], '5:HET_HAN');
    // hộ B không chọn được con của hộ A; hộ A không ghép lại con đang có liên kết (kể cả có mã)
    NOT_FOUND(run(HK, `select app.pair_confirm('${NA}', '123456', '${PIN}')`, { setup: injectCode(U.DEV_NEW) }));
    VALIDATION(run(QL, `select app.pair_confirm('${NA}', '123456')`, { setup: injectCode(U.DEV_NEW) }), 'BR-FAM-032');
  });

  it('FN-PAIR-08 / AC-FAM-16 / FR01-T05 / FR01-T06: sau khi hộ A hủy, cùng hộ ghép lại bình thường (epoch mới); hộ B chỉ được CHO_XAC_MINH, không quyền gì', () => {
    // máy a7 từng ghép hiệu lực với bé Na (hộ 1) rồi hủy (epoch 2 ở dòng DA_HUY)
    const history = `update app.children set has_device=true where id in ('${BIN}','${SU}');
      insert into app.device_bindings(child_id,device_user_id,epoch,state,paired_by_member_id,paired_at,revoked_at,revoke_reason)
        values ('${NA}','${U.DEV_NEW}',1,'DA_HUY','${MEM_HOA}',now(),now(),'PIN_MAY_CON');
      ${injectCode(U.DEV_NEW)}`;
    // hộ B (cô Lan) nhập mã với con của mình
    const b = run(HK, `select app.pair_confirm('${SU}', '123456', '${PIN}');
      ${as(DEV_NEW)} select count(*) from app.children; select app.pair_pending();`, { setup: history + `delete from app.device_bindings where device_user_id='${U.DEV_SU}';` });
    const conf = J(b, 0);
    assert.equal(conf.ok, true);
    assert.equal(conf.state, 'CHO_XAC_MINH');
    assert.equal(b.rows[1], '0', 'máy không đọc được dữ liệu nào');
    assert.equal(J(b, 2).pending, false, 'CHO_XAC_MINH không lộ ra máy');
  });

  it('FN-PAIR-08b: pair_accept không nâng được CHO_XAC_MINH; hộ B không thấy dữ liệu hộ A; dòng liên kết của A nguyên vẹn', () => {
    const history = `update app.children set has_device=true where id in ('${BIN}','${SU}');
      insert into app.device_bindings(child_id,device_user_id,epoch,state,paired_by_member_id,paired_at,revoked_at,revoke_reason)
        values ('${NA}','${U.DEV_NEW}',1,'DA_HUY','${MEM_HOA}',now(),now(),'PIN_MAY_CON');
      ${injectCode(U.DEV_NEW)} delete from app.device_bindings where device_user_id='${U.DEV_SU}';`;
    NOT_FOUND(run(HK, `select app.pair_confirm('${SU}', '123456', '${PIN}'); ${as(DEV_NEW)} select app.pair_accept();`, { setup: history }));
    const r = run(HK, `select app.pair_confirm('${SU}', '123456', '${PIN}');
      select count(*) from app.children where id = '${NA}';
      select count(*) from app.device_bindings; select count(*) from app.grants;
      ${adm(`select state || ':' || epoch from app.device_bindings where child_id = '${NA}' and device_user_id = '${U.DEV_NEW}';
             select state from app.device_bindings where child_id = '${SU}' and device_user_id = '${U.DEV_NEW}'`)}`, { setup: history });
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[2], '1');   // chỉ dòng CHO_XAC_MINH của chính hộ B
    assert.equal(r.rows[3], '0');
    assert.equal(r.rows[4], 'DA_HUY:1');
    assert.equal(r.rows[5], 'CHO_XAC_MINH');
    // cùng hộ A ghép lại con khác (BIN) bằng mã mới: bình thường
    const same = run(QL, `select app.pair_confirm('${BIN}', '123456')`, { setup: history + SET_PIN() });
    const o = J(same);
    assert.equal(o.state, 'CHO_XAC_NHAN_MAY_CON');
    assert.equal(o.pin_set, false);
  });

  it('FN-PAIR-09: pair_confirm - quyền và điều kiện (NL, hộ khác, máy con, đóng băng, con không máy, PIN lần đầu)', () => {
    const base = BIN_DEVICE.replace(/reset role;\n|set local role authenticated;\n/g, '') + injectCode(U.DEV_NEW);
    FORBIDDEN(run(NL, `select app.pair_confirm('${NA}', '123456', '${PIN}')`, { setup: injectCode(U.DEV_NEW) }));   // NL thấy Na nhưng không phải QL
    NOT_FOUND(run(NL, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, { setup: base }));
    NOT_FOUND(run(HK, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, { setup: base }));
    FORBIDDEN(run(DEV_NA, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, { setup: base }), 'FR-01');
    UNAUTH(run({ role: 'authenticated' }, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`));
    NO_EXEC(run(ANON, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`));
    FROZEN(run(QL, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, { setup: base + FREEZE }));
    VALIDATION(run(QL, `select app.pair_confirm('${BIN}', '123456', '${PIN}')`, { setup: injectCode(U.DEV_NEW) }), 'BR-FAM-037');   // BIN chưa có máy
    VALIDATION(run(QL, `select app.pair_confirm('${BIN}', '123456')`, { setup: base }), 'FR-01');            // lần đầu thiếu PIN
    VALIDATION(run(QL, `select app.pair_confirm('${BIN}', '123456', '${PIN2}')`, { setup: base + SET_PIN() }), 'FR-01');   // đã có PIN
    for (const weak of ['123456', '111111', '654321', '12345', '4829161', 'abcdef']) {
      VALIDATION(run(QL, `select app.pair_confirm('${BIN}', '123456', '${weak}')`, { setup: base }), 'FR-01');
    }
    // có PIN rồi thì ghép không cần PIN, và PIN cũ nguyên vẹn
    const ok = run(QL, `select app.pair_confirm('${BIN}', '123456'); ${adm(`select (pin_hash like '$2%') from private.parent_pins where member_id='${MEM_HOA}'`)}`, { setup: base + SET_PIN() });
    assert.equal(J(ok).ok, true);
    assert.equal(ok.rows[1], 't');
  });

  it('FN-PAIR-10: pair_accept - quá hạn xác nhận, Không (decline), không có yêu cầu, hộ đóng băng, người lớn gọi, anon; yêu cầu mới thay yêu cầu cũ', () => {
    const base = BIN_DEVICE.replace(/reset role;\n|set local role authenticated;\n/g, '');
    const pending = `${base} insert into app.device_bindings(child_id,device_user_id,epoch,state,paired_by_member_id)
      values ('${BIN}','${U.DEV_NEW}',1,'CHO_XAC_NHAN_MAY_CON','${MEM_HOA}');`;
    const old = run(DEV_NEW, `${adm(`update app.device_bindings set created_at = now() - interval '6 minutes' where child_id='${BIN}'`)}
      select app.pair_pending(); select app.pair_accept();
      ${adm(`select state || ':' || revoke_reason from app.device_bindings where child_id='${BIN}'`)}`, { setup: pending });
    assert.equal(J(old, 0).pending, false);
    failJson(J(old, 1));
    assert.equal(old.rows[2], 'DA_HUY:HET_HAN_XAC_NHAN');
    NOT_FOUND(run(DEV_NEW, `select app.pair_accept()`));
    NOT_FOUND(run(DEV_NEW, `${adm(`update app.device_bindings set created_at = now() - interval '6 minutes' where child_id='${BIN}'`)} select app.pair_accept(); select app.pair_accept();`, { setup: pending }));
    const dec = run(DEV_NEW, `select app.pair_decline(); select app.pair_decline(); select count(*) from app.device_bindings where state = 'DA_HUY' and revoke_reason='MAY_CON_TU_CHOI';`, { setup: pending });
    assert.equal(J(dec, 0).declined, true);
    assert.equal(J(dec, 1).declined, false);
    FROZEN(run(DEV_NEW, `select app.pair_accept()`, { setup: pending + FREEZE }));
    FORBIDDEN(run(QL, `select app.pair_accept()`), 'FR-01');
    FORBIDDEN(run(QL, `select app.pair_pending()`), 'FR-01');
    FORBIDDEN(run(QL, `select app.pair_decline()`), 'FR-01');
    NO_EXEC(run(ANON, `select app.pair_accept()`));
    NOT_FOUND(run(DEV_NEW, `select app.pair_accept()`, { setup: pending + `update app.members set status='DA_ROI' where id='${MEM_HOA}';` }));
    // con bị ẩn trong lúc chờ
    NOT_FOUND(run(DEV_NEW, `select app.pair_accept()`, { setup: pending + `update app.children set hidden_at=now() where id='${BIN}';` }));
    // yêu cầu mới (mã mới) thay yêu cầu cũ: chỉ còn một CHO_XAC_NHAN
    const two = run(DEV_NEW, `select app.pair_code_create()->>'code' as c1 \\gset
      ${as(QL)} select app.pair_confirm('${BIN}', :'c1', '${PIN}');
      ${as(DEV_NEW)} select app.pair_code_create()->>'code' as c2 \\gset
      ${as(QL)} select app.pair_confirm('${BIN}', :'c2');
      ${adm(`select count(*) filter (where state='CHO_XAC_NHAN_MAY_CON') || ':' || count(*) filter (where revoke_reason='THAY_THE')
               from app.device_bindings where child_id='${BIN}'`)}`, { setup: base });
    assert.equal(two.rows[two.rows.length - 1], '1:1');
  });

  it('FN-PAIR-11: ràng buộc dữ liệu - mỗi máy/mỗi con tối đa một yêu cầu chờ; mỗi máy một mã CON_HAN', () => {
    const dup = (sql) => { const r = admin(sql); assert.equal(r.ok, false); assert.equal(r.code, '23505', r.err); };
    dup(`update app.children set has_device=true where id='${BIN}';
         insert into app.device_bindings(child_id,device_user_id,state) values ('${BIN}','${U.DEV_SU}','CHO_XAC_NHAN_MAY_CON')`);   // a5 đã có yêu cầu chờ
    dup(`${injectCode(U.DEV_NEW, '111222')} ${injectCode(U.DEV_NEW, '333444')}`);
    // con không máy không ghép được (trigger baseline)
    const r = admin(`insert into app.device_bindings(child_id,device_user_id,state) values ('${BIN}','${U.DEV_NEW}','CHO_XAC_MINH')`);
    assert.equal(r.code, '23514');
  });
});

// ================================================================ T1.5: Parent PIN
describe('FN-PIN: Parent PIN (T1.5; FR-01; Architecture §5.3)', { skip }, () => {
  it('FN-PIN-01: pin_set - chỉ lưu băm bcrypt có pepper, muối mỗi lần khác, không PIN thô ở đâu cả; đổi PIN xóa bộ đếm', () => {
    const r = run(QL, `select app.pin_set('${PIN}');
      ${adm(`select pin_hash into temp h1 from private.parent_pins where member_id='${MEM_HOA}';
             update private.parent_pins set failed_count=3, lock_level=2, locked_until=now()+interval '1 hour'`)}
      select app.pin_set('${PIN2}');
      ${adm(`select (pin_hash like '$2%') || ':' || length(pin_hash) || ':' || (pin_hash <> (select pin_hash from h1)) || ':' ||
               failed_count || ':' || lock_level || ':' || (locked_until is null) from private.parent_pins where member_id='${MEM_HOA}';
             select count(*) from private.parent_pins where pin_hash like '%${PIN}%' or pin_hash like '%${PIN2}%'`)}`);
    assert.deepEqual(J(r, 0), { ok: true, created: true });
    assert.deepEqual(J(r, 1), { ok: true, created: false });
    assert.equal(r.rows[2], 'true:60:true:0:0:true');
    assert.equal(r.rows[3], '0');
  });

  it('FN-PIN-02: pin_set - chỉ QL; NL, máy con, người chưa có hộ, anon bị chặn; hộ đóng băng; định dạng và PIN dễ đoán', () => {
    FORBIDDEN(run(NL, `select app.pin_set('${PIN}')`), 'BR-FAM-004');
    FORBIDDEN(run(DEV_NA, `select app.pin_set('${PIN}')`), 'FR-01');
    FORBIDDEN(run(ADULT_NEW, `select app.pin_set('${PIN}')`), 'BR-FAM-004');
    FORBIDDEN(run({ ...QL, claims: { is_anonymous: true } }, `select app.pin_set('${PIN}')`), 'FR-01');
    UNAUTH(run({ role: 'authenticated' }, `select app.pin_set('${PIN}')`));
    NO_EXEC(run(ANON, `select app.pin_set('${PIN}')`));
    FROZEN(run(QL, `select app.pin_set('${PIN}')`, { setup: FREEZE }));
    for (const bad of ['', '12345', '1234567', 'abcdefg', '48 916', '000000', '999999', '123456', '234567', '987654', '012345']) {
      const r = run(QL, `select app.pin_set('${bad}')`);
      VALIDATION(r, 'FR-01');
      assert.ok(!r.err.includes(PIN), 'lỗi không được lặp lại PIN');
    }
    VALIDATION(run(QL, `select app.pin_set(null)`), 'FR-01');
    NOT_FOUND(run(QL, `select app.pin_set('${PIN}')`, { setup: `update app.households set hidden_at=now() where id='${HH1}';` }));
  });

  it('FN-PIN-03: pin_verify nội bộ (không gọi qua API); đúng/sai/chưa đặt; PIN null hoặc sai định dạng tính là sai', () => {
    NO_EXEC(run(QL, `select app.pin_verify('${MEM_HOA}', '${PIN}')`));
    NO_EXEC(run(DEV_NA, `select app.pin_verify('${MEM_HOA}', '${PIN}')`));
    NO_EXEC(run(ANON, `select app.pin_verify('${MEM_HOA}', '${PIN}')`));
    const r = admin(`select app.pin_verify('${MEM_HOA}', '${PIN}');
      ${SET_PIN()}
      select app.pin_verify('${MEM_HOA}', '${PIN}'); select app.pin_verify('${MEM_HOA}', '${PIN2}');
      select app.pin_verify('${MEM_HOA}', null); select app.pin_verify('${MEM_HOA}', '');
      select app.pin_verify('${MEM_HOA}', '${PIN} OR 1=1'); select app.pin_verify('${MEM_HOA}', '${PIN}');
      select failed_count from private.parent_pins where member_id = '${MEM_HOA}'`);
    assert.ok(r.ok, r.err);
    const res = r.rows.filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
    assert.equal(res[0].result, 'NOT_SET');
    assert.equal(res[1].result, 'OK');
    assert.deepEqual([res[2].result, res[2].attempts_left], ['WRONG', 4]);
    assert.deepEqual([res[3].result, res[3].attempts_left], ['WRONG', 3]);
    assert.deepEqual([res[4].result, res[4].attempts_left], ['WRONG', 2]);
    assert.deepEqual([res[5].result, res[5].attempts_left], ['WRONG', 1]);
    assert.equal(res[6].result, 'OK');
    assert.equal(r.rows[r.rows.length - 1], '0', 'đúng thì xóa bộ đếm');
  });

  it('FN-PIN-04: khóa lũy tiến - 5 sai thì khóa 15 phút, PIN đúng cũng bị từ chối khi khóa; lần khóa sau nhân đôi; có trần; đúng thì xóa mức khóa', () => {
    const wrong = (n) => Array.from({ length: n }, () => `select app.pin_verify('${MEM_HOA}', '${PIN2}');`).join('\n');
    const mark = (tag) => `select '${tag}=' || coalesce(extract(epoch from (locked_until - now()))::int::text, 'null') || ':' || lock_level || ':' || failed_count
      from private.parent_pins where member_id='${MEM_HOA}';`;
    const r = admin(`${SET_PIN()} ${wrong(5)} ${mark('L1')}
      select 'LOCKED=' || (app.pin_verify('${MEM_HOA}', '${PIN}') ->> 'result');
      update private.parent_pins set locked_until = now() - interval '1 second';
      ${wrong(5)} ${mark('L2')}
      update private.parent_pins set locked_until = null, lock_level = 30;
      ${wrong(5)} ${mark('L3')}
      update private.parent_pins set locked_until = now() - interval '1 second';
      select 'OK=' || (app.pin_verify('${MEM_HOA}', '${PIN}') ->> 'result');
      ${mark('L4')}`);
    assert.ok(r.ok, r.err);
    const get = (tag) => r.rows.find((l) => l.startsWith(tag + '='));
    assert.equal(get('L1'), 'L1=900:1:0');        // 15 phút, mức khóa 1, bộ đếm về 0
    assert.equal(get('LOCKED'), 'LOCKED=LOCKED'); // PIN đúng khi đang khóa vẫn bị từ chối
    assert.equal(get('L2'), 'L2=1800:2:0');       // nhân đôi
    assert.equal(get('L3'), 'L3=86400:31:0');     // trần 24 giờ, không tràn số
    assert.equal(get('OK'), 'OK=OK');
    assert.equal(get('L4'), 'L4=null:0:0');       // đúng thì xóa mức khóa
    const fifth = r.rows.filter((l) => l.startsWith('{')).map((l) => JSON.parse(l))[4];
    assert.deepEqual([fifth.result, fifth.attempts_left], ['WRONG', 0]);
    assert.ok(fifth.locked_until);
  });

  it('FN-PIN-05: pepper là khóa ngoài bảng - đổi pepper thì PIN cũ không khớp; thiếu pepper thì lỗi, không băm không pepper', () => {
    const r = admin(`${SET_PIN()} select app.pin_verify('${MEM_HOA}', '${PIN}');
      update vault.decrypted_secrets set decrypted_secret = 'TEST-ONLY-another-pepper-value-9999' where name='pin_pepper';
      select app.pin_verify('${MEM_HOA}', '${PIN}');`);
    assert.equal(JSON.parse(r.rows.find((l) => l.startsWith('{'))).result, 'OK');
    assert.equal(JSON.parse(r.rows.filter((l) => l.startsWith('{'))[1]).result, 'WRONG');
    const noPepper = run(QL, `select app.pin_set('${PIN}')`, { setup: `delete from vault.decrypted_secrets where name='pin_pepper';` });
    assert.equal(noPepper.code, 'PT500');
    assert.match(noPepper.err, /secret_missing:pin_pepper/);
  });
});

// ================================================================ T1.6: unlink_device
const unlink = (who, child = NA, pin = PIN, epoch = 1) =>
  `select app.unlink_device('${child}', ${pin === null ? 'null' : `'${pin}'`}, ${epoch === null ? 'null' : epoch});`;
const PIN_NA = SET_PIN();   // chị Hoa đã đặt PIN; bé Na ghép máy a3 (seed, epoch 1, HIEU_LUC)
const stateNa = adm(`select state || ':' || epoch from app.device_bindings where id = '${BIND_NA}'`);

describe('FR01-T: hủy liên kết, PIN, epoch (T1.6; FR-01; AC-FAM-13..15; cổng G-1)', { skip }, () => {
  it('FR01-T01: máy con hủy không có PIN hợp lệ (null, rỗng, sai định dạng) - không hủy, epoch giữ nguyên, không lộ dữ liệu', () => {
    for (const pin of [null, '', 'abc', `${PIN} `]) {
      const r = run(DEV_NA, `${unlink(DEV_NA, NA, pin)} ${stateNa}`, { setup: PIN_NA });
      const o = J(r, 0);
      failJson(o, 'FORBIDDEN');
      assert.equal(o.error.rule, 'FR01-T02');
      assert.deepEqual(Object.keys(o).sort(), ['error', 'ok']);
      assert.equal(r.rows[1], 'HIEU_LUC:1');
    }
    // QL cũng cần PIN
    const q = run(QL, `${unlink(QL, NA, null, null)} ${stateNa}`, { setup: PIN_NA });
    failJson(J(q, 0), 'FORBIDDEN');
    assert.equal(q.rows[1], 'HIEU_LUC:1');
    // chưa đặt PIN: không hủy được, lỗi rõ
    VALIDATION(run(DEV_NA, unlink(DEV_NA)), 'FR-01');
    // máy con không gửi epoch
    VALIDATION(run(DEV_NA, unlink(DEV_NA, NA, PIN, null), { setup: PIN_NA }), 'FR01-T09');
  });

  it('FR01-T02 / AC-FAM-13: PIN sai - không hủy; số lần sai tăng ở máy chủ; khóa sau N lần, PIN đúng cũng bị từ chối khi khóa; không có đường vòng', () => {
    const bad = (n) => Array.from({ length: n }, () => unlink(DEV_NA, NA, PIN2)).join('\n');
    const r = run(DEV_NA, `${bad(3)} ${adm(`select failed_count from private.parent_pins where member_id='${MEM_HOA}'`)} ${stateNa}`, { setup: PIN_NA });
    assert.deepEqual([J(r, 0).error.attempts_left, J(r, 1).error.attempts_left, J(r, 2).error.attempts_left], [4, 3, 2]);
    assert.equal(r.rows[3], '3', 'bộ đếm được giữ (không bị hủy cùng giao dịch)');
    assert.equal(r.rows[4], 'HIEU_LUC:1');
    const locked = run(DEV_NA, `${bad(5)} ${unlink(DEV_NA, NA, PIN)}`, { setup: PIN_NA });
    RATE(locked);
    const st = run(DEV_NA, `${bad(5)} ${adm(`select state || ':' || epoch from app.device_bindings where id='${BIND_NA}'; select (locked_until > now()) from private.parent_pins where member_id='${MEM_HOA}'`)}`, { setup: PIN_NA });
    assert.equal(J(st, 4).error.locked_until !== null, true);
    assert.equal(st.rows[5], 'HIEU_LUC:1');
    assert.equal(st.rows[6], 't');
    // hết khóa thì đúng PIN hủy được
    const after = run(DEV_NA, `${bad(5)} ${adm(`update private.parent_pins set locked_until = now() - interval '1 second'`)} ${unlink(DEV_NA)}`, { setup: PIN_NA });
    assert.equal(J(after, 5).unlinked, true);
    // đường vòng: máy con đặt lại PIN; người lớn khác hủy; người ngoài hủy; claim giả
    FORBIDDEN(run(DEV_NA, `select app.pin_set('${PIN2}')`), 'FR-01');
    FORBIDDEN(run(NL, unlink(NL), { setup: PIN_NA }));
    NOT_FOUND(run(HK, unlink(HK), { setup: PIN_NA }));
    FORBIDDEN(run({ ...QL, claims: { is_anonymous: true } }, unlink(QL), { setup: PIN_NA }));
    NOT_FOUND(run(DEV_NEW, unlink(DEV_NEW), { setup: PIN_NA }));
    NOT_FOUND(run(DEV_SU, unlink(DEV_SU), { setup: PIN_NA }));
    UNAUTH(run({ role: 'authenticated' }, unlink(QL), { setup: PIN_NA }));
    NO_EXEC(run(ANON, unlink(ANON), { setup: PIN_NA }));
  });

  it('FR01-T03 / AC-FAM-15: PIN đúng - hủy đúng một lần, epoch + 1; gửi lại trả biên nhận cũ; dữ liệu của con không bị xóa; phản hồi không chứa PIN', () => {
    const before = `select (select count(*) from app.children) || ':' || (select count(*) from app.grants) || ':' ||
        (select count(*) from private.checkin_responses) || ':' || (select mode || mode_epoch from app.children where id='${NA}')`;
    const r = run(DEV_NA, `${unlink(DEV_NA)} ${unlink(DEV_NA)} ${unlink(DEV_NA)}
      ${adm(`select state || ':' || epoch || ':' || revoke_reason || ':' || (revoked_at is not null) from app.device_bindings where id='${BIND_NA}';
             select count(*) from app.device_bindings where child_id='${NA}'; ${before}`)}
      ${as(QL)} select app.unlink_device('${NA}', null, null);`, { setup: PIN_NA });
    const a = J(r, 0), b = J(r, 1), c = J(r, 2);
    assert.deepEqual(a, { ok: true, unlinked: true, replay: false, epoch: 2 });
    assert.deepEqual(b, { ok: true, unlinked: true, replay: true, epoch: 2 });
    assert.deepEqual(c, b);
    assert.equal(r.rows[3], 'DA_HUY:2:PIN_MAY_CON:true');
    assert.equal(r.rows[4], '1', 'đúng một dòng, epoch tăng đúng một lần');
    assert.equal(r.rows[5], '3:1:6:CHILD_EXECUTED1', 'dữ liệu còn nguyên');
    assert.deepEqual(J(r, 6), { ok: true, unlinked: true, replay: true, epoch: 2 }, 'QL gửi lại cũng nhận biên nhận cũ (không cần PIN)');
    assert.ok(!r.rows[0].includes(PIN));
    // QL hủy: lý do PIN_QL, epoch tùy chọn
    const q = run(QL, `${unlink(QL, NA, PIN, null)} ${adm(`select revoke_reason from app.device_bindings where id='${BIND_NA}'`)}`, { setup: PIN_NA });
    assert.equal(J(q, 0).unlinked, true);
    assert.equal(q.rows[1], 'PIN_QL');
    CONFLICT(run(QL, unlink(QL, NA, PIN, 7), { setup: PIN_NA }));
    // hộ đóng băng: vẫn hủy được (thu hẹp quyền)
    assert.equal(J(run(QL, unlink(QL, NA, PIN, null), { setup: PIN_NA + FREEZE })).unlinked, true);
  });

  it('FR01-T03b: không có liên kết để hủy / người lạ gửi lại / con đã xóa (ẩn) - trả đúng mã, không lộ', () => {
    NOT_FOUND(run(QL, unlink(QL, BIN, PIN, null), { setup: PIN_NA }));          // BIN chưa từng ghép
    NOT_FOUND(run(HK, unlink(HK, NA), { setup: PIN_NA + `update app.device_bindings set state='DA_HUY' where id='${BIND_NA}';` }));
    NOT_FOUND(run(DEV_NEW, unlink(DEV_NEW, NA), { setup: PIN_NA + `update app.device_bindings set state='DA_HUY', epoch=2 where id='${BIND_NA}';` }));
    NOT_FOUND(run(QL, unlink(QL, '00000000-0000-4000-8000-0000000009ff')));
    const hidden = run(QL, `select app.child_delete('${NA}', true); ${unlink(QL, NA, PIN, null)}`, { setup: PIN_NA });
    assert.deepEqual(J(hidden, 1), { ok: true, unlinked: true, replay: true, epoch: 2 });
    // epoch cũ trong replay
    CONFLICT(run(DEV_NA, unlink(DEV_NA, NA, PIN, 9), { setup: PIN_NA + `update app.device_bindings set state='DA_HUY', epoch=2 where id='${BIND_NA}';` }));
  });

  it('FR01-T04: biên nhận hủy không chứa PIN/mã; việc hủy không phụ thuộc thông báo (phần đẩy và thử lại thuộc Edge Function, ghi trong README)', () => {
    const r = run(DEV_NA, unlink(DEV_NA), { setup: PIN_NA });
    const o = J(r);
    assert.deepEqual(Object.keys(o).sort(), ['epoch', 'ok', 'replay', 'unlinked']);
    assert.ok(!JSON.stringify(o).includes(PIN));
    // hàm không tạo hàng đợi thông báo hay token: chưa có bảng nào; ghi nhận bằng việc commit chỉ đụng device_bindings/pairing_codes
    const tables = admin(`select count(*) from information_schema.tables where table_schema in ('app','private') and table_name ilike '%notif%' or table_name ilike '%push%'`);
    assert.equal(tables.rows[0], '0');
  });

  it('FR01-T05 / FR01-T07: cùng hộ ghép lại sau hủy bằng mã mới - bình thường, epoch lớn hơn mọi liên kết cũ, không thừa hưởng id cũ', () => {
    const r = run(DEV_NA, `${unlink(DEV_NA)}
      select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${NA}', :'code');
      ${as(DEV_NA)} select app.pair_accept();
      ${as(QL)} ${adm(`select count(*) from app.device_bindings where child_id='${NA}';
         select string_agg(state || ':' || epoch, ',' order by epoch) from app.device_bindings where child_id='${NA}'`)}`, { setup: PIN_NA });
    assert.equal(J(r, 0).epoch, 2);
    const conf = J(r, 1), acc = J(r, 2);
    assert.deepEqual([conf.state, conf.epoch], ['CHO_XAC_NHAN_MAY_CON', 3]);
    assert.deepEqual([acc.ok, acc.epoch], [true, 4]);
    assert.notEqual(acc.binding_id, BIND_NA);
    assert.equal(r.rows[3], '2');
    assert.equal(r.rows[4], 'DA_HUY:2,HIEU_LUC:4');
  });

  it('FR01-T06 / AC-FAM-16: sau khi A hủy hợp lệ, hộ B có mã mới chỉ được CHO_XAC_MINH - không quyền, không dữ liệu của A', () => {
    const r = run(DEV_NA, `${unlink(DEV_NA)}
      select app.pair_code_create()->>'code' as code \\gset
      ${as(HK)} select app.pair_confirm('${SU}', :'code', '${PIN2}');
      ${as(DEV_NA)} select count(*) from app.children; select count(*) from app.device_bindings;
      select app.can('${U.DEV_NA}', 'child.view', '${SU}', null), app.can('${U.DEV_NA}', 'child.view', '${NA}', null);
      ${as(HK)} select count(*) from app.children where id = '${NA}'; select count(*) from app.grants;`,
      { setup: PIN_NA + `delete from app.device_bindings where device_user_id='${U.DEV_SU}';` });
    const conf = J(r, 1);
    assert.equal(conf.state, 'CHO_XAC_MINH');
    assert.equal(r.rows[2], '0');
    assert.equal(r.rows[3], '0');
    assert.equal(r.rows[4], 'f|f');
    assert.equal(r.rows[5], '0');
    assert.equal(r.rows[6], '0');
    NOT_FOUND(run(DEV_NA, `${unlink(DEV_NA)} select app.pair_code_create()->>'code' as code \\gset
      ${as(HK)} select app.pair_confirm('${SU}', :'code', '${PIN2}');
      ${as(DEV_NA)} select app.pair_accept();`, { setup: PIN_NA + `delete from app.device_bindings where device_user_id='${U.DEV_SU}';` }));
  });

  it('FR01-T09 / AC-FAM-14: không hiệu lực nếu máy chủ chưa commit - epoch cũ, yêu cầu phát lại sau ghép lại, PIN giả ở máy: liên kết mới giữ nguyên', () => {
    // (a) epoch cũ / sai: CONFLICT_REV, không hủy
    CONFLICT(run(DEV_NA, unlink(DEV_NA, NA, PIN, 0), { setup: PIN_NA }));
    CONFLICT(run(DEV_NA, unlink(DEV_NA, NA, PIN, 5), { setup: PIN_NA }));
    // (b) hủy rồi ghép lại (epoch 4); máy phát lại yêu cầu hủy cũ (epoch 1) với PIN đúng: bị chặn, liên kết mới còn nguyên
    const replay = `${unlink(DEV_NA)}
      select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${NA}', :'code'); ${as(DEV_NA)} select app.pair_accept();`;
    const r = run(DEV_NA, `${replay} ${unlink(DEV_NA, NA, PIN, 1)}`, { setup: PIN_NA });
    CONFLICT(r);
    const after = run(DEV_NA, `${replay} ${adm(`select state || ':' || epoch from app.device_bindings where child_id='${NA}' and state='HIEU_LUC'`)}`, { setup: PIN_NA });
    assert.equal(after.rows[after.rows.length - 1], 'HIEU_LUC:4');
    // (c) máy ngoại tuyến "tự coi đã hủy": máy chủ chưa nhận thì máy vẫn đọc được và liên kết vẫn HIEU_LUC
    const off = run(DEV_NA, `select count(*) from app.children; select app.can('${U.DEV_NA}','child.view','${NA}',null); ${stateNa}`, { setup: PIN_NA });
    assert.equal(off.rows[0], '1');
    assert.equal(off.rows[1], 't');
    assert.equal(off.rows[2], 'HIEU_LUC:1');
    // (d) PIN sai nhiều lần không hủy, PIN của QL cũ không còn đủ (BR-FAM-028): đổi QL thì PIN cũ mất tác dụng
    const swap = `update app.members set role='SUPPORTER' where id='${MEM_HOA}'; update app.members set role='PRIMARY' where id='${MEM_MINH}';`;
    VALIDATION(run(DEV_NA, unlink(DEV_NA), { setup: PIN_NA + swap }), 'FR-01');
    NOT_FOUND(run(QL, unlink(QL, NA, PIN, null), { setup: PIN_NA + swap }));   // chị Hoa không còn là QL, cũng không có grant
    failJson(J(run(DEV_NA, unlink(DEV_NA), { setup: PIN_NA + swap + SET_PIN(MEM_MINH, PIN2) })), 'FORBIDDEN');
    assert.equal(J(run(DEV_NA, unlink(DEV_NA, NA, PIN2), { setup: PIN_NA + swap + SET_PIN(MEM_MINH, PIN2) })).unlinked, true);
    // không có QL hiện hành: fail-closed
    FORBIDDEN(run(DEV_NA, unlink(DEV_NA), { setup: PIN_NA + `update app.members set status='DA_ROI' where id='${MEM_HOA}';` }), 'BR-FAM-034');
  });

  it('RLS-EPOCH-01: token cũ mất quyền đọc ngay khi hủy; sau ghép lại, claim binding_epoch cũ không còn đọc được, claim đúng hoặc không claim thì đọc', () => {
    const cycle = `${unlink(DEV_NA)}
      select count(*), app.can('${U.DEV_NA}','child.view','${NA}',null) from app.children;
      select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${NA}', :'code'); ${as(DEV_NA)} select app.pair_accept();`;
    const withClaim = (extra) => `${as(dev(U.DEV_NA, extra))} select count(*) || ':' || app.can('${U.DEV_NA}','child.view','${NA}',null) from app.children;`;
    const r = run(DEV_NA, `${cycle} ${withClaim({})} ${withClaim({ binding_epoch: 1 })} ${withClaim({ binding_epoch: 2 })} ${withClaim({ binding_epoch: 4 })} ${withClaim({ binding_epoch: 'x' })}`, { setup: PIN_NA });
    assert.equal(r.rows[1], '0|f', 'ngay sau hủy: token cũ không đọc');
    const n = r.rows.length;
    assert.deepEqual(r.rows.slice(n - 5), ['1:true', '0:false', '0:false', '1:true', '0:false']);
    // trước khi hủy, claim đúng epoch 1 đọc được, epoch 2 thì không
    assert.equal(run(dev(U.DEV_NA, { binding_epoch: 1 }), 'select count(*) from app.children').rows[0], '1');
    assert.equal(run(dev(U.DEV_NA, { binding_epoch: 2 }), 'select count(*) from app.children').rows[0], '0');
    // claim chỉ thu hẹp: người lớn mang claim lạ vẫn đọc theo vai
    assert.equal(run({ ...QL, claims: { binding_epoch: 99 } }, 'select count(*) from app.children').rows[0], '2');
  });

  it('FR01-T10 / AC-FAM-15: hủy rồi ghép lại - không tự mở dữ liệu riêng, không xóa, không thừa hưởng đồng ý; máy con không đọc được private.*', () => {
    const snap = `select (select count(*) from app.grants) || ':' || (select count(*) from private.checkin_responses) || ':' ||
        (select count(*) from app.children where hidden_at is null) || ':' || (select count(*) from app.mode_history)`;
    const r = run(DEV_NA, `${unlink(DEV_NA)}
      select app.pair_code_create()->>'code' as code \\gset
      ${as(QL)} select app.pair_confirm('${NA}', :'code'); ${as(DEV_NA)} select app.pair_accept();
      ${adm(snap)}`, { setup: PIN_NA });
    assert.equal(r.rows[r.rows.length - 1], '1:6:3:1', 'grants, hỏi thăm, hồ sơ con, lịch sử mode giữ nguyên');
    const dataOnDevice = run(DEV_NA, `select count(*) from private.checkin_responses`);
    assert.equal(dataOnDevice.code, '42501');
    assert.equal(run(DEV_NA, `select count(*) from app.grants`).rows[0], '0', 'liên kết mới không cấp quyền nào');
    assert.equal(run(DEV_NA, `select app.weekly_report('${NA}', '2025-W40')`).code, '42501');
    assert.equal(run(DEV_NA, `select count(*) from app.mode_history`).rows[0], '0');
    // bé Na vẫn của hộ 1: PARENT không đổi, mode không đổi
    assert.equal(run(QL, `select mode from app.children where id='${NA}'`).rows[0], 'CHILD_EXECUTED');
  });
});
