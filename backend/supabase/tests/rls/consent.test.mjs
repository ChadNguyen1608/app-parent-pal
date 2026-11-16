// Test T2.1, T2.2: sổ đồng ý chỉ-thêm, purpose_state, phụ thuộc mục đích, rút một mục, rút toàn bộ hai bước.
// Chạy cùng rls.test.mjs bởi scripts/db-test.sh. Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs).
// Mã: CON-01..08, CON-22 (AC-CON-xx của BL 11.3), CON-D58 (mục đích thứ 8), CON-WA (AC-CON-06), RLS-PURPOSE (Tech Spec §6.2).
// AC-CON-04 (vô hiệu CR khi rút MD-MONGMUON) CHƯA kiểm được: bảng change_requests ở T4.3. Dữ liệu: chỉ tên giả.
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
const MET_ON = `${rec(NA, 'MD-MET', 'DONG_Y')};`;

// ================================================================ CON-01, CON-D42: đồng ý theo mục đích, mục tùy chọn không chọn sẵn
describe('CON-01: đồng ý theo mục đích, không chọn sẵn (AC-CON-01; BR-CON-001, D-42)', { skip }, () => {
  it('CON-01a: bé Na chỉ bật MD-LICH, MD-DONGBO, MD-XONG; mục khác tắt (không có dòng = CHUA_HOI)', () => {
    const r = run(QL, [eff(NA, 'MD-LICH'), eff(NA, 'MD-DONGBO'), eff(NA, 'MD-XONG'), eff(NA, 'MD-MET'), eff(NA, 'MD-MONGMUON'),
      eff(NA, 'MD-BAOCAO'), eff(NA, 'MD-SUCKHOE'), eff(NA, 'MD-CONBAO')].map((q) => adm(q) + ';').join('\n'));
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, ['t', 't', 't', 'f', 'f', 'f', 'f', 'f']);
  });

  it('CON-01b: app.can theo mục đích: chỉ mục đang bật; QL cũng bị từ chối với mục chưa đồng ý', () => {
    assert.equal(canP(QL, NA, 'MD-LICH').rows[0], 't');
    assert.equal(canP(QL, NA, 'MD-XONG').rows[0], 't');
    assert.equal(canP(QL, NA, 'MD-MET').rows[0], 'f');
    assert.equal(canP(QL, NA, 'MD-BAOCAO').rows[0], 'f');
    assert.equal(canP(DEV_NA, NA, 'MD-DONGBO').rows[0], 't');
    assert.equal(canP(DEV_NA, NA, 'MD-MET').rows[0], 'f', 'máy con không dùng mục chưa bật');
    assert.equal(canP(NL, NA, 'MD-LICH').rows[0], 't');
  });

  it('CON-01c: hồ sơ con mới tạo không có dòng purpose_state nào (mục tùy chọn không chọn sẵn)', () => {
    const r = run(QL, `select (app.child_create('${HH1}', 'bé Mít', 3)->>'child_id')::uuid as nc \\gset
      ${adm(`select count(*) from app.purpose_state where child_id = :'nc'; select count(*) from app.consent_events where child_id = :'nc'`)}`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(-2), ['0', '0']);
  });

  it('CON-01d: đồng ý ghi sổ: người ghi, phiên bản chính sách, SELF_DECLARED, giờ máy chủ', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};
      ${adm(`select method || ':' || (actor_member_id = '${MEM_HOA}') || ':' || (subject_member_id is null) || ':' || origin
        || ':' || (policy_version_id is not null) from app.consent_events where child_id='${NA}' and purpose_code='MD-MET'`)}`);
    const o = J(r);
    assert.equal(o.changed, true);
    assert.equal(o.state, 'DANG_BAT');
    assert.equal(o.effective, true);
    assert.equal(r.rows[1], 'SELF_DECLARED:true:true:MOT_MUC:true');
  });

  it('CON-01e: gửi lặp cùng khóa trả replay, không ghi thêm; cùng trạng thái thì changed=false', () => {
    const k = '20000000-0000-4000-8000-000000000001';
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y', `, p_idempotency_key => '${k}'`)};
      ${rec(NA, 'MD-MET', 'DONG_Y', `, p_idempotency_key => '${k}'`)};
      ${rec(NA, 'MD-MET', 'DONG_Y')};
      ${adm(`select count(*) from app.consent_events where child_id='${NA}' and purpose_code='MD-MET'`)}`);
    assert.equal(J(r, 0).replay, false);
    assert.equal(J(r, 1).replay, true);
    assert.equal(J(r, 2).changed, false);
    assert.equal(r.rows[3], '1');
    // cùng khóa nhưng con khác: không được dùng lại
    VALIDATION(run(QL, `${rec(NA, 'MD-MET', 'DONG_Y', `, p_idempotency_key => '${k}'`)}; ${rec(BIN, 'MD-LICH', 'RUT', `, p_idempotency_key => '${k}'`)}`));
  });

  it('CON-01f: kiểm đầu vào - sự kiện lạ, mục đích lạ, mã phiếu có khoảng trắng, phiên bản chính sách lạ', () => {
    VALIDATION(run(QL, rec(NA, 'MD-MET', 'XYZ')));
    VALIDATION(run(QL, rec(NA, 'MD-KHONG-CO', 'DONG_Y')));
    VALIDATION(run(QL, rec(NA, 'MD-MET', 'DONG_Y', `, p_paper_ref => 'nguyen van a'`)));
    VALIDATION(run(QL, rec(NA, 'MD-MET', 'DONG_Y', `, p_policy_version_id => '20000000-0000-4000-8000-0000000000ff'`)));
    const ok = run(QL, rec(NA, 'MD-MET', 'DONG_Y', `, p_paper_ref => 'PHIEU-001'`));
    assert.ok(ok.ok, ok.err);
  });
});

