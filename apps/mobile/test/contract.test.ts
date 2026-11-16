// Chống lệch hợp đồng RPC: đọc migration SQL của backend và kiểm mọi lời gọi trong src/data/api.ts
// (tên hàm, tên tham số, tham số bắt buộc, quyền EXECUTE cho authenticated, tên trường kết quả, chuỗi nhận diện lỗi).
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { TABLE_READS, createSupabaseApi } from '../src/data/api.ts';
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
type Read = { table: string; columns: string[] };

/** Cột của mọi `create table app.X (...)` (kèm `alter table ... add column`). */
function parseTables(src: string): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const re = /create\s+table\s+app\.(\w+)\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    let depth = 1;
    let i = re.lastIndex;
    while (i < src.length && depth > 0) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')') depth--;
      i++;
    }
    const cols = new Set<string>();
    let cur = '';
    let d = 0;
    for (const ch of src.slice(re.lastIndex, i - 1) + ',') {
      if (ch === '(') d++;
      if (ch === ')') d--;
      if (ch === ',' && d === 0) {
        const w = cur.trim().split(/\s+/)[0];
        if (w && !/^(primary|unique|check|constraint|foreign)$/i.test(w)) cols.add(w);
        cur = '';
      } else cur += ch;
    }
    out.set(m[1], cols);
  }
  for (const a of src.matchAll(/alter\s+table\s+app\.(\w+)\s+add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)/gi)) out.get(a[1])?.add(a[2]);
  return out;
}
const tables = parseTables(sql);
const reads: Read[] = [];

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
    consent_record: { ok: true, changed: true, replay: false, also_withdrawn: [] },
    consent_withdraw_all: { ok: true, step: 1, confirm_token: 'tok', expires_at: 'x', consequences: {} },
    household_reopen: { ok: true, changed: true },
    deletion_request: { ok: true, replay: false, deletion_request_id: 'd', accepted_at: 'x', state: 'CHO_QUYET_HAN', hard_deleted: false },
    export_request: { ok: true },
  };
  /** Truy vấn giả: mọi bộ lọc trả chính nó; await ra danh sách rỗng; maybeSingle ra null. */
  const query = (table: string, columns: string) => {
    reads.push({ table, columns: columns.split(',').map((c) => c.trim()) });
    const q: Record<string, unknown> = {};
    for (const f of ['eq', 'neq', 'in', 'is', 'order']) q[f] = () => q;
    const row = table === 'members' ? { household_id: 'h', call_name: 'x', role: 'PRIMARY' } : null;
    q.maybeSingle = async () => ({ data: row, error: null });
    q.then = (ok: (v: unknown) => unknown) => ok({ data: [], error: null });
    return q;
  };
  const client = {
    schema: () => ({
      async rpc(fn: string, args?: Record<string, unknown>) {
        calls.push({ fn, args });
        return { data: canned[fn] ?? null, error: null };
      },
      from: (table: string) => ({ select: (columns: string) => query(table, columns) }),
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
  await api.consentRecord({ childId: 'c', purposeCode: 'MD-XONG', event: 'DONG_Y', idempotencyKey: 'k', forSelf: false });
  await api.consentRecord({ childId: 'c', purposeCode: 'MD-XONG', event: 'RUT' });
  await api.withdrawAllStart('c');
  canned.consent_withdraw_all = { ok: true, step: 2, replay: false, deletion_request_id: 'd', accepted_at: 'x', state: 'CHO_QUYET_HAN', hard_deleted: false };
  await api.withdrawAllConfirm('c', 'tok');
  await api.householdReopen(true);
  await api.deletionRequest('HO_SO_CON', 'c');
  await api.deletionRequest('GIA_DINH');
  await api.exportRequest('GIA_DINH');
  await api.getHome();
  await api.getConsentOverview('c');
  await api.getMyConsent('c');
  await api.getMyBinding();
  await api.getFamilyState();
  return calls;
}

test('migration có đủ hàm RPC và phân tích được', () => {
  for (const f of ['family_create', 'touch_active', 'child_create', 'pair_code_create', 'pair_confirm', 'pair_pending', 'pair_accept', 'pair_decline', 'pin_set', 'unlink_device']) {
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
  assert.ok(calls.length >= 20);
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

test('migration có hàm đồng ý, rút toàn bộ, mở lại, xóa, xuất với đúng tham số', () => {
  assert.deepEqual(fns.get('consent_record')!.params.map((p) => p.name), ['p_child', 'p_purpose_code', 'p_event', 'p_policy_version_id', 'p_paper_ref', 'p_idempotency_key', 'p_for_self']);
  assert.deepEqual(fns.get('consent_withdraw_all')!.params, [{ name: 'p_child', hasDefault: false }, { name: 'p_confirm_token', hasDefault: true }]);
  assert.deepEqual(fns.get('household_reopen')!.params.map((p) => p.name), ['p_confirm']);
  assert.deepEqual(fns.get('deletion_request')!.params.map((p) => p.name), ['p_scope', 'p_child', 'p_confirm']);
  assert.deepEqual(fns.get('export_request')!.params.map((p) => p.name), ['p_scope', 'p_child']);
});

test('trường kết quả của hàm đồng ý và xóa có trong SQL', () => {
  const rec = fns.get('consent_record')!.body;
  for (const f of ['ok', 'changed', 'replay', 'also_withdrawn']) assert.match(rec, new RegExp(`'${f}'`), `consent_record thiếu '${f}'`);
  const wd = fns.get('consent_withdraw_all')!.body;
  for (const f of ['step', 'confirm_token', 'expires_at', 'consequences', 'purposes_withdrawn', 'child_hidden', 'device_unlinked', 'deletion_request',
    'hard_deleted_now', 'can_reconsent', 'deletion_request_id', 'accepted_at', 'hard_deleted']) assert.match(wd, new RegExp(`'${f}'`), `consent_withdraw_all thiếu '${f}'`);
  const del = fns.get('deletion_request')!.body;
  for (const f of ['replay', 'deletion_request_id', 'accepted_at', 'state', 'hard_deleted']) assert.match(del, new RegExp(`'${f}'`), `deletion_request thiếu '${f}'`);
  assert.match(fns.get('household_reopen')!.body, /'changed'/);
});

test('mã lỗi mới: BLOCKED_H4 và FEATURE_OFF là mã backend (HTTP 403)', () => {
  assert.match(sql, /when 'BLOCKED_H4'\s+then 'PT403'/);
  assert.match(sql, /when 'FEATURE_OFF'\s+then 'PT403'/);
  assert.match(fns.get('export_request')!.body, /app\.fail\('BLOCKED_H4'/);
  assert.match(fns.get('consent_record')!.body, /app\.fail\('FEATURE_OFF'/);
  assert.match(fns.get('consent_withdraw_all')!.body, /'D-42'/);
});

test('mọi cột client đọc (select) có trong migration', async () => {
  reads.length = 0;
  await driveApi();
  assert.ok(reads.length >= 6);
  const seen = new Set(reads.map((r) => r.table));
  for (const t of ['members', 'households', 'children', 'device_bindings', 'purposes', 'purpose_state', 'deletion_requests']) assert.ok(seen.has(t), `chưa đọc ${t}`);
  for (const r of reads) {
    const cols = tables.get(r.table);
    assert.ok(cols, `migration không có bảng app.${r.table}`);
    for (const c of r.columns) assert.ok(cols.has(c), `app.${r.table} không có cột ${c}`);
  }
  for (const v of Object.values(TABLE_READS)) assert.ok(v.length > 0);
});

test('chuỗi trạng thái client dùng có trong check của migration', () => {
  for (const v of ['HOAT_DONG', 'DONG_BANG', 'CHO_XOA', 'DA_XOA', 'PRIMARY', 'SUPPORTER', 'OBSERVER', 'HO_SO_CON', 'GIA_DINH', 'NGUOI_LON_ROI', 'CHUA_HOI', 'DANG_BAT', 'DA_RUT', 'MD-CONBAO', 'MD-LICH']) {
    assert.ok(sql.includes(`'${v}'`), `migration không có '${v}'`);
  }
});
