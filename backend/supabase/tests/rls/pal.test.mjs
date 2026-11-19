// Test D-69 (Pal tư vấn) + theo dõi token. Bảng pal_conversations/pal_messages (RLS riêng), app.pal_quota/pal_prepare/pal_record_turn,
// private.ai_usage/ops_alerts/pal_locks, hàm chủ sản phẩm (service_role). Dữ liệu: chỉ tên giả.
// Mã: PAL-RLS (đọc theo vai, ghi trực tiếp), PAL-AUTH, PAL-FLAG (cờ), PAL-Q (hạn mức lượt/ngày), PAL-RATE (câu/phút), PAL-PREP, PAL-SIG (chữ ký),
//     PAL-REC (ghi lượt), PAL-TOK (token, chi phí, trần ngày), PAL-SPIKE (đột biến, tự khóa, ngưỡng sàn), PAL-OWN (hàm chủ sản phẩm).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DB_URL, run, admin } from './lib/db.mjs';

const matrix = JSON.parse(readFileSync(new URL('./policy-matrix.json', import.meta.url), 'utf8'));
const vector = JSON.parse(readFileSync(new URL('../fixtures/pal-record-vector.json', import.meta.url), 'utf8'));
const A = matrix.actors;
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';
const HH1 = '00000000-0000-4000-8000-000000000101';
const HH2 = '00000000-0000-4000-8000-000000000102';
const CONV_HOA = '00000000-0000-4000-8000-000000000601';
const CONV_MINH = '00000000-0000-4000-8000-000000000602';
const SU = '00000000-0000-4000-8000-000000000303';
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
const SEEDED = DB_URL ? Number(admin(`select count(*) from app.pal_messages where household_id = '${HH1}' and role = 'user' and counted and created_at >= private.vn_day_start()`).rows[0]) : 0;
const q = (s) => `$q$${s}$q$`;
const K = (n) => `40000000-0000-4000-8000-0000000001${String(n).padStart(2, '0')}`;
const PRM = (k, v) => `update private.params set value_int = ${v} where key = '${k}';`;

/** Dựng setup (ký) + lời gọi pal_record_turn. i = chỉ số biến chữ ký để gọi nhiều lần trong một lần chạy. */
function rec(o = {}, i = 0) {
  const f = { conv: null, child: NA, key: K(1), user: 'Con hay cáu khi làm bài', asst: 'Mình nghe chị.', flags: [], counted: true, tin: 100, tout: 50, model: 'claude-sonnet-5-5', ...o };
  const lit = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : q(v));
  const msg = `private.pal_record_message(${f.conv ? `'${f.conv}'` : `'-'`}, ${f.child ? `'${f.child}'` : `'-'`}, '${f.key}', ${q(f.user)}, ${q(f.asst)}, ${q(f.flags.join(','))}, ${f.counted}, ${lit(f.tin)}, ${lit(f.tout)}, ${lit(f.model)})`;
  const setup = `select private.pal_record_sign(${msg}) as sig${i} \\gset\n`;
  const sig = o.sig !== undefined ? q(o.sig) : `:'sig${i}'`;
  const flags = f.flags.length ? `array[${f.flags.map(q).join(',')}]::text[]` : `'{}'::text[]`;
  const call = `app.pal_record_turn(${f.conv ? `'${f.conv}'` : 'null'}, ${f.child ? `'${f.child}'` : 'null'}, '${f.key}', ${o.sendUser ? q(o.sendUser) : q(f.user)}, ${q(f.asst)}, ${flags}, ${f.counted}, ${lit(f.tin)}, ${lit(f.tout)}, ${lit(f.model)}, ${sig})`;
  return { setup, call };
}
const many = (os, extraSetup = '') => {
  const rs = os.map((o, i) => rec(o, i));
  return { setup: extraSetup + rs.map((r) => r.setup).join(''), calls: rs.map((r) => `select ${r.call}::text;`).join('\n'), n: rs.length };
};
const quota = (who = 'app.pal_quota()') => `select ${who}::text;`;
const stateOf = (r, i = 0) => J(r, i).state;