// ================================================================ CON-02, 03: rút một mục, phụ thuộc
describe('CON-02/03: rút một mục đích, phụ thuộc (AC-CON-02, 03; BR-CON-021..024)', { skip }, () => {
  it('CON-02: rút MD-MET: mục tắt, có một sự kiện rút trong sổ, hồ sơ và mode của con không đổi, mục khác vẫn bật', () => {
    const snap = `select md5(c::text) from app.children c where id='${NA}'`;
    const r = run(QL, `${adm(snap)};${MET_ON}
      ${adm(snap)};${rec(NA, 'MD-MET', 'RUT')};${adm(snap)};${adm(eff(NA, 'MD-MET'))};${adm(eff(NA, 'MD-XONG'))};
      ${adm(`select count(*) from app.consent_events where child_id='${NA}' and purpose_code='MD-MET' and event='RUT'`)}`);
    assert.ok(r.ok, r.err);
    const [h0, , h1, , h2, metOn, xongOn, nRut] = r.rows;
    assert.equal(h0, h1);
    assert.equal(h1, h2, 'rút MD-MET không đổi hồ sơ/lịch của con');
    assert.equal(JSON.parse(r.rows[3]).state, 'DA_RUT');
    assert.deepEqual([metOn, xongOn, nRut], ['f', 't', '1']);
  });

  it('CON-03: rút MD-DONGBO: MD-XONG tắt theo (kèm sự kiện PHU_THUOC), MD-LICH vẫn bật, QL vẫn sửa được hồ sơ', () => {
    const r = run(QL, `${MET_ON} ${rec(NA, 'MD-DONGBO', 'RUT')};
      ${adm(eff(NA, 'MD-XONG'))};${adm(eff(NA, 'MD-MET'))};${adm(eff(NA, 'MD-LICH'))};
      ${adm(`select string_agg(purpose_code || ':' || origin, ',' order by purpose_code) from app.consent_events where child_id='${NA}' and event='RUT'`)};
      select app.child_update('${NA}', '{"grade": 4}')->>'grade'`);
    const o = J(r, 1);
    assert.equal(o.state, 'DA_RUT');
    assert.deepEqual(o.also_withdrawn, ['MD-MET', 'MD-XONG']);
    assert.deepEqual(r.rows.slice(2, 7), ['f', 'f', 't', 'MD-DONGBO:MOT_MUC,MD-MET:PHU_THUOC,MD-XONG:PHU_THUOC', '4']);
    assert.equal(canP(DEV_NA, NA, 'MD-DONGBO').rows[0], 't', 'chưa rút thì máy con còn dùng được');
  });

  it('CON-03b: sau khi rút MD-DONGBO, máy con không dùng mục đích nào gắn DONGBO; đồng ý lại DONGBO KHÔNG tự bật lại MD-XONG', () => {
    const r = run(QL, `${rec(NA, 'MD-DONGBO', 'RUT')}; ${rec(NA, 'MD-DONGBO', 'DONG_Y')};
      ${adm(eff(NA, 'MD-DONGBO'))};${adm(eff(NA, 'MD-XONG'))};${adm(state(NA, 'MD-XONG'))}`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(2), ['t', 'f', 'DA_RUT']);
  });

  it('CON-03c: phụ thuộc gián tiếp - MD-BAOCAO cần MD-XONG cần MD-DONGBO: rút DONGBO thì BAOCAO cũng tắt', () => {
    const r = run(QL, `${rec(NA, 'MD-BAOCAO', 'DONG_Y')};${adm(eff(NA, 'MD-BAOCAO'))};${rec(NA, 'MD-DONGBO', 'RUT')};${adm(eff(NA, 'MD-BAOCAO'))};${adm(state(NA, 'MD-BAOCAO'))}`);
    assert.ok(r.ok, r.err);
    assert.deepEqual([r.rows[1], r.rows[3], r.rows[4]], ['t', 'f', 'DA_RUT']);
  });

  it('CON-03d: đồng ý mục con khi mục cha chưa bật được ghi nhưng KHÔNG hiệu lực (tính động)', () => {
    const r = run(QL, `${rec(BIN, 'MD-MET', 'DONG_Y')};${adm(eff(BIN, 'MD-MET'))};${adm(state(BIN, 'MD-MET'))}`);
    assert.equal(J(r).effective, false);
    assert.deepEqual(r.rows.slice(1), ['f', 'DANG_BAT']);
  });

  it('CON-03e: rút mục LÕI MD-LICH ở cấp con bị từ chối (BR-CON-026): phải dùng rút toàn bộ', () => {
    VALIDATION(run(QL, rec(NA, 'MD-LICH', 'RUT')), 'BR-CON-026');
  });
});

