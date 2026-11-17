// Trợ giúp kiểm tra tối thiểu dựa trên node:assert (Deno hỗ trợ) để không phụ thuộc jsr (mạng chặn).
import nodeAssert from 'node:assert/strict';

export const assert = (v: unknown, msg?: string): void => nodeAssert.ok(v, msg);
export const assertEquals = (a: unknown, b: unknown, msg?: string): void => nodeAssert.deepStrictEqual(a, b, msg);
export const assertNotEquals = (a: unknown, b: unknown, msg?: string): void => nodeAssert.notDeepStrictEqual(a, b, msg);
export const assertMatch = (s: string, re: RegExp, msg?: string): void => nodeAssert.match(s, re, msg);
/** Chạy fn, bắt buộc ném lỗi thuộc lớp `cls`; trả về lỗi đó. */
export async function assertRejects<E extends Error>(fn: () => Promise<unknown>, cls: new (...a: any[]) => E, msg?: string): Promise<E> {
  try { await fn(); } catch (e) {
    if (!(e instanceof cls)) throw new Error(`${msg ?? ''} ném lỗi sai lớp: ${e}`);
    return e as E;
  }
  throw new Error(`${msg ?? ''} lẽ ra phải ném lỗi`);
}
