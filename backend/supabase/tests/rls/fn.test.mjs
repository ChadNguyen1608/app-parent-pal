// Test hàm app.can, child_create/update/delete, mode_set (T1.1, T1.3, T1.4).
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
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
const UID = Object.fromEntries(Object.entries(A).map(([k, v]) => [k, v.sub]));
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const FREEZE = `update app.households set state='DONG_BANG', frozen_at=now() where id='${HH1}';`;

const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

/** Câu SQL đổi người gọi giữa chừng trong cùng giao dịch (để kiểm tác động sau khi QL ghi). */
const as = (key) =>
  `select set_config('request.jwt.claims', '${JSON.stringify({ sub: UID[key], role: A[key].role })}', true) as _s \\gset\n`;
const json = (r) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[0]); };
const rejected = (r, code, sqlstate, msg = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, sqlstate, r.err);
  assert.match(r.err, new RegExp(code));
  if (msg) assert.match(r.err, new RegExp(msg));
};
const FORBIDDEN = (r) => rejected(r, 'FORBIDDEN', 'PT403');
const NOT_FOUND = (r) => rejected(r, 'NOT_FOUND', 'PT404');
const VALIDATION = (r, rule) => rejected(r, 'VALIDATION', 'PT422', rule);
const FROZEN = (r) => rejected(r, 'FROZEN', 'PT423');
const NO_EXEC = (r) => { assert.equal(r.ok, false); assert.equal(r.code, '42501'); };

const can = (who, action, child, purpose = null, actor = who, opts) =>
  run(A[who], `select app_internal.can('${UID[actor]}', '${action}', '${child}', ${purpose ? `'${purpose}'` : 'null'})`, opts);
const canIs = (r) => { assert.ok(r.ok, r.err); return r.rows[0] === 't'; };

