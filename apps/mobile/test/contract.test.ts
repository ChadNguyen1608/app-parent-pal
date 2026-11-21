// Chống lệch hợp đồng RPC: đọc migration SQL của backend và kiểm mọi lời gọi trong src/data/api.ts
// (tên hàm, tên tham số, tham số bắt buộc, quyền EXECUTE cho authenticated, tên trường kết quả, chuỗi nhận diện lỗi).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createSupabaseApi } from '../src/data/api.ts';
import { PIN_EXISTS_HINT, PIN_REQUIRED_HINT, PIN_REQUIRED_RULE } from '../src/data/validate.ts';

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = join(here, '../../../backend/supabase/migrations');
const API_TS = join(here, '../src/data/api.ts');
const PAL_HANDLER = join(here, '../../../backend/supabase/functions/pal-chat/handler.ts');
const EDGE_API = join(here, '../../../backend/supabase/functions/_shared/api.ts');

type Param = { name: string; hasDefault: boolean };
type Fn = { params: Param[]; body: string };

/** Gộp mọi migration theo thứ tự tên; `create or replace` sau ghi đè bản trước. */
function loadSql(): string {
  const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort();
  assert.ok(files.length > 0, `không thấy migration ở ${MIGRATIONS}`);
  return files.map((f) => readFileSync(join(MIGRATIONS, f), 'utf8')).join('\n');
}

/** Bỏ chú thích -- để chuỗi trong chú thích không đánh lừa test. */
function stripComments(sql: string): string {
  return sql.replace(/--[^\n]*/g, '');
}

function parseFunctions(sql: string): Map<string, Fn> {
  const out = new Map<string, Fn>();
  const re = /create\s+(?:or\s+replace\s+)?function\s+app\.(\w+)\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const name = m[1];
    // cắt danh sách tham số theo ngoặc cân bằng
    let depth = 1;
    let i = re.lastIndex;
    while (i < sql.length && depth > 0) {
      if (sql[i] === '(') depth++;
      else if (sql[i] === ')') depth--;
      i++;
    }
    const list = sql.slice(re.lastIndex, i - 1);
    const params: Param[] = [];
    let cur = '';
    let d = 0;
    for (const ch of list + ',') {
      if (ch === '(') d++;
      if (ch === ')') d--;
      if (ch === ',' && d === 0) {
        const t = cur.trim();
        if (t) params.push({ name: t.split(/\s+/)[0], hasDefault: /\bdefault\b/i.test(t) });
        cur = '';
      } else cur += ch;
    }
    // thân hàm: tới `$$;` kế tiếp
    const start = sql.indexOf('$$', i);
    const end = start >= 0 ? sql.indexOf('$$', start + 2) : -1;
    out.set(name, { params, body: start >= 0 && end > start ? sql.slice(start, end) : '' });
  }
  return out;
}

/** Tên hàm app.* được `grant execute ... to authenticated` (và không bị thu hồi sau đó). */
function grantedToAuthenticated(sql: string): Set<string> {
  const granted = new Set<string>();
  const re = /(grant|revoke)\s+(?:execute|all)\s+on\s+(?:all\s+)?function(?:s)?\s+([\s\S]*?)\s+(?:to|from)\s+([\w,\s]+?);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const toAuth = /\bauthenticated\b/.test(m[3]);
    if (!toAuth) continue;
    for (const f of m[2].matchAll(/\bapp\.(\w+)\s*\(/g)) {
      if (m[1].toLowerCase() === 'grant') granted.add(f[1]);
      else granted.delete(f[1]);
    }
  }
  return granted;
}

const sql = stripComments(loadSql());
const fns = parseFunctions(sql);
const granted = grantedToAuthenticated(sql);

let paInvokes: { name: string; body: Record<string, unknown> }[] = [];
type Call = { fn: string; args: Record<string, unknown> | undefined };

