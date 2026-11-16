// Test T2.8 (D-67): nút "Báo bố mẹ ngay" - con chỉ chọn câu có sẵn, cần đồng ý riêng MD-CONBAO, giữ 7 ngày, không vào báo cáo tuần.
// Mã: ALR-SEND, ALR-READ, ALR-SEEN, ALR-JOB, ALR-WEEKLY. Chạy cùng các test khác bởi scripts/db-test.sh. Dữ liệu: tên giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const HH1 = '00000000-0000-4000-8000-000000000101';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const MEM_HOA = '00000000-0000-4000-8000-000000000201';
const MEM_MINH = '00000000-0000-4000-8000-000000000202';
const BIND_NA = '00000000-0000-4000-8000-000000000401';
const BIND_SU = '00000000-0000-4000-8000-000000000402';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
const DEV_SU = { ...A.CON_CHUA_GHEP, claims: { is_anonymous: true } };
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
const RATE = (r) => rejected(r, 'RATE_LIMITED', 'PT429');

// bố mẹ (QL) đã bật MD-CONBAO cho bé Na (đồng ý riêng cấp con)
const ON = `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
  select '${HH1}', '${NA}', 'MD-CONBAO', 'DONG_Y', '${MEM_HOA}', id from app.policy_versions limit 1;`;
const OFF = `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
  select '${HH1}', '${NA}', 'MD-CONBAO', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1;`;
const GRANT_NL = `insert into app.grants (member_id, child_id, resource, action, purpose_code) values ('${MEM_MINH}', '${NA}', 'alert', 'view', 'MD-CONBAO');`;
const send = (kind, extra = '') => `select app.child_alert_send('${kind}'${extra})`;
const count = `select count(*) from app.child_alerts`;
const SEND1 = `${ON} select 1;`;