describe('PAL-RLS: đọc hội thoại Pal (phạm vi riêng) và ghi trực tiếp', { skip }, () => {
  it('PAL-RLS-01: mỗi người lớn chỉ thấy hội thoại của chính mình; người lớn khác cùng hộ, hộ khác, máy con không thấy', () => {
    const own = (who, conv) => run(who, `select count(*) from app.pal_conversations where id = '${conv}'`).rows[0];
    assert.equal(own(QL, CONV_HOA), '1');
    assert.equal(own(QL, CONV_MINH), '0', 'chị Hoa không thấy cuộc của anh Minh');
    assert.equal(own(NL, CONV_MINH), '1');
    assert.equal(own(NL, CONV_HOA), '0', 'anh Minh không thấy cuộc của chị Hoa');
    assert.equal(run(QL, `select count(*) from app.pal_messages where conversation_id = '${CONV_MINH}'`).rows[0], '0');
    assert.equal(run(NL, `select count(*) from app.pal_messages where conversation_id = '${CONV_HOA}'`).rows[0], '0');
    for (const t of ['pal_conversations', 'pal_messages']) {
      assert.equal(run(HK, `select count(*) from app.${t}`).rows[0], '0', t);
      assert.equal(run(DEV, `select count(*) from app.${t}`).rows[0], '0', t);
      assert.equal(run(A.ANON, `select count(*) from app.${t}`).code, '42501', t);
    }
  });

  it('PAL-RLS-02: không ai (kể cả chủ cuộc trò chuyện) ghi trực tiếp được vào bảng Pal', () => {
    for (const t of ['pal_conversations', 'pal_messages']) {
      assert.equal(run(QL, `delete from app.${t}`).code, '42501', t);
      assert.equal(run(QL, `update app.${t} set created_at = now()`).code, '42501', t);
    }
    assert.equal(run(QL, `insert into app.pal_messages(conversation_id, household_id, member_id, seq, role, content) values ('${CONV_HOA}', '${HH1}', '00000000-0000-4000-8000-000000000201', 9, 'user', 'x')`).code, '42501');
    assert.equal(run(QL, `insert into app.pal_conversations(household_id, member_id) values ('${HH1}', '00000000-0000-4000-8000-000000000201')`).code, '42501');
  });

  it('PAL-RLS-03: rút toàn bộ đồng ý của bé Na thì hội thoại gắn bé Na ẩn; cuộc hỏi chung của anh Minh còn', () => {
    const tok = `select app.consent_withdraw_all('${NA}')->>'confirm_token' as tok \\gset\n select app.consent_withdraw_all('${NA}', :'tok'::uuid);`;
    const r = run(QL, `${tok} select count(*) from app.pal_conversations; select count(*) from app.pal_messages`);
    assert.ok(r.ok, r.err);
    assert.deepEqual(r.rows.slice(-2), ['0', '0']);
  });

  it('PAL-RLS-04: bảng theo dõi token và cảnh báo không vai nào đọc (chỉ service_role qua hàm)', () => {
    for (const t of ['ai_usage', 'ops_alerts', 'pal_locks']) {
      assert.equal(run(QL, `select count(*) from private.${t}`).code, '42501', t);
      assert.equal(run(NL, `select count(*) from private.${t}`).code, '42501', t);
    }
  });
});

describe('PAL-AUTH: máy con và người chưa đăng nhập', { skip }, () => {
  it('PAL-AUTH-01: máy con (ẩn danh) bị FORBIDDEN ở cả ba hàm; chưa đăng nhập UNAUTHENTICATED; anon không có quyền', () => {
    const r = many([{}]);
    for (const sql of ['select app.pal_quota()', 'select app.pal_prepare()', r.calls.replace(/;$/, '')]) {
      rejected(run(DEV, sql, { setup: r.setup }), 'FORBIDDEN', 'PT403', 'PAL-AUTH');
    }
    rejected(run({ role: 'authenticated' }, 'select app.pal_quota()'), 'UNAUTHENTICATED', 'PT401');
    assert.equal(run(A.ANON, 'select app.pal_quota()').code, '42501');
  });
});

describe('PAL-FLAG: cờ bật/tắt', { skip }, () => {
  it('PAL-FLAG-01: mặc định bật (OK); tắt cờ thì OFF ở quota/prepare và FEATURE_OFF khi ghi', () => {
    assert.equal(stateOf(run(QL, quota())), 'OK');
    const off = PRM('pal_enabled', 0);
    assert.equal(stateOf(run(QL, quota(), { setup: off })), 'OFF');
    assert.equal(J(run(QL, `select app.pal_prepare()::text`, { setup: off })).state, 'OFF');
    const r = many([{}]);
    rejected(run(QL, r.calls, { setup: off + r.setup }), 'FEATURE_OFF', 'PT403', 'PAL-FLAG');
  });
  it('PAL-FLAG-02: người chưa thuộc hộ nào: NO_HOUSEHOLD; hộ chưa đồng ý lõi: NO_CONSENT; hộ đóng băng: FROZEN', () => {
    const lone = { role: 'authenticated', sub: '00000000-0000-4000-8000-0000000000b1' };
    const mk = `insert into auth.users (id, aud, role, email, is_anonymous) values ('${lone.sub}', 'authenticated', 'authenticated', null, false);`;
    assert.equal(stateOf(run(lone, quota(), { setup: mk })), 'NO_HOUSEHOLD');
    const noConsent = `delete from app.purpose_state where child_id in ('${NA}', '${BIN}');`;
    assert.equal(stateOf(run(QL, quota(), { setup: noConsent })), 'NO_CONSENT');
    assert.equal(stateOf(run(QL, quota(), { setup: `update app.households set frozen_at = now() where id = '${HH1}';` })), 'FROZEN');
    const r = many([{}]);
    rejected(run(QL, r.calls, { setup: `update app.households set frozen_at = now() where id = '${HH1}';` + r.setup }), 'FROZEN', 'PT423');
    rejected(run(QL, r.calls, { setup: noConsent + r.setup }), 'FORBIDDEN', 'PT403', 'PAL-CONSENT');
  });
});