/** Chạy mọi hàm RPC của Api với client giả, trả danh sách lời gọi (cả có và không có tham số tùy chọn). */
async function driveApi(): Promise<Call[]> {
  const calls: Call[] = [];
  const canned: Record<string, unknown> = {
    family_create: { household_id: 'h', member_id: 'm', role: 'PRIMARY', call_name: 'x', replay: false },
    touch_active: { touched: true, last_active_at: 'x' },
    child_create: { child_id: 'c' },
    pair_code_create: { code: '123456', expires_at: 'x', ttl_minutes: 10 },
    pair_confirm: { ok: true, binding_id: 'b', state: 'CHO_XAC_NHAN_MAY_CON', epoch: 1, pin_set: true },
    pin_set: { ok: true, created: true },
    pair_pending: { pending: true, binding_id: 'b', adult_call_name: 'x', expires_at: 'x' },
    pair_accept: { ok: true, replay: false, binding_id: 'b', child_id: 'c', epoch: 2 },
    pair_decline: { ok: true, declined: true },
    unlink_device: { ok: true, unlinked: true, replay: false, epoch: 3 },
    pal_quota: { state: 'OK', tier: 'TRIAL', limit: 20, used: 1, remaining: 19 },
  };
  const invokes: { name: string; body: Record<string, unknown> }[] = [];
  paInvokes = invokes;
  const client = {
    functions: {
      async invoke(name: string, opts: { body: Record<string, unknown> }) {
        invokes.push({ name, body: opts.body });
        return { data: { conversation_id: 'v', reply: 'ok', blocked: false, flags: [], remaining: 18, state: 'OK' }, error: null };
      },
    },
    schema: () => ({
      async rpc(fn: string, args?: Record<string, unknown>) {
        calls.push({ fn, args });
        return { data: canned[fn] ?? null, error: null };
      },
      from: () => {
        // Chuỗi truy vấn PostgREST giả: mọi bước trả lại chính nó; await ra { data: [], error: null }.
        const chain: Record<string, unknown> = {};
        for (const k of ['select', 'eq', 'is', 'in', 'order', 'limit']) chain[k] = () => chain;
        chain.maybeSingle = async () => ({ data: null, error: null });
        chain.then = (ok: (v: unknown) => unknown) => ok({ data: [], error: null });
        return chain;
      },
    }),
    auth: { getSession: async () => ({ data: { session: { user: { id: 'u', is_anonymous: false } } }, error: null }) },
  };
  let t = 0;
  const api = createSupabaseApi(client as never, () => (t += 2 * 60 * 60_000));
  await api.familyCreate('x');
  await api.touchActive();
  await api.childCreate({ householdId: 'h', callName: 'x', grade: 1, hasDevice: true, idempotencyKey: 'k' });
  await api.pairCodeCreate();
  await api.pairConfirm('c', '123456', '246801');
  await api.pairConfirm('c', '123456');
  await api.pinSet('246801');
  await api.pairPending();
  await api.pairAccept();
  await api.pairDecline();
  await api.unlinkDevice('c', '246801', 2);
  await api.unlinkDevice('c', '246801');
  await api.palQuota();
  await api.palSend({ message: 'xin chào', conversationId: 'v', childId: 'c', idempotencyKey: 'k' });
  await api.palSend({ message: 'xin chào', idempotencyKey: 'k' });
  await api.palHistory();
  return calls;
}

test('migration có đủ hàm RPC và phân tích được', () => {
  for (const f of ['family_create', 'touch_active', 'child_create', 'pair_code_create', 'pair_confirm', 'pair_pending', 'pair_accept', 'pair_decline', 'pin_set', 'unlink_device', 'pal_quota']) {
    assert.ok(fns.has(f), `migration thiếu app.${f}`);
  }
  assert.deepEqual(fns.get('pair_confirm')!.params, [
    { name: 'p_child', hasDefault: false },
    { name: 'p_code', hasDefault: false },
    { name: 'p_pin', hasDefault: true },
  ]);
  assert.deepEqual(fns.get('unlink_device')!.params.map((p) => p.name), ['p_child', 'p_pin', 'p_binding_epoch']);
});

