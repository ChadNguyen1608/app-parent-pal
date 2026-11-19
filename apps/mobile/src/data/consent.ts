// Hàm thuần cho đồng ý theo mục đích (D-64). Chỉ còn một mục lõi (MD-LICH) và hai mục đồng ý riêng (MD-SUCKHOE, MD-CONBAO).
// Phản chiếu app_internal.purpose_effective của máy chủ để màn hình biết mục nào đang hiệu lực. Máy chủ vẫn là nơi quyết định.
import type { Api, ConsentOverview } from './types.ts';
import { uuidv4 } from './uuid.ts';

export const PURPOSE_LICH = 'MD-LICH';
export const PURPOSE_SUCKHOE = 'MD-SUCKHOE';
export const PURPOSE_CONBAO = 'MD-CONBAO';
/** Hai mục đồng ý riêng. Từ D-73 được ghi mặc định khi tạo con; phụ huynh tắt sau trong Cài đặt dữ liệu. */
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

/** Ba mục ghi mặc định ngay sau khi tạo con (D-73): lõi trước, rồi hai mục riêng. */
export const DEFAULT_PURPOSES: readonly string[] = [PURPOSE_LICH, PURPOSE_SUCKHOE, PURPOSE_CONBAO];

/**
 * D-73: sau child_create, ghi đồng ý lõi và hai mục riêng cho con (thay màn PA-02 đã bỏ).
 * Ghi tuần tự; mỗi mục một khóa gửi lặp (caller giữ `keys` giữa các lần thử) nên bấm lại sau lỗi là an toàn.
 * consent_record chưa có trường lý do: "mặc định D-73" ghi ở tài liệu, chưa ghi được vào sổ đồng ý.
 */
export async function recordDefaultConsents(api: Api, childId: string, keys: Record<string, string> = {}): Promise<void> {
  for (const code of DEFAULT_PURPOSES) {
    keys[code] ??= uuidv4();
    await api.consentRecord({ childId, purposeCode: code, event: 'DONG_Y', idempotencyKey: keys[code] });
  }
}