describe('PAL-Q: hạn mức lượt hỏi mỗi ngày theo gói', { skip }, () => {
  it('PAL-Q-01: gói mặc định TRIAL (hàm nối gói là TODO), giới hạn 20; đếm theo hộ trong ngày giờ VN', () => {
    const r = J(run(QL, quota()));
    const seeded = Number(admin(`select count(*) from app.pal_messages where household_id = '${HH1}' and role = 'user' and counted and created_at >= private.vn_day_start()`).rows[0]);
    assert.ok(seeded <= 2);   // seed: chị Hoa 1 + anh Minh 1 (cùng hộ), 5 phút trước; 0 nếu vừa qua nửa đêm giờ VN
    assert.deepEqual([r.state, r.tier, r.limit, r.used, r.remaining], ['OK', 'TRIAL', 20, seeded, 20 - seeded]);
    assert.equal(J(run(HK, quota())).used, 0);
    const old = `insert into app.pal_messages(conversation_id, household_id, member_id, child_id, seq, role, content, counted, created_at)
      values ('${CONV_HOA}', '${HH1}', '00000000-0000-4000-8000-000000000201', '${NA}', 3, 'user', 'cũ', true, now() - interval '2 days');`;
    assert.equal(J(run(QL, quota(), { setup: old })).used, seeded, 'tin của hôm kia không tính vào hôm nay');
  });
  it('PAL-Q-02: hết lượt thì lượt tính phí bị RATE_LIMITED, lượt an toàn (không tính) vẫn ghi được; lượt gọi AI làm giảm remaining', () => {
    const lim = PRM('pal_questions_per_day_trial', SEEDED + 2);
    const r = many([{ key: K(1) }, { key: K(2), counted: true, conv: null }, { key: K(3), counted: false, flags: ['EMERGENCY_DANGER_LIFE'], tin: null, tout: null, model: null }], lim);
    const res = run(QL, `select ${rec({ key: K(1) }, 0).call}::text; select ${rec({ key: K(2) }, 1).call}::text; ${quota()}`, { setup: r.setup });
    assert.ok(res.ok, res.err);
    assert.equal(J(res, 0).remaining, 1);
    assert.equal(J(res, 1).remaining, 0);
    assert.equal(J(res, 1).state, 'QUOTA');
    assert.equal(J(res, 2).state, 'QUOTA');
    const blocked = run(QL, `select ${rec({ key: K(1) }, 0).call}::text; select ${rec({ key: K(2) }, 1).call}::text; select ${rec({ key: K(4) }, 3).call}::text`,
      { setup: lim + [0, 1, 3].map((i) => rec({ key: K(i === 3 ? 4 : i + 1) }, i).setup).join('') });
    rejected(blocked, 'RATE_LIMITED', 'PT429', 'PAL-QUOTA');
    const safe = run(QL, `select ${rec({ key: K(1) }, 0).call}::text; select ${rec({ key: K(2) }, 1).call}::text; select ${rec({ key: K(3), counted: false, flags: ['EMERGENCY_DANGER_LIFE'], tin: null, tout: null, model: null }, 2).call}::text`,
      { setup: lim + [rec({ key: K(1) }, 0), rec({ key: K(2) }, 1), rec({ key: K(3), counted: false, flags: ['EMERGENCY_DANGER_LIFE'], tin: null, tout: null, model: null }, 2)].map((x) => x.setup).join('') });
    assert.ok(safe.ok, safe.err);
    assert.equal(J(safe, 2).state, 'QUOTA');
  });
  it('PAL-Q-03: gói FREE/PREMIUM đọc từ private.params (mỗi gói một giới hạn)', () => {
    assert.equal(J(run(QL, quota(), { setup: PRM('pal_questions_per_day_trial', 7) })).limit, 7);
    const swap = `create or replace function private.household_tier(p_household uuid) returns text language sql stable as $$ select 'FREE'::text $$;`;
    assert.deepEqual([J(run(QL, quota(), { setup: swap })).tier, J(run(QL, quota(), { setup: swap })).limit], ['FREE', 5]);
    assert.equal(J(run(QL, quota(), { setup: swap.replace('FREE', 'PREMIUM') })).limit, 100);
  });
});

