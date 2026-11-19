// Test Deno cho pal-chat (D-69): an toàn chặn trước AI, ẩn danh khứ hồi, hạn mức/cờ/khóa, token, chữ ký. Claude API GIẢ (không gọi mạng).
// Chạy: deno test --allow-read backend/supabase/functions/_tests/pal.test.ts
import { assertEquals, assert, assertRejects, assertNotEquals } from './assert.ts';
import { ApiError, type Db } from '../_shared/api.ts';
import { Anonymizer, addressTerm } from '../_shared/pal-anon.ts';
import { palRecordMessage, signPalRecord, palHmacHex } from '../_shared/pal-core.ts';
import { checkOutput, checkSafety, foldVi } from '../_shared/pal-safety.ts';
import { buildSystemPrompt } from '../_shared/pal-prompt.ts';
import { run, estimateTokens, type PalDeps } from '../pal-chat/handler.ts';

const here = new URL('.', import.meta.url);
const KEY = 'TEST-ONLY-pal-record-key-not-real-0004';
const IDEM = '50000000-0000-4000-8000-0000000000a1';
const NA = '00000000-0000-4000-8000-000000000301';
const BIN = '00000000-0000-4000-8000-000000000302';

// ------------------------------------------------------------------ vector chữ ký dùng chung với SQL
Deno.test('PAL-SIG: HMAC của palRecordMessage khớp vector sinh độc lập (cùng vector với test SQL PAL-SIG-01)', async () => {
  const v = JSON.parse(await Deno.readTextFile(new URL('../../tests/fixtures/pal-record-vector.json', here)));
  assertEquals(await signPalRecord(v.key, v.fields), v.signature);
  assertNotEquals(await signPalRecord(v.key, { ...v.fields, user: v.fields.user + ' ' }), v.signature);
  assertNotEquals(await signPalRecord(v.key, { ...v.fields, counted: false }), v.signature);
  assertNotEquals(await signPalRecord(v.key, { ...v.fields, model: 'khac' }), v.signature);
  assertEquals(palRecordMessage({ ...v.fields, conversation: null }).split('\n')[1], '-');
});

// ------------------------------------------------------------------ lớp an toàn
Deno.test('PAL-SAFE: tình huống khẩn có dấu và không dấu đều bị chặn, lời mẫu chỉ có 115/111/113', () => {
  const urgent: Array<[string, string]> = [
    ['Tôi muốn chết', 'EMERGENCY_SELF_HARM'], ['toi muon chet', 'EMERGENCY_SELF_HARM'], ['Mình không muốn sống nữa', 'EMERGENCY_SELF_HARM'],
    ['minh khong muon song nua', 'EMERGENCY_SELF_HARM'], ['em định tự tử', 'EMERGENCY_SELF_HARM'], ['dinh tu tu', 'EMERGENCY_SELF_HARM'],
    ['con tôi bị xâm hại', 'EMERGENCY_CHILD_ABUSE'], ['con toi bi xam hai', 'EMERGENCY_CHILD_ABUSE'], ['bố đánh đập con', 'EMERGENCY_CHILD_ABUSE'],
    ['con bị co giật', 'EMERGENCY_DANGER_LIFE'], ['con bi co giat', 'EMERGENCY_DANGER_LIFE'], ['bé khó thở, tím tái', 'EMERGENCY_DANGER_LIFE'],
    ['con uống nhầm thuốc', 'EMERGENCY_DANGER_LIFE'], ['be bi duoi nuoc', 'EMERGENCY_DANGER_LIFE'],
  ];
  for (const [m, flag] of urgent) {
    const r = checkSafety(m, 'chị');
    assert(r.flags.includes(flag as never), `${m} -> ${r.flags}`);
    assert(r.block && r.reply, m);
    for (const n of ['115', '111', '113']) assert(r.reply!.includes(n), `${m}: thiếu ${n}`);
    assert(!/\d+\s?(mg|ml)|liều/i.test(r.reply!), 'lời khẩn không nêu liều');
  }
});

