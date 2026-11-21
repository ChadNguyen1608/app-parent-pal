// Kiểu dữ liệu và giao diện của lớp gọi máy chủ (T1.7). Tên hàm khớp RPC schema `app`.
// Khớp hợp đồng RPC thật ở backend/supabase/migrations (T1.2, T1.5, T1.6): xem README mục "Hợp đồng RPC".
// Hàm có {"ok": false} (pair_confirm, pair_accept, unlink_device) ném ApiError, nên chỗ gọi chỉ cần try/catch.

import type { AuthLink } from './auth-link.ts';

export type SessionInfo = { userId: string; email: string | null; isAnonymous: boolean };

export type PairState = 'NONE' | 'PENDING' | 'PAIRED';

export type Child = {
  id: string;
  callName: string;
  grade: number | null;
  ageYears: number | null;
  hasDevice: boolean;
  pairState: PairState;
};

/** Hộ của người lớn đang đăng nhập; null nếu chưa tạo hộ. */
export type Home = { householdId: string; memberCallName: string; children: Child[] } | null;

export type ChildInput = {
  householdId: string;
  callName: string;
  grade?: number | null;
  ageYears?: number | null;
  hasDevice: boolean;
  /** Gửi lặp cùng khóa trả kết quả cũ (idempotent). */
  idempotencyKey?: string;
};

/** Gói dịch vụ của hộ (D-68). */
export type PlanTier = 'FREE' | 'TRIAL' | 'PREMIUM';

/** Mức dùng gói của MỘT con (D-72: đếm theo con). editsLeft null = không giới hạn (PREMIUM). */
export type PlanChildUsage = { childId: string; plansUsed: number; editsUsed: number; editsLeft: number | null };

/** Kết quả app.my_plan(). Giá trị null ở plansMax / editsMax nghĩa là không giới hạn (PREMIUM). Số kế hoạch và lượt sửa là MỖI CON (D-72). */
export type PlanInfo = {
  tier: PlanTier;
  /** Gói TRIAL đã quá hạn (máy chủ coi như FREE). */
  expired: boolean;
  plansMax: number | null;
  editsMax: number | null;
  children: PlanChildUsage[];
  /** Số câu hỏi Pal còn lại; null khi chưa có bộ đếm (agent Pal làm sau). */
  palQuestionsLeft: number | null;
  trialEndsAt: string | null;
  /** Hộ chưa từng dùng thử hay PREMIUM, đang FREE: được bấm "Dùng thử" (máy chủ còn kiểm mã máy và email). */
  trialAvailable: boolean;
  trialDays: number;
};

/** Kết quả app.my_family_state() cho máy con. planActive=false: hộ không PREMIUM, máy con tạm dừng chờ bố mẹ cập nhật (D-72). */
export type FamilyState = { frozen: boolean; planActive: boolean };

export type PairCode = { code: string; expiresAt: string | null };

/** CHO_XAC_NHAN_MAY_CON: máy con sẽ hỏi "Kết nối với ...?". CHO_XAC_MINH: máy từng ghép ở hộ khác, chưa có quyền gì (AC-FAM-16). */
export type PairConfirmState = 'CHO_XAC_NHAN_MAY_CON' | 'CHO_XAC_MINH';
export type PairConfirmResult = { state: PairConfirmState; epoch: number; pinSet: boolean };

/** Yêu cầu ghép đang chờ máy con bấm Đồng ý / Không. */
export type PairPending = { pending: false } | { pending: true; adultCallName: string; expiresAt: string | null };

/** Liên kết hiệu lực của máy con. epoch phải gửi lại khi hủy (FR01-T09). */
export type Binding = { childId: string; epoch: number };

export interface Api {
  readonly kind: 'mock' | 'supabase';
  auth: {
    getSession(): Promise<SessionInfo | null>;
    onChange(cb: (s: SessionInfo | null) => void): () => void;
    /** D-49: gửi mã 6 số về email, không mật khẩu. */
    /** redirectTo: URL deep link của app để thư có link (magic link) mở lại đúng app. */
    sendEmailOtp(email: string, redirectTo?: string): Promise<void>;
    /** Hoàn tất đăng nhập từ link trong thư (D-59). */
    completeFromLink(link: AuthLink): Promise<SessionInfo>;
    verifyEmailOtp(email: string, token: string): Promise<SessionInfo>;
    signInAnonymously(): Promise<SessionInfo>;
    signOut(): Promise<void>;
  };
  // Người lớn
  getHome(): Promise<Home>;
  familyCreate(callName: string): Promise<{ householdId: string; replay: boolean }>;
  /** Gọi khi người lớn mở app. Client tự giới hạn tối đa 1 lần/giờ như máy chủ. Trả touched=false nếu không gọi hoặc máy chủ bỏ qua. */
  touchActive(): Promise<{ touched: boolean }>;
  childCreate(input: ChildInput): Promise<{ childId: string }>;
  /** Gói dịch vụ của hộ và số lượt còn lại (D-68). Chỉ người lớn trong hộ. */
  myPlan(): Promise<PlanInfo>;
  /** Bắt đầu dùng thử (D-72). Ném TRIAL_USED nếu máy hoặc email đã dùng thử, hoặc hộ đã dùng thử / có gói. */
  trialStart(): Promise<{ trialEndsAt: string | null }>;
  /** Máy con: hộ có đóng băng không và gói còn hoạt động không (D-72). */
  myFamilyState(): Promise<FamilyState>;
  /** pin: bắt buộc ở lần ghép đầu của QL (đặt PIN cùng lúc), không gửi các lần sau. */
  pairConfirm(childId: string, code: string, pin?: string): Promise<PairConfirmResult>;
  pinSet(pin: string): Promise<void>;
  // Máy con
  pairCodeCreate(): Promise<PairCode>;
  pairPending(): Promise<PairPending>;
  /** Bấm Đồng ý. epoch là binding_epoch phải lưu để hủy sau này. */
  pairAccept(): Promise<Binding>;
  /** Bấm Không. */
  pairDecline(): Promise<void>;
  /** Liên kết hiệu lực của máy này (đọc device_bindings), để nhớ qua lần mở app sau. */
  getMyBinding(): Promise<Binding | null>;
  /** bindingEpoch: máy con bắt buộc gửi; QL có thể bỏ. */
  unlinkDevice(childId: string, pin: string, bindingEpoch?: number): Promise<void>;
}