describe('PAL-RATE: số câu mỗi phút mỗi người', { skip }, () => {
  it('PAL-RATE-01: vượt số câu/phút thì state RATE và lượt tính phí bị RATE_LIMITED; người khác cùng hộ không bị ảnh hưởng', () => {
    const lim = PRM('pal_max_per_minute', 1);
    const one = rec({ key: K(1) }, 0), two = rec({ key: K(2) }, 1);
    const res = run(QL, `select ${one.call}::text; ${quota()} select ${two.call}::text`, { setup: lim + one.setup + two.setup });
    rejected(res, 'RATE_LIMITED', 'PT429', 'PAL-RATE');
    const ok = run(QL, `select ${one.call}::text; ${quota()}`, { setup: lim + one.setup });
    assert.equal(stateOf(ok, 1), 'RATE');
    assert.equal(stateOf(run(NL, quota(), { setup: lim })), 'OK');
  });
});

describe('PAL-PREP: dữ liệu cho Edge Function', { skip }, () => {
  it('PAL-PREP-01: người lớn chỉ nhận con mình xem được; có tên hộ để ẩn danh; KHÔNG có dữ liệu sức khỏe', () => {
    const ql = J(run(QL, `select app.pal_prepare()::text`));
    assert.deepEqual(ql.children.map((c) => c.call_name), ['bé Na', 'bé Bin']);
    assert.deepEqual(ql.adults.map((a) => [a.call_name, a.self]), [['chị Hoa', true], ['anh Minh', false]]);
    const nl = J(run(NL, `select app.pal_prepare()::text`));
    assert.deepEqual(nl.children.map((c) => c.call_name), ['bé Na'], 'anh Minh chỉ được xem bé Na');
    assert.deepEqual(nl.adults.map((a) => [a.call_name, a.self]), [['chị Hoa', false], ['anh Minh', true]]);
    for (const x of [ql, nl]) assert.doesNotMatch(JSON.stringify(x), /Dị ứng|health|suc_khoe|SUCKHOE/i);
    assert.deepEqual([ql.max_output_tokens, ql.max_question_chars], [1024, 2000]);
  });
  it('PAL-PREP-02: chỉ lấy lịch sử cuộc trò chuyện của chính mình; của người khác NOT_FOUND; con ngoài tầm xem NOT_FOUND', () => {
    const h = J(run(QL, `select app.pal_prepare('${CONV_HOA}')::text`));
    assert.deepEqual(h.history.map((m) => m.role), ['user', 'assistant']);
    assert.equal(h.conversation_child_id, NA);
    rejected(run(QL, `select app.pal_prepare('${CONV_MINH}')`), 'NOT_FOUND', 'PT404', 'PAL-CONV');
    rejected(run(NL, `select app.pal_prepare(null, '${BIN}')`), 'NOT_FOUND', 'PT404', 'PAL-CHILD');
  });
  it('PAL-PREP-03: gửi lặp cùng khóa trả câu trả lời đã lưu; khóa của người khác không trả', () => {
    const r = J(run(QL, `select app.pal_prepare(null, null, '40000000-0000-4000-8000-000000000001')::text`));
    assert.match(r.replay.reply, /Mình nghe chị/);
    assert.equal(r.replay.conversation_id, CONV_HOA);
    assert.equal(J(run(NL, `select app.pal_prepare(null, null, '40000000-0000-4000-8000-000000000001')::text`)).replay, null);
  });
});

describe('PAL-SIG: chữ ký của Edge Function', { skip }, () => {
  it('PAL-SIG-01: vector chung với Deno - SQL ra đúng chữ ký sinh độc lập bằng node:crypto', () => {
    const f = vector.fields;
    const lit = (v) => (v === null ? 'null' : typeof v === 'number' ? String(v) : q(v));
    const r = admin(`select private.pal_record_sign(private.pal_record_message('-', ${q(f.child)}, '${f.key}', ${q(f.user)}, ${q(f.assistant)}, ${q(f.flags.join(','))}, ${f.counted}, ${f.in_tokens}, ${f.out_tokens}, ${lit(f.model)}))`);
    assert.ok(r.ok, r.err);
    assert.equal(r.rows[0], vector.signature);
  });
  it('PAL-SIG-02: thiếu/sai chữ ký, hoặc sửa nội dung sau khi ký, đều bị FORBIDDEN PAL-SIG và không ghi gì', () => {
    const base = rec({}, 0);
    rejected(run(QL, `select ${rec({ sig: 'a'.repeat(64) }).call}`), 'FORBIDDEN', 'PT403', 'PAL-SIG');
    rejected(run(QL, `select ${rec({ sig: '' }).call}`), 'FORBIDDEN', 'PT403', 'PAL-SIG');
    rejected(run(QL, `select ${rec({ sendUser: 'nội dung khác' }).call}`, { setup: base.setup }), 'FORBIDDEN', 'PT403', 'PAL-SIG');
    const swapTokens = base.call.replace(', 100, 50,', ', 1, 1,');
    rejected(run(QL, `select ${swapTokens}`, { setup: base.setup }), 'FORBIDDEN', 'PT403', 'PAL-SIG');
  });
});