// ================================================================ app.can (T1.1)
describe('FN-CAN: điểm quyết định truy cập app.can / can_household', { skip }, () => {
  it('FN-CAN-01: ma trận vai x hành động trên bé Na (hộ 1)', () => {
    const expect = {
      //            view  admin_read update delete mode_set
      QL:            [true, true, true, true, true],
      NL:            [true, false, false, false, false],
      CON:           [true, false, false, false, false],
      CON_CHUA_GHEP: [false, false, false, false, false],
      HO_KHAC:       [false, false, false, false, false],
    };
    const actions = ['child.view', 'child.admin_read', 'child.update', 'child.delete', 'child.mode_set'];
    for (const [who, exp] of Object.entries(expect)) {
      actions.forEach((a, i) => assert.equal(canIs(can(who, a, NA)), exp[i], `${who} ${a}`));
    }
    // NL chỉ có grant bé Na, không có bé Bin.
    assert.equal(canIs(can('NL', 'child.view', BIN)), false);
    assert.equal(canIs(can('QL', 'child.view', BIN)), true);
    assert.equal(canIs(can('QL', 'child.view', SU)), false);
  });

  it('FN-CAN-02: actor khác người gọi bị từ chối (không dò quyền người khác); service_role được hỏi thay', () => {
    assert.equal(canIs(can('HO_KHAC', 'child.view', NA, null, 'QL')), false);
    assert.equal(canIs(can('NL', 'child.mode_set', NA, null, 'QL')), false);
    const svc = run({ role: 'service_role' }, `select app_internal.can('${UID.QL}', 'child.update', '${NA}', null)`);
    assert.equal(canIs(svc), true);
    const svc2 = run({ role: 'service_role' }, `select app_internal.can('${UID.NL}', 'child.update', '${NA}', null)`);
    assert.equal(canIs(svc2), false);
  });

  it('FN-CAN-03: fail-closed - hành động lạ, đối số null, mục đích lạ, MD-SUCKHOE; grant theo mục đích', () => {
    assert.equal(canIs(can('QL', 'child.hack', NA)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can(null, 'child.view', '${NA}', null)`)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can('${UID.QL}', null, '${NA}', null)`)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can('${UID.QL}', 'child.view', null, null)`)), false);
    assert.equal(canIs(can('QL', 'child.view', NA, 'MD-KHONG-CO')), false);
    assert.equal(canIs(can('QL', 'child.view', NA, 'MD-SUCKHOE')), false, 'MD-SUCKHOE không thu');
    assert.equal(canIs(can('QL', 'child.view', NA, 'MD-LICH')), true);
    assert.equal(canIs(can('NL', 'child.view', NA, 'MD-LICH')), true);
    assert.equal(canIs(can('NL', 'child.view', NA, 'MD-XONG')), false, 'grant chỉ cho MD-LICH');
    assert.equal(canIs(run(A.QL, `select app_internal.can_household('${UID.QL}', 'child.xxx', '${HH1}')`)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can_household('${UID.QL}', 'child.create', null)`)), false);
  });

  it('FN-CAN-04: grant REVIEW_REQUIRED hoặc THU_HOI coi như không có', () => {
    for (const st of ['REVIEW_REQUIRED', 'THU_HOI']) {
      const r = can('NL', 'child.view', NA, null, 'NL', { setup: `update app.grants set state='${st}' where child_id='${NA}';` });
      assert.equal(canIs(r), false, st);
    }
  });

  it('FN-CAN-05: hộ đóng băng - QL đọc được, ghi bị chặn; NL và máy con không đọc', () => {
    const o = { setup: FREEZE };
    assert.equal(canIs(can('QL', 'child.view', NA, null, 'QL', o)), true);
    assert.equal(canIs(can('QL', 'child.admin_read', NA, null, 'QL', o)), true);
    for (const a of ['child.update', 'child.delete', 'child.mode_set']) {
      assert.equal(canIs(can('QL', a, NA, null, 'QL', o)), false, a);
    }
    assert.equal(canIs(can('NL', 'child.view', NA, null, 'NL', o)), false);
    assert.equal(canIs(can('CON', 'child.view', NA, null, 'CON', o)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can_household('${UID.QL}', 'child.create', '${HH1}')`, o)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can_household('${UID.QL}', 'household.admin_read', '${HH1}')`, o)), true);
  });

  it('FN-CAN-06: chính sách children dùng app.can - đóng băng thì NL và máy con thấy 0 dòng, QL vẫn thấy', () => {
    const o = { setup: FREEZE };
    assert.equal(run(A.NL, 'select count(*) from app.children', o).rows[0], '0');
    assert.equal(run(A.CON, 'select count(*) from app.children', o).rows[0], '0');
    assert.equal(run(A.QL, 'select count(*) from app.children', o).rows[0], '2');
  });

  it('FN-CAN-07: hồ sơ ẩn hoặc hộ ẩn - không ai được, kể cả QL', () => {
    const hide = { setup: `update app.children set hidden_at=now() where id='${NA}';` };
    for (const who of ['QL', 'NL', 'CON']) assert.equal(canIs(can(who, 'child.view', NA, null, who, hide)), false, who);
    const hh = { setup: `update app.households set hidden_at=now() where id='${HH1}';` };
    assert.equal(canIs(can('QL', 'child.view', NA, null, 'QL', hh)), false);
    assert.equal(canIs(run(A.QL, `select app_internal.can_household('${UID.QL}', 'child.create', '${HH1}')`, hh)), false);
  });

  it('FN-CAN-08: can_household - chỉ QL của đúng hộ; hàm nội bộ và anon không gọi được', () => {
    const ch = (who, hh, act = 'child.create') => run(A[who], `select app_internal.can_household('${UID[who]}', '${act}', '${hh}')`);
    assert.equal(canIs(ch('QL', HH1)), true);
    assert.equal(canIs(ch('QL', HH2)), false);
    assert.equal(canIs(ch('NL', HH1)), false);
    assert.equal(canIs(ch('CON', HH1)), false);
    assert.equal(canIs(ch('HO_KHAC', HH1)), false);
    assert.equal(canIs(ch('QL', HH1, 'household.admin_read')), true);
    NO_EXEC(run(A.ANON, `select app_internal.can('${UID.QL}', 'child.view', '${NA}', null)`));
    for (const f of [`app.access_state('${UID.QL}', 'child.view', '${NA}', null)`, `app.fail('FORBIDDEN')`,
      `app.household_access_state('${UID.QL}', 'child.create', '${HH1}')`]) {
      NO_EXEC(run(A.QL, `select ${f}`));
    }
  });
});

