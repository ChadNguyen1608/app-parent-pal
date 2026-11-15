// Trợ giúp chạy SQL với vai và JWT giả, qua psql (không cần package npm).
// Mỗi lệnh chạy trong một giao dịch rồi ROLLBACK, nên test không để lại dấu vết.
import { spawnSync } from 'node:child_process';

export const DB_URL = process.env.RLS_DB_URL || '';

/**
 * Chạy `sql` dưới vai `actor` ({role, sub?}) với request.jwt.claims tương ứng.
 * `setup` chạy TRƯỚC khi đổi vai (bằng vai quản trị của kết nối) để dựng dữ liệu thử.
 * Trả {ok, rows, code, err}. rows = các dòng đầu ra, cột cách nhau bằng '|'.
 */
export function run(actor, sql, { setup = '' } = {}) {
  const claims = JSON.stringify(
    actor.sub ? { sub: actor.sub, role: actor.role } : { role: actor.role },
  );
  const script = [
    'begin;',
    setup,
    actor.role === 'admin' ? '' : `set local role ${actor.role};`,
    `select set_config('request.jwt.claims', :'claims', true) as _c \\gset`,
    sql,
    ';',
    'rollback;',
  ].join('\n');
  const r = spawnSync(
    'psql',
    ['-X', '-q', '-A', '-t', '-F', '|', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose',
     '-v', `claims=${claims}`, DB_URL],
    { input: script, encoding: 'utf8' },
  );
  if (r.error) throw r.error;
  const stderr = r.stderr || '';
  if (r.status !== 0) {
    const m = stderr.match(/ERROR:\s+([0-9A-Z]{5}):/);
    return { ok: false, rows: [], code: m ? m[1] : 'UNKNOWN', err: stderr.trim() };
  }
  const rows = (r.stdout || '').split('\n').filter((l) => l.length > 0);
  return { ok: true, rows, code: null, err: '' };
}

/** Chạy SQL quản trị (không đổi vai), trong giao dịch rồi rollback. */
export const admin = (sql, opts) => run({ role: 'admin' }, sql, opts);

/** Giá trị đơn (dòng đầu, cột đầu) hoặc ném lỗi nếu SQL lỗi. */
export function scalar(actor, sql, opts) {
  const r = run(actor, sql, opts);
  if (!r.ok) throw new Error(`SQL lỗi (${r.code}): ${r.err}`);
  return r.rows[0];
}