describe('PAL-REC: ghi một lượt hỏi-đáp', { skip }, () => {
  it('PAL-REC-01: tạo cuộc trò chuyện mới + hai tin (seq 1, 2), lưu cờ an toàn và token; chỉ người viết thấy; remaining giảm 1', () => {
    const r = rec({ flags: ['PARENT_DISTRESS'] });
    const res = run(QL, `select ${r.call}::text; select m.seq || ':' || m.role || ':' || m.counted || ':' || array_to_string(m.safety_flags, ',') || ':' || coalesce(m.input_tokens::text, '-')
      from app.pal_messages m where m.idempotency_key = '${K(1)}' or (m.seq = 2 and m.conversation_id = (select conversation_id from app.pal_messages where idempotency_key = '${K(1)}')) order by m.seq`, { setup: r.setup });
    assert.ok(res.ok, res.err);
    const out = J(res);
    assert.deepEqual([out.ok, out.replay, out.remaining], [true, false, 20 - SEEDED - 1]);
    assert.deepEqual(res.rows.slice(1), ['1:user:true:PARENT_DISTRESS:100', '2:assistant:false:PARENT_DISTRESS:-']);
    const asNl = run(QL, `select ${r.call}::text; reset role; select set_config('request.jwt.claims', '{"sub":"${NL.sub}","role":"authenticated"}', true) as _c \\gset
      set local role authenticated; select count(*) from app.pal_messages where idempotency_key = '${K(1)}'`, { setup: r.setup });
    assert.equal(asNl.rows.at(-1), '0');
  });
  it('PAL-REC-02: gửi lặp cùng khóa: replay, không thêm dòng, không tính thêm lượt', () => {
    const r = rec({});
    const res = run(QL, `select ${r.call}::text; select ${r.call}::text; select count(*) from app.pal_messages where idempotency_key = '${K(1)}'; ${quota()}`, { setup: r.setup });
    assert.ok(res.ok, res.err);
    assert.deepEqual([J(res, 0).replay, J(res, 1).replay, res.rows[2], J(res, 3).used], [false, true, '1', SEEDED + 1]);
    assert.equal(J(res, 0).conversation_id, J(res, 1).conversation_id);
  });
  it('PAL-REC-03: nối vào cuộc cũ (seq 3, 4); cuộc của người khác NOT_FOUND; đổi con giữa chừng VALIDATION', () => {
    const r = rec({ conv: CONV_HOA });
    const res = run(QL, `select ${r.call}::text; select string_agg(seq::text, ',' order by seq) from app.pal_messages where conversation_id = '${CONV_HOA}'`, { setup: r.setup });
    assert.ok(res.ok, res.err);
    assert.equal(res.rows[1], '1,2,3,4');
    const other = rec({ conv: CONV_MINH });
    rejected(run(QL, `select ${other.call}`, { setup: other.setup }), 'NOT_FOUND', 'PT404', 'PAL-CONV');
    const wrongChild = rec({ conv: CONV_HOA, child: BIN });
    rejected(run(QL, `select ${wrongChild.call}`, { setup: wrongChild.setup }), 'VALIDATION', 'PT422', 'PAL-CHILD');
    const noAccess = rec({ child: BIN });
    rejected(run(NL, `select ${noAccess.call}`, { setup: noAccess.setup }), 'NOT_FOUND', 'PT404', 'PAL-CHILD');
  });
  it('PAL-REC-04: cờ lạ bị CSDL từ chối; lượt tính phí thiếu token/model bị VALIDATION; nội dung rỗng bị VALIDATION', () => {
    const bad = rec({ flags: ['CO_LA'] });
    assert.equal(run(QL, `select ${bad.call}`, { setup: bad.setup }).code, '23514');
    const noTok = rec({ tin: null, tout: null, model: null });
    rejected(run(QL, `select ${noTok.call}`, { setup: noTok.setup }), 'VALIDATION', 'PT422', 'PAL-IN');
    const empty = rec({ user: '   ' });
    rejected(run(QL, `select ${empty.call}`, { setup: empty.setup }), 'VALIDATION', 'PT422', 'PAL-IN');
  });
});

