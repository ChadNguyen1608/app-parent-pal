// Test T1.8: người lớn thứ hai chỉ có khung, cờ tắt. app.member_invite luôn trả FEATURE_OFF; NL (SECONDARY) chỉ xem.
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
// Mã: MEM-INV (member_invite, cờ invites_enabled), MEM-NL (NL chỉ xem, không sửa gì). Dữ liệu: chỉ tên giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const rejected = (r, code, sqlstate) => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, sqlstate, r.err);
  assert.match(r.err, new RegExp(code));
};
const invite = (actor, opts, role = 'OBSERVER') =>
  run(actor, `select app.member_invite('${role}', array['${NA}']::uuid[], array['MD-LICH'])`, opts);
const dev = { ...A.CON, claims: { is_anonymous: true } };
const invCount = `(select count(*) from app.invitations) || ':' || (select count(*) from app.grants) || ':' || (select count(*) from app.members)`;
const FLAG_ON = `update private.params set value_int = 1 where key = 'invites_enabled';`;

describe('MEM-INV: app.member_invite - khung, cờ invites_enabled tắt (T1.8, D-35)', { skip }, () => {
  it('MEM-INV-01: cờ invites_enabled có trong private.params, giá trị 0, CHUA_CHOT', () => {
    const r = admin(`select value_int || ':' || status from private.params where key = 'invites_enabled'`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], '0:CHUA_CHOT');
  });

  it('MEM-INV-02: mọi người đăng nhập đều nhận FEATURE_OFF (403): QL, NL, máy con, hộ khác', () => {
    for (const who of ['QL', 'NL', 'HO_KHAC', 'CON_CHUA_GHEP']) {
      rejected(invite(A[who]), 'FEATURE_OFF', 'PT403');
    }
    rejected(invite(dev), 'FEATURE_OFF', 'PT403');
  });

  it('MEM-INV-03: FEATURE_OFF đến trước mọi kiểm dữ liệu - đối số sai hoặc con không tồn tại vẫn cùng phản hồi (không lộ gì)', () => {
    for (const sql of [
      `select app.member_invite('PRIMARY')`,
      `select app.member_invite('XYZ', array['00000000-0000-4000-8000-0000000009ff']::uuid[], array['MD-KHONG-CO'])`,
      `select app.member_invite(null)`,
    ]) {
      const r = run(A.QL, sql);
      rejected(r, 'FEATURE_OFF', 'PT403');
    }
    const q = run(A.QL, `select app.member_invite('OBSERVER', array['${NA}']::uuid[], array['MD-LICH'])`);
    const o = run(A.HO_KHAC, `select app.member_invite('OBSERVER', array['${NA}']::uuid[], array['MD-LICH'])`);
    assert.equal(q.err.replace(/LOCATION.*/s, ''), o.err.replace(/LOCATION.*/s, ''), 'phản hồi QL và hộ khác phải y hệt');
  });

  it('MEM-INV-04: không ghi gì (invitations, grants, members) kể cả khi lỗi', () => {
    const r = run(A.QL, `select ${invCount} as before \\gset
      do $$ begin perform app.member_invite('SUPPORTER', array['${NA}']::uuid[], array['MD-LICH']); exception when sqlstate 'PT403' then null; end $$;
      select :'before' = (${invCount})`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], 't');
  });

  it('MEM-INV-05: anon không gọi được (không có EXECUTE); chưa đăng nhập (không sub) bị UNAUTHENTICATED', () => {
    const anon = invite(A.ANON);
    assert.equal(anon.ok, false);
    assert.equal(anon.code, '42501');
    rejected(run({ role: 'authenticated' }, `select app.member_invite('OBSERVER')`), 'UNAUTHENTICATED', 'PT401');
  });

  it('MEM-INV-06: bật cờ KHÔNG đủ để mời - thân hàm chưa cài nên trả INTERNAL (fail-closed), không tạo lời mời', () => {
    const o = { setup: FLAG_ON };
    rejected(invite(A.QL, o), 'INTERNAL', 'PT500');
    rejected(invite(A.NL, o), 'INTERNAL', 'PT500');
    const r = run(A.QL, `select ${invCount} as before \\gset
      do $$ begin perform app.member_invite('OBSERVER', array['${NA}']::uuid[], array['MD-LICH']); exception when sqlstate 'PT500' then null; end $$;
      select :'before' = (${invCount})`, o);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], 't');
  });

  it('MEM-INV-07: cờ khác 1 (0, 2, -1) đều coi là tắt; thiếu dòng cờ thì INTERNAL, không bật', () => {
    for (const v of [0, 2, -1]) {
      rejected(invite(A.QL, { setup: `update private.params set value_int = ${v} where key = 'invites_enabled';` }), 'FEATURE_OFF', 'PT403');
    }
    rejected(invite(A.QL, { setup: `delete from private.params where key = 'invites_enabled';` }), 'INTERNAL', 'PT500');
  });
});