// ================================================================ CON-05: quyền ghi
describe('CON-05: ai ghi đồng ý (AC-CON-05; BR-CON-007, 020)', { skip }, () => {
  it('CON-05a: NL (anh Minh) rút đồng ý theo con của chị Hoa -> FORBIDDEN, sổ không đổi', () => {
    FORBIDDEN(run(NL, rec(NA, 'MD-XONG', 'RUT')));
    FORBIDDEN(run(NL, rec(NA, 'MD-MET', 'DONG_Y')));
    const r = run(NL, `${rec(NA, 'MD-XONG', 'RUT', ', p_for_self => false')}`);
    FORBIDDEN(r);
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
    const r = run(NL, `${rec(NA, 'MD-XONG', 'RUT', ', p_for_self => true')};${rec(NA, 'MD-XONG', 'RUT', ', p_for_self => true')};
      select count(*) from app.consent_events; select count(*) from app.consent_events where subject_member_id is null`);
    assert.equal(J(r, 1).changed, false);
    assert.deepEqual(r.rows.slice(2), ['1', '0']);
  });

  it('CON-05d: máy con không ghi đồng ý (kể cả for_self); người ngoài hộ NOT_FOUND; chưa đăng nhập UNAUTHENTICATED; anon không có EXECUTE', () => {
    FORBIDDEN(run(DEV_NA, rec(NA, 'MD-XONG', 'RUT')), 'BR-CON-020');
    FORBIDDEN(run(DEV_NA, rec(NA, 'MD-XONG', 'RUT', ', p_for_self => true')), 'BR-CON-020');
    NOT_FOUND(run(HK, rec(NA, 'MD-XONG', 'RUT')));
    NOT_FOUND(run(QL, rec(SU, 'MD-XONG', 'RUT')));
    NOT_FOUND(run(NL, rec(BIN, 'MD-LICH', 'RUT', ', p_for_self => true')));
    UNAUTH(run({ role: 'authenticated' }, rec(NA, 'MD-XONG', 'RUT')));
    const a = run(ANON, rec(NA, 'MD-XONG', 'RUT'));
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
  });

  it('CON-05e: hộ đóng băng -> FROZEN cho QL (ghi và rút); NL (for_self) cũng FROZEN', () => {
    FROZEN(run(QL, rec(NA, 'MD-MET', 'DONG_Y'), { setup: FREEZE }));
    FROZEN(run(QL, rec(NA, 'MD-XONG', 'RUT'), { setup: FREEZE }));
    FROZEN(run(QL, rec(NA, 'MD-XONG', 'RUT', ', p_for_self => true'), { setup: FREEZE }));
    FROZEN(run(NL, rec(NA, 'MD-LICH', 'RUT', ', p_for_self => true'), { setup: FREEZE }));
  });
});