describe('PAL-TOK: theo dõi token, chi phí, trần ngày', { skip }, () => {
  const peek = (sql) => `reset role; ${sql} set local role authenticated;`;
  it('PAL-TOK-01: mỗi lượt gọi AI ghi một dòng ai_usage (token vào/ra, model, hộ, người, chi phí ước tính theo giá trong params); lượt an toàn không ghi', () => {
    const prices = PRM('ai_price_in_usd_x100_per_mtok', 300) + PRM('ai_price_out_usd_x100_per_mtok', 1500);
    const a = rec({ key: K(1), tin: 1000, tout: 500 }, 0);
    const b = rec({ key: K(2), counted: false, flags: ['EMERGENCY_DANGER_LIFE'], tin: null, tout: null, model: null }, 1);
    const res = run(QL, `select ${a.call}::text; select ${b.call}::text; reset role;
      select u.household_id || ':' || u.member_id || ':' || u.model || ':' || u.input_tokens || ':' || u.output_tokens || ':' || u.est_cost_usd from private.ai_usage u;`,
      { setup: prices + a.setup + b.setup });
    assert.ok(res.ok, res.err);
    // (1000*300 + 500*1500)/100/1e6 = 0.0105
    assert.deepEqual(res.rows.slice(2), [`${HH1}:00000000-0000-4000-8000-000000000201:claude-sonnet-5-5:1000:500:0.010500`]);
  });
  it('PAL-TOK-02: chạm trần token/ngày của hộ: state TOKENS, lượt tính phí tiếp theo RATE_LIMITED, có cảnh báo mềm và cứng; hộ khác không ảnh hưởng', () => {
    const cap = PRM('pal_household_tokens_per_day', 1000) + PRM('pal_spike_floor_tokens_per_hour', 1000000);
    const a = rec({ key: K(1), tin: 600, tout: 500 }, 0);
    const b = rec({ key: K(2), tin: 10, tout: 10 }, 1);
    const res = run(QL, `select ${a.call}::text; ${quota()} reset role; select kind || ':' || scope || ':' || action from private.ops_alerts order by kind; set local role authenticated; select ${b.call}`,
      { setup: cap + a.setup + b.setup });
    rejected(res, 'RATE_LIMITED', 'PT429', 'PAL-TOKENS');
    const ok = run(QL, `select ${a.call}::text; ${quota()} reset role; select kind || ':' || scope || ':' || action from private.ops_alerts order by kind;`, { setup: cap + a.setup });
    assert.ok(ok.ok, ok.err);
    assert.equal(J(ok, 0).state, 'TOKENS');
    assert.deepEqual(ok.rows.slice(2), ['CAP_HOUSEHOLD_DAY:HOUSEHOLD:NONE', 'SOFT_HOUSEHOLD_DAY:HOUSEHOLD:NONE']);
    assert.equal(stateOf(run(HK, quota(), { setup: cap })), 'OK');
  });
  it('PAL-TOK-03: mốc 80% trần ngày chỉ ghi cảnh báo mềm (một lần trong ngày), chưa khóa, state vẫn OK', () => {
    const cap = PRM('pal_household_tokens_per_day', 1000) + PRM('pal_spike_floor_tokens_per_hour', 1000000);
    const a = rec({ key: K(1), tin: 500, tout: 350 }, 0), b = rec({ key: K(2), tin: 1, tout: 1 }, 1);
    const res = run(QL, `select ${a.call}::text; select ${b.call}::text; reset role; select kind || ':' || action from private.ops_alerts; select count(*) from private.pal_locks;`, { setup: cap + a.setup + b.setup });
    assert.ok(res.ok, res.err);
    assert.equal(J(res, 0).state, 'OK');
    assert.deepEqual(res.rows.slice(2), ['SOFT_HOUSEHOLD_DAY:NONE', '0']);
  });
  it('PAL-TOK-04: hết ngân sách token/ngày toàn hệ thống: BUSY cho mọi hộ, cảnh báo CAP_SYSTEM_DAY', () => {
    const cap = PRM('pal_system_tokens_per_day', 1000) + PRM('pal_spike_floor_tokens_per_hour', 1000000) + PRM('pal_system_tokens_per_hour', 100000000);
    const a = rec({ key: K(1), tin: 700, tout: 400 }, 0);
    const res = run(QL, `select ${a.call}::text; reset role; select kind || ':' || scope from private.ops_alerts order by kind; set local role authenticated;`, { setup: cap + a.setup });
    assert.ok(res.ok, res.err);
    assert.equal(J(res, 0).state, 'BUSY');
    assert.deepEqual(res.rows.slice(1), ['CAP_SYSTEM_DAY:SYSTEM', 'SOFT_SYSTEM_DAY:SYSTEM']);
    assert.equal(stateOf(run(HK, quota(), { setup: cap + `insert into private.ai_usage(household_id, member_id, model, input_tokens, output_tokens) values ('${HH1}', '00000000-0000-4000-8000-000000000201', 'm', 900, 200);` })), 'BUSY');
  });
});

