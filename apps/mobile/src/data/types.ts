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
  /** MD-LICH (mục lõi) đang bật: chưa có thì chưa được dùng hồ sơ này (PA-02 chặn). */
  coreConsent: boolean;
  /** MD-SUCKHOE (đồng ý riêng, D-66) đang bật cho con này. */
  healthConsent: boolean;
  /** MD-CONBAO (đồng ý riêng, D-67) đang bật cho con này. */
  alertConsent: boolean;
};

export type HouseholdState = 'HOAT_DONG' | 'DONG_BANG' | 'CHO_XOA' | 'DA_XOA';
/** PRIMARY = người quản lý chính (QL); SUPPORTER, OBSERVER = người lớn khác. */
export type MemberRole = 'PRIMARY' | 'SUPPORTER' | 'OBSERVER';

export type DeletionScope = 'HO_SO_CON' | 'GIA_DINH' | 'NGUOI_LON_ROI';
/** Yêu cầu xóa đang mở (chưa bị hủy). Không có hạn xóa hẳn: PR-CON-01 chưa chốt. */
export type OpenDeletion = { id: string; scope: DeletionScope; childId: string | null; acceptedAt: string | null; state: string };

/** Hộ của người lớn đang đăng nhập; null nếu chưa tạo hộ. */
export type Home = {
  householdId: string;
  memberCallName: string;
  role: MemberRole;
  householdState: HouseholdState;
  children: Child[];
  openDeletions: OpenDeletion[];
} | null;

// ---- Đồng ý theo mục đích (T2.1), rút toàn bộ (T2.2), đóng băng và xóa (T2.3)
export type Purpose = { code: string; nameVi: string; kind: 'LOI' | 'TUY_CHON'; collectEnabled: boolean };
/** CHUA_HOI = chưa có dòng trong purpose_state. */
export type PurposeStatus = 'CHUA_HOI' | 'DANG_BAT' | 'DA_RUT';
export type ConsentOverview = { purposes: Purpose[]; states: Record<string, { state: PurposeStatus; activeSince: string | null }> };

export type ChildSettings = { aiChatEnabled: boolean };

export type ConsentEvent = 'DONG_Y' | 'RUT';
export type ConsentRecordInput = {
  childId: string;
  purposeCode: string;
  event: ConsentEvent;
  /** true: đồng ý của chính người lớn đang gọi (không theo con). */
  forSelf?: boolean;
  /** Gửi lặp cùng khóa trả kết quả cũ. */
  idempotencyKey?: string;
};
export type ConsentRecordResult = {
  /** false: đã đúng trạng thái đó từ trước, không ghi sổ. */
  changed: boolean;
  replay: boolean;
  /** Mục đang hiệu lực sau lần ghi (máy chủ tính). */
  effective: boolean;
};

/** Hệ quả của rút toàn bộ do máy chủ tính (bước 1). */
export type WithdrawConsequences = {
  purposesWithdrawn: string[];
  childHidden: boolean;
  deviceUnlinked: boolean;
  deletionRequest: boolean;
  hardDeletedNow: boolean;
  canReconsent: boolean;
};
export type WithdrawStep1 = { confirmToken: string; expiresAt: string | null; consequences: WithdrawConsequences };
export type WithdrawStep2 = { replay: boolean; deletionRequestId: string | null; acceptedAt: string | null; state: string; hardDeleted: boolean };
export type DeletionResult = { replay: boolean; scope: DeletionScope; deletionRequestId: string | null; acceptedAt: string | null; state: string; hardDeleted: boolean };

/** Máy con: ACTIVE hoặc FROZEN (gia đình tạm dừng, CA-18). */
export type FamilyState = 'ACTIVE' | 'FROZEN';

// ---- Ghi chú sức khỏe của con (D-66, nấc 1 chỉ lưu và hiển thị)
export type HealthKind = 'DI_UNG' | 'THUOC' | 'KHAC';
export type HealthNote = {
  id: string;
  childId: string;
  kind: HealthKind;
  content: string;
  /** Tên gọi người khai (từ members); null nếu không đọc được. */
  declaredByName: string | null;
  declaredByRole: MemberRole;
  /** Ngày khai, YYYY-MM-DD (giờ VN). */
  declaredAt: string;
  sourceNote: string | null;
  active: boolean;
};
export type HealthNotePatch = { kind?: HealthKind; content?: string; sourceNote?: string | null; declaredAt?: string; active?: boolean };

// ---- Con báo bố mẹ ngay (D-67): chỉ ba câu có sẵn, không chữ tự do
export type AlertKind = 'KHONG_KHOE' | 'DON_SOM' | 'GOI_BO_ME';
export type ChildAlert = { id: string; childId: string; kind: AlertKind; createdAt: string; seenAt: string | null };

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
  /** D-74: số khóa ghép máy con của gói (FREE 0, dùng thử 1, Premium theo chủ sản phẩm đặt) và số khóa đã dùng (máy đang ghép + yêu cầu đang chờ). */
  deviceKeys: number;
  deviceKeysUsed: number;
};