Deno.test('PAL-SAFE: thuốc/liều bị chặn bằng lời nhắc không thay khám bệnh; chẩn đoán gắn cờ nhưng không chặn', () => {
  for (const m of ['liều paracetamol cho bé 10kg là bao nhiêu', 'lieu thuoc ha sot cho con', 'cho con uống thuốc gì khi ho', 'con uong 5 mg duoc khong']) {
    const r = checkSafety(m);
    assert(r.flags.includes('MEDICAL_DRUG') && r.block, m);
    assert(/không tư vấn thuốc/.test(r.reply!) && /bác sĩ/.test(r.reply!));
  }
  const d = checkSafety('con tôi có phải bị tự kỷ không');
  assert(d.flags.includes('MEDICAL_DIAGNOSIS') && !d.block);
});

Deno.test('PAL-SAFE: không báo động nhầm câu thường gặp (từ từ, ăn rồi, thuốc lá, đánh răng, liệu con có)', () => {
  const ok = ['con ăn từ từ thôi', 'con ăn rồi mẹ ơi', 'chồng hút thuốc lá trong nhà', 'dạy con đánh răng', 'liệu con có theo kịp lớp 1 không',
    'bé nghe tu tu hieu dan', 'con đòi ăn suốt', 'đón rồi ạ', 'nên cho con học gì cuối tuần', 'bé uống 200ml sữa mỗi bữa có đủ không', 'treo cờ ngày lễ cùng con'];
  for (const m of ok) {
    const r = checkSafety(m);
    assertEquals(r.block, false, `${m} bị chặn: ${r.flags}`);
    assertEquals(r.flags.filter((f) => f.startsWith('EMERGENCY')), [], m);
  }
});

Deno.test('PAL-SAFE: đòn roi và buồn bã chỉ gắn cờ (có dấu, không dấu); "ăn rồi" không phải "ăn roi"', () => {
  assert(checkSafety('mình định cho con ăn roi cho nhớ').flags.includes('CORPORAL_PUNISHMENT'));
  assert(checkSafety('co nen danh con khong').flags.includes('CORPORAL_PUNISHMENT'));
  assert(!checkSafety('con ăn rồi').flags.includes('CORPORAL_PUNISHMENT'));
  const d = checkSafety('mình kiệt sức và buồn quá');
  assert(d.flags.includes('PARENT_DISTRESS') && !d.block);
});

Deno.test('PAL-SAFE: kiểm đầu ra thay chữ nêu liều thuốc; foldVi bỏ dấu', () => {
  assertEquals(checkOutput('Cho con uống 250 mg mỗi 6 giờ').ok, false);
  assertEquals(checkOutput('Cho con ngủ đủ 10 giờ nhé').ok, true);
  assertEquals(foldVi('Đánh răng, Ừ!'), 'danh rang u');
});

// ------------------------------------------------------------------ ẩn danh
const FAM = { children: [{ call_name: 'bé Na' }, { call_name: 'bé Bình An' }], adults: [{ call_name: 'chị Hoa', self: true }, { call_name: 'anh Minh' }] };

Deno.test('PAL-ANON: khứ hồi tên con, tên người lớn; biến thể không dấu, hoa thường; không nuốt chữ thường có dấu khác', () => {
  const a = new Anonymizer(FAM);
  const out = a.anonymize('Bé Na nhà mình cãi nhau với binh an, anh Minh bảo Hoa quá nghiêm. Con không bịnh gì, ăn hòa thuận.');
  assert(!/Na\b|Binh|binh an|Minh|Hoa\b/i.test(out.replace('bịnh', '').replace('hòa thuận', '')), out);
  assert(out.includes('[con 1]') && out.includes('[con 2]') && out.includes('[người lớn 1]') && out.includes('[phụ huynh]'), out);
  assert(out.includes('hòa thuận') && out.includes('bịnh'), `không được nuốt chữ thường có dấu khác: ${out}`);
  assertEquals(a.restore('Chào [phụ huynh], [con 1] và [Con 2] ổn chứ'), 'Chào chị Hoa, bé Na và bé Bình An ổn chứ');
  assertEquals(a.restore('hỏi [người lớn 1] giúp'), 'hỏi anh Minh giúp');
  assertEquals(a.restore('chị [phụ huynh] ơi'), 'chị Hoa ơi');   // không "chị chị Hoa"
  assertEquals(a.restore('nhãn lạ [con 9] giữ nguyên'), 'nhãn lạ [con 9] giữ nguyên');
});