describe('ALR-SEND: máy con gửi câu có sẵn (D-67)', { skip }, () => {
  it('ALR-SEND-01: chưa có đồng ý riêng MD-CONBAO thì FORBIDDEN D-67; có rồi thì gửi được, ghi đúng con, máy và mã câu', () => {
    FORBIDDEN(run(DEV_NA, send('KHONG_KHOE')), 'D-67');
    const r = run(DEV_NA, send('DON_SOM'), { setup: ON });
    assert.equal(J(r).kind, 'DON_SOM');
    assert.equal(J(r).replay, false);
    const o = admin(`${ON} select count(*) from app.child_alerts`);
    assert.equal(o.rows[0], '0');
    const row = run(DEV_NA, `${send('GOI_BO_ME')}; ${adm(`select child_id || ':' || binding_id || ':' || kind || ':' || (seen_at is null) from app.child_alerts`)}`, { setup: ON });
    assert.equal(row.rows[1], `${NA}:${BIND_NA}:GOI_BO_ME:true`);
  });
  it('ALR-SEND-02: chỉ ba mã câu; mã lạ, chữ tự do, null bị từ chối; bảng không có cột chữ tự do nào', () => {
    for (const bad of ['', 'TRIEU_CHUNG', 'Con dau bung', 'khong_khoe']) VALIDATION(run(DEV_NA, send(bad), { setup: ON }), 'D-67');
    VALIDATION(run(DEV_NA, `select app.child_alert_send(null)`, { setup: ON }), 'D-67');
    const ins = admin(`${ON} insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'Con dau bung')`);
    assert.equal(ins.code, '23514');
    assert.match(ins.err, /child_alerts_kind_check/, 'chính ràng buộc kind phải chặn (không chỉ nhờ audit)');
    const cols = admin(`select string_agg(column_name || ':' || data_type, ',' order by ordinal_position) from information_schema.columns where table_schema = 'app' and table_name = 'child_alerts'`);
    assert.equal(cols.rows[0], 'id:uuid,created_at:timestamp with time zone,child_id:uuid,binding_id:uuid,kind:text,seen_at:timestamp with time zone,seen_by_member_id:uuid,idempotency_key:uuid');
  });
  it('ALR-SEND-03: chỉ máy con đã ghép: người lớn FORBIDDEN, máy chưa ghép NOT_FOUND, chưa đăng nhập bị từ chối', () => {
    FORBIDDEN(run(QL, send('DON_SOM'), { setup: ON }), 'D-67');
    FORBIDDEN(run(NL, send('DON_SOM'), { setup: ON }), 'D-67');
    NOT_FOUND(run(DEV_SU, send('DON_SOM'), { setup: ON }));
    assert.equal(run(ANON, send('DON_SOM'), { setup: ON }).ok, false);
  });
  it('ALR-SEND-04: epoch của liên kết: đúng thì gửi, sai thì CONFLICT_REV (máy cũ)', () => {
    const ep = Number(admin(`select epoch from app.device_bindings where id = '${BIND_NA}'`).rows[0]);
    assert.ok(run(DEV_NA, send('DON_SOM', `, null, ${ep}`), { setup: ON }).ok);
    rejected(run(DEV_NA, send('DON_SOM', `, null, ${ep + 1}`), { setup: ON }), 'CONFLICT_REV', 'PT409');
  });
  it('ALR-SEND-05: hộ đóng băng -> FROZEN; liên kết đã hủy -> NOT_FOUND', () => {
    FROZEN(run(DEV_NA, send('DON_SOM'), { setup: `${ON} ${FREEZE}` }));
    NOT_FOUND(run(DEV_NA, send('DON_SOM'), { setup: `${ON} update app.device_bindings set state = 'DA_HUY' where id = '${BIND_NA}';` }));
  });
  it('ALR-SEND-06: rút MD-CONBAO hoặc rút lõi MD-LICH thì không gửi được nữa', () => {
    FORBIDDEN(run(DEV_NA, send('DON_SOM'), { setup: `${ON} ${OFF}` }), 'D-67');
    FORBIDDEN(run(DEV_NA, send('DON_SOM'), { setup: `${ON} insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
      select '${HH1}', '${NA}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1;` }), 'D-67');
  });
  it('ALR-SEND-07: giới hạn 6 lần mỗi giờ mỗi con (RATE_LIMITED); sau giờ cũ lại gửi được; tham số CHUA_CHOT', () => {
    const six = `do $s$ begin for i in 1..6 loop perform app.child_alert_send('DON_SOM'); end loop; end $s$;`;
    RATE(run(DEV_NA, `${six} ${send('DON_SOM')}`, { setup: ON }));
    assert.ok(run(DEV_NA, `${six} ${adm(`update app.child_alerts set created_at = now() - interval '2 hours'`)} ${send('DON_SOM')}`, { setup: ON }).ok);
    const p = admin(`select value_int || ':' || status from private.params where key = 'child_alert_max_per_hour'`);
    assert.equal(p.rows[0], '6:CHUA_CHOT');
  });
  it('ALR-SEND-08: gửi lặp cùng khóa trả bản cũ (replay), không ghi thêm, không tính vào giới hạn; khóa của câu khác -> VALIDATION', () => {
    const K = '11111111-1111-4111-8111-111111111111';
    const r = run(DEV_NA, `${send('DON_SOM', `, '${K}'`)}; ${send('DON_SOM', `, '${K}'`)}; ${adm(count)}`, { setup: ON });
    assert.equal(J(r, 0).replay, false);
    assert.equal(J(r, 1).replay, true);
    assert.equal(J(r, 0).id, J(r, 1).id);
    assert.equal(r.rows[2], '1');
    VALIDATION(run(DEV_NA, `${send('DON_SOM', `, '${K}'`)}; ${send('GOI_BO_ME', `, '${K}'`)}`, { setup: ON }), 'idempotency');
    const six = `do $s$ begin for i in 1..5 loop perform app.child_alert_send('DON_SOM'); end loop; end $s$;`;
    const full = run(DEV_NA, `${send('DON_SOM', `, '${K}'`)}; ${six} ${send('DON_SOM', `, '${K}'`)}`, { setup: ON });
    assert.equal(J(full, 1).replay, true, 'gửi lặp vẫn trả bản cũ khi đã chạm giới hạn');
  });
  it('ALR-SEND-09: audit alert.sent chỉ có meta {kind}, người thực hiện là máy con, chủ thể child:mã; không có audit nào khác từ việc gửi', () => {
    const r = run(DEV_NA, `${send('KHONG_KHOE')}; ${adm(`select string_agg(event_code || '|' || actor_kind || '|' || subject_ref || '|' || meta::text, ';') from app.audit_log where event_code like 'alert.%'`)}`, { setup: ON });
    assert.equal(r.rows[1], `alert.sent|child_device|child:${NA}|{"kind": "KHONG_KHOE"}`);
    const k = admin(`select allowed_meta_keys::text from private.audit_events where event_code = 'alert.sent'`);
    assert.equal(k.rows[0], '{kind}');
  });
  it('ALR-SEND-10: không ghi trực tiếp: authenticated không INSERT/UPDATE/DELETE bảng', () => {
    for (const who of [QL, NL, DEV_NA, HK]) {
      const i = run(who, `insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'DON_SOM')`, { setup: ON });
      assert.equal(i.code, '42501');
      assert.equal(run(who, `update app.child_alerts set kind = 'DON_SOM'`, { setup: `${ON} insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'GOI_BO_ME');` }).code, '42501');
      assert.equal(run(who, `delete from app.child_alerts`, { setup: `${ON} insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'GOI_BO_ME');` }).code, '42501');
    }
  });
});