// ================================================================ CON-07, RLS-PURPOSE: dữ liệu cũ không hiện lại
describe('CON-07 / RLS-PURPOSE: ẩn dữ liệu cũ khi rút, đồng ý lại không hiện lại (AC-CON-02, 07; D-42; BR-CON-021, 029)', { skip }, () => {
  // Bảng dữ liệu giả của MD-MET + chính sách dùng app_internal.purpose_visible (mẫu cho bảng thật ở T3+). Nằm trong giao dịch thử, không vào migration.
  const SCRATCH = `
    create table app.zz_data (id serial primary key, child_id uuid not null, label text not null, created_at timestamptz not null default clock_timestamp());
    alter table app.zz_data enable row level security;
    create policy zz_select on app.zz_data for select to authenticated
      using ((select app_internal.purpose_visible(child_id, 'MD-MET', created_at)));
    grant select on app.zz_data to authenticated;`;
  const put = (label) => adm(`insert into app.zz_data (child_id, label) values ('${NA}', '${label}')`);
  const seen = `select coalesce(string_agg(label, ',' order by id), '-') from app.zz_data`;

  it('CON-07a: bật -> dữ liệu A -> rút (A ẩn ngay) -> đồng ý lại: A vẫn ẩn, dữ liệu mới B hiện', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};${put('A')}${seen};
      ${rec(NA, 'MD-MET', 'RUT')};${seen};
      ${rec(NA, 'MD-MET', 'DONG_Y')};${seen};${put('B')}${seen}`, { setup: SCRATCH });
    assert.ok(r.ok, r.err);
    const out = r.rows.filter((x) => !x.startsWith('{'));
    assert.deepEqual(out, ['A', '-', '-', 'B']);
  });

  it('CON-07b: rút mục CHA (MD-DONGBO) rồi đồng ý lại cả hai: dữ liệu cũ của MD-MET vẫn ẩn (mốc theo cả chuỗi phụ thuộc)', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};${put('A')}${seen};
      ${rec(NA, 'MD-DONGBO', 'RUT')};${seen};
      ${rec(NA, 'MD-DONGBO', 'DONG_Y')};${rec(NA, 'MD-MET', 'DONG_Y')};${seen};${put('B')}${seen}`, { setup: SCRATCH });
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.filter((x) => !x.startsWith('{')), ['A', '-', '-', 'B']);
  });

  it('CON-07c: đồng ý lặp khi đang bật KHÔNG đặt lại mốc (dữ liệu hiện có không biến mất)', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};${put('A')}${rec(NA, 'MD-MET', 'DONG_Y')};${seen}`, { setup: SCRATCH });
    assert.equal(r.rows[r.rows.length - 1], 'A');
  });

  it('CON-07d: máy con và NL cũng không thấy dữ liệu của mục đã rút (qua app.can + purpose_visible); visible_from null khi không hiệu lực', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};${put('A')}${rec(NA, 'MD-MET', 'RUT')};
      ${adm(`select app_internal.visible_from('${NA}', 'MD-MET') is null`)};
      ${as(DEV_NA)}${seen}`, { setup: SCRATCH });
    assert.equal(r.rows[2], 't');
    assert.equal(r.rows[3], '-');
    const noRole = run(HK, `select app_internal.visible_from('${NA}', 'MD-LICH') is null`);
    assert.equal(noRole.rows[0], 't', 'người ngoài hộ không dò được mốc');
  });

  it('CON-07e: purpose_state phản ánh sổ - gấp lại sổ ra cùng trạng thái (đối chiếu sau chuỗi thao tác)', () => {
    const r = run(QL, `${rec(NA, 'MD-MET', 'DONG_Y')};${rec(NA, 'MD-MET', 'RUT')};${rec(NA, 'MD-MET', 'DONG_Y')};${rec(NA, 'MD-DONGBO', 'RUT')};
      ${adm(`select count(*) from (
        select child_id, purpose_code,
          (array_agg(event order by at desc, id desc))[1] as last_event
        from app.consent_events where subject_member_id is null group by child_id, purpose_code) f
        join app.purpose_state s using (child_id, purpose_code)
        where (f.last_event = 'DONG_Y') <> (s.state = 'DANG_BAT')`)}`);
    assert.equal(r.rows[r.rows.length - 1], '0');
  });
});

