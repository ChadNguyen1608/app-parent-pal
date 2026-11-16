// Test T2.6 (D-66): ghi chú sức khỏe trong hồ sơ con - đồng ý riêng MD-SUCKHOE, đọc/ghi theo vai, máy con không đọc, audit không nội dung.
// Mã: HLT-READ, HLT-CONSENT, HLT-ADD, HLT-UPD, HLT-DEL, HLT-DIRECT, HLT-AUDIT, HLT-USE. Chạy cùng các test khác bởi scripts/db-test.sh.
// Dữ liệu: chỉ tên giả và ghi chú giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const SU = '00000000-0000-4000-8000-000000000303';
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const MEM_MINH = '00000000-0000-4000-8000-000000000202';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\n`;
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;
const FREEZE = `update app.households set state='DONG_BANG', frozen_at=now() where id='${HH1}';`;
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

const add = (child, kind, content, extra = '') => `select app.health_note_add('${child}', '${kind}', '${content}'${extra})`;
const NID = `reset role;\nselect id as nid from app.child_health_notes where child_id = '${NA}' limit 1 \\gset\nset local role authenticated;\n`;
const FIRST = `(select id from app.child_health_notes where child_id = '${NA}' limit 1)`;
const upd = (patch, id = FIRST) => `select app.health_note_update(${id}, '${patch}'::jsonb)`;
const del = (id = FIRST) => `select app.health_note_delete(${id})`;
const count = `select count(*) from app.child_health_notes`;
const consent = (child, ev = 'DONG_Y') => `select app.consent_record('${child}', 'MD-SUCKHOE', '${ev}')`;
const GRANT_NL = `insert into app.grants (member_id, child_id, resource, action, purpose_code) values ('${MEM_MINH}', '${NA}', 'health', 'view', 'MD-SUCKHOE');`;

describe('HLT-READ: ai đọc được ghi chú sức khỏe (D-66)', { skip }, () => {
  it('HLT-READ-01: QL đọc (seed: 1 ghi chú của bé Na); NL không có grant MD-SUCKHOE thì không; máy con không; hộ khác không; anon bị từ chối', () => {
    assert.equal(run(QL, count).rows[0], '1');
    assert.equal(run(NL, count).rows[0], '0');
    assert.equal(run(DEV_NA, count).rows[0], '0');
    assert.equal(run(HK, count).rows[0], '0');
    const a = run(ANON, count);
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
  });
  it('HLT-READ-02: NL CHỈ đọc khi có grant MD-SUCKHOE (mô hình grants hiện có); grant MD-LICH không đủ; đóng băng thì NL không đọc, QL vẫn đọc', () => {
    assert.equal(run(NL, count, { setup: GRANT_NL }).rows[0], '1');
    assert.equal(run(NL, count, { setup: `${GRANT_NL} update app.grants set state = 'THU_HOI' where purpose_code = 'MD-SUCKHOE';` }).rows[0], '0');
    assert.equal(run(NL, count, { setup: `${GRANT_NL} ${FREEZE}` }).rows[0], '0');
    assert.equal(run(QL, count, { setup: FREEZE }).rows[0], '1');
  });
  it('HLT-READ-03: máy con KHÔNG đọc dù được cấp grant MD-SUCKHOE cho chính máy con (chính sách đòi người lớn của hộ); không thấy cả dòng trạng thái đồng ý MD-SUCKHOE', () => {
    const grantToDevice = `insert into app.members (id, household_id, user_id, role, call_name) values ('00000000-0000-4000-8000-0000000009a1', '${HH1}', '${DEV_NA.sub}', 'OBSERVER', 'x') on conflict do nothing;`;
    void grantToDevice;
    assert.equal(run(DEV_NA, count).rows[0], '0');
    assert.equal(run(DEV_NA, `select count(*) from app.purpose_state where purpose_code = 'MD-SUCKHOE'`).rows[0], '0');
    assert.equal(run(DEV_NA, `select count(*) from app.purpose_state where purpose_code = 'MD-LICH'`).rows[0], '1');
    assert.equal(run(QL, `select count(*) from app.purpose_state where purpose_code = 'MD-SUCKHOE'`).rows[0], '1');
  });
  it('HLT-READ-04: hồ sơ con bị ẩn (rút toàn bộ, xóa) thì ghi chú cũng không đọc được', () => {
    assert.equal(run(QL, count, { setup: `update app.children set hidden_at = now() where id = '${NA}';` }).rows[0], '0');
  });
});

describe('HLT-CONSENT: đồng ý riêng MD-SUCKHOE (D-66; BR-CON-001; AC-CON-07)', { skip }, () => {
  it('HLT-CONSENT-01: chưa đồng ý -> không thêm được (FORBIDDEN D-66); đồng ý rồi thêm và đọc được', () => {
    FORBIDDEN(run(QL, add(BIN, 'DI_UNG', 'Di ung phan hoa gia')), 'D-66');
    const r = run(QL, `${consent(BIN)}; ${add(BIN, 'DI_UNG', 'Di ung phan hoa gia')}; select count(*) from app.child_health_notes where child_id = '${BIN}'`);
    assert.equal(J(r, 1).note.kind, 'DI_UNG');
    assert.equal(r.rows[2], '1');
  });
  it('HLT-CONSENT-02: rút MD-SUCKHOE -> ghi chú ẩn ngay với QL; yêu cầu xóa phần sức khỏe vào hàng chờ; hồ sơ con và MD-LICH nguyên', () => {
    const r = run(QL, `${consent(NA, 'RUT')}; ${count};
      ${adm(`select scope || ':' || state || ':' || reason from app.deletion_requests where child_id = '${NA}'`)};
      ${adm(`select count(*) from app.child_health_notes where child_id = '${NA}'`)};
      ${adm(`select app_internal.purpose_effective('${NA}', 'MD-LICH')`)}`);
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[2], 'SUC_KHOE:CHO_QUYET_HAN:RUT_SUC_KHOE');
    assert.equal(r.rows[3], '1', 'dòng còn trong bảng (chờ xóa), chỉ bị ẩn');
    assert.equal(r.rows[4], 't');
  });
  it('HLT-CONSENT-03: đồng ý lại KHÔNG làm ghi chú cũ hiện lại; ghi chú mới (sau đồng ý lại) hiện', () => {
    const r = run(QL, `${consent(NA, 'RUT')}; ${consent(NA)}; ${count}; ${add(NA, 'THUOC', 'Thuoc gia B')}; ${count}`);
    assert.equal(r.rows[2], '0');
    assert.equal(r.rows[4], '1');
  });
  it('HLT-CONSENT-04: sau khi rút, KHÔNG thêm, KHÔNG sửa nội dung, KHÔNG bật lại; nhưng tắt và xóa (thu hẹp) vẫn được', () => {
    FORBIDDEN(run(QL, `${consent(NA, 'RUT')}; ${add(NA, 'KHAC', 'x')}`), 'D-66');
    const NIDQ = `:'nid'::uuid`;
    FORBIDDEN(run(QL, `${NID}${consent(NA, 'RUT')}; ${upd('{"content": "x"}', NIDQ)}`), 'D-66');
    FORBIDDEN(run(QL, `${NID}${consent(NA, 'RUT')}; ${upd('{"active": true}', NIDQ)}`), 'D-66');
    const off = run(QL, `${NID}${consent(NA, 'RUT')}; ${upd('{"active": false}', NIDQ)}`);
    assert.equal(J(off, 1).note.active, false);
    const gone = run(QL, `${NID}${consent(NA, 'RUT')}; ${del(NIDQ)}; ${adm(count)}`);
    assert.equal(J(gone, 1).deleted, true);
    assert.equal(gone.rows[2], '0');
  });
  it('HLT-CONSENT-05: mục lõi tắt (đã rút toàn bộ) thì mục riêng không hiệu lực: không thêm được', () => {
    const noCore = `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
      select '${HH1}', '${BIN}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1;`;
    NOT_FOUND(run(QL, add(BIN, 'KHAC', 'x'), { setup: `${noCore} update app.children set hidden_at = now() where id = '${BIN}';` }));
    FORBIDDEN(run(QL, `${consent(BIN)}; ${add(BIN, 'KHAC', 'x')}`, { setup: noCore }), 'D-66');
  });
});

