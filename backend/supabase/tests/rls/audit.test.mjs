// Test T2.5: audit_log tối thiểu và cơ chế ghi (Tech Spec §2.5, Architecture §12; BR-CON-074, BR-CON-035; B01C-OD-07).
// Mã: AUD-01 chỉ-thêm, AUD-02 nội dung (không PIN/mã/token/chữ tự do), AUD-03 sự kiện được ghi đúng, AUD-04 người thực hiện,
// AUD-05 không lộ PIN/mã/token qua luồng thật, AUD-06 đọc theo vai. Dữ liệu: chỉ tên giả; PIN/mã trong test là giá trị thử.
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
const BIND_NA = '00000000-0000-4000-8000-000000000401';
const DEV_NEW_SUB = '00000000-0000-4000-8000-0000000000a7';
const PIN = '482916';
const CODE = '135790';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';

const QL = A.QL, NL = A.NL, HK = A.HO_KHAC, ANON = A.ANON;
const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
const DEV_NEW = { role: 'authenticated', sub: DEV_NEW_SUB, claims: { is_anonymous: true } };
const as = (a) => `select set_config('request.jwt.claims', '${JSON.stringify({ sub: a.sub, role: a.role, ...(a.claims || {}) })}', true) as _s \\gset\n`;
const adm = (sql) => `reset role;\n${sql};\nset local role authenticated;\n`;
const log = (where = 'true') => `select string_agg(event_code || '|' || actor_kind || '|' || coalesce(subject_ref, '') || '|' || meta::text, ';' order by at, id) from app.audit_log where ${where}`;

describe('AUD-01: audit_log chỉ-thêm', { skip }, () => {
  it('AUD-01a: không sửa, không xóa, không truncate - kể cả quản trị và service_role', () => {
    const seed = admin(`select count(*) from app.audit_log`);
    assert.ok(Number(seed.rows[0]) > 0, 'seed phải có dòng audit (sự kiện đồng ý/ghép)');
    for (const who of [{ role: 'admin' }, { role: 'service_role' }]) {
      for (const sql of [`update app.audit_log set event_code = 'mode.changed'`, `delete from app.audit_log`, `truncate app.audit_log`]) {
        const r = run(who, sql);
        assert.equal(r.ok, false, `${who.role}: ${sql}`);
        assert.equal(r.code, '55000', `${who.role}: ${sql} -> ${r.code}`);
      }
    }
  });
  it('AUD-01b: người dùng đăng nhập không ghi trực tiếp được (42501) và không gọi được hàm ghi nội bộ', () => {
    for (const who of [QL, NL, DEV_NA, HK, ANON]) {
      const r = run(who, `insert into app.audit_log (household_id, actor_kind, event_code) values ('${HH1}', 'system', 'mode.changed')`);
      assert.equal(r.ok, false);
      assert.equal(r.code, '42501');
    }
    const f = run(QL, `select private.audit_write('${HH1}', 'system', null, 'mode.changed')`);
    assert.equal(f.ok, false);
    assert.equal(f.code, '42501');
  });
});