test('mỗi lời gọi RPC của api.ts: hàm tồn tại, tham số có thật, đủ tham số bắt buộc, được cấp EXECUTE cho authenticated', async () => {
  const calls = await driveApi();
  assert.ok(calls.length >= 10);
  for (const c of calls) {
    const f = fns.get(c.fn);
    assert.ok(f, `api.ts gọi app.${c.fn} nhưng migration không có`);
    assert.ok(granted.has(c.fn), `app.${c.fn} chưa được grant execute cho authenticated`);
    const names = new Set(f.params.map((p) => p.name));
    const given = Object.keys(c.args ?? {});
    for (const k of given) assert.ok(names.has(k), `app.${c.fn} không có tham số ${k}`);
    for (const p of f.params) {
      if (!p.hasDefault) assert.ok(given.includes(p.name), `app.${c.fn} thiếu tham số bắt buộc ${p.name}`);
    }
  }
});

test('mọi hàm được gọi bằng chuỗi rpc(...) trong api.ts đều đã được test điều khiển (không sót lời gọi mới)', async () => {
  const src = readFileSync(API_TS, 'utf8');
  const literal = new Set([...src.matchAll(/\brpc(?:Ok)?\(\s*'(\w+)'/g)].map((m) => m[1]));
  const driven = new Set((await driveApi()).map((c) => c.fn));
  assert.deepEqual([...literal].sort(), [...driven].sort(), 'thêm lời gọi RPC mới thì thêm vào driveApi() trong test này');
});

test('trường kết quả mà client đọc có trong jsonb_build_object của hàm', () => {
  const reads: Record<string, string[]> = {
    family_create: ['household_id', 'replay'],
    touch_active: ['touched'],
    child_create: ['child_id'],
    pair_code_create: ['code', 'expires_at'],
    pair_confirm: ['ok', 'state', 'epoch', 'pin_set'],
    pin_set: ['ok'],
    pair_pending: ['pending', 'adult_call_name', 'expires_at'],
    pair_accept: ['ok', 'child_id', 'epoch'],
    pair_decline: ['ok'],
    unlink_device: ['ok'],
    pal_quota: ['state', 'tier', 'limit', 'used', 'remaining'],
  };
  for (const [fn, fields] of Object.entries(reads)) {
    let body = fns.get(fn)!.body;
    if (fn === 'child_create') body += fns.get('child_json')?.body ?? '';
    if (fn === 'pair_confirm') body += sql.match(/function private\.pair_fail[\s\S]*?\$\$;/)?.[0] ?? '';
    for (const f of fields) assert.match(body, new RegExp(`'${f}'`), `app.${fn} không trả trường '${f}'`);
  }
  // Trạng thái binding mà client phân biệt
  const confirm = fns.get('pair_confirm')!.body;
  assert.match(confirm, /CHO_XAC_NHAN_MAY_CON/);
  assert.match(confirm, /CHO_XAC_MINH/);
  // device_bindings có cột epoch, child_id mà getMyBinding/getHome chọn
  assert.match(sql, /create table app\.device_bindings[\s\S]*?\bepoch\b[\s\S]*?\);/i);
});

