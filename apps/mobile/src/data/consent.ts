// Hàm thuần cho đồng ý theo mục đích (T2.1). Phản chiếu app_internal.purpose_effective của máy chủ để màn hình
// biết mục nào đang hiệu lực và rút mục cha kéo theo mục nào. Máy chủ vẫn là nơi quyết định; đây chỉ để hiển thị.
import type { ConsentOverview, Purpose } from './types.ts';

export const PURPOSE_LICH = 'MD-LICH';
export const PURPOSE_CONBAO = 'MD-CONBAO';

/** Mục phụ thuộc (trực tiếp và gián tiếp) của `code`, theo thứ tự danh mục. */
export function dependentsOf(purposes: Purpose[], code: string): string[] {
  const out = new Set<string>();
  const queue = [code];
  while (queue.length) {
    const cur = queue.pop()!;
    for (const p of purposes) {
      if (p.dependsOn.includes(cur) && !out.has(p.code)) {
        out.add(p.code);
        queue.push(p.code);
      }
    }
  }
  return purposes.filter((p) => out.has(p.code)).map((p) => p.code);
}

/** Các mục phụ thuộc của `code` đang DANG_BAT (sẽ bị rút theo khi rút `code`). */
export function activeDependents(o: ConsentOverview, code: string): string[] {
  return dependentsOf(o.purposes, code).filter((c) => o.states[c]?.state === 'DANG_BAT');
}

/** Mục hiệu lực = tự DANG_BAT, được thu (collect_enabled) và mọi mục cha cũng hiệu lực. */
export function effectiveCodes(o: ConsentOverview): string[] {
  const byCode = new Map(o.purposes.map((p) => [p.code, p]));
  const memo = new Map<string, boolean>();
  const eff = (code: string, seen: Set<string>): boolean => {
    if (memo.has(code)) return memo.get(code)!;
    const p = byCode.get(code);
    if (!p || seen.has(code)) return false;
    seen.add(code);
    const ok = o.states[code]?.state === 'DANG_BAT' && p.collectEnabled && p.dependsOn.every((d) => eff(d, seen));
    memo.set(code, ok);
    return ok;
  };
  return o.purposes.filter((p) => eff(p.code, new Set())).map((p) => p.code);
}

/** Thứ tự ghi đồng ý: mục cha trước mục con (sắp theo độ sâu phụ thuộc). */
export function parentsFirst(purposes: Purpose[], codes: string[]): string[] {
  const byCode = new Map(purposes.map((p) => [p.code, p]));
  const depth = (code: string, seen: Set<string> = new Set()): number => {
    const p = byCode.get(code);
    if (!p || seen.has(code)) return 0;
    seen.add(code);
    return p.dependsOn.length === 0 ? 0 : 1 + Math.max(...p.dependsOn.map((d) => depth(d, seen)));
  };
  return [...codes].sort((a, b) => depth(a) - depth(b));
}