describe('MEM-NL: người lớn thứ hai (SECONDARY, anh Minh) chỉ xem theo grants, không sửa gì (T1.8, BR-FAM-004)', { skip }, () => {
  it('MEM-NL-01: NL thấy bé Na (có grant), không thấy bé Bin, không thấy lời mời, thấy grant của chính mình', () => {
    const r = run(A.NL, `select (select count(*) from app.children where id='${NA}') || ':' || (select count(*) from app.children where id='${BIN}')
      || ':' || (select count(*) from app.invitations) || ':' || (select count(*) from app.grants where child_id='${BIN}')`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], '1:0:0:0');
  });

  it('MEM-NL-02: NL gọi mọi hàm ghi nghiệp vụ đều bị từ chối, và dữ liệu không đổi', () => {
    const calls = [
      [`app.child_update('${NA}', '{"grade": 4}')`, 'FORBIDDEN'],
      [`app.child_delete('${NA}', true)`, 'FORBIDDEN'],
      [`app.mode_set('${NA}', 'PARENT_LED')`, 'FORBIDDEN'],
      [`app.child_create('${HH1}', 'bé Mít', 2)`, 'FORBIDDEN'],
    ];
    for (const [sql, code] of calls) {
      const r = run(A.NL, `select ${sql}`);
      assert.equal(r.ok, false, `NL chạy được: ${sql}`);
      assert.match(r.err, new RegExp(code), `${sql}: ${r.err}`);
    }
    const snap = `(select md5(string_agg(c::text, ',' order by c.id)) from app.children c) || ':' || (select count(*) from app.grants)`;
    const r = run(A.NL, `select ${snap} as before \\gset
      do $$ begin
        begin perform app.child_update('${NA}', '{"grade": 4}'); exception when others then null; end;
        begin perform app.mode_set('${NA}', 'PARENT_LED'); exception when others then null; end;
        begin perform app.member_invite('OBSERVER'); exception when others then null; end;
      end $$;
      select :'before' = (${snap})`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], 't');
  });

  it('MEM-NL-03: NL không đặt PIN, không tạo mã ghép máy, không hủy liên kết máy (chỉ QL)', () => {
    for (const sql of [
      `select app.pin_set('482916')`,
      `select app.pair_code_create()`,
      `select app.unlink_device('${NA}', '482916', null)`,
    ]) {
      const r = run(A.NL, sql);
      assert.equal(r.ok, false, `NL chạy được: ${sql}`);
      assert.ok(r.code !== null, sql);
      assert.doesNotMatch(r.err, /INTERNAL/, `${sql}: ${r.err}`);
    }
  });

  it('MEM-NL-04: NL ghi trực tiếp vào bảng nào cũng bị từ chối (42501), kể cả invitations/members/grants', () => {
    for (const t of ['invitations', 'members', 'grants', 'children', 'households', 'device_bindings', 'mode_history']) {
      for (const sql of [`insert into app.${t} default values`, `update app.${t} set id = id`, `delete from app.${t}`]) {
        const r = run(A.NL, sql);
        assert.equal(r.ok, false, `NL chạy được: ${sql}`);
        assert.equal(r.code, '42501', `${sql} → ${r.code}`);
      }
    }
  });

  it('MEM-NL-05: grant bị thu hồi / REVIEW_REQUIRED thì NL mất quyền xem ngay (fail-closed)', () => {
    for (const st of ['REVIEW_REQUIRED', 'THU_HOI']) {
      const r = run(A.NL, `select count(*) from app.children where id='${NA}'`, { setup: `update app.grants set state='${st}' where child_id='${NA}';` });
      assert.ok(r.ok, r.err);
      assert.equal(r.rows[0], '0', st);
    }
  });
});
