// Test T2.1, T2.2, T2.7 (D-64, D-66): sổ đồng ý chỉ-thêm, purpose_state, mục lõi gộp + mục riêng (MD-SUCKHOE), rút, rút toàn bộ hai bước,
// đồng ý của con, cài đặt của con, trạng thái hộ cho máy con.
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
// Mã: CON-01..08, CON-22 (AC-CON-xx của BL 11.3), CON-D58 (mục đích thứ 8), CON-WA (AC-CON-06), CON-CHILD (đồng ý của con),
// CON-SET (cài đặt), CON-FAM (my_family_state), RLS-PURPOSE (Tech Spec §6.2).
// AC-CON-04 (vô hiệu CR khi rút) CHƯA kiểm được: bảng change_requests ở T4.3. Dữ liệu: chỉ tên giả.
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
const BIND_NA = '00000000-0000-4000-8000-000000000401';
const U_NA = '00000000-0000-4000-8000-0000000000a3';
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
const FEATURE_OFF = (r) => rejected(r, 'FEATURE_OFF', 'PT403');
const UNAUTH = (r) => rejected(r, 'UNAUTHENTICATED', 'PT401');

const rec = (child, code, ev, extra = '') => `select app.consent_record('${child}', '${code}', '${ev}'${extra})`;
const eff = (child, code) => `select app_internal.purpose_effective('${child}', '${code}')`;
const state = (child, code) => `select coalesce((select state from app.purpose_state where child_id='${child}' and purpose_code='${code}'), 'CHUA_HOI')`;
const canP = (who, child, code) => run(who, `select app_internal.can('${who.sub}', 'child.view', '${child}', '${code}')`);
const ledger = (child) => `select string_agg(purpose_code || ':' || event || ':' || origin || ':' || (subject_member_id is not null), ',' order by at, id) from app.consent_events where child_id='${child}'`;