const ONE = `${ON} insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'DON_SOM');`;

describe('ALR-READ: ai đọc được thông báo của con (D-67)', { skip }, () => {
  it('ALR-READ-01: QL đọc; NL chỉ khi có grant MD-CONBAO; máy con chỉ cái do máy đó gửi; hộ khác và anon không', () => {
    assert.equal(run(QL, count, { setup: ONE }).rows[0], '1');
    assert.equal(run(NL, count, { setup: ONE }).rows[0], '0');
    assert.equal(run(NL, count, { setup: `${ONE} ${GRANT_NL}` }).rows[0], '1');
    assert.equal(run(DEV_NA, count, { setup: ONE }).rows[0], '1');
    assert.equal(run(DEV_SU, count, { setup: ONE }).rows[0], '0');
    assert.equal(run(HK, count, { setup: ONE }).rows[0], '0');
    assert.equal(run(ANON, count, { setup: ONE }).code, '42501');
  });
  it('ALR-READ-02: máy con KHÔNG thấy thông báo do máy khác gửi cho cùng con (dòng của máy khác bị ẩn)', () => {
    const other = `insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_SU}', 'GOI_BO_ME');`;
    assert.equal(run(DEV_NA, count, { setup: `${ONE} ${other}` }).rows[0], '1');
    assert.equal(run(QL, count, { setup: `${ONE} ${other}` }).rows[0], '2');
  });
  it('ALR-READ-03: rút MD-CONBAO thì bố mẹ không thấy nữa; đồng ý lại KHÔNG làm thông báo cũ hiện lại, thông báo mới hiện', () => {
    assert.equal(run(QL, count, { setup: `${ONE} ${OFF}` }).rows[0], '0');
    const r = run(QL, `${count}; ${adm(`${ON} insert into app.child_alerts (child_id, binding_id, kind) values ('${NA}', '${BIND_NA}', 'KHONG_KHOE')`)}; ${count}`, { setup: `${ONE} ${OFF}` });
    assert.equal(r.rows[0], '0');
    assert.equal(r.rows[1], '1');
  });
  it('ALR-READ-04: quá child_alert_retention_days (7) thì không ai thấy, kể cả khi job chưa chạy', () => {
    const old = `update app.child_alerts set created_at = now() - interval '8 days';`;
    for (const who of [QL, DEV_NA]) assert.equal(run(who, count, { setup: `${ONE} ${old}` }).rows[0], '0');
    assert.equal(run(QL, count, { setup: ONE }).rows[0], '1', 'thông báo mới thì thấy');
  });
  it('ALR-READ-05: hồ sơ con bị ẩn thì bố mẹ không còn thấy (hộ đóng băng vẫn đọc được)', () => {
    assert.equal(run(QL, count, { setup: `${ONE} ${FREEZE}` }).rows[0], '1');
  });
});

describe('ALR-SEEN: người lớn đánh dấu đã xem (D-67)', { skip }, () => {
  const id = `(select id from app.child_alerts limit 1)`;
  const ID = `reset role;\nselect id as aid from app.child_alerts limit 1 \\gset\nset local role authenticated;\n`;
  it('ALR-SEEN-01: QL đánh dấu; lần hai không đổi người xem đầu; ghi đúng thành viên', () => {
    const r = run(QL, `${ID}select app.child_alert_seen(:'aid'::uuid); select app.child_alert_seen(:'aid'::uuid); ${adm(`select (seen_by_member_id = '${MEM_HOA}') || ':' || (seen_at is not null) from app.child_alerts`)}`, { setup: ONE });
    assert.equal(J(r, 0).changed, true);
    assert.equal(J(r, 1).changed, false);
    assert.equal(r.rows[2], 'true:true');
  });
  it('ALR-SEEN-02: NL cần grant MD-CONBAO; máy con FORBIDDEN; hộ khác NOT_FOUND; thông báo không tồn tại NOT_FOUND', () => {
    assert.equal(run(NL, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: `${ONE} ${GRANT_NL}` }).ok, true);
    assert.equal(run(NL, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: ONE }).ok, false);
    FORBIDDEN(run(DEV_NA, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: ONE }), 'D-67');
    NOT_FOUND(run(HK, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: ONE }));
    NOT_FOUND(run(QL, `select app.child_alert_seen('99999999-9999-4999-8999-999999999999')`, { setup: ONE }));
  });
  it('ALR-SEEN-03: hộ đóng băng -> FROZEN; thông báo quá hạn hoặc sau khi rút -> NOT_FOUND', () => {
    FROZEN(run(QL, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: `${ONE} ${FREEZE}` }));
    NOT_FOUND(run(QL, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: `${ONE} update app.child_alerts set created_at = now() - interval '8 days';` }));
    FORBIDDEN(run(QL, `${ID}select app.child_alert_seen(:'aid'::uuid)`, { setup: `${ONE} ${OFF}` }));
    void id;
  });
});

