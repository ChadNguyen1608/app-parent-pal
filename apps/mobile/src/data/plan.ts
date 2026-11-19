// Gói dịch vụ (D-68): câu chữ hiển thị và quy tắc "được làm gì". Hàm thuần, test được bằng node.
// CÂU CHỮ TẠM, chờ chủ sản phẩm duyệt (liệt kê trong báo cáo). Chưa có thanh toán thật: đổi gói do chủ sản phẩm đặt ở máy chủ.
import type { PlanInfo, PlanTier } from './types.ts';

/** Mã quy tắc máy chủ gắn vào lỗi PLAN_REQUIRED (backend/supabase/migrations/…d68_goi_dich_vu.sql). */
export const PLAN_RULES = {
  free: 'D-68.free',
  trialPlan: 'D-68.trial_plan',
  trialEdit: 'D-68.trial_edit',
  premium: 'D-68.premium',
} as const;

export const TIER_LABEL: Record<PlanTier, string> = { FREE: 'Miễn phí', TRIAL: 'Dùng thử', PREMIUM: 'Premium' };

/** Gói hiệu lực: TRIAL quá hạn đã được máy chủ trả thành FREE (expired = true). */
export function tierLabel(plan: PlanInfo): string {
  return plan.expired ? 'Dùng thử (đã hết hạn)' : TIER_LABEL[plan.tier];
}

/** Ghép máy và đồng bộ sang máy con chỉ có ở PREMIUM. */
export function canPair(plan: PlanInfo | null | undefined): boolean {
  return plan?.tier === 'PREMIUM';
}

/** Các dòng mô tả gói trong tab Gia đình. */
export function planLines(plan: PlanInfo): string[] {
  if (plan.tier === 'PREMIUM') return ['Tạo và chỉnh sửa kế hoạch không giới hạn.', 'Ghép máy của con và đồng bộ lịch sang máy của con.'];
  if (plan.tier === 'TRIAL') {
    const used = `Đã tạo ${plan.plansUsed}/${plan.plansMax ?? 0} kế hoạch.`;
    const left = plan.editsLeft === null ? '' : ` Còn ${plan.editsLeft} lần chỉnh sửa.`;
    return [used + left, 'Chưa ghép được máy của con (cần Premium).'];
  }
  return [plan.expired ? 'Gói dùng thử đã hết hạn.' : 'Chưa tạo được kế hoạch.', 'Cần gói dùng thử hoặc Premium để tạo kế hoạch và ghép máy của con.'];
}

export type PlanCopy = { title: string; body: string };

/** Màn "Cần gói": tiêu đề và lời giải thích theo quy tắc máy chủ báo. */
export function planRequiredCopy(rule: string | null | undefined): PlanCopy {
  switch (rule) {
    case PLAN_RULES.premium:
      return { title: 'Ghép máy cần gói Premium', body: 'Ghép máy của con và đồng bộ lịch sang máy của con chỉ có ở gói Premium. Gói hiện tại của gia đình chưa có tính năng này.' };
    case PLAN_RULES.trialPlan:
      return { title: 'Gói dùng thử đã tạo đủ kế hoạch', body: 'Gói dùng thử chỉ tạo được 1 kế hoạch cho cả gia đình. Muốn tạo thêm, gia đình cần gói Premium.' };
    case PLAN_RULES.trialEdit:
      return { title: 'Đã dùng hết lượt chỉnh sửa', body: 'Gói dùng thử chỉnh sửa kế hoạch được 3 lần. Muốn chỉnh sửa tiếp, gia đình cần gói Premium.' };
    default:
      return { title: 'Cần gói dùng thử hoặc Premium', body: 'Để tạo kế hoạch cho con, gia đình cần gói dùng thử hoặc Premium. Gói hiện tại chưa tạo được kế hoạch.' };
  }
}

/** Dòng chung cuối màn "Cần gói" (chưa có thanh toán trong app). */
export const PLAN_CONTACT_NOTE = 'Hiện app chưa có thanh toán. Bạn báo người phụ trách Parent-Pal để đổi gói cho gia đình nhé.';
