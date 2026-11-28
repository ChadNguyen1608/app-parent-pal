// Gói dịch vụ (D-68): câu chữ hiển thị và quy tắc "được làm gì". Hàm thuần, test được bằng node.
// CÂU CHỮ TẠM, chờ chủ sản phẩm duyệt (liệt kê trong báo cáo). Chưa có thanh toán thật: đổi gói do chủ sản phẩm đặt ở máy chủ.
import type { PlanInfo, PlanTier } from './types.ts';

/** Mã quy tắc máy chủ gắn vào lỗi PLAN_REQUIRED (backend/supabase/migrations: …d68_goi_dich_vu.sql, …d72_goi_chi_tiet.sql). */
export const PLAN_RULES = {
  free: 'D-68.free',
  trialEdit: 'D-68.trial_edit',
  premium: 'D-68.premium',
  /** D-74: hết khóa ghép máy (lỗi DEVICE_KEY_LIMIT). */
  keys: 'D-74.keys',
} as const;

export const TIER_LABEL: Record<PlanTier, string> = { FREE: 'Miễn phí', TRIAL: 'Dùng thử', PREMIUM: 'Premium' };

/** Gói hiệu lực: TRIAL quá hạn đã được máy chủ trả thành FREE (expired = true). */
export function tierLabel(plan: PlanInfo): string {
  return plan.expired ? 'Dùng thử (đã hết hạn)' : TIER_LABEL[plan.tier];
}

/**
 * Ghép máy con theo KHÓA ở máy bố mẹ (D-74): 1 khóa = ghép 1 máy con. FREE 0 khóa, dùng thử 1, Premium theo số chủ sản phẩm đặt.
 * Trả mã quy tắc để giải thích khi bị khóa, hoặc null khi ghép được. pending: con này đang có yêu cầu chờ (không tính, vì ghép lại sẽ thay yêu cầu cũ).
 */
export function pairLockRule(plan: PlanInfo | null | undefined, pending = false): string | null {
  if (!plan) return PLAN_RULES.premium;
  if (plan.tier === 'FREE') return PLAN_RULES.premium;
  return plan.deviceKeysUsed - (pending ? 1 : 0) >= plan.deviceKeys ? PLAN_RULES.keys : null;
}

export function canPair(plan: PlanInfo | null | undefined, pending = false): boolean {
  return pairLockRule(plan, pending) === null;
}

/** Dòng "Khóa ghép máy: đã dùng X/Y" trong tab Gia đình (D-74). */
export function deviceKeysLine(plan: PlanInfo): string {
  return `Khóa ghép máy: đã dùng ${plan.deviceKeysUsed}/${plan.deviceKeys}`;
}

/** Các dòng mô tả gói trong tab Gia đình. Số kế hoạch và lượt sửa là MỖI CON (D-72). */
export function planLines(plan: PlanInfo): string[] {
  if (plan.tier === 'PREMIUM') return ['Tạo và chỉnh sửa kế hoạch không giới hạn.', 'Ghép máy của con và đồng bộ lịch sang máy của con theo số khóa ghép máy.'];
  if (plan.tier === 'TRIAL') {
    return [
      `Mỗi con tạo được ${plan.plansMax ?? 1} kế hoạch và chỉnh sửa ${plan.editsMax ?? 0} lần.`,
      'Ghép được máy của con theo số khóa ghép máy của gói dùng thử.',
    ];
  }
  return [
    plan.expired ? 'Gói dùng thử đã hết hạn.' : 'Nhập thông tin con và hỏi Pal được; chưa xem trước và tạo lịch được.',
    'Cần gói dùng thử hoặc Premium để tạo lịch và ghép máy của con.',
  ];
}

/** Dòng mức dùng của một con (chỉ gói TRIAL). */
export function childPlanLine(plan: PlanInfo | null | undefined, childId: string): string | null {
  if (!plan || plan.tier !== 'TRIAL') return null;
  const u = plan.children.find((c) => c.childId === childId);
  if (!u) return null;
  if (u.plansUsed === 0) return 'Chưa tạo kế hoạch (tạo được 1 kế hoạch).';
  return `Đã tạo kế hoạch. Còn ${u.editsLeft ?? 0} lần chỉnh sửa.`;
}

export type PlanCopy = { title: string; body: string };

/** Màn "Cần gói": tiêu đề và lời giải thích theo quy tắc máy chủ báo. trialDays: số ngày dùng thử nếu hộ còn dùng thử được. */
export function planRequiredCopy(rule: string | null | undefined, trialDays?: number | null): PlanCopy {
  switch (rule) {
    case PLAN_RULES.premium:
      return {
        title: 'Ghép máy cần gói dùng thử hoặc Premium',
        body: `Ghép máy của con và đồng bộ lịch sang máy của con cần gói dùng thử hoặc Premium. Gói hiện tại của gia đình chưa có khóa ghép máy nào.${trialDays && trialDays > 0 ? ` Bạn có thể dùng thử ${trialDays} ngày, ghép được 1 máy của con.` : ''}`,
      };
    case PLAN_RULES.keys:
      return { title: 'Đã dùng hết khóa ghép máy', body: 'Mỗi khóa ghép được một máy của con. Gói hiện tại đã dùng hết khóa. Muốn ghép thêm, bạn hủy liên kết một máy đang ghép, hoặc nâng cấp gói để có thêm khóa.' };
    case PLAN_RULES.trialEdit:
      return { title: 'Đã dùng hết lượt chỉnh sửa', body: 'Gói dùng thử cho chỉnh sửa kế hoạch của mỗi con 3 lần. Muốn chỉnh sửa tiếp, gia đình cần gói Premium.' };
    default: {
      const days = trialDays && trialDays > 0 ? ` Bạn có thể dùng thử ${trialDays} ngày: mỗi con tạo 1 kế hoạch và chỉnh sửa 3 lần.` : '';
      return {
        title: 'Cần gói dùng thử hoặc Premium',
        body: `Gói miễn phí cho bạn nhập thông tin con và hỏi Pal, nhưng chưa xem trước và tạo lịch được.${days}`,
      };
    }
  }
}

/** Dòng chung cuối màn "Cần gói" (chưa có thanh toán trong app). */
export const PLAN_CONTACT_NOTE = 'Hiện app chưa có thanh toán. Bạn báo người phụ trách Parent-Pal để đổi gói cho gia đình nhé.';

/** Máy con khi gói không còn hoạt động (hết dùng thử, hạ gói, hoặc máy vượt số khóa ghép máy; CA-18 với câu khác, D-72, D-74). */
export const CHILD_PAUSED_TITLE = 'Tạm dừng';
export const CHILD_PAUSED_BODY = 'Tạm dừng, chờ bố mẹ cập nhật.';