describe('AUD-02: nội dung - không PIN, mã ghép, token, chữ tự do, lựa chọn hỏi thăm (BR-CON-074)', { skip }, () => {
  const ins = (event, meta, subject = null) => admin(`insert into app.audit_log (household_id, actor_kind, event_code, subject_ref, meta)
    values ('${HH1}', 'system', '${event}', ${subject ? `'${subject}'` : 'null'}, '${JSON.stringify(meta)}'::jsonb)`);

  it('AUD-02a: mọi sự kiện, mọi khóa cấm (pin, code, token, choice, text, name...) đều bị từ chối', () => {
    const events = admin(`select event_code from private.audit_events order by 1`).rows;
    assert.ok(events.length >= 8);
    const bad = ['pin', 'pin_hash', 'code', 'pair_code', 'ma_ghep', 'token', 'fcm_token', 'confirm_token', 'hmac', 'secret', 'choice',
      'lua_chon', 'text', 'note', 'free_text', 'call_name', 'name', 'email', 'symptom', 'message'];
    for (const e of events) {
      for (const k of bad) {
        const r = ins(e, { [k]: 'x' });
        assert.equal(r.ok, false, `${e} nhận khóa cấm ${k}`);
        assert.equal(r.code, '23514', `${e}/${k}`);
      }
    }
  });
  it('AUD-02b: giá trị phải là mã ngắn: không khoảng trắng/tiếng Việt, không chuỗi toàn chữ số dài (PIN, mã 6 số), không số lớn, không object/mảng', () => {
    const bads = [`chị Hoa buồn`, PIN, CODE, 'a'.repeat(41), 'x y', '1234'];
    for (const v of bads) {
      const r = ins('mode.changed', { old_mode: v });
      assert.equal(r.ok, false, `chấp nhận giá trị "${v}"`);
      assert.equal(r.code, '23514');
      assert.doesNotMatch(r.err, new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'thông báo lỗi không được lặp lại giá trị vi phạm');
    }
    for (const v of [482916, 1000, 1.5, { a: 1 }, ['x']]) {
      assert.equal(ins('binding.paired', { epoch: v }).ok, false, `chấp nhận ${JSON.stringify(v)}`);
    }
    assert.equal(ins('mode.changed', 'khong-phai-object').ok, false);
  });
  it('AUD-02c: subject_ref chỉ dạng loại:mã (không chữ tự do, không số dài)', () => {
    for (const s of ['chị Hoa', 'child:482916', 'Child:abc', 'child abc', 'child:']) {
      const r = admin(`insert into app.audit_log (household_id, actor_kind, event_code, subject_ref) values ('${HH1}', 'system', 'mode.changed', '${s}')`);
      assert.equal(r.ok, false, s);
      assert.equal(r.code, '23514', s);
    }
  });
  it('AUD-02d: bản ghi hợp lệ được nhận; sự kiện lạ và kiểu người thực hiện sai bị từ chối', () => {
    assert.ok(ins('binding.unlinked', { epoch: 3, reason: 'PIN_QL' }, `child:${NA}`).ok);
    assert.ok(ins('consent.granted', { purpose: 'MD-SUCKHOE', origin: 'MOT_MUC', self: false }, `child:${NA}`).ok);
    assert.equal(ins('child.pressed_help', {}).ok, false);
    const noId = admin(`insert into app.audit_log (household_id, actor_kind, event_code) values ('${HH1}', 'adult', 'mode.changed')`);
    assert.equal(noId.code, '23514');
    const sysId = admin(`insert into app.audit_log (household_id, actor_kind, actor_id, event_code) values ('${HH1}', 'system', '${MEM_HOA}', 'mode.changed')`);
    assert.equal(sysId.code, '23514');
  });
  it('AUD-02e: danh mục sự kiện cố định; KHÔNG có sự kiện nào cho nút "Con cần giúp đỡ" hay hỏi thăm (BR-CON-035, D-38)', () => {
    const codes = admin(`select event_code from private.audit_events order by 1`).rows;
    assert.deepEqual(codes, ['alert.sent', 'binding.paired', 'binding.requested', 'binding.unlinked', 'child.hidden', 'consent.granted',
      'consent.withdrawn', 'deletion.requested', 'health.added', 'health.deleted', 'health.updated', 'household.closing', 'household.frozen',
      'household.reopened', 'mode.changed', 'plan.changed', 'schedule.committed', 'setting.changed']);
    assert.ok(!codes.some((c) => /help|checkin|hoi_tham|safety|talk/i.test(c)));
  });
});