describe('HLT-ADD: thêm ghi chú với nguồn (D-66)', { skip }, () => {
  it('HLT-ADD-01: ghi người khai (member), vai tại thời điểm khai, ngày khai mặc định hôm nay theo giờ VN, active=true', () => {
    const r = run(QL, `${add(NA, 'DI_UNG', 'Di ung tom gia')};
      ${adm(`select (declared_by_member_id = '${MEM_HOA}') || ':' || declared_by_role || ':' || (declared_at = (now() at time zone 'Asia/Ho_Chi_Minh')::date) || ':' || active || ':' || coalesce(source_note, '-')
        from app.child_health_notes where content = 'Di ung tom gia'`)}`);
    const o = J(r).note;
    assert.equal(o.declared_by_role, 'PRIMARY');
    assert.equal(o.active, true);
    assert.equal(r.rows[1], 'true:PRIMARY:true:true:-');
  });
  it('HLT-ADD-02: ngày khai sửa được (không ở tương lai), nguồn tùy chọn; trim khoảng trắng', () => {
    const r = run(QL, `${add(NA, 'KHAC', '  Kham gia  ', `, '2026-01-05', 'theo giay kham'`)}`);
    const o = J(r).note;
    assert.equal(o.declared_at, '2026-01-05');
    assert.equal(o.source_note, 'theo giay kham');
    assert.equal(o.content, 'Kham gia');
    VALIDATION(run(QL, add(NA, 'KHAC', 'x', `, '2999-01-01'`)), 'D-66');
  });
  it('HLT-ADD-03: kiểm đầu vào: loại lạ, nội dung rỗng hoặc quá 500 ký tự, nguồn quá 200; tối đa 50 ghi chú mỗi con', () => {
    VALIDATION(run(QL, add(NA, 'LA', 'x')), 'D-66');
    VALIDATION(run(QL, add(NA, 'KHAC', '   ')), 'D-66');
    VALIDATION(run(QL, add(NA, 'KHAC', 'a'.repeat(501))), 'D-66');
    assert.ok(run(QL, add(NA, 'KHAC', 'a'.repeat(500))).ok);
    VALIDATION(run(QL, add(NA, 'KHAC', 'x', `, null, '${'s'.repeat(201)}'`)), 'D-66');
    const full = run(QL, `do $f$ begin for i in 1..49 loop perform app.health_note_add('${NA}', 'KHAC', 'g' || i); end loop; end $f$; ${add(NA, 'KHAC', 'thu 51')}`);
    VALIDATION(full, 'D-66');
  });
  it('HLT-ADD-04: chỉ QL: NL FORBIDDEN (kể cả có grant), máy con FORBIDDEN, hộ khác NOT_FOUND, chưa đăng nhập, anon; đóng băng FROZEN', () => {
    FORBIDDEN(run(NL, add(NA, 'KHAC', 'x'), { setup: GRANT_NL }));
    FORBIDDEN(run(DEV_NA, add(NA, 'KHAC', 'x')), 'C-07');
    NOT_FOUND(run(HK, add(NA, 'KHAC', 'x')));
    NOT_FOUND(run(QL, add(SU, 'KHAC', 'x')));
    UNAUTH(run({ role: 'authenticated' }, add(NA, 'KHAC', 'x')));
    assert.equal(run(ANON, add(NA, 'KHAC', 'x')).code, '42501');
    FROZEN(run(QL, add(NA, 'KHAC', 'x'), { setup: FREEZE }));
  });
});

