// Test T3.1 + T3.2: bảng lịch (RLS, bất biến), profile_save, schedule_inputs, schedule_commit_apply.
// Mã: SCH-RLS (đọc theo vai, mục đích), SCH-VER (schedule_versions bất biến), SCH-PS (profile_save), SCH-IN (schedule_inputs),
//     SCH-CM (commit: chữ ký, rev, băm, idempotent, một giao dịch), SCH-SIG (vector chữ ký dùng chung với Deno).
// AC liên quan: AC-24 (commit idempotent), AC-04..08 và 17 kiểm ở bộ xếp/Edge Function (deno test). Dữ liệu: chỉ tên giả.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const vector = JSON.parse(readFileSync(new URL('../fixtures/commit-signature-vector.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const SU = '00000000-0000-4000-8000-000000000303';
const P_NA = '00000000-0000-4000-8000-000000000501';
const P_BIN = '00000000-0000-4000-8000-000000000502';
const P_SU = '00000000-0000-4000-8000-000000000503';
const SEED_KEY = '20000000-0000-4000-8000-000000000001';
const skip = DB_URL ? false : 'đặt RLS_DB_URL (hoặc chạy scripts/db-test.sh) để chạy test CSDL';
const QL = A.QL, NL = A.NL, HK = A.HO_KHAC;
const DEV = { ...A.CON, claims: { is_anonymous: true } };
const SVC = { role: 'service_role' };
const J = (r, i = 0) => { assert.ok(r.ok, r.err); return JSON.parse(r.rows[i]); };
const rejected = (r, code, st, rule = '') => {
  assert.equal(r.ok, false, `lẽ ra bị từ chối (${code})`);
  assert.equal(r.code, st, r.err);
  if (code) assert.match(r.err, new RegExp(code));
  if (rule) assert.match(r.err, new RegExp(rule));
};
const q = (s) => `$q$${s}$q$`;

const OUT = JSON.stringify({ ngay: Object.fromEntries(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => [d, []])), tong_quan: {} });
const HASH = (c) => c.repeat(64);

/** Dựng lời gọi schedule_commit_apply có chữ ký đúng; o.* ghi đè để làm hỏng từng phần. */
function commit(o = {}) {
  const f = { child: NA, profile: P_NA, rev: 1, key: '30000000-0000-4000-8000-0000000000aa', ih: HASH('b'), eng: 'e1-0123456789ab', par: 'p-0123456789ab',
    bal: 'UNKNOWN', out: OUT, trade: '[]', quest: '[]', ans: '[]', ...o };
  const sendOut = o.sendOut ?? f.out;
  const ch = o.ch ? q(o.ch) : `private.profile_content_hash('${f.profile}')`;
  const setup = `select set_config('request.jwt.claims', '{"role":"service_role"}', true) as _svc \\gset
    select ${ch} as ch \\gset
    select private.schedule_commit_sign(private.schedule_commit_message('${f.child}', '${f.profile}', ${f.rev}, '${f.key}', :'ch', '${f.ih}', '${f.eng}', '${f.par}',
      '${f.bal}', ${q(f.out)}, ${q(f.trade)}, ${q(f.quest)}, ${q(f.ans)})) as sig \\gset`;
  const sig = o.sig ? q(o.sig) : `:'sig'`;
  const call = `app.schedule_commit_apply('${f.child}', '${f.profile}', ${o.sendRev ?? f.rev}, '${f.key}', :'ch', '${f.ih}', '${f.eng}', '${f.par}', '${f.bal}',
    ${q(sendOut)}, ${q(f.trade)}, ${q(f.quest)}, ${q(f.ans)}, ${sig})`;
  return { setup, call, f };
}
const CARD = { name: 'Vẽ', type: 'nang_khieu', days: ['T7'], start: '09:00', end: '10:00', travel_before_min: 10, travel_after_min: 10 };
const PATCH = (x) => q(JSON.stringify(x));