describe('ALR-JOB: xóa thật sau 7 ngày (D-67)', { skip }, () => {
  it('ALR-JOB-01: tham số child_alert_retention_days = 7 DA_CHOT', () => {
    assert.equal(admin(`select value_int || ':' || status from private.params where key = 'child_alert_retention_days'`).rows[0], '7:DA_CHOT');
  });
  it('ALR-JOB-02: job_daily xóa THẬT thông báo quá 7 ngày, giữ cái mới; báo số đã xóa; chạy lại không đổi', () => {
    const seed = `${ON} insert into app.child_alerts (child_id, binding_id, kind, created_at) values
      ('${NA}', '${BIND_NA}', 'DON_SOM', now() - interval '8 days'), ('${NA}', '${BIND_NA}', 'GOI_BO_ME', now() - interval '30 days'),
      ('${NA}', '${BIND_NA}', 'KHONG_KHOE', now() - interval '6 days'), ('${NA}', '${BIND_NA}', 'KHONG_KHOE', now());`;
    const r = admin(`${seed} select count(*) from app.child_alerts; select private.job_daily(); select count(*) from app.child_alerts;
      select string_agg(kind, ',' order by kind) from app.child_alerts; select private.job_daily(); select private.job_alert_cleanup()`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], '4');
    assert.equal(JSON.parse(r.rows[1]).alerts.deleted, 2);
    assert.equal(r.rows[2], '2');
    assert.equal(r.rows[3], 'KHONG_KHOE,KHONG_KHOE');
    assert.equal(JSON.parse(r.rows[4]).alerts.deleted, 0);
    assert.equal(JSON.parse(r.rows[5]).deleted, 0);
  });
  it('ALR-JOB-03: người dùng đăng nhập không gọi được hàm dọn', () => {
    for (const who of [QL, NL, DEV_NA, ANON]) {
      const r = run(who, `select private.job_alert_cleanup()`);
      assert.equal(r.ok, false);
    }
  });
});

describe('ALR-WEEKLY: không vào báo cáo tuần (D-67)', { skip }, () => {
  it('ALR-WEEKLY-01: thân app.weekly_report không nhắc child_alerts; kết quả y hệt khi có nhiều thông báo', () => {
    const def = admin(`select pg_get_functiondef('app.weekly_report(uuid,text)'::regprocedure)`).rows.join('\n');
    assert.ok(!/child_alerts|alert/i.test(def));
    const q = `select app.weekly_report('${NA}', '2025-W40')`;
    const a = run(QL, q);
    const b = run(QL, q, { setup: `${ON} insert into app.child_alerts (child_id, binding_id, kind, created_at) values
      ('${NA}', '${BIND_NA}', 'KHONG_KHOE', '2025-10-01 09:00+07'), ('${NA}', '${BIND_NA}', 'KHONG_KHOE', '2025-10-02 09:00+07'), ('${NA}', '${BIND_NA}', 'DON_SOM', '2025-10-03 09:00+07');` });
    assert.ok(a.ok && b.ok, a.err || b.err);
    assert.deepEqual(a.rows, b.rows);
    assert.ok(!/KHONG_KHOE|DON_SOM|alert/i.test(a.rows.join('')));
  });
  it('ALR-WEEKLY-02: chỉ các hàm khai trước được nhắc tới bảng child_alerts (không hàm báo cáo/lịch/Pal nào đọc)', () => {
    const r = admin(`select string_agg(n.nspname || '.' || p.proname, ',' order by n.nspname, p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('app', 'private', 'app_internal') and p.prosrc ~ 'child_alerts'`);
    assert.equal(r.rows[0], 'app.child_alert_seen,app.child_alert_send,app.purge_child,app.purge_household,private.job_alert_cleanup');
  });
});