describe('HLT-UPD: sửa, bật/tắt (D-66)', { skip }, () => {
  it('HLT-UPD-01: sửa loại, nội dung, ngày, nguồn (null xóa nguồn); người khai KHÔNG đổi; bật/tắt không xóa dữ liệu', () => {
    const r = run(QL, `${upd('{"kind": "THUOC", "content": " Thuoc moi ", "declared_at": "2026-02-02", "source_note": null}')};
      ${upd('{"active": false}')}; ${upd('{"active": true}')}`);
    const o = J(r, 0).note;
    assert.deepEqual([o.kind, o.content, o.declared_at, o.source_note, o.declared_by_member_id, o.declared_by_role],
      ['THUOC', 'Thuoc moi', '2026-02-02', null, MEM_HOA, 'PRIMARY']);
    assert.equal(J(r, 1).note.active, false);
    assert.equal(J(r, 1).note.content, 'Thuoc moi');
    assert.equal(J(r, 2).note.active, true);
  });
  it('HLT-UPD-02: khóa lạ (kể cả declared_by, child_id, id), patch rỗng, kiểu sai: VALIDATION; ghi chú không có: NOT_FOUND', () => {
    for (const p of ['{"declared_by_role": "OBSERVER"}', '{"child_id": "x"}', '{"id": "x"}', '{}', '{"kind": "LA"}', '{"content": ""}', '{"active": "yes"}',
      '{"declared_at": "2999-01-01"}', '{"declared_at": "hom qua"}', '{"source_note": 5}']) {
      VALIDATION(run(QL, upd(p)), 'D-66');
    }
    NOT_FOUND(run(QL, upd('{"active": false}', `'20000000-0000-4000-8000-0000000000ff'`)));
  });
  it('HLT-UPD-03: chỉ QL sửa: NL FORBIDDEN, máy con FORBIDDEN, hộ khác NOT_FOUND; đóng băng: sửa FROZEN nhưng TẮT vẫn được', () => {
    FORBIDDEN(run(NL, upd('{"content": "x"}', `(select id from app.child_health_notes limit 1)`), { setup: GRANT_NL }));
    FORBIDDEN(run(DEV_NA, upd('{"content": "x"}', `'20000000-0000-4000-8000-0000000000ff'`)), 'C-07');
    NOT_FOUND(run(HK, upd('{"content": "x"}', `(select id from app.child_health_notes limit 1)`), { setup: '' }));
    FROZEN(run(QL, upd('{"content": "x"}'), { setup: FREEZE }));
    assert.equal(J(run(QL, upd('{"active": false}'), { setup: FREEZE })).note.active, false);
  });
});

