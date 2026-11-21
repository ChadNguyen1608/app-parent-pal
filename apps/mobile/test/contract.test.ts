// Chống lệch hợp đồng RPC: đọc migration SQL của backend và kiểm mọi lời gọi trong src/data/api.ts
// (tên hàm, tên tham số, tham số bắt buộc, quyền EXECUTE cho authenticated, tên trường kết quả, chuỗi nhận diện lỗi).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createSupabaseApi } from '../src/data/api.ts';
import { PLAN_RULES } from '../src/data/plan.ts';
import { PIN_EXISTS_HINT, PIN_REQUIRED_HINT, PIN_REQUIRED_RULE } from '../src/data/validate.ts';

const here = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = join(here, '../../../backend/supabase/migrations');
const API_TS = join(here, '../src/data/api.ts');

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
    my_plan: { ok: true, tier: 'TRIAL', expired: false, plans_max: 1, edits_max: 3, children: [{ child_id: 'c', plans_used: 0, edits_used: 0, edits_left: 3 }], pal_questions_left: null, trial_ends_at: null, trial_available: false, trial_days: 7 },
    trial_start: { ok: true, tier: 'TRIAL', trial_ends_at: 'x' },
    my_family_state: { ok: true, state: 'HOAT_DONG', frozen: false, plan_active: true },
  };
  const client = {
    schema: () => ({
      async rpc(fn: string, args?: Record<string, unknown>) {
        calls.push({ fn, args });
        return { data: canned[fn] ?? null, error: null };
      },
      from: () => ({
        select: () => ({
          eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
        }),
      }),
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
  await api.myPlan();
  await api.trialStart();
  await api.myFamilyState();
  return calls;
}

test('migration có đủ hàm RPC và phân tích được', () => {
  for (const f of ['family_create', 'touch_active', 'child_create', 'pair_code_create', 'pair_confirm', 'pair_pending', 'pair_accept', 'pair_decline', 'pin_set', 'unlink_device', 'my_plan', 'trial_start', 'my_family_state']) {
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
  assert.ok(calls.length >= 12);
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
    my_plan: ['ok', 'tier', 'expired', 'plans_max', 'edits_max', 'children', 'child_id', 'plans_used', 'edits_used', 'edits_left', 'pal_questions_left', 'trial_ends_at', 'trial_available', 'trial_days'],
    trial_start: ['ok', 'trial_ends_at'],
    my_family_state: ['ok', 'frozen', 'plan_active'],
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

test('PLAN_REQUIRED (D-68): app.fail trả PT402; my_plan không tham số; pair_confirm/pair_accept/profile_save/commit gọi kiểm gói với đúng mã quy tắc', () => {
  assert.match(sql, /when 'PLAN_REQUIRED'\s+then 'PT402'/);
  assert.deepEqual(fns.get('my_plan')!.params, []);
  assert.match(fns.get('pair_confirm')!.body, /plan_require_premium/);
  assert.match(fns.get('pair_accept')!.body, /plan_require_premium/);
  assert.doesNotMatch(fns.get('profile_save')!.body, /plan_check_schedule/, 'D-72: lưu hồ sơ không xét gói (FREE nhập được)');
  assert.match(fns.get('schedule_commit_apply')!.body, /plan_check_schedule/);
  assert.match(fns.get('schedule_plan_check')!.body, /plan_check_schedule/);
  // Mã quy tắc mà plan.ts nhận diện phải do máy chủ thật sự phát ra (private.plan_*).
  for (const rule of Object.values(PLAN_RULES)) assert.ok(sql.includes(`'${rule}'`), `migration không phát quy tắc ${rule}`);
});

test('D-72: trial_start nhận đúng một băm 64 hex; TRIAL_USED là PT409; máy chủ phát đúng các quy tắc app dựa vào; my_family_state có plan_active', () => {
  assert.deepEqual(fns.get('trial_start')!.params, [{ name: 'p_device_hash', hasDefault: false }]);
  assert.match(fns.get('trial_start')!.body, /\^\[0-9a-f\]\{64\}\$/);
  assert.match(sql, /when 'TRIAL_USED'\s+then 'PT409'/);
  assert.match(fns.get('trial_start')!.body, /'TRIAL_USED',\s*'D-72\.claim'/);
  assert.match(fns.get('trial_start')!.body, /'TRIAL_USED',\s*'D-72\.household'/);
  assert.deepEqual(fns.get('schedule_plan_check')!.params, [{ name: 'p_profile', hasDefault: false }]);
  assert.match(fns.get('my_family_state')!.body, /'plan_active'/);
  assert.ok(granted.has('trial_start') && granted.has('schedule_plan_check') && granted.has('my_family_state'));
});
