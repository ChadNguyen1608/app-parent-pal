// Test Deno cho T0.5 (bộ xếp chạy trong Deno cho CÙNG đầu ra với Node) và T3.2 (profile-save, schedule-preview, schedule-commit
// với CSDL giả, không gọi đám mây). Chạy: deno test --allow-read --allow-run=node backend/supabase/functions/_tests (xem README).
import { assertEquals, assert, assertRejects, assertNotEquals, assertMatch } from './assert.ts';
import { scheduleWeek, validatePhase, PROFILES, PARAMS } from '../_shared/scheduler/src/index.ts';
import { ENGINE_VERSION } from '../_shared/scheduler/version.ts';
import { ApiError, handle, fromDbError, type Deps } from '../_shared/api.ts';
import { signCommit, commitMessage, hmacHex, stable, sha256Hex, type ServerInputs } from '../_shared/schedule-core.ts';
import { run as profileSave } from '../profile-save/handler.ts';
import { run as preview } from '../schedule-preview/handler.ts';
import { run as commit } from '../schedule-commit/handler.ts';

const here = new URL('.', import.meta.url);
const KEY = 'TEST-ONLY-schedule-commit-key-not-real-0003';
const PID = '00000000-0000-4000-8000-000000000501';
const CID = '00000000-0000-4000-8000-000000000301';
const IDEM = '30000000-0000-4000-8000-000000000001';

// ------------------------------------------------------------------ T0.5: cùng đầu ra với Node
function runProfile(prof: any) {
  let phase = null;
  if (prof.phase) phase = validatePhase(prof.phase, prof.phaseHistory || []).status === 'OK' ? prof.phase : null;
  return scheduleWeek({ ...prof, phase });
}