test('đường thất bại ok=false: đúng mã, quy tắc, trường attempts_left / locked_until trong SQL', () => {
  const unlink = fns.get('unlink_device')!.body;
  assert.match(unlink, /'ok',\s*false/);
  assert.match(unlink, /'FR01-T02'/);
  assert.match(unlink, /'attempts_left'/);
  assert.match(unlink, /'locked_until'/);
  assert.match(unlink, /'message_vi'/);
  const failFn = sql.match(/function private\.pair_fail[\s\S]*?\$\$;/)?.[0] ?? '';
  assert.match(failFn, /'ok',\s*false/);
  assert.match(failFn, /'NOT_FOUND'/);
  assert.match(fns.get('pair_accept')!.body, /'ok',\s*false[\s\S]*?'NOT_FOUND'[\s\S]*?'AD-11'/);
  // máy chủ có mã RATE_LIMITED -> PT429 và CONFLICT_REV -> PT409
  assert.match(sql, /when 'RATE_LIMITED'\s+then 'PT429'/);
  assert.match(sql, /when 'CONFLICT_REV'\s+then 'PT409'/);
});

test('chuỗi nhận diện "cần đặt PIN lần ghép đầu" khớp pair_confirm', () => {
  const body = fns.get('pair_confirm')!.body;
  const re = new RegExp(`app\\.fail\\('VALIDATION',\\s*'${PIN_REQUIRED_RULE}',\\s*'${PIN_REQUIRED_HINT}`);
  assert.match(body, re, 'pair_confirm đổi cách báo thiếu PIN: sửa PIN_REQUIRED_* trong validate.ts và ghep-may.tsx');
  assert.match(body, new RegExp(`app\\.fail\\('VALIDATION',\\s*'${PIN_REQUIRED_RULE}',\\s*'${PIN_EXISTS_HINT}`));
});

test('unlink_device: máy con phải gửi epoch, epoch sai là CONFLICT_REV', () => {
  const body = fns.get('unlink_device')!.body;
  assert.match(body, /v_is_dev and p_binding_epoch is null/);
  assert.match(body, /app\.fail\('CONFLICT_REV'/);
});

test('Pal: client gọi Edge Function pal-chat với đúng trường mà handler đọc, và đọc đúng trường handler trả', async () => {
  await driveApi();
  assert.ok(paInvokes.length >= 2);
  const handler = readFileSync(PAL_HANDLER, 'utf8');
  const read = new Set([...handler.matchAll(/\bbody\.(\w+)/g)].map((m) => m[1]));
  for (const inv of paInvokes) {
    assert.equal(inv.name, 'pal-chat');
    for (const k of Object.keys(inv.body)) assert.ok(read.has(k), `client gửi trường '${k}' mà handler pal-chat không đọc`);
  }
  for (const need of ['message', 'idempotency_key', 'conversation_id', 'child_id']) assert.ok(read.has(need), `handler không đọc '${need}'`);
  // Trường trả về mà api.ts đọc: handler (hoặc lõi dùng chung) phải có.
  for (const f of ['conversation_id', 'reply', 'blocked', 'flags', 'remaining', 'state']) {
    assert.match(handler, new RegExp(`\\b${f}\\b`), `handler pal-chat không trả '${f}'`);
  }
});

test('Pal: mã lỗi PAL_LOCKED và các cột pal_messages mà client đọc có thật ở backend', () => {
  assert.match(readFileSync(EDGE_API, 'utf8'), /PAL_LOCKED:\s*423/);
  const src = readFileSync(API_TS, 'utf8');
  const cols = src.match(/from\('pal_messages'\)\s*\.select\('([^']+)'\)/)?.[1] ?? '';
  assert.ok(cols, 'không thấy truy vấn pal_messages trong api.ts');
  const table = sql.match(/create table app\.pal_messages \(([\s\S]*?)\n\);/i)?.[1] ?? '';
  assert.ok(table, 'migration không có app.pal_messages');
  for (const c of cols.split(',').map((x) => x.trim())) assert.match(table, new RegExp(`\\b${c}\\b`), `pal_messages thiếu cột ${c}`);
  assert.match(sql, /create table app\.pal_conversations/i);
  // Bảng Pal không có quyền ghi trực tiếp cho người dùng: client chỉ đọc.
  assert.doesNotMatch(src, /from\('pal_(messages|conversations)'\)\s*\.(insert|update|delete|upsert)/);
});