Deno.test('PAL-ANON: trường, địa chỉ, điện thoại, email được thay và khôi phục', () => {
  const a = new Anonymizer(FAM);
  const src = 'Con học trường Tiểu học Nguyễn Du, nhà ở số 12 đường Láng Hạ, gọi 0912345678 hoặc lan@example.com nhé.';
  const out = a.anonymize(src);
  for (const s of ['Nguyễn Du', 'Láng Hạ', '0912345678', 'lan@example.com']) assert(!out.includes(s), `${s} còn trong: ${out}`);
  assertEquals(a.restore(out).replace(/\s+/g, ' '), src);
});

Deno.test('PAL-ANON: nhãn nguyên văn không bị khớp lại khi con tên "Trường"; addressTerm', () => {
  const a = new Anonymizer({ children: [{ call_name: 'Trường' }], adults: [] });
  const out = a.anonymize('Con học Trường Tiểu học Kim Đồng');
  assert(out.includes('[trường 1]'), out);
  assertEquals(addressTerm('chị Hoa'), 'chị');
  assertEquals(addressTerm('Hoa'), 'bạn');
});

// ------------------------------------------------------------------ handler với CSDL giả và Claude API giả
interface Scn {
  state?: string; remaining?: number; tokensToday?: number; tokensCap?: number; sysToday?: number; sysBudget?: number;
  env?: Record<string, string | undefined>; replay?: any; history?: any[]; reply?: string; usage?: { input_tokens: number; output_tokens: number };
  convChild?: string | null; maxQ?: number;
}
function fakeEnv(s: Scn) {
  const calls: Array<{ fn: string; args: any }> = [];
  const fetches: Array<{ url: string; headers: Record<string, string>; body: string }> = [];
  const recorded: any[] = [];
  const env: Record<string, string | undefined> = { PAL_RECORD_KEY: KEY, ANTHROPIC_API_KEY: 'sk-ant-TEST-ONLY-fake', ...(s.env ?? {}) };
  const db: Db = {
    async rpc(fn, args) {
      calls.push({ fn, args });
      if (fn === 'pal_prepare') {
        return { state: s.state ?? 'OK', tier: 'TRIAL', limit: 20, used: 1, remaining: s.remaining ?? 19,
          tokens_today: s.tokensToday ?? 0, tokens_cap: s.tokensCap ?? 60000, system_tokens_today: s.sysToday ?? 0, system_budget: s.sysBudget ?? 2000000,
          max_output_tokens: 1024, max_question_chars: s.maxQ ?? 2000, replay: s.replay ?? null,
          children: [{ id: NA, call_name: 'bé Na', age_years: 7, grade: 2 }, { id: BIN, call_name: 'bé Bin', age_years: 3, grade: null }],
          adults: [{ id: 'm1', call_name: 'chị Hoa', self: true }, { id: 'm2', call_name: 'anh Minh', self: false }],
          history: s.history ?? [], conversation_child_id: s.convChild ?? null };
      }
      if (fn === 'pal_record_turn') {
        const msg = palRecordMessage({ conversation: args.p_conversation, child: args.p_child, key: args.p_key, user: args.p_user, assistant: args.p_assistant,
          flags: args.p_flags, counted: args.p_counted, in_tokens: args.p_in_tokens, out_tokens: args.p_out_tokens, model: args.p_model });
        if (await palHmacHex(KEY, msg) !== args.p_sig) throw new ApiError('FORBIDDEN', 'PAL-SIG', 'sai chữ ký');
        recorded.push(args);
        return { ok: true, replay: false, conversation_id: '60000000-0000-4000-8000-000000000001', remaining: (s.remaining ?? 19) - (args.p_counted ? 1 : 0), state: 'OK' };
      }
      throw new Error(`rpc lạ ${fn}`);
    },
  };
  const fakeFetch = (async (url: string, init: any) => {
    fetches.push({ url, headers: init.headers, body: init.body });
    return new Response(JSON.stringify({ model: 'claude-sonnet-5-5', content: [{ type: 'text', text: s.reply ?? 'Mình nghe [phụ huynh]. [con 1] cáu lúc nào trong buổi học ạ?' }],
      usage: s.usage ?? { input_tokens: 812, output_tokens: 64 } }), { status: 200 });
  }) as unknown as typeof fetch;
  const deps: PalDeps = { db, env: (k) => env[k], fetch: fakeFetch };
  return { deps, calls, fetches, recorded };
}
const body = (message: string, extra: Record<string, unknown> = {}) => ({ message, idempotency_key: IDEM, ...extra });