// ================================================================ CON-01: đồng ý theo mục đích, mục riêng không chọn sẵn
describe('CON-01: mục lõi gộp + mục riêng, không chọn sẵn (AC-CON-01; BR-CON-001, D-64)', { skip }, () => {
  it('CON-01a: bé Na bật MD-LICH và MD-SUCKHOE (seed); MD-CONBAO tắt; bé Bin chỉ MD-LICH (không có dòng = CHUA_HOI)', () => {
    const r = run(QL, [eff(NA, 'MD-LICH'), eff(NA, 'MD-SUCKHOE'), eff(NA, 'MD-CONBAO'), eff(BIN, 'MD-LICH'), eff(BIN, 'MD-SUCKHOE'),
      eff(BIN, 'MD-CONBAO')].map((q) => adm(q) + ';').join('\n'));
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, ['t', 't', 'f', 't', 'f', 'f']);
  });

  it('CON-01b: app.can theo mục đích: chỉ mục đang bật; QL và máy con cùng bị từ chối với mục chưa đồng ý', () => {
    assert.equal(canP(QL, NA, 'MD-LICH').rows[0], 't');
    assert.equal(canP(QL, NA, 'MD-SUCKHOE').rows[0], 't');
    assert.equal(canP(QL, BIN, 'MD-SUCKHOE').rows[0], 'f');
    assert.equal(canP(QL, NA, 'MD-CONBAO').rows[0], 'f');
    assert.equal(canP(DEV_NA, NA, 'MD-LICH').rows[0], 't');
    assert.equal(canP(DEV_NA, NA, 'MD-CONBAO').rows[0], 'f', 'máy con không dùng mục chưa bật');
    assert.equal(canP(NL, NA, 'MD-LICH').rows[0], 't');
  });

  it('CON-01c: hồ sơ con mới tạo không có dòng purpose_state nào (mục riêng không chọn sẵn)', () => {
    const r = run(QL, `select (app.child_create('${HH1}', 'bé Mít', 3)->>'child_id')::uuid as nc \\gset
      ${adm(`select count(*) from app.purpose_state where child_id = :'nc'; select count(*) from app.consent_events where child_id = :'nc'`)}`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(-2), ['0', '0']);
  });

  it('CON-01d: đồng ý ghi sổ: người ghi, phiên bản chính sách, SELF_DECLARED, giờ máy chủ', () => {
    const r = run(QL, `${rec(BIN, 'MD-SUCKHOE', 'DONG_Y')};
      ${adm(`select method || ':' || (actor_member_id = '${MEM_HOA}') || ':' || (subject_member_id is null) || ':' || origin
        || ':' || (policy_version_id is not null) || ':' || by_child from app.consent_events where child_id='${BIN}' and purpose_code='MD-SUCKHOE'`)}`);
    const o = J(r);
    assert.equal(o.changed, true);
    assert.equal(o.state, 'DANG_BAT');
    assert.equal(o.effective, true);
    assert.equal(r.rows[1], 'SELF_DECLARED:true:true:MOT_MUC:true:false');
  });

  it('CON-01e: gửi lặp cùng khóa trả replay, không ghi thêm; cùng trạng thái thì changed=false', () => {
    const k = '20000000-0000-4000-8000-000000000001';
    const r = run(QL, `${rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_idempotency_key => '${k}'`)};
      ${rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_idempotency_key => '${k}'`)};
      ${rec(BIN, 'MD-SUCKHOE', 'DONG_Y')};
      ${adm(`select count(*) from app.consent_events where child_id='${BIN}' and purpose_code='MD-SUCKHOE'`)}`);
    assert.equal(J(r, 0).replay, false);
    assert.equal(J(r, 1).replay, true);
    assert.equal(J(r, 2).changed, false);
    assert.equal(r.rows[3], '1');
    // cùng khóa nhưng con khác: không được dùng lại
    VALIDATION(run(QL, `${rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_idempotency_key => '${k}'`)}; ${rec(NA, 'MD-SUCKHOE', 'RUT', `, p_idempotency_key => '${k}'`)}`));
  });

  it('CON-01f: kiểm đầu vào - sự kiện lạ, mục đích lạ (kể cả mã đã gộp), mã phiếu có khoảng trắng, phiên bản chính sách lạ', () => {
    VALIDATION(run(QL, rec(BIN, 'MD-SUCKHOE', 'XYZ')));
    VALIDATION(run(QL, rec(BIN, 'MD-KHONG-CO', 'DONG_Y')));
    VALIDATION(run(QL, rec(BIN, 'MD-MET', 'DONG_Y')));
    VALIDATION(run(QL, rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_paper_ref => 'nguyen van a'`)));
    VALIDATION(run(QL, rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_policy_version_id => '20000000-0000-4000-8000-0000000000ff'`)));
    const ok = run(QL, rec(BIN, 'MD-SUCKHOE', 'DONG_Y', `, p_paper_ref => 'PHIEU-001'`));
    assert.ok(ok.ok, ok.err);
  });

  it('CON-01g: danh mục gọn (D-64): chỉ còn mã lõi MD-LICH + hai mục riêng; các mã tính năng cũ không còn; không còn cơ chế phụ thuộc', () => {
    const r = run(QL, `select string_agg(code, ',' order by code) from app.purposes;
      select count(*) from app.consent_events where origin not in ('MOT_MUC', 'RUT_TOAN_BO');
      select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('app', 'private', 'app_internal') and p.prosrc ~ 'PHU_THUOC|depends_on'`);
    assert.deepEqual(r.rows, ['MD-CONBAO,MD-LICH,MD-SUCKHOE', '0', '0']);
    const o = admin(`insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, origin, policy_version_id)
      select '${HH1}', '${NA}', 'MD-SUCKHOE', 'RUT', '${MEM_HOA}', 'PHU_THUOC', id from app.policy_versions limit 1`);
    assert.equal(o.ok, false, 'origin PHU_THUOC không còn');
    assert.equal(o.code, '23514');
  });
});

// ================================================================ CON-02/03: rút một mục riêng, lõi không rút riêng
describe('CON-02/03: rút một mục riêng; mục lõi chỉ rút toàn bộ (AC-CON-02; BR-CON-021, 026)', { skip }, () => {
  it('CON-02: rút MD-SUCKHOE: mục tắt, một sự kiện rút trong sổ, hồ sơ và mode của con không đổi, MD-LICH vẫn bật', () => {
    const snap = `select md5(c::text) from app.children c where id='${NA}'`;
    const r = run(QL, `${adm(snap)};${rec(NA, 'MD-SUCKHOE', 'RUT')};${adm(snap)};${adm(eff(NA, 'MD-SUCKHOE'))};${adm(eff(NA, 'MD-LICH'))};
      ${adm(`select count(*) from app.consent_events where child_id='${NA}' and purpose_code='MD-SUCKHOE' and event='RUT'`)}`);
    assert.ok(r.ok, r.err);
    const [h0, o, h1, sk, lich, nRut] = r.rows;
    assert.equal(h0, h1, 'rút MD-SUCKHOE không đổi hồ sơ/lịch của con');
    assert.equal(JSON.parse(o).state, 'DA_RUT');
    assert.deepEqual([sk, lich, nRut], ['f', 't', '1']);
  });

  it('CON-02b: rút MD-SUCKHOE tạo yêu cầu xóa phần sức khỏe (SUC_KHOE, CHO_QUYET_HAN); rút lặp không tạo thêm; con vẫn còn', () => {
    const r = run(QL, `${rec(NA, 'MD-SUCKHOE', 'RUT')}; ${rec(NA, 'MD-SUCKHOE', 'RUT')};
      ${adm(`select scope || ':' || state || ':' || reason || ':' || (due_at is null) || ':' || (requested_by = '${MEM_HOA}') from app.deletion_requests where child_id='${NA}'`)};
      ${adm(`select count(*) from app.deletion_requests where child_id='${NA}'`)};
      ${adm(`select state || ':' || (hidden_at is null) from app.children where id='${NA}'`)}`);
    assert.equal(J(r, 0).changed, true);
    assert.equal(J(r, 1).changed, false);
    assert.deepEqual(r.rows.slice(2), ['SUC_KHOE:CHO_QUYET_HAN:RUT_SUC_KHOE:true:true', '1', 'HOAT_DONG:true']);
  });

  it('CON-03: rút mục LÕI MD-LICH ở cấp con bị từ chối (BR-CON-026): phải dùng rút toàn bộ', () => {
    VALIDATION(run(QL, rec(NA, 'MD-LICH', 'RUT')), 'BR-CON-026');
  });

  it('CON-03b: mục riêng chỉ hiệu lực khi mục lõi bật: lõi tắt thì MD-SUCKHOE tắt theo (không cần mục "cha")', () => {
    const r = run(QL, `${adm(`insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
        select '${HH1}', '${NA}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1`)};
      ${adm(eff(NA, 'MD-LICH'))};${adm(eff(NA, 'MD-SUCKHOE'))};${adm(state(NA, 'MD-SUCKHOE'))}`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, ['f', 'f', 'DANG_BAT']);
  });

  it('CON-03c: đồng ý MD-SUCKHOE khi lõi chưa bật được ghi nhưng KHÔNG hiệu lực (tính động)', () => {
    const r = run(QL, `${rec(BIN, 'MD-SUCKHOE', 'DONG_Y')};${adm(`insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
        select '${HH1}', '${BIN}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1`)};${adm(eff(BIN, 'MD-SUCKHOE'))};${adm(state(BIN, 'MD-SUCKHOE'))}`);
    assert.equal(J(r).effective, true);
    assert.deepEqual(r.rows.slice(-2), ['f', 'DANG_BAT']);
  });
});

// ================================================================ CON-05: quyền ghi
describe('CON-05: ai ghi đồng ý (AC-CON-05; BR-CON-007, 020)', { skip }, () => {
  it('CON-05a: NL (anh Minh) rút/ghi đồng ý theo con của chị Hoa -> FORBIDDEN, sổ không đổi', () => {
    FORBIDDEN(run(NL, rec(NA, 'MD-SUCKHOE', 'RUT')));
    FORBIDDEN(run(NL, rec(NA, 'MD-SUCKHOE', 'DONG_Y')));
    FORBIDDEN(run(NL, `${rec(NA, 'MD-SUCKHOE', 'RUT', ', p_for_self => false')}`));
    const n = admin(`select count(*) from app.consent_events where actor_member_id = '${MEM_MINH}'`);
    assert.equal(n.rows[0], '0');
  });

  it('CON-05b: NL rút đồng ý của CHÍNH MÌNH được: ghi sổ có subject, purpose_state của con không đổi, grant của anh bị thu hồi', () => {
    const r = run(NL, `${rec(NA, 'MD-LICH', 'RUT', ', p_for_self => true')};
      ${adm(`select state from app.purpose_state where child_id='${NA}' and purpose_code='MD-LICH'`)};
      ${adm(`select state from app.grants where child_id='${NA}'`)};
      ${adm(`select actor_member_id = '${MEM_MINH}' and subject_member_id = '${MEM_MINH}' from app.consent_events where actor_member_id='${MEM_MINH}'`)}`);
    const o = J(r);
    assert.equal(o.scope, 'SELF');
    assert.equal(o.changed, true);
    assert.deepEqual(r.rows.slice(1), ['DANG_BAT', 'THU_HOI', 't']);
    const gone = run(NL, `select count(*) from app.children where id='${NA}'`, { setup: `update app.grants set state='THU_HOI';` });
    assert.equal(gone.rows[0], '0');
  });

  it('CON-05c: NL rút của mình hai lần: lần hai changed=false; NL xem được dòng sổ của mình, không thấy dòng của chị Hoa', () => {
    const r = run(NL, `${rec(NA, 'MD-SUCKHOE', 'RUT', ', p_for_self => true')};${rec(NA, 'MD-SUCKHOE', 'RUT', ', p_for_self => true')};
      select count(*) from app.consent_events; select count(*) from app.consent_events where subject_member_id is null`);
    assert.equal(J(r, 1).changed, false);
    assert.deepEqual(r.rows.slice(2), ['1', '0']);
  });

  it('CON-05d: máy con không ghi đồng ý (kể cả for_self); người ngoài hộ NOT_FOUND; chưa đăng nhập UNAUTHENTICATED; anon không có EXECUTE', () => {
    FORBIDDEN(run(DEV_NA, rec(NA, 'MD-SUCKHOE', 'RUT')), 'BR-CON-020');
    FORBIDDEN(run(DEV_NA, rec(NA, 'MD-SUCKHOE', 'RUT', ', p_for_self => true')), 'BR-CON-020');
    NOT_FOUND(run(HK, rec(NA, 'MD-SUCKHOE', 'RUT')));
    NOT_FOUND(run(QL, rec(SU, 'MD-SUCKHOE', 'RUT')));
    NOT_FOUND(run(NL, rec(BIN, 'MD-LICH', 'RUT', ', p_for_self => true')));
    UNAUTH(run({ role: 'authenticated' }, rec(NA, 'MD-SUCKHOE', 'RUT')));
    const a = run(ANON, rec(NA, 'MD-SUCKHOE', 'RUT'));
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
  });

  it('CON-05e: hộ đóng băng: ĐỒNG Ý mới -> FROZEN (QL và NL); RÚT luôn được (QL, rút của chính mình)', () => {
    FROZEN(run(QL, rec(BIN, 'MD-SUCKHOE', 'DONG_Y'), { setup: FREEZE }));
    FROZEN(run(NL, rec(NA, 'MD-LICH', 'DONG_Y', ', p_for_self => true'), { setup: FREEZE }));
    const rut = run(QL, rec(NA, 'MD-SUCKHOE', 'RUT'), { setup: FREEZE });
    assert.equal(J(rut).changed, true, 'QL rút được khi đóng băng (D-64)');
    const self = run(NL, rec(NA, 'MD-LICH', 'RUT', ', p_for_self => true'), { setup: FREEZE });
    assert.equal(J(self).changed, true, 'NL rút phần của mình được khi đóng băng (D-64)');
    FORBIDDEN(run(NL, rec(NA, 'MD-SUCKHOE', 'RUT'), { setup: FREEZE }));
  });
});

// ================================================================ CON-07, RLS-PURPOSE: dữ liệu cũ không hiện lại (mục riêng)
describe('CON-07 / RLS-PURPOSE: ẩn dữ liệu cũ khi rút, đồng ý lại không hiện lại (AC-CON-02, 07; D-42; BR-CON-021, 029)', { skip }, () => {
  // Bảng dữ liệu giả của MD-SUCKHOE + chính sách dùng app_internal.purpose_visible (mẫu cho bảng thật). Nằm trong giao dịch thử, không vào migration.
  const SCRATCH = `
    create table app.zz_data (id serial primary key, child_id uuid not null, label text not null, created_at timestamptz not null default clock_timestamp());
    alter table app.zz_data enable row level security;
    create policy zz_select on app.zz_data for select to authenticated
      using ((select app_internal.purpose_visible(child_id, 'MD-SUCKHOE', created_at)));
    grant select on app.zz_data to authenticated;`;
  const put = (label) => adm(`insert into app.zz_data (child_id, label) values ('${NA}', '${label}')`);
  const seen = `select coalesce(string_agg(label, ',' order by id), '-') from app.zz_data`;

  it('CON-07a: dữ liệu A (đang bật) -> rút (A ẩn ngay) -> đồng ý lại: A vẫn ẩn, dữ liệu mới B hiện', () => {
    const r = run(QL, `${put('A')}${seen};
      ${rec(NA, 'MD-SUCKHOE', 'RUT')};${seen};
      ${rec(NA, 'MD-SUCKHOE', 'DONG_Y')};${seen};${put('B')}${seen}`, { setup: SCRATCH });
    assert.ok(r.ok, r.err);
    const out = r.rows.filter((x) => !x.startsWith('{'));
    assert.deepEqual(out, ['A', '-', '-', 'B']);
  });

  it('CON-07c: đồng ý lặp khi đang bật KHÔNG đặt lại mốc (dữ liệu hiện có không biến mất)', () => {
    const r = run(QL, `${put('A')}${rec(NA, 'MD-SUCKHOE', 'DONG_Y')};${seen}`, { setup: SCRATCH });
    assert.equal(r.rows[r.rows.length - 1], 'A');
  });

  it('CON-07d: máy con và NL cũng không thấy dữ liệu của mục đã rút (qua app.can + purpose_visible); visible_from null khi không hiệu lực', () => {
    const r = run(QL, `${put('A')}${rec(NA, 'MD-SUCKHOE', 'RUT')};
      ${adm(`select app_internal.visible_from('${NA}', 'MD-SUCKHOE') is null`)};
      ${as(DEV_NA)}${seen}`, { setup: SCRATCH });
    assert.equal(r.rows[1], 't');
    assert.equal(r.rows[2], '-');
    const noRole = run(HK, `select app_internal.visible_from('${NA}', 'MD-LICH') is null`);
    assert.equal(noRole.rows[0], 't', 'người ngoài hộ không dò được mốc');
  });

  it('CON-07e: purpose_state phản ánh sổ - gấp lại sổ ra cùng trạng thái (đối chiếu sau chuỗi thao tác)', () => {
    const r = run(QL, `${rec(NA, 'MD-SUCKHOE', 'RUT')};${rec(NA, 'MD-SUCKHOE', 'DONG_Y')};${rec(NA, 'MD-SUCKHOE', 'RUT')};
      ${adm(`select count(*) from (
        select child_id, purpose_code,
          (array_agg(event order by at desc, id desc))[1] as last_event
        from app.consent_events where subject_member_id is null and not by_child group by child_id, purpose_code) f
        join app.purpose_state s using (child_id, purpose_code)
        where (f.last_event = 'DONG_Y') <> (s.state = 'DANG_BAT')`)}`);
    assert.equal(r.rows[r.rows.length - 1], '0');
  });
});

// ================================================================ CON-08: chính sách phiên bản mới
describe('CON-08: chính sách có phiên bản mới thêm mục đích (AC-CON-08; BR-CON-005)', { skip }, () => {
  const NEWPV = `insert into app.purposes (code, name_vi, kind) values ('MD-MOI', 'Mục đích mới (thử)', 'TUY_CHON');
    insert into app.policy_versions (effective_at, purposes_json, text_ref) values (now(), '[]'::jsonb, 'THU-V2');`;
  it('CON-08: mục đích mới chưa đồng ý -> không dùng được; lịch (MD-LICH) và dữ liệu cũ vẫn xem được', () => {
    const r = run(QL, `select app_internal.can('${QL.sub}', 'child.view', '${NA}', 'MD-MOI');
      select app_internal.can('${QL.sub}', 'child.view', '${NA}', 'MD-LICH');
      select count(*) from app.children where id = '${NA}'`, { setup: NEWPV });
    assert.deepEqual(r.rows, ['f', 't', '1']);
  });
  it('CON-08b: đồng ý mục mới chọn đúng bản chính sách mới nhất khi không truyền; mục đích cũ chạy tiếp, không đổi nội dung', () => {
    const r = run(QL, `${rec(NA, 'MD-MOI', 'DONG_Y')};
      ${adm(`select pv.text_ref from app.consent_events e join app.policy_versions pv on pv.id = e.policy_version_id where e.purpose_code = 'MD-MOI'`)};
      ${adm(eff(NA, 'MD-SUCKHOE'))}`, { setup: NEWPV });
    assert.deepEqual(r.rows.slice(1), ['THU-V2', 't']);
  });
  it('CON-08c: bản chính sách đầu chứa danh mục gọn, không còn khóa depends_on', () => {
    const r = admin(`select (select count(*) from jsonb_array_elements(purposes_json) e where e ? 'depends_on') || ':' || jsonb_array_length(purposes_json) from app.policy_versions order by effective_at limit 1`);
    assert.equal(r.rows[0], '0:3');
  });
});

// ================================================================ CON-22: sổ chỉ-thêm
describe('CON-22: sổ đồng ý chỉ-thêm (AC-CON-22; BR-CON-002)', { skip }, () => {
  it('CON-22a: không sửa, không xóa, không truncate - kể cả quản trị và service_role (trigger)', () => {
    for (const who of [{ role: 'admin' }, { role: 'service_role' }]) {
      for (const sql of ['update app.consent_events set event = \'RUT\'', 'delete from app.consent_events', 'truncate app.consent_events',
        'update app.policy_versions set text_ref = \'x\'', 'delete from app.policy_versions']) {
        const r = run(who, sql);
        assert.equal(r.ok, false, `${who.role}: ${sql}`);
        // truncate: FK từ purpose_state/audit chặn trước trigger (0A000); cả hai đều là từ chối
        assert.ok(r.code === '55000' || (sql.startsWith('truncate') && r.code === '0A000'), `${who.role}: ${sql} -> ${r.code}`);
      }
    }
  });
  it('CON-22b: QL (chị Hoa) gọi ghi sửa trực tiếp bị từ chối bởi quyền (42501); chỉ thêm được qua consent_record', () => {
    for (const sql of [`update app.consent_events set event = 'RUT'`, `delete from app.consent_events`,
      `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id) select household_id, child_id, purpose_code, 'RUT', actor_member_id, policy_version_id from app.consent_events`]) {
      const r = run(QL, sql);
      assert.equal(r.ok, false);
      assert.equal(r.code, '42501', sql);
    }
    assert.equal(J(run(QL, rec(BIN, 'MD-SUCKHOE', 'DONG_Y'))).changed, true);
  });
  it('CON-22c: purpose_state không ghi trực tiếp được kể cả service_role/quản trị (chỉ trigger của sổ)', () => {
    for (const who of [{ role: 'admin' }, { role: 'service_role' }]) {
      const ins = run(who, `insert into app.purpose_state (child_id, purpose_code, state, active_since) values ('${BIN}', 'MD-SUCKHOE', 'DANG_BAT', now())`);
      assert.equal(ins.ok, false);
      assert.equal(ins.code, '55000');
      const upd = run(who, `update app.purpose_state set state = 'DA_RUT', active_since = null`);
      assert.equal(upd.ok, false);
      assert.equal(upd.code, '55000');
    }
  });
  it('CON-22d: dòng sổ sai hộ / người ghi ngoài hộ / ĐỒNG Ý mục không thu bị từ chối ở tầng bảng', () => {
    const base = (hh, mem, code, ev = 'DONG_Y') => admin(`insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
      select '${hh}', '${NA}', '${code}', '${ev}', '${mem}', id from app.policy_versions limit 1`);
    assert.equal(base('00000000-0000-4000-8000-000000000102', MEM_HOA, 'MD-SUCKHOE').code, '23514');
    assert.equal(base(HH1, '00000000-0000-4000-8000-000000000203', 'MD-SUCKHOE').code, '23514');
    const off = (ev) => admin(`update app.purposes set collect_enabled = false where code = 'MD-CONBAO'; insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
      select '${HH1}', '${NA}', 'MD-CONBAO', '${ev}', '${MEM_HOA}', id from app.policy_versions limit 1`);
    assert.equal(off('DONG_Y').code, '23514');
    assert.ok(off('RUT').ok);
  });
});

// ================================================================ CON-D58: mục đích thứ 8 (D-67)
describe('CON-D58: MD-CONBAO - con báo bố mẹ (D-58, D-67, LQ-16)', { skip }, () => {
  it('CON-D58a: có hàng MD-CONBAO, tùy chọn, collect_enabled=true (D-67), chưa duyệt; mặc định chưa chọn', () => {
    const r = run(QL, `select kind || ':' || collect_enabled || ':' || approval from app.purposes where code = 'MD-CONBAO';
      select count(*) from app.purpose_state where purpose_code = 'MD-CONBAO'`);
    assert.deepEqual(r.rows, ['TUY_CHON:true:CHUA_DUYET', '0']);
  });
  it('CON-D58b: QL đồng ý riêng cấp con được; bé khác không đổi; app.can chỉ true sau khi đồng ý', () => {
    assert.equal(canP(QL, NA, 'MD-CONBAO').rows[0], 'f');
    const r = run(QL, `${rec(NA, 'MD-CONBAO', 'DONG_Y')}; ${adm(eff(NA, 'MD-CONBAO'))}; ${adm(eff(BIN, 'MD-CONBAO'))}`);
    assert.equal(J(r).changed, true);
    assert.deepEqual([r.rows[1], r.rows[2]], ['t', 'f']);
  });
  it('CON-D58c: cờ collect_enabled tắt (tắt khẩn cấp) thì DONG_Y bị FEATURE_OFF; RUT vẫn ghi được; rút lõi thì mục này mất hiệu lực', () => {
    FEATURE_OFF(run(QL, rec(NA, 'MD-CONBAO', 'DONG_Y'), { setup: `update app.purposes set collect_enabled = false where code = 'MD-CONBAO';` }));
    assert.equal(J(run(QL, rec(NA, 'MD-CONBAO', 'RUT'))).changed, false);
    const on = run(QL, `${rec(NA, 'MD-CONBAO', 'DONG_Y')};${adm(eff(NA, 'MD-CONBAO'))};${adm(`insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
        select '${HH1}', '${NA}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1`)};${adm(eff(NA, 'MD-CONBAO'))}`);
    assert.deepEqual([on.rows[1], on.rows[2]], ['t', 'f']);
  });
});

// ================================================================ CON-WA: rút toàn bộ (AC-CON-06)
describe('CON-WA: rút toàn bộ hai bước (AC-CON-06; D-42; BR-CON-026..028, 052)', { skip }, () => {
  const step1 = (child = NA) => `select app.consent_withdraw_all('${child}')`;
  const TOK = (child = NA) => `select app.consent_withdraw_all('${child}')->>'confirm_token' as tok \\gset\n`;   // lấy mã trong cùng giao dịch
  const step2 = (child = NA) => `select app.consent_withdraw_all('${child}', :'tok'::uuid)`;
  const GO = `${TOK()}${step2()};`;

  it('CON-WA-01: bước 1 chỉ trả hệ quả và mã, KHÔNG đổi dữ liệu nào (hồ sơ, sổ, yêu cầu xóa, liên kết)', () => {
    const snap = `select (select count(*) from app.consent_events) || ':' || (select md5(string_agg(c::text, ',' order by id)) from app.children c) || ':' || (select count(*) from app.deletion_requests) || ':' || (select state from app.device_bindings where id = '${BIND_NA}')`;
    const r = run(QL, `${adm(snap)};${step1()};${adm(snap)}`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], r.rows[2]);
    const o = JSON.parse(r.rows[1]);
    assert.equal(o.step, 1);
    assert.deepEqual(o.consequences.purposes_withdrawn, ['MD-LICH', 'MD-SUCKHOE']);
    assert.equal(o.consequences.hard_deleted_now, false);
    assert.equal(o.consequences.device_unlinked, true);
    assert.ok(o.confirm_token);
  });

  it('CON-WA-02: bước 2 (AC-CON-06): rút mọi mục, ẩn hồ sơ, hủy liên kết, tạo YÊU CẦU XÓA, không hứa đã xóa hết', () => {
    const r = run(QL, `${TOK()}${step2()};
      ${adm(`select count(*) from app.consent_events where child_id='${NA}' and event='RUT' and origin='RUT_TOAN_BO'`)};
      ${adm(`select count(*) from app.purpose_state where child_id='${NA}' and state='DANG_BAT'`)};
      ${adm(`select state || ':' || (hidden_at is not null) || ':' || hidden_reason from app.children where id='${NA}'`)};
      ${adm(`select state || ':' || epoch || ':' || revoke_reason from app.device_bindings where id='${BIND_NA}'`)};
      ${adm(`select scope || ':' || state || ':' || reason || ':' || (due_at is null) || ':' || (requested_by = '${MEM_HOA}') from app.deletion_requests where child_id='${NA}'`)};
      ${adm(`select count(*) from app.children where id='${NA}'`)}`);
    const o = J(r);
    assert.equal(o.replay, false);
    assert.equal(o.hard_deleted, false);
    assert.deepEqual(r.rows.slice(1), ['2', '0', 'CHO_XOA:true:RUT_DONG_Y', 'DA_HUY:2:RUT_DONG_Y', 'HO_SO_CON:CHO_QUYET_HAN:RUT_TOAN_BO:true:true', '1']);
  });

  it('CON-WA-03: sau khi rút toàn bộ: mọi ghi mới cho con bị từ chối (NOT_FOUND), máy con mất quyền, QL không còn thấy hồ sơ', () => {
    NOT_FOUND(run(QL, `${GO} ${rec(NA, 'MD-SUCKHOE', 'DONG_Y')}`));
    NOT_FOUND(run(QL, `${GO} select app.child_update('${NA}', '{"grade": 3}')`));
    NOT_FOUND(run(QL, `${GO} select app.mode_set('${NA}', 'PARENT_LED')`));
    const dev = run(QL, `${GO} ${as(DEV_NA)} select count(*) from app.children`);
    assert.equal(dev.rows[dev.rows.length - 1], '0');
    const ql = run(QL, `${GO} select count(*) from app.children where id='${NA}'`);
    assert.equal(ql.rows[ql.rows.length - 1], '0');
    assert.equal(run(QL, `${GO} select app_internal.can('${DEV_NA.sub}', 'child.view', '${NA}', 'MD-LICH')`).rows.pop(), 'f');
  });

  it('CON-WA-04: chỉ ảnh hưởng đúng một con: bé Bin vẫn nguyên và dùng được MD-LICH', () => {
    const r = run(QL, `${GO} select count(*) from app.children where id='${BIN}'; ${adm(eff(BIN, 'MD-LICH'))}`);
    assert.deepEqual(r.rows.slice(-2), ['1', 't']);
  });

  it('CON-WA-05: bước 2 cần mã đúng: mã lạ, mã của con khác, mã đã dùng, mã hết hạn -> VALIDATION D-42, không đổi gì', () => {
    VALIDATION(run(QL, `select app.consent_withdraw_all('${NA}', '20000000-0000-4000-8000-0000000000aa')`), 'D-42');
    VALIDATION(run(QL, `${TOK(NA)}${step2(BIN)}`), 'D-42');
    const expired = `${TOK()}${adm(`update private.withdraw_confirmations set expires_at = now() - interval '1 second'`)}${step2()}`;
    VALIDATION(run(QL, expired), 'D-42');
    const other = `${TOK()}${adm(`update private.withdraw_confirmations set member_id = '${MEM_MINH}'`)}${step2()}`;
    VALIDATION(run(QL, other), 'D-42');
  });

  it('CON-WA-06: bước 1 mới thay mã cũ (mã cũ vô hiệu); mã chỉ dùng một lần', () => {
    const r = run(QL, `${TOK()}select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok2 \\gset\n${step2()}`);
    VALIDATION(r, 'D-42');
    const r2 = run(QL, `${TOK()}select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok2 \\gset\nselect app.consent_withdraw_all('${NA}', :'tok2'::uuid)`);
    assert.equal(J(r2).replay, false);
  });

  it('CON-WA-07: gửi lặp: replay, giữ accepted_at ĐẦU, không tạo yêu cầu thứ hai, không ghi sổ thêm (BR-CON-052)', () => {
    const r = run(QL, `${GO} ${step1()}; ${step2()};
      ${adm(`select count(*) from app.deletion_requests`)};${adm(`select count(*) from app.consent_events where origin='RUT_TOAN_BO'`)}`);
    const a = J(r, 0), b = J(r, 1), c = J(r, 2);
    assert.equal(a.replay, false);
    assert.equal(b.replay, true);
    assert.equal(c.replay, true);
    assert.equal(a.accepted_at, b.accepted_at);
    assert.equal(a.deletion_request_id, c.deletion_request_id);
    assert.deepEqual(r.rows.slice(3), ['1', '2']);
  });

  it('CON-WA-08: chỉ QL: NL FORBIDDEN, máy con FORBIDDEN, hộ khác NOT_FOUND, chưa đăng nhập, anon; đóng băng thì VẪN rút được cả hai bước (D-64)', () => {
    FORBIDDEN(run(NL, step1()));
    FORBIDDEN(run(DEV_NA, step1()), 'BR-CON-020');
    NOT_FOUND(run(HK, step1()));
    UNAUTH(run({ role: 'authenticated' }, step1()));
    const a = run(ANON, step1());
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
    assert.equal(J(run(QL, step1(), { setup: FREEZE })).step, 1);
    const both = run(QL, `${TOK()}${adm(FREEZE)}${step2()}`);
    assert.equal(J(both).replay, false);
    assert.equal(J(both).hard_deleted, false);
  });

  it('CON-WA-09: QL đọc được yêu cầu xóa của hộ mình; NL và hộ khác thì không', () => {
    const mk = (who) => run(QL, `${GO} ${as(who)} select count(*) from app.deletion_requests`);
    assert.equal(mk(QL).rows.pop(), '1');
    assert.equal(mk(NL).rows.pop(), '0');
    assert.equal(mk(HK).rows.pop(), '0');
  });
});

// ================================================================ CON-CHILD: đồng ý của con (D-64, CA-16)
describe('CON-CHILD: "con đã đồng ý" trên máy con (D-64; Nghị định 330 chờ luật sư, LQ-17)', { skip }, () => {
  const kid = (extra = '') => `select app.child_consent_record(${extra})`;
  const SU_DEV = { ...A.CON_CHUA_GHEP, claims: { is_anonymous: true } };
  const NEWPV = `insert into app.policy_versions (effective_at, purposes_json, text_ref) values (now(), '[]'::jsonb, 'THU-V2');`;
  const mine = `select count(*) from app.consent_events where child_id='${NA}' and by_child`;

  it('CON-CHILD-01: máy con đã ghép ghi MD-LICH, kèm phiên bản chính sách, người ghi là liên kết máy con (không phải người lớn)', () => {
    const r = run(DEV_NA, `${kid()};
      ${adm(`select purpose_code || ':' || event || ':' || by_child || ':' || (actor_member_id is null) || ':' || (actor_binding_id = '${BIND_NA}')
        || ':' || (subject_member_id is null) || ':' || (policy_version_id is not null) from app.consent_events where child_id='${NA}' and by_child order by at desc limit 1`)}`);
    const o = J(r);
    assert.equal(o.changed, true);
    assert.equal(o.replay, false);
    assert.equal(r.rows[1], 'MD-LICH:DONG_Y:true:true:true:true:true');
  });

  it('CON-CHILD-02: không đổi purpose_state (đồng ý của con không bật/tắt mục nào của bố mẹ)', () => {
    const snap = `select md5(string_agg(s::text, ',' order by purpose_code)) from app.purpose_state s where child_id='${NA}'`;
    const r = run(DEV_NA, `${adm(snap)};${kid()};${adm(snap)}`);
    assert.equal(r.rows[0], r.rows[2]);
  });

  it('CON-CHILD-03: gửi lặp cùng phiên bản: replay, không ghi thêm; cùng khóa: replay; phiên bản chính sách mới: ghi dòng mới', () => {
    const k = '20000000-0000-4000-8000-0000000000c1';
    const r = run(DEV_NA, `${kid(`p_idempotency_key => '${k}'`)};${kid(`p_idempotency_key => '${k}'`)};${kid()};${adm(mine)}`);
    assert.equal(J(r, 0).changed, true);
    assert.equal(J(r, 1).replay, true);
    assert.equal(J(r, 2).replay, true);
    assert.equal(r.rows[3], '1');
    const v2 = run(DEV_NA, `${kid()};${adm(NEWPV)};${as(DEV_NA)}${kid()};${adm(mine)}`);
    assert.equal(J(v2, 1).changed, true);
    assert.equal(v2.rows[v2.rows.length - 1], '2');
  });

  it('CON-CHILD-04: QL đọc được dòng của con trong sổ; NL không; người lớn gọi hàm này bị từ chối', () => {
    const r = run(DEV_NA, `${kid()};${as(QL)}select count(*) from app.consent_events where by_child`);
    assert.equal(r.rows[r.rows.length - 1], '1');
    const nl = run(DEV_NA, `${kid()};${as(NL)}select count(*) from app.consent_events where by_child`);
    assert.equal(nl.rows[nl.rows.length - 1], '0');
    FORBIDDEN(run(QL, kid()), 'D-64');
    FORBIDDEN(run(NL, kid()), 'D-64');
  });

  it('CON-CHILD-05: máy chưa ghép NOT_FOUND; chưa đăng nhập UNAUTHENTICATED; anon không có EXECUTE; hộ đóng băng FROZEN', () => {
    NOT_FOUND(run(SU_DEV, kid()));
    UNAUTH(run({ role: 'authenticated', claims: { is_anonymous: true } }, kid()));
    const a = run(ANON, kid());
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
    FROZEN(run(DEV_NA, kid(), { setup: FREEZE }));
  });

  it('CON-CHILD-06: bố mẹ chưa/không còn đồng ý mục lõi -> từ chối (BR-CON-001); phiên bản chính sách lạ -> VALIDATION', () => {
    const noCore = `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
      select '${HH1}', '${NA}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1;`;
    FORBIDDEN(run(DEV_NA, kid(), { setup: noCore }), 'BR-CON-001');
    VALIDATION(run(DEV_NA, kid(`p_policy_version_id => '20000000-0000-4000-8000-0000000000ff'`)));
  });

  it('CON-CHILD-07: ràng buộc bảng: dòng của con chỉ DONG_Y, không có người ghi người lớn, liên kết phải của đúng con', () => {
    const ins = (cols, vals) => admin(`insert into app.consent_events (household_id, child_id, purpose_code, by_child, policy_version_id, ${cols})
      select '${HH1}', '${NA}', 'MD-LICH', true, id, ${vals} from app.policy_versions limit 1`);
    assert.equal(ins('event, actor_binding_id', `'RUT', '${BIND_NA}'`).code, '23514');
    assert.equal(ins('event, actor_binding_id, actor_member_id', `'DONG_Y', '${BIND_NA}', '${MEM_HOA}'`).code, '23514');
    assert.equal(ins('event', `'DONG_Y'`).code, '23514', 'thiếu liên kết');
    assert.equal(ins('event, actor_binding_id, paper_ref', `'DONG_Y', '${BIND_NA}', 'P1'`).code, '23514');
    const other = admin(`insert into app.consent_events (household_id, child_id, purpose_code, by_child, policy_version_id, event, actor_binding_id)
      select '${HH1}', '${BIN}', 'MD-LICH', true, id, 'DONG_Y', '${BIND_NA}' from app.policy_versions limit 1`);
    assert.equal(other.code, '23514', 'liên kết của bé Na không ghi cho bé Bin');
    assert.ok(ins('event, actor_binding_id', `'DONG_Y', '${BIND_NA}'`).ok);
  });

  it('CON-CHILD-08: audit consent.granted có by_child=true, người thực hiện là máy con (child_device), không lộ gì khác', () => {
    const r = run(DEV_NA, `${kid()};${adm(`select actor_kind || ':' || event_code || ':' || meta::text from app.audit_log where event_code='consent.granted' and (meta->>'by_child')='true' order by at desc limit 1`)}`);
    assert.match(r.rows[1], /^child_device:consent\.granted:\{.*"by_child": true.*\}$/);
  });
});