// ================================================================ bảng mới (T1.1)
describe('FN-TBL: purposes, mode_history, invitations, FK', { skip }, () => {
  it('FN-TBL-01: 7 mục đích đúng BL 11.3 §2.2; MD-SUCKHOE không thu; chưa duyệt', () => {
    const r = run(A.QL, `select code || ':' || kind || ':' || collect_enabled || ':' || approval || ':' || array_to_string(depends_on, '+')
      from app.purposes order by code`);
    assert.deepEqual(r.rows, [
      'MD-BAOCAO:TUY_CHON:true:CHUA_DUYET:MD-XONG',
      'MD-DONGBO:TUY_CHON:true:CHUA_DUYET:MD-LICH',
      'MD-LICH:LOI:true:CHUA_DUYET:',
      'MD-MET:TUY_CHON:true:CHUA_DUYET:MD-DONGBO',
      'MD-MONGMUON:TUY_CHON:true:CHUA_DUYET:MD-DONGBO',
      'MD-SUCKHOE:TUY_CHON:false:CHUA_DUYET:MD-LICH',
      'MD-XONG:TUY_CHON:true:CHUA_DUYET:MD-DONGBO',
    ]);
  });

  it('FN-TBL-02: grants.purpose_code có FK tới purposes', () => {
    const r = admin(`update app.grants set purpose_code='MD-KHONG-CO' where child_id='${NA}'`);
    assert.equal(r.ok, false);
    assert.equal(r.code, '23503');
  });

  it('FN-TBL-03: invitations - không mời PRIMARY; mã băm duy nhất', () => {
    const ins = (role, hmac) => admin(`insert into app.invitations(household_id,invited_by,role,code_hmac,expires_at)
      values ('${HH1}','${MEM_HOA}','${role}','${hmac}', now())`);
    assert.equal(ins('PRIMARY', 'x1').code, '23514');
    assert.equal(ins('OBSERVER', 'seed-fake-invite-hmac-0001').code, '23505');
    assert.ok(ins('SUPPORTER', 'x2').ok);
  });

  it('FN-TBL-04: mode_history chỉ-thêm (không sửa, không xóa, không truncate, kể cả quản trị)', () => {
    for (const sql of ['update app.mode_history set new_mode = old_mode', 'delete from app.mode_history', 'truncate app.mode_history']) {
      const r = admin(sql);
      assert.equal(r.ok, false, sql);
      assert.equal(r.code, '55000', sql);
    }
  });
});

// ================================================================ child_create / update / delete (T1.3)
const create = (who, hh = HH1, name = 'bé Mít', extra = 'p_grade => 3') =>
  run(A[who], `select app.child_create('${hh}', '${name}', ${extra})`);