Deno.test('PAL-CHAT: đường đi bình thường - tên con/người lớn/trường KHÔNG có trong body gửi đi; đổi nhãn khi trả; ghi token từ usage', async () => {
  const f = fakeEnv({});
  const r = await run(body('Bé Na nhà mình hay cáu khi làm bài ở trường Tiểu học Nguyễn Du, anh Minh nói em Hoa quá nghiêm.', { child_id: NA }), f.deps);
  assertEquals(f.fetches.length, 1);
  assertEquals(f.fetches[0].url, 'https://api.anthropic.com/v1/messages');
  assertEquals(f.fetches[0].headers['x-api-key'], 'sk-ant-TEST-ONLY-fake');
  const sent = f.fetches[0].body;
  for (const n of ['Na', 'Bin', 'Minh', 'Hoa', 'Nguyễn Du']) assert(!new RegExp(`(?<![\\p{L}])${n}(?![\\p{L}])`, 'u').test(sent), `${n} lộ trong body gửi đi`);
  assert(sent.includes('[con 1]') && sent.includes('[trường 1]'));
  assertEquals(JSON.parse(sent).model, 'claude-sonnet-5-5');
  assertEquals(JSON.parse(sent).max_tokens, 1024);
  assertEquals(r.reply, 'Mình nghe chị Hoa. bé Na cáu lúc nào trong buổi học ạ?');
  assertEquals(r.blocked, false);
  const rec = f.recorded[0];
  assertEquals([rec.p_counted, rec.p_in_tokens, rec.p_out_tokens, rec.p_model], [true, 812, 64, 'claude-sonnet-5-5']);
  assert(rec.p_user.includes('Bé Na'), 'CSDL lưu nguyên văn (riêng tư của người viết)');
  assert(!rec.p_assistant.includes('[con 1]'));
});

Deno.test('PAL-CHAT: PAL_MODEL đổi model; lịch sử cũng được ẩn danh', async () => {
  const f = fakeEnv({ env: { PAL_MODEL: 'model-khac' }, history: [{ role: 'user', content: 'Chị Hoa kể: bé Na cáu' }, { role: 'assistant', content: 'ok' }], convChild: NA });
  await run(body('tiếp đi', { conversation_id: '60000000-0000-4000-8000-000000000001' }), f.deps);
  const sent = JSON.parse(f.fetches[0].body);
  assertEquals(sent.model, 'model-khac');
  assertEquals(sent.messages.length, 3);
  assert(!/Hoa|Na\b/.test(JSON.stringify(sent.messages)));
  assertEquals(f.recorded[0].p_child, NA);
});