// ================================================================ CON-SET: cài đặt của con (D-64)
describe('CON-SET: ai_chat_enabled - chỗ lưu cài đặt cho chặng 2 (D-64)', { skip }, () => {
  const set = (child, v, key = 'ai_chat_enabled') => `select app.child_setting_set('${child}', '${key}', ${v})`;
  const dev = `select app.my_child_settings()`;

  it('CON-SET-01: mặc định TẮT cho QL và máy con; QL bật được, máy con đọc thấy đúng; checkin_invite_enabled không bị đụng', () => {
    const r = run(QL, `select app.child_setting_get('${NA}');${set(NA, true)};select app.child_setting_get('${NA}');${as(DEV_NA)}${dev};
      ${adm(`select checkin_invite_enabled from private.child_settings where child_id='${NA}'`)}`);
    assert.equal(J(r, 0).ai_chat_enabled, false);
    assert.equal(J(r, 1).changed, true);
    assert.equal(J(r, 2).ai_chat_enabled, true);
    assert.equal(J(r, 3).ai_chat_enabled, true);
    assert.equal(r.rows[4], 't');
    assert.equal(J(run(DEV_NA, dev)).ai_chat_enabled, false);
  });

  it('CON-SET-02: bé chưa có dòng cài đặt (Bin): set tạo dòng; lặp cùng giá trị changed=false; khóa lạ, giá trị null: VALIDATION', () => {
    const r = run(QL, `${set(BIN, true)};${set(BIN, true)};select app.child_setting_get('${BIN}')`);
    assert.equal(J(r, 0).changed, true);
    assert.equal(J(r, 1).changed, false);
    assert.equal(J(r, 2).ai_chat_enabled, true);
    VALIDATION(run(QL, set(NA, true, 'checkin_invite_enabled')), 'BR-CON-034');
    VALIDATION(run(QL, set(NA, 'null')), 'BR-CON-034');
  });

  it('CON-SET-03: chỉ QL đổi: NL FORBIDDEN, máy con FORBIDDEN, hộ khác NOT_FOUND, anon không có EXECUTE; NL và hộ khác không đọc', () => {
    FORBIDDEN(run(NL, set(NA, true)));
    FORBIDDEN(run(DEV_NA, set(NA, true)), 'BR-CON-034');
    NOT_FOUND(run(HK, set(NA, true)));
    assert.equal(run(ANON, set(NA, true)).code, '42501');
    FORBIDDEN(run(NL, `select app.child_setting_get('${NA}')`));
    FORBIDDEN(run(DEV_NA, `select app.child_setting_get('${NA}')`));
    NOT_FOUND(run(HK, `select app.child_setting_get('${NA}')`));
    FORBIDDEN(run(QL, dev));
  });

  it('CON-SET-04: đóng băng: BẬT -> FROZEN; TẮT (thu hẹp) vẫn được; máy con đọc cài đặt khi đóng băng -> FROZEN', () => {
    FROZEN(run(QL, set(NA, true), { setup: FREEZE }));
    const on = `update private.child_settings set ai_chat_enabled = true where child_id='${NA}';`;
    const off = run(QL, set(NA, false), { setup: `${on}${FREEZE}` });
    assert.equal(J(off).changed, true);
    FROZEN(run(DEV_NA, dev, { setup: FREEZE }));
  });

  it('CON-SET-05: bật/tắt ghi audit setting.changed (chỉ mã cài đặt và bật/tắt); không ghi khi không đổi', () => {
    const r = run(QL, `${set(NA, true)};${set(NA, true)};${set(NA, false)};
      ${adm(`select string_agg(actor_kind || ':' || meta::text, ';' order by at) from app.audit_log where event_code='setting.changed'`)}`);
    assert.equal(r.rows[3], 'adult:{"key": "ai_chat_enabled", "value": true};adult:{"key": "ai_chat_enabled", "value": false}');
  });
});