describe('HLT-DEL: xóa thật (D-66)', { skip }, () => {
  it('HLT-DEL-01: QL xóa thật một ghi chú; xóa lại NOT_FOUND; ghi chú khác còn', () => {
    const r = run(QL, `${add(NA, 'KHAC', 'ghi chu thu hai')}; ${del()}; ${count}`);
    assert.equal(J(r, 1).deleted, true);
    assert.equal(r.rows[2], '1');
    NOT_FOUND(run(QL, `${del()}; ${del(`'${J(run(QL, add(NA, 'KHAC', 'z'))).note.id}'`)}; ${del(`'20000000-0000-4000-8000-0000000000ff'`)}`));
  });
  it('HLT-DEL-02: xóa luôn được khi đóng băng; NL, máy con, hộ khác không xóa được', () => {
    assert.equal(J(run(QL, del(), { setup: FREEZE })).deleted, true);
    FORBIDDEN(run(NL, del(`(select id from app.child_health_notes limit 1)`), { setup: GRANT_NL }));
    FORBIDDEN(run(DEV_NA, del(`'20000000-0000-4000-8000-0000000000ff'`)), 'C-07');
    NOT_FOUND(run(HK, del(`(select id from app.child_health_notes limit 1)`)));
    UNAUTH(run({ role: 'authenticated' }, del()));
    assert.equal(run(ANON, del()).code, '42501');
  });
});