Deno.test('PAL-CHAT: lớp an toàn chạy TRƯỚC AI - tình huống khẩn không gọi fetch, ghi lượt không tính, vẫn trả lời khi hết lượt hoặc bị khóa', async () => {
  for (const state of ['OK', 'QUOTA', 'TOKENS', 'BUSY', 'RATE', 'LOCKED']) {
    const f = fakeEnv({ state, env: { ANTHROPIC_API_KEY: undefined } });   // thậm chí không có khóa AI
    const r = await run(body('con tôi bị co giật'), f.deps);
    assertEquals(f.fetches.length, 0, state);
    assertEquals(r.blocked, true);
    assert(['115', '111', '113'].every((n) => r.reply.includes(n)));
    assertEquals([f.recorded[0].p_counted, f.recorded[0].p_in_tokens, f.recorded[0].p_model], [false, null, null]);
    assert(f.recorded[0].p_flags.includes('EMERGENCY_DANGER_LIFE'));
  }
});

Deno.test('PAL-CHAT: hỏi thuốc không gọi AI; hỏi chẩn đoán gọi AI và đặt lời nhắc đầu câu', async () => {
  const f1 = fakeEnv({});
  const r1 = await run(body('liều paracetamol cho con 12kg'), f1.deps);
  assertEquals([f1.fetches.length, r1.blocked, f1.recorded[0].p_counted], [0, true, false]);
  const f2 = fakeEnv({});
  const r2 = await run(body('con tôi có phải bị tự kỷ không'), f2.deps);
  assertEquals(f2.fetches.length, 1);
  assert(r2.reply.startsWith('Lưu ý: mình là bạn đồng hành, không chẩn đoán'));
  assert(JSON.parse(f2.fetches[0].body).system.includes('Không kết luận con có hay không có bệnh'));
});

Deno.test('PAL-CHAT: cờ tắt, hộ chưa đồng ý/đóng băng/không có hộ - lỗi đúng mã, KHÔNG gọi AI', async () => {
  const cases: Array<[string, string]> = [['OFF', 'FEATURE_OFF'], ['NO_CONSENT', 'FORBIDDEN'], ['FROZEN', 'FROZEN'], ['NO_HOUSEHOLD', 'FORBIDDEN']];
  for (const [state, code] of cases) {
    const f = fakeEnv({ state });
    const e = await assertRejects(() => run(body('chào Pal'), f.deps), ApiError) as ApiError;
    assertEquals(e.code, code, state);
    assertEquals(f.fetches.length, 0);
    assertEquals(f.recorded.length, 0);
  }
});

Deno.test('PAL-CHAT: hết lượt/token/bận/quá nhanh -> RATE_LIMITED; bị khóa -> PAL_LOCKED; đều không gọi AI', async () => {
  for (const state of ['QUOTA', 'TOKENS', 'BUSY', 'RATE']) {
    const f = fakeEnv({ state, remaining: 0 });
    const e = await assertRejects(() => run(body('gợi ý trò chơi cuối tuần'), f.deps), ApiError) as ApiError;
    assertEquals([e.code, e.rule], ['RATE_LIMITED', `PAL-${state}`]);
    assertEquals(f.fetches.length, 0);
  }
  const f = fakeEnv({ state: 'LOCKED' });
  const e = await assertRejects(() => run(body('gợi ý trò chơi cuối tuần'), f.deps), ApiError) as ApiError;
  assertEquals([e.code, e.status, e.messageVi], ['PAL_LOCKED', 423, 'Pal đang tạm dừng.']);
  assertEquals(f.fetches.length, 0);
});

Deno.test('PAL-TOK: ngân sách ước lượng kiểm TRƯỚC khi gọi (hộ và hệ thống)', async () => {
  const q = 'gợi ý trò chơi';
  const f1 = fakeEnv({ tokensToday: 59500 });
  const e1 = await assertRejects(() => run(body(q), f1.deps), ApiError) as ApiError;
  assertEquals(e1.rule, 'PAL-TOKENS');
  const f2 = fakeEnv({ sysToday: 1_999_500 });
  const e2 = await assertRejects(() => run(body(q), f2.deps), ApiError) as ApiError;
  assertEquals(e2.rule, 'PAL-BUSY');
  assertEquals([f1.fetches.length, f2.fetches.length], [0, 0]);
  assertEquals(estimateTokens(250), 100);
});