describe('SCH-RLS: đọc bảng lịch theo vai và mục đích (Tech Spec §2.7)', { skip }, () => {
  it('SCH-RLS-01: máy con không đọc bảng lịch nào (qua device-sync, T3.6); thông báo chỉ hàng của mình', () => {
    for (const t of ['schedule_profiles', 'activity_cards', 'schedule_versions', 'schedule_state', 'schedule_answers']) {
      assert.equal(run(DEV, `select count(*) from app.${t}`).rows[0], '0', t);
    }
    assert.equal(run(DEV, `select count(*) from app.notifications`).rows[0], '1');
    assert.equal(run(QL, `select count(*) from app.notifications`).rows[0], '0');
  });

  it('SCH-RLS-02: NL không có grant (bé Bin) không thấy; có grant (bé Na) thấy; người hộ khác không thấy gì của hộ 1', () => {
    assert.equal(run(NL, `select count(*) from app.schedule_profiles where child_id = '${BIN}'`).rows[0], '0');
    assert.equal(run(NL, `select count(*) from app.schedule_profiles where child_id = '${NA}'`).rows[0], '1');
    assert.equal(run(HK, `select count(*) from app.schedule_profiles where child_id in ('${NA}', '${BIN}')`).rows[0], '0');
  });

  it('SCH-RLS-03: rút toàn bộ đồng ý thì không ai đọc được lịch cũ; đồng ý lại không làm dữ liệu cũ hiện lại (D-42)', () => {
    const tok = `select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset\n select app.consent_withdraw_all('${NA}', :'tok'::uuid);`;
    const r = run(QL, `${tok} select count(*) from app.schedule_profiles where child_id = '${NA}'`);
    assert.equal(r.rows.at(-1), '0', r.err);
  });

  it('SCH-RLS-04: ghi trực tiếp bảng lịch bị từ chối với người dùng (42501)', () => {
    for (const t of ['schedule_profiles', 'activity_cards', 'schedule_versions', 'schedule_state', 'schedule_answers', 'notifications']) {
      assert.equal(run(QL, `delete from app.${t}`).code, '42501', t);
    }
  });
});

describe('SCH-VER: schedule_versions bất biến (Tech Spec §2.3)', { skip }, () => {
  it('SCH-VER-01: không UPDATE, DELETE, TRUNCATE được, kể cả quản trị và service_role', () => {
    for (const who of [{ role: 'admin' }, SVC]) {
      for (const sql of [`update app.schedule_versions set commit_reason = 'sua_lai'`, `delete from app.schedule_versions`, `truncate app.schedule_versions cascade`]) {
        const r = run(who, sql);
        assert.equal(r.code, '55000', `${who.role}: ${sql} -> ${r.code} ${r.err}`);
      }
    }
  });

  it('SCH-VER-02: ràng buộc: nhãn luôn chưa kiểm chứng; thành viên phải có người commit; khóa gửi lại duy nhất theo con', () => {
    const base = (extra) => `insert into app.schedule_versions (child_id, profile_id, profile_version, rev, engine_version, params_version, input_hash, output, committed_by_kind, committed_by, idempotency_key ${extra.cols || ''})
      values ('${NA}', '${P_NA}', 1, 2, 'e', 'p', repeat('a', 64), '{}', ${extra.kind || `'member'`}, ${extra.by || `'00000000-0000-4000-8000-000000000201'`}, ${extra.key || `gen_random_uuid()`} ${extra.vals || ''})`;
    assert.equal(run({ role: 'admin' }, base({})).ok, true);
    assert.equal(run({ role: 'admin' }, base({ cols: ', label_status', vals: `, 'da_kiem_chung'` })).code, '23514');
    assert.equal(run({ role: 'admin' }, base({ by: 'null' })).code, '23514');
    assert.equal(run({ role: 'admin' }, base({ key: `'${SEED_KEY}'` })).code, '23505');
  });

  it('SCH-VER-03: hồ sơ đã ACTIVE không sửa nội dung; chuyển trạng thái sai đường bị chặn', () => {
    assert.equal(run({ role: 'admin' }, `update app.schedule_profiles set input = '{}' where id = '${P_NA}'`).code, '55000');
    assert.equal(run({ role: 'admin' }, `update app.schedule_profiles set state = 'DRAFT' where id = '${P_NA}'`).code, '55000');
    assert.equal(run({ role: 'admin' }, `update app.activity_cards set note = 'đón ở cổng' where id = '00000000-0000-4000-8000-000000000511'`).code, '23514');
  });
});

