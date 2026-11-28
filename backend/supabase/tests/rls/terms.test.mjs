// Test D-76: thỏa thuận người dùng khi đăng ký (app.terms_acceptances, app.terms_status, app.terms_accept, family_create chặn khi chưa đồng ý,
// audit terms.accepted, purge_household xóa dòng đồng ý). Người soạn: AI, chưa kiểm chứng độc lập.
// Mã: TERMS-ST (terms_status), TERMS-ACC (terms_accept), TERMS-GATE (family_create), TERMS-VER (đổi phiên bản), TERMS-AUD (audit),
//     TERMS-LOG (chỉ-thêm, không đọc/ghi trực tiếp), TERMS-PURGE (xóa theo hộ).
// Mỗi lệnh chạy trong giao dịch rồi ROLLBACK (lib/db.mjs). Dữ liệu: chỉ tên giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const HH2 = '00000000-0000-4000-8000-000000000102';
const MAI_SUB = '00000000-0000-4000-8000-0000000000a6';      // người lớn mới, chưa thuộc hộ nào
const LAN_SUB = '00000000-0000-4000-8000-0000000000a4';      // QL hộ 2
const MAI = { role: 'authenticated', sub: MAI_SUB };
const DEV_NEW = { role: 'authenticated', sub: '00000000-0000-4000-8000-0000000000a7', claims: { is_anonymous: true } };
const QL = A.QL, ANON = A.ANON;
const SVC = { role: 'service_role' };
const CUR = '2026-11-28-nhap';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const J = (r, i = 0) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[i]); };
const rejected = (r, code, st, rule = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, st, r.err);
  assert.match(r.err, new RegExp(code));
  if (rule) assert.match(r.err, new RegExp(rule));
};
const NO_EXEC = (r) => { assert.equal(r.ok, false); assert.equal(r.code, '42501'); };
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;
const ACCEPTED = (uid, v = 'private.terms_current_version()') => `insert into app.terms_acceptances(user_id, terms_version) values ('${uid}', ${v});`;
const SET_VERSION = (v) => `update private.terms_version set version = '${v}';`;

describe('TERMS-ST: app.terms_status', { skip }, () => {
  it('TERMS-ST-01: người lớn chưa đồng ý: accepted=false, current_version là bản hiện hành; đồng ý rồi: true', () => {
    const a = J(run(MAI, `select app.terms_status()`));
    assert.deepEqual(a, { current_version: CUR, accepted: false });
    const b = J(run(MAI, `select app.terms_status()`, { setup: ACCEPTED(MAI_SUB) }));
    assert.deepEqual(b, { current_version: CUR, accepted: true });
  });

  it('TERMS-ST-02: từ chối - chưa đăng nhập, máy con ẩn danh, anon không có EXECUTE', () => {
    rejected(run({ role: 'authenticated' }, `select app.terms_status()`), 'UNAUTHENTICATED', 'PT401');
    rejected(run(DEV_NEW, `select app.terms_status()`), 'FORBIDDEN', 'PT403', 'D-76');
    NO_EXEC(run(ANON, `select app.terms_status()`));
  });
});

describe('TERMS-ACC: app.terms_accept', { skip }, () => {
  it('TERMS-ACC-01: ghi một dòng (user, phiên bản, giờ máy chủ); trả accepted, replay=false; status chuyển true', () => {
    const r = run(MAI, `select app.terms_accept('${CUR}'); select app.terms_status();
      ${adm(`select count(*) || '|' || min(terms_version) || '|' || (min(accepted_at) > now() - interval '1 minute') from app.terms_acceptances where user_id = '${MAI_SUB}'`)}`);
    assert.deepEqual(J(r, 0), { version: CUR, accepted: true, replay: false });
    assert.equal(J(r, 1).accepted, true);
    assert.equal(r.rows[2], `1|${CUR}|true`);
  });

  it('TERMS-ACC-02: idempotent theo (người dùng, phiên bản): gọi lặp trả replay=true, vẫn một dòng, giờ đầu giữ nguyên', () => {
    const r = run(MAI, `select app.terms_accept('${CUR}'); select app.terms_accept('${CUR}');
      ${adm(`select count(*) from app.terms_acceptances where user_id = '${MAI_SUB}'`)}`);
    assert.equal(J(r, 0).replay, false);
    assert.equal(J(r, 1).replay, true);
    assert.equal(r.rows[2], '1');
  });

  it('TERMS-ACC-03: phiên bản cũ, lạ, rỗng hoặc null bị từ chối (VALIDATION D-76.version), không ghi gì', () => {
    for (const v of ['2020-01-01', 'abc', '']) {
      rejected(run(MAI, `select app.terms_accept('${v}')`), 'VALIDATION', 'PT422', 'D-76.version');
    }
    rejected(run(MAI, `select app.terms_accept(null)`), 'VALIDATION', 'PT422', 'D-76.version');
    const r = run(MAI, `select app.terms_accept('${CUR}'); ${adm(`select count(*) from app.terms_acceptances where terms_version <> '${CUR}'`)}`);
    assert.equal(r.rows[1], '0');
  });

  it('TERMS-ACC-04: từ chối - chưa đăng nhập, máy con ẩn danh (không ghi dòng), anon không có EXECUTE', () => {
    rejected(run({ role: 'authenticated' }, `select app.terms_accept('${CUR}')`), 'UNAUTHENTICATED', 'PT401');
    rejected(run(DEV_NEW, `select app.terms_accept('${CUR}')`), 'FORBIDDEN', 'PT403', 'D-76');
    rejected(run({ ...MAI, claims: { is_anonymous: true } }, `select app.terms_accept('${CUR}')`), 'FORBIDDEN', 'PT403', 'D-76');
    NO_EXEC(run(ANON, `select app.terms_accept('${CUR}')`));
  });
});