describe('AUD-03: sự kiện được ghi đúng, cùng giao dịch (Tech Spec §4.1)', { skip }, () => {
  const FLOW_SETUP = `update app.children set has_device = true where id = '${BIN}';
    insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${DEV_NEW_SUB}', private.pair_hmac('${CODE}'), now() + interval '10 minutes');`;

  it('AUD-03a: ghép máy: binding.requested (QL nhập mã) rồi binding.paired (máy con đồng ý), kèm epoch', () => {
    const r = run(QL, `select app.pair_confirm('${BIN}', '${CODE}', '${PIN}'); ${as(DEV_NEW)} select app.pair_accept();
      ${adm(log(`event_code like 'binding.%' and subject_ref = 'child:${BIN}'`))}`, { setup: FLOW_SETUP });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[2], `binding.requested|adult|child:${BIN}|{"epoch": 1, "state": "CHO_XAC_NHAN_MAY_CON"};binding.paired|child_device|child:${BIN}|{"epoch": 2}`);
  });
  it('AUD-03b: hủy liên kết (unlink_device bằng PIN): binding.unlinked kèm epoch mới và lý do dạng mã', () => {
    const r = run(QL, `${adm(`select private.pin_store('${MEM_HOA}', '${PIN}')`)} select app.unlink_device('${NA}', '${PIN}', null);
      ${adm(log(`event_code = 'binding.unlinked'`))}`);
    assert.ok(r.ok, r.err);
    assert.match(r.rows[1], /^binding\.unlinked\|adult\|child:.*\|\{"epoch": 2, "reason": "PIN_QL"\}$/);
  });
  it('AUD-03c: PIN sai (không hủy) thì không ghi binding.unlinked', () => {
    const r = run(QL, `${adm(`select private.pin_store('${MEM_HOA}', '${PIN}')`)} select app.unlink_device('${NA}', '000000', null);
      ${adm(`select count(*) from app.audit_log where event_code = 'binding.unlinked'`)}`);
    assert.equal(r.rows[1], '0');
  });
  it('AUD-03d: mode_set: mode.changed kèm mode cũ, mới, epoch; cùng mode không ghi', () => {
    const r = run(QL, `select app.mode_set('${NA}', 'PARENT_LED'); select app.mode_set('${NA}', 'PARENT_LED');
      ${adm(log(`event_code = 'mode.changed'`))}`);
    assert.equal(r.rows[2], `mode.changed|adult|child:${NA}|{"new_mode": "PARENT_LED", "old_mode": "CHILD_EXECUTED", "mode_epoch": 2}`);
  });
  it('AUD-03e: đồng ý và rút: consent.withdrawn / consent.granted kèm mục đích, nguồn gốc, self (by_child chỉ khi con đồng ý)', () => {
    const r = run(QL, `select app.consent_record('${NA}', 'MD-SUCKHOE', 'RUT'); select app.consent_record('${NA}', 'MD-SUCKHOE', 'DONG_Y');
      ${adm(log(`at > now() - interval '1 minute' and household_id = '${HH1}' and subject_ref = 'child:${NA}' and event_code like 'consent.%' and actor_kind = 'adult'`))}`);
    assert.equal(r.rows[2],
      'consent.withdrawn|adult|child:' + NA + '|{"self": false, "origin": "MOT_MUC", "purpose": "MD-SUCKHOE"};' +
      'consent.granted|adult|child:' + NA + '|{"self": false, "origin": "MOT_MUC", "purpose": "MD-SUCKHOE"}');
  });
  it('AUD-03f: child_delete: child.hidden + binding.unlinked (lý do XOA_HO_SO); rút toàn bộ: consent.withdrawn RUT_TOAN_BO, binding.unlinked, child.hidden, deletion.requested', () => {
    const d = run(QL, `select app.child_delete('${NA}', true); ${adm(log(`event_code in ('child.hidden', 'binding.unlinked') and subject_ref = 'child:${NA}' and actor_kind = 'adult'`))}`);
    assert.match(d.rows[1], /binding\.unlinked\|adult\|child:.*"reason": "XOA_HO_SO"/);
    assert.match(d.rows[1], /child\.hidden\|adult\|child:.*"reason": "XOA"/);
    const w = run(QL, `select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset
      select app.consent_withdraw_all('${NA}', :'tok'::uuid);
      ${adm(`select string_agg(event_code, ',' order by at, id) from app.audit_log where actor_kind = 'adult' and at > now() - interval '1 minute'`)}`);
    assert.ok(w.ok, w.err);
    assert.equal(w.rows[1], 'consent.withdrawn,consent.withdrawn,binding.unlinked,child.hidden,deletion.requested');
  });
  it('AUD-03g: dòng audit nằm cùng giao dịch - hành động bị hủy thì dòng audit cũng mất', () => {
    const r = run({ role: 'admin' }, `select count(*) as before from app.audit_log \\gset
      savepoint s1;
      update app.children set mode = 'PARENT_LED', mode_epoch = mode_epoch + 1 where id = '${NA}';
      rollback to savepoint s1;
      select count(*) = :before from app.audit_log`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[r.rows.length - 1], 't');
  });
  it('AUD-03h: lý do dạng chữ tự do trong cột gốc (hidden_reason) không lọt vào audit: gộp thành KHAC', () => {
    const r = admin(`update app.children set hidden_at = now(), hidden_reason = 'nguyen van a bi om' where id = '${BIN}';
      ${log(`event_code = 'child.hidden'`)}`);
    assert.ok(r.ok, r.err);
    assert.match(r.rows[r.rows.length - 1], /"reason": "KHAC"/);
    assert.doesNotMatch(r.rows[r.rows.length - 1], /nguyen/);
  });
});