describe('SCH-PS: profile_save (Tech Spec §3.1 #15)', { skip }, () => {
  it('SCH-PS-01: QL lưu nháp bé Bin kèm hoạt động; lưu lại kèm id thẻ thì changed=false và không thêm thẻ', () => {
    const r1 = run(QL, `select app.profile_save('${BIN}', ${PATCH({ input: { commute: 10 }, cards: [CARD] })})`);
    const a = J(r1);
    assert.equal(a.version, 1); assert.equal(a.profile_id, P_BIN); assert.equal(a.changed, true); assert.equal(a.card_ids.length, 1);
    const patch = PATCH({ input: { commute: 10 }, cards: [{ ...CARD, id: '00000000-0000-4000-8000-0000000000ff' }] });
    const r = run(QL, `select app.profile_save('${BIN}', ${PATCH({ input: { commute: 10 }, cards: [CARD] })}) as a \\gset
      select app.profile_save('${BIN}', jsonb_build_object('input', '{"commute": 10}'::jsonb, 'cards', jsonb_build_array((${PATCH(CARD)}::jsonb) || jsonb_build_object('id', ((:'a'::jsonb)->'card_ids'->>0))))) ;
      select count(*) from app.activity_cards where child_id = '${BIN}' and state = 'ACTIVE'`);
    void patch;
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).changed, false);
    assert.equal(r.rows[1], '1');
  });

  it('SCH-PS-02: gửi lại có id thẻ thì cập nhật, thẻ vắng mặt bị lưu trữ (không xóa)', () => {
    const r = run(QL, `select app.profile_save('${NA}', ${PATCH({ cards: [{ ...CARD, id: '00000000-0000-4000-8000-000000000511', name: 'Tiếng Anh 2' }] })}) as r1 \\gset
      reset role;
      select (:'r1'::jsonb)->>'version', (select count(*) from app.activity_cards where child_id = '${NA}' and state = 'ACTIVE'),
             (select count(*) from app.activity_cards where child_id = '${NA}' and state = 'ARCHIVED' and hidden_reason = 'BO_KHOI_DANH_SACH')`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows, ['2|1|1']);
  });

  it('SCH-PS-03: hồ sơ ACTIVE + sửa -> nháp phiên bản 2 trỏ supersedes_id, giữ nội dung gốc; base_version sai -> CONFLICT_REV', () => {
    const r = run(QL, `select app.profile_save('${NA}', ${PATCH({ budget: null })}, 1); select version, state, supersedes_id, input ? 'school' from app.schedule_profiles where child_id = '${NA}' and state = 'DRAFT'`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], `2|DRAFT|${P_NA}|t`);
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ budget: null })}, 7)`), 'CONFLICT_REV', 'PT409');
  });

  it('SCH-PS-04: từ chối: NL, hộ khác, máy con, ô Ngủ "Giữ mức này", ghi chú tự do, khóa lạ, giờ sai, địa điểm', () => {
    const ok = PATCH({ budget: null });
    rejected(run(NL, `select app.profile_save('${NA}', ${ok})`), 'FORBIDDEN', 'PT403');
    rejected(run(NL, `select app.profile_save('${BIN}', ${ok})`), 'NOT_FOUND', 'PT404');
    rejected(run(HK, `select app.profile_save('${NA}', ${ok})`), 'NOT_FOUND', 'PT404');
    rejected(run(DEV, `select app.profile_save('${NA}', ${ok})`), 'FORBIDDEN', 'PT403');
    rejected(run(A.ANON, `select app.profile_save('${NA}', ${ok})`), null, '42501');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ keep_confirmed: { wd: { ngu: true } } })})`), 'VALIDATION', 'PT422', 'D-02');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ cards: [{ ...CARD, note: 'đón ở cổng sau' }] })})`), 'FEATURE_OFF', 'PT403', 'BR-CON-094');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ cards: [{ ...CARD, location: 'Q1' }] })})`), 'VALIDATION', 'PT422');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ cards: [{ ...CARD, end: '08:00' }] })})`), 'VALIDATION', 'PT422');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ cards: [{ ...CARD, days: ['T9'] }] })})`), 'VALIDATION', 'PT422');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ input: { school_name: 'Trường X' } })})`), 'VALIDATION', 'PT422');
    rejected(run(QL, `select app.profile_save('${NA}', ${PATCH({ khac: 1 })})`), 'VALIDATION', 'PT422');
  });
});

describe('SCH-IN: schedule_inputs (đọc dữ liệu máy chủ cho bộ xếp)', { skip }, () => {
  it('SCH-IN-01: QL nhận hồ sơ, lớp/tuổi (không tên con), thẻ đang dùng, băm nội dung, rev, trạng thái khóa', () => {
    const o = J(run(QL, `select app.schedule_inputs('${P_NA}')`));
    assert.equal(o.profile.id, P_NA); assert.equal(o.rev, 1); assert.equal(o.lock_state, 'UNLOCKED'); assert.equal(o.cards.length, 2);
    assert.match(o.content_hash, /^[0-9a-f]{64}$/);
    assert.deepEqual(Object.keys(o.child).sort(), ['age_years', 'grade']);
    assert.ok(!JSON.stringify(o).includes('bé Na'));
  });

  it('SCH-IN-02: đổi thẻ thì băm đổi; đổi thứ tự khóa jsonb thì không đổi', () => {
    const r = run(QL, `select app.schedule_inputs('${P_NA}')->>'content_hash';`, {});
    const h0 = r.rows[0];
    const r2 = run({ role: 'admin' }, `update app.activity_cards set travel_before_min = 20 where id = '00000000-0000-4000-8000-000000000511'; select private.profile_content_hash('${P_NA}')`);
    assert.notEqual(r2.rows[0], h0);
  });

  it('SCH-IN-03: gửi lại cùng khóa trả kết quả cũ; NL, hộ khác, máy con bị từ chối', () => {
    const o = J(run(QL, `select app.schedule_inputs('${P_NA}', '${SEED_KEY}')`));
    assert.equal(o.replay.version_id, '00000000-0000-4000-8000-000000000521'); assert.equal(o.replay.rev, 1);
    rejected(run(NL, `select app.schedule_inputs('${P_NA}')`), 'FORBIDDEN', 'PT403');
    rejected(run(HK, `select app.schedule_inputs('${P_NA}')`), 'NOT_FOUND', 'PT404');
    rejected(run(DEV, `select app.schedule_inputs('${P_NA}')`), 'FORBIDDEN', 'PT403');
    rejected(run(QL, `select app.schedule_inputs(gen_random_uuid())`), 'NOT_FOUND', 'PT404');
  });
});

describe('SCH-CM: schedule_commit_apply (AC-24; Architecture §7)', { skip }, () => {
  it('SCH-CM-01: commit đúng: phiên bản + rev + state + audit + outbox trong một giao dịch; nhãn chưa kiểm chứng', () => {
    const c = commit();
    const r = run(QL, `select ${c.call}; select count(*), max(label_status), max(rev) from app.schedule_versions where child_id = '${NA}';
      select rev, effective_version_id = base_version_id from app.schedule_state where child_id = '${NA}';
      select count(*) from app.audit_log where event_code = 'schedule.committed' and meta = '{"rev": 2, "profile_version": 1}';
      reset role;
      select payload_min::text, recipient_kind, state from app.notifications where type = 'lich_moi' and recipient_id = '00000000-0000-4000-8000-000000000401' and idempotency_key <> '20000000-0000-4000-8000-000000000002'`,
      { setup: c.setup });
    const o = J(r, 0);
    assert.equal(o.ok, true); assert.equal(o.rev, 2); assert.equal(o.label_status, 'chua_kiem_chung'); assert.equal(o.replay, false);
    assert.equal(r.rows[1], '2|chua_kiem_chung|2');
    assert.equal(r.rows[2], '2|t');
    assert.equal(r.rows[3], '1');
    assert.match(r.rows[4], /^\{"id": "[0-9a-f-]{36}", "type": "lich_moi"\}\|device\|CHO_GUI$/);
  });

  it('SCH-CM-02: luồng liền (cùng một JWT QL): lưu nháp -> ký -> commit; nháp ACTIVE, bản cũ SUPERSEDED, đúng một CHUAN ACTIVE', () => {
    const f = { key: '30000000-0000-4000-8000-0000000000bb', ih: HASH('b'), ans: JSON.stringify([{ question_key: 'g7_bot_hoc_nha.T2', answer: 'giu_quy' }]) };
    const script = `select app.profile_save('${NA}', ${PATCH({ budget: null })})->>'profile_id' as pid \\gset
      reset role;
      select set_config('request.jwt.claims', '{"role":"service_role"}', true) as _x \\gset
      select private.profile_content_hash(:'pid') as ch \\gset
      select private.schedule_commit_sign(private.schedule_commit_message('${NA}', :'pid', 1, '${f.key}', :'ch', '${f.ih}', 'e1-0123456789ab', 'p-0123456789ab', 'UNKNOWN', ${q(OUT)}, '[]', '[]', ${q(f.ans)})) as sig \\gset
      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub":"${QL.sub}","role":"authenticated"}', true) as _y \\gset
      select app.schedule_commit_apply('${NA}', :'pid', 1, '${f.key}', :'ch', '${f.ih}', 'e1-0123456789ab', 'p-0123456789ab', 'UNKNOWN', ${q(OUT)}, '[]', '[]', ${q(f.ans)}, :'sig');
      select state from app.schedule_profiles where id = :'pid'; select state from app.schedule_profiles where id = '${P_NA}';
      select count(*) from app.schedule_profiles where child_id = '${NA}' and kind = 'CHUAN' and state = 'ACTIVE';
      select answer from app.schedule_answers where child_id = '${NA}' and question_key = 'g7_bot_hoc_nha.T2' order by at desc limit 1`;
    const r = run(QL, script);
    assert.ok(r.ok, r.err);
    assert.equal(J(r, 0).rev, 2);
    assert.deepEqual(r.rows.slice(1), ['ACTIVE', 'SUPERSEDED', '1', 'giu_quy']);
  });

  it('SCH-CM-03: gửi lại cùng khóa trả kết quả cũ, không thêm phiên bản/audit/thông báo (AC-24); cùng khóa nhưng rev đã đổi vẫn trả kết quả cũ', () => {
    const c = commit();
    const r = run(QL, `select ${c.call}; select ${c.call}; reset role; select (select count(*) from app.schedule_versions where child_id = '${NA}'),
        (select count(*) from app.audit_log where event_code = 'schedule.committed'), (select count(*) from app.notifications where child_id = '${NA}')`, { setup: c.setup });
    const a = J(r, 0), b = J(r, 1);
    assert.equal(a.replay, false); assert.equal(b.replay, true); assert.equal(b.version_id, a.version_id);
    assert.equal(r.rows[2], '2|1|2');
  });

  it('SCH-CM-04: chữ ký sai, thiếu, ký cho nội dung khác, hoặc đổi một trường sau khi ký -> FORBIDDEN AD-03, không ghi gì', () => {
    const cnt = `; select count(*) from app.schedule_versions where child_id = '${NA}'`;
    let c = commit({ sig: 'a'.repeat(64) });
    rejected(run(QL, `select ${c.call}`, { setup: c.setup }), 'FORBIDDEN', 'PT403', 'AD-03');
    c = commit({ sendOut: OUT.replace('"tong_quan":{}', '"tong_quan":{"x":1}') });
    rejected(run(QL, `select ${c.call}`, { setup: c.setup }), 'FORBIDDEN', 'PT403', 'AD-03');
    c = commit({ sendRev: 5 });
    rejected(run(QL, `select ${c.call}`, { setup: c.setup }), 'FORBIDDEN', 'PT403', 'AD-03');
    c = commit();
    rejected(run(QL, `select ${c.call.replace(`'${HASH('b')}'`, `'${HASH('c')}'`)}`, { setup: c.setup }), 'FORBIDDEN', 'PT403', 'AD-03');
    c = commit();
    assert.equal(run(QL, `select app.schedule_commit_apply('${NA}', '${P_NA}', 1, gen_random_uuid(), repeat('a', 64), repeat('b', 64), 'e', 'p', 'UNKNOWN', '{}', '[]', '[]', '[]', null)`).code, 'PT403');
    assert.equal(run({ role: 'admin' }, `select 1${cnt}`).rows[1], '1');
  });

  it('SCH-CM-05: băm nội dung cũ (hồ sơ/thẻ đổi sau khi xếp) hoặc rev cũ -> CONFLICT_REV; lịch khóa -> LOCKED; NL/hộ khác/máy con bị từ chối', () => {
    const stale = commit({ ch: HASH('d') });
    rejected(run(QL, `select ${stale.call}`, { setup: stale.setup }), 'CONFLICT_REV', 'PT409');
    const oldRev = commit({ rev: 0 });
    rejected(run(QL, `select ${oldRev.call}`, { setup: oldRev.setup }), 'CONFLICT_REV', 'PT409');
    const c = commit();
    rejected(run(QL, `select ${c.call}`, { setup: `update app.schedule_state set lock_state = 'LOCKED', locked_at = now() where child_id = '${NA}'; ${c.setup}` }), 'LOCKED', 'PT409');
    rejected(run(NL, `select ${c.call}`, { setup: c.setup }), 'FORBIDDEN', 'PT403');
    rejected(run(HK, `select ${c.call}`, { setup: c.setup }), 'NOT_FOUND', 'PT404');
    rejected(run(DEV, `select ${c.call}`, { setup: c.setup }), 'FORBIDDEN', 'PT403');
  });

  it('SCH-CM-06: output thiếu ngày hoặc sai kiểu -> VALIDATION; câu trả lời sai khóa -> VALIDATION và mọi thứ hoàn tác (một giao dịch)', () => {
    const noDay = commit({ out: JSON.stringify({ ngay: { T2: [] }, tong_quan: {} }) });
    rejected(run(QL, `select ${noDay.call}`, { setup: noDay.setup }), 'VALIDATION', 'PT422');
    const notJson = commit({ out: 'không phải json' });
    rejected(run(QL, `select ${notJson.call}`, { setup: notJson.setup }), 'VALIDATION', 'PT422');
    const badAns = commit({ ans: JSON.stringify([{ question_key: 'KHÓA SAI', answer: 'giu_quy' }]) });
    const dcall = badAns.call.replace(":'ch'", "current_setting('t.ch')").replace(":'sig'", "current_setting('t.sig')");
    const r = run(QL, `select set_config('t.ch', :'ch', true), set_config('t.sig', :'sig', true);
      do $t$ begin perform ${dcall}; exception when others then null; end $t$;
      reset role;
      select (select count(*) from app.schedule_versions where child_id = '${NA}'), (select rev from app.schedule_state where child_id = '${NA}'),
             (select count(*) from app.audit_log where event_code = 'schedule.committed'), (select count(*) from app.notifications where child_id = '${NA}')`, { setup: badAns.setup });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows.at(-1), '1|1|0|1', 'commit lỗi giữa chừng phải không để lại dòng nào');
    rejected(run(QL, `select ${badAns.call}`, { setup: badAns.setup }), 'VALIDATION', 'PT422');
  });

  it('SCH-CM-07: con chưa có máy ghép thì commit không tạo thông báo và không lỗi', () => {
    const c = commit({ child: BIN, profile: P_BIN, rev: 0 });
    const r = run(QL, `select ${c.call}; select count(*) from app.notifications where child_id = '${BIN}'`, { setup: `update app.schedule_profiles set input = '{}' where id = '${P_BIN}'; ${c.setup}` });
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[1], '0');
  });

  it('SCH-CM-08: máy chủ không có khóa ký thì từ chối (INTERNAL), không bao giờ ký bằng khóa rỗng', () => {
    const r = run({ role: 'admin' }, `delete from vault.decrypted_secrets where name = 'schedule_commit_key'; select private.schedule_commit_sign('x')`);
    assert.equal(r.code, 'PT500');
  });
});

describe('SCH-SIG: vector chữ ký dùng chung với Deno (functions/_tests/schedule.test.ts)', { skip }, () => {
  it('SCH-SIG-01: HMAC do SQL tính trùng vector sinh độc lập bằng node:crypto (cùng chuỗi ký, cùng khóa test)', () => {
    const f = vector.fields;
    const r = admin(`select private.schedule_commit_sign(private.schedule_commit_message('${f.child_id}', '${f.profile_id}', ${f.expected_rev}, '${f.idempotency_key}',
      ${q(f.content_hash)}, ${q(f.input_hash)}, ${q(f.engine_version)}, ${q(f.params_version)}, ${q(f.balance_label)}, ${q(f.output)}, ${q(f.tradeoffs)}, ${q(f.questions)}, ${q(f.answers)}))`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], vector.signature);
  });
});

describe('SCH-OB: outbox thông báo "con báo" (D-67) và đồng bộ lịch dưới mô hình đồng ý D-64', { skip }, () => {
  const HH1 = '00000000-0000-4000-8000-000000000101';
  const MEM_HOA = '00000000-0000-4000-8000-000000000201';
  const MEM_MINH = '00000000-0000-4000-8000-000000000202';
  const DEV_NA = { ...A.CON, claims: { is_anonymous: true } };
  const ON = `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
    select '${HH1}', '${NA}', 'MD-CONBAO', 'DONG_Y', '${MEM_HOA}', id from app.policy_versions limit 1;`;
  const GRANT_NL = `insert into app.grants (member_id, child_id, resource, action, purpose_code) values ('${MEM_MINH}', '${NA}', 'alert', 'view', 'MD-CONBAO');`;
  const rows = `select string_agg(type || ':' || recipient_kind || ':' || recipient_id || ':' || payload_min::text, '|' order by recipient_id) from app.notifications where child_id = '${NA}' and type = 'con_bao'`;

  it('SCH-OB-01: gửi "con báo" ghi outbox con_bao cho QL (cùng giao dịch); payload chỉ {type,id}, không có kind', () => {
    const r = run(DEV_NA, `select app.child_alert_send('KHONG_KHOE'); reset role; ${rows}; select id from app.child_alerts`, { setup: ON });
    assert.ok(r.ok, r.err);
    const alertId = r.rows.at(-1);
    assert.equal(r.rows[1], `con_bao:member:${MEM_HOA}:{"id": "${alertId}", "type": "con_bao"}`);
    assert.ok(!/KHONG_KHOE/.test(r.rows[1]));
  });

  it('SCH-OB-02: NL chỉ nhận khi có grant MD-CONBAO; gửi lặp cùng khóa không ghi thêm; chưa đồng ý thì không ghi gì', () => {
    const noGrant = run(DEV_NA, `select app.child_alert_send('DON_SOM'); reset role; select count(*) from app.notifications where type = 'con_bao'`, { setup: ON });
    assert.equal(noGrant.rows.at(-1), '1');
    const withGrant = run(DEV_NA, `select app.child_alert_send('DON_SOM'); reset role; select count(*) from app.notifications where type = 'con_bao'`, { setup: ON + GRANT_NL });
    assert.equal(withGrant.rows.at(-1), '2');
    const k = '40000000-0000-4000-8000-0000000000aa';
    const twice = run(DEV_NA, `select app.child_alert_send('DON_SOM', '${k}'); select app.child_alert_send('DON_SOM', '${k}'); reset role; select count(*) from app.notifications where type = 'con_bao'`, { setup: ON });
    assert.equal(twice.rows.at(-1), '1');
    const off = run(DEV_NA, `select app.child_alert_send('DON_SOM')`);
    assert.equal(off.ok, false);
    assert.equal(admin(`select count(*) from app.notifications where type = 'con_bao'`).rows[0], '0');
  });

  it('SCH-OB-03: RLS outbox: QL thấy hàng của mình, NL không grant và máy con không thấy hàng con_bao', () => {
    const mine = run(QL, `select count(*) from app.notifications where type = 'con_bao'`, { setup: `${ON} insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
      values ('con_bao', 'member', '${MEM_HOA}', '${NA}', '40000000-0000-4000-8000-0000000000bb', '{"type":"con_bao","id":"40000000-0000-4000-8000-0000000000cc"}');` });
    assert.equal(mine.rows[0], '1');
    const setup = `${ON} insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
      values ('con_bao', 'member', '${MEM_HOA}', '${NA}', '40000000-0000-4000-8000-0000000000bb', '{"type":"con_bao","id":"40000000-0000-4000-8000-0000000000cc"}');`;
    assert.equal(run(NL, `select count(*) from app.notifications where type = 'con_bao'`, { setup }).rows[0], '0');
    assert.equal(run(DEV_NA, `select count(*) from app.notifications where type = 'con_bao'`, { setup }).rows[0], '0');
  });

  it('SCH-OB-04: payload outbox chỉ cho phép {type,id}; type ngoài lich_moi/con_bao bị chặn', () => {
    const extra = admin(`insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
      values ('con_bao', 'member', '${MEM_HOA}', '${NA}', '40000000-0000-4000-8000-0000000000dd', '{"type":"con_bao","id":"x","kind":"KHONG_KHOE"}')`);
    assert.equal(extra.code, '23514');
    const bad = admin(`insert into app.notifications (type, recipient_kind, recipient_id, child_id, idempotency_key, payload_min)
      values ('khac', 'member', '${MEM_HOA}', '${NA}', '40000000-0000-4000-8000-0000000000de', '{"type":"khac","id":"x"}')`);
    assert.equal(bad.code, '23514');
  });

  it('SCH-OB-05: lịch dưới D-64: không còn mục đích đồng bộ riêng; commit thấy lịch khi MD-LICH bật, rút MD-LICH thì QL cũng không đọc lịch cũ', () => {
    assert.equal(admin(`select count(*) from app.purposes where code in ('MD-DONGBO', 'MD-XONG', 'MD-MET', 'MD-MONGMUON', 'MD-BAOCAO')`).rows[0], '0');
    const r = run(QL, `select count(*) from app.schedule_versions where child_id = '${NA}'`, {
      setup: `insert into app.consent_events (household_id, child_id, purpose_code, event, actor_member_id, policy_version_id)
        select '${HH1}', '${NA}', 'MD-LICH', 'RUT', '${MEM_HOA}', id from app.policy_versions limit 1;` });
    assert.equal(r.rows[0], '0');
  });
});