describe('FN-CHILD: hồ sơ con (T1.3; AC-FAM-20, AC-FAM-27)', { skip }, () => {
  it('FN-CHILD-01: QL tạo con - mode UNSET, epoch 1, QL thấy hồ sơ, NL chưa thấy (AC-FAM-20)', () => {
    const r = run(A.QL, `select app.child_create('${HH1}', '  bé Mít ', p_grade => 3, p_has_device => false);
      select count(*) from app.children where call_name = 'bé Mít' and hidden_at is null;
      ${as('NL')} select count(*) from app.children where call_name = 'bé Mít'`);
    assert.ok(r.ok, r.err);
    const out = JSON.parse(r.rows[0]);
    assert.equal(out.mode, 'UNSET');
    assert.equal(out.mode_epoch, 1);
    assert.equal(out.call_name, 'bé Mít');
    assert.equal(out.replay, false);
    assert.equal(r.rows[1], '1');
    assert.equal(r.rows[2], '0');
  });

  it('FN-CHILD-02: vai khác QL bị từ chối đúng mã khi tạo', () => {
    FORBIDDEN(create('NL'));
    NOT_FOUND(create('CON'));
    NOT_FOUND(create('HO_KHAC'));
    NOT_FOUND(create('CON_CHUA_GHEP'));
    NO_EXEC(create('ANON'));
    UNAUTH_EMPTY();
  });
  const UNAUTH_EMPTY = () => {
    const r = run({ role: 'authenticated' }, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`);
    rejected(r, 'UNAUTHENTICATED', 'PT401');
  };

  it('FN-CHILD-03: kiểm đầu vào', () => {
    VALIDATION(create('QL', HH1, '   ', 'p_grade => 3'));
    VALIDATION(create('QL', HH1, 'x'.repeat(41), 'p_grade => 3'));
    VALIDATION(create('QL', HH1, 'bé Mít', 'p_grade => 10'));
    VALIDATION(create('QL', HH1, 'bé Mít', 'p_grade => 0'));
    VALIDATION(create('QL', HH1, 'bé Mít', 'p_age_years => 19'));
    VALIDATION(create('QL', HH1, 'bé Mít', 'p_age_years => -1'));
    VALIDATION(create('QL', HH1, 'bé Mít', 'p_has_device => false'), 'BR-001');   // thiếu cả lớp lẫn tuổi
    assert.ok(create('QL', HH1, 'bé Mít', 'p_age_years => 0').ok);
  });

  it('FN-CHILD-04: idempotency_key - gửi lại trả kết quả cũ, không tạo thêm; khóa của hộ khác bị từ chối', () => {
    const K = '20000000-0000-4000-8000-000000000001';
    const r = run(A.QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3, p_idempotency_key => '${K}');
      select app.child_create('${HH1}', 'bé Mít', p_grade => 3, p_idempotency_key => '${K}');
      select count(*) from app.children where call_name = 'bé Mít'`);
    assert.ok(r.ok, r.err);
    const [a, b] = [JSON.parse(r.rows[0]), JSON.parse(r.rows[1])];
    assert.equal(a.replay, false);
    assert.equal(b.replay, true);
    assert.equal(a.child_id, b.child_id);
    assert.equal(r.rows[2], '1');
    const other = run(A.HO_KHAC, `select app.child_create('${HH2}', 'bé Mít', p_grade => 3, p_idempotency_key => '${K}')`,
      { setup: `insert into app.children(household_id, call_name, grade, idempotency_key) values ('${HH1}', 'bé X', 3, '${K}');` });
    VALIDATION(other, 'idempotency');
  });

  it('FN-CHILD-05: hộ đóng băng -> FROZEN cho QL ở cả ba hàm; người không có vai không biết trạng thái', () => {
    const o = { setup: FREEZE };
    FROZEN(run(A.QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`, o));
    FROZEN(run(A.QL, `select app.child_update('${NA}', '{"grade": 4}')`, o));
    FROZEN(run(A.QL, `select app.child_delete('${NA}', true)`, o));
    NOT_FOUND(run(A.HO_KHAC, `select app.child_update('${NA}', '{"grade": 4}')`, o));
    NOT_FOUND(run(A.HO_KHAC, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3)`, o));
  });

  it('FN-CHILD-06: child_update - QL sửa được; vai khác bị từ chối; chỉ nhận trường cho phép', () => {
    const r = run(A.QL, `select app.child_update('${NA}', '{"call_name": " bé Na Na ", "grade": 6}');
      select call_name || '/' || grade || '/' || mode from app.children where id = '${NA}'`);
    assert.ok(r.ok, r.err);
    assert.equal(JSON.parse(r.rows[0]).grade, 6);
    assert.equal(r.rows[1], 'bé Na Na/6/CHILD_EXECUTED');
    FORBIDDEN(run(A.NL, `select app.child_update('${NA}', '{"grade": 4}')`));
    FORBIDDEN(run(A.CON, `select app.child_update('${NA}', '{"grade": 4}')`));
    NOT_FOUND(run(A.HO_KHAC, `select app.child_update('${NA}', '{"grade": 4}')`));
    NOT_FOUND(run(A.NL, `select app.child_update('${BIN}', '{"grade": 4}')`));
    NO_EXEC(run(A.ANON, `select app.child_update('${NA}', '{"grade": 4}')`));
    for (const bad of ['{"mode": "PARENT_LED"}', '{"household_id": "' + HH2 + '"}', '{"hidden_at": "2020-01-01"}',
      '{}', '[]', '{"grade": "abc"}', '{"grade": 5.5}', '{"grade": 99}', '{"call_name": 5}', '{"call_name": ""}',
      '{"has_device": "x"}', '{"has_device": null}', '{"grade": null}']) {
      VALIDATION(run(A.QL, `select app.child_update('${NA}', '${bad}')`));   // '{"grade": null}' vì Na không có tuổi
    }
    // xóa lớp nhưng còn tuổi thì được
    const ok = run(A.QL, `select app.child_update('${NA}', '{"age_years": 10, "grade": null}')`);
    assert.equal(json(ok).grade, null);
  });

  it('FN-CHILD-07: không bỏ has_device khi còn liên kết máy', () => {
    VALIDATION(run(A.QL, `select app.child_update('${NA}', '{"has_device": false}')`), 'FR-01');
    const ok = run(A.QL, `select app.child_update('${BIN}', '{"has_device": true}')`);
    assert.equal(json(ok).has_device, true);
  });

  it('FN-CHILD-08: child_delete ẩn, không xóa hẳn, hủy liên kết máy, mọi vai không thấy nữa (AC-FAM-27)', () => {
    VALIDATION(run(A.QL, `select app.child_delete('${NA}')`), 'BR-FAM-080');
    VALIDATION(run(A.QL, `select app.child_delete('${NA}', false)`), 'BR-FAM-080');
    const r = run(A.QL, `select app.child_delete('${NA}', true);
      select count(*) from app.children where id = '${NA}';
      ${as('NL')} select count(*) from app.children where id = '${NA}';
      ${as('CON')} select count(*) from app.children where id = '${NA}';
      select count(*) from app.device_bindings`);
    assert.ok(r.ok, r.err);
    const out = JSON.parse(r.rows[0]);
    assert.deepEqual([out.hidden, out.replay, out.bindings_revoked], [true, false, 1]);
    assert.deepEqual(r.rows.slice(1), ['0', '0', '0', '0']);
    // weekly_report cho hồ sơ đã ẩn bị từ chối
    const wr = run(A.QL, `select app.child_delete('${NA}', true); select app.weekly_report('${NA}', '2025-W40')`);
    assert.equal(wr.code, '42501');
  });

  it('FN-CHILD-09: sau child_delete dữ liệu vẫn nằm trong bảng; liên kết DA_HUY, epoch+1; hỏi thăm không bị xóa', () => {
    const r = run(A.QL, `select app.child_delete('${NA}', true) is not null;
      ${'select set_config(\'request.jwt.claims\', \'{"role":"service_role"}\', true) as _s \\gset'}
      set local role service_role;
      select hidden_reason from app.children where id = '${NA}';
      select state || ':' || epoch || ':' || revoke_reason from app.device_bindings where child_id = '${NA}';
      select count(*) from private.checkin_responses where child_id = '${NA}'`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(1), ['XOA', 'DA_HUY:2:XOA_HO_SO', '6']);
  });

  it('FN-CHILD-10: child_delete idempotent; vai khác bị từ chối đúng mã', () => {
    const r = run(A.QL, `select app.child_delete('${BIN}', true); select app.child_delete('${BIN}', true)`);
    assert.ok(r.ok, r.err);
    assert.equal(JSON.parse(r.rows[0]).replay, false);
    assert.equal(JSON.parse(r.rows[1]).replay, true);
    assert.equal(JSON.parse(r.rows[1]).bindings_revoked, undefined);
    FORBIDDEN(run(A.NL, `select app.child_delete('${NA}', true)`));
    FORBIDDEN(run(A.CON, `select app.child_delete('${NA}', true)`));
    NOT_FOUND(run(A.HO_KHAC, `select app.child_delete('${NA}', true)`));
    NOT_FOUND(run(A.NL, `select app.child_delete('${BIN}', true)`));
    NO_EXEC(run(A.ANON, `select app.child_delete('${NA}', true)`));
    // NL không "gửi lặp" được trên hồ sơ đã ẩn để dò: NOT_FOUND
    NOT_FOUND(run(A.NL, `select app.child_delete('${NA}', true)`, { setup: `update app.children set hidden_at=now() where id='${NA}';` }));
    NOT_FOUND(run(A.HO_KHAC, `select app.child_delete('${NA}', true)`, { setup: `update app.children set hidden_at=now() where id='${NA}';` }));
  });

  it('FN-CHILD-11: không hàm nào cho ghi trực tiếp; không cột trường học, địa chỉ, sức khỏe', () => {
    assert.deepEqual(admin(`select column_name from information_schema.columns where table_schema='app' and table_name='children'
      and column_name ~* '(school|truong|address|dia_chi|health|suc_khoe|noi_o)'`).rows, []);
  });
});