// ================================================================ CON-08: chính sách phiên bản mới
describe('CON-08: chính sách có phiên bản mới thêm mục đích (AC-CON-08; BR-CON-005)', { skip }, () => {
  const NEWPV = `insert into app.purposes (code, name_vi, depends_on, kind) values ('MD-MOI', 'Mục đích mới (thử)', '{MD-LICH}', 'TUY_CHON');
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
      ${adm(eff(NA, 'MD-XONG'))}`, { setup: NEWPV });
    assert.deepEqual(r.rows.slice(1), ['THU-V2', 't']);
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
    assert.equal(J(run(QL, rec(NA, 'MD-MET', 'DONG_Y'))).changed, true);
  });
  it('CON-22c: purpose_state không ghi trực tiếp được kể cả service_role/quản trị (chỉ trigger của sổ)', () => {
    for (const who of [{ role: 'admin' }, { role: 'service_role' }]) {
      const ins = run(who, `insert into app.purpose_state (child_id, purpose_code, state, active_since) values ('${BIN}', 'MD-MET', 'DANG_BAT', now())`);
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
    assert.equal(base('00000000-0000-4000-8000-000000000102', MEM_HOA, 'MD-MET').code, '23514');
    assert.equal(base(HH1, '00000000-0000-4000-8000-000000000203', 'MD-MET').code, '23514');
    assert.equal(base(HH1, MEM_HOA, 'MD-SUCKHOE').code, '23514');
    assert.equal(base(HH1, MEM_HOA, 'MD-CONBAO').code, '23514');
    assert.ok(base(HH1, MEM_HOA, 'MD-CONBAO', 'RUT').ok);
  });
});