describe('TERMS-GATE: family_create chặn khi chưa đồng ý (HTTP 428)', { skip }, () => {
  it('TERMS-GATE-01: chưa đồng ý bản hiện hành thì TERMS_REQUIRED (PT428), không tạo hộ, không tạo thành viên', () => {
    rejected(run(MAI, `select app.family_create('chị Mai')`), 'TERMS_REQUIRED', 'PT428', 'D-76');
    const r = run(MAI, `select 1; ${adm(`select (select count(*) from app.households) || '|' || (select count(*) from app.members where user_id = '${MAI_SUB}')`)}`);
    assert.equal(r.rows[1], '2|0');   // hai hộ seed, không thêm
  });

  it('TERMS-GATE-02: đã đồng ý bản hiện hành thì tạo được hộ; đồng ý bản KHÁC (cũ) thì vẫn bị chặn', () => {
    const ok = J(run(MAI, `select app.family_create('chị Mai')`, { setup: ACCEPTED(MAI_SUB) }));
    assert.equal(ok.role, 'PRIMARY');
    assert.equal(ok.replay, false);
    rejected(run(MAI, `select app.family_create('chị Mai')`, { setup: ACCEPTED(MAI_SUB, `'2020-01-01'`) }), 'TERMS_REQUIRED', 'PT428');
  });

  it('TERMS-GATE-03: đồng ý của người khác không tính; tạo hộ qua terms_accept rồi family_create trong một phiên', () => {
    rejected(run(MAI, `select app.family_create('chị Mai')`, { setup: ACCEPTED(LAN_SUB) }), 'TERMS_REQUIRED', 'PT428');
    const r = run(MAI, `select app.terms_accept('${CUR}'); select app.family_create('chị Mai'); select app.family_create('chị Mai')`);
    assert.equal(J(r, 1).replay, false);
    assert.equal(J(r, 2).replay, true);
  });

  it('TERMS-GATE-04: người đã có hộ gọi family_create vẫn nhận hộ cũ (replay) dù chưa đồng ý; máy con vẫn FORBIDDEN FR-01 trước điều khoản', () => {
    assert.equal(J(run(QL, `select app.family_create('chị Hoa')`)).replay, true);
    rejected(run(DEV_NEW, `select app.family_create('bé')`), 'FORBIDDEN', 'PT403', 'FR-01');
  });
});

describe('TERMS-VER: đổi phiên bản thì hỏi lại', { skip }, () => {
  it('TERMS-VER-01: đổi phiên bản hiện hành: accepted=false, family_create chặn lại; terms_accept bản cũ bị từ chối, bản mới được', () => {
    const NEWV = '2026-12-01';
    const setup = `${ACCEPTED(MAI_SUB)} ${SET_VERSION(NEWV)}`;
    assert.deepEqual(J(run(MAI, `select app.terms_status()`, { setup })), { current_version: NEWV, accepted: false });
    rejected(run(MAI, `select app.family_create('chị Mai')`, { setup }), 'TERMS_REQUIRED', 'PT428');
    rejected(run(MAI, `select app.terms_accept('${CUR}')`, { setup }), 'VALIDATION', 'PT422', 'D-76.version');
    const r = run(MAI, `select app.terms_accept('${NEWV}'); select app.terms_status(); select app.family_create('chị Mai')`, { setup });
    assert.equal(J(r, 0).replay, false);
    assert.equal(J(r, 1).accepted, true);
    assert.equal(J(r, 2).replay, false);
  });

  it('TERMS-VER-02: người đã có hộ (QL) cũng được hỏi lại: status=false khi chưa đồng ý bản hiện hành; hộ của họ không bị khóa', () => {
    assert.deepEqual(J(run(QL, `select app.terms_status()`)), { current_version: CUR, accepted: false });
    assert.equal(J(run(QL, `select app.touch_active()`)).touched !== undefined, true);
  });
});