// ================================================================ mode_set (T1.4)
const mode = (who, child, m) => run(A[who], `select app.mode_set('${child}', ${m === null ? 'null' : `'${m}'`})`);
const modeOf = (child) => `select mode || ':' || mode_epoch from app.children where id = '${child}'`;

describe('FN-MODE: mode_set (T1.4; AC-FAM-17..20, D-19)', { skip }, () => {
  it('FN-MODE-01: CHILD_DIRECTED và giá trị lạ bị từ chối với quy tắc D-19, mode không đổi (AC-FAM-17)', () => {
    VALIDATION(mode('QL', NA, 'CHILD_DIRECTED'), 'D-19');
    VALIDATION(mode('QL', NA, 'child_executed'));
    VALIDATION(mode('QL', NA, 'XYZ'));
    VALIDATION(mode('QL', NA, ''));
    VALIDATION(mode('QL', NA, null));
    const r = run(A.QL, `select app.mode_set('${BIN}', 'PARENT_LED'); ${modeOf(BIN)}; select count(*) from app.mode_history`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], 'PARENT_LED:1', 'cùng mode: không đổi');
    assert.equal(JSON.parse(r.rows[0]).changed, false);
    assert.equal(r.rows[2], '1', 'cùng mode: không ghi lịch sử');
  });

  it('FN-MODE-02: NL (Supporter) và con không đổi được mode; hộ khác không biết có hồ sơ (AC-FAM-19)', () => {
    FORBIDDEN(mode('NL', NA, 'PARENT_LED'));
    FORBIDDEN(mode('CON', NA, 'PARENT_LED'));
    NOT_FOUND(mode('HO_KHAC', NA, 'PARENT_LED'));
    NOT_FOUND(mode('CON_CHUA_GHEP', NA, 'PARENT_LED'));
    NOT_FOUND(mode('NL', BIN, 'CHILD_EXECUTED'));
    NO_EXEC(mode('ANON', NA, 'PARENT_LED'));
    // NL cố đặt CHILD_DIRECTED: bị chặn ở bước quyền trước khi bàn tới giá trị
    FORBIDDEN(mode('NL', NA, 'CHILD_DIRECTED'));
    const r = run(A.NL, `select app.mode_set('${NA}', 'PARENT_LED')`);
    assert.equal(r.ok, false);
    const after = run(A.QL, `${modeOf(NA)}; select count(*) from app.mode_history`);
    assert.deepEqual(after.rows, ['CHILD_EXECUTED:1', '1']);
  });

  it('FN-MODE-03: hồ sơ mới là UNSET; QL đổi qua lại, epoch tăng, lịch sử ghi đúng người đổi (AC-FAM-20, BR-FAM-045)', () => {
    const r = run(A.QL, `select app.child_create('${HH1}', 'bé Mít', p_grade => 3) ->> 'child_id' as cid \\gset
      select mode from app.children where id = :'cid';
      select app.mode_set(:'cid', 'PARENT_LED');
      select app.mode_set(:'cid', 'CHILD_EXECUTED');
      select app.mode_set(:'cid', 'UNSET');
      select mode || ':' || mode_epoch from app.children where id = :'cid';
      select old_mode || '>' || new_mode || ':' || (changed_by = '${MEM_HOA}') from app.mode_history where child_id = :'cid' order by at, new_mode desc`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], 'UNSET');
    assert.deepEqual([1, 2, 3].map((i) => JSON.parse(r.rows[i]).changed), [true, true, true]);
    assert.equal(JSON.parse(r.rows[1]).old_mode, 'UNSET');
    assert.equal(r.rows[4], 'UNSET:4');
    assert.equal(r.rows.slice(5).length, 3);
    assert.ok(r.rows.slice(5).every((x) => x.endsWith(':true')));
  });

  it('FN-MODE-04: hàm ghi mode_history đúng một dòng mỗi lần đổi; chỉ QL đọc được lịch sử', () => {
    const r = run(A.QL, `select app.mode_set('${NA}', 'PARENT_LED'); select count(*) from app.mode_history where child_id='${NA}';
      ${as('NL')} select count(*) from app.mode_history;
      ${as('CON')} select count(*) from app.mode_history;
      ${as('HO_KHAC')} select count(*) from app.mode_history`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(1), ['2', '0', '0', '0']);
  });

  it('FN-MODE-05: hộ đóng băng -> FROZEN; hồ sơ ẩn -> NOT_FOUND', () => {
    FROZEN(run(A.QL, `select app.mode_set('${NA}', 'PARENT_LED')`, { setup: FREEZE }));
    NOT_FOUND(run(A.QL, `select app.mode_set('${NA}', 'PARENT_LED')`, { setup: `update app.children set hidden_at=now() where id='${NA}';` }));
  });

  it('FN-MODE-06: không đường vòng - child_update không đổi được mode; ghi trực tiếp bị từ chối; ràng buộc CSDL chặn CHILD_DIRECTED', () => {
    VALIDATION(run(A.QL, `select app.child_update('${NA}', '{"mode": "PARENT_LED"}')`));
    const w = run(A.QL, `update app.children set mode = 'PARENT_LED' where id = '${NA}'`);
    assert.equal(w.code, '42501');
    const d = admin(`update app.children set mode = 'CHILD_DIRECTED' where id = '${NA}'`);
    assert.equal(d.code, '23514');
  });
});