describe('PAL-SPIKE: đột biến, tự khóa, ngưỡng sàn', { skip }, () => {
  const hist = (tokens) => `insert into private.ai_usage(household_id, member_id, model, input_tokens, output_tokens, at)
    select '${HH1}', '00000000-0000-4000-8000-000000000201', 'm', ${tokens} / 168, 0, now() - interval '2 hours' - (g * interval '1 hour') from generate_series(0, 167) g;`;
  const noDay = PRM('pal_household_tokens_per_day', 100000000) + PRM('pal_system_tokens_per_day', 100000000) + PRM('pal_system_tokens_per_hour', 100000000);
  it('PAL-SPIKE-01: token 1 giờ > N lần trung bình 7 ngày và trên sàn -> ghi cảnh báo + TỰ KHÓA hộ; lượt tính phí sau đó PAL_LOCKED; lượt an toàn vẫn ghi; hộ khác không bị khóa', () => {
    const set = noDay + PRM('pal_spike_floor_tokens_per_hour', 100) + PRM('pal_spike_factor', 5) + hist(1680);   // trung bình 10/giờ
    const a = rec({ key: K(1), tin: 500, tout: 100 }, 0), b = rec({ key: K(2) }, 1);
    const s = rec({ key: K(3), counted: false, flags: ['EMERGENCY_SELF_HARM'], tin: null, tout: null, model: null }, 2);
    const res = run(QL, `select ${a.call}::text; ${quota()} select ${s.call}::text;
      reset role; select kind || ':' || scope || ':' || action || ':' || (metrics ->> 'tokens_1h') || ':' || (metrics ->> 'factor') from private.ops_alerts; set local role authenticated; select ${b.call}`,
      { setup: set + a.setup + b.setup + s.setup });
    rejected(res, 'FORBIDDEN', 'PT403', 'PAL_LOCKED');
    const ok = run(QL, `select ${a.call}::text; ${quota()} select ${s.call}::text; reset role; select kind || ':' || scope || ':' || action || ':' || (metrics ->> 'tokens_1h') || ':' || (metrics ->> 'factor') from private.ops_alerts;`,
      { setup: set + a.setup + s.setup });
    assert.ok(ok.ok, ok.err);
    assert.equal(J(ok, 0).state, 'LOCKED');
    assert.equal(stateOf(ok, 1), 'LOCKED');
    assert.equal(J(ok, 2).ok, true, 'lượt an toàn vẫn ghi được khi bị khóa');
    assert.deepEqual(ok.rows.slice(3), ['SPIKE_HOUSEHOLD:HOUSEHOLD:LOCK_HOUSEHOLD:600:5']);
    assert.equal(stateOf(run(HK, quota(), { setup: set + a.setup })), 'OK');
    assert.equal(stateOf(run(NL, quota(), { setup: set })), 'OK', 'trước khi có đột biến thì chưa khóa');
  });
  it('PAL-SPIKE-02: ngưỡng sàn - dưới sàn thì không coi là đột biến dù gấp N lần trung bình (hộ mới không bị khóa oan)', () => {
    const set = noDay + PRM('pal_spike_floor_tokens_per_hour', 20000) + PRM('pal_spike_factor', 5);
    const a = rec({ key: K(1), tin: 3000, tout: 1000 }, 0);
    const res = run(QL, `select ${a.call}::text; ${quota()} reset role; select count(*) from private.ops_alerts where kind = 'SPIKE_HOUSEHOLD'`, { setup: set + a.setup });   // hộ mới: trung bình 0
    assert.ok(res.ok, res.err);
    assert.deepEqual([J(res, 0).state, stateOf(res, 1), res.rows[2]], ['OK', 'OK', '0']);
  });
  it('PAL-SPIKE-03: trên sàn nhưng chưa quá N lần trung bình thì không khóa; quá N lần thì khóa', () => {
    const set = noDay + PRM('pal_spike_floor_tokens_per_hour', 100) + PRM('pal_spike_factor', 5) + hist(168000);   // trung bình 1000/giờ -> ngưỡng 5000
    const small = rec({ key: K(1), tin: 3000, tout: 1000 }, 0);
    assert.equal(J(run(QL, `select ${small.call}::text`, { setup: set + small.setup })).state, 'OK');
    const big = rec({ key: K(1), tin: 5000, tout: 1500 }, 0);
    assert.equal(J(run(QL, `select ${big.call}::text`, { setup: set + big.setup })).state, 'LOCKED');
  });
  it('PAL-SPIKE-04: token toàn hệ thống trong 1 giờ vượt ngưỡng -> cảnh báo + TẮT TOÀN BỘ (pal_enabled = 0), mọi hộ thấy OFF', () => {
    const set = PRM('pal_household_tokens_per_day', 100000000) + PRM('pal_system_tokens_per_day', 100000000) + PRM('pal_spike_floor_tokens_per_hour', 100000000) + PRM('pal_system_tokens_per_hour', 500);
    const a = rec({ key: K(1), tin: 400, tout: 200 }, 0);
    const res = run(QL, `select ${a.call}::text; ${quota()} reset role; select kind || ':' || scope || ':' || action from private.ops_alerts; select value_int from private.params where key = 'pal_enabled'; set local role authenticated;`, { setup: set + a.setup });
    assert.ok(res.ok, res.err);
    assert.equal(J(res, 0).state, 'OFF');
    assert.deepEqual(res.rows.slice(2), ['SPIKE_SYSTEM:SYSTEM:DISABLE_ALL', '0']);
    assert.equal(stateOf(run(HK, quota(), { setup: set + `update private.params set value_int = 0 where key = 'pal_enabled';` })), 'OFF');
  });
});