describe('AUD-04: người thực hiện', { skip }, () => {
  it('AUD-04: adult -> members.id, child_device -> device_bindings.id, system (không có auth.uid) -> không actor_id', () => {
    const r = run(QL, `${adm(`select private.pin_store('${MEM_HOA}', '${PIN}')`)}
      select app.mode_set('${NA}', 'PARENT_LED');
      ${as(DEV_NA)} select app.unlink_device('${NA}', '${PIN}', 1);
      ${as({ role: 'service_role' })}${adm(`update app.children set mode = 'UNSET', mode_epoch = mode_epoch + 1 where id = '${BIN}'`)}
      ${adm(`select actor_kind || ':' || coalesce(actor_id::text, '-') from app.audit_log where event_code = 'mode.changed' and subject_ref = 'child:${BIN}'`)};
      ${adm(`select actor_kind || ':' || actor_id from app.audit_log where event_code = 'binding.unlinked' and subject_ref = 'child:${NA}'`)};
      ${adm(`select actor_kind || ':' || actor_id from app.audit_log where event_code = 'mode.changed' and subject_ref = 'child:${NA}'`)}`);
    assert.ok(r.ok, r.err);
    const [sys, dev, adult] = r.rows.slice(-3);
    assert.equal(sys, 'system:-');
    assert.equal(dev, `child_device:${BIND_NA}`);
    assert.equal(adult, `adult:${MEM_HOA}`);
  });
});

describe('AUD-05: không lộ PIN, mã ghép, token qua luồng thật (BR-CON-074)', { skip }, () => {
  it('AUD-05: chạy ghép máy có PIN, hủy bằng PIN, rút toàn bộ có mã xác nhận; quét toàn bộ audit_log tìm PIN, mã, token', () => {
    const setup = `update app.children set has_device = true where id = '${BIN}';
      insert into private.pairing_codes(device_user_id, code_hmac, expires_at) values ('${DEV_NEW_SUB}', private.pair_hmac('${CODE}'), now() + interval '10 minutes');`;
    const r = run(QL, `select app.pair_confirm('${BIN}', '${CODE}', '${PIN}'); ${as(DEV_NEW)} select app.pair_accept(); ${as(QL)}
      select app.unlink_device('${BIN}', '${PIN}', null);
      select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset
      select app.consent_withdraw_all('${NA}', :'tok'::uuid);
      ${adm(`select count(*) from app.audit_log`)};
      ${adm(`select (select count(*) from app.audit_log a where a::text like '%${PIN}%' or a::text like '%${CODE}%' or a::text like '%' || :'tok' || '%')`)};
      ${adm(`select (select count(*) from app.audit_log a where a::text like '%' || (select pin_hash from private.parent_pins limit 1) || '%')`)}`, { setup });
    assert.ok(r.ok, r.err);
    const [n, leakPlain, leakHash] = r.rows.slice(-3);
    assert.ok(Number(n) >= 8, `ít dòng audit bất thường: ${n}`);
    assert.equal(leakPlain, '0', 'PIN, mã ghép hoặc token lọt vào audit_log');
    assert.equal(leakHash, '0', 'băm PIN lọt vào audit_log');
  });
});

describe('AUD-06: đọc theo vai (Tech Spec §2.7)', { skip }, () => {
  it('AUD-06: QL đọc dòng của hộ mình; NL, máy con không đọc; hộ khác chỉ thấy hộ mình; anon bị từ chối; QL không thấy dòng hộ 2', () => {
    const cnt = (who) => run(who, `select count(*) from app.audit_log`).rows[0];
    assert.equal(cnt(QL), '5');
    assert.equal(cnt(NL), '0');
    assert.equal(cnt(DEV_NA), '0');
    assert.equal(cnt(HK), '3');
    const other = run(QL, `select count(*) from app.audit_log where household_id <> '${HH1}'`);
    assert.equal(other.rows[0], '0');
    const a = run(ANON, `select count(*) from app.audit_log`);
    assert.equal(a.ok, false);
    assert.equal(a.code, '42501');
  });
});