// ================================================================ CON-D58: mục đích thứ 8
describe('CON-D58: mục đích thứ 8 - con báo trực tiếp (D-58, LQ-16)', { skip }, () => {
  it('CON-D58a: có hàng MD-CONBAO, tùy chọn, phụ thuộc MD-DONGBO, collect_enabled=false, chưa duyệt; mặc định chưa chọn', () => {
    const r = run(QL, `select kind || ':' || collect_enabled || ':' || approval || ':' || array_to_string(depends_on, '+') from app.purposes where code = 'MD-CONBAO';
      select count(*) from app.purpose_state where purpose_code = 'MD-CONBAO'`);
    assert.deepEqual(r.rows, ['TUY_CHON:false:CHUA_DUYET:MD-DONGBO', '0']);
  });
  it('CON-D58b: không đồng ý được (FEATURE_OFF) cho tới khi chủ sản phẩm bật cờ; app.can luôn từ chối', () => {
    FEATURE_OFF(run(QL, rec(NA, 'MD-CONBAO', 'DONG_Y')));
    assert.equal(canP(QL, NA, 'MD-CONBAO').rows[0], 'f');
    assert.equal(canP(DEV_NA, NA, 'MD-CONBAO').rows[0], 'f');
  });
  it('CON-D58c: rút luôn ghi được (không đổi gì khi chưa bật); khi cờ bật (migration sau) thì đồng ý được và phải có MD-DONGBO', () => {
    const r = run(QL, `${rec(NA, 'MD-CONBAO', 'RUT')}`);
    assert.equal(J(r).changed, false);
    const on = run(QL, `${rec(NA, 'MD-CONBAO', 'DONG_Y')};${adm(eff(NA, 'MD-CONBAO'))};${rec(NA, 'MD-DONGBO', 'RUT')};${adm(eff(NA, 'MD-CONBAO'))}`,
      { setup: `update app.purposes set collect_enabled = true where code = 'MD-CONBAO';` });
    assert.deepEqual([on.rows[1], on.rows[3]], ['t', 'f']);
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
    assert.deepEqual(o.consequences.purposes_withdrawn, ['MD-DONGBO', 'MD-LICH', 'MD-XONG']);
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
    assert.deepEqual(r.rows.slice(1), ['3', '0', 'CHO_XOA:true:RUT_DONG_Y', 'DA_HUY:2:RUT_DONG_Y', 'HO_SO_CON:CHO_QUYET_HAN:RUT_TOAN_BO:true:true', '1']);
  });

  it('CON-WA-03: sau khi rút toàn bộ: mọi ghi mới cho con bị từ chối (NOT_FOUND), máy con mất quyền, QL không còn thấy hồ sơ', () => {
    NOT_FOUND(run(QL, `${GO} ${rec(NA, 'MD-MET', 'DONG_Y')}`));
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
    assert.deepEqual(r.rows.slice(3), ['1', '3']);
  });

  it('CON-WA-08: chỉ QL: NL FORBIDDEN, máy con FORBIDDEN, hộ khác NOT_FOUND, chưa đăng nhập, anon; đóng băng -> FROZEN cả hai bước', () => {
    FORBIDDEN(run(NL, step1()));
    FORBIDDEN(run(DEV_NA, step1()), 'BR-CON-020');
    NOT_FOUND(run(HK, step1()));
    UNAUTH(run({ role: 'authenticated' }, step1()));
    const a = run(ANON, step1());
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
    FROZEN(run(QL, step1(), { setup: FREEZE }));
    FROZEN(run(QL, `${TOK()}${adm(FREEZE)}${step2()}`));
  });

  it('CON-WA-09: QL đọc được yêu cầu xóa của hộ mình; NL và hộ khác thì không', () => {
    const mk = (who) => run(QL, `${GO} ${as(who)} select count(*) from app.deletion_requests`);
    assert.equal(mk(QL).rows.pop(), '1');
    assert.equal(mk(NL).rows.pop(), '0');
    assert.equal(mk(HK).rows.pop(), '0');
  });
});