describe('TERMS-AUD: audit terms.accepted (chỉ mã phiên bản)', { skip }, () => {
  const log = `select count(*) || '|' || coalesce(string_agg(actor_kind || ':' || meta::text, ';'), '') from app.audit_log where event_code = 'terms.accepted' and household_id = `;

  it('TERMS-AUD-01: người đã có hộ đồng ý: một dòng audit actor adult, meta chỉ có version; gọi lặp không ghi thêm', () => {
    const r = run(QL, `select app.terms_accept('${CUR}'); select app.terms_accept('${CUR}');
      ${adm(`${log} '${HH1}'`)}`);
    assert.equal(r.rows[2], `1|adult:{"version": "${CUR}"}`);
  });

  it('TERMS-AUD-02: người chưa có hộ: terms_accept chưa ghi audit (chưa có hộ); family_create ghi đúng một dòng khi hộ được tạo', () => {
    const r = run(MAI, `select app.terms_accept('${CUR}');
      ${adm(`select count(*) from app.audit_log where event_code = 'terms.accepted'`)}
      select app.family_create('chị Mai'); select app.family_create('chị Mai');
      ${adm(`select count(*) || '|' || coalesce(string_agg(actor_kind || ':' || meta::text, ';'), '') from app.audit_log a where event_code = 'terms.accepted' and household_id = (select household_id from app.members where user_id = '${MAI_SUB}')`)}`);
    assert.equal(r.rows[1], '0');
    assert.equal(r.rows[4], `1|adult:{"version": "${CUR}"}`);
  });

  it('TERMS-AUD-03: audit không mang nội dung ngoài mã phiên bản; khóa meta lạ bị chặn', () => {
    const bad = run({ role: 'admin' }, `insert into app.audit_log(household_id, actor_kind, event_code, meta) values ('${HH1}', 'system', 'terms.accepted', '{"text":"abc"}')`);
    assert.equal(bad.ok, false);
    assert.equal(bad.code, '23514');
  });
});

describe('TERMS-LOG: chỉ-thêm, không đọc hoặc ghi trực tiếp', { skip }, () => {
  it('TERMS-LOG-01: không ai sửa, xóa, truncate được kể cả quản trị và service_role', () => {
    for (const actor of [{ role: 'admin' }, SVC]) {
      for (const sql of [`update app.terms_acceptances set terms_version = 'x'`, `delete from app.terms_acceptances`, `truncate app.terms_acceptances`]) {
        const r = run(actor, sql, { setup: ACCEPTED(MAI_SUB) });
        assert.equal(r.ok, false, `${actor.role}: ${sql}`);
        assert.equal(r.code, '55000', r.err);
      }
    }
  });

  it('TERMS-LOG-02: người dùng đăng nhập không đọc, không ghi trực tiếp bảng đồng ý (42501); không chọc được private.terms_version', () => {
    for (const sql of [`select count(*) from app.terms_acceptances`, `insert into app.terms_acceptances(user_id, terms_version) values ('${MAI_SUB}', 'x')`,
      `select version from private.terms_version`, `update private.terms_version set version = 'x'`]) {
      NO_EXEC(run(MAI, sql, { setup: ACCEPTED(MAI_SUB) }));
    }
  });

  it('TERMS-LOG-03: phiên bản hiện hành là một dòng, mã ngắn hợp lệ; không thêm dòng thứ hai, không cho mã sai khuôn', () => {
    const one = run({ role: 'admin' }, `select (select count(*) from private.terms_version) || '|' || version || '|' || status from private.terms_version`);
    assert.equal(one.rows[0], `1|${CUR}|CHUA_CHOT`);
    assert.equal(run({ role: 'admin' }, `insert into private.terms_version(id, version, note) values (false, 'x', 'n')`).ok, false);
    assert.equal(run({ role: 'admin' }, `update private.terms_version set version = 'có dấu cách'`).ok, false);
  });
});

describe('TERMS-PURGE: xóa theo hộ', { skip }, () => {
  it('TERMS-PURGE-01: purge_household xóa dòng đồng ý của người lớn trong hộ, ghi số dòng vào bằng chứng; người dùng ngoài hộ giữ nguyên', () => {
    const setup = `${ACCEPTED(LAN_SUB)} ${ACCEPTED(MAI_SUB)} ${ACCEPTED('00000000-0000-4000-8000-0000000000a1')}`;
    const r = run(SVC, `select app.purge_household('${HH2}', 'GIA_LAP_DIEN_TAP');
      select count(*) from app.terms_acceptances where user_id = '${LAN_SUB}';
      select count(*) from app.terms_acceptances where user_id = '${MAI_SUB}';
      select count(*) from app.terms_acceptances where user_id = '00000000-0000-4000-8000-0000000000a1';
      select row_counts ->> 'app.terms_acceptances' from app.deletion_evidence order by purged_at desc limit 1`, { setup });
    assert.equal(J(r, 0).ok, true);
    assert.deepEqual(r.rows.slice(1), ['0', '1', '1', '1']);
  });
});
