// Hàm thuần cho đồng ý theo mục đích (D-64). Chỉ còn một mục lõi (MD-LICH) và hai mục đồng ý riêng (MD-SUCKHOE, MD-CONBAO).
// Phản chiếu app_internal.purpose_effective của máy chủ để màn hình biết mục nào đang hiệu lực. Máy chủ vẫn là nơi quyết định.
import type { ConsentOverview } from './types.ts';

export const PURPOSE_LICH = 'MD-LICH';
export const PURPOSE_SUCKHOE = 'MD-SUCKHOE';
export const PURPOSE_CONBAO = 'MD-CONBAO';
/** Hai mục đồng ý riêng, không chọn sẵn (D-64). */
export const OPTIONAL_PURPOSES: readonly string[] = [PURPOSE_SUCKHOE, PURPOSE_CONBAO];

/**
 * Mục hiệu lực = tự DANG_BAT, được thu (collect_enabled), và mọi mục LÕI của con đó cũng DANG_BAT
 * (mục riêng không dùng được khi chưa có đồng ý lõi). Không còn cơ chế phụ thuộc giữa các mục.
 */
export function effectiveCodes(o: ConsentOverview): string[] {
  const on = (code: string) => o.states[code]?.state === 'DANG_BAT';
  const coreOn = o.purposes.filter((p) => p.kind === 'LOI').every((p) => on(p.code));
  return o.purposes.filter((p) => on(p.code) && p.collectEnabled && (p.kind === 'LOI' || coreOn)).map((p) => p.code);
}