describe('HLT-DIRECT: không ghi trực tiếp (D-66)', { skip }, () => {
  it('HLT-DIRECT-01: authenticated (QL, NL, máy con) không insert/update/delete trực tiếp (42501)', () => {
    for (const who of [QL, NL, DEV_NA, HK]) {
      for (const sql of [`insert into app.child_health_notes (child_id, kind, content, declared_by_member_id, declared_by_role) values ('${NA}', 'KHAC', 'x', '${MEM_HOA}', 'PRIMARY')`,
        `update app.child_health_notes set content = 'x'`, `delete from app.child_health_notes`]) {
        const r = run(who, sql);
        assert.equal(r.ok, false);
        assert.equal(r.code, '42501', sql);
      }
    }
  });
  it('HLT-DIRECT-02: ràng buộc bảng: loại, vai, nội dung, nguồn', () => {
    const ins = (kind, role, content, src = 'null') => admin(`insert into app.child_health_notes (child_id, kind, content, declared_by_member_id, declared_by_role, source_note)
      values ('${NA}', '${kind}', '${content}', '${MEM_HOA}', '${role}', ${src})`);
    assert.equal(ins('LA', 'PRIMARY', 'x').code, '23514');
    assert.equal(ins('KHAC', 'ADMIN', 'x').code, '23514');
    assert.equal(ins('KHAC', 'PRIMARY', '   ').code, '23514');
    assert.equal(ins('KHAC', 'PRIMARY', 'x', `'   '`).code, '23514');
    assert.ok(ins('KHAC', 'PRIMARY', 'x').ok);
  });
});

describe('HLT-AUDIT: audit health.* KHÔNG kèm nội dung (D-66)', { skip }, () => {
  it('HLT-AUDIT-01: thêm, sửa, xóa ghi health.added/updated/deleted; meta rỗng; subject chỉ child:mã; nội dung không xuất hiện trong audit_log', () => {
    const r = run(QL, `${add(NA, 'DI_UNG', 'Noidungnhaycam123', `, null, 'nguonnhaycam456'`)}; ${upd('{"content": "Noidungsuamoi789"}', `(select id from app.child_health_notes where content = 'Noidungnhaycam123')`)};
      ${del(`(select id from app.child_health_notes where content = 'Noidungsuamoi789')`)};
      ${adm(`select string_agg(event_code || '|' || actor_kind || '|' || subject_ref || '|' || meta::text, ';' order by at, id) from app.audit_log where event_code like 'health.%' and actor_kind = 'adult' and at > now() - interval '1 minute'`)};
      ${adm(`select count(*) from app.audit_log a where a::text ~* '(Noidung|nguonnhaycam|nhaycam|suamoi)'`)}`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[3], `health.added|adult|child:${NA}|{};health.updated|adult|child:${NA}|{};health.deleted|adult|child:${NA}|{}`);
    assert.equal(r.rows[4], '0');
  });
  it('HLT-AUDIT-02: sửa không đổi gì thì không ghi audit; danh mục sự kiện không cho khóa meta nào', () => {
    const r = run(QL, `${upd('{"active": true}')}; ${adm(`select count(*) from app.audit_log where event_code = 'health.updated'`)}`);
    assert.equal(r.rows[1], '0');
    const k = admin(`select string_agg(event_code || ':' || cardinality(allowed_meta_keys), ',' order by event_code) from private.audit_events where event_code like 'health.%'`);
    assert.equal(k.rows[0], 'health.added:0,health.deleted:0,health.updated:0');
    const bad = admin(`insert into app.audit_log (household_id, actor_kind, event_code, subject_ref, meta) values ('${HH1}', 'system', 'health.added', 'child:${NA}', '{"content": "x"}')`);
    assert.equal(bad.code, '23514');
  });
});

describe('HLT-USE: nấc 1 chỉ lưu và hiển thị - không hàm nào khác dùng ghi chú sức khỏe (D-66)', { skip }, () => {
  it('HLT-USE-01: chỉ health_note_*, purge_household, purge_child nhắc tới bảng child_health_notes; không view, không chính sách chéo bảng', () => {
    const r = admin(`select n.nspname || '.' || p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where p.prosrc ~ 'child_health_notes' and n.nspname in ('app', 'private', 'app_internal') order by 1`);
    assert.deepEqual(r.rows, ['app.health_note_add', 'app.health_note_delete', 'app.health_note_update', 'app.purge_child', 'app.purge_household']);
    const v = admin(`select count(*) from pg_depend d join pg_rewrite w on w.oid = d.objid join pg_class c on c.oid = w.ev_class
      where d.refobjid = 'app.child_health_notes'::regclass and c.relkind in ('v', 'm')`);
    assert.equal(v.rows[0], '0');
    const pol = admin(`select count(*) from pg_policies where policyname <> 'child_health_notes_select' and qual ~ 'child_health_notes'`);
    assert.equal(pol.rows[0], '0');
  });
});