describe('PAL-OWN: hàm cho chủ sản phẩm (chỉ service_role)', { skip }, () => {
  const seedUsage = `insert into private.ai_usage(household_id, member_id, model, input_tokens, output_tokens, est_cost_usd, at) values
    ('${HH1}', '00000000-0000-4000-8000-000000000201', 'm1', 1000, 500, 0.01, now()),
    ('${HH1}', '00000000-0000-4000-8000-000000000202', 'm2', 200, 100, 0.002, now()),
    ('${HH2}', '00000000-0000-4000-8000-000000000203', 'm1', 50, 50, 0.001, now());`;
  it('PAL-OWN-01: người dùng thường KHÔNG gọi được hàm chủ sản phẩm', () => {
    for (const sql of [`select app.ai_usage_report(current_date - 1, current_date)`, `select app.ai_alerts_list()`, `select app.pal_unlock('${HH1}')`, `select app.pal_set_enabled(false)`,
      `select app.ai_usage_series(now() - interval '1 day', now() + interval '1 day')`]) {
      assert.equal(run(QL, sql).code, '42501', sql);
      assert.equal(run(DEV, sql).code, '42501', sql);
    }
  });
  it('PAL-OWN-02: báo cáo token theo ngày, hộ, model, chi phí; chuỗi theo giờ/ngày cho một hộ hoặc một người', () => {
    const r = J(run(SVC, `select app.ai_usage_report(current_date - 1, current_date + 1)::text`, { setup: seedUsage }));
    assert.deepEqual([r.total.calls, r.total.input_tokens, r.total.output_tokens], [3, 1250, 650]);
    assert.equal(Number(r.total.est_cost_usd), 0.013);
    assert.equal(r.by_household.length, 2);
    assert.equal(r.by_household[0].household_id, HH1);
    assert.deepEqual(r.by_model.map((m) => [m.model, m.calls]), [['m1', 2], ['m2', 1]]);
    assert.equal(r.by_day.reduce((n, d) => n + d.calls, 0), 3);
    const hh = J(run(SVC, `select app.ai_usage_series(now() - interval '1 day', now() + interval '1 day', 'hour', '${HH1}')::text`, { setup: seedUsage }));
    assert.equal(hh.reduce((n, d) => n + d.calls, 0), 2);
    const mem = J(run(SVC, `select app.ai_usage_series(now() - interval '1 day', now() + interval '1 day', 'day', null, '00000000-0000-4000-8000-000000000202')::text`, { setup: seedUsage }));
    assert.deepEqual(mem.map((d) => d.input_tokens), [200]);
    rejected(run(SVC, `select app.ai_usage_series(now(), now(), 'week')`), 'VALIDATION', 'PT422');
  });
  it('PAL-OWN-03: mở khóa hộ (pal_unlock) trả hộ về OK và ghi UNLOCKED; bật/tắt toàn bộ bằng pal_set_enabled; cảnh báo KHÔNG chứa nội dung hội thoại', () => {
    const lock = `insert into private.pal_locks(household_id, reason) values ('${HH1}', 'SPIKE');`;
    assert.equal(stateOf(run(QL, quota(), { setup: lock })), 'LOCKED');
    const un = run(SVC, `select app.pal_unlock('${HH1}')::text; select app.pal_unlock('${HH1}')::text; select count(*) from private.pal_locks; select kind from private.ops_alerts`, { setup: lock });
    assert.deepEqual([J(un, 0).unlocked, J(un, 1).unlocked, un.rows[2], un.rows[3]], [true, false, '0', 'UNLOCKED']);
    const off = run(SVC, `select app.pal_set_enabled(false)::text; select value_int from private.params where key = 'pal_enabled'; select app.pal_set_enabled(true)::text; select value_int from private.params where key = 'pal_enabled'`);
    assert.deepEqual([J(off, 0).enabled, off.rows[1], J(off, 2).enabled, off.rows[3]], [false, '0', true, '1']);
    rejected(run(SVC, `select app.pal_set_enabled(null)`), 'VALIDATION', 'PT422');
    const secret = 'NOI-DUNG-RIENG-TU-KHONG-DUOC-LO';
    const a = rec({ key: K(1), user: secret, tin: 900, tout: 900 }, 0);
    const alerts = run(QL, `select ${a.call}::text; reset role; select set_config('request.jwt.claims', '{"role":"service_role"}', true) as _c \\gset
 set local role service_role; select app.ai_alerts_list()::text`,
      { setup: PRM('pal_household_tokens_per_day', 1000) + PRM('pal_spike_floor_tokens_per_hour', 1) + a.setup });
    assert.ok(alerts.ok, alerts.err);
    const list = JSON.parse(alerts.rows.at(-1));
    assert.ok(list.length >= 2);
    assert.doesNotMatch(alerts.rows.at(-1), new RegExp(secret));
    for (const x of list) assert.deepEqual(Object.keys(x).sort(), ['action', 'at', 'household_id', 'id', 'kind', 'metrics', 'scope']);
  });
});