// ================================================================ CON-FAM: my_family_state cho máy con
describe('CON-FAM: app.my_family_state - máy con biết hộ có đóng băng không (D-41, D-64)', { skip }, () => {
  const st = `select app.my_family_state()`;
  it('CON-FAM-01: hộ đang hoạt động -> {state, frozen=false, plan_active}; đúng ba khóa ngoài ok (không lộ gì khác; D-72)', () => {
    const r = run(DEV_NA, st);
    const o = J(r);
    assert.equal(o.state, 'HOAT_DONG');
    assert.equal(o.frozen, false);
    assert.equal(o.plan_active, true);   // seed: hộ PREMIUM
    assert.deepEqual(Object.keys(o).sort(), ['frozen', 'ok', 'plan_active', 'state']);
  });
  it('CON-FAM-02: đóng băng -> frozen=true (máy con vẫn ghép); hộ CHO_XOA -> frozen=true', () => {
    const f = J(run(DEV_NA, st, { setup: FREEZE }));
    assert.deepEqual([f.state, f.frozen], ['DONG_BANG', true]);
    const c = J(run(DEV_NA, st, { setup: `update app.households set state='CHO_XOA' where id='${HH1}';` }));
    assert.deepEqual([c.state, c.frozen], ['CHO_XOA', true]);
  });
  it('CON-FAM-03: chỉ máy con đã ghép: người lớn FORBIDDEN, máy chưa ghép NOT_FOUND, sau khi gỡ ghép NOT_FOUND, anon không có EXECUTE', () => {
    FORBIDDEN(run(QL, st));
    NOT_FOUND(run({ ...A.CON_CHUA_GHEP, claims: { is_anonymous: true } }, st));
    NOT_FOUND(run(DEV_NA, st, { setup: `update app.device_bindings set state='DA_HUY' where id='${BIND_NA}';` }));
    assert.equal(run(ANON, st).code, '42501');
    UNAUTH(run({ role: 'authenticated', claims: { is_anonymous: true } }, st));
  });
});