/** Kết quả app.my_family_state() cho máy con. planActive=false: hộ hết dùng thử hoặc hạ gói, hoặc máy này vượt số khóa ghép máy; máy con tạm dừng chờ bố mẹ cập nhật (D-72, D-74). */
export type MyFamilyState = { frozen: boolean; planActive: boolean };

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
  myFamilyState(): Promise<MyFamilyState>;
  /** pin: bắt buộc ở lần ghép đầu của QL (đặt PIN cùng lúc), không gửi các lần sau. */
  pairConfirm(childId: string, code: string, pin?: string): Promise<PairConfirmResult>;
  pinSet(pin: string): Promise<void>;
  /** PA-02, PA-32: danh mục mục đích và trạng thái của một con. */
  getConsentOverview(childId: string): Promise<ConsentOverview>;
  /** PA-02, PA-32: ghi đồng ý hoặc rút một mục (consent_record). */
  consentRecord(input: ConsentRecordInput): Promise<ConsentRecordResult>;
  /** D-73, Cài đặt dữ liệu: cài đặt của một con (hiện chỉ ai_chat_enabled, mặc định tắt; chuẩn bị cho chặng sau). */
  childSettingGet(childId: string): Promise<ChildSettings>;
  childSettingSet(childId: string, key: 'ai_chat_enabled', value: boolean): Promise<ChildSettings>;
  /** PA-35 lần 1: rút toàn bộ bước 1, máy chủ trả hệ quả và mã xác nhận dùng một lần (consent_withdraw_all). */
  withdrawAllStart(childId: string): Promise<WithdrawStep1>;
  /** PA-36 lần 2: rút toàn bộ bước 2, gửi mã của bước 1. */
  withdrawAllConfirm(childId: string, confirmToken: string): Promise<WithdrawStep2>;
  /** PA-39: QL mở lại hộ đóng băng. confirm phải true (xác nhận rõ ràng). */
  householdReopen(confirm: boolean): Promise<{ changed: boolean }>;
  /** PA-35, PA-36: yêu cầu xóa. Luôn gửi confirm=true (người dùng đã xác nhận lần hai). */
  deletionRequest(scope: DeletionScope, childId?: string | null): Promise<DeletionResult>;
  /** PA-06 (sức khỏe): đọc ghi chú của một con. Chưa có đồng ý hiệu lực hoặc đã rút thì máy chủ trả rỗng. */
  listHealthNotes(childId: string): Promise<HealthNote[]>;
  healthNoteAdd(input: { childId: string; kind: HealthKind; content: string; sourceNote?: string | null; declaredAt?: string }): Promise<HealthNote>;
  /** Sửa nội dung, loại, nguồn hoặc bật/tắt (active). */
  healthNoteUpdate(noteId: string, patch: HealthNotePatch): Promise<HealthNote>;
  healthNoteDelete(noteId: string): Promise<void>;
  /** PA-15: báo của con trong 7 ngày (máy chủ tự ẩn quá hạn), mới nhất trước. Mục đồng ý chưa bật thì rỗng. */
  listChildAlerts(): Promise<ChildAlert[]>;
  /** Đánh dấu một báo là đã xem. */
  childAlertSeen(alertId: string): Promise<void>;
  /** PA-34: yêu cầu xuất dữ liệu. Ở bản thử máy chủ luôn trả BLOCKED_H4 (ApiError). */
  exportRequest(scope: 'GIA_DINH' | 'HO_SO_CON', childId?: string | null): Promise<void>;
  // Máy con
  pairCodeCreate(): Promise<PairCode>;
  pairPending(): Promise<PairPending>;
  /** Bấm Đồng ý. epoch là binding_epoch phải lưu để hủy sau này. */
  pairAccept(): Promise<Binding>;
  /** Bấm Không. */
  pairDecline(): Promise<void>;
  /** Liên kết hiệu lực của máy này (đọc device_bindings), để nhớ qua lần mở app sau. */
  getMyBinding(): Promise<Binding | null>;
  /** CA-16: mã các mục đích đang HIỆU LỰC (bật, được thu, mục cha cũng hiệu lực) mà máy con được xem. */
  getMyConsent(childId: string): Promise<string[]>;
  /** CA-18: gia đình có đang tạm dừng không (my_family_state). */
  getFamilyState(): Promise<FamilyState>;
  /** CA-16: con bấm "Con hiểu rồi" thì ghi đồng ý của con (child_consent_record). Gửi lặp an toàn. */
  childConsentRecord(idempotencyKey?: string): Promise<{ changed: boolean; consentedAt: string | null }>;
  /** CA-21: gửi một trong ba câu có sẵn (child_alert_send). Máy chủ chỉ nhận mã câu; RATE_LIMITED khi bấm quá nhiều. */
  childAlertSend(kind: AlertKind, idempotencyKey?: string, bindingEpoch?: number): Promise<{ id: string; replay: boolean; createdAt: string | null }>;
  /** bindingEpoch: máy con bắt buộc gửi; QL có thể bỏ. */
  unlinkDevice(childId: string, pin: string, bindingEpoch?: number): Promise<void>;
}