Deno.test('T0.5: đầu ra đầy đủ của scheduleWeek trên P1..P8 trong Deno khớp Node từng byte', async () => {
  const p = await new Deno.Command('node', { args: ['--experimental-strip-types', new URL('node-ref.ts', here).pathname], stdout: 'piped', stderr: 'piped' }).output();
  assert(p.success, new TextDecoder().decode(p.stderr));
  const nodeOut = JSON.parse(new TextDecoder().decode(p.stdout));
  assertEquals(Object.keys(nodeOut), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
  for (const prof of PROFILES as any[]) {
    assertEquals(JSON.stringify(runProfile(prof)), JSON.stringify(nodeOut[prof.id]), `${prof.id}: Deno khác Node`);
  }
});

Deno.test('T0.5: khớp golden của packages/scheduler (giờ, tên khối, trạng thái ngày, số đánh đổi, số câu hỏi) và PARAMS', async () => {
  const fx = async (n: string) => JSON.parse(await Deno.readTextFile(new URL(`../../../../packages/scheduler/fixtures/golden/${n}.json`, here)));
  const slim = (b: any) => ({ bat_dau: b.bat_dau, ket_thuc: b.ket_thuc, khoi: b.khoi, tai: b.tai, nhom: b.nhom, man_hinh: b.man_hinh });
  for (const prof of PROFILES as any[]) {
    const g = await fx(prof.id), res = runProfile(prof);
    assertEquals(Object.keys(res.plan.ngay), Object.keys(g.days));
    for (const d of Object.keys(g.days)) assertEquals(res.plan.ngay[d].map(slim), g.days[d], `${prof.id} ${d}`);
    assertEquals(Object.fromEntries(Object.entries<any>(res.days).map(([d, x]) => [d, x.status])), g.day_status);
    assertEquals(res.tradeoffs.length, g.n_tradeoffs);
    assertEquals(res.questions.length, g.n_questions);
  }
  assertEquals(JSON.parse(JSON.stringify(PARAMS)), await fx('params'));
});

Deno.test('T0.5: tất định (chạy lại cho cùng đầu ra) và ghi độ trễ đo được (Q-TS-05: không đặt ngưỡng)', () => {
  for (const prof of PROFILES as any[]) assertEquals(JSON.stringify(runProfile(prof)), JSON.stringify(runProfile(prof)));
  const times: number[] = [];
  for (let i = 0; i < 40; i++) for (const prof of PROFILES as any[]) { const t = performance.now(); runProfile(prof); times.push(performance.now() - t); }
  times.sort((a, b) => a - b);
  const pct = (p: number) => times[Math.min(times.length - 1, Math.floor(p * times.length))].toFixed(2);
  console.log(`[T0.5 độ trễ scheduleWeek, ${times.length} lần, ms] p50=${pct(0.5)} p95=${pct(0.95)} max=${times.at(-1)!.toFixed(2)} (Deno ${Deno.version.deno}, tính toán thuần; chưa gồm khởi động lạnh và mạng)`);
  assertMatch(ENGINE_VERSION, /^e1-[0-9a-f]{12}$/);
});

// ------------------------------------------------------------------ chữ ký: vector dùng chung với SQL
Deno.test('T3.2: HMAC của commitMessage khớp vector sinh độc lập (cùng vector với test SQL SCH-SIG-01)', async () => {
  const v = JSON.parse(await Deno.readTextFile(new URL('../../tests/fixtures/commit-signature-vector.json', here)));
  assertEquals(await signCommit(v.key, v.fields), v.signature);
  assertNotEquals(await signCommit(v.key, { ...v.fields, expected_rev: 2 }), v.signature);
  assertNotEquals(await signCommit(v.key, { ...v.fields, output: v.fields.output + ' ' }), v.signature);
});

// ------------------------------------------------------------------ CSDL giả
function inputsOf(prof: any, over: Partial<ServerInputs> & { budget?: any; keep?: any } = {}): ServerInputs {
  return {
    profile: { id: PID, child_id: CID, version: 1, state: 'DRAFT', kind: 'CHUAN',
      input: { school: prof.school, commute: prof.commute, twoSessions: !!prof.twoSessions, sleep: prof.sleep, meals: prof.meals },
      budget: over.budget !== undefined ? over.budget : prof.budget, keep_confirmed: over.keep ?? {} } as any,
    child: { grade: prof.grade, age_years: prof.age },
    cards: (prof.activities || []).map((a: any, i: number) => ({ id: a.id ?? `c${i}`, name: a.ten, type: a.loai, days: a.thu,
      start_time: a.bat_dau + ':00', end_time: a.ket_thuc + ':00', travel_before_min: Math.floor(a.di_lai / 2), travel_after_min: a.di_lai - Math.floor(a.di_lai / 2) })),
    content_hash: 'c'.repeat(64), rev: 1, lock_state: 'UNLOCKED', ...over,
  } as ServerInputs;
}

interface Fake { deps: Deps; calls: Array<{ fn: string; args: any }>; }
function fake(inputs: ServerInputs & { replay?: any }, opts: { applyError?: ApiError; key?: string | undefined } = {}): Fake {
  const calls: Fake['calls'] = [];
  const seen = new Map<string, any>();
  const deps: Deps = {
    env: (k) => (k === 'SCHEDULE_COMMIT_KEY' ? ('key' in opts ? opts.key : KEY) : undefined),
    db: {
      async rpc(fn, args) {
        calls.push({ fn, args });
        if (fn === 'schedule_inputs') return inputs;
        if (fn === 'schedule_commit_apply') {
          if (opts.applyError) throw opts.applyError;
          // như SQL: kiểm chữ ký bằng cùng khóa và chuỗi ký
          const msg = commitMessage({ child_id: args.p_child, profile_id: args.p_profile, expected_rev: args.p_expected_rev, idempotency_key: args.p_idempotency_key,
            content_hash: args.p_content_hash, input_hash: args.p_input_hash, engine_version: args.p_engine_version, params_version: args.p_params_version,
            balance_label: args.p_balance_label, output: args.p_output, tradeoffs: args.p_tradeoffs, questions: args.p_questions, answers: args.p_answers });
          if (await hmacHex(KEY, msg) !== args.p_signature) throw new ApiError('FORBIDDEN', 'AD-03', 'sai chữ ký');
          if (seen.has(args.p_idempotency_key)) return { ...seen.get(args.p_idempotency_key), replay: true };
          const r = { ok: true, version_id: crypto.randomUUID(), rev: args.p_expected_rev + 1, label_status: 'chua_kiem_chung', replay: false };
          seen.set(args.p_idempotency_key, r);
          return r;
        }
        if (fn === 'profile_save') return { ok: true, profile_id: PID, version: 1, state: 'DRAFT', content_hash: 'h', changed: true, card_ids: [] };
        throw new Error('rpc lạ: ' + fn);
      },
    },
  };
  return { deps, calls };
}
const P = (id: string) => (PROFILES as any[]).find((p) => p.id === id);
const applyCalls = (f: Fake) => f.calls.filter((c) => c.fn === 'schedule_commit_apply');
const body = (o: any = {}) => ({ profile_id: PID, expected_rev: 1, idempotency_key: IDEM, ...o });

Deno.test('T3.2 preview: P1..P8 chạy trên dữ liệu máy chủ giả, không ghi gì, nhãn chưa kiểm chứng, có bảng quỹ và cờ commitable', async () => {
  for (const prof of PROFILES as any[]) {
    if (prof.phase) continue;   // giai đoạn là việc của T4.1
    const f = fake(inputsOf(prof));
    const r: any = await preview({ profile_id: PID }, f.deps);
    assertEquals(f.calls.map((c) => c.fn), ['schedule_inputs']);
    assertEquals(r.label_status, 'chua_kiem_chung'); assertEquals(r.balance_label, 'UNKNOWN');
    assertEquals(Object.keys(r.plan.ngay).length, 7);
    assertEquals(r.engine_version, ENGINE_VERSION); assertMatch(r.params_version, /^p-[0-9a-f]{12}$/); assertMatch(r.input_hash, /^[0-9a-f]{64}$/);
    assert(r.board.wd.ngu && r.board.we.man_hinh);
    assertEquals(r.commitable, r.blockers.length === 0);
  }
  const ok: any = await preview({ profile_id: PID }, fake(inputsOf(P('P2'))).deps);
  assertEquals(ok.commitable, true, JSON.stringify(ok.blockers));
  const quaTai: any = await preview({ profile_id: PID }, fake(inputsOf(P('P6'))).deps);
  assertEquals(quaTai.commitable, false);
  assert(quaTai.blockers.some((b: any) => b.rule === 'C/A1'), 'P6 (quá tải) phải bị chặn vì có ngày XUNG_DOT');
});

Deno.test('T3.2 preview: cùng đầu vào cho cùng input_hash; đổi một thẻ thì đổi (AC-06)', async () => {
  const a: any = await preview({ profile_id: PID }, fake(inputsOf(P('P2'))).deps);
  const b: any = await preview({ profile_id: PID }, fake(inputsOf(P('P2'))).deps);
  assertEquals(a.input_hash, b.input_hash);
  const i2 = inputsOf(P('P2')); i2.cards[0].end_time = '19:15:00';
  const c: any = await preview({ profile_id: PID }, fake(i2).deps);
  assertNotEquals(a.input_hash, c.input_hash);
});

Deno.test('T3.2 commit: chạy lại bộ xếp ở máy chủ, ký, gọi SQL đúng một lần; kết quả client gửi kèm bị bỏ qua', async () => {
  const f = fake(inputsOf(P('P2')));
  const res: any = await commit(body({ output: { ngay: { T2: [{ khoi: 'GIẢ MẠO' }] } }, plan: 'x', tradeoffs: ['x'], signature: 'x' }), f.deps);
  assertEquals(res.ok, true); assertEquals(res.rev, 2); assertEquals(res.label_status, 'chua_kiem_chung');
  const ap = applyCalls(f); assertEquals(ap.length, 1);
  const a = ap[0].args;
  assert(!a.p_output.includes('GIẢ MẠO'));
  const mine = runProfile(P('P2'));
  assertEquals(JSON.parse(a.p_output).ngay, JSON.parse(JSON.stringify(mine.plan.ngay)));
  assertEquals(a.p_content_hash, 'c'.repeat(64)); assertEquals(a.p_child, CID); assertEquals(a.p_expected_rev, 1);
  assertEquals(a.p_engine_version, ENGINE_VERSION); assertEquals(a.p_balance_label, 'UNKNOWN');
});

Deno.test('T3.2 commit: từ chối khi có ngày không xếp được / sàn ngủ / ô đỏ chưa xác nhận; không gọi SQL ghi', async () => {
  const quaTai = fake(inputsOf(P('P6')));
  const e1 = await assertRejects(() => commit(body(), quaTai.deps), ApiError); assertEquals([e1.code, e1.rule], ['VALIDATION', 'C/A1']); assertEquals(applyCalls(quaTai).length, 0);

  const ngu = fake(inputsOf(P('P2'), { budget: { wd: { hoc_nha: 60, sinh_hoat: 120, ngu: 480, man_hinh: 30 }, we: { hoc_nha: 60, sinh_hoat: 120, ngu: 600, man_hinh: 60 } } }));
  const e2 = await assertRejects(() => commit(body(), ngu.deps), ApiError); assertEquals([e2.code, e2.rule], ['VALIDATION', 'D-02/C1']); assertEquals(applyCalls(ngu).length, 0);
  const e2b = await assertRejects(() => commit(body({ confirmed_red: [{ col: 'wd', cell: 'ngu' }] }), ngu.deps), ApiError); assertEquals(e2b.rule, 'D-02/C1');

  const red = { wd: { hoc_nha: 60, sinh_hoat: 120, ngu: 540, man_hinh: 150 }, we: { hoc_nha: 60, sinh_hoat: 120, ngu: 600, man_hinh: 60 } };
  const f = fake(inputsOf(P('P2'), { budget: red }));
  const e3 = await assertRejects(() => commit(body(), f.deps), ApiError); assertEquals([e3.code, e3.rule], ['VALIDATION', 'D6/A2']); assertEquals(applyCalls(f).length, 0);
  const okConfirm: any = await commit(body({ confirmed_red: [{ col: 'wd', cell: 'man_hinh' }] }), f.deps);
  assertEquals(okConfirm.ok, true);
  assertEquals(JSON.parse(applyCalls(f)[0].args.p_output).giu_muc, [{ col: 'wd', cell: 'man_hinh' }]);
  // đã lưu "Giữ mức này" trong hồ sơ thì không cần gửi lại
  const f2 = fake(inputsOf(P('P2'), { budget: red, keep: { wd: { man_hinh: true } } }));
  assertEquals(((await commit(body(), f2.deps)) as any).ok, true);
  // xác nhận ô không đỏ: từ chối
  const e4 = await assertRejects(() => commit(body({ confirmed_red: [{ col: 'we', cell: 'hoc_nha' }] }), fake(inputsOf(P('P2'))).deps), ApiError); assertEquals(e4.code, 'VALIDATION');
});

Deno.test('T3.2 commit: rev cũ -> CONFLICT_REV; lịch khóa -> LOCKED; thiếu khóa ký -> INTERNAL; sai đầu vào -> VALIDATION', async () => {
  const stale = fake({ ...inputsOf(P('P2')), rev: 3 });
  const a = await assertRejects(() => commit(body(), stale.deps), ApiError); assertEquals(a.code, 'CONFLICT_REV'); assertEquals(a.extra.rev, 3); assertEquals(applyCalls(stale).length, 0);
  const lk = fake({ ...inputsOf(P('P2')), lock_state: 'LOCKED' });
  assertEquals((await assertRejects(() => commit(body(), lk.deps), ApiError)).code, 'LOCKED');
  assertEquals((await assertRejects(() => commit(body(), fake(inputsOf(P('P2')), { key: undefined }).deps), ApiError)).code, 'INTERNAL');
  assertEquals((await assertRejects(() => commit(body(), fake(inputsOf(P('P2')), { key: 'ngan' }).deps), ApiError)).code, 'INTERNAL');
  for (const bad of [{ profile_id: 'x' }, { idempotency_key: 'x' }, { expected_rev: -1 }, { expected_rev: 'a' }, { confirmed_red: 'x' }]) {
    assertEquals((await assertRejects(() => commit(body(bad), fake(inputsOf(P('P2'))).deps), ApiError)).code, 'VALIDATION', JSON.stringify(bad));
  }
  const noSchool = inputsOf(P('P2')); (noSchool.profile.input as any).commute = 999;
  assertEquals((await assertRejects(() => commit(body(), fake(noSchool).deps), ApiError)).code, 'VALIDATION');
});

Deno.test('T3.2 commit: gửi lại cùng khóa trả kết quả cũ (IDEMPOTENT_REPLAY), kể cả khi dữ liệu đã đổi; không chạy bộ xếp', async () => {
  const replay = fake({ ok: true, replay: { ok: true, version_id: 'v-old', rev: 2, label_status: 'chua_kiem_chung' } } as any);
  const r: any = await commit(body(), replay.deps);
  assertEquals([r.replay, r.code, r.version_id, r.rev], [true, 'IDEMPOTENT_REPLAY', 'v-old', 2]);
  assertEquals(applyCalls(replay).length, 0);
  // hai lần liên tiếp qua CSDL giả: lần hai do SQL báo replay
  const f = fake(inputsOf(P('P2')));
  const a: any = await commit(body(), f.deps), b: any = await commit(body(), f.deps);
  assertEquals(a.replay, false); assertEquals(b.replay, true); assertEquals(b.code, 'IDEMPOTENT_REPLAY'); assertEquals(b.version_id, a.version_id);
  // khóa viết hoa vẫn ký đúng (SQL ký theo uuid::text chữ thường)
  const g = fake(inputsOf(P('P2')));
  assertEquals(((await commit(body({ idempotency_key: IDEM.toUpperCase() }), g.deps)) as any).ok, true);
});

Deno.test('T3.2 commit: câu trả lời phải khớp câu hỏi của lịch và được ký cùng; lỗi từ SQL được chuyển nguyên mã', async () => {
  const f = fake(inputsOf(P('P2')));
  const pre: any = await preview({ profile_id: PID }, f.deps);
  const q = pre.questions[0];
  if (q) {
    const key = `${q.kind}.${q.day}`;
    await commit(body({ answers: [{ question_key: key, answer: 'giu_quy' }] }), f.deps);
    assertEquals(JSON.parse(applyCalls(f)[0].args.p_answers), [{ question_key: key, answer: 'giu_quy' }]);
    assertEquals(JSON.parse(applyCalls(f)[0].args.p_questions).find((x: any) => x.day === q.day).answer, 'giu_quy');
  }
  assertEquals((await assertRejects(() => commit(body({ answers: [{ question_key: 'khac.T2', answer: 'x' }] }), fake(inputsOf(P('P2'))).deps), ApiError)).code, 'VALIDATION');
  const bad = fake(inputsOf(P('P2')), { applyError: new ApiError('FROZEN', 'BR-FAM-054', 'x') });
  assertEquals((await assertRejects(() => commit(body(), bad.deps), ApiError)).code, 'FROZEN');
});

Deno.test('T3.2 profile-save: kiểm đầu vào rồi chuyển patch nguyên văn cho SQL; chữ tự do, ô Ngủ, địa điểm, khóa lạ bị chặn', async () => {
  const f = fake(inputsOf(P('P2')));
  const card = { name: 'Vẽ', type: 'nang_khieu', days: ['T7'], start: '09:00', end: '10:00', travel_before_min: 10 };
  const r: any = await profileSave({ child_id: CID, base_version: 1, input: { commute: 10 }, budget: null, cards: [card] }, f.deps);
  assertEquals(r.ok, true);
  assertEquals(f.calls[0].fn, 'profile_save'); assertEquals(f.calls[0].args.p_patch, { input: { commute: 10 }, budget: null, cards: [card] }); assertEquals(f.calls[0].args.p_base_version, 1);
  const bad = async (b: any, code: string) => assertEquals((await assertRejects(() => profileSave({ child_id: CID, ...b }, fake(inputsOf(P('P2'))).deps), ApiError)).code, code, JSON.stringify(b));
  await bad({ cards: [{ ...card, note: 'a'.repeat(501) }] }, 'VALIDATION');   // D-71: ghi chú tối đa 500 ký tự
  await bad({ cards: [{ ...card, note: 7 }] }, 'VALIDATION');
  await bad({ cards: [{ ...card, location: 'Q1' }] }, 'VALIDATION');
  await bad({ cards: [{ ...card, end: '08:00' }] }, 'VALIDATION');
  await bad({ cards: [{ ...card, days: [] }] }, 'VALIDATION');
  await bad({ keep_confirmed: { wd: { ngu: true } } }, 'VALIDATION');
  await bad({ input: { school_name: 'x' } }, 'VALIDATION');
  await bad({ input: { commute: 500 } }, 'VALIDATION');
  await bad({ budget: { wd: { hoc_nha: 1 } } }, 'VALIDATION');
  await bad({}, 'VALIDATION');
  assertEquals((await assertRejects(() => profileSave({ child_id: 'x', input: {} }, f.deps), ApiError)).code, 'VALIDATION');
});

Deno.test('API: handler chỉ nhận POST + Bearer + JSON object; lỗi theo dạng Tech Spec §0; lỗi lạ không lộ nội dung; fromDbError', async () => {
  const f = fake(inputsOf(P('P2')));
  const h = handle(() => f.deps, async () => ({ ok: true }));
  const call = (init: RequestInit) => h(new Request('http://x/fn', init));
  assertEquals((await call({ method: 'GET' })).status, 422);
  assertEquals((await call({ method: 'POST', body: '{}' })).status, 401);
  assertEquals((await call({ method: 'POST', headers: { authorization: 'Bearer t' }, body: 'không json' })).status, 422);
  assertEquals((await call({ method: 'POST', headers: { authorization: 'Bearer t' }, body: '[]' })).status, 422);
  const ok = await call({ method: 'POST', headers: { authorization: 'Bearer t' }, body: '{}' });
  assertEquals([ok.status, await ok.json(), ok.headers.has('x-request-id')], [200, { ok: true }, true]);
  const h2 = handle(() => f.deps, async () => { throw new ApiError('CONFLICT_REV', 'AC-24', 'cũ'); });
  const r2 = await h2(new Request('http://x', { method: 'POST', headers: { authorization: 'Bearer t' }, body: '{}' }));
  assertEquals([r2.status, (await r2.json()).error], [409, { code: 'CONFLICT_REV', message_vi: 'cũ', rule: 'AC-24' }]);
  const h3 = handle(() => f.deps, async () => { throw new Error('mật khẩu 123456 trong lỗi'); });
  const origErr = console.error; console.error = () => {};
  const r3 = await h3(new Request('http://x', { method: 'POST', headers: { authorization: 'Bearer t' }, body: '{}' }));
  console.error = origErr;
  const t3 = JSON.stringify(await r3.json());
  assertEquals(r3.status, 500); assert(!t3.includes('123456'));
  const e = fromDbError({ message: 'FROZEN', details: 'BR-FAM-054', hint: 'tạm dừng' });
  assertEquals([e.code, e.status, e.rule, e.messageVi], ['FROZEN', 423, 'BR-FAM-054', 'tạm dừng']);
  const pr = fromDbError({ message: 'PLAN_REQUIRED', details: 'D-68.free', hint: 'Cần gói' });
  assertEquals([pr.code, pr.status, pr.rule, pr.messageVi], ['PLAN_REQUIRED', 402, 'D-68.free', 'Cần gói']);   // D-68
  assertEquals(fromDbError({ message: 'relation "x" does not exist' }).code, 'INTERNAL');
});

Deno.test('stable/sha256: chuỗi chuẩn hóa không phụ thuộc thứ tự khóa', async () => {
  assertEquals(stable({ b: 1, a: [2, { d: 1, c: undefined }] }), '{"a":[2,{"d":1}],"b":1}');
  assertEquals(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});