Deno.test('PAL-CHAT: thiếu khóa cấu hình -> FEATURE_OFF, không lộ chi tiết; câu hỏi quá dài và rỗng -> VALIDATION', async () => {
  for (const env of [{ ANTHROPIC_API_KEY: undefined }, { PAL_RECORD_KEY: undefined }]) {
    const f = fakeEnv({ env });
    const e = await assertRejects(() => run(body('gợi ý trò chơi'), f.deps), ApiError) as ApiError;
    assertEquals([e.code, e.rule, e.messageVi], ['FEATURE_OFF', 'PAL-CONFIG', 'Pal chưa sẵn sàng.']);
    assert(!JSON.stringify(e).includes('ANTHROPIC') && !JSON.stringify(e).includes('PAL_RECORD'));
  }
  const f = fakeEnv({ maxQ: 20 });
  assertEquals(((await assertRejects(() => run(body('x'.repeat(21)), f.deps), ApiError)) as ApiError).rule, 'PAL-LEN');
  assertEquals(((await assertRejects(() => run(body('   '), f.deps), ApiError)) as ApiError).code, 'VALIDATION');
  assertEquals(((await assertRejects(() => run({ message: 'a' }, f.deps), ApiError)) as ApiError).code, 'VALIDATION');
});

Deno.test('PAL-CHAT: đầu ra nêu liều bị thay; gửi lặp cùng khóa trả câu đã lưu không gọi AI; lỗi API không lộ thân lỗi', async () => {
  const f = fakeEnv({ reply: 'Cho con uống 250 mg nhé' });
  const r = await run(body('gợi ý cho con ngủ ngon'), f.deps);
  assert(r.reply.startsWith('Mình không nêu liều thuốc') && r.flags.includes('OUTPUT_DOSE'));
  const g = fakeEnv({ replay: { conversation_id: 'c1', reply: 'đã lưu', flags: [] } });
  const rr = await run(body('gợi ý'), g.deps);
  assertEquals([rr.reply, rr.replay, g.fetches.length], ['đã lưu', true, 0]);
  const h = fakeEnv({});
  h.deps.fetch = (async () => new Response('{"error":"secret detail sk-ant-xyz"}', { status: 500 })) as unknown as typeof fetch;
  const e = await assertRejects(() => run(body('gợi ý'), h.deps), ApiError) as ApiError;
  assertEquals(e.code, 'INTERNAL');
  assert(!JSON.stringify(e).includes('secret'));
  const t = fakeEnv({});
  t.deps.fetch = (async () => new Response('{}', { status: 429 })) as unknown as typeof fetch;
  assertEquals(((await assertRejects(() => run(body('gợi ý'), t.deps), ApiError)) as ApiError).code, 'RATE_LIMITED');
});

Deno.test('PAL-PROMPT: system prompt không chứa tên, có các luật cốt lõi và nhãn tài liệu nháp', () => {
  const p = buildSystemPrompt({ title: 'chị', firstTurn: true, flags: ['CORPORAL_PUNISHMENT', 'PARENT_DISTRESS'], focus: null,
    children: [{ label: '[con 1]', age_years: 7, grade: 2 }, { label: '[con 2]', age_years: 3, grade: null }] });
  for (const s of ['xưng "mình"', 'NGHE TRƯỚC, KHUYÊN SAU', 'KHÔNG hùa theo', '115', '111', '113', 'HỎI LẠI đang nói về con nào', 'chưa duyệt', 'không phải tư vấn tâm lý'.replace('không phải', 'KHÔNG phải'), 'KHÔNG gợi ý dịch vụ']) {
    assert(p.includes(s), `thiếu: ${s}`);
  }
  assert(p.includes('7 tuổi, lớp 2') && p.includes('3 tuổi'));
});
